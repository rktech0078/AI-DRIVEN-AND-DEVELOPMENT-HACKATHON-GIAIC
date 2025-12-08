
'use client'

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut, User as UserIcon, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export function UserNav() {
    const { user, loading, signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await signOut()
        } catch (error) {
            console.error("Sign out failed", error)
            setIsSigningOut(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            </div>
        )
    }

    if (user) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    disabled={isSigningOut}
                >
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-emerald-500/20 bg-muted hover:border-emerald-500 transition-colors">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "User avatar"}
                                width={36}
                                height={36}
                                className="h-full w-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-gradient-to-br from-emerald-500/10 to-transparent">
                                <UserIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        )}
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-2 py-1.5 text-sm border-b border-border/50 mb-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((user as any).username || user.name) && (
                                <p className="font-semibold text-foreground truncate max-w-[170px]">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(user as any).username || user.name}
                                </p>
                            )}
                            <p className={cn("text-muted-foreground truncate max-w-[170px]",
                                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                ((user as any).username || user.name) ? "text-xs font-normal" : "font-semibold text-foreground")}>
                                {user.email}
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSigningOut ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                            {isSigningOut ? "Signing out..." : "Sign Out"}
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <Link
                href="/auth/login"
                className="hidden sm:inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                Login
            </Link>
            <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 shadow transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap"
            >
                Sign Up
            </Link>
        </div>
    )
}


