'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserAvatar() {
    const { user, signOut, loading } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await signOut()
            setIsOpen(false)
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (loading) {
        return <div className="avatar-loading">...</div>
    }

    if (!user) {
        return (
            <div className="auth-buttons">
                <Link href="/auth/login" className="auth-nav-btn login-btn">
                    Login
                </Link>
                <Link href="/auth/signup" className="auth-nav-btn signup-btn">
                    Sign Up
                </Link>
            </div>
        )
    }

    const username = user.user_metadata?.username || 'User'
    const email = user.email || ''
    const initials = username.substring(0, 2).toUpperCase()

    return (
        <div className="user-avatar-container" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="avatar-button"
                aria-label="User menu"
            >
                <div className="avatar-circle">
                    {initials}
                </div>
            </button>

            {isOpen && (
                <div className="avatar-dropdown">
                    <div className="avatar-dropdown-header">
                        <div className="avatar-circle-large">
                            {initials}
                        </div>
                        <div className="avatar-info">
                            <div className="avatar-username">{username}</div>
                            <div className="avatar-email">{email}</div>
                        </div>
                    </div>

                    <div className="avatar-dropdown-divider"></div>

                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}
