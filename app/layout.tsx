import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import AiAgent from '@/components/ai-agent/AiAgent'
import { Footer } from '@/components/Footer'
import GoogleOneTap from '@/components/auth/GoogleOneTap'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Physical AI & Humanoid Robotics',
  description: 'A complete AI-native, robotics-first textbook designed for the Panaversity Hackathon.',
  icons: {
    icon: '/img/robotic_logo_hd_1765213513157.png',
    shortcut: '/img/robotic_logo_hd_1765213513157.png',
    apple: '/img/robotic_logo_hd_1765213513157.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AiAgent />
            <GoogleOneTap />
          </div>
        </Providers>
      </body>
    </html>
  )
}
