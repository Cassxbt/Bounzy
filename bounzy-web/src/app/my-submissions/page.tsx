"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { BOUNZY_ADDRESS, BOUNZY_ABI } from "@/utils/contract";
import { publicDecrypt } from "@/utils/fhevm";
import { logger } from "@/utils/logger";
import { Navbar } from "@/components/layout/Navbar";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { WalletButton } from "@/components/ui/WalletButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { FlipCard } from "@/components/AnimatedComponents";
import { Lock, ExternalLink, ArrowRight, CheckCircle, XCircle, Clock, Coins, Shield, Calendar, Hash } from "lucide-react";

function SubmissionCard({ evidenceId }: { evidenceId: number }) {
    const { address } = useAccount();
    const config = useConfig();

    const [claimError, setClaimError] = useState<string | null>(null);
    const [lastTxHash, setLastTxHash] = useState<string | null>(null);
    const [lastTxAction, setLastTxAction] = useState<string | null>(null);
    const [declineReason, setDeclineReason] = useState<string | null>(null);
    const [previewedBounty, setPreviewedBounty] = useState<string | null>(null);
    const [isPreviewingBounty, setIsPreviewingBounty] = useState(false);
    void isPreviewingBounty;

    const { data: evidenceData, refetch: refetchEvidence } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getEvidence",
        args: [evidenceId],
    });

    const { data: campaignData } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getCampaign",
        args: evidenceData ? [evidenceData[0]] : undefined,
        query: { enabled: !!evidenceData },
    });

    const { writeContract: requestBountyDecryption, data: decryptionTxHash, isPending: isDecryptionPending, reset: resetDecryption } = useWriteContract();
    const { writeContract: claimBounty, data: claimTxHash, isPending: isClaimPending, reset: resetClaim } = useWriteContract();

    const { isLoading: isDecryptionConfirming, isSuccess: isDecryptionSuccess } = useWaitForTransactionReceipt({ hash: decryptionTxHash });
    const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash });

    React.useEffect(() => {
        if (isDecryptionSuccess && decryptionTxHash) {
            setLastTxHash(decryptionTxHash);
            setLastTxAction("Bounty Decryption Requested");
            refetchEvidence();
            resetDecryption();
        }
    }, [isDecryptionSuccess, decryptionTxHash, refetchEvidence, resetDecryption]);

    React.useEffect(() => {
        if (isClaimSuccess && claimTxHash) {
            setLastTxHash(claimTxHash);
            setLastTxAction("Bounty Claimed");
            refetchEvidence();
            resetClaim();
        }
    }, [isClaimSuccess, claimTxHash, refetchEvidence, resetClaim]);

    const campaignId = evidenceData?.[0];
    const status = evidenceData?.[2];
    const timestamp = evidenceData?.[3];
    const bountyDecryptable = evidenceData?.[5];
    const statusNum = status !== undefined ? Number(status) : -1;
    const date = timestamp ? new Date(Number(timestamp) * 1000) : new Date();

    useEffect(() => {
        async function fetchDeclineReason() {
            if (statusNum !== 2) return;

            try {
                const reason = await readContract(config, {
                    address: BOUNZY_ADDRESS as `0x${string}`,
                    abi: BOUNZY_ABI,
                    functionName: "getDeclinedReason",
                    args: [evidenceId],
                });
                setDeclineReason((reason as string) || "No reason provided");
            } catch (err) {
                console.error("Failed to fetch decline reason:", err);
                setDeclineReason("Unable to fetch reason");
            }
        }

        fetchDeclineReason();
    }, [statusNum, evidenceId, config]);

    useEffect(() => {
        async function fetchBountyPreview() {
            if (statusNum !== 1 || !bountyDecryptable || previewedBounty) return;
            setIsPreviewingBounty(true);

            try {
                const bountyHandle = await readContract(config, {
                    address: BOUNZY_ADDRESS as `0x${string}`,
                    abi: BOUNZY_ABI,
                    functionName: "getEvidenceBountyHandle",
                    args: [evidenceId],
                });

                const decryptResult = await publicDecrypt(bountyHandle as `0x${string}`);
                const clearValues = Object.values(decryptResult.clearValues);
                if (clearValues.length > 0) {
                    const bountyWei = BigInt(String(clearValues[0]));
                    const bountyEth = Number(bountyWei) / 1e18;
                    setPreviewedBounty(bountyEth.toFixed(4));
                }
            } catch (err) {
                console.error("Failed to preview bounty:", err);
            } finally {
                setIsPreviewingBounty(false);
            }
        }

        fetchBountyPreview();
    }, [statusNum, bountyDecryptable, evidenceId, config, previewedBounty]);

    if (!evidenceData) return null;

    const statusLabels = ["Pending", "Validated", "Declined", "Claimed"];
    const statusIcons = [Clock, CheckCircle, XCircle, Coins];
    const statusColors = [
        "bg-amber-500/10 text-amber-500 border-amber-500/20",
        "bg-green-500/10 text-green-500 border-green-500/20",
        "bg-red-500/10 text-red-500 border-red-500/20",
        "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ];

    const isProcessing = isDecryptionPending || isDecryptionConfirming || isClaimPending || isClaimConfirming;
    const StatusIcon = statusIcons[statusNum] || Clock;

    const handleRequestDecryption = () => {
        logger.claim.txStart("Request Bounty Decryption", { evidenceId });
        requestBountyDecryption({
            address: BOUNZY_ADDRESS as `0x${string}`,
            abi: BOUNZY_ABI,
            functionName: "requestBountyDecryption",
            args: [evidenceId],
        });
    };

    const handleClaim = async () => {
        setClaimError(null);
        logger.claim.txStart("Claim Bounty", { evidenceId, address });

        try {
            logger.claim.info("Fetching bounty handle from contract...");
            const bountyHandle = await readContract(config, {
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "getEvidenceBountyHandle",
                args: [evidenceId],
            });
            logger.claim.debug("Bounty handle retrieved", { bountyHandle });

            logger.claim.info("Calling publicDecrypt on KMS...");
            const decryptResult = await publicDecrypt(bountyHandle as `0x${string}`);
            logger.claim.debug("PublicDecrypt result", decryptResult);

            const clearValues = Object.values(decryptResult.clearValues);
            if (clearValues.length === 0) {
                throw new Error("No decrypted values returned from KMS");
            }
            const bountyClear = clearValues[0];

            logger.claim.info("Decrypted bounty value", {
                bountyClear,
                bountyETH: Number(bountyClear) / 1e18,
                proofLength: decryptResult.decryptionProof?.length,
            });

            logger.claim.info("Submitting claimBounty transaction...");
            claimBounty(
                {
                    address: BOUNZY_ADDRESS as `0x${string}`,
                    abi: BOUNZY_ABI,
                    functionName: "claimBounty",
                    args: [evidenceId, bountyClear, decryptResult.decryptionProof],
                },
                {
                    onSuccess: (hash) => {
                        logger.claim.txPending("Claim Bounty", hash);
                    },
                    onError: (error) => {
                        logger.claim.txError("Claim Bounty", error);
                        setClaimError(error.message || "Contract call failed");
                    },
                }
            );
        } catch (err) {
            logger.claim.txError("Claim Bounty", err);
            setClaimError(err instanceof Error ? err.message : "Claim failed");
        }
    };

    const accentColors: Record<number, string> = {
        0: "rgb(245, 158, 11)", // Pending - amber
        1: "rgb(34, 197, 94)",  // Validated - green
        2: "rgb(239, 68, 68)",  // Declined - red
        3: "rgb(34, 197, 94)",  // Claimed - green
    };

    const frontContent = (
        <div className="p-6 h-full flex flex-col justify-between">
            <div>
                {/* Status Badge */}
                <div className="flex justify-end mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${statusColors[statusNum]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabels[statusNum]}
                    </span>
                </div>
                {/* Title - Description without quotes */}
                <h3 className="text-lg font-semibold leading-snug line-clamp-2">
                    {campaignData ? campaignData[1] : `Campaign #${campaignId}`}
                </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4">Hover for details →</p>
        </div>
    );

    const backContent = (
        <div className="p-6 h-full flex flex-col">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                    <div>
                        <span className="text-xs text-[var(--text-muted)] block">Submitted</span>
                        <span className="font-medium">{date.toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[var(--text-muted)]" />
                    <div>
                        <span className="text-xs text-[var(--text-muted)] block">Campaign ID</span>
                        <span className="font-medium">#{campaignId?.toString() ?? "—"}</span>
                    </div>
                </div>
            </div>

            {/* Actions based on status */}
            <div className="flex-1 flex flex-col justify-center">
                {statusNum === 1 && (
                    <div className="space-y-2">
                        {!bountyDecryptable ? (
                            <button onClick={handleRequestDecryption} disabled={isProcessing} className="w-full btn-primary disabled:opacity-50">
                                {isProcessing ? "Processing..." : "Request Bounty"}
                            </button>
                        ) : (
                            <>
                                <div className="border border-green-500/30 rounded-xl p-3 bg-green-500/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[var(--text-muted)]">Your Reward:</span>
                                        {previewedBounty ? <span className="text-lg font-bold text-green-500">{previewedBounty} ETH</span> : <span className="text-xs text-[var(--text-muted)]">Fetching...</span>}
                                    </div>
                                </div>
                                <button onClick={handleClaim} disabled={isProcessing} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    <Coins className="w-4 h-4" />
                                    {isProcessing ? "Claiming..." : `Claim ${previewedBounty || ""} ETH`}
                                </button>
                                {claimError && <div className="p-2 border border-red-500/30 rounded-xl bg-red-500/5 text-red-500 text-xs">{claimError}</div>}
                            </>
                        )}
                    </div>
                )}

                {statusNum === 2 && (
                    <div className="border-l-2 border-red-500 pl-3 py-2 bg-red-500/5 rounded-r-lg">
                        <div className="text-red-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Evidence Declined
                        </div>
                        {declineReason && <p className="text-sm text-[var(--text-secondary)]">{declineReason}</p>}
                    </div>
                )}

                {statusNum === 3 && (
                    <div className="text-center py-2 text-green-500 text-sm flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Bounty claimed successfully!
                    </div>
                )}

                {statusNum === 0 && (
                    <div className="text-center py-2 text-amber-500 text-sm flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Awaiting review...
                    </div>
                )}
            </div>

            {lastTxHash && (
                <div className="mt-3 p-2 border border-green-500/30 rounded-xl bg-green-500/5">
                    <div className="text-green-500 text-xs font-medium mb-1 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        {lastTxAction}
                    </div>
                    <a href={`https://sepolia.etherscan.io/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-xs hover:underline flex items-center gap-1">
                        View on Etherscan <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}
        </div>
    );

    return (
        <FlipCard
            front={frontContent}
            back={backContent}
            className="h-[220px]"
            accentColor={accentColors[statusNum]}
        />
    );
}

export default function MySubmissions() {
    const { address, isConnected } = useAccount();

    const { data: evidenceIds } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getSubmitterEvidenceIds",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    return (
        <>
            <GrainTexture />
            <Navbar />
            <main className="min-h-screen pt-24 px-6 pb-16">
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <p className="section-heading">Whistleblower</p>
                                <h1 className="text-display-md font-bold">
                                    MY <span className="text-[var(--accent)]">SUBMISSIONS</span>
                                </h1>
                                <p className="text-[var(--text-secondary)] mt-2">Track status and claim bounties for your evidence submissions.</p>
                            </div>
                            <Link href="/submit-evidence" className="btn-primary inline-flex items-center gap-2">
                                Submit Evidence <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.05}>
                        <div className="flex items-start gap-3 border border-[var(--accent)]/30 rounded-xl p-4 mb-8 bg-[var(--accent)]/5">
                            <Shield className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[var(--text-secondary)]">
                                <strong className="text-[var(--accent)]">Privacy Note:</strong> This page shows submissions from your current wallet. If you used a burner wallet, connect that wallet to see your
                                submissions.
                            </p>
                        </div>
                    </ScrollReveal>

                    {!isConnected ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                                <Lock className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)] mb-6">Connect your wallet to view your submissions</p>
                                <WalletButton showDisconnect={false} />
                            </div>
                        </ScrollReveal>
                    ) : !evidenceIds || evidenceIds.length === 0 ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]">
                                <p className="text-[var(--text-secondary)] mb-4">No submissions yet</p>
                                <Link href="/submit-evidence" className="text-[var(--accent)] hover:underline">
                                    Submit your first evidence
                                </Link>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {evidenceIds.map((id, i) => (
                                <ScrollReveal key={id} delay={i * 0.05}>
                                    <SubmissionCard evidenceId={Number(id)} />
                                </ScrollReveal>
                            ))}
                        </div>
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
