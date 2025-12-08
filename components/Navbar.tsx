"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { useState } from "react"
import { UserNav } from "./UserNav"
import RoboticIcon from "@/components/RoboticIcon"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/contexts/SidebarContext"
import { SearchDialog } from "./SearchDialog"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { openMobile, setOpenMobile } = useSidebar()
    const isDocs = pathname?.startsWith("/docs")

    const handleMobileMenu = () => {
        if (isDocs) {
            setOpenMobile(!openMobile)
        } else {
            setIsOpen(!isOpen)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 group">
                        <div className="text-primary group-hover:scale-110 transition-transform duration-200">
                            <RoboticIcon />
                        </div>
                        <span className="hidden font-bold sm:inline-block">
                            Physical AI
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/docs"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            The AI Book
                        </Link>
                    </nav>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200 md:hidden"
                    onClick={handleMobileMenu}
                >
                    <span className="sr-only">Open main menu</span>
                    {isOpen ? (
                        <X className="h-6 w-6" aria-hidden="true" />
                    ) : (
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    )}
                </button>

                <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
                    <div className="w-full max-w-xl md:w-auto md:flex-none">
                        <SearchDialog />
                    </div>
                    <nav className="flex items-center gap-1.5 sm:gap-2">
                        <Link
                            href="https://github.com/rktech0078/AI-DRIVEN-AND-DEVELOPMENT-HACKATHON-GIAIC"
                            target="_blank"
                            className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                <path d="M9 18c-4.51 2-5-2-7-2" />
                            </svg>
                            <span className="sr-only">GitHub</span>
                        </Link>
                        <ThemeToggle />
                        <UserNav />
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        <Link
                            href="/docs"
                            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            The AI Book
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
