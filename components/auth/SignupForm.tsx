'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function SignupForm() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [retypePassword, setRetypePassword] = useState('')
    const [softwareBackground, setSoftwareBackground] = useState('')
    const [hardwareBackground, setHardwareBackground] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!username || !email || !password || !retypePassword) {
            setError('Please fill all required fields')
            return
        }

        if (password !== retypePassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const { error } = await authClient.signUp.email({
                email,
                password,
                name: username, // Mapping username to name for simplicity
            }, {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    router.push('/')
                },
                onError: (ctx) => {
                    setError(ctx.error.message || 'An error occurred during signup')
                    setLoading(false)
                }
            })

            if (error) {
                setError(error.message || 'An error occurred during signup')
                setLoading(false)
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
            setError(errorMessage);
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-sm text-muted-foreground">Join the Physical AI community today</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium leading-none">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={loading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                            <label htmlFor="retypePassword" className="text-sm font-medium leading-none">Retype Password</label>
                            <input
                                id="retypePassword"
                                type="password"
                                value={retypePassword}
                                onChange={(e) => setRetypePassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="softwareBackground" className="text-sm font-medium leading-none">Software Background (Optional)</label>
                        <textarea
                            id="softwareBackground"
                            value={softwareBackground}
                            onChange={(e) => setSoftwareBackground(e.target.value)}
                            placeholder="Briefly describe your software experience..."
                            disabled={loading}
                            rows={2}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="hardwareBackground" className="text-sm font-medium leading-none">Hardware Background (Optional)</label>
                        <textarea
                            id="hardwareBackground"
                            value={hardwareBackground}
                            onChange={(e) => setHardwareBackground(e.target.value)}
                            placeholder="Briefly describe your hardware experience..."
                            disabled={loading}
                            rows={2}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                        </>
                    ) : 'Sign Up'}
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
