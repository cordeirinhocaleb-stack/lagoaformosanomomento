-- Migration 003: Feature Updates (SEO, Stats, Advertisers)
-- Description: Adds support for Site Visits tracking, News SEO slugs, and Advertiser click counting.

-- 1. Site Visits Table (New)
-- Used for the new Site Visit Counter feature.
CREATE TABLE IF NOT EXISTS site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    is_mobile BOOLEAN DEFAULT false,
    is_returning BOOLEAN DEFAULT false,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON site_visits(visitor_id);

-- 2. News Table Updates (SEO)
-- Ensure 'slug' column exists for SEO-friendly URLs.
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
-- Ensure 'seo' JSONB column exists for meta tags provided by the new SEO Editor.
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;

-- Index for faster slug lookups on the new dynamic route /news/[slug]
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);


-- 3. Advertisers Table Updates
-- Ensure 'clicks' column exists for the new Click Counter.
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Optional: RPC for Atomic Click Incrementing (Recommended)
-- Run this in the SQL Editor to create the function.
/*
CREATE OR REPLACE FUNCTION increment_advertiser_click(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE advertisers
  SET clicks = clicks + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
*/
