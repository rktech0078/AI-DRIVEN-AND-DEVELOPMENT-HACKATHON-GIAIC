'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ChevronDown, Cpu, Bot, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
// import styles from './AiAgent.module.css'; // REMOVING CSS import
import RoboticIcon from '@/components/RoboticIcon';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type Provider = 'gemini' | 'openrouter' | 'groq';

const MODELS = {
    gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    openrouter: ['mistralai/mistral-7b-instruct:free', 'nvidia/nemotron-nano-9b-v2:free', 'qwen/qwen3-coder:free', 'tngtech/deepseek-r1t2-chimera:free'],
    groq: ['meta-llama/llama-4-scout-17b-16e-instruct', 'llama-3.3-70b-versatile'],
};

import { useAiAgent } from '@/contexts/AiAgentContext';

export default function AiAgent() {
    const { isOpen, setIsOpen } = useAiAgent();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [provider, setProvider] = useState<Provider>('gemini');
    const [model, setModel] = useState<string>(MODELS.gemini[0]);
    const [isDark, setIsDark] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isProviderOpen, setIsProviderOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const providerRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());
    const [dislikedMessages, setDislikedMessages] = useState<Set<number>>(new Set());

    // Session State
    const [sessionId, setSessionId] = useState<string | null>(null);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Load Session (on mount or open)
    useEffect(() => {
        const loadSession = async () => {
            if (!isOpen) return;

            // Check auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return; // User not logged in, use transient state

            // Try to fetch the latest session
            if (!sessionId) {
                const { data: sessions, error } = await supabase
                    .from('chat_sessions')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (error) {
                    console.error("Error fetching sessions:", error);
                }

                if (sessions && sessions.length > 0) {
                    const latestSessionId = sessions[0].id;
                    setSessionId(latestSessionId);

                    // Fetch messages for this session
                    const { data: msgs } = await supabase
                        .from('chat_messages')
                        .select('role, content')
                        .eq('session_id', latestSessionId)
                        .order('created_at', { ascending: true });

                    if (msgs) {
                        setMessages(msgs as Message[]);
                    }
                }
            }
        };

        loadSession();
    }, [isOpen, sessionId, supabase]);

    useEffect(() => {
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark') ||
                document.documentElement.getAttribute('data-theme') === 'dark';
            setIsDark(isDarkMode);
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (providerRef.current && !providerRef.current.contains(event.target as Node)) setIsProviderOpen(false);
            if (modelRef.current && !modelRef.current.contains(event.target as Node)) setIsModelOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [selectionButtonPos, setSelectionButtonPos] = useState<{ x: number, y: number } | null>(null);

    // Listen for text selection
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0 && !isOpen) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Show button above selection
                setSelectionButtonPos({
                    x: rect.left + (rect.width / 2),
                    y: rect.top - 40 // 40px above
                });

                // Also update selected text state but don't clear it yet
                // We'll capture it officially when button is clicked
            } else {
                setSelectionButtonPos(null);
            }
        };

        // Handle scrolling or resizing to hide/update button
        const handleInteraction = () => {
            if (window.getSelection()?.toString().trim().length === 0) {
                setSelectionButtonPos(null)
            }
        }

        document.addEventListener('mouseup', handleSelection);
        // document.addEventListener('selectionchange', handleSelection); // Optional: real-time update
        document.addEventListener('mousedown', handleInteraction); // Hide on click outside
        window.addEventListener('scroll', handleInteraction);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
        };
    }, [isOpen]);

    const handleFloatingButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        captureSelection();
        setIsOpen(true);
        setSelectionButtonPos(null);
    };

    const captureSelection = () => {
        const selection = window.getSelection();
        if (selection) {
            setSelectedText(selection.toString().trim());
        }
    };

    const handleProviderSelect = (p: Provider) => { setProvider(p); setModel(MODELS[p][0]); setIsProviderOpen(false); };
    const handleModelSelect = (m: string) => { setModel(m); setIsModelOpen(false); };

    const copyToClipboard = async (text: string, idx: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleLike = (idx: number) => {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        if (newLiked.has(idx)) newLiked.delete(idx);
        else { newLiked.add(idx); newDisliked.delete(idx); }
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
    };

    const handleDislike = (idx: number) => {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        if (newDisliked.has(idx)) newDisliked.delete(idx);
        else { newDisliked.add(idx); newLiked.delete(idx); }
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    provider,
                    model,
                    selectedText,
                    sessionId: sessionId // Send current session ID
                }),
            });
            const data = await response.json();
            setSelectedText(''); // Clear selection after sending
            if (data.error) throw new Error(data.error);

            // Update session ID if returned (for new sessions)
            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Ensure isDark state is accounted for */}
            {isDark && null}
            {/* Floating Selection Button */}
            {selectionButtonPos && !isOpen && (
                <button
                    onClick={handleFloatingButtonClick}
                    className="fixed z-[60] flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 hover:bg-zinc-800 border border-zinc-700/50"
                    style={{
                        top: selectionButtonPos.y,
                        left: selectionButtonPos.x,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <Sparkles size={12} className="text-violet-400" />
                    Ask AI
                </button>
            )}

            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed !bottom-6 !right-6 !left-auto z-50 group relative inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white shadow-2xl transition-all hover:scale-105 active:scale-95 w-auto max-w-fit overflow-hidden",
                    isOpen && "opacity-0 pointer-events-none"
                )}
                style={
                    {
                        "--angle": "0deg",
                        background: "linear-gradient(to right, #1a1a1a, #000)",
                        border: "double 2px transparent",
                        backgroundImage: "linear-gradient(#050505, #050505), conic-gradient(from var(--angle), #ff4545, #00ff99, #006aff, #ff0095, #ff4545)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                        animation: "border-rotate 4s linear infinite",
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        left: 'auto',
                    } as React.CSSProperties
                }
            >
                {/* Glow Blur Layer Behind */}
                <span className="absolute -inset-1 -z-10 rounded-full bg-[conic-gradient(from_var(--angle),#ff4545,#00ff99,#006aff,#ff0095,#ff4545)] opacity-40 blur-md animate-[spin_4s_linear_reverse_infinite]" />

                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                    <span className="tracking-wide">Ask AI</span>
                    {/* <Sparkles size={16} className="text-yellow-400 fill-yellow-400" /> */}
                </span>
                {/* <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1" onClick={(e) => {
                    e.stopPropagation();
                    captureSelection();
                    setIsOpen(true);
                }}>
                    Select Text?
                </span> */}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                            className="relative w-full h-[100dvh] bg-background/95 backdrop-blur-xl flex flex-col shadow-2xl border-border"
                        >
                            {/* Header */}
                            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b bg-background/50 shrink-0 z-10 gap-3 sm:gap-0">
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary ring-1 ring-border/50">
                                            <RoboticIcon />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground leading-none flex items-center gap-1.5">
                                                Physical AI
                                                <span className="px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[9px] font-bold tracking-wide uppercase border border-violet-500/20">Beta</span>
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Abdul Rafay Khan</span>
                                        </div>
                                    </div>
                                    {/* Close button for mobile - moved here for better UX */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 shadow-inner flex-1 sm:flex-initial overflow-visible">
                                        {/* Provider Dropdown */}
                                        <div className="relative" ref={providerRef}>
                                            <button
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium transition-all whitespace-nowrap rounded-lg border border-transparent",
                                                    isProviderOpen
                                                        ? "bg-background text-foreground shadow-sm border-border/50"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                                )}
                                                onClick={() => { setIsProviderOpen(!isProviderOpen); setIsModelOpen(false); }}
                                            >
                                                <Cpu size={12} className={cn("transition-colors", isProviderOpen ? "text-primary" : "text-muted-foreground")} />
                                                <span>{provider === 'openrouter' ? 'OpenRouter' : provider === 'gemini' ? 'Gemini' : 'Groq'}</span>
                                                <ChevronDown size={10} className={cn("transition-transform duration-200", isProviderOpen && "rotate-180")} />
                                            </button>
                                            <AnimatePresence>
                                                {isProviderOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        className="absolute top-full left-0 mt-2 min-w-[140px] bg-popover/90 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-50 p-1 overflow-hidden ring-1 ring-black/5"
                                                    >
                                                        {(['gemini', 'openrouter', 'groq'] as const).map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => handleProviderSelect(p)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors group",
                                                                    provider === p
                                                                        ? "bg-primary/10 text-primary font-medium"
                                                                        : "text-popover-foreground hover:bg-muted"
                                                                )}
                                                            >
                                                                <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                                                                {provider === p && <Check size={12} />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="w-px h-3.5 bg-border/40 shrink-0" />

                                        {/* Model Dropdown */}
                                        <div className="relative" ref={modelRef}>
                                            <button
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium transition-all whitespace-nowrap rounded-lg border border-transparent max-w-[150px]",
                                                    isModelOpen
                                                        ? "bg-background text-foreground shadow-sm border-border/50"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                                )}
                                                onClick={() => { setIsModelOpen(!isModelOpen); setIsProviderOpen(false); }}
                                            >
                                                <span className="truncate">{model}</span>
                                                <ChevronDown size={10} className={cn("shrink-0 transition-transform duration-200", isModelOpen && "rotate-180")} />
                                            </button>
                                            <AnimatePresence>
                                                {isModelOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        className="absolute top-full right-0 sm:left-0 mt-2 min-w-[200px] max-h-[280px] overflow-y-auto bg-popover/90 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-50 p-1 ring-1 ring-black/5 no-scrollbar"
                                                    >
                                                        <div className="px-2 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-70">
                                                            Available Models
                                                        </div>
                                                        {MODELS[provider].map(m => (
                                                            <button
                                                                key={m}
                                                                onClick={() => handleModelSelect(m)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left",
                                                                    model === m
                                                                        ? "bg-primary/10 text-primary font-medium"
                                                                        : "text-popover-foreground hover:bg-muted"
                                                                )}
                                                                title={m}
                                                            >
                                                                <span className="truncate mr-2">{m}</span>
                                                                {model === m && <Check size={12} className="shrink-0" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    {/* Close button for desktop */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="hidden sm:block p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </header>

                            {/* Chat Area */}
                            <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-muted/20 flex flex-col gap-6">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-16 h-16 bg-gradient-to-tr from-primary/20 to-violet-500/20 rounded-3xl flex items-center justify-center text-primary mb-6 ring-1 ring-border shadow-sm">
                                            <Bot size={32} />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">How can I help you today?</h3>
                                        <p className="text-sm text-muted-foreground max-w-[280px] mb-8 leading-relaxed">
                                            I can explain concepts, write code, or help you navigate the documentation.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                                            {['Explain Sim-to-Real transfer', 'How do I install ROS 2?', 'What are VLA models?', 'Generate a URDF example'].map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => { setInput(q); sendMessage(); }}
                                                    className="px-4 py-3 text-xs text-left bg-background hover:bg-muted/50 hover:border-primary/30 border border-border rounded-xl transition-all text-foreground shadow-sm group"
                                                >
                                                    <span className="group-hover:text-primary transition-colors">{q}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={idx} className={cn("flex flex-col max-w-[90%] sm:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                                            <div className={cn(
                                                "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative",
                                                msg.role === 'user'
                                                    ? "bg-primary text-primary-foreground rounded-tr-md"
                                                    : "bg-background border border-border text-foreground rounded-tl-md"
                                            )}>
                                                {msg.role === 'user' ? (
                                                    msg.content
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-3 prose-pre:my-3 prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none font-normal text-foreground/90">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                a: ({ ...props }) => <a className="text-primary underline hover:text-primary/80 transition-colors font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                                                code: ({ ...props }) => {
                                                                    const match = /language-(\w+)/.exec(props.className || '')
                                                                    return match ? (
                                                                        <code className={props.className} {...props} />
                                                                    ) : (
                                                                        <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono font-medium text-primary border border-border/30" {...props} />
                                                                    )
                                                                },
                                                                pre: ({ ...props }) => (
                                                                    <div className="relative group">
                                                                        <pre className="bg-muted/50 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-border/50 my-2 no-scrollbar" {...props} />
                                                                    </div>
                                                                )
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                            {msg.role === 'assistant' && (
                                                <div className="flex gap-1 items-center px-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex items-center bg-background/50 border border-border/50 rounded-lg shadow-sm backdrop-blur-[1px]">
                                                        <button
                                                            onClick={() => copyToClipboard(msg.content, idx)}
                                                            className={cn("p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors", copiedIndex === idx && "text-green-500")}
                                                            title="Copy"
                                                        >
                                                            {copiedIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                                                        </button>
                                                        <div className="w-px h-3 bg-border" />
                                                        <button
                                                            onClick={() => handleLike(idx)}
                                                            className={cn("p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors", likedMessages.has(idx) && "text-blue-500")}
                                                            title="Helpful"
                                                        >
                                                            <ThumbsUp size={13} />
                                                        </button>
                                                        <div className="w-px h-3 bg-border" />
                                                        <button
                                                            onClick={() => handleDislike(idx)}
                                                            className={cn("p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors", dislikedMessages.has(idx) && "text-red-500")}
                                                            title="Not helpful"
                                                        >
                                                            <ThumbsDown size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                {isLoading && (
                                    <div className="self-start px-4 py-3 bg-background border border-border rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.32s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.16s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </main>

                            {/* Input Area */}
                            <footer className="p-4 bg-background border-t border-border shrink-0 z-10">
                                {selectedText && (
                                    <div className="mb-2 px-3 py-2 bg-muted/50 border border-border rounded-xl flex items-start justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Selected Context</span>
                                            <p className="text-xs text-muted-foreground line-clamp-2 italic">&quot;{selectedText}&quot;</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedText('')}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                <div className="relative flex items-end gap-2 bg-muted/30 border border-input rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary">
                                    <textarea
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Ask a question..."
                                        className="w-full pl-3 py-2.5 bg-transparent resize-none max-h-[120px] text-sm focus:outline-none placeholder:text-muted-foreground/70"
                                        rows={1}
                                        style={{ minHeight: '44px' }}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={isLoading || !input.trim()}
                                        className="p-2 mb-0.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-sm shrink-0"
                                    >
                                        <Send size={16} className={cn(isLoading && "opacity-0")} />
                                        {isLoading && <span className="absolute inset-0 m-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-center mt-3 gap-2">
                                    <p className="text-center text-[10px] text-muted-foreground mt-2">
                                        Powered by <a href="https://abdulrafay.online" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline text-foreground">Abdul Rafay Khan</a>
                                    </p>
                                </div>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
