-- ============================================================================
-- MIGRATION 016: ADD MISSING USER COLUMNS
-- Date: 2026-01-11
-- Description: Add terms_accepted and other missing fields to the users table.
-- ============================================================================

DO $$ 
BEGIN 
    -- 1. Consent & Terms
    BEGIN ALTER TABLE public.users ADD COLUMN terms_accepted BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 2. Extended Profile
    BEGIN ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN bio TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN birthdate DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN zipcode TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN city TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN state TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN document TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN isVerified BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 3. Professional Identity
    BEGIN ALTER TABLE public.users ADD COLUMN profession TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN education TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN skills TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "professionalBio" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN availability TEXT; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 4. Commercial Identity
    BEGIN ALTER TABLE public.users ADD COLUMN "companyName" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "businessType" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "whatsappVisible" BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 5. Preferences & Settings
    BEGIN ALTER TABLE public.users ADD COLUMN "themePreference" TEXT DEFAULT 'light' CHECK ("themePreference" IN ('light', 'dark')); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "socialLinks" JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 6. Plans & Financial
    BEGIN ALTER TABLE public.users ADD COLUMN advertiser_plan TEXT DEFAULT 'free'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "activePlans" TEXT[] DEFAULT ARRAY['free']::TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "subscriptionStart" TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "subscriptionEnd" TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "usageCredits" JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "siteCredits" NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN custom_limits JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;

END $$;
