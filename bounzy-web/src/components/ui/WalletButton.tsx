"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Wallet, LogOut, Copy, Check, ExternalLink } from "lucide-react";

interface WalletButtonProps {
    showDisconnect?: boolean;
}

export function WalletButton({ showDisconnect = true }: WalletButtonProps) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const truncatedAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "";

    if (!isConnected) {
        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openConnectModal}
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300
          bg-[var(--accent)] text-white
          hover:shadow-[0_0_20px_rgba(212,165,116,0.3)]
          flex items-center gap-2"
            >
                <Wallet className="w-4 h-4" />
                Connect Wallet
            </motion.button>
        );
    }

    if (!showDisconnect) {
        return null;
    }

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 rounded-xl font-medium transition-all duration-300
          bg-[var(--bg-secondary)] border border-[var(--border)]
          hover:border-[var(--accent)]/50
          flex items-center gap-2"
            >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">{truncatedAddress}</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 z-50 w-64
                bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl
                shadow-xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-600 flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{truncatedAddress}</div>
                                        <div className="text-xs text-[var(--text-muted)]">Connected</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                <button
                                    onClick={handleCopy}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    hover:bg-[var(--bg-primary)] transition-colors text-left"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                                    )}
                                    <span className="text-sm">{copied ? "Copied!" : "Copy Address"}</span>
                                </button>

                                <a
                                    href={`https://sepolia.etherscan.io/address/${address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    hover:bg-[var(--bg-primary)] transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span className="text-sm">View on Etherscan</span>
                                </a>

                                <button
                                    onClick={() => {
                                        disconnect();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    hover:bg-red-500/10 text-red-500 transition-colors mt-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Disconnect</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
