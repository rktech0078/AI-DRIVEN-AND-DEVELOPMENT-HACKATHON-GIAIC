"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Search, Loader2, FileText, X, Command } from "lucide-react"

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

    const dialogContent = (
        <div
            className="fixed inset-0 z-[99999] flex items-start justify-center pt-[10vh] px-4 font-sans bg-black/60 backdrop-blur-sm"
            onClick={closeDialog}
        >
            <div
                className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-zinc-200 dark:border-zinc-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Header */}
                <div className="flex items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search docs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 min-w-0"
                    />
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
                    ) : query ? (
                        <button
                            onClick={() => {
                                setQuery('')
                                setResults([])
                                setAnswer(null)
                            }}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    ) : null}

                    <div
                        onClick={closeDialog}
                        className="hidden sm:inline-flex ml-3 px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        ESC
                    </div>
                </div>

                {/* Results Body */}
                <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-zinc-950">
                    {/* AI Answer Section */}
                    {answer && (
                        <div className="mb-4 mx-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <SparklesIcon className="w-3 h-3" />
                                    AI Answer ({answer.provider})
                                </span>
                            </div>
                            <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                {answer.content}
                            </div>
                        </div>
                    )}

                    {!loading && results.length === 0 && !answer && query && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No results found.
                        </div>
                    )}

                    {!query && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 mb-4">
                                <Command className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                Search docs, ask questions, or find APIs...
                            </p>
                        </div>
                    )}

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
                            className="flex items-start p-3 rounded-xl cursor-pointer mb-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 group"
                        >
                            <FileText className="w-5 h-5 text-zinc-400 mt-0.5 mr-3 shrink-0 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-0.5 truncate">
                                    {result.metadata?.title || 'Untitled'}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                    {result.pageContent}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">AI Powered Search</span>
                    </div>
                    <div className="flex gap-3 opacity-60">
                        <span>Qdrant</span>
                        <span>•</span>
                        <span>Gemini</span>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group w-full max-w-[280px] h-9 px-3 flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-sm text-zinc-500 dark:text-zinc-400 shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                    <span>Search...</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 h-5 px-1.5 text-[10px] font-medium text-zinc-500 bg-zinc-200 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 font-sans">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {open && mounted ? createPortal(dialogContent, document.body) : null}
        </>
    )
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currrentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
