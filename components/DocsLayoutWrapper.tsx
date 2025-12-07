"use client"

import { useSidebar } from "@/contexts/SidebarContext"
import { cn } from "@/lib/utils"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { MobileSidebar } from "@/components/MobileSidebar"

function DocsLayoutContent({
    sidebar,
    children,
}: {
    sidebar: React.ReactNode
    children: React.ReactNode
}) {
    const { isCollapsed, toggleSidebar } = useSidebar()

    return (
        <>
            <MobileSidebar />
            <div
                className={cn(
                    "container flex-1 items-start md:grid md:gap-6 lg:gap-10 transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:grid-cols-[0px_minmax(0,1fr)]" : "md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]"
                )}
            >
                <aside
                    className={cn(
                        "fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden md:sticky md:block transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-0 border-none" : "w-full"
                    )}
                >
                    {/* Render the passed sidebar component */}
                    {/* We need to ensure the width inside doesn't collapse weirdly during transition */}
                    <div className="w-[220px] lg:w-[240px] h-full">
                        {sidebar}
                    </div>
                </aside>

                <main className="relative py-6 lg:gap-10 lg:py-8 lg:grid lg:grid-cols-[1fr_250px] xl:grid-cols-[1fr_300px]">
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "hidden md:inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground z-50 transition-all duration-300 ease-in-out",
                            isCollapsed
                                ? "fixed left-6 top-[4.5rem]" // Fixed when collapsed so it stays on screen
                                : "absolute -left-12 top-0 mt-8" // In gutter when expanded
                        )}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </button>

                    {children}
                </main>
            </div>
        </>
    )
}

export function DocsLayoutWrapper({
    sidebar,
    children,
}: {
    sidebar: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <DocsLayoutContent sidebar={sidebar}>{children}</DocsLayoutContent>
    )
}
