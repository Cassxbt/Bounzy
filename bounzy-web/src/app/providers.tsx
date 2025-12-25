"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

// Define Sepolia with multiple fallback RPC endpoints
const sepoliaWithFallbacks = {
    ...sepolia,
    rpcUrls: {
        default: {
            http: [
                "https://ethereum-sepolia-rpc.publicnode.com",
                "https://rpc.sepolia.org",
                "https://sepolia.gateway.tenderly.co",
                "https://1rpc.io/sepolia",
            ],
        },
        public: {
            http: [
                "https://ethereum-sepolia-rpc.publicnode.com",
                "https://rpc.sepolia.org",
                "https://sepolia.gateway.tenderly.co",
                "https://1rpc.io/sepolia",
            ],
        },
    },
};

const config = getDefaultConfig({
    appName: "Bounzy",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
    chains: [sepoliaWithFallbacks],
    ssr: true,
    transports: {
        [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
