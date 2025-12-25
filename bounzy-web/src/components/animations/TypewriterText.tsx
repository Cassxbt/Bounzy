"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterTextProps {
    phrases: string[];
    className?: string;
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
}

export function TypewriterText({
    phrases,
    className = "",
    typingSpeed = 80,
    deletingSpeed = 40,
    pauseDuration = 2000,
}: TypewriterTextProps) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (currentText.length < currentPhrase.length) {
                    setCurrentText(currentPhrase.slice(0, currentText.length + 1));
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), pauseDuration);
                }
            } else {
                // Deleting
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={`text-[var(--accent)] ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentText}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="inline-block"
                >
                    {currentText}
                </motion.span>
            </AnimatePresence>
            <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block ml-1 w-[2px] h-[1em] bg-[var(--accent)] align-middle"
            />
        </span>
    );
}
