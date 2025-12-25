"use client";

import { motion, Variants } from "framer-motion";

interface StaggerTextProps {
    text: string;
    className?: string;
    highlightLast?: boolean;
    delayStart?: number;
}

export function StaggerText({
    text,
    className = "",
    highlightLast = false,
    delayStart = 0.3,
}: StaggerTextProps) {
    const words = text.split(" ");

    const container: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: delayStart,
            },
        },
    };

    const word: Variants = {
        hidden: {
            y: "100%",
            opacity: 0,
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.span
            variants={container}
            initial="hidden"
            animate="visible"
            className={`inline-flex flex-wrap ${className}`}
        >
            {words.map((w, i) => (
                <span key={i} className="overflow-hidden mr-[0.25em]">
                    <motion.span
                        variants={word}
                        className={`inline-block ${highlightLast && i === words.length - 1
                                ? "text-[var(--accent)]"
                                : ""
                            }`}
                    >
                        {w}
                    </motion.span>
                </span>
            ))}
        </motion.span>
    );
}
