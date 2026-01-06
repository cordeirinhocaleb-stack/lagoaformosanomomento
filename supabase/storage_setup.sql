
-- =====================================================
-- SETUP STORAGE PARA UPLOAD UNIVERSAL
-- Bucket: site-media
-- =====================================================

-- 1. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('site-media', 'site-media', true, false, 104857600, ARRAY['image/*', 'video/*']) -- 100MB Limit
ON CONFLICT (id) DO UPDATE SET file_size_limit = 104857600;

-- 2. Política de Leitura Pública
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'site-media' );

-- 3. Política de Upload Autenticado (Qualquer usuário logado)
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-media' 
  AND auth.role() = 'authenticated'
);

-- 4. Política de Update/Delete (Apenas dono ou admin)
CREATE POLICY "Owner Manage" ON storage.objects FOR ALL
USING (
  bucket_id = 'site-media' 
  AND (auth.uid() = owner OR text(auth.uid()) = (storage.foldername(name))[1])
);
