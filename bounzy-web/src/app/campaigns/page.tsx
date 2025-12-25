"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { BOUNZY_ADDRESS, BOUNZY_ABI } from "@/utils/contract";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GrainTexture } from "@/components/ui/GrainTexture";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Calendar, Users, Coins, ArrowRight } from "lucide-react";
import { useRef } from "react";

function CampaignCard({ campaignId }: { campaignId: number }) {
    const { data } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "getCampaign",
        args: [campaignId],
    });

    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseYSpring = useSpring(y, { stiffness: 500, damping: 50 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) / rect.width);
        y.set((e.clientY - centerY) / rect.height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    if (!data) return null;

    const [owner, name, bountyPool, expiryDate, evidenceCount, active] = data;
    const expiryDateObj = new Date(Number(expiryDate) * 1000);
    const isExpired = expiryDateObj < new Date();

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{
                z: 50,
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(212, 165, 116, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`group h-full p-6 border rounded-2xl 
        bg-[var(--bg-secondary)]/80 backdrop-blur-sm
        transition-colors duration-300 cursor-default
        ${active && !isExpired ? "border-[var(--accent)]/30 hover:border-[var(--accent)]/60" : "border-[var(--border)] hover:border-[var(--border)]"}`}
        >
            <div style={{ transform: "translateZ(30px)" }} className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide-custom">Campaign #{campaignId}</span>
                        <h3 className="text-lg font-semibold mt-1 line-clamp-2">&ldquo;{name}&rdquo;</h3>
                    </div>
                    <span
                        className={`ml-3 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide flex-shrink-0 ${active && !isExpired
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]"
                            }`}
                    >
                        {active && !isExpired ? "Active" : isExpired ? "Expired" : "Inactive"}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span className="text-xs text-[var(--text-muted)]">Bounty</span>
                        </div>
                        <span className="font-semibold text-[var(--accent)]">{formatEther(bountyPool)} ETH</span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">Evidence</span>
                        </div>
                        <span className="font-semibold">{evidenceCount.toString()}</span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">Expires</span>
                        </div>
                        <span className="text-sm">{expiryDateObj.toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="text-xs text-[var(--text-muted)] mb-4">
                    Owner: {owner.slice(0, 6)}...{owner.slice(-4)}
                </div>

                <div className="mt-auto">
                    {active && !isExpired && (
                        <Link href={`/submit-evidence?campaign=${campaignId}`} className="flex items-center justify-center gap-2 w-full btn-primary group/btn">
                            Submit Evidence
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function Campaigns() {
    const { data: campaignCount } = useReadContract({
        address: BOUNZY_ADDRESS as `0x${string}`,
        abi: BOUNZY_ABI,
        functionName: "campaignCounter",
    });

    const allCampaignIds = campaignCount ? Array.from({ length: Number(campaignCount) }, (_, i) => i + 1) : [];

    return (
        <>
            <GrainTexture />
            <Navbar />
            <main className="min-h-screen pt-24 px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                            <div>
                                <p className="section-heading">Browse</p>
                                <h1 className="text-display-md font-bold">
                                    ALL <span className="text-[var(--accent)]">CAMPAIGNS</span>
                                </h1>
                                <p className="text-[var(--text-secondary)] mt-2">Browse active whistleblower bounty campaigns</p>
                            </div>
                            <Link href="/create-campaign" className="btn-primary inline-flex items-center gap-2">
                                Create Campaign
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </ScrollReveal>

                    {allCampaignIds.length === 0 ? (
                        <ScrollReveal delay={0.1}>
                            <div className="border border-[var(--border)] rounded-2xl p-16 text-center bg-[var(--bg-secondary)]">
                                <p className="text-[var(--text-secondary)] mb-4">No campaigns yet</p>
                                <Link href="/create-campaign" className="text-[var(--accent)] hover:underline">
                                    Create the first campaign
                                </Link>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1000px" }}>
                            {allCampaignIds.map((id, i) => (
                                <ScrollReveal key={id} delay={i * 0.05}>
                                    <CampaignCard campaignId={id} />
                                </ScrollReveal>
                            ))}
                        </div>
                    )}

                    <ScrollReveal delay={0.3}>
                        <div className="text-center mt-16">
                            <Link href="/app" className="nav-link">
                                ← Back to App
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </main>

            <Footer />
        </>
    );
}
