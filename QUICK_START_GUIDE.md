# 🚀 Guia Rápido de Início

## ✅ Checklist Completo para Começar

### 1️⃣ Criar o Banco de Dados (OBRIGATÓRIO)

**❌ Se você ver essa tela:**
- ❌ Romantic Phrases aparecendo
- ❌ Photo Gallery vazia
- ❌ Our Playlist vazia
- ❌ MAS sem o Timer de Relacionamento no topo

**Significa que você precisa executar o SQL primeiro!**

#### Passo 1: Abra o SQL Editor
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql/new
```

#### Passo 2: Execute ESTE SQL (Atualizado e Completo)

Copie TODO o conteúdo do arquivo **`supabase-setup.sql`** e cole no SQL Editor, depois clique em **RUN**.

Ou copie e cole este SQL rápido:

```sql
-- 1. Criar tabela couples
CREATE TABLE IF NOT EXISTS couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID,
  couple_name TEXT,
  relationship_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
DROP POLICY IF EXISTS "Users can view their own couple" ON couples;
DROP POLICY IF EXISTS "Users can update their own couple" ON couples;
DROP POLICY IF EXISTS "Authenticated users can create couples" ON couples;

CREATE POLICY "Users can view their own couple" ON couples
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Users can update their own couple" ON couples
  FOR UPDATE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Authenticated users can create couples" ON couples
  FOR INSERT WITH CHECK (
    auth.uid() = user1_id
  );

-- 4. Criar tabelas auxiliares
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  s3_url TEXT NOT NULL,
  description TEXT,
  uploaded_by_user_id UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS romantic_phrases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS nas outras tabelas
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE romantic_phrases ENABLE ROW LEVEL SECURITY;

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
  FOR DELETE USING (
    uploaded_by_user_id = auth.uid()
  );

-- 7. Políticas para videos
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

-- 8. Política para romantic_phrases (público)
DROP POLICY IF EXISTS "Anyone can view romantic phrases" ON romantic_phrases;

CREATE POLICY "Anyone can view romantic phrases" ON romantic_phrases
  FOR SELECT USING (true);

-- 9. Inserir frases românticas de exemplo
INSERT INTO romantic_phrases (phrase, category, author) VALUES
('You make my heart skip a beat.', 'Romance', 'Unknown'),
('Every love story is beautiful, but ours is my favorite.', 'Romance', 'Unknown'),
('I love you more than yesterday, less than tomorrow.', 'Love', 'Unknown'),
('You are my today and all of my tomorrows.', 'Love', 'Unknown'),
('In you, I''ve found the love of my life and my closest, truest friend.', 'Appreciation', 'Unknown')
ON CONFLICT DO NOTHING;
```

#### Passo 3: Verificar
Após executar, você deve ver:
```
✅ SUCCESS
Created 4 tables
Created 12 policies
Inserted 5 phrases
```

---

### 2️⃣ Criar o Perfil do Casal

Agora volte para a aplicação: **http://localhost:3000**

Você vai ver uma tela grande e bonita dizendo:

```
💕 Create Your Couple Profile

Start your journey together by creating a couple profile...

[Create Couple Profile 💕]
```

#### Clique no botão e preencha:
1. **Couple Name**: Ex: "John & Sarah" ou "Nós Dois ❤️"
2. **Relationship Start Date**: A data que vocês começaram
3. Clique em **"Create Couple Profile"**

---

### 3️⃣ Pronto! Agora Sim! 🎉

Depois de criar o couple, você verá:

```
┌─────────────────────────────────────┐
│     💕 John & Sarah                 │
│  Your private space to celebrate    │
│         your love                   │
├─────────────────────────────────────┤
│                                     │
│  ⏱️ Our Journey Together            │
│  ┌───┬───┬───┬───┐                 │
│  │365│ 12│ 34│ 56│                 │
│  │Days│Hrs│Min│Sec│                 │
│  └───┴───┴───┴───┘                 │
│                                     │
│  💌 Romantic Phrases                │
│  "You make my heart skip..."        │
│                                     │
│  📸 Photo Gallery                   │
│  [Upload Photo]                     │
│                                     │
│  🎵 Our Playlist                    │
│  [Add Video]                        │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Ainda não aparece o botão "Create Couple Profile"?

1. **Abra o Console do Navegador** (F12)
2. Vá na aba **Console**
3. Procure por mensagens tipo:
   ```
   [DEBUG] Fetching couple for user: abc-123
   [DEBUG] Couple query result: { data: null, error: ... }
   ```

4. Se tiver erro, me envie!

### Erro 403 ao criar couple?

Execute o SQL do arquivo: **`fix-couples-insert.sql`**

### Tabelas não existem?

Execute o SQL completo do arquivo: **`supabase-setup.sql`**

---

## 📋 Ordem Correta dos Passos

```
1. ✅ Login feito
2. ✅ .env configurado
3. ⏳ SQL executado no Supabase ← VOCÊ ESTÁ AQUI
4. ⏳ Criar perfil do casal
5. ⏳ Adicionar fotos/vídeos
6. 🎉 Usar a aplicação!
```

---

## 🔗 Links Úteis

- **SQL Editor**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql
- **Tabelas**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/editor
- **Aplicação**: http://localhost:3000

---

**Siga esses passos na ordem e vai funcionar! 🚀**

Se algo der errado, abra o console (F12) e me mande os logs!

