# ⚡ Deploy Rápido - 5 Minutos

## 🎯 **COMANDOS RÁPIDOS:**

### **1. Inicializar Git e Push para GitHub**

```bash
# Se ainda não tem repositório no GitHub, crie em:
# https://github.com/new (nome: couple-moments)

# Depois execute:
cd "/Volumes/HD Herver/Downloads/mymate/couple-moments"

# Inicializar git (se necessário)
git init
git add .
git commit -m "Deploy inicial - Couple Moments"

# Adicionar remote (SUBSTITUA 'SEU_USUARIO')
git remote add origin git@github.com:SEU_USUARIO/couple-moments.git

# Ou HTTPS:
# git remote add origin https://github.com/SEU_USUARIO/couple-moments.git

# Push
git branch -M main
git push -u origin main
```

---

### **2. Deploy na Vercel**

#### **Via Dashboard (Recomendado):**

1. **Acesse:** https://vercel.com
2. **Login** com GitHub
3. Clique **"Add New..."** → **"Project"**
4. Selecione **"couple-moments"**
5. Configure:
   ```
   Framework: Vite
   Build Command: pnpm build
   Output Directory: dist/public
   Install Command: pnpm install
   ```
6. **Environment Variables:**
   ```
   VITE_SUPABASE_URL = https://nrmrsacjlwyqtzqvmhcn.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...sua_key
   ```
7. Clique **"Deploy"**
8. ✅ **PRONTO!**

---

#### **Via CLI (Alternativa):**

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir instruções interativas
```

---

## 🔐 **CONFIGURAR SUPABASE:**

Após deploy, configure URLs permitidas:

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Adicione:
   ```
   https://seu-projeto.vercel.app
   https://seu-projeto.vercel.app/*
   ```
3. **Site URL:** `https://seu-projeto.vercel.app`

---

## ✅ **TESTAR:**

Visite: `https://seu-projeto.vercel.app`

```
✅ Site carrega
✅ Login funciona
✅ Uploads funcionam
✅ Timer funciona
✅ Tudo OK!
```

---

## 🔄 **ATUALIZAR (Futuro):**

```bash
git add .
git commit -m "Update: descrição"
git push

# Vercel deploya automático! 🎉
```

---

## 🆘 **AJUDA RÁPIDA:**

- **Erro de build?** Verifique logs no Vercel Dashboard
- **Env vars não funcionam?** Redeploy após adicionar
- **404 no refresh?** Arquivo `vercel.json` já está criado ✅

---

**SEU SITE ESTARÁ NO AR EM 5 MINUTOS! 🚀**

Guia completo: `DEPLOY_VERCEL.md`

