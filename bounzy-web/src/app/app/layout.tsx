"use client";

import { GrainTexture } from "@/components/ui/GrainTexture";
import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <GrainTexture />
            <Navbar />
            <main className="pt-20">{children}</main>
        </>
    );
}
