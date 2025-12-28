# Configurar Google OAuth no Supabase

## 🎯 Solução Rápida (Desenvolvimento)

### Passo 1: Acesse o Supabase Dashboard
Abra este link no seu navegador:
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/auth/providers
```

### Passo 2: Habilite o Google Provider

1. **Encontre "Google"** na lista de providers
2. **Clique no toggle** para ativar
3. **Marque a opção**: ✅ "Use Supabase's OAuth provider"
4. **Clique em "Save"**

**✅ Pronto! Você já pode fazer login com Google!**

---

## 🚀 Configuração Completa (Para Produção)

Se você quer usar suas próprias credenciais do Google (recomendado para produção):

### Passo 1: Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Nome sugerido: "Couple Moments"

### Passo 2: Ativar APIs Necessárias

1. No menu lateral, vá em **APIs & Services** > **Library**
2. Procure por "Google+ API"
3. Clique em **Enable**

### Passo 3: Criar Credenciais OAuth

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Configure a tela de consentimento (se solicitado):
   - User Type: **External**
   - App name: **Couple Moments**
   - User support email: seu email
   - Developer contact: seu email
   - Clique em **Save and Continue** até finalizar

4. Volte para criar o OAuth client ID:
   - Application type: **Web application**
   - Name: **Couple Moments Web**
   
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://nrmrsacjlwyqtzqvmhcn.supabase.co
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://nrmrsacjlwyqtzqvmhcn.supabase.co/auth/v1/callback
   ```

7. Clique em **Create**

### Passo 4: Copiar Credenciais

Você receberá:
- **Client ID**: algo como `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: algo como `GOCSPX-abc123def456`

**⚠️ Guarde essas credenciais em local seguro!**

### Passo 5: Configurar no Supabase

1. Volte para: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/auth/providers
2. Encontre **Google**
3. **Desmarque** "Use Supabase's OAuth provider"
4. Cole suas credenciais:
   - **Client ID**: Cole o Client ID do Google
   - **Client Secret**: Cole o Client Secret do Google
5. Clique em **Save**

---

## ✅ Testar a Autenticação

1. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

2. Abra o navegador em: http://localhost:5173

3. Clique no botão **"Sign in with Google"**

4. Você deverá ver a tela de login do Google

5. Após fazer login, você será redirecionado de volta para a aplicação

---

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa**: A URL de redirect não está autorizada no Google Cloud

**Solução**:
1. Verifique as URLs no Google Cloud Console
2. As URLs devem ser EXATAMENTE:
   ```
   https://nrmrsacjlwyqtzqvmhcn.supabase.co/auth/v1/callback
   ```
3. Aguarde alguns minutos para as mudanças propagarem

### Erro: "Invalid client"

**Causa**: Client ID ou Client Secret incorretos

**Solução**:
1. Verifique se copiou corretamente do Google Cloud Console
2. Não deve ter espaços no início ou fim
3. Recrie as credenciais se necessário

### Erro: "Access blocked: This app's request is invalid"

**Causa**: Tela de consentimento não configurada

**Solução**:
1. Configure a OAuth Consent Screen no Google Cloud
2. Adicione seu email como test user
3. Publique o app (se for para produção)

---

## 📋 Checklist de Configuração

Para desenvolvimento rápido (Opção A):
- [ ] Acessar Supabase Dashboard
- [ ] Habilitar Google Provider
- [ ] Marcar "Use Supabase's OAuth provider"
- [ ] Salvar
- [ ] Testar login

Para produção (Opção B):
- [ ] Criar projeto no Google Cloud
- [ ] Ativar Google+ API
- [ ] Criar OAuth Client ID
- [ ] Configurar URLs de redirect
- [ ] Copiar Client ID e Secret
- [ ] Configurar no Supabase
- [ ] Testar login em desenvolvimento
- [ ] Adicionar URLs de produção quando fizer deploy

---

## 🔐 Segurança

### Não Compartilhe:
- ❌ Client Secret
- ❌ Service Account Keys
- ❌ Supabase Service Role Key

### Pode Compartilhar:
- ✅ Client ID (é público)
- ✅ Supabase URL
- ✅ Supabase Anon Key

---

## 📖 Documentação Oficial

- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

**Última Atualização**: 28 de Dezembro de 2025  
**Projeto Supabase**: nrmrsacjlwyqtzqvmhcn  
**Status**: ✅ Guia Completo

