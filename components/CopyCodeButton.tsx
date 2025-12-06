'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyCodeButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <button
            onClick={copyCode}
            className="absolute top-2 right-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Copy code"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
        </button>
    )
}
