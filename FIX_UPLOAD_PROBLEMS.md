# 🔧 Corrigir Problemas de Upload (Fotos e Vídeos)

## ❌ Problemas Relatados

1. **Fotos não salvam** - Erro ao fazer upload de imagens
2. **Vídeos não salvam** - Erro ao adicionar links do YouTube

---

## ✅ SOLUÇÃO 1: Configurar Storage para Fotos

### Problema: Fotos Não Salvam

**Causa**: Bucket de storage não configurado ou políticas faltando.

### Passo 1: Criar o Bucket Manualmente (MAIS FÁCIL)

#### Opção A: Via Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/storage/buckets

2. Clique em **"Create a new bucket"** (botão verde)

3. Preencha:
   - **Name**: `couple-photos`
   - **Public bucket**: ✅ **Marque esta opção!**
   - **File size limit**: 50 MB (padrão está ok)
   - **Allowed MIME types**: deixe vazio (aceita todos)

4. Clique em **"Create bucket"**

5. ✅ **Pronto!** O bucket foi criado.

#### Opção B: Via SQL (Se a Opção A não funcionar)

1. Acesse: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql/new

2. Copie e cole o conteúdo do arquivo **`fix-storage.sql`**

3. Clique em **RUN**

4. Aguarde até ver "Success"

---

### Passo 2: Configurar Políticas de Storage

Ainda no SQL Editor, execute:

```sql
-- Políticas de Storage
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'couple-photos'
);

CREATE POLICY "Public can view photos" 
ON storage.objects
FOR SELECT 
TO public
USING (
  bucket_id = 'couple-photos'
);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'couple-photos'
);
```

---

### Passo 3: Testar Upload de Foto

1. Volte para: http://localhost:3000

2. Clique em **"Upload Photo"**

3. Selecione uma imagem

4. ✅ **Deve funcionar agora!**

---

## ✅ SOLUÇÃO 2: Verificar Políticas de Vídeos

### Problema: Vídeos do YouTube Não Salvam

**Causa**: Política RLS de INSERT na tabela `youtube_videos` pode estar faltando.

### Passo 1: Verificar se a Tabela Existe

Execute no SQL Editor:

```sql
SELECT * FROM youtube_videos LIMIT 1;
```

Se der erro, execute o `supabase-setup.sql` completo.

---

### Passo 2: Adicionar Política de INSERT

Execute no SQL Editor:

```sql
-- Remover política antiga (se existir)
DROP POLICY IF EXISTS "Users can insert videos to their couple" ON youtube_videos;

-- Criar política correta
CREATE POLICY "Users can insert videos to their couple" 
ON youtube_videos
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM couples
    WHERE couples.id = youtube_videos.couple_id
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  )
);
```

---

### Passo 3: Testar Adicionar Vídeo

1. Volte para: http://localhost:3000

2. Clique em **"Add Video"**

3. Cole um link do YouTube, por exemplo:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

4. Clique em **"Add"**

5. ✅ **Deve funcionar agora!**

---

## 🔍 Verificação de Problemas

### Para Fotos:

Abra o Console do Navegador (F12) e tente fazer upload. Procure por erros:

**Erro Comum 1:**
```
POST .../storage/v1/object/couple-photos 404 (Not Found)
```
**Solução**: O bucket não existe. Execute **Solução 1 - Passo 1**

**Erro Comum 2:**
```
POST .../storage/v1/object/couple-photos 403 (Forbidden)
```
**Solução**: Faltam políticas. Execute **Solução 1 - Passo 2**

**Erro Comum 3:**
```
POST .../storage/v1/object/couple-photos 401 (Unauthorized)
```
**Solução**: Você não está logado. Faça login novamente.

---

### Para Vídeos:

Abra o Console do Navegador (F12) e tente adicionar vídeo:

**Erro Comum 1:**
```
POST .../rest/v1/youtube_videos 403 (Forbidden)
```
**Solução**: Falta política de INSERT. Execute **Solução 2 - Passo 2**

**Erro Comum 2:**
```
POST .../rest/v1/youtube_videos 400 (Bad Request)
```
**Solução**: URL do YouTube inválida ou couple_id não existe.

---

## 📋 Checklist Completo

Execute estes passos na ordem:

### Banco de Dados:
- [ ] Executar `supabase-setup.sql` completo
- [ ] Verificar que a tabela `couples` existe
- [ ] Verificar que a tabela `photos` existe
- [ ] Verificar que a tabela `youtube_videos` existe

### Storage (Fotos):
- [ ] Criar bucket `couple-photos` no Supabase Dashboard
- [ ] Marcar como **público**
- [ ] Executar políticas de storage
- [ ] Testar upload de foto

### Vídeos:
- [ ] Verificar política de INSERT em `youtube_videos`
- [ ] Testar adicionar vídeo do YouTube

### Couple Profile:
- [ ] Criar perfil do casal
- [ ] Verificar que couple_id está definido

---

## 🆘 Ainda Não Funciona?

### Debug Rápido:

1. **Abra o Console (F12)**

2. **Execute estes comandos:**

```javascript
// Verificar autenticação
const { data: session } = await supabase.auth.getSession()
console.log('Logged in:', !!session.session)
console.log('User ID:', session.session?.user?.id)

// Verificar couple
const { data: couple } = await supabase
  .from('couples')
  .select('*')
  .single()
console.log('Couple:', couple)

// Verificar bucket
const { data: buckets } = await supabase.storage.listBuckets()
console.log('Buckets:', buckets)

// Testar upload (substitua com arquivo real)
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
const { data, error } = await supabase.storage
  .from('couple-photos')
  .upload(`${session.session?.user?.id}/test.jpg`, file)
console.log('Upload test:', { data, error })
```

3. **Me envie o resultado!**

---

## 📂 Estrutura de Armazenamento

As fotos são salvas assim:

```
couple-photos/
  └── {user_id}/
      └── {timestamp}_{filename}.jpg
```

Exemplo:
```
couple-photos/
  └── abc-123-def-456/
      └── 1703765432_minha_foto.jpg
```

---

## 🎯 Scripts SQL Prontos

Copiei tudo para arquivos separados:

1. **`fix-storage.sql`** - Configurar storage completo
2. **`fix-couples-insert.sql`** - Corrigir política de couples
3. **`supabase-setup.sql`** - Setup completo (já atualizado)

---

## ✅ Resumo Visual

```
ANTES:
[Upload Photo] → ❌ Erro 403/404
[Add Video]    → ❌ Erro 403

DEPOIS:
[Upload Photo] → ✅ Foto salva e aparece!
[Add Video]    → ✅ Vídeo adicionado!
```

---

## 🔗 Links Úteis

- **Storage Dashboard**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/storage/buckets
- **SQL Editor**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql
- **Tabelas**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/editor

---

**Última Atualização**: 28 de Dezembro de 2025  
**Status**: ✅ Soluções Prontas para Aplicar

