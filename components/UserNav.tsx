
'use client'

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut, User as UserIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export function UserNav() {
    const { user, loading, signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
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
                >
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-emerald-500/20 bg-muted hover:border-emerald-500 transition-colors">
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <UserIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-2 py-1.5 text-sm border-b border-border/50 mb-1">
                            {/* @ts-expect-error - username is an additional field in better-auth */}
                            {user.username && (
                                <p className="font-semibold text-foreground truncate max-w-[170px]">
                                    {/* @ts-expect-error - username is an additional field */}
                                    {user.username}
                                </p>
                            )}
                            <p className={cn("text-muted-foreground truncate max-w-[170px]",
                                /* @ts-expect-error - username is an additional field */
                                user.username ? "text-xs font-normal" : "font-semibold text-foreground")}>
                                {user.email}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                )}
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


