"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Fingerprint, Zap, Heart, Code } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerText } from "@/components/animations/StaggerText";

const privacyPrinciples = [
    {
        icon: Lock,
        title: "End-to-End Encryption",
        description: "Your evidence is encrypted on your device before it ever touches the blockchain. Only you control the keys."
    },
    {
        icon: Eye,
        title: "Zero-Knowledge Validation",
        description: "Validators can verify the severity and validity of evidence without ever seeing your identity or the raw content."
    },
    {
        icon: Fingerprint,
        title: "Anonymous by Design",
        description: "Use burner wallets, stay anonymous. The protocol is designed so that even we cannot identify whistleblowers."
    },
    {
        icon: Shield,
        title: "Fully Homomorphic Encryption",
        description: "Powered by Zama's FHEVM, computations happen on encrypted data. Your secrets stay secret, even during processing."
    }
];

const howFHEWorks = [
    {
        step: "01",
        title: "Encrypt Locally",
        description: "Your evidence and identity are encrypted on your device using FHE before submission."
    },
    {
        step: "02",
        title: "Store On-Chain",
        description: "Encrypted data is stored on the blockchain. Even node operators see only ciphertext."
    },
    {
        step: "03",
        title: "Compute Privately",
        description: "Smart contracts perform computations on encrypted data without decryption."
    },
    {
        step: "04",
        title: "Selective Reveal",
        description: "Only validated whistleblowers can decrypt their bounty rewards. Identity stays hidden."
    }
];

export default function AboutPage() {
    return (
        <>
            <GrainTexture />
            <Navbar />

            <main className="min-h-screen pt-24 px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <p className="section-heading mb-6">About Bounzy</p>
                            <h1 className="text-display-md font-bold mb-6">
                                <StaggerText text="PRIVACY IS NOT" delayStart={0.2} />
                                <br />
                                <StaggerText text="A FEATURE." highlightLast delayStart={0.5} />
                            </h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.6 }}
                                className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto"
                            >
                                Bounzy is a privacy-first whistleblower platform built on Fully Homomorphic Encryption.
                                We believe that speaking truth to power should never put you at risk.
                            </motion.p>
                        </div>
                    </ScrollReveal>

                    {/* Mission Statement */}
                    <ScrollReveal delay={0.1}>
                        <div className="border border-[var(--accent)]/30 rounded-2xl p-10 mb-20 bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
                            <div className="flex items-start gap-4 mb-6">
                                <Heart className="w-8 h-8 text-[var(--accent)] flex-shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                                    <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                                        Corporate fraud costs the global economy trillions annually. Whistleblowers are the
                                        first line of defense, yet they face retaliation, job loss, and legal threats.
                                        <span className="text-[var(--text-primary)] font-medium"> Bounzy changes this.</span>
                                    </p>
                                    <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-4">
                                        By leveraging blockchain technology and Fully Homomorphic Encryption, we&apos;ve created
                                        a platform where evidence can be validated and bounties claimed without ever revealing
                                        the whistleblower&apos;s identity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Privacy Principles */}
                    <ScrollReveal delay={0.2}>
                        <div className="mb-20">
                            <p className="section-heading text-center">Core Principles</p>
                            <h2 className="text-display-sm font-bold text-center mb-12">
                                HOW WE <span className="text-[var(--accent)]">PROTECT</span> YOU
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {privacyPrinciples.map((principle, i) => (
                                    <ScrollReveal key={principle.title} delay={0.1 * i}>
                                        <motion.div
                                            whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(212, 165, 116, 0.15)" }}
                                            className="p-8 border border-[var(--border)] rounded-2xl bg-[var(--bg-secondary)]/50 backdrop-blur-sm transition-colors duration-300 hover:border-[var(--accent)]/30"
                                        >
                                            <principle.icon className="w-10 h-10 text-[var(--accent)] mb-4" />
                                            <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                                            <p className="text-[var(--text-secondary)]">{principle.description}</p>
                                        </motion.div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* How FHE Works */}
                    <ScrollReveal delay={0.3}>
                        <div className="mb-20">
                            <p className="section-heading text-center">Technology</p>
                            <h2 className="text-display-sm font-bold text-center mb-4">
                                FHE <span className="text-[var(--accent)]">EXPLAINED</span>
                            </h2>
                            <p className="text-center text-[var(--text-secondary)] max-w-2xl mx-auto mb-12">
                                Fully Homomorphic Encryption allows computations on encrypted data.
                                Think of it as a locked box where operations can be performed without opening it.
                            </p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {howFHEWorks.map((step, i) => (
                                    <ScrollReveal key={step.step} delay={0.1 * i}>
                                        <div className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--bg-secondary)]/30">
                                            <span className="text-3xl font-bold text-[var(--accent)] block mb-3">{step.step}</span>
                                            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                                            <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Built With */}
                    <ScrollReveal delay={0.4}>
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]/50">
                                <Code className="w-5 h-5 text-[var(--accent)]" />
                                <span className="text-sm font-medium">Built with <span className="text-[var(--accent)]">Zama FHEVM</span> on Ethereum</span>
                                <Zap className="w-5 h-5 text-[var(--accent)]" />
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </main>

            <Footer />
        </>
    );
}
