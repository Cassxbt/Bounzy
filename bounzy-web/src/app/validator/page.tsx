"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { BOUNZY_ADDRESS, BOUNZY_ABI } from "@/utils/contract";
import { encryptBountyAmount, publicDecrypt, decodeDescriptionFromBigInt } from "@/utils/fhevm";
import { parseEther } from "viem";
import { logger } from "@/utils/logger";
import { Navbar } from "@/components/layout/Navbar";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { WalletButton } from "@/components/ui/WalletButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StatusGlowCard, OutlineButton } from "@/components/AnimatedComponents";
import { Lock, ExternalLink, Eye, CheckCircle, XCircle, FileText, Users, Calendar, Shield } from "lucide-react";

function EvidenceCard({
    evidenceId,
    campaignId,
    onActionComplete,
}: {
    evidenceId: number;
    campaignId: number;
    onActionComplete: () => void;
}) {
    const { address } = useAccount();
    const config = useConfig();
    const [bountyAmount, setBountyAmount] = useState("0.01");
    const [declineReason, setDeclineReason] = useState("");
    const [showActions, setShowActions] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [lastTxHash, setLastTxHash] = useState<string | null>(null);
    const [lastTxAction, setLastTxAction] = useState<string | null>(null);
    const [decryptedSeverity, setDecryptedSeverity] = useState<number | null>(null);
    const [isDecryptingSeverity, setIsDecryptingSeverity] = useState(false);
    const [decryptedDescription, setDecryptedDescription] = useState<string | null>(null);
    const [isDecryptingDescription, setIsDecryptingDescription] = useState(false);
    void campaignId;

    const { data: evidenceData, refetch: refetchEvidence } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getEvidence",
        args: [evidenceId],
    });

    const { writeContract: requestDecryption, data: decryptionTxHash, isPending: isDecryptionPending, reset: resetDecryption } = useWriteContract();
    const { writeContract: validate, data: validateTxHash, isPending: isValidatePending, reset: resetValidate } = useWriteContract();
    const { writeContract: decline, data: declineTxHash, isPending: isDeclinePending, reset: resetDecline } = useWriteContract();
    const { writeContract: requestDescDecryption, data: descDecryptionTxHash, isPending: isDescDecryptionPending, reset: resetDescDecryption } = useWriteContract();

    const { isLoading: isDecryptionConfirming, isSuccess: isDecryptionSuccess } = useWaitForTransactionReceipt({ hash: decryptionTxHash });
    const { isLoading: isValidateConfirming, isSuccess: isValidateSuccess } = useWaitForTransactionReceipt({ hash: validateTxHash });
    const { isLoading: isDeclineConfirming, isSuccess: isDeclineSuccess } = useWaitForTransactionReceipt({ hash: declineTxHash });
    const { isLoading: isDescDecryptionConfirming, isSuccess: isDescDecryptionSuccess } = useWaitForTransactionReceipt({ hash: descDecryptionTxHash });

    React.useEffect(() => {
        if (isDecryptionSuccess && decryptionTxHash) {
            setLastTxHash(decryptionTxHash);
            setLastTxAction("Decryption Requested");
            refetchEvidence();
            onActionComplete();
            resetDecryption();
        }
    }, [isDecryptionSuccess, decryptionTxHash, refetchEvidence, onActionComplete, resetDecryption]);

    React.useEffect(() => {
        if (isValidateSuccess && validateTxHash) {
            setLastTxHash(validateTxHash);
            setLastTxAction("Evidence Validated");
            refetchEvidence();
            onActionComplete();
            resetValidate();
        }
    }, [isValidateSuccess, validateTxHash, refetchEvidence, onActionComplete, resetValidate]);

    React.useEffect(() => {
        if (isDeclineSuccess && declineTxHash) {
            setLastTxHash(declineTxHash);
            setLastTxAction("Evidence Declined");
            refetchEvidence();
            onActionComplete();
            resetDecline();
        }
    }, [isDeclineSuccess, declineTxHash, refetchEvidence, onActionComplete, resetDecline]);

    React.useEffect(() => {
        if (isDescDecryptionSuccess && descDecryptionTxHash) {
            setLastTxHash(descDecryptionTxHash);
            setLastTxAction("Description Decryption Requested");
            refetchEvidence();
            resetDescDecryption();
        }
    }, [isDescDecryptionSuccess, descDecryptionTxHash, refetchEvidence, resetDescDecryption]);

    if (!evidenceData) return null;

    const [, submitter, status, timestamp, severityDecryptable, , descriptionDecryptable] = evidenceData;
    const statusNum = Number(status);
    const date = new Date(Number(timestamp) * 1000);

    const statusLabels = ["Pending", "Validated", "Declined", "Claimed"];
    const statusColors = [
        "bg-amber-500/10 text-amber-500 border-amber-500/20",
        "bg-green-500/10 text-green-500 border-green-500/20",
        "bg-red-500/10 text-red-500 border-red-500/20",
        "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ];

    const isProcessing =
        isDecryptionPending || isDecryptionConfirming || isValidatePending || isValidateConfirming || isDeclinePending || isDeclineConfirming || isDescDecryptionPending || isDescDecryptionConfirming;

    const handleRequestDecryption = () => {
        requestDecryption({
            address: BOUNZY_ADDRESS as `0x${string}`,
            abi: BOUNZY_ABI,
            functionName: "requestSeverityDecryption",
            args: [evidenceId],
        });
    };

    const handlePreviewSeverity = async () => {
        if (decryptedSeverity !== null) return;
        setIsDecryptingSeverity(true);
        try {
            const severityHandle = await readContract(config, {
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "getEvidenceSeverityHandle",
                args: [evidenceId],
            });
            const decryptResult = await publicDecrypt(severityHandle as `0x${string}`);
            const clearValues = Object.values(decryptResult.clearValues);
            if (clearValues.length > 0) {
                setDecryptedSeverity(Number(clearValues[0]));
            }
        } catch (err) {
            logger.validator.error("Failed to preview severity", err);
        } finally {
            setIsDecryptingSeverity(false);
        }
    };

    const handlePreviewDescription = async () => {
        if (decryptedDescription !== null) return;
        setIsDecryptingDescription(true);
        try {
            const descHandle = await readContract(config, {
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "getDescriptionHandle",
                args: [evidenceId],
            });
            const decryptResult = await publicDecrypt(descHandle as `0x${string}`);
            const clearValues = Object.values(decryptResult.clearValues);
            if (clearValues.length > 0) {
                const decoded = decodeDescriptionFromBigInt(clearValues[0]);
                setDecryptedDescription(decoded || "(empty)");
            }
        } catch (err) {
            logger.validator.error("Failed to preview description", err);
            setDecryptedDescription("(failed to decrypt)");
        } finally {
            setIsDecryptingDescription(false);
        }
    };

    const handleRequestDescriptionDecryption = () => {
        requestDescDecryption({
            address: BOUNZY_ADDRESS as `0x${string}`,
            abi: BOUNZY_ABI,
            functionName: "requestDescriptionDecryption",
            args: [evidenceId],
        });
    };

    const handleValidate = async () => {
        if (!address) return;
        setValidationError(null);
        logger.validator.txStart("Validate Evidence", { evidenceId, bountyAmount, address });

        try {
            logger.validator.info("Fetching severity handle from contract...");
            const severityHandle = await readContract(config, {
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "getEvidenceSeverityHandle",
                args: [evidenceId],
            });
            logger.validator.debug("Severity handle retrieved", { severityHandle });

            logger.validator.info("Calling publicDecrypt on KMS...");
            const decryptResult = await publicDecrypt(severityHandle as `0x${string}`);
            logger.validator.debug("PublicDecrypt result", decryptResult);

            const clearValues = Object.values(decryptResult.clearValues);
            if (clearValues.length === 0) {
                throw new Error("No decrypted values returned from KMS");
            }
            const severityClear = Number(clearValues[0]);
            logger.validator.info("Decrypted severity value", { severityClear, proofLength: decryptResult.decryptionProof?.length });

            logger.validator.info("Encrypting bounty amount...", { bountyAmount, bountyWei: parseEther(bountyAmount).toString() });
            const encrypted = await encryptBountyAmount(BOUNZY_ADDRESS, address, parseEther(bountyAmount));
            logger.validator.debug("Bounty encryption result", { handle: encrypted.handle, proofLength: encrypted.proof.length });

            logger.validator.info("Submitting validateEvidence transaction...");
            validate({
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "validateEvidence",
                args: [evidenceId, severityClear, encrypted.handle, encrypted.proof, decryptResult.decryptionProof],
            });
        } catch (err) {
            logger.validator.txError("Validate Evidence", err);
            setValidationError(err instanceof Error ? err.message : "Validation failed");
        }
    };

    const handleDecline = () => {
        logger.validator.txStart("Decline Evidence", { evidenceId, declineReason });
        decline({
            address: BOUNZY_ADDRESS as `0x${string}`,
            abi: BOUNZY_ABI,
            functionName: "declineEvidence",
            args: [evidenceId, declineReason || "Evidence does not meet criteria"],
        });
    };

    const statusForGlow = statusNum === 0 ? "pending" : statusNum === 1 ? "validated" : statusNum === 2 ? "declined" : "submitted";

    return (
        <StatusGlowCard status={statusForGlow} className="group">
            <div className="p-6">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusNum === 0 ? "bg-amber-500/10" :
                            statusNum === 1 ? "bg-green-500/10" :
                                statusNum === 2 ? "bg-red-500/10" : "bg-[var(--accent)]/10"
                            }`}>
                            <FileText className={`w-5 h-5 ${statusNum === 0 ? "text-amber-500" :
                                statusNum === 1 ? "text-green-500" :
                                    statusNum === 2 ? "text-red-500" : "text-[var(--accent)]"
                                }`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Evidence #{evidenceId}</h3>
                            <p className="text-xs text-[var(--text-muted)] font-mono">
                                {submitter.slice(0, 10)}...{submitter.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm ${statusColors[statusNum]}`}
                    >{statusLabels[statusNum]}</motion.span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border)]/50">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                        <div>
                            <span className="text-xs text-[var(--text-muted)] block">Submitted</span>
                            <span className="text-sm font-medium">{date.toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--text-muted)]" />
                        <div>
                            <span className="text-xs text-[var(--text-muted)] block">Severity Decryptable</span>
                            <span className={`text-sm font-medium ${severityDecryptable ? "text-green-500" : "text-[var(--text-secondary)]"}`}>
                                {severityDecryptable ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>
                </div>

                {statusNum === 0 && (
                    <div className="space-y-3">
                        {!showActions ? (
                            <button onClick={() => setShowActions(true)} className="w-full py-2 border border-[var(--border)] hover:border-[var(--accent)] rounded-xl transition-colors flex items-center justify-center gap-2">
                                <Eye className="w-4 h-4" />
                                Review Evidence
                            </button>
                        ) : (
                            <>
                                {!severityDecryptable ? (
                                    <button onClick={handleRequestDecryption} disabled={isProcessing} className="w-full btn-primary disabled:opacity-50">
                                        {isProcessing ? "Processing..." : "Request Severity Decryption"}
                                    </button>
                                ) : (
                                    <>
                                        <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--bg-primary)]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[var(--text-muted)]">Decrypted Severity:</span>
                                                {decryptedSeverity !== null ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-lg font-bold ${decryptedSeverity >= 7 ? "text-red-500" : decryptedSeverity >= 4 ? "text-amber-500" : "text-green-500"}`}>
                                                            {decryptedSeverity}/10
                                                        </span>
                                                        <span className="text-xs text-[var(--text-muted)]">{decryptedSeverity >= 7 ? "Critical" : decryptedSeverity >= 4 ? "Medium" : "Low"}</span>
                                                    </div>
                                                ) : (
                                                    <button onClick={handlePreviewSeverity} disabled={isDecryptingSeverity} className="text-xs px-3 py-1 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50">
                                                        {isDecryptingSeverity ? "Decrypting..." : "Preview"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--bg-primary)]">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm text-[var(--text-muted)]">Description (Encrypted):</span>
                                                {!descriptionDecryptable ? (
                                                    <button onClick={handleRequestDescriptionDecryption} disabled={isProcessing} className="text-xs px-3 py-1 border border-[var(--accent)] text-[var(--accent)] rounded-lg disabled:opacity-50 w-fit">
                                                        {isProcessing ? "Processing..." : "Request Decryption"}
                                                    </button>
                                                ) : decryptedDescription !== null ? (
                                                    <span className="text-sm bg-[var(--bg-secondary)] rounded-lg px-3 py-2">&quot;{decryptedDescription}&quot;</span>
                                                ) : (
                                                    <button onClick={handlePreviewDescription} disabled={isDecryptingDescription} className="text-xs px-3 py-1 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 w-fit">
                                                        {isDecryptingDescription ? "Decrypting..." : "Decrypt Description"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm text-[var(--text-muted)]">Bounty Amount (ETH)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={bountyAmount}
                                                onChange={(e) => setBountyAmount(e.target.value)}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-3 py-2 mt-1 focus:border-[var(--accent)] focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <OutlineButton
                                                onClick={handleValidate}
                                                disabled={isProcessing}
                                                variant="success"
                                                icon={<CheckCircle className="w-4 h-4" />}
                                            >
                                                Validate
                                            </OutlineButton>
                                            <OutlineButton
                                                onClick={handleDecline}
                                                disabled={isProcessing}
                                                variant="danger"
                                                icon={<XCircle className="w-4 h-4" />}
                                            >
                                                Decline
                                            </OutlineButton>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Decline reason (optional)"
                                            value={declineReason}
                                            onChange={(e) => setDeclineReason(e.target.value)}
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                                        />
                                        {validationError && <div className="p-3 border border-red-500/30 rounded-xl bg-red-500/5 text-red-500 text-sm">{validationError}</div>}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}

                {lastTxHash && (
                    <div className="mt-3 p-3 border border-green-500/30 rounded-xl bg-green-500/5">
                        <div className="text-green-500 text-sm font-medium mb-1 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {lastTxAction}
                        </div>
                        <a href={`https://sepolia.etherscan.io/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-xs hover:underline flex items-center gap-1">
                            View on Etherscan <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
            </div>
        </StatusGlowCard>
    );
}


function CampaignButton({ campaignId, isSelected, onClick }: { campaignId: number; isSelected: boolean; onClick: () => void }) {
    const { data } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getCampaign",
        args: [campaignId],
    });

    const name = data ? (data as [string, string, bigint, bigint, number, boolean])[1] : `Campaign #${campaignId}`;
    const evidenceCount = data ? Number((data as [string, string, bigint, bigint, number, boolean])[4]) : 0;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 border relative overflow-hidden ${isSelected
                ? "bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/5 border-[var(--accent)] shadow-[0_0_20px_rgba(212,165,116,0.2)]"
                : "bg-[var(--bg-secondary)]/80 backdrop-blur-sm border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-secondary)]"
                }`}
        >
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-amber-500" />
            )}
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isSelected ? "text-[var(--accent)]" : ""}`}>{name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        <span className={`inline-flex items-center gap-1 ${evidenceCount > 0 ? "text-[var(--accent)]" : ""}`}>
                            {evidenceCount} evidence
                        </span>
                    </div>
                </div>
                {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                )}
            </div>
        </motion.button>
    );
}

export default function Validator() {
    const { isConnected } = useAccount();
    const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

    const { data: campaignCount } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "campaignCounter",
    });

    const { data: evidenceIds } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getCampaignEvidenceIds",
        args: selectedCampaign ? [selectedCampaign] : undefined,
        query: { enabled: !!selectedCampaign },
    });

    const allCampaignIds = campaignCount ? Array.from({ length: Number(campaignCount) }, (_, i) => i + 1) : [];

    return (
        <>
            <GrainTexture />
            <Navbar />
            <main className="min-h-screen pt-24 px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <p className="section-heading">Compliance Officer</p>
                        <h1 className="text-display-md font-bold mb-2">
                            VALIDATOR <span className="text-[var(--accent)]">DASHBOARD</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] mb-8">Review and validate evidence submissions for your campaigns.</p>
                    </ScrollReveal>

                    {!isConnected ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                                <Lock className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)] mb-6">Connect your wallet to view your campaigns</p>
                                <WalletButton showDisconnect={false} />
                            </div>
                        </ScrollReveal>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Campaigns Sidebar */}
                            <div className="lg:w-1/3">
                                <ScrollReveal delay={0.1}>
                                    <div className="sticky top-24 border border-[var(--border)] rounded-2xl p-6 bg-[var(--bg-secondary)]/50 backdrop-blur-md">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-[var(--accent)]" />
                                            </div>
                                            <div>
                                                <span>Your Campaigns</span>
                                                <p className="text-xs text-[var(--text-muted)] font-normal">{allCampaignIds.length} total</p>
                                            </div>
                                        </h2>
                                        <div className="space-y-3">
                                            {allCampaignIds.map((id) => (
                                                <CampaignButton key={id} campaignId={id} isSelected={selectedCampaign === id} onClick={() => setSelectedCampaign(id)} />
                                            ))}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Evidence Panel */}
                            <div className="lg:w-2/3">
                                <ScrollReveal delay={0.2}>
                                    <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--bg-secondary)]/50 backdrop-blur-md min-h-[400px]">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--text-muted)]/10 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                                            </div>
                                            <div>
                                                <span>Evidence Submissions</span>
                                                {selectedCampaign ? (
                                                    <p className="text-xs text-[var(--accent)] font-normal">Campaign #{selectedCampaign}</p>
                                                ) : (
                                                    <p className="text-xs text-[var(--text-muted)] font-normal">Select a campaign</p>
                                                )}
                                            </div>
                                        </h2>

                                        {!selectedCampaign ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-[var(--border)] flex items-center justify-center mb-4">
                                                    <FileText className="w-8 h-8 text-[var(--text-muted)]" />
                                                </div>
                                                <p className="text-[var(--text-secondary)]">Select a campaign from the sidebar</p>
                                                <p className="text-sm text-[var(--text-muted)] mt-1">to view pending evidence</p>
                                            </div>
                                        ) : !evidenceIds || evidenceIds.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                                </div>
                                                <p className="text-[var(--text-secondary)]">No pending evidence</p>
                                                <p className="text-sm text-[var(--text-muted)] mt-1">All caught up!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {evidenceIds.map((id) => (
                                                    <EvidenceCard key={id} evidenceId={Number(id)} campaignId={selectedCampaign} onActionComplete={() => { }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollReveal>
                            </div>
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
