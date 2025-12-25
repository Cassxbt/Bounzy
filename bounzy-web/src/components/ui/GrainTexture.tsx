"use client";

export function GrainTexture() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[9999]"
            style={{ opacity: "var(--grain-opacity)" }}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-grain animate-grain" />
        </div>
    );
}
