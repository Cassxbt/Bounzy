import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Bounzy - Speak Freely. Stay Hidden.",
  description: "Privacy-preserving whistleblower bounty platform powered by FHE encryption",
  keywords: ["whistleblower", "privacy", "FHE", "encryption", "bounty", "anonymous"],
  openGraph: {
    title: "Bounzy - Anonymous Whistleblower Platform",
    description: "Report corporate fraud with complete privacy using Fully Homomorphic Encryption",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-inter antialiased">
        <Providers>
          <ToastProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
