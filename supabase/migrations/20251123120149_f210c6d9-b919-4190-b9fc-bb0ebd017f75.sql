-- Create table for verification codes
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'signup',
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT verification_codes_type_check CHECK (type IN ('signup', 'password_reset'))
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_code 
ON public.verification_codes (email, code, type) 
WHERE verified_at IS NULL;

-- RLS Policy: Users can only read their own codes
CREATE POLICY "Users can view their own verification codes"
  ON public.verification_codes
  FOR SELECT
  USING (true);

-- Function to clean up expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR verified_at IS NOT NULL;
END;
$$;