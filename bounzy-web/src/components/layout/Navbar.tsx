"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MenuOverlay } from "./MenuOverlay";

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const logo = "BOUNZY".split("");

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex justify-between items-center"
            >
                <Link href="/" className="flex items-center gap-[2px]">
                    {logo.map((letter, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.1 + i * 0.05,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="text-sm font-semibold tracking-ultra text-[var(--text-primary)]"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <motion.button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-xs font-medium tracking-ultra uppercase text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {menuOpen ? "CLOSE" : "MENU"}
                    </motion.button>
                </div>
            </motion.header>

            <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}
