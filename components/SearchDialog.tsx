"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Search, Loader2, FileText, Languages, Sparkles, CornerDownLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function SearchDialog() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    type SearchResult = {
        pageContent: string;
        metadata: {
            title?: string;
            path?: string;
        };
    };

    const [results, setResults] = React.useState<SearchResult[]>([])
    const [answer, setAnswer] = React.useState<{ provider: string, content: string } | null>(null)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
            if (e.key === "Escape") {
                setOpen(false)
                setQuery("")
                setResults([])
                setAnswer(null)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSearch = React.useCallback(async (searchQuery: string) => {
        if (!searchQuery) {
            setResults([])
            setAnswer(null)
            return
        }

        setLoading(true)
        setAnswer(null)
        try {
            const res = await fetch("/api/search", {
                method: "POST",
                body: JSON.stringify({ query: searchQuery }),
                headers: { "Content-Type": "application/json" }
            })
            const data = await res.json()
            setResults(data.results || [])
            setAnswer(data.answer || null)
        } catch (error) {
            console.error("Search failed", error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query) handleSearch(query)
        }, 500)
        return () => clearTimeout(timer)
    }, [query, handleSearch])

    const closeDialog = () => {
        setOpen(false)
        setQuery("")
        setResults([])
        setAnswer(null)
    }

    // Hardcoded suggestions for empty state
    const SUGGESTIONS = [
        { title: "Introduction to Physical AI", path: "/docs", icon: FileText },
        { title: "ROS 2 Fundamentals", path: "/docs/section-2/chapter-4", icon: FileText },
        { title: "Voice-to-Action Models", path: "/docs/section-5/chapter-13", icon: Sparkles },
        { title: "Urdu Translation Feature", path: "/docs/section-8/chapter-25", icon: Languages },
    ]

    const dialogContent = (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm"
                        onClick={closeDialog}
                    />
                    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] border border-zinc-200 dark:border-zinc-800 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Input Header */}
                            <div className="flex items-center px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
                                <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="What are you searching for?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                    className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 min-w-0 font-medium"
                                />
                                {loading && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin shrink-0" />}
                                <div
                                    onClick={closeDialog}
                                    className="hidden sm:inline-flex ml-3 h-6 items-center px-2 text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Esc
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {/* Empty State: Suggestions */}
                                {!query && (
                                    <div className="p-2">
                                        <div className="text-xs font-medium text-zinc-500 mb-2 px-2">Suggestions</div>
                                        {SUGGESTIONS.map((item, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    closeDialog()
                                                    router.push(item.path)
                                                }}
                                                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 group transition-all"
                                            >
                                                <item.icon className="w-4 h-4 text-zinc-400 mr-3 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{item.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* AI Answer */}
                                {answer && (
                                    <div className="mb-2 mx-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                AI Answer <span className="text-zinc-400 font-normal">via {answer.provider}</span>
                                            </span>
                                        </div>
                                        <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                            {answer.content}
                                        </div>
                                    </div>
                                )}

                                {/* Search Results */}
                                {results.map((result: SearchResult, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            closeDialog()
                                            if (result.metadata?.path) {
                                                let path = result.metadata.path
                                                if (!path.startsWith('/')) path = '/' + path
                                                if (!path.startsWith('/docs')) path = '/docs' + path
                                                path = path.replace('.mdx', '').replace('/page', '')
                                                router.push(path)
                                            }
                                        }}
                                        className="flex items-start p-3 rounded-lg cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 group"
                                    >
                                        <FileText className="w-5 h-5 text-zinc-400 mt-0.5 mr-3 shrink-0 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-0.5 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                {result.metadata?.title || 'Untitled'}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                                {result.pageContent}
                                            </div>
                                        </div>
                                        <CornerDownLeft className="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all ml-2" />
                                    </div>
                                ))}

                                {!loading && results.length === 0 && !answer && query && (
                                    <div className="p-8 text-center text-zinc-500 text-sm">
                                        No results based on your query.
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/30 flex justify-between items-center">
                                <div className="flex gap-4 text-[10px] text-zinc-400 font-medium">
                                    <span>Search by <span className="text-zinc-500 dark:text-zinc-300">Vector DB</span></span>
                                    <span>AI by <span className="text-zinc-500 dark:text-zinc-300">Abdul Rafay Khan</span></span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group w-full max-w-[320px] h-9 px-4 flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded-full bg-zinc-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-sm text-zinc-500 dark:text-zinc-400"
            >
                <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                    <span className="font-medium">Search...</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 rounded-md font-sans">
                        <span className="mr-0.5">⌘</span>K
                    </kbd>
                </div>
            </button>

            {open && mounted ? createPortal(dialogContent, document.body) : null}
        </>
    )
}

