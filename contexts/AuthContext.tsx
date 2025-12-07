'use client'

import React, { createContext, useContext } from 'react'
import { authClient } from '@/lib/auth-client'
import { User } from 'better-auth'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: typeof authClient.signIn.email
    signUp: typeof authClient.signUp.email
    signOut: typeof authClient.signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending: loading } = authClient.useSession()

    const value = {
        user: session?.user || null,
        loading,
        signIn: authClient.signIn.email,
        signUp: authClient.signUp.email,
        signOut: authClient.signOut
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
