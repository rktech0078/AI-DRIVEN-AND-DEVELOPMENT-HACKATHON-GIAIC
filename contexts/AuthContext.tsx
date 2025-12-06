'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { sendVerificationCode, verifyCode } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    loading: boolean
    signUp: (email: string, password: string, username: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    verifyEmail: (email: string, code: string) => Promise<boolean>
    sendCode: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email: string, password: string, username: string) => {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
                emailRedirectTo: undefined, // Disable email confirmation link
            },
        })

        if (error) throw error

        // Send verification code
        await sendVerificationCode(email)
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const verifyEmail = async (email: string, code: string): Promise<boolean> => {
        const isValid = await verifyCode(email, code)

        if (isValid) {
            // Update user metadata to mark email as verified
            const { error } = await supabase.auth.updateUser({
                data: { email_verified: true }
            })

            if (error) {
                console.error('Error updating user metadata:', error)
                return false
            }
        }

        return isValid
    }

    const sendCode = async (email: string) => {
        await sendVerificationCode(email)
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        verifyEmail,
        sendCode,
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
