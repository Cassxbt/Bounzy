"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface LoadingScreenProps {
    onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const logo = "BOUNZY".split("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, 2200);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const container: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.3,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const letter: Variants = {
        hidden: { y: 40, opacity: 0 },
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
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-[100] bg-alba-chocolate flex items-center justify-center"
                >
                    <div className="flex items-center gap-1">
                        {logo.map((char, i) => (
                            <motion.span
                                key={i}
                                variants={letter}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: i * 0.08 }}
                                className="text-display-lg font-bold text-alba-beige tracking-ultra"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </div>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
                        className="absolute bottom-[40%] left-1/2 -translate-x-1/2 w-24 h-[1px] bg-alba-beige/30 origin-left"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
