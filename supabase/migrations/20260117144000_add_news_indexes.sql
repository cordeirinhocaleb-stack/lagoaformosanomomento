-- Add indexes for News table performance and fix potential hydration issues logic if stored in DB? No, hydration is React.
-- Just indexes.

-- Index for ordering news by created_at (Used in home feed)
CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news(created_at DESC);

-- Index for filtering news by source (Used in PartnersStrip or widgets)
CREATE INDEX IF NOT EXISTS idx_news_source ON public.news(source);

-- Index for filtering by source + date (Used in query 3 of report)
CREATE INDEX IF NOT EXISTS idx_news_source_created_at ON public.news(source, "created_at" DESC);
