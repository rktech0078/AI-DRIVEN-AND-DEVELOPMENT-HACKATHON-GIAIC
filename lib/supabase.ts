import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to generate 6-digit code
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Helper function to send verification code
export async function sendVerificationCode(email: string): Promise<string> {
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const { error } = await supabase
        .from('email_verification_codes')
        .insert({
            user_email: email,
            code: code,
            expires_at: expiresAt.toISOString(),
        })

    if (error) {
        console.error('Error saving verification code:', error)
        throw new Error('Failed to send verification code')
    }

    // In production, you would send this code via email
    // For development, we'll just log it and show in alert
    console.log(`Verification code for ${email}: ${code}`)

    // Show alert in development mode
    if (typeof window !== 'undefined') {
        alert(`Development Mode: Verification code for ${email} is: ${code}\n\nCopy this code and enter it on the verification page.`)
    }

    return code
}

// Helper function to verify code
export async function verifyCode(email: string, code: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('verify_email_code', {
        p_email: email,
        p_code: code,
    })

    if (error) {
        console.error('Error verifying code:', error)
        return false
    }

    return data as boolean
}
