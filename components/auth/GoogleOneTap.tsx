"use client";

import { authClient } from "@/lib/auth-client"
import { useEffect } from "react"
import Script from "next/script"
import { useAuth } from "@/contexts/AuthContext"

export default function GoogleOneTap() {
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            const checkAndRun = async () => {
                try {
                    await authClient.oneTap()
                } catch (e) {
                    console.error("GoogleOneTap Error:", e)
                }
            }
            checkAndRun()
        }
    }, [loading, user])

    if (loading || user) {
        return null
    }

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
