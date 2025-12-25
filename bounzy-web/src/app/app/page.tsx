"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, UserX, ArrowRight } from "lucide-react";
import { useAccount } from "wagmi";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WalletButton } from "@/components/ui/WalletButton";

const personas = [
    {
        id: "officer",
        title: "Compliance Officer",
        description: "Create campaigns, set bounty pools, and validate submitted evidence.",
        icon: Shield,
        links: [
            { label: "Create Campaign", href: "/create-campaign" },
            { label: "Validator Dashboard", href: "/validator" },
            { label: "View Campaigns", href: "/campaigns" },
        ],
    },
    {
        id: "whistleblower",
        title: "Whistleblower",
        description: "Submit encrypted evidence anonymously and claim bounties when validated.",
        icon: UserX,
        links: [
            { label: "Submit Evidence", href: "/submit-evidence" },
            { label: "My Submissions", href: "/my-submissions" },
            { label: "Browse Campaigns", href: "/campaigns" },
        ],
    },
];

export default function AppPage() {
    const { isConnected } = useAccount();

    return (
        <div className="min-h-screen px-6 py-16">
            <div className="max-w-5xl mx-auto">
                {/* Wallet button positioned top right when connected */}
                {isConnected && (
                    <div className="flex justify-end mb-8">
                        <WalletButton showDisconnect={true} />
                    </div>
                )}

                <ScrollReveal>
                    <div className="text-center mb-16">
                        <p className="section-heading">Select Your Role</p>
                        <h1 className="text-display-md font-bold mb-4">
                            WHO ARE <span className="text-[var(--accent)]">YOU</span>?
                        </h1>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                            Choose your role to access the appropriate features. Your identity remains protected regardless of your choice.
                        </p>
                    </div>
                </ScrollReveal>

                {!isConnected ? (
                    <ScrollReveal delay={0.2}>
                        <div className="relative overflow-hidden border border-[var(--border)] rounded-3xl bg-[var(--bg-secondary)]/80 backdrop-blur-md">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-[var(--accent)]/10" />
                                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
                            </div>

                            {/* Grid pattern overlay */}
                            <div className="absolute inset-0 opacity-5" style={{
                                backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px),
                                  linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }} />

                            <div className="relative z-10 text-center p-16">
                                {/* Wallet icon with glow */}
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-amber-600 mb-6 shadow-[0_0_40px_rgba(212,165,116,0.4)]">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
                                <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                                    Securely connect your wallet to access the platform. Your identity remains protected with FHE encryption.
                                </p>

                                <WalletButton showDisconnect={false} />

                                <p className="text-xs text-[var(--text-muted)] mt-6">
                                    Supports MetaMask, WalletConnect, Coinbase Wallet & more
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {personas.map((persona, i) => (
                            <ScrollReveal key={persona.id} delay={i * 0.15}>
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="group relative p-8 rounded-2xl overflow-hidden
                    bg-[var(--bg-secondary)]/60 backdrop-blur-md
                    border border-[var(--border)]/50
                    hover:border-[var(--accent)]/50
                    hover:shadow-[0_0_40px_rgba(212,165,116,0.15)]
                    transition-all duration-500"
                                >
                                    {/* Animated gradient border effect */}
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-[var(--accent)]/20 via-transparent to-[var(--accent)]/20 animate-pulse" />
                                    </div>

                                    {/* Inner glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-[var(--accent)]/20 group-hover:shadow-[0_0_20px_rgba(212,165,116,0.3)] transition-all duration-300">
                                                <persona.icon className="w-7 h-7 text-[var(--accent)]" />
                                            </div>
                                            <h2 className="text-xl font-bold">{persona.title}</h2>
                                        </div>

                                        <p className="text-[var(--text-secondary)] mb-8">{persona.description}</p>

                                        <div className="space-y-3">
                                            {persona.links.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className="flex items-center justify-between p-4 rounded-xl
                            bg-[var(--bg-primary)]/50 backdrop-blur-sm
                            border border-[var(--border)]/50
                            hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5
                            transition-all duration-300 group/link"
                                                >
                                                    <span className="font-medium">{link.label}</span>
                                                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover/link:text-[var(--accent)] group-hover/link:translate-x-1 transition-all duration-300" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}

                <ScrollReveal delay={0.4}>
                    <div className="text-center mt-16">
                        <Link href="/" className="nav-link">
                            ← Back to Home
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
