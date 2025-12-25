"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#18181b",
                    color: "#fafafa",
                    border: "1px solid #3f3f46",
                    borderRadius: "12px",
                    padding: "16px",
                },
                success: {
                    iconTheme: {
                        primary: "#eab308",
                        secondary: "#18181b",
                    },
                    style: {
                        border: "1px solid #854d0e",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#18181b",
                    },
                    style: {
                        border: "1px solid #991b1b",
                    },
                },
            }}
        />
    );
}
