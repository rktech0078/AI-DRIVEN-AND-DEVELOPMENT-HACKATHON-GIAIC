"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TocItem {
    id: string
    text: string
    level: number
}

export function TableOfContents() {
    const [items, setItems] = useState<TocItem[]>([])
    const [activeId, setActiveId] = useState<string>("")

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll("h2, h3"))
            .map((elem) => {
                // Generates an ID if one is missing (fallback for rehype-slug issues)
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

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: "0% 0% -80% 0%" }
        )

        elements.forEach((elem) => {
            const el = document.getElementById(elem.id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    if (!items.length) {
        return null
    }

    return (
        <div className="hidden lg:block border-l border-border/40">
            <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] overflow-y-auto py-12 pl-6">
                <div className="space-y-4">
                    <p className="font-semibold text-sm text-foreground">On This Page</p>
                    <ul className="m-0 list-none space-y-3 text-sm">
                        {items.map((item) => (
                            <li key={item.id} className="mt-0">
                                <a
                                    href={`#${item.id}`}
                                    className={cn(
                                        "inline-block no-underline transition-colors hover:text-foreground border-l-2 pl-4 -ml-4",
                                        item.level === 3 ? "pl-8" : "",
                                        activeId === item.id
                                            ? "font-medium text-foreground border-primary"
                                            : "text-muted-foreground border-transparent hover:border-border"
                                    )}
                                >
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
