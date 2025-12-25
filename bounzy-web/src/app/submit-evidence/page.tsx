"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { BOUNZY_ADDRESS, BOUNZY_ABI } from "@/utils/contract";
import { encryptEvidenceInputs, hashFileToBigInt } from "@/utils/fhevm";
import { logger } from "@/utils/logger";
import { formatEther } from "viem";
import { Navbar } from "@/components/layout/Navbar";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { WalletButton } from "@/components/ui/WalletButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SegmentedSlider } from "@/components/AnimatedComponents";
import { CheckCircle, ExternalLink, ArrowRight, Lock, Shield, FileText, AlertTriangle, Upload, ChevronDown } from "lucide-react";

interface CampaignInfo {
    id: number;
    name: string;
    bountyPool: string;
}


// Premium Select Component
function PremiumSelect({
    value,
    onChange,
    options,
    placeholder,
    label,
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    label: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((o) => o.value === value);

    return (
        <div>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-4
            text-left flex items-center justify-between
            focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_20px_rgba(212,165,116,0.15)]
            transition-all duration-300"
                >
                    <span className={selectedOption ? "" : "text-[var(--text-muted)]"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-[var(--accent)]/10 transition-colors
                    ${option.value === value ? "bg-[var(--accent)]/5 text-[var(--accent)]" : ""}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}

// Premium File Upload Component
function PremiumFileUpload({
    file,
    onChange,
}: {
    file: File | null;
    onChange: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) onChange(droppedFile);
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-[var(--text-muted)]" />
                <label className="text-sm font-medium">Evidence File</label>
            </div>

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center
          transition-all duration-300
          ${isDragging ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] hover:border-[var(--accent)]/50"}
          ${file ? "bg-[var(--accent)]/5" : "bg-[var(--bg-primary)]"}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    className="hidden"
                />

                {file ? (
                    <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-[var(--accent)]" />
                        <div className="text-left">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
                        <p className="font-medium mb-1">Drop your file here or click to browse</p>
                        <p className="text-sm text-[var(--text-muted)]">Only the file hash is stored on-chain</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SubmitEvidence() {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const [campaignId, setCampaignId] = useState("");
    const [severity, setSeverity] = useState(5);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [campaignInfos, setCampaignInfos] = useState<CampaignInfo[]>([]);

    const { writeContract, data: txHash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const { data: activeCampaigns } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getActiveCampaigns",
    });

    useEffect(() => {
        async function fetchCampaignNames() {
            if (!activeCampaigns || activeCampaigns.length === 0) return;

            const infos: CampaignInfo[] = [];
            for (const id of activeCampaigns) {
                try {
                    const data = await readContract(config, {
                        address: BOUNZY_ADDRESS as `0x${string}`,
                        abi: BOUNZY_ABI,
                        functionName: "getCampaign",
                        args: [id],
                    });
                    if (data) {
                        const [, name, bountyPool] = data as [string, string, bigint, bigint, number, boolean];
                        infos.push({
                            id: Number(id),
                            name: name,
                            bountyPool: formatEther(bountyPool),
                        });
                    }
                } catch (err) {
                    console.error(`Failed to fetch campaign ${id}:`, err);
                }
            }
            setCampaignInfos(infos);
        }

        fetchCampaignNames();
    }, [activeCampaigns, config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!address || !isConnected) {
            setError("Please connect your wallet");
            return;
        }

        if (!campaignId) {
            setError("Please select a campaign");
            return;
        }

        if (!file) {
            setError("Please select an evidence file");
            return;
        }

        try {
            setIsEncrypting(true);
            logger.evidence.txStart("Submit Evidence", { campaignId, severity, fileName: file.name, address });

            logger.evidence.info("Hashing evidence file...", { fileName: file.name, fileSize: file.size });
            const fileHash = await hashFileToBigInt(file);
            logger.evidence.debug("File hash computed", { hashPrefix: fileHash.toString().slice(0, 20) + "..." });

            logger.evidence.info("Encrypting evidence inputs (hash + severity + description)...");
            const encrypted = await encryptEvidenceInputs(BOUNZY_ADDRESS, address, fileHash, severity, description);
            logger.evidence.debug("Encryption complete", {
                hashHandle: encrypted.hashHandle.slice(0, 20) + "...",
                severityHandle: encrypted.severityHandle.slice(0, 20) + "...",
                descriptionHandle: encrypted.descriptionHandle.slice(0, 20) + "...",
                proofLength: encrypted.proof.length,
            });

            setIsEncrypting(false);
            logger.evidence.info("Submitting to contract...");

            writeContract({
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "submitEvidence",
                args: [Number(campaignId), encrypted.hashHandle, encrypted.severityHandle, encrypted.descriptionHandle, encrypted.proof],
            });
        } catch (err) {
            setIsEncrypting(false);
            logger.evidence.txError("Submit Evidence", err);
            setError(err instanceof Error ? err.message : "Encryption failed");
        }
    };

    const campaignOptions = campaignInfos.length > 0
        ? campaignInfos.map((c) => ({ value: c.id.toString(), label: `${c.name} (${c.bountyPool} ETH)` }))
        : (activeCampaigns?.map((id) => ({ value: id.toString(), label: `Campaign #${id}` })) || []);

    return (
        <>
            <GrainTexture />
            <Navbar />
            <main className="min-h-screen pt-24 px-6 pb-16">
                <div className="max-w-2xl mx-auto">
                    {/* Show wallet button when connected */}
                    {isConnected && (
                        <div className="flex justify-end mb-6">
                            <WalletButton showDisconnect={true} />
                        </div>
                    )}

                    <ScrollReveal>
                        <p className="section-heading">Whistleblower</p>
                        <h1 className="text-display-md font-bold mb-2">
                            SUBMIT <span className="text-[var(--accent)]">EVIDENCE</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Report fraud anonymously. Your identity is protected by encryption.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={0.05}>
                        <div className="flex items-start gap-3 border border-[var(--accent)]/30 rounded-xl p-4 mb-8 bg-[var(--accent)]/5">
                            <Shield className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[var(--text-secondary)]">
                                <strong className="text-[var(--accent)]">Privacy Tip:</strong> For maximum anonymity, use this page from
                                an incognito browser with a burner wallet.
                            </p>
                        </div>
                    </ScrollReveal>

                    {!isConnected ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                                <Lock className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)] mb-6">Connect your wallet to submit evidence</p>
                                <WalletButton showDisconnect={false} />
                            </div>
                        </ScrollReveal>
                    ) : isSuccess ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Evidence Submitted!</h2>
                                <p className="text-[var(--text-secondary)] mb-6">
                                    Your encrypted evidence has been recorded on-chain. Save your wallet to track status.
                                </p>
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline mb-6"
                                >
                                    View Transaction <ExternalLink className="w-4 h-4" />
                                </a>
                                <div className="mt-4">
                                    <Link href="/my-submissions" className="btn-primary inline-flex items-center gap-2">
                                        Track My Submissions <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <ScrollReveal delay={0.1}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="border border-[var(--border)] rounded-2xl p-8 bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                                    <div className="space-y-8">
                                        <PremiumSelect
                                            label="Select Campaign"
                                            value={campaignId}
                                            onChange={setCampaignId}
                                            options={campaignOptions}
                                            placeholder="Choose a campaign..."
                                        />

                                        <PremiumFileUpload file={file} onChange={setFile} />

                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
                                                <label className="text-sm font-medium">Severity Rating (1-10)</label>
                                            </div>
                                            <SegmentedSlider
                                                value={severity}
                                                onChange={setSeverity}
                                                min={1}
                                                max={10}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                                                <label className="text-sm font-medium">Description (Encrypted)</label>
                                            </div>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Describe the evidence for your own records..."
                                                rows={3}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-4
                          placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]
                          focus:shadow-[0_0_20px_rgba(212,165,116,0.15)] transition-all duration-300 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 border border-red-500/30 rounded-xl p-4 bg-red-500/5">
                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <p className="text-red-500">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending || isConfirming || isEncrypting}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4 tracking-wide"
                                >
                                    {isEncrypting
                                        ? "ENCRYPTING EVIDENCE..."
                                        : isPending
                                            ? "CONFIRM IN WALLET..."
                                            : isConfirming
                                                ? "SUBMITTING..."
                                                : "SUBMIT ENCRYPTED EVIDENCE"}
                                </button>

                                <p className="text-[var(--text-muted)] text-xs text-center">
                                    Your file hash and severity are encrypted before submission. Nobody can see this data without proper decryption rights.
                                </p>
                            </form>
                        </ScrollReveal>
                    )}

                    <ScrollReveal delay={0.3}>
                        <div className="text-center mt-12">
                            <Link href="/app" className="nav-link">← Back to App</Link>
                        </div>
                    </ScrollReveal>
                </div>
            </main>
        </>
    );
}
