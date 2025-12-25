"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { BOUNZY_ADDRESS, BOUNZY_ABI } from "@/utils/contract";
import { encryptSeverity } from "@/utils/fhevm";
import { Navbar } from "@/components/layout/Navbar";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { WalletButton } from "@/components/ui/WalletButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CheckCircle, ExternalLink, ArrowRight, Lock, Calendar, Coins, AlertTriangle, Minus, Plus } from "lucide-react";

// Custom Input with floating label
function FloatingInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    icon: Icon,
    iconColor = "text-[var(--text-muted)]",
    step,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    icon?: React.ComponentType<{ className?: string }>;
    iconColor?: string;
    step?: string;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div className="relative">
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
                <label className="text-sm font-medium">{label}</label>
            </div>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    step={step}
                    className={`w-full bg-[var(--bg-primary)] border rounded-xl px-4 py-4 
            placeholder-[var(--text-muted)] focus:outline-none transition-all duration-300
            ${isFocused ? "border-[var(--accent)] shadow-[0_0_20px_rgba(212,165,116,0.15)]" : "border-[var(--border)]"}
            ${hasValue && !isFocused ? "border-[var(--border)]" : ""}`}
                />
                {isFocused && (
                    <motion.div
                        layoutId="input-glow"
                        className="absolute inset-0 -z-10 rounded-xl bg-[var(--accent)]/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </div>
        </div>
    );
}

// Custom Range Slider
function PremiumSlider({
    value,
    onChange,
    min,
    max,
    label,
    icon: Icon,
}: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const steps = max - min + 1;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-[var(--accent)]" />}
                    <label className="text-sm font-medium">{label}</label>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[var(--accent)]">{value}</span>
                    <span className="text-sm text-[var(--text-muted)]">/ {max}</span>
                </div>
            </div>

            {/* Segmented slider */}
            <div className="relative">
                <div className="flex gap-1">
                    {Array.from({ length: steps }, (_, i) => {
                        const stepValue = min + i;
                        const isActive = stepValue <= value;
                        return (
                            <motion.button
                                key={i}
                                type="button"
                                onClick={() => onChange(stepValue)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 h-3 rounded-full transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-r from-[var(--accent)] to-amber-500 shadow-[0_0_10px_rgba(212,165,116,0.5)]"
                                    : "bg-[var(--bg-primary)] hover:bg-[var(--border)]"
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-3">
                <span>Low</span>
                <span>Critical</span>
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-2">
                Evidence below this threshold will not be considered for bounty. This value is encrypted on-chain.
            </p>
        </div>
    );
}

// Number Stepper Input
function NumberStepper({
    value,
    onChange,
    min,
    max,
    label,
    icon: Icon,
}: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const increment = () => onChange(Math.min(max, value + 1));
    const decrement = () => onChange(Math.max(min, value - 1));

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)]" />}
                <label className="text-sm font-medium">{label}</label>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={decrement}
                    className="w-12 h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]
            flex items-center justify-center hover:border-[var(--accent)] hover:bg-[var(--accent)]/5
            transition-all duration-300"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
                    style={{
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
                        appearance: 'textfield'
                    }}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3
            text-center text-lg font-medium focus:outline-none focus:border-[var(--accent)]
            focus:shadow-[0_0_20px_rgba(212,165,116,0.15)] transition-all duration-300
            [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                    type="button"
                    onClick={increment}
                    className="w-12 h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]
            flex items-center justify-center hover:border-[var(--accent)] hover:bg-[var(--accent)]/5
            transition-all duration-300"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function CreateCampaign() {
    const { address, isConnected } = useAccount();
    const [name, setName] = useState("");
    const [minSeverity, setMinSeverity] = useState(5);
    const [duration, setDuration] = useState(30);
    const [bountyPool, setBountyPool] = useState("0.1");
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { writeContract, data: txHash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!address || !isConnected) {
            setError("Please connect your wallet");
            return;
        }

        if (!name.trim()) {
            setError("Please enter a campaign name");
            return;
        }

        try {
            setIsEncrypting(true);
            const encrypted = await encryptSeverity(BOUNZY_ADDRESS, address, minSeverity);
            setIsEncrypting(false);

            writeContract({
                address: BOUNZY_ADDRESS as `0x${string}`,
                abi: BOUNZY_ABI,
                functionName: "createCampaign",
                args: [encrypted.handle, encrypted.proof, name, BigInt(duration)],
                value: parseEther(bountyPool),
            });
        } catch (err) {
            setIsEncrypting(false);
            setError(err instanceof Error ? err.message : "Encryption failed");
        }
    };

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
                        <p className="section-heading">Compliance Officer</p>
                        <h1 className="text-display-md font-bold mb-2">
                            CREATE <span className="text-[var(--accent)]">CAMPAIGN</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] mb-8">
                            Set up a whistleblower bounty campaign for your organization.
                        </p>
                    </ScrollReveal>

                    {!isConnected ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                                <Lock className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)] mb-6">Connect your wallet to create a campaign</p>
                                <WalletButton showDisconnect={false} />
                            </div>
                        </ScrollReveal>
                    ) : isSuccess ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-12 text-center bg-[var(--bg-secondary)]">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Campaign Created!</h2>
                                <p className="text-[var(--text-secondary)] mb-6">
                                    Your campaign is now active and ready to receive evidence.
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
                                    <Link href="/campaigns" className="btn-primary inline-flex items-center gap-2">
                                        View Campaigns <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <ScrollReveal delay={0.1}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="border border-[var(--border)] rounded-2xl p-8 bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                                    <div className="space-y-8">
                                        <FloatingInput
                                            label="Campaign Name"
                                            value={name}
                                            onChange={setName}
                                            placeholder="e.g., TechCorp Inc. Fraud Reporting"
                                        />

                                        <PremiumSlider
                                            label="Minimum Severity Threshold (1-10)"
                                            value={minSeverity}
                                            onChange={setMinSeverity}
                                            min={1}
                                            max={10}
                                            icon={Lock}
                                        />

                                        <NumberStepper
                                            label="Duration (Days)"
                                            value={duration}
                                            onChange={setDuration}
                                            min={1}
                                            max={365}
                                            icon={Calendar}
                                        />

                                        <FloatingInput
                                            label="Initial Bounty Pool (ETH)"
                                            value={bountyPool}
                                            onChange={setBountyPool}
                                            placeholder="0.1"
                                            type="number"
                                            step="0.01"
                                            icon={Coins}
                                            iconColor="text-[var(--accent)]"
                                        />
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
                                        ? "ENCRYPTING THRESHOLD..."
                                        : isPending
                                            ? "CONFIRM IN WALLET..."
                                            : isConfirming
                                                ? "CREATING CAMPAIGN..."
                                                : "CREATE CAMPAIGN"}
                                </button>
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
