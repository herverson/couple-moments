# ✅ Configurar Autenticação por Email no Supabase

## 🎯 Passos Rápidos (2 minutos)

### Passo 1: Acesse as Configurações de Email

Abra este link:
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/auth/providers
```

Ou navegue:
1. Dashboard do Supabase
2. Seu projeto (`nrmrsacjlwyqtzqvmhcn`)
3. **Authentication** (menu lateral)
4. **Providers**

---

### Passo 2: Verifique se Email está Habilitado

1. Procure por **"Email"** na lista de providers
2. Deve estar **ATIVO** por padrão (toggle verde)
3. Se não estiver, clique no toggle para ativar

---

### Passo 3: Configure as Opções de Email

Clique em **"Email"** para abrir as configurações:

#### ✅ Opções Recomendadas:

**Confirm email:**
- ☑ **Enable email confirmations** (recomendado para produção)
- ☐ Desmarque para desenvolvimento rápido (emails não precisam ser confirmados)

**Email templates:**
- Mantenha os templates padrão (podem ser customizados depois)

---

### Passo 4: Configurar SMTP (Opcional)

Para **desenvolvimento**, você pode usar o servidor de email do Supabase (padrão).

Para **produção**, configure seu próprio SMTP:

1. Vá em **Settings** → **Auth** → **SMTP Settings**
2. Configure com serviços como:
   - Gmail
   - SendGrid
   - Mailgun
   - AWS SES

Por enquanto, **use o padrão do Supabase**!

---

### Passo 5: Salvar Configurações

Clique em **Save** no final da página.

---

## ✅ Pronto! Agora Teste

### 1. Inicie o servidor:
```bash
pnpm dev
```

### 2. Abra no navegador:
```
http://localhost:5173
```

### 3. Você verá o formulário de login:
- Campo de **Email**
- Campo de **Password**
- Botão **Sign In** / **Sign Up**

### 4. Crie uma conta:
1. Clique em "Don't have an account? Sign up"
2. Digite seu email
3. Digite uma senha (mínimo 6 caracteres)
4. Clique em **Sign Up**

### 5. Confirme o email (se habilitado):
- Verifique sua caixa de entrada
- Clique no link de confirmação
- Volte para http://localhost:5173
- Faça login

---

## 🔧 Desenvolvimento Rápido (Pular Confirmação de Email)

Se você quer testar rapidamente **sem confirmar email**:

1. Vá em: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/auth/providers
2. Clique em **Email**
3. **Desmarque**: ☐ Enable email confirmations
4. **Save**

Agora você pode criar contas e fazer login imediatamente!

---

## 🎨 O que Mudou no App

### Antes (Google OAuth):
```
┌─────────────────┐
│  Couple Moments │
│                 │
│ [Sign in with   │
│     Google]     │
└─────────────────┘
```

### Agora (Email/Password):
```
┌─────────────────┐
│  Couple Moments │
│                 │
│ Email:          │
│ [___________]   │
│                 │
│ Password:       │
│ [___________]   │
│                 │
│ [  Sign In  ]   │
│                 │
│ Don't have an   │
│ account? Sign up│
└─────────────────┘
```

---

## 📋 Fluxo de Autenticação

### Sign Up (Criar Conta):
1. Usuário preenche email e senha
2. Clica em "Sign Up"
3. Supabase cria a conta
4. Se confirmação habilitada: email enviado
5. Usuário confirma email
6. ✅ Conta ativada!

### Sign In (Login):
1. Usuário preenche email e senha
2. Clica em "Sign In"
3. Supabase valida credenciais
4. ✅ Usuário logado!

---

## 🔐 Segurança

### Senha Forte:
- Mínimo 6 caracteres (configurado no código)
- Recomendado: 8+ caracteres com números e símbolos

### Validações Implementadas:
- ✅ Email obrigatório (formato válido)
- ✅ Senha obrigatória (mínimo 6 caracteres)
- ✅ Mensagens de erro amigáveis
- ✅ Loading state durante autenticação

---

## 🐛 Troubleshooting

### Erro: "Invalid login credentials"
**Causa**: Email ou senha incorretos
**Solução**: Verifique os dados ou crie uma nova conta

### Erro: "Email not confirmed"
**Causa**: Confirmação de email habilitada mas não confirmado
**Solução**: 
1. Verifique sua caixa de entrada
2. Ou desabilite confirmação no Supabase (desenvolvimento)

### Erro: "User already registered"
**Causa**: Email já cadastrado
**Solução**: Use "Sign in" ao invés de "Sign up"

### Não recebo email de confirmação
**Causa**: SMTP não configurado ou email na pasta de spam
**Solução**:
1. Verifique spam/lixo eletrônico
2. Use o servidor de email padrão do Supabase
3. Para desenvolvimento, desabilite confirmação

---

## 🎯 Gerenciar Usuários

### Ver usuários cadastrados:
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/auth/users
```

Aqui você pode:
- Ver todos os usuários
- Confirmar emails manualmente
- Deletar usuários
- Resetar senhas

---

## 🚀 Recursos Adicionais

### Recuperação de Senha:
Para adicionar "Esqueci minha senha", você pode implementar:
```javascript
await supabase.auth.resetPasswordForEmail(email)
```

### Atualizar Email/Senha:
```javascript
await supabase.auth.updateUser({ email: newEmail })
await supabase.auth.updateUser({ password: newPassword })
```

### Logout:
Já implementado! Clique no botão "Logout" no header.

---

## 📊 Checklist de Setup

- [ ] Email provider **ATIVO** no Supabase
- [ ] Confirmação de email **configurada** (ou desabilitada para dev)
- [ ] Servidor rodando (`pnpm dev`)
- [ ] Formulário de login aparecendo
- [ ] Teste: criar conta
- [ ] Teste: fazer login
- [ ] Teste: logout

---

## ✅ Vantagens da Autenticação por Email

✅ **Mais simples** - Não precisa configurar OAuth  
✅ **Mais privado** - Sem compartilhar dados com Google  
✅ **Mais controle** - Você gerencia os usuários  
✅ **Mais rápido** - Setup em 2 minutos  

---

**Tudo pronto! Agora você tem autenticação completa por email! 🎉**

Se precisar de ajuda, consulte: `TROUBLESHOOTING.md`

