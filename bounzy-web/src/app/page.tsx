"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Eye, Lock, UserCheck, Fingerprint, Zap, ShieldCheck } from "lucide-react";
import { StaggerText } from "@/components/animations/StaggerText";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { TypewriterText } from "@/components/animations/TypewriterText";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useReadContract } from "wagmi";
import { BOUNZY_ADDRESS, BOUNZY_ABI } from "@/utils/contract";

const howItWorks = [
    {
        step: "01",
        title: "Create Campaign",
        description: "Compliance officers set up bounty pools with encrypted thresholds",
        icon: Shield,
    },
    {
        step: "02",
        title: "Submit Evidence",
        description: "Whistleblowers submit encrypted evidence from anonymous wallets",
        icon: Lock,
    },
    {
        step: "03",
        title: "Validate",
        description: "Officers review evidence without ever seeing identities",
        icon: Eye,
    },
    {
        step: "04",
        title: "Claim Bounty",
        description: "Validated whistleblowers claim rewards completely anonymously",
        icon: Zap,
    },
];

const privacyFeatures = [
    {
        icon: Lock,
        title: "FHE Encryption",
        description: "All evidence encrypted client-side using Zama FHEVM. Only encrypted data visible on-chain.",
    },
    {
        icon: Fingerprint,
        title: "Anonymous Wallets",
        description: "Use burner wallets for complete sender anonymity. Even the blockchain cannot link you.",
    },
    {
        icon: UserCheck,
        title: "On-Chain Validation",
        description: "Evidence validated using homomorphic comparisons. Validators see severity, never identity.",
    },
];

export default function LandingPage() {
    const [isLoading, setIsLoading] = useState(true);

    const { data: campaignCount } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "campaignCounter",
    });

    const { data: evidenceCount } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "evidenceCounter",
    });

    return (
        <>
            <LoadingScreen onComplete={() => setIsLoading(false)} />

            {!isLoading && (
                <>
                    <GrainTexture />
                    <Navbar />

                    <div className="min-h-screen">
                        <section className="min-h-screen flex flex-col justify-center items-center px-6 pt-24 pb-16">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="text-center max-w-5xl mx-auto"
                            >
                                <p className="section-heading mb-6">
                                    <TypewriterText
                                        phrases={[
                                            "PRIVACY-FIRST WHISTLEBLOWING",
                                            "DID YOU FIND SOMETHING?",
                                            "DO YOU WANT TO REPORT SOMETHING?",
                                            "SHHHH... SPILL IT, NO ONE KNOWS."
                                        ]}
                                    />
                                </p>

                                <h1 className="text-display-xl font-bold mb-8">
                                    <StaggerText text="SPEAK FREELY." delayStart={0.6} />
                                    <br />
                                    <StaggerText text="STAY HIDDEN." highlightLast delayStart={0.9} />
                                </h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12"
                                >
                                    Report corporate fraud with complete privacy. Your evidence is encrypted
                                    using Fully Homomorphic Encryption — even validators cannot see who you are.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex justify-center"
                                >
                                    <Link href="/app" className="btn-primary inline-flex items-center gap-2 group">
                                        Launch App
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 2 }}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                            >
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-10 h-10 border-2 border-[var(--text-muted)] rounded-full flex items-center justify-center"
                                >
                                    <ShieldCheck className="w-5 h-5 text-[var(--text-muted)]" />
                                </motion.div>
                            </motion.div>
                        </section>

                        <section id="how-it-works" className="py-24 px-6">
                            <div className="max-w-6xl mx-auto">
                                <ScrollReveal>
                                    <p className="section-heading text-center">Process</p>
                                    <h2 className="text-display-md font-bold text-center mb-16">
                                        HOW IT <span className="text-[var(--accent)]">WORKS</span>
                                    </h2>
                                </ScrollReveal>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {howItWorks.map((item, i) => (
                                        <ScrollReveal key={item.step} delay={i * 0.1}>
                                            <div className="group h-full min-h-[200px] p-8 border border-[var(--border)] rounded-2xl card-hover bg-[var(--bg-secondary)] flex flex-col">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <span className="text-4xl font-bold text-[var(--accent)]">{item.step}</span>
                                                    <item.icon className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-300" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                                                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="privacy" className="py-24 px-6 bg-[var(--bg-secondary)]">
                            <div className="max-w-6xl mx-auto">
                                <ScrollReveal>
                                    <p className="section-heading text-center">Technology</p>
                                    <h2 className="text-display-md font-bold text-center mb-16">
                                        PRIVACY <span className="text-[var(--accent)]">GUARANTEES</span>
                                    </h2>
                                </ScrollReveal>

                                <div className="grid md:grid-cols-3 gap-8">
                                    {privacyFeatures.map((feature, i) => (
                                        <ScrollReveal key={feature.title} delay={i * 0.15}>
                                            <div className="p-8 border border-[var(--border)] rounded-2xl card-hover bg-[var(--bg-primary)]">
                                                <feature.icon className="w-10 h-10 text-[var(--accent)] mb-6" />
                                                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                                                <p className="text-[var(--text-secondary)]">{feature.description}</p>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="stats" className="py-24 px-6">
                            <div className="max-w-6xl mx-auto">
                                <ScrollReveal>
                                    <div className="grid md:grid-cols-3 gap-8 text-center">
                                        <div className="p-8">
                                            <div className="text-display-lg font-bold text-[var(--accent)] mb-2">
                                                <AnimatedCounter end={Number(campaignCount) || 0} />
                                            </div>
                                            <p className="text-[var(--text-secondary)] uppercase tracking-wide-custom text-sm">Active Campaigns</p>
                                        </div>
                                        <div className="p-8">
                                            <div className="text-display-lg font-bold text-[var(--accent)] mb-2">
                                                <AnimatedCounter end={Number(evidenceCount) || 0} />
                                            </div>
                                            <p className="text-[var(--text-secondary)] uppercase tracking-wide-custom text-sm">Evidence Submitted</p>
                                        </div>
                                        <div className="p-8">
                                            <div className="text-display-lg font-bold text-[var(--accent)] mb-2">
                                                100<span className="text-[var(--text-primary)]">%</span>
                                            </div>
                                            <p className="text-[var(--text-secondary)] uppercase tracking-wide-custom text-sm">Privacy Protected</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </section>

                        <Footer />
                    </div>
                </>
            )}
        </>
    );
}
