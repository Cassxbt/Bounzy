import hre from "hardhat";

async function main() {
    console.log("Deploying Bounzy contract to Sepolia...\n");

    // Get the deployer account
    const [deployer] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    console.log("Deployer address:", deployer.account.address);

    const balance = await publicClient.getBalance({ address: deployer.account.address });
    console.log("Deployer balance:", hre.ethers?.formatEther?.(balance) || (Number(balance) / 1e18).toFixed(4), "ETH\n");

    // Deploy the contract
    console.log("Deploying Bounzy...");
    const bounzy = await hre.viem.deployContract("Bounzy");

    console.log("\n[OK] Bounzy deployed successfully!");
    console.log("Contract address:", bounzy.address);
    console.log("\n[INFO] Update BOUNZY_ADDRESS in /bounzy-web/src/utils/contract.ts with:");
    console.log(`export const BOUNZY_ADDRESS = "${bounzy.address}";`);

    // Wait for confirmations
    console.log("\nWaiting for block confirmations...");
    await publicClient.waitForTransactionReceipt({
        hash: bounzy.deploymentTransaction?.hash as `0x${string}`
    });

    console.log("\n[DONE] Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
