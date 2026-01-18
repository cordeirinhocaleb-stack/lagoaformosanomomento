-- Migration to add site_credits and other missing columns to users table

-- Add site_credits (Numeric/Decimal for currency)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS site_credits numeric DEFAULT 0;

-- Add subscription date columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_start timestamptz,
ADD COLUMN IF NOT EXISTS subscription_end timestamptz;

-- Add custom_limits (JSONB)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS custom_limits jsonb DEFAULT '{}'::jsonb;

-- Add terms acceptance columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Grant permissions just in case
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.users TO service_role;
