
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Languages, Loader2, Settings2, RefreshCw, Check, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MODELS: Record<string, string[]> = {
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

    // Load translated content from cache on mount if available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cacheKey = `translation_cache_${window.location.pathname}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setTranslatedContent(cached);
            }
        }
    }, []);

    // Reset model when provider changes
    const handleProviderChange = (newProvider: string) => {
        setProvider(newProvider);
        if (MODELS[newProvider]) {
            setModel(MODELS[newProvider][0]);
        }
    };

    const handleTranslate = async () => {
        // Check cache again just in case (though effect handles init)
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
            // Clone the element to avoid modifying the actual DOM during extraction if needed
            // For now, innerText is fine but might include the button text itself. 
            // Better to exclude the button container.
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

            // Save to cache
            localStorage.setItem(cacheKey, data.translation);

            if (data.note) {
                console.info(data.note); // Log fallback info
            }

        } catch (error) {
            console.error(error);
            alert('Failed to translate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="mb-6 relative group z-20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={translatedContent ? () => setTranslatedContent(null) : handleTranslate}
                        disabled={isLoading}
                        className={cn(
                            "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm border",
                            translatedContent
                                ? "bg-muted text-foreground border-border hover:bg-muted/80"
                                : "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-600 border-emerald-200/50 hover:border-emerald-300 dark:border-emerald-500/20 dark:text-emerald-400"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Translating with {provider}...</span>
                            </>
                        ) : translatedContent ? (
                            <>
                                <Languages size={16} />
                                <span>Show Original</span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-emerald-500/5 rounded-xl animate-pulse" />
                                <Bot size={16} className="text-emerald-500" />
                                <span>Translate to Urdu</span>
                                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 border border-emerald-200 dark:border-emerald-500/30">
                                    +50 PTS
                                </span>
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={cn(
                                "p-2 rounded-lg transition-colors border border-transparent",
                                showSettings ? "bg-muted border-border text-foreground" : "hover:bg-muted/80 text-muted-foreground"
                            )}
                            title="Translation Settings"
                        >
                            <Settings2 size={16} />
                        </button>

                        {showSettings && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-4">
                                    {/* Provider Selection */}
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">Provider</div>
                                        <div className="grid grid-cols-1 gap-1">
                                            {Object.keys(MODELS).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => handleProviderChange(p)}
                                                    className={cn(
                                                        "w-full text-left px-2 py-1.5 text-sm rounded-lg capitalize transition-colors flex items-center justify-between",
                                                        provider === p ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                                    )}
                                                >
                                                    {p}
                                                    {provider === p && <Check size={14} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Model Selection */}
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">Model</div>
                                        <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-1">
                                            {MODELS[provider]?.map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setModel(m)}
                                                    className={cn(
                                                        "w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between truncate",
                                                        model === m ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                                    )}
                                                    title={m}
                                                >
                                                    <span className="truncate">{m.split('/').pop()?.split(':')[0] || m}</span>
                                                    {model === m && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {translatedContent && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/30 border border-border/50 rounded-2xl p-6 prose prose-sm dark:prose-invert max-w-none shadow-inner"
                        id="urdu-translation-container"
                        dir="auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                                <Languages size={14} />
                                Urdu Translation (AI Generated)
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem(`translation_cache_${window.location.pathname}`);
                                    setTranslatedContent(null);
                                    handleTranslate();
                                }}
                                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                title="Regenerate Translation"
                            >
                                <RefreshCw size={12} />
                                Regenerate with {model}
                            </button>
                        </div>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ ...props }) => <p className="leading-relaxed mb-4 text-right" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }} {...props} />,
                                li: ({ ...props }) => <li className="text-right" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }} {...props} />,
                                h1: ({ ...props }) => <h1 className="text-right font-bold mt-6 mb-4" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-right font-bold mt-5 mb-3" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-right font-bold mt-4 mb-2" {...props} />,
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
