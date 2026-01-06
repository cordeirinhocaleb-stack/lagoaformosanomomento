-- =====================================================
-- BANNER SYSTEM REFACTOR - DATABASE MIGRATION
-- Version: 1.173
-- Date: 2026-01-05
-- =====================================================

-- Step 1: Drop existing constraints if they exist (idempotent)
ALTER TABLE news DROP CONSTRAINT IF EXISTS check_banner_images_limit;
ALTER TABLE news DROP CONSTRAINT IF EXISTS check_banner_image_layout;
ALTER TABLE news DROP CONSTRAINT IF EXISTS check_banner_video_source;
ALTER TABLE news DROP CONSTRAINT IF EXISTS check_banner_youtube_status;

-- Step 2: Add new columns (IF NOT EXISTS)
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_image_layout TEXT DEFAULT 'carousel';
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_video_source TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_youtube_video_id TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_youtube_status TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_youtube_metadata JSONB;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_smart_playback BOOLEAN DEFAULT false;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_playback_segments JSONB;
ALTER TABLE news ADD COLUMN IF NOT EXISTS banner_segment_duration INTEGER DEFAULT 10;

-- Step 3: Add constraints
ALTER TABLE news ADD CONSTRAINT check_banner_images_limit 
    CHECK (jsonb_array_length(banner_images) <= 5);

ALTER TABLE news ADD CONSTRAINT check_banner_image_layout 
    CHECK (banner_image_layout IN ('carousel', 'grid', 'fade', 'split', 'mosaic'));

ALTER TABLE news ADD CONSTRAINT check_banner_video_source 
    CHECK (banner_video_source IS NULL OR banner_video_source IN ('internal', 'youtube'));

ALTER TABLE news ADD CONSTRAINT check_banner_youtube_status 
    CHECK (banner_youtube_status IS NULL OR banner_youtube_status IN ('uploading', 'processing', 'ready', 'failed'));

-- Step 4: Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_news_banner_youtube_video_id ON news(banner_youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_news_banner_youtube_status ON news(banner_youtube_status);

-- Step 5: Add comments
COMMENT ON COLUMN news.banner_images IS 'Array of up to 5 banner image URLs (JSONB)';
COMMENT ON COLUMN news.banner_image_layout IS 'Layout style: carousel, grid, fade, split, mosaic';
COMMENT ON COLUMN news.banner_video_source IS 'Video source: internal (Cloudinary) or youtube';
COMMENT ON COLUMN news.banner_youtube_video_id IS 'YouTube video ID if uploaded to YouTube';
COMMENT ON COLUMN news.banner_youtube_status IS 'YouTube upload status';
COMMENT ON COLUMN news.banner_youtube_metadata IS 'YouTube video metadata (title, description, tags, etc)';
COMMENT ON COLUMN news.banner_smart_playback IS 'Enable smart playback for videos >1min';
COMMENT ON COLUMN news.banner_playback_segments IS 'Array of playback segments {start, end}';
COMMENT ON COLUMN news.banner_segment_duration IS 'Duration of each playback segment in seconds';

-- Step 6: Migrate existing data
-- Convert old bannerImages (text[]) to new banner_images (jsonb) if needed
UPDATE news 
SET banner_images = to_jsonb("bannerImages")
WHERE "bannerImages" IS NOT NULL 
  AND banner_images = '[]'::jsonb;

-- Map old bannerVideoSource values
UPDATE news 
SET banner_video_source = 'internal'
WHERE "bannerVideoSource" = 'cloudinary';

-- Migrar bannerVideoSource de 'youtube' para 'youtube' (redundante, mas mantém consistência)
UPDATE news
SET banner_video_source = 'youtube'
WHERE "bannerVideoSource" = 'youtube';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- New fields added:
--   - banner_images (JSONB, max 5)
--   - banner_image_layout (TEXT)
--   - banner_video_source (TEXT)
--   - banner_youtube_video_id (TEXT)
--   - banner_youtube_status (TEXT)
--   - banner_youtube_metadata (JSONB)
--   - banner_smart_playback (BOOLEAN)
--   - banner_playback_segments (JSONB)
--   - banner_segment_duration (INTEGER)
-- =====================================================

-- ========================================
-- ROLLBACK SCRIPT (se necessário)
-- ========================================

-- Para reverter as mudanças:
-- ALTER TABLE news
--   DROP COLUMN IF EXISTS banner_images,
--   DROP COLUMN IF EXISTS banner_image_layout,
--   DROP COLUMN IF EXISTS banner_video_source,
--   DROP COLUMN IF EXISTS banner_youtube_video_id,
--   DROP COLUMN IF EXISTS banner_youtube_status,
--   DROP COLUMN IF EXISTS banner_youtube_metadata,
--   DROP COLUMN IF EXISTS banner_smart_playback,
--   DROP COLUMN IF EXISTS banner_playback_segments,
--   DROP COLUMN IF EXISTS banner_segment_duration;
