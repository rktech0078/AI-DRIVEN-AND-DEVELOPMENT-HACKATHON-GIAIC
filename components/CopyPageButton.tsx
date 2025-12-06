'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyPageButton() {
    const [copied, setCopied] = useState(false)

    const copyPage = async () => {
        try {
            const content = document.querySelector('article')?.innerText || ''
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <button
            onClick={copyPage}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Copy page content"
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" />
                    <span>Copy page</span>
                </>
            )}
        </button>
    )
}
