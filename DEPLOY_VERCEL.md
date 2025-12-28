# 🚀 Deploy para Vercel - Guia Completo

## 📋 **PRÉ-REQUISITOS:**

✅ Conta no GitHub (para conectar repositório)
✅ Conta na Vercel (gratuita)
✅ Projeto Supabase configurado
✅ Código funcionando localmente

---

## 🎯 **PASSO A PASSO:**

### **1️⃣ PREPARAR O PROJETO**

#### **A) Criar arquivo `.gitignore` (se não existir)**

```bash
# No terminal, na raiz do projeto:
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage/

# Misc
.vercel
EOF
```

#### **B) Criar arquivo `.env.example`**

```bash
cat > .env.example << 'EOF'
# Supabase
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional
NODE_ENV=production
EOF
```

#### **C) Criar/Verificar `vercel.json`**

```bash
cat > vercel.json << 'EOF'
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": "dist/public",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
```

---

### **2️⃣ INICIALIZAR GIT (SE NECESSÁRIO)**

```bash
# Verificar se já tem git
git status

# Se não tiver, inicializar:
git init
git add .
git commit -m "Initial commit - Couple Moments"
```

---

### **3️⃣ CRIAR REPOSITÓRIO NO GITHUB**

1. Acesse: https://github.com/new
2. Nome: `couple-moments`
3. Deixe **PRIVADO** (recomendado)
4. **NÃO** marque "Initialize with README"
5. Clique em **"Create repository"**

#### **Conectar ao repositório:**

```bash
# Adicionar remote (substitua SEU_USUARIO)
git remote add origin git@github.com:SEU_USUARIO/couple-moments.git

# Ou se preferir HTTPS:
git remote add origin https://github.com/SEU_USUARIO/couple-moments.git

# Push inicial
git branch -M main
git push -u origin main
```

---

### **4️⃣ CONFIGURAR VERCEL**

#### **A) Criar conta/Login:**
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"** ou **"Log In"**
3. Use sua conta GitHub

#### **B) Importar Projeto:**
1. No dashboard, clique **"Add New..."** → **"Project"**
2. Clique em **"Import Git Repository"**
3. Selecione **"couple-moments"**
4. Clique em **"Import"**

#### **C) Configurar Build:**

```
Framework Preset: Vite
Root Directory: ./
Build Command: pnpm build
Output Directory: dist/public
Install Command: pnpm install
Node Version: 18.x ou 20.x
```

#### **D) Adicionar Environment Variables:**

```
VITE_SUPABASE_URL = https://nrmrsacjlwyqtzqvmhcn.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...seu_anon_key
```

**IMPORTANTE:** Use as mesmas credenciais que funcionam localmente!

#### **E) Deploy:**
1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. ✅ Deploy concluído!

---

## 🔐 **CONFIGURAR DOMÍNIO (OPCIONAL)**

### **Domínio Vercel Gratuito:**
```
https://seu-projeto.vercel.app
```

### **Domínio Personalizado:**
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

---

## 🛠️ **COMANDOS ÚTEIS:**

### **Atualizar Deploy (após mudanças):**

```bash
# Commit suas mudanças
git add .
git commit -m "Update: descrição das mudanças"
git push

# Vercel faz deploy automático! 🎉
```

### **Deploy Manual (CLI):**

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

---

## ⚙️ **CONFIGURAÇÕES IMPORTANTES:**

### **1. Supabase - Allowed Redirect URLs:**

1. Acesse Supabase Dashboard
2. Vá em **Authentication** → **URL Configuration**
3. Adicione:
   ```
   https://seu-projeto.vercel.app
   https://seu-projeto.vercel.app/*
   https://seu-projeto.vercel.app/auth/callback
   ```

### **2. Supabase - Site URL:**

```
https://seu-projeto.vercel.app
```

---

## 🧪 **TESTAR DEPLOY:**

### **Checklist:**

```
✅ Site carrega
✅ Login funciona
✅ Supabase conecta
✅ Upload de fotos funciona
✅ Upload de vídeos funciona
✅ Frases funcionam
✅ Timer funciona
✅ Carrossel funciona
✅ Página pública funciona
✅ Links compartilháveis funcionam
```

---

## 🐛 **TROUBLESHOOTING:**

### **Erro: "Module not found"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Fix: update dependencies"
git push
```

### **Erro: "Environment variables not found"**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Redeploy: **Deployments** → ... → **Redeploy**

### **Erro: "Build failed"**
1. Verifique logs no Vercel Dashboard
2. Teste build local: `pnpm build`
3. Se funcionar local, force redeploy

### **Erro: "404 on refresh"**
- Verifique `vercel.json` (rewrites configurados)
- Redeploy se necessário

---

## 📊 **MONITORAMENTO:**

### **Analytics (Gratuito):**
1. Vercel Dashboard → Analytics
2. Veja visitantes, performance, etc.

### **Logs:**
1. Vercel Dashboard → Deployments
2. Clique no deploy → View Function Logs

---

## 🎯 **FLUXO DE TRABALHO:**

```
1. Desenvolver localmente
2. Testar: pnpm dev
3. Commit: git add . && git commit -m "..."
4. Push: git push
5. Vercel faz deploy automático ✅
6. Testar em produção
```

---

## 💰 **CUSTOS:**

### **Free Tier (Hobby):**
```
✅ Deployments ilimitados
✅ 100GB bandwidth/mês
✅ Domínio .vercel.app gratuito
✅ HTTPS automático
✅ CI/CD automático
```

### **Upgrade necessário se:**
- Mais de 100GB bandwidth/mês
- Domínio personalizado com SSL custom
- Mais de 3 membros na equipe

---

## 🔗 **LINKS ÚTEIS:**

```
Vercel Dashboard: https://vercel.com/dashboard
Documentação: https://vercel.com/docs
GitHub Repo: https://github.com/SEU_USUARIO/couple-moments
Site Live: https://seu-projeto.vercel.app
```

---

## ✅ **CHECKLIST FINAL:**

```
□ Git inicializado
□ Repositório GitHub criado
□ Código pushed para GitHub
□ Projeto importado na Vercel
□ Environment variables configuradas
□ Build bem-sucedido
□ Deploy concluído
□ Supabase URLs configuradas
□ Site testado
□ Login testado
□ Uploads testados
□ Tudo funcionando! 🎉
```

---

**PRONTO PARA DEPLOY! 🚀**

Execute os comandos acima em ordem e seu projeto estará no ar!

