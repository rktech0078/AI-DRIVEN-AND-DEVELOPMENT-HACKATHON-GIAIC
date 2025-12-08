'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    onClick={scrollToTop}
                    className={cn(
                        "fixed z-40 bg-zinc-900/80 dark:bg-zinc-100/80 backdrop-blur-sm text-zinc-50 dark:text-zinc-900",
                        "rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110",
                        "border border-zinc-700 dark:border-zinc-200",
                        // Positioning: Bottom right, but shifted up to allow space for the AI Agent (which is bottom-6)
                        // Using bottom-[5.5rem] (approx 88px) or bottom-24 (96px) to sit comfortably above it.
                        "bottom-24 right-6"
                    )}
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={20} strokeWidth={2.5} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
