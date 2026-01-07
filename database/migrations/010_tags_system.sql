
-- Migration: 010_tags_system
-- Description: Create tags table for autocomplete and usage tracking

CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast autocomplete (startsWith) and sorting
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON tags (usage_count DESC);

-- RLS Policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON tags;
CREATE POLICY "Enable read access for all users" ON tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tags;
CREATE POLICY "Enable insert for authenticated users only" ON tags FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tags;
CREATE POLICY "Enable update for authenticated users only" ON tags FOR UPDATE USING ((select auth.role()) = 'authenticated');
