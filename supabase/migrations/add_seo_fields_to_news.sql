-- Add SEO fields to news table

-- Add slug column (unique URL identifier)
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add canonical URL
ALTER TABLE news ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Add SEO metadata
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- Add Open Graph image
ALTER TABLE news ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add structured data (JSON-LD)
ALTER TABLE news ADD COLUMN IF NOT EXISTS structured_data JSONB;

-- Add SEO score (0-100)
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_seo_score ON news(seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_canonical_url ON news(canonical_url);

-- Add comments for documentation
COMMENT ON COLUMN news.slug IS 'SEO-friendly URL slug in format: [title]-[date]-[city]-[filter]';
COMMENT ON COLUMN news.canonical_url IS 'Full canonical URL for the article';
COMMENT ON COLUMN news.seo_title IS 'Optimized title for search engines (50-60 chars)';
COMMENT ON COLUMN news.seo_description IS 'Optimized meta description (150-160 chars)';
COMMENT ON COLUMN news.seo_keywords IS 'Array of keywords for SEO';
COMMENT ON COLUMN news.og_image IS 'Open Graph image URL for social sharing';
COMMENT ON COLUMN news.structured_data IS 'Schema.org NewsArticle structured data (JSON-LD)';
COMMENT ON COLUMN news.seo_score IS 'SEO quality score from 0-100';
