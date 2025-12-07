'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please fill in both email and password')
            return
        }

        setLoading(true)

        try {
            const { error } = await authClient.signIn.email({
                email,
                password
            }, {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    router.push('/')
                },
                onError: (ctx) => {
                    setError(ctx.error.message || 'An error occurred during login')
                    setLoading(false)
                }
            })

            if (error) {
                setError(error.message || 'An error occurred during login')
                setLoading(false)
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
            setError(errorMessage);
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                        </>
                    ) : 'Login'}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                    {"Don't have an account? "}
                    <Link href="/auth/signup" className="font-medium text-primary hover:underline underline-offset-4">
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    )
}
