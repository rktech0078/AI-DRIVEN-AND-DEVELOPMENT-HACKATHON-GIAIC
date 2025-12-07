'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    raw?: string; // Optional raw code passed directly
}

export function CodeBlockWithCopy({ children, className, ...props }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    // Extract language/title from className or children
    // Usually MDX passes className="language-js" to the code element (which is children here)
    // But here 'children' is likely the <code> element.

    let language = ''
    let codeContent = ''

    if (children && typeof children === 'object' && 'props' in children) {
        const childEl = children as React.ReactElement
        const childProps = childEl.props
        if (childProps.className) {
            const match = /language-(\w+)/.exec(childProps.className || '')
            if (match) language = match[1]
        }
        if (childProps.children) {
            codeContent = String(childProps.children).replace(/\n$/, '')
        }
    } else {
        codeContent = String(children).replace(/\n$/, '')
    }

    const copyCode = () => {
        navigator.clipboard.writeText(codeContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="group relative my-6 overflow-hidden rounded-xl border border-border bg-zinc-950 shadow-md dark:shadow-none">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between border-b border-border/40 bg-zinc-900/50 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider select-none">
                        {language || 'text'}
                    </span>
                </div>
                <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Area */}
            <div className="relative overflow-x-auto">
                <pre
                    className={cn(
                        "overflow-x-auto p-4 text-sm leading-relaxed font-mono text-zinc-100 [&_code]:bg-transparent [&_code]:text-inherit",
                        className
                    )}
                    {...props}
                >
                    {children}
                </pre>
            </div>
        </div>
    )
}
