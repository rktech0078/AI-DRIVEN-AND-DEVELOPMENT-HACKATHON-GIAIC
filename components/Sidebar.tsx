"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

// import { docsConfig } from "@/config/docs"
// Using inline data for valid compilation if config is not fully populated yet,
// but we will import it.
import { docsConfig } from "@/config/docs"
import { useSidebar } from "@/contexts/SidebarContext"

interface SidebarProps {
    mobile?: boolean
}

export function Sidebar({ mobile }: SidebarProps) {
    const pathname = usePathname()
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
    const { setOpenMobile } = useSidebar()

    const toggleSection = (title: string) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }

    // Initialize only the first section as open by default
    useEffect(() => {
        const initialState: Record<string, boolean> = {}
        docsConfig.forEach((item, index) => {
            initialState[item.title] = index === 0
        })
        setOpenSections(initialState)
    }, [])

    if (mobile) {
        return (
            <div className="h-full pb-20">
                {docsConfig.map((item, index) => (
                    <div key={index} className="pb-4">
                        <button
                            onClick={() => toggleSection(item.title)}
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-muted/50 mb-1 group transition-colors"
                        >
                            <span className="truncate">{item.title}</span>
                            {item.items?.length ? (
                                <ChevronRight
                                    className={cn(
                                        "h-4 w-4 text-muted-foreground/70 transition-transform duration-200",
                                        openSections[item.title] && "rotate-90"
                                    )}
                                />
                            ) : null}
                        </button>

                        {item.items?.length && (
                            <AnimatePresence initial={false}>
                                {openSections[item.title] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-flow-row auto-rows-max text-sm pl-3 border-l-[1.5px] border-border/40 ml-2.5 space-y-0.5 mt-0.5">
                                            {item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className={cn(
                                                        "group flex w-full items-center rounded-r-md border-l-2 border-transparent -ml-[1.5px] pl-3 py-1.5 hover:text-foreground transition-all",
                                                        subItem.disabled && "cursor-not-allowed opacity-60",
                                                        pathname === subItem.href
                                                            ? "font-medium text-primary border-primary bg-primary/5"
                                                            : "text-muted-foreground hover:border-border/60"
                                                    )}
                                                    onClick={() => mobile && setOpenMobile(false)}
                                                >
                                                    {subItem.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                ))
                }
            </div >
        )
    }

    return (
        <div className="h-full overflow-y-auto py-6 pr-6 lg:py-8">
            {docsConfig.map((item, index) => (
                <div key={index} className="pb-4">
                    <button
                        onClick={() => toggleSection(item.title)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-muted/50 mb-1 group transition-colors"
                    >
                        <span className="truncate">{item.title}</span>
                        {item.items?.length ? (
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 text-muted-foreground/70 transition-transform duration-200",
                                    openSections[item.title] && "rotate-90"
                                )}
                            />
                        ) : null}
                    </button>

                    {item.items?.length && (
                        <AnimatePresence initial={false}>
                            {openSections[item.title] && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-flow-row auto-rows-max text-sm pl-3 border-l-[1.5px] border-border/40 ml-2.5 space-y-0.5 mt-0.5">
                                        {item.items.map((subItem) => (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                className={cn(
                                                    "group flex w-full items-center rounded-r-md border-l-2 border-transparent -ml-[1.5px] pl-3 py-1.5 hover:text-foreground transition-all",
                                                    subItem.disabled && "cursor-not-allowed opacity-60",
                                                    pathname === subItem.href
                                                        ? "font-medium text-primary border-primary bg-primary/5"
                                                        : "text-muted-foreground hover:border-border/60"
                                                )}
                                            >
                                                {subItem.title}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            ))}
        </div>
    )
}
