"use client";

import React from "react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function AnimatedCard({
    children,
    className = "",
    delay = 0
}: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                duration: 0.3,
                delay,
                ease: "easeOut"
            }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function FadeIn({
    children,
    className = "",
    delay = 0
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface SlideInProps {
    children: ReactNode;
    className?: string;
    direction?: "left" | "right" | "up" | "down";
    delay?: number;
}

export function SlideIn({
    children,
    className = "",
    direction = "up",
    delay = 0
}: SlideInProps) {
    const directionOffset = {
        left: { x: -30, y: 0 },
        right: { x: 30, y: 0 },
        up: { x: 0, y: 30 },
        down: { x: 0, y: -30 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directionOffset[direction]
            }}
            animate={{
                opacity: 1,
                x: 0,
                y: 0
            }}
            transition={{
                duration: 0.4,
                delay,
                ease: "easeOut"
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function PulseOnSuccess({
    children,
    trigger,
    className = ""
}: {
    children: ReactNode;
    trigger: boolean;
    className?: string;
}) {
    return (
        <motion.div
            animate={trigger ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                    "0 0 0 0 rgba(234, 179, 8, 0)",
                    "0 0 0 10px rgba(234, 179, 8, 0.3)",
                    "0 0 0 0 rgba(234, 179, 8, 0)"
                ]
            } : {}}
            transition={{ duration: 0.5 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === ELITE COMPONENTS ===

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
    borderColor?: string;
}

export function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(212, 165, 116, 0.15)",
    borderColor = "var(--border)"
}: SpotlightCardProps) {
    const divRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = React.useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-2xl border bg-[var(--bg-secondary)]/60 backdrop-blur-md ${className}`}
            style={{ borderColor }}
        >
            {/* Spotlight gradient */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`
                }}
            />
            {/* Content */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

interface StatusGlowCardProps {
    children: ReactNode;
    status: "pending" | "validated" | "declined" | "submitted";
    className?: string;
}

export function StatusGlowCard({ children, status, className = "" }: StatusGlowCardProps) {
    const glowColors: Record<string, { border: string; glow: string; spotlight: string }> = {
        pending: {
            border: "rgb(245, 158, 11)",
            glow: "rgba(245, 158, 11, 0.2)",
            spotlight: "rgba(245, 158, 11, 0.1)"
        },
        validated: {
            border: "rgb(34, 197, 94)",
            glow: "rgba(34, 197, 94, 0.2)",
            spotlight: "rgba(34, 197, 94, 0.1)"
        },
        declined: {
            border: "rgb(239, 68, 68)",
            glow: "rgba(239, 68, 68, 0.2)",
            spotlight: "rgba(239, 68, 68, 0.1)"
        },
        submitted: {
            border: "rgb(212, 165, 116)",
            glow: "rgba(212, 165, 116, 0.15)",
            spotlight: "rgba(212, 165, 116, 0.08)"
        }
    };

    const colors = glowColors[status] || glowColors.submitted;

    return (
        <SpotlightCard
            className={className}
            spotlightColor={colors.spotlight}
            borderColor={colors.border}
        >
            <motion.div
                initial={{ boxShadow: `0 0 0 0 ${colors.glow}` }}
                animate={{ boxShadow: `0 0 30px 0 ${colors.glow}` }}
                transition={{ duration: 0.5 }}
                className="h-full"
            >
                {children}
            </motion.div>
        </SpotlightCard>
    );
}

// === FLIP CARD ===

interface FlipCardProps {
    front: ReactNode;
    back: ReactNode;
    className?: string;
    accentColor?: string;
}

export function FlipCard({ front, back, className = "", accentColor = "var(--accent)" }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = React.useState(false);

    return (
        <div
            className={`group perspective-1000 ${className}`}
            style={{ perspective: "1000px" }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl border bg-[var(--bg-secondary)]/80 backdrop-blur-md overflow-hidden"
                    style={{
                        backfaceVisibility: "hidden",
                        borderColor: "var(--border)",
                        borderLeftColor: accentColor,
                        borderLeftWidth: "3px"
                    }}
                >
                    {front}
                </div>
                {/* Back */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl border bg-[var(--bg-secondary)]/90 backdrop-blur-md overflow-hidden"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderColor: accentColor
                    }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
}

// === SEGMENTED SLIDER ===

interface SegmentedSliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

export function SegmentedSlider({
    value,
    onChange,
    min = 1,
    max = 10,
    className = ""
}: SegmentedSliderProps) {
    const segments = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    const getSegmentColor = (segment: number) => {
        if (segment > value) return "bg-[var(--border)]/50";
        if (segment <= 3) return "bg-green-500";
        if (segment <= 6) return "bg-amber-500";
        return "bg-red-500";
    };

    const getGlowColor = () => {
        if (value <= 3) return "rgba(34, 197, 94, 0.4)";
        if (value <= 6) return "rgba(245, 158, 11, 0.4)";
        return "rgba(239, 68, 68, 0.4)";
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex gap-1">
                {segments.map((segment) => (
                    <motion.button
                        key={segment}
                        type="button"
                        onClick={() => onChange(segment)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 h-8 rounded-md transition-all duration-200 ${getSegmentColor(segment)}`}
                        style={{
                            boxShadow: segment === value ? `0 0 12px ${getGlowColor()}` : "none"
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">Minor (1)</span>
                <motion.span
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-2xl font-bold ${value <= 3 ? "text-green-500" :
                        value <= 6 ? "text-amber-500" : "text-red-500"
                        }`}
                >
                    {value}
                </motion.span>
                <span className="text-xs text-[var(--text-muted)]">Critical (10)</span>
            </div>
        </div>
    );
}

// === OUTLINE BUTTON ===

interface OutlineButtonProps {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant: "success" | "danger";
    className?: string;
    icon?: ReactNode;
}

export function OutlineButton({
    children,
    onClick,
    disabled = false,
    variant,
    className = "",
    icon
}: OutlineButtonProps) {
    const colors = {
        success: {
            border: "border-green-500/50",
            hoverBg: "hover:bg-green-500/10",
            text: "text-green-500",
            glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        },
        danger: {
            border: "border-red-500/50",
            hoverBg: "hover:bg-red-500/10",
            text: "text-red-500",
            glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        }
    };

    const c = colors[variant];

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                flex-1 py-2.5 px-4 rounded-xl font-medium
                border ${c.border} ${c.text} ${c.hoverBg} ${c.glow}
                transition-all duration-300 disabled:opacity-50
                flex items-center justify-center gap-2
                ${className}
            `}
        >
            {icon}
            {children}
        </motion.button>
    );
}
