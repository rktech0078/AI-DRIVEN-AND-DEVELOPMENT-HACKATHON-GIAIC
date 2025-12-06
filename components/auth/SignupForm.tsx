'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupForm() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [retypePassword, setRetypePassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { signUp } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!username || !email || !password || !retypePassword) {
            setError('Sare fields fill karein')
            return
        }

        if (password !== retypePassword) {
            setError('Passwords match nahi ho rahe')
            return
        }

        if (password.length < 6) {
            setError('Password kam se kam 6 characters ka hona chahiye')
            return
        }

        setLoading(true)

        try {
            await signUp(email, password, username)
            // Redirect to verification page with email in query
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Signup mein error aya';
            setError(errorMessage);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-sm text-muted-foreground">Join the Physical AI community today</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Apna username enter karein"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="retypePassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Retype Password</label>
                    <input
                        id="retypePassword"
                        type="password"
                        value={retypePassword}
                        onChange={(e) => setRetypePassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-primary hover:underline underline-offset-4">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    )
}
