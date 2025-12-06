-- Email Verification Codes Table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    verified BOOLEAN DEFAULT FALSE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(code);

-- RLS Policies
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can only read their own verification codes
CREATE POLICY "Users can view their own verification codes"
    ON email_verification_codes
    FOR SELECT
    USING (auth.email() = user_email);

-- Service role can insert codes (this will be done via API)
CREATE POLICY "Service role can insert verification codes"
    ON email_verification_codes
    FOR INSERT
    WITH CHECK (true);

-- Service role can update codes
CREATE POLICY "Service role can update verification codes"
    ON email_verification_codes
    FOR UPDATE
    USING (true);

-- Function to generate 6-digit verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to verify email code
CREATE OR REPLACE FUNCTION verify_email_code(
    p_email TEXT,
    p_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    -- Check if code exists, is not expired, and not already verified
    SELECT EXISTS (
        SELECT 1
        FROM email_verification_codes
        WHERE user_email = p_email
        AND code = p_code
        AND expires_at > NOW()
        AND verified = FALSE
    ) INTO v_valid;
    
    -- If valid, mark as verified
    IF v_valid THEN
        UPDATE email_verification_codes
        SET verified = TRUE
        WHERE user_email = p_email
        AND code = p_code;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old verification codes (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_codes
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
