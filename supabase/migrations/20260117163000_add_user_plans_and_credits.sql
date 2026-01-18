-- Migration to add active_plans and usage_credits to users table

-- Add active_plans column (Array of Text)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS active_plans text[] DEFAULT '{}';

-- Add usage_credits column (JSONB)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS usage_credits jsonb DEFAULT '{}'::jsonb;

-- Grant permissions if necessary (usually authenticated role has access by default RLS, but explicit grant is safe)
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.users TO service_role;
