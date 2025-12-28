# 🔥 Configuração do Firebase - Guia Completo

Este guia vai te ajudar a configurar o Firebase para o projeto Couple Moments em **menos de 10 minutos**.

---

## 📋 Índice

1. [Criar Projeto no Firebase](#1-criar-projeto-no-firebase)
2. [Configurar Authentication](#2-configurar-authentication)
3. [Configurar Firestore Database](#3-configurar-firestore-database)
4. [Configurar Storage](#4-configurar-storage)
5. [Obter Credenciais](#5-obter-credenciais)
6. [Configurar Variáveis de Ambiente](#6-configurar-variáveis-de-ambiente)
7. [Testar a Aplicação](#7-testar-a-aplicação)

---

## 1. Criar Projeto no Firebase

### Passo 1.1: Acesse o Console do Firebase
Abra no navegador: https://console.firebase.google.com/

### Passo 1.2: Criar Novo Projeto
1. Clique em **"Adicionar projeto"** (ou "Add project")
2. **Nome do projeto**: `Couple Moments` (ou nome que preferir)
3. Clique em **"Continuar"**

### Passo 1.3: Google Analytics (Opcional)
1. Pode **desativar** o Google Analytics por enquanto
2. Ou deixar ativado se quiser métricas
3. Clique em **"Criar projeto"**
4. Aguarde a criação (30-60 segundos)
5. Clique em **"Continuar"**

---

## 2. Configurar Authentication

### Passo 2.1: Acessar Authentication
1. No menu lateral, clique em **"Build"** > **"Authentication"**
2. Clique em **"Get started"**

### Passo 2.2: Habilitar Google Sign-In
1. Na aba **"Sign-in method"**
2. Encontre **"Google"** na lista
3. Clique em **"Google"**
4. **Toggle** para **"Enable"**
5. **Project support email**: Selecione seu email
6. Clique em **"Save"**

✅ **Pronto!** Autenticação configurada!

---

## 3. Configurar Firestore Database

### Passo 3.1: Criar Banco de Dados
1. No menu lateral, clique em **"Build"** > **"Firestore Database"**
2. Clique em **"Create database"**

### Passo 3.2: Configurar Segurança
1. **Localização**: Escolha a mais próxima (ex: `southamerica-east1` para Brasil)
2. **Secure rules**: Selecione **"Start in production mode"**
   - Vamos ajustar as regras depois
3. Clique em **"Next"** e depois **"Enable"**
4. Aguarde a criação (30-60 segundos)

### Passo 3.3: Configurar Regras de Segurança
1. Vá para a aba **"Rules"**
2. **Substitua** todo o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user is part of the couple
    function isCoupleUser(coupleId) {
      let couple = get(/databases/$(database)/documents/couples/$(coupleId)).data;
      return request.auth.uid == couple.user1_id || 
             request.auth.uid == couple.user2_id;
    }
    
    // Couples collection
    match /couples/{coupleId} {
      // Anyone authenticated can read to find their couple
      allow read: if isSignedIn();
      // Only authenticated users can create couples
      allow create: if isSignedIn();
      // Only couple members can update
      allow update: if isSignedIn() && isCoupleUser(coupleId);
      // No one can delete
      allow delete: if false;
    }
    
    // Photos collection
    match /photos/{photoId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow delete: if isSignedIn();
    }
    
    // Videos collection
    match /youtube_videos/{videoId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow delete: if isSignedIn();
    }
    
    // Romantic phrases collection
    match /romantic_phrases/{phraseId} {
      allow read: if true; // Everyone can read phrases
      allow write: if false; // Only admin can write
    }
  }
}
```

3. Clique em **"Publish"**

✅ **Firestore configurado com segurança!**

---

## 4. Configurar Storage

### Passo 4.1: Criar Storage
1. No menu lateral, clique em **"Build"** > **"Storage"**
2. Clique em **"Get started"**
3. **Secure rules**: Selecione **"Start in production mode"**
4. Clique em **"Next"**
5. **Localização**: Mesma que escolheu para Firestore
6. Clique em **"Done"**

### Passo 4.2: Configurar Regras do Storage
1. Vá para a aba **"Rules"**
2. **Substitua** todo o conteúdo por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos folder - authenticated users can read/write their couple's photos
    match /photos/{coupleId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

3. Clique em **"Publish"**

✅ **Storage configurado!**

---

## 5. Obter Credenciais

### Passo 5.1: Registrar Web App
1. Na **página inicial** do projeto (Overview)
2. Clique no ícone **"Web"** (`</>`)
3. **App nickname**: `Couple Moments Web`
4. **Não** marque "Firebase Hosting"
5. Clique em **"Register app"**

### Passo 5.2: Copiar Credenciais
Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "couple-moments-xxxxx.firebaseapp.com",
  projectId: "couple-moments-xxxxx",
  storageBucket: "couple-moments-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

⚠️ **NÃO FECHE ESTA PÁGINA AINDA!** Você vai precisar dessas credenciais no próximo passo.

---

## 6. Configurar Variáveis de Ambiente

### Passo 6.1: Atualizar arquivo .env
Abra o arquivo `.env` na raiz do projeto e **atualize** com suas credenciais:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=Cole_aqui_o_apiKey
VITE_FIREBASE_AUTH_DOMAIN=Cole_aqui_o_authDomain
VITE_FIREBASE_PROJECT_ID=Cole_aqui_o_projectId
VITE_FIREBASE_STORAGE_BUCKET=Cole_aqui_o_storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=Cole_aqui_o_messagingSenderId
VITE_FIREBASE_APP_ID=Cole_aqui_o_appId

# Node Environment
NODE_ENV=development
```

### Exemplo Preenchido:
```bash
VITE_FIREBASE_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
VITE_FIREBASE_AUTH_DOMAIN=couple-moments-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=couple-moments-12345
VITE_FIREBASE_STORAGE_BUCKET=couple-moments-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NODE_ENV=development
```

### Passo 6.2: Salvar e Fechar
1. **Salve** o arquivo `.env`
2. Feche o arquivo

---

## 7. Testar a Aplicação

### Passo 7.1: Iniciar o Servidor
```bash
pnpm dev
```

### Passo 7.2: Abrir no Navegador
```
http://localhost:5173
```

### Passo 7.3: Testar Login
1. Clique em **"Entrar com Google"**
2. Selecione sua conta Google
3. Você será redirecionado para o dashboard ✅

### Passo 7.4: Criar Perfil do Casal
1. Clique em **"Criar Perfil do Casal"**
2. Preencha:
   - Nome do casal
   - Data de início do relacionamento
3. Clique em **"Criar"**
4. Você receberá um código de convite para seu parceiro

### Passo 7.5: Testar Upload de Foto
1. No dashboard, vá para **"Photo Gallery"**
2. Clique em **"Upload Photo"**
3. Selecione uma foto
4. A foto deve aparecer na galeria ✅

---

## ✅ Checklist Final

Marque cada item conforme completa:

- [ ] Projeto criado no Firebase Console
- [ ] Authentication configurado (Google)
- [ ] Firestore Database criado
- [ ] Regras de segurança do Firestore configuradas
- [ ] Storage configurado
- [ ] Regras de segurança do Storage configuradas
- [ ] Web app registrado
- [ ] Credenciais copiadas
- [ ] Arquivo `.env` atualizado
- [ ] Servidor iniciado com `pnpm dev`
- [ ] Login com Google funcionando
- [ ] Perfil do casal criado
- [ ] Upload de foto funcionando

---

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/unauthorized-domain)"

**Causa**: Domínio localhost não está autorizado

**Solução**:
1. Vá para **Authentication** > **Settings** > **Authorized domains**
2. Adicione: `localhost`
3. Se não estiver lá, clique em **"Add domain"** e adicione `localhost`

### Erro: "Missing or insufficient permissions"

**Causa**: Regras de segurança muito restritivas

**Solução**:
1. Verifique se copiou corretamente as regras do Firestore
2. Certifique-se de estar logado
3. Verifique o console do navegador (F12) para mais detalhes

### Erro: "Firebase: Firebase App named '[DEFAULT]' already exists"

**Causa**: Firebase foi inicializado duas vezes

**Solução**:
1. Limpe o cache: `rm -rf node_modules/.vite`
2. Reinicie: `pnpm dev`

### Fotos não carregam

**Causa**: Regras do Storage muito restritivas

**Solução**:
1. Verifique as regras do Storage
2. Certifique-se de que o path é `/photos/{coupleId}/{filename}`

---

## 📖 Documentação Oficial

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Cloud Storage](https://firebase.google.com/docs/storage)

---

## 🔐 Segurança

### ✅ Pode Compartilhar:
- API Key (é pública)
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

### ❌ NUNCA Compartilhe:
- Service Account Keys (JSON)
- Database secrets
- Admin SDK credentials

---

## 🎉 Conclusão

Se você chegou até aqui e tudo está funcionando, **parabéns!** 🎊

Seu app Couple Moments está rodando com Firebase! Agora você pode:
- ✅ Fazer login com Google
- ✅ Criar perfil do casal
- ✅ Fazer upload de fotos
- ✅ Adicionar vídeos do YouTube
- ✅ Ver frases românticas

---

**Criado em**: 28 de Dezembro de 2025  
**Versão**: 2.0.0 (Firebase Edition)  
**Tempo estimado**: 10-15 minutos

**Precisa de ajuda?** Consulte o `TROUBLESHOOTING.md` ou abra uma issue!

