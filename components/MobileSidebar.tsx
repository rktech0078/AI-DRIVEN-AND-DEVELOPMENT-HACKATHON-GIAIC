"use client"

import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import Link from "next/link"

import { useSidebar } from "@/contexts/SidebarContext"

export function MobileSidebar() {
    const { openMobile, setOpenMobile } = useSidebar()

    return (
        <div className="md:hidden">
            <AnimatePresence>
                {openMobile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpenMobile(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-[300px] border-r border-border bg-background p-6 shadow-xl overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-lg font-bold">Documentation</span>
                                <button
                                    onClick={() => setOpenMobile(false)}
                                    className="rounded-sm p-1 hover:bg-muted"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6 border-b border-border/40 pb-4">
                                <nav className="grid gap-2 px-2">
                                    <Link
                                        href="/"
                                        className="text-sm font-medium hover:text-primary py-2"
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/docs"
                                        className="text-sm font-medium hover:text-primary py-2"
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        The AI Book
                                    </Link>
                                    <Link
                                        href="https://github.com/panaversity/physical-ai-hackathon"
                                        target="_blank"
                                        className="text-sm font-medium hover:text-primary py-2"
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        GitHub
                                    </Link>
                                </nav>
                            </div>

                            <div className="h-full">
                                <Sidebar mobile />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
