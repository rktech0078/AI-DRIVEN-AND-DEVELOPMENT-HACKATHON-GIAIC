'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { SocialAuthButtons } from './SocialAuthButtons'
import RoboticIcon from '@/components/RoboticIcon'

export default function SignupForm() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // const [retypePassword, setRetypePassword] = useState('') // Removing redundant field for cleaner UX, standard practice is strict validation or show/hide
    const [softwareBackground, setSoftwareBackground] = useState('')
    const [hardwareBackground, setHardwareBackground] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Simple Validation
        if (!username || !email || !password) {
            setError('Please fill all required fields')
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
                name: username,
                // Pass extra fields if your schema supports them, usually integrated via metadata or separate profile update
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
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 dark:bg-sky-900/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-[480px] space-y-8 relative z-10">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-2xl mb-2">
                        <RoboticIcon className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create an account</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                        Join the Physical AI community to get started
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
                    <SocialAuthButtons />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                disabled={loading}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                disabled={loading}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                disabled={loading}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            />
                        </div>

                        {/* Optional Backgrounds collapsed for cleaner UI or keep as is? User said "Optional", keeping them but styling better */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <label htmlFor="softwareBackground" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Software BG (Optional)</label>
                                <textarea
                                    id="softwareBackground"
                                    value={softwareBackground}
                                    onChange={(e) => setSoftwareBackground(e.target.value)}
                                    placeholder="Python, JS..."
                                    disabled={loading}
                                    rows={1}
                                    className="flex min-h-[44px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="hardwareBackground" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Hardware BG (Optional)</label>
                                <textarea
                                    id="hardwareBackground"
                                    value={hardwareBackground}
                                    onChange={(e) => setHardwareBackground(e.target.value)}
                                    placeholder="Arduino, ESP..."
                                    disabled={loading}
                                    rows={1}
                                    className="flex min-h-[44px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-8 text-sm font-semibold text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : 'Create account'}
                        </button>
                    </form>
                </div>
                <div className="text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
