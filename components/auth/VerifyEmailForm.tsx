'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendVerificationCode, verifyCode } from '@/lib/supabase'

export default function VerifyEmailForm() {
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return // Only allow single digit

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const verificationCode = code.join('')

        if (verificationCode.length !== 6) {
            setError('Poora 6-digit code enter karein')
            return
        }

        if (!email) {
            setError('Email missing hai')
            return
        }

        setLoading(true)

        try {
            const isValid = await verifyCode(email, verificationCode)

            if (isValid) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
            } else {
                setError('Invalid code. Dobara try karein.')
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Verification mein error aya')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) return

        setLoading(true)
        setError('')

        try {
            await sendVerificationCode(email)
            alert('Naya code bhej diya gaya hai!')
        } catch {
            setError('Code bhejne mein error aya')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm text-center">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
                    <p className="text-sm text-muted-foreground">
                        Humne <strong>{email}</strong> par 6-digit code bheja hai
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive text-left">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400 text-left">
                        ✓ Email verified! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-2 justify-center">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="h-14 w-12 text-center text-xl font-bold rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading || success}
                            />
                        ))}
                    </div>

                    <div className="space-y-2">
                        <button
                            type="submit"
                            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            disabled={loading || success}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            disabled={loading || success}
                        >
                            Resend Code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
