"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut, User as UserIcon } from "lucide-react"

export function UserNav() {
    const { user, loading, signOut } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            </div>
        )
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-muted">
                        {/* We could use user.user_metadata.avatar_url if available, fallback to icon */}
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <UserIcon className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="hidden md:inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                    title="Sign Out"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-4">
            <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                Login
            </Link>
            <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
                Sign Up
            </Link>
        </div>
    )
}

