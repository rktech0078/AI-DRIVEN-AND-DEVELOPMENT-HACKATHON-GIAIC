"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { EditOnGithub } from "./EditOnGithub"
import { Copy, MessageSquare, Sparkles, Check } from "lucide-react"

interface TocItem {
    id: string
    text: string
    level: number
}

// Custom hook to find active item
function useActiveItem(itemIds: string[]) {
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: `0% 0% -80% 0%` }
        )

        itemIds.forEach((id) => {
            const element = document.getElementById(id)
            if (element) {
                observer.observe(element)
            }
        })

        return () => {
            itemIds.forEach((id) => {
                const element = document.getElementById(id)
                if (element) {
                    observer.unobserve(element)
                }
            })
        }
    }, [itemIds])

    return activeId
}

export function TableOfContents() {
    const [items, setItems] = useState<TocItem[]>([])
    const [internalActiveId, setInternalActiveId] = useState<string>("")
    const pathname = usePathname()

    // New state for actions
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll("h2, h3"))
            .map((elem) => {
                if (!elem.id) {
                    const id = elem.textContent
                        ?.toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")
                    if (id) elem.id = id
                }

                return {
                    id: elem.id,
                    text: elem.textContent || "",
                    level: Number(elem.tagName.substring(1)),
                }
            })
            .filter((item) => item.id && item.text)

        setItems(elements)
    }, [pathname])

    // Use our robust hook
    const activeIdFromHook = useActiveItem(items.map((item) => item.id))

    // Allow manual override when clicking
    const activeId = internalActiveId || activeIdFromHook


    const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        const element = document.getElementById(id)
        if (element) {
            // Set internal active ID immediately for responsiveness
            setInternalActiveId(id)
            // Clear manual override after scrolling finishes roughly
            setTimeout(() => setInternalActiveId(""), 1000)

            const offset = 100 // Slightly larger offset for better visibility under header
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })

            history.pushState(null, "", `#${id}`)
        }
    }

    const copyPageUrl = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!items.length) {
        return null
    }

    return (
        <div className="hidden lg:block border-l border-zinc-200 dark:border-zinc-800">
            <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-8 pl-6 flex flex-col justify-between">
                <div className="space-y-6">
                    <div>
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4">On This Page</p>
                        <ul className="m-0 list-none space-y-0 text-sm">
                            {items.map((item) => (
                                <li key={item.id} className="mt-0">
                                    <a
                                        href={`#${item.id}`}
                                        onClick={(e) => handleScrollLink(e, item.id)}
                                        className={cn(
                                            "block py-1.5 transition-all text-muted-foreground border-l-2 -ml-[26px] pl-[24px]", // Base styles
                                            item.level === 3 ? "pl-[36px]" : "", // Indent h3
                                            activeId === item.id
                                                ? "border-zinc-900 dark:border-zinc-50 font-medium text-zinc-900 dark:text-zinc-50"
                                                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        )}
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex flex-col gap-3">
                            <EditOnGithub className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-0" />

                            <button onClick={copyPageUrl} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                <span>Copy page</span>
                            </button>

                            <a href="https://github.com/rktech0078/AI-DRIVEN-AND-DEVELOPMENT-HACKATHON-GIAIC/issues" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                                <MessageSquare size={14} />
                                <span>Give feedback</span>
                            </a>

                            <button onClick={() => document.dispatchEvent(new CustomEvent('open-ai-agent'))} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                                <Sparkles size={14} />
                                <span>Ask AI about this page</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
