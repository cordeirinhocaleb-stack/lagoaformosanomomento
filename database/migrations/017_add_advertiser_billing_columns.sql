-- ============================================================================
-- MIGRATION: 017_add_advertiser_billing_columns
-- DESCRIPTION: Adiciona colunas financeiras detalhadas à tabela advertisers.
-- AUTHOR: Auto-Generated
-- DATE: 2026-01-25
-- ============================================================================

DO $$ 
BEGIN 
    -- 1. Status e Controle de Pagamento
    BEGIN ALTER TABLE public.advertisers ADD COLUMN is_paid BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN billing_status TEXT DEFAULT 'pending'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN billing_obs TEXT; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 2. Valores e Datas
    BEGIN ALTER TABLE public.advertisers ADD COLUMN billing_value NUMERIC(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN billing_due_date DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN start_date DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN end_date DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN billing_cycle TEXT DEFAULT 'monthly'; EXCEPTION WHEN duplicate_column THEN END;

    -- 3. Detalhes de Parcelamento e Juros
    BEGIN ALTER TABLE public.advertisers ADD COLUMN installments INTEGER DEFAULT 1; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN interest_rate NUMERIC(5,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN interest_free_installments INTEGER DEFAULT 1; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN late_fee NUMERIC(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN daily_interest NUMERIC(5,3) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN total_with_interest NUMERIC(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 4. Boleto e Identificadores
    BEGIN ALTER TABLE public.advertisers ADD COLUMN billing_barcode TEXT; EXCEPTION WHEN duplicate_column THEN END;

    -- 5. Outros
    BEGIN ALTER TABLE public.advertisers ADD COLUMN is_active BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN views INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN clicks INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN owner_id UUID REFERENCES public.users(id); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN redirect_type TEXT DEFAULT 'external'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN external_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN video_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN media_type TEXT DEFAULT 'image'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN transition_type TEXT DEFAULT 'fade'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN display_locations TEXT[] DEFAULT ARRAY['home_top', 'article_sidebar']; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN internal_page JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN coupons JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN popup_set JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN promo_banners JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN logo_urls JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN logo_icon TEXT; EXCEPTION WHEN duplicate_column THEN END;

END $$;
