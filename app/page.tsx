"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Brain, Component, Cpu, Globe, Layers, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-6 backdrop-blur-sm transition-colors hover:bg-muted/50"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    )
}

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-32 text-center overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                        <span>The Future of Robotics is Here</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                        Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Physical AI</span> &
                        <br className="hidden sm:block" /> Humanoid Robotics
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
                        A comprehensive, AI-native textbook designed to bridge the gap between digital intelligence and the physical world. Learn ROS 2, Embodied AI, and Humanoid Control.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/docs"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-0.5"
                        >
                            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="https://github.com/panaversity/physical-ai-hackathon"
                            target="_blank"
                            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-8 py-3 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
                        >
                            View on GitHub
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="container max-w-6xl mx-auto px-4 pb-24">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={Brain}
                        title="Embodied Intelligence"
                        description="Understand how AI interacts with the physical world through sensors and actuators."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Layers}
                        title="ROS 2 Architecture"
                        description="Master the Robot Operating System 2, the industry standard for robotics middleware."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Cpu}
                        title="Hardware Control"
                        description="Learn to interface with real hardware, from servo motors to advanced sensors."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Simulation & Sim2Real"
                        description="Train in Gazebo/Isaac Sim and transfer policies to real-world robots."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={Component}
                        title="Humanoid Locomotion"
                        description="Deep dive into bipedal walking, balance, and dynamic motion control."
                        delay={0.5}
                    />
                    <FeatureCard
                        icon={Zap}
                        title="VLA Models"
                        description="Explore Vision-Language-Action models and the cutting edge of foundation models for robotics."
                        delay={0.6}
                    />
                </div>
            </section>
        </div>
    )
}
