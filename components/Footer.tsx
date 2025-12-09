'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, Variants } from 'framer-motion';
import { Github, Linkedin, Facebook, Youtube, Globe, ArrowUpRight, Network, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const SOCIAL_LINKS = [
    { name: 'Portfolio', url: 'https://abdulrafay.online', icon: Globe, color: 'text-emerald-500' },
    { name: 'GitHub', url: 'https://github.com/rktech0078', icon: Github, color: 'text-zinc-900 dark:text-white' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/abdul-rafay-khan-2780b12b5/', icon: Linkedin, color: 'text-blue-600' },
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100051895934107', icon: Facebook, color: 'text-blue-500' },
    { name: 'YouTube', url: 'https://www.youtube.com/@RKTECH-hf6yz', icon: Youtube, color: 'text-red-500' },
];

const TICKER_ITEMS = [
    "Sim-to-Real", "ROS 2", "VLA Models", "Reinforcement Learning", "Computer Vision",
    "Humanoid Dynamics", "SLAM", "Edge AI", "NVIDIA Isaac Sim", "Mujoco"
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

function SocialButton({ link }: { link: typeof SOCIAL_LINKS[0] }) {
    const ref = useRef<HTMLAnchorElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = (mouseX / width - 0.5) * 50; // Increased range
        const yPct = (mouseY / height - 0.5) * 50;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            ref={ref}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center justify-center w-12 h-12 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/50 z-10 backdrop-blur-sm"
        >
            <link.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", link.color)} />
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 0, y: 10, scale: 0.8 }}
                whileHover={{ opacity: 1, y: -45, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap pointer-events-none shadow-xl"
            >
                {link.name}
            </motion.div>
        </motion.a>
    );
}

export function Footer() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <footer ref={containerRef} className="relative mt-32 border-t border-zinc-200/[0.8] dark:border-zinc-800/[0.8] bg-white/60 dark:bg-black/60 backdrop-blur-2xl overflow-hidden selection:bg-emerald-500/30">
            {/* Background Details */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

            {/* Glowing Top Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-400/30 dark:via-zinc-500/30 to-transparent" />

            <motion.div
                className="container mx-auto px-6 py-24 relative z-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">

                    {/* Brand Section */}
                    <div className="space-y-10">
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="flex items-center gap-4 group cursor-default">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-500">
                                    <Bot className="w-6 h-6 text-zinc-900 dark:text-zinc-100 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                        Physical AI
                                    </h2>
                                    <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">Robotics & Humanoids</p>
                                </div>
                            </div>

                            <p className="text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed text-base font-light">
                                Pioneering the future of embodied intelligence. A comprehensive resource for sim-to-real transfer, reinforcement learning, and humanoid dynamics.
                            </p>
                        </motion.div>

                        {/* Interactive Ticker */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Systems Active
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {TICKER_ITEMS.map((item, i) => (
                                    <motion.span
                                        key={i}
                                        whileHover={{ scale: 1.05, backgroundColor: "var(--hover-bg)", borderColor: "var(--hover-border)" }}
                                        className="px-3 py-1.5 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg text-[11px] font-medium text-zinc-500 dark:text-zinc-400 transition-colors cursor-default hover:text-zinc-900 dark:hover:text-zinc-200"
                                        style={{ "--hover-bg": "rgba(16, 185, 129, 0.1)", "--hover-border": "rgba(16, 185, 129, 0.2)" } as React.CSSProperties}
                                    >
                                        {item}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Designer / Connection Section */}
                    <motion.div variants={itemVariants} className="flex flex-col lg:items-end space-y-10">

                        <div className="space-y-6 text-left lg:text-right w-full">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Connect Network</h3>
                            <div className="flex flex-wrap gap-4 lg:justify-end">
                                {SOCIAL_LINKS.map((link) => (
                                    <SocialButton key={link.name} link={link} />
                                ))}
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/40 max-w-sm ml-auto relative group overflow-hidden w-full cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-2xl rounded-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                                        <Network size={14} />
                                    </div>
                                    Architect & Developer
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300">
                                        Abdul Rafay Khan
                                    </h4>
                                    <a
                                        href="https://abdulrafay.online"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group/link"
                                    >
                                        <span className="border-b border-transparent group-hover/link:border-zinc-900 dark:group-hover/link:border-white transition-all">abdulrafay.online</span>
                                        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div variants={itemVariants} className="mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-zinc-400 font-medium">
                        © {new Date().getFullYear()} Physical AI. All systems nominal.
                    </p>
                    <div className="flex items-center gap-8 text-xs text-zinc-400 font-medium">
                        <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors relative group">
                            Privacy Policy
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-zinc-900 dark:bg-white transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <Link href="https://ai-hackathon-giaic.vercel.app/docs" className="hover:text-zinc-900 dark:hover:text-white transition-colors relative group">
                            Documentation
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-zinc-900 dark:bg-white transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            v12.9.0 Stable
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
}
