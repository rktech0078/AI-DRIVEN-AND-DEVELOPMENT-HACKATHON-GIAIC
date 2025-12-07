
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { docsConfig } from "@/config/docs"

interface DocsPagerItem {
    title: string
    href: string
}

export function DocsPager() {
    const pathname = usePathname()

    const pager = getPagerForDoc(pathname)

    if (!pager) {
        return null
    }

    const { prev, next } = pager

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 mb-4 gap-4 sm:gap-0">
            {prev?.href ? (
                <Link
                    href={prev.href}
                    className={cn(
                        "group w-full sm:w-auto inline-flex items-center justify-start sm:justify-center rounded-lg border border-border bg-background px-4 py-3 sm:py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    )}
                >
                    <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1 flex-shrink-0" />
                    <div className="flex flex-col items-start gap-1 overflow-hidden">
                        <span className="text-xs text-muted-foreground font-normal">Previous</span>
                        <span className="truncate w-full sm:max-w-xs">{prev.title}</span>
                    </div>
                </Link>
            ) : (
                <div className="hidden sm:block" /> // Spacer if no prev, hidden on mobile to avoid gap
            )}

            {next?.href && (
                <Link
                    href={next.href}
                    className={cn(
                        "group w-full sm:w-auto inline-flex items-center justify-end sm:justify-center rounded-lg border border-border bg-background px-4 py-3 sm:py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-right"
                    )}
                >
                    <div className="flex flex-col items-end gap-1 overflow-hidden">
                        <span className="text-xs text-muted-foreground font-normal">Next</span>
                        <span className="truncate w-full sm:max-w-xs">{next.title}</span>
                    </div>
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </Link>
            )}
        </div>
    )
}

function getPagerForDoc(slug: string) {
    const flattenedLinks = [null, ...flatten(docsConfig), null]
    const activeIndex = flattenedLinks.findIndex((link) => slug === link?.href)

    // Normalize fuzzy matches if exact match fails (e.g. trailing slash)
    if (activeIndex === -1) {
        // handle edge cases if needed, for now exact match is likely sufficient due to normalized routing
        return null
    }

    const prev = activeIndex ? flattenedLinks[activeIndex - 1] : null
    const next = activeIndex ? flattenedLinks[activeIndex + 1] : null
    return {
        prev,
        next,
    }
}

interface LinkItem {
    title: string;
    href?: string;
    items?: LinkItem[];
}

function flatten(links: LinkItem[]): DocsPagerItem[] {
    return links.reduce<DocsPagerItem[]>((flat, link) => {
        if (link.items?.length) {
            return flat.concat(flatten(link.items))
        }
        if (link.href) {
            return flat.concat({ title: link.title, href: link.href })
        }
        return flat
    }, [])
}
