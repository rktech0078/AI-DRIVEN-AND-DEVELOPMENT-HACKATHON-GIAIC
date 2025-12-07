'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { AiAgentProvider } from '@/contexts/AiAgentContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <SidebarProvider>
                    <AiAgentProvider>
                        {children}
                    </AiAgentProvider>
                </SidebarProvider>
            </AuthProvider>
        </NextThemesProvider>
    )
}
