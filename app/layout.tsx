import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import AiAgent from '@/components/ai-agent/AiAgent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Physical AI & Humanoid Robotics',
  description: 'A complete AI-native, robotics-first textbook designed for the Panaversity Hackathon.',
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
            <AiAgent />
          </div>
        </Providers>
      </body>
    </html>
  )
}
