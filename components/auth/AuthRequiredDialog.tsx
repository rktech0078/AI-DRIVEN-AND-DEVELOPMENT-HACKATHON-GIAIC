'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, LogIn } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AuthRequiredDialogProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export function AuthRequiredDialog({ isOpen, onClose, featureName = "Premium Features" }: AuthRequiredDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog Container - Using Flexbox for Perfect Centering */}
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-sm pointer-events-auto"
                        >
                            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
                                {/* Decorative Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 z-20"
                                >
                                    <X size={18} />
                                </button>

                                <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Lock className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                            Authentication Required
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            Sign in to access <strong>{featureName}</strong> and verify your account to unlock full potential.
                                        </p>
                                    </div>

                                    <div className="w-full space-y-3">
                                        <button
                                            onClick={() => {
                                                try {
                                                    if (window.google?.accounts?.id) {
                                                        window.google.accounts.id.prompt();
                                                        onClose();
                                                    } else {
                                                        window.location.href = '/auth/login';
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    window.location.href = '/auth/login';
                                                }
                                            }}
                                            className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            <LogIn size={18} />
                                            Sign In with Google
                                        </button>

                                        <Link
                                            href="/auth/login"
                                            className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            Go to Login Page
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
