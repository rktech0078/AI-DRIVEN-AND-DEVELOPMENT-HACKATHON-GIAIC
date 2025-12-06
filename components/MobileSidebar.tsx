"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"

export function MobileSidebar() {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden">
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
            >
                <Menu className="h-4 w-4" />
                <span>Menu</span>
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
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
                                    onClick={() => setOpen(false)}
                                    className="rounded-sm p-1 hover:bg-muted"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="h-full">
                                {/* We render Sidebar but utilize a wrapper to override hidden classes if needed, 
                                    though Sidebar has 'hidden md:block'. We can clone it or just re-import functionality. 
                                    Actually, reusing Sidebar directly inside here might inherit 'hidden'. 
                                    Looking at Sidebar.tsx: <aside className="... hidden ... md:block">
                                    I will need to refactor Sidebar to separate the list from the container, OR 
                                    just force the style. But overriding 'hidden' with a parent div usually doesn't work if it's on the element itself. 
                                    I should modify Sidebar.tsx to accept a className prop to override default visibility. */}
                                <Sidebar mobile />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
