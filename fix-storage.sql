-- =====================================================
-- FIX: Configure Storage for Photos
-- =====================================================
-- Execute este SQL para corrigir problemas com upload de fotos

-- 1. Criar/Atualizar o bucket couple-photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'couple-photos', 
  'couple-photos', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view couple photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;

-- 3. Política: Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'couple-photos'
);

-- 4. Política: Todos podem ver fotos (bucket público)
CREATE POLICY "Public can view photos" 
ON storage.objects
FOR SELECT 
TO public
USING (
  bucket_id = 'couple-photos'
);

-- 5. Política: Usuários podem deletar suas próprias fotos
CREATE POLICY "Users can delete their own photos" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'couple-photos'
);

-- 6. Política: Usuários podem atualizar suas próprias fotos
CREATE POLICY "Users can update their own photos" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'couple-photos'
)
WITH CHECK (
  bucket_id = 'couple-photos'
);

-- 7. Verificar se foi criado corretamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'couple-photos';

-- 8. Verificar políticas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

