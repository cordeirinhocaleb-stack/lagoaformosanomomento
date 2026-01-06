-- =====================================================
-- ENSURE FEATURED_PRIORITY COLUMN
-- Version: 1.197
-- Date: 06/01/2026
-- Description: Ensures the featured_priority column exists in news table to prevent "column not found" errors.
-- =====================================================

DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='featured_priority') THEN
        ALTER TABLE public.news ADD COLUMN featured_priority INTEGER DEFAULT 0;
    END IF;
END $$;
