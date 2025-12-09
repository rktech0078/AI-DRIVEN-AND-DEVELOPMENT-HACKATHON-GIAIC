'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Edit, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { AuthRequiredDialog } from './auth/AuthRequiredDialog'

interface EditOnGithubProps {
    className?: string
    repoUrl?: string
}

export function EditOnGithub({
    className,
    // Defaulting to the repo found in backup config, user specific repo
    repoUrl = "https://github.com/rktech0078/AI-DRIVEN-AND-DEVELOPMENT-HACKATHON-GIAIC"
}: EditOnGithubProps) {
    const pathname = usePathname()

    // Determine the file path based on the pathname
    // Typically: /docs/section-1/chapter-1 -> /app/docs/section-1/chapter-1/page.mdx
    // If pathname is /docs -> /app/docs/page.mdx

    // Remove trailing slash if present
    const cleanPath = pathname?.replace(/\/$/, '') || ''

    const { user } = useAuth()
    const [showAuthDialog, setShowAuthDialog] = useState(false)

    // Check if we are in the docs section
    if (!cleanPath.startsWith('/docs')) {
        return null
    }

    // Construct the edit URL
    // Assuming the structure is: app/[path]/page.mdx given the App Router structure seen
    const filePath = cleanPath === '/docs'
        ? 'app/docs/page.mdx'
        : `app${cleanPath}/page.mdx`

    const editUrl = `${repoUrl}/blob/main/${filePath}`

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!user) {
            e.preventDefault();
            setShowAuthDialog(true);
        }
    }

    return (
        <>
            <AuthRequiredDialog
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
                featureName="GitHub Editing"
            />
            <Link
                href={editUrl}
                onClick={handleClick}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4",
                    className
                )}
            >
                <Edit className="h-4 w-4" />
                <span>Edit this page on GitHub</span>
                {!user && <Lock className="h-3 w-3 opacity-70" />}
            </Link>
        </>
    )
}
