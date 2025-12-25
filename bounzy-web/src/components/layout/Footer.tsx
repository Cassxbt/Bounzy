"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { useState, useEffect } from "react";

// Custom X (Twitter) Icon matching the app's style
function XIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

// Custom GitHub Icon matching the app's style
function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
        </svg>
    );
}

// Interactive BOUNZY logo with per-letter hover effect
function InteractiveLogo() {
    const letters = "BOUNZY".split("");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Detect theme changes
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute("data-theme");
            setIsDarkMode(theme === "dark");
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"]
        });

        return () => observer.disconnect();
    }, []);

    // Different colors for light/dark mode
    const accentColor = isDarkMode ? "#d4762b" : "#944b14";

    return (
        <h2 className="text-display-lg font-bold mb-4 flex justify-center gap-1">
            {letters.map((letter, i) => {
                const isHovered = hoveredIndex === i;
                return (
                    <motion.span
                        key={i}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        animate={{
                            color: isHovered ? accentColor : "transparent",
                            textShadow: isHovered
                                ? `0 0 10px ${accentColor}, 0 0 20px ${accentColor}, 0 0 30px ${accentColor}`
                                : "none",
                            scale: isHovered ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            WebkitTextFillColor: isHovered ? accentColor : "transparent",
                            WebkitTextStroke: isHovered
                                ? `2px ${accentColor}`
                                : "1px var(--text-primary)",
                            cursor: "default",
                        }}
                        className="inline-block"
                    >
                        {letter}
                    </motion.span>
                );
            })}
        </h2>
    );
}

export function Footer() {
    return (
        <footer className="py-16 px-6 border-t border-[var(--border)]">
            <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <InteractiveLogo />
                        <p className="text-[var(--text-secondary)]">Built with Zama FHEVM</p>
                    </div>
                </ScrollReveal>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-[var(--border)]">
                    <div className="flex gap-8">
                        <Link href="/campaigns" className="nav-link">Campaigns</Link>
                        <Link href="/app" className="nav-link">Launch App</Link>
                        <Link href="/about" className="nav-link">About</Link>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-6">
                        <motion.a
                            href="https://x.com/cassxbt"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1, color: "var(--accent)" }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
                            aria-label="Follow on X (Twitter)"
                        >
                            <XIcon className="w-5 h-5" />
                        </motion.a>
                        <motion.a
                            href="https://github.com/cassxbt"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1, color: "var(--accent)" }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
                            aria-label="View on GitHub"
                        >
                            <GitHubIcon className="w-5 h-5" />
                        </motion.a>
                    </div>

                    <p className="text-xs text-[var(--text-muted)]">
                        © 2026 Bounzy. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
