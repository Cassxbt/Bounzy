"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
    className?: string;
    variant?: "text" | "card" | "circle" | "button";
}

export function LoadingSkeleton({
    className = "",
    variant = "text"
}: LoadingSkeletonProps) {
    const baseClasses = "bg-zinc-800 animate-pulse rounded";

    const variantClasses = {
        text: "h-4 w-full",
        card: "h-32 w-full rounded-xl",
        circle: "h-10 w-10 rounded-full",
        button: "h-12 w-32 rounded-lg",
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <LoadingSkeleton className="w-20" />
                    <LoadingSkeleton className="w-32" />
                </div>
                <LoadingSkeleton variant="button" className="w-20 h-6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <LoadingSkeleton className="w-16 h-3" />
                    <LoadingSkeleton className="w-24 h-4" />
                </div>
                <div className="space-y-1">
                    <LoadingSkeleton className="w-16 h-3" />
                    <LoadingSkeleton className="w-24 h-4" />
                </div>
            </div>
            <LoadingSkeleton variant="button" className="w-full" />
        </div>
    );
}

export function StatSkeleton() {
    return (
        <div className="bg-zinc-900/50 border border-yellow-600/20 rounded-xl p-8 text-center space-y-2">
            <LoadingSkeleton className="h-10 w-16 mx-auto" />
            <LoadingSkeleton className="h-4 w-24 mx-auto" />
        </div>
    );
}
