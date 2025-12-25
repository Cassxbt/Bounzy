"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface MenuOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuLinks = [
    { label: "HOME", href: "/" },
    { label: "LAUNCH APP", href: "/app" },
    { label: "CAMPAIGNS", href: "/campaigns" },
    { label: "ABOUT", href: "/about" },
];

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const overlay: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const container: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2,
            },
        },
        exit: {
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    };

    const item: Variants = {
        hidden: { y: 80, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
        exit: {
            y: -40,
            opacity: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={overlay}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-40 bg-alba-chocolate flex items-center justify-center"
                >
                    <motion.nav
                        variants={container}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col items-center gap-6"
                    >
                        {menuLinks.map((link) => (
                            <motion.div key={link.label} variants={item} className="overflow-hidden">
                                <Link
                                    href={link.href}
                                    onClick={onClose}
                                    className="group flex items-center gap-3 text-display-md font-bold text-alba-beige hover:text-alba-orange transition-colors duration-300"
                                >
                                    <span>{link.label}</span>
                                    <ArrowUpRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.nav>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="absolute bottom-8 left-0 right-0 text-center"
                    >
                        <p className="text-alba-silver text-sm tracking-wide-custom uppercase">
                            Privacy-First Whistleblower Platform
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
