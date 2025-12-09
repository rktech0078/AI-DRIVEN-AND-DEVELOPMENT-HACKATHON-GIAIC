"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    baseX: number
    baseY: number
    density: number
}

export function AntigravityBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { theme } = useTheme()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []
        let mouse = {
            x: -1000,
            y: -1000,
            radius: 150
        }

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.x
            mouse.y = e.y
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX
                mouse.y = e.touches[0].clientY
            }
        }

        const initParticles = () => {
            particles = []
            // Increased density: Smaller divisor = more particles. default was 15000
            const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 250)

            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 1
                const x = Math.random() * (canvas.width - size * 2) + size * 2
                const y = Math.random() * (canvas.height - size * 2) + size * 2
                const directionX = (Math.random() * 0.4) - 0.2
                const directionY = (Math.random() * 0.4) - 0.2

                // Colors matched to the brand (Blue/Violet)
                // We use HSLA to handle light/dark mode visibility dynamically via opacity if needed, 
                // but fixed colors look better for this specific branding.
                const colors = [
                    "rgba(59, 130, 246,", // Blue
                    "rgba(139, 92, 246,", // Violet
                    "rgba(99, 102, 241,"  // Indigo
                ]
                const randomColor = colors[Math.floor(Math.random() * colors.length)]

                particles.push({
                    x,
                    y,
                    vx: directionX,
                    vy: directionY,
                    size,
                    color: randomColor,
                    baseX: x,
                    baseY: y,
                    density: (Math.random() * 30) + 1
                })
            }
        }

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]

                // Movement
                p.x += p.vx
                p.y += p.vy

                // Boundary checks
                if (p.x + p.size > canvas.width || p.x - p.size < 0) p.vx = -p.vx
                if (p.y + p.size > canvas.height || p.y - p.size < 0) p.vy = -p.vy

                // Mouse interaction (Repel/Attract)
                const dx = mouse.x - p.x
                const dy = mouse.y - p.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance
                    const forceDirectionY = dy / distance
                    const maxDistance = mouse.radius
                    const force = (maxDistance - distance) / maxDistance
                    const directionX = forceDirectionX * force * p.density
                    const directionY = forceDirectionY * force * p.density

                    // Repel
                    p.x -= directionX
                    p.y -= directionY
                } else {
                    // Return to original speed/direction slowly? 
                    // Or just let them float. Floating is smoother for "antigravity".
                }

                // Draw
                // Opacity based on theme for visibility
                const opacity = theme === 'dark' ? '0.5)' : '0.3)'
                ctx.fillStyle = p.color + opacity
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
            }

            // Connect particles
            connect()
        }

        const connect = () => {
            const opacityValue = theme === 'dark' ? 0.05 : 0.03

            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x
                    const dy = particles[a].y - particles[b].y
                    const distance = dx * dx + dy * dy

                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        const opacity = 1 - (distance / 20000)
                        if (opacity > 0) {
                            ctx.strokeStyle = theme === 'dark'
                                ? `rgba(139, 92, 246, ${Math.min(opacity, opacityValue)})`
                                : `rgba(59, 130, 246, ${Math.min(opacity, opacityValue)})`
                            ctx.lineWidth = 1
                            ctx.beginPath()
                            ctx.moveTo(particles[a].x, particles[a].y)
                            ctx.lineTo(particles[b].x, particles[b].y)
                            ctx.stroke()
                        }
                    }
                }
            }
        }

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("touchmove", handleTouchMove)

        handleResize()
        animate()

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("touchmove", handleTouchMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [theme])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ width: "100%", height: "100%" }}
        />
    )
}
