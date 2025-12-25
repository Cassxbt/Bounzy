"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("bounzy-theme") as "light" | "dark" | null;
        if (stored) {
            setTheme(stored);
            document.documentElement.setAttribute("data-theme", stored);
        }
    }, []);

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("bounzy-theme", next);
        document.documentElement.setAttribute("data-theme", next);
    };

    if (!mounted) return null;

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 hover:bg-[var(--border)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === "light" ? 0 : 180, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                {theme === "light" ? (
                    <Moon className="w-5 h-5 text-[var(--text-primary)]" />
                ) : (
                    <Sun className="w-5 h-5 text-[var(--text-primary)]" />
                )}
            </motion.div>
        </motion.button>
    );
}
