'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Languages, Loader2, Settings2, RefreshCw, Check, Bot, X, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AuthRequiredDialog } from './auth/AuthRequiredDialog';

const MODELS: Record<string, string[]> = {
    mistral: ['mistral-large-latest', 'mistral-medium', 'mistral-small-latest', 'codestral-latest'],
    gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    openrouter: ['mistralai/mistral-7b-instruct:free', 'nvidia/nemotron-nano-9b-v2:free', 'qwen/qwen3-coder:free', 'tngtech/deepseek-r1t2-chimera:free'],
    groq: ['meta-llama/llama-4-scout-17b-16e-instruct', 'llama-3.3-70b-versatile'],
};

export default function TranslationButton() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [provider, setProvider] = useState<string>('gemini');
    const [model, setModel] = useState<string>(MODELS['gemini'][0]);
    const [showSettings, setShowSettings] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [mounted, setMounted] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const cacheKey = `translation_cache_${window.location.pathname}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setTranslatedContent(cached);
            }
        }
    }, []);

    // Close settings when clicking outside on desktop
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        if (showSettings && isDesktop) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSettings, isDesktop]);

    const handleProviderChange = (newProvider: string) => {
        setProvider(newProvider);
        if (MODELS[newProvider]) {
            setModel(MODELS[newProvider][0]);
        }
    };

    const handleTranslate = async () => {
        const cacheKey = `translation_cache_${window.location.pathname}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            setTranslatedContent(cached);
            return;
        }

        const contentElement = document.getElementById('chapter-content');
        if (!contentElement) {
            console.error('Chapter content element not found');
            return;
        }

        setIsLoading(true);
        try {
            const clone = contentElement.cloneNode(true) as HTMLElement;
            const btnContainer = clone.querySelector('.translation-btn-container');
            if (btnContainer) btnContainer.remove();

            const content = clone.innerText;

            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, provider, model }),
            });

            if (!res.ok) throw new Error('Translation failed');

            const data = await res.json();
            setTranslatedContent(data.translation);
            localStorage.setItem(cacheKey, data.translation);

        } catch (error) {
            console.error(error);
            alert('Failed to translate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const [showAuthDialog, setShowAuthDialog] = useState(false);

    // Remove the early return
    // if (!user) return null; 

    // Modified click handler wrapper
    const handleAction = (action: () => void) => {
        if (!user) {
            setShowAuthDialog(true);
            return;
        }
        action();
    };

    const SettingsContent = () => (
        <div className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">AI Provider</div>
                <div className="grid grid-cols-1 gap-2">
                    {Object.keys(MODELS).map((p) => (
                        <button
                            key={p}
                            onClick={() => handleProviderChange(p)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm rounded-lg capitalize transition-colors flex items-center justify-between border",
                                provider === p
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            {p}
                            {provider === p && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Model</div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {MODELS[provider]?.map((m) => (
                        <button
                            key={m}
                            onClick={() => setModel(m)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between border truncate",
                                model === m
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 font-medium"
                                    : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            <span className="truncate">{m.split('/').pop()?.split(':')[0] || m}</span>
                            {model === m && <Check size={12} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mb-6 relative z-20">
            <AuthRequiredDialog
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
                featureName="AI Translation"
            />

            <div className="flex items-center gap-3 mb-4" ref={settingsRef}>
                <button
                    onClick={() => handleAction(translatedContent ? () => setTranslatedContent(null) : handleTranslate)}
                    disabled={isLoading}
                    className={cn(
                        "relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95",
                        translatedContent
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Translating...</span>
                        </>
                    ) : translatedContent ? (
                        <>
                            <Languages size={16} />
                            <span>Show Original</span>
                        </>
                    ) : (
                        <>
                            <Bot size={18} />
                            <span>Translate to Urdu</span>
                            {!user && (
                                <Lock size={14} className="ml-1 opacity-70" />
                            )}
                        </>
                    )}
                </button>

                <button
                    onClick={() => handleAction(() => setShowSettings(!showSettings))}
                    className={cn(
                        "p-2.5 rounded-full border transition-all duration-200 bg-white dark:bg-zinc-950",
                        showSettings
                            ? "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                    aria-label="Translation Settings"
                >
                    <Settings2 size={18} />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                    {showSettings && isDesktop && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-50"
                        >
                            <SettingsContent />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Drawer (Portal) */}
            {mounted && !isDesktop && createPortal(
                <AnimatePresence>
                    {showSettings && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSettings(false)}
                                className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed inset-x-0 bottom-0 z-[120] bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] safe-area-bottom"
                            >
                                <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-3 shrink-0" />

                                <div className="px-6 pb-6 pt-2 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Models</h3>
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <SettingsContent />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <AnimatePresence>
                {translatedContent && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none mt-6"
                        id="urdu-translation-container"
                        dir="auto"
                    >
                        <div className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 font-medium">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <Languages size={18} />
                                </div>
                                <span>Urdu Translation</span>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem(`translation_cache_${window.location.pathname}`);
                                    setTranslatedContent(null);
                                    handleTranslate();
                                }}
                                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg"
                            >
                                <RefreshCw size={14} />
                                Regenerate
                            </button>
                        </div>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ ...props }) => <p className="leading-relaxed mb-6 text-right text-lg text-zinc-700 dark:text-zinc-300" style={{ fontFamily: 'Noto Nastaliq Urdu, serif', lineHeight: '2' }} {...props} />,
                                li: ({ ...props }) => <li className="text-right text-lg text-zinc-700 dark:text-zinc-300 mb-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }} {...props} />,
                                h1: ({ ...props }) => <h1 className="text-right font-bold mt-8 mb-6 text-3xl" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-right font-bold mt-8 mb-5 text-2xl" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-right font-bold mt-6 mb-4 text-xl" {...props} />,
                            }}
                        >
                            {translatedContent}
                        </ReactMarkdown>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay the original content when translation is active */}
            {translatedContent && (
                <style jsx global>{`
                    #chapter-content > *:not(#urdu-translation-container):not(.translation-btn-container) {
                        display: none;
                    }
                `}</style>
            )}
        </div>
    );
}
