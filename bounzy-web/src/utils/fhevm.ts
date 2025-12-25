import { ethers } from "ethers";

interface FHEVMInstance {
    createEncryptedInput: (
        contractAddress: string,
        userAddress: string
    ) => RelayerEncryptedInput;
    generateKeypair: () => { publicKey: string; privateKey: string };
    getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
    publicDecrypt: (handles: (string | Uint8Array)[]) => Promise<PublicDecryptResults>;
}

interface RelayerEncryptedInput {
    addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
    add8: (value: number | bigint) => RelayerEncryptedInput;
    add16: (value: number | bigint) => RelayerEncryptedInput;
    add32: (value: number | bigint) => RelayerEncryptedInput;
    add64: (value: number | bigint) => RelayerEncryptedInput;
    add128: (value: number | bigint) => RelayerEncryptedInput;
    add256: (value: number | bigint) => RelayerEncryptedInput;
    addAddress: (value: string) => RelayerEncryptedInput;
    encrypt: () => Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }>;
}

interface PublicDecryptResults {
    clearValues: Record<string, bigint>;
    abiEncodedClearValues: `0x${string}`;
    decryptionProof: `0x${string}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fhevmInstance: any = null;
let isInitializing = false;

// Import logger dynamically to avoid circular deps
const getLogger = () => import('./logger').then(m => m.logger.fhevm);

export async function initFhevm(): Promise<FHEVMInstance> {
    const log = await getLogger();

    if (fhevmInstance) {
        log.debug('FHEVM already initialized');
        return fhevmInstance;
    }

    if (isInitializing) {
        log.debug('FHEVM initialization in progress, waiting...');
        await new Promise((resolve) => setTimeout(resolve, 100));
        return initFhevm();
    }

    try {
        isInitializing = true;
        log.info('Initializing FHEVM SDK...');

        const { createInstance, SepoliaConfig, initSDK } = await import(
            "@zama-fhe/relayer-sdk/web"
        );

        await initSDK();
        log.debug('SDK initialized, creating instance...');

        fhevmInstance = await createInstance(SepoliaConfig);
        log.success('FHEVM initialized successfully');

        isInitializing = false;
        return fhevmInstance;
    } catch (error) {
        isInitializing = false;
        log.error('Failed to initialize FHEVM', error);
        throw error;
    }
}

// Convert Uint8Array to bytes32 hex string
function toBytes32(arr: Uint8Array): `0x${string}` {
    const hex = Array.from(arr.slice(0, 32))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return `0x${hex.padEnd(64, "0")}` as `0x${string}`;
}

// Convert Uint8Array to hex string (for inputProof)
function toHexString(arr: Uint8Array): `0x${string}` {
    const hex = Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return `0x${hex}` as `0x${string}`;
}

// Encrypt severity (euint8)
export async function encryptSeverity(
    contractAddress: string,
    userAddress: string,
    severity: number
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> {
    const instance = await initFhevm();
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add8(severity);
    const encrypted = await input.encrypt();

    return {
        handle: toBytes32(encrypted.handles[0]),
        proof: toHexString(encrypted.inputProof),
    };
}

// Encrypt evidence hash (euint256)
export async function encryptEvidenceHash(
    contractAddress: string,
    userAddress: string,
    hash: bigint
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> {
    const instance = await initFhevm();
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add256(hash);
    const encrypted = await input.encrypt();

    return {
        handle: toBytes32(encrypted.handles[0]),
        proof: toHexString(encrypted.inputProof),
    };
}

// Encrypt bounty amount (euint64)
export async function encryptBountyAmount(
    contractAddress: string,
    userAddress: string,
    amount: bigint
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> {
    const instance = await initFhevm();
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add64(amount);
    const encrypted = await input.encrypt();

    return {
        handle: toBytes32(encrypted.handles[0]),
        proof: toHexString(encrypted.inputProof),
    };
}

// Encrypt multiple inputs (hash + severity + description)
export async function encryptEvidenceInputs(
    contractAddress: string,
    userAddress: string,
    hash: bigint,
    severity: number,
    description: string = ""
): Promise<{
    hashHandle: `0x${string}`;
    severityHandle: `0x${string}`;
    descriptionHandle: `0x${string}`;
    proof: `0x${string}`;
}> {
    const instance = await initFhevm();
    const input = instance.createEncryptedInput(contractAddress, userAddress);

    // Add hash (euint256)
    input.add256(hash);

    // Add severity (euint8)
    input.add8(severity);

    // Convert description to uint256 (first 32 bytes)
    // Pad with zeros if shorter, truncate if longer
    const descBytes = new TextEncoder().encode(description.slice(0, 32));
    const padded = new Uint8Array(32);
    padded.set(descBytes);
    const descBigInt = BigInt('0x' + Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join(''));
    input.add256(descBigInt);

    const encrypted = await input.encrypt();

    return {
        hashHandle: toBytes32(encrypted.handles[0]),
        severityHandle: toBytes32(encrypted.handles[1]),
        descriptionHandle: toBytes32(encrypted.handles[2]),
        proof: toHexString(encrypted.inputProof),
    };
}

// Public decryption
export async function publicDecrypt(
    handle: `0x${string}`
): Promise<PublicDecryptResults> {
    const instance = await initFhevm();
    return instance.publicDecrypt([handle]);
}

// Decode description from uint256 back to string
export function decodeDescriptionFromBigInt(value: bigint): string {
    // Convert bigint to hex, then to bytes, then to string
    const hex = value.toString(16).padStart(64, '0');
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    // Find the end of the string (first zero byte or end)
    let end = bytes.findIndex(b => b === 0);
    if (end === -1) end = 32;
    return new TextDecoder().decode(bytes.slice(0, end));
}

// Hash a file to bigint for encryption
export async function hashFileToBigInt(file: File): Promise<bigint> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = new Uint8Array(hashBuffer);
    const hex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return BigInt("0x" + hex);
}

// Get ethers provider
export function getProvider(): ethers.BrowserProvider | null {
    if (typeof window === "undefined" || !window.ethereum) {
        return null;
    }
    return new ethers.BrowserProvider(window.ethereum);
}

// Get ethers signer
export async function getSigner(): Promise<ethers.Signer | null> {
    const provider = getProvider();
    if (!provider) return null;
    return provider.getSigner();
}
