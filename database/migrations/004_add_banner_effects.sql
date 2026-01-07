-- MIGRATION 004 (Bugfix)
-- Description: Adds missing banner_effects column for V2 Editor features.

DO $$ 
BEGIN 
    BEGIN 
        ALTER TABLE public.news ADD COLUMN banner_effects JSONB DEFAULT '[]'::jsonb; 
    EXCEPTION 
        WHEN duplicate_column THEN 
            RAISE NOTICE 'Column banner_effects already exists';
    END;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
