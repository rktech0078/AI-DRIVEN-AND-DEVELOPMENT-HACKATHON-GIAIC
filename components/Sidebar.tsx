"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

import { docsConfig } from "@/config/docs"
import { useSidebar } from "@/contexts/SidebarContext"

interface SidebarProps {
    mobile?: boolean
}

// Helper to shorten titles as requested
const formatTitle = (title: string) => {
    if (title.includes(":")) {
        const parts = title.split(":")
        const prefix = parts[0].trim()
        // Only truncate if it's a Section or Chapter to preserve other titles
        if (prefix.startsWith("Section") || prefix.startsWith("Chapter")) {
            return prefix
        }
    }
    return title
}

export function Sidebar({ mobile }: SidebarProps) {
    const pathname = usePathname()
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
    const { setOpenMobile } = useSidebar()
    const [activeTab, setActiveTab] = useState<"sections" | "chapters">("sections")

    const toggleSection = (title: string) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }

    useEffect(() => {
        const initialState: Record<string, boolean> = {}
        let hasActive = false
        docsConfig.forEach((item) => {
            const isActive = item.items.some(sub => sub.href === pathname) || pathname.startsWith(item.items[0]?.href.split('/').slice(0, 3).join('/'))
            if (isActive) {
                initialState[item.title] = true
                hasActive = true
            } else {
                initialState[item.title] = false
            }
        })

        if (!hasActive && docsConfig.length > 0) {
            initialState[docsConfig[0].title] = true
        }

        setOpenSections(initialState)
    }, [pathname])

    // Flatten all chapters for the "Chapters" tab
    const allChapters = useMemo(() => {
        return docsConfig.flatMap(section => section.items)
    }, [])

    return (
        <div className={cn("h-full flex flex-col", mobile ? "pb-20" : "py-6 lg:py-8 pr-4")}>
            {/* Top Tabs */}
            <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-0 mb-6 px-2">
                <button
                    onClick={() => setActiveTab("sections")}
                    className={cn(
                        "pb-3 text-sm font-medium transition-all relative",
                        activeTab === "sections"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                >
                    Sections
                    {activeTab === "sections" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-zinc-900 dark:bg-white"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("chapters")}
                    className={cn(
                        "pb-3 text-sm font-medium transition-all relative",
                        activeTab === "chapters"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                >
                    Chapters
                    {activeTab === "chapters" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-zinc-900 dark:bg-white"
                        />
                    )}
                </button>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto space-y-1">
                {activeTab === "sections" ? (
                    docsConfig.map((item, index) => (
                        <div key={index} className="px-1 mb-2">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(item.title)}
                                className="flex w-full items-center justify-between py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 group transition-colors hover:opacity-80"
                            >
                                <span className="truncate">{formatTitle(item.title)}</span>
                                {item.items?.length ? (
                                    <ChevronRight
                                        className={cn(
                                            "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                                            openSections[item.title] && "rotate-90"
                                        )}
                                    />
                                ) : null}
                            </button>

                            {/* Section Items */}
                            {item.items?.length && (
                                <AnimatePresence initial={false}>
                                    {openSections[item.title] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-1 flex flex-col border-l border-zinc-200 dark:border-zinc-800 ml-1.5 pl-3 py-1 space-y-0.5">
                                                {item.items.map((subItem) => (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "relative group flex w-full items-center rounded-md px-2.5 py-1.5 text-[13px] transition-all",
                                                            subItem.disabled && "cursor-not-allowed opacity-60",
                                                            pathname === subItem.href
                                                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium"
                                                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                        )}
                                                        onClick={() => mobile && setOpenMobile(false)}
                                                    >
                                                        {formatTitle(subItem.title)}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="px-1 space-y-0.5">
                        {allChapters.map((chapter) => (
                            <Link
                                key={chapter.href}
                                href={chapter.href}
                                className={cn(
                                    "block w-full rounded-md px-2.5 py-2 text-sm transition-all",
                                    pathname === chapter.href
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium"
                                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                                onClick={() => mobile && setOpenMobile(false)}
                            >
                                {formatTitle(chapter.title)}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
