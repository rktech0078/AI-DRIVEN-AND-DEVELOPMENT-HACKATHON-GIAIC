'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { AiAgentProvider } from '@/contexts/AiAgentContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <AiAgentProvider>
                    {children}
                </AiAgentProvider>
            </AuthProvider>
        </NextThemesProvider>
    )
}
