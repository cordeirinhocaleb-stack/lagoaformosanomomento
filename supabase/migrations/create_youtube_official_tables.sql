-- YouTube Official Configuration Table
-- Stores user's YouTube authentication and default metadata settings

CREATE TABLE IF NOT EXISTS youtube_official_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    google_access_token TEXT,
    google_refresh_token TEXT,
    channel_id TEXT,
    channel_name TEXT,
    
    -- Default metadata for all uploads
    default_title TEXT DEFAULT 'Notícia LFNM',
    default_description TEXT DEFAULT 'Vídeo exclusivo Portal Lagoa Formosa No Momento.',
    default_tags TEXT[] DEFAULT ARRAY['lagoa formosa', 'noticias', 'lfnm'],
    default_privacy TEXT CHECK (default_privacy IN ('public', 'unlisted', 'private')) DEFAULT 'public',
    default_category_id TEXT DEFAULT '25', -- News & Politics
    default_made_for_kids BOOLEAN DEFAULT false,
    
    -- Additional metadata fields
    default_embeddable BOOLEAN DEFAULT true,
    default_license TEXT DEFAULT 'youtube',
    default_language TEXT DEFAULT 'pt-BR',
    default_comments_policy TEXT DEFAULT 'allow',
    default_notify_subscribers BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one config per user
    UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_youtube_configs_user_id ON youtube_official_configs(user_id);

-- Upload History Table
-- Tracks all file uploads (YouTube and Cloudinary) for auditing and debugging

CREATE TABLE IF NOT EXISTS upload_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File information
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT, -- 'video' or 'image'
    local_id TEXT, -- Reference to IndexedDB
    
    -- Upload details
    destination TEXT NOT NULL CHECK (destination IN ('youtube', 'cloudinary', 'instagram', 'facebook', 'tiktok')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'uploading', 'completed', 'failed')) DEFAULT 'pending',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Results
    final_url TEXT,
    youtube_video_id TEXT, -- For YouTube uploads
    error_message TEXT,
    
    -- Metadata (JSON for flexibility)
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Related news item (if applicable)
    news_id UUID REFERENCES news(id) ON DELETE SET NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_upload_history_user_id ON upload_history(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_status ON upload_history(status);
CREATE INDEX IF NOT EXISTS idx_upload_history_destination ON upload_history(destination);
CREATE INDEX IF NOT EXISTS idx_upload_history_created_at ON upload_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_history_news_id ON upload_history(news_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_youtube_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS youtube_config_updated_at_trigger ON youtube_official_configs;
CREATE TRIGGER youtube_config_updated_at_trigger
    BEFORE UPDATE ON youtube_official_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_youtube_config_updated_at();

-- RLS Policies for youtube_official_configs
ALTER TABLE youtube_official_configs ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own config
CREATE POLICY youtube_config_user_policy ON youtube_official_configs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for upload_history
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own upload history
CREATE POLICY upload_history_user_policy ON upload_history
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all upload history (optional)
CREATE POLICY upload_history_admin_policy ON upload_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Comments
COMMENT ON TABLE youtube_official_configs IS 'Stores YouTube Official configuration and default metadata for each user';
COMMENT ON TABLE upload_history IS 'Tracks all file uploads to various destinations for auditing and debugging';
COMMENT ON COLUMN youtube_official_configs.google_access_token IS 'Google OAuth access token (should be encrypted in production)';
COMMENT ON COLUMN youtube_official_configs.google_refresh_token IS 'Google OAuth refresh token for automatic token renewal';
COMMENT ON COLUMN upload_history.local_id IS 'Reference to file in IndexedDB before upload';
COMMENT ON COLUMN upload_history.metadata IS 'Flexible JSON field for storing upload-specific metadata';
