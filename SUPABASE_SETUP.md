# Couple Moments - Supabase Setup Guide

Este guia ajudará você a configurar o Supabase para o projeto Couple Moments.

## 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha os detalhes:
   - **Project Name**: couple-moments
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
4. Clique em "Create new project" e aguarde a criação

## 2. Obter Credenciais

1. Após a criação, vá para **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (chave pública) → `VITE_SUPABASE_ANON_KEY`

## 3. Executar SQL de Setup

1. No Supabase, vá para **SQL Editor**
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em "Run"

Isso criará todas as tabelas, índices, políticas RLS e dados iniciais.

## 4. Configurar Storage

1. Vá para **Storage** no menu lateral
2. Clique em "New bucket"
3. Nome: `couple-photos`
4. Marque "Public bucket"
5. Clique em "Create bucket"

## 5. Configurar Autenticação

1. Vá para **Authentication → Providers**
2. Habilite "Google" (ou outros provedores desejados)
3. Configure as credenciais OAuth do Google:
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um novo projeto
   - Habilite Google+ API
   - Crie credenciais OAuth 2.0
   - Copie Client ID e Client Secret
   - Cole no Supabase

## 6. Configurar RLS (Row Level Security)

As políticas RLS já foram criadas pelo SQL de setup, mas você pode verificar em:

1. Vá para **Authentication → Policies**
2. Verifique se as políticas estão habilitadas para cada tabela

## 7. Testar Conexão

O projeto já testa a conexão automaticamente. Se tudo estiver funcionando:

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste o login.

## Estrutura de Dados

### Tabelas

- **couples**: Armazena informações de casais
  - `id`: UUID primária
  - `user1_id`: ID do primeiro usuário
  - `user2_id`: ID do segundo usuário
  - `relationship_start_date`: Data do início do relacionamento
  - `couple_name`: Nome do casal

- **photos**: Armazena metadados de fotos
  - `id`: UUID primária
  - `couple_id`: Referência ao casal
  - `s3_url`: URL pública da foto no Storage
  - `description`: Descrição da foto

- **youtube_videos**: Armazena vídeos do YouTube
  - `id`: UUID primária
  - `couple_id`: Referência ao casal
  - `video_id`: ID do vídeo YouTube
  - `title`: Título do vídeo
  - `thumbnail`: URL da miniatura

- **romantic_phrases**: Frases românticas pré-carregadas
  - `id`: UUID primária
  - `phrase`: Texto da frase
  - `category`: Categoria (Love, Romance, Appreciation)
  - `author`: Autor da frase

## Políticas RLS

- Usuários só podem ver dados do seu próprio casal
- Usuários só podem deletar seus próprios uploads
- Frases românticas são públicas (leitura)

## Troubleshooting

### Erro de conexão
- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos
- Teste a conexão em `http://localhost:3000`

### Erro ao fazer upload de fotos
- Verifique se o bucket `couple-photos` existe
- Verifique se o bucket está marcado como "Public"

### Erro de autenticação
- Verifique se o Google OAuth está configurado
- Limpe cookies e tente novamente

## Próximos Passos

1. Customize as frases românticas em `supabase-setup.sql`
2. Configure domínio customizado
3. Implante em produção

Para mais informações, consulte a [documentação do Supabase](https://supabase.com/docs).
