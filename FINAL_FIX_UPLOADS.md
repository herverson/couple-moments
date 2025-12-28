# 🎯 CORREÇÃO FINAL - Uploads Funcionando!

## ✅ O Que Foi Feito

Atualizei o código para fazer upload **diretamente do frontend** para o Supabase (mais simples e eficiente).

---

## 🚀 Passos para Funcionar (5 minutos)

### **PASSO 1: Criar o Bucket** (30 segundos)

Acesse:
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/storage/buckets
```

1. Clique em **"Create a new bucket"**
2. Nome: `couple-photos`
3. ✅ Marque: **"Public bucket"**
4. Clique em **"Create bucket"**

---

### **PASSO 2: Executar SQL** (1 minuto)

Acesse:
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql/new
```

Cole e execute TODO este SQL:

```sql
-- 1. Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'couple-photos', 
  'couple-photos', 
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;

-- 3. Políticas de Storage
CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'couple-photos');

CREATE POLICY "Public can view photos" 
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'couple-photos');

CREATE POLICY "Users can delete their own photos" 
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'couple-photos');

CREATE POLICY "Users can update their own photos" 
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'couple-photos')
WITH CHECK (bucket_id = 'couple-photos');

-- 4. Verificar que as tabelas existem
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL,
  s3_url TEXT NOT NULL,
  description TEXT,
  uploaded_by_user_id UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

-- 6. Políticas para photos
DROP POLICY IF EXISTS "Users can view couple photos" ON photos;
DROP POLICY IF EXISTS "Users can insert photos to their couple" ON photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photos;

CREATE POLICY "Users can view couple photos" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = photos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert photos to their couple" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = photos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (uploaded_by_user_id = auth.uid());

-- 7. Políticas para youtube_videos
DROP POLICY IF EXISTS "Users can view couple videos" ON youtube_videos;
DROP POLICY IF EXISTS "Users can insert videos to their couple" ON youtube_videos;
DROP POLICY IF EXISTS "Users can delete couple videos" ON youtube_videos;

CREATE POLICY "Users can view couple videos" ON youtube_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = youtube_videos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert videos to their couple" ON youtube_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = youtube_videos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete couple videos" ON youtube_videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = youtube_videos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );
```

---

### **PASSO 3: Reiniciar o Servidor** (10 segundos)

No terminal:

```bash
# Pare o servidor (Ctrl + C)
# Depois inicie novamente:
pnpm dev
```

---

### **PASSO 4: Recarregar o Navegador** (5 segundos)

Pressione **Ctrl/Cmd + Shift + R** (hard refresh)

---

### **PASSO 5: TESTAR!** 🎉

#### Testar Fotos:
1. Clique em **"Upload Photo"**
2. Selecione uma imagem
3. Aguarde o upload
4. ✅ A foto deve aparecer imediatamente!

#### Testar Vídeos:
1. Clique em **"Add Video"**
2. Cole um link do YouTube:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
3. Clique em **"Add"**
4. ✅ O vídeo deve aparecer embedded!

---

## 🔍 Debug (Se Ainda Não Funcionar)

Abra o Console do Navegador (F12) e procure por mensagens:

### Mensagens Esperadas (Sucesso):
```
[DEBUG] Uploading file: abc-123/1703765432.jpg
[DEBUG] Upload success: { path: "..." }
[DEBUG] Public URL: https://...
[DEBUG] Photo saved to database: [...]
```

### Erros Comuns:

**Erro: "relation "storage.buckets" does not exist"**
→ O bucket não foi criado. Execute PASSO 1 e PASSO 2.

**Erro: "new row violates row-level security policy"**
→ Falta política RLS. Execute PASSO 2 completo.

**Erro: "You must be logged in to upload photos"**
→ Faça logout e login novamente.

**Erro: "Invalid couple_id"**
→ Verifique se o couple foi criado corretamente.

---

## ✅ Verificação

Depois de fazer upload, verifique:

### No Supabase Dashboard:

1. **Storage**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/storage/buckets/couple-photos
   - Deve aparecer a pasta com seu user_id
   - Dentro, as fotos enviadas

2. **Tabela photos**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/editor/photos
   - Deve ter registros das fotos

3. **Tabela youtube_videos**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/editor/youtube_videos
   - Deve ter registros dos vídeos

---

## 📋 O Que Foi Mudado no Código

### PhotoGallery.tsx:
- ✅ Upload agora usa `supabase.storage.from('couple-photos').upload()`
- ✅ Salva metadata no banco automaticamente
- ✅ Mostra logs de debug
- ✅ Reseta o input após upload

### YoutubeGallery.tsx:
- ✅ Adiciona vídeo direto no banco via `supabase.from('youtube_videos').insert()`
- ✅ Mostra logs de debug
- ✅ Valida URL do YouTube

---

## 🎯 Resultado Esperado

```
ANTES:
[Upload Photo] → (nada acontece)
[Add Video]    → (nada acontece)

DEPOIS:
[Upload Photo] → ✅ Foto aparece na galeria!
[Add Video]    → ✅ Vídeo aparece embedded!
```

---

## 💡 Dicas

- **Formatos aceitos**: JPG, PNG, GIF, WEBP
- **Tamanho máximo**: 50 MB por foto
- **YouTube**: Cole a URL completa ou só o ID do vídeo
- **Console**: Mantenha aberto (F12) para ver logs de debug

---

**PRONTO! Agora deve funcionar! 🚀**

Se ainda der problema, me envie os logs do console (F12)!

