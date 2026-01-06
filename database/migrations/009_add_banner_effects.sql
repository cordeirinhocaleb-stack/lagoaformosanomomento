-- Add banner_effects column to news table for Per-Image Effects feature
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_effects JSONB DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN news.banner_effects IS 'Stores individual effects (brightness, contrast, etc.) for each banner image as a JSON array.';
