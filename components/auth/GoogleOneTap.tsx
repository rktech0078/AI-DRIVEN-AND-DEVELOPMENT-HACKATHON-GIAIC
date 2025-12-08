"use client";

import { authClient } from "@/lib/auth-client"
import { useEffect } from "react"
import Script from "next/script"

export default function GoogleOneTap() {
    useEffect(() => {
        const checkAndRun = async () => {
            try {
                await authClient.oneTap()
            } catch (e) {
                console.error("GoogleOneTap Error:", e)
            }
        }
        checkAndRun()
    }, [])

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onError={() => {
                console.error("Failed to load Google Identity Services script");
            }}
        />
    )
}
