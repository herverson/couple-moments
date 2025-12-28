# 🔧 Corrigir Erro 403 ao Criar Couple

## ❌ Problema

Erro ao tentar criar um couple:
```
POST .../rest/v1/couples?select=* 403 (Forbidden)
```

**Causa**: Política RLS de INSERT está faltando na tabela `couples`.

---

## ✅ Solução Rápida (2 minutos)

### Método 1: Executar Script de Fix (Recomendado)

#### Passo 1: Acesse o SQL Editor
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql/new
```

#### Passo 2: Copie e Cole este SQL

Copie o conteúdo do arquivo **`fix-couples-insert.sql`**:

```sql
-- Fix: Add INSERT policy for couples table
DROP POLICY IF EXISTS "Authenticated users can create couples" ON couples;

CREATE POLICY "Authenticated users can create couples" ON couples
  FOR INSERT WITH CHECK (
    auth.uid() = user1_id
  );

SELECT * FROM pg_policies WHERE tablename = 'couples';
```

#### Passo 3: Execute

1. Cole o SQL no editor
2. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
3. ✅ Você verá as políticas da tabela couples

---

### Método 2: Executar Setup Completo

Se você ainda **não executou** o `supabase-setup.sql`:

#### Passo 1: Acesse o SQL Editor
```
https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql/new
```

#### Passo 2: Abra o arquivo completo

Abra o arquivo **`supabase-setup.sql`** no seu editor

#### Passo 3: Copie TODO o conteúdo

Selecione tudo (Ctrl/Cmd + A) e copie (Ctrl/Cmd + C)

#### Passo 4: Cole e Execute

1. Cole no SQL Editor do Supabase
2. Clique em **Run**
3. ✅ Aguarde a execução (pode levar 10-30 segundos)

---

## 🧪 Testar a Correção

Após executar o SQL:

1. **Volte para a aplicação**: http://localhost:5173

2. **Faça login** (se não estiver logado)

3. **Tente criar um couple**:
   - Vá para `/create-couple`
   - Preencha os dados
   - Clique em criar

4. **✅ Deve funcionar agora!**

---

## 🔍 Verificar se Foi Corrigido

### No Supabase Dashboard:

1. Vá para: **Database** → **Tables** → **couples**
2. Clique na aba **Policies**
3. Você deve ver:
   ```
   ✅ Users can view their own couple (SELECT)
   ✅ Users can update their own couple (UPDATE)
   ✅ Authenticated users can create couples (INSERT) ← NOVA!
   ```

---

## 📋 O Que Cada Política Faz

### SELECT (Ver):
- Usuários podem ver apenas seus próprios couples
- Verifica se `auth.uid()` = `user1_id` OU `user2_id`

### UPDATE (Atualizar):
- Usuários podem atualizar apenas seus próprios couples
- Mesma verificação do SELECT

### INSERT (Criar) - **NOVO**:
- Usuários autenticados podem criar novos couples
- Verifica se `auth.uid()` = `user1_id` (usuário que cria é o user1)

---

## 🐛 Troubleshooting

### Ainda dá erro 403?

**1. Verifique se está autenticado:**
```javascript
// No console do navegador (F12)
const { data } = await supabase.auth.getSession()
console.log(data.session?.user)
// Deve retornar seus dados de usuário
```

**2. Verifique se a política foi criada:**
- Dashboard → Database → Tables → couples → Policies
- Deve ter 3 políticas (SELECT, UPDATE, INSERT)

**3. Limpe o cache do navegador:**
- Ctrl/Cmd + Shift + R (hard refresh)
- Ou abra em aba anônima

**4. Verifique o user_id:**
```javascript
// No console do navegador
const { data } = await supabase.auth.getUser()
console.log('User ID:', data.user?.id)
```

### Erro: "policy already exists"

Se aparecer esse erro ao executar o SQL:
```
ERROR: policy "Authenticated users can create couples" already exists
```

**Solução:**
1. Ignore o erro (a política já existe, está ok!)
2. Ou execute apenas:
```sql
DROP POLICY IF EXISTS "Authenticated users can create couples" ON couples;
CREATE POLICY "Authenticated users can create couples" ON couples
  FOR INSERT WITH CHECK (auth.uid() = user1_id);
```

---

## 🎯 Resumo

**Problema**: Faltava política RLS de INSERT  
**Solução**: Adicionar política que permite usuários autenticados criarem couples  
**Tempo**: 2 minutos  
**Resultado**: ✅ Criar couples funciona!  

---

## 📖 Links Úteis

- **SQL Editor**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/sql
- **Tabela Couples**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/editor/couples
- **Políticas RLS**: https://supabase.com/dashboard/project/nrmrsacjlwyqtzqvmhcn/auth/policies

---

## ✅ Checklist

- [ ] Abrir SQL Editor no Supabase
- [ ] Copiar SQL do arquivo `fix-couples-insert.sql`
- [ ] Colar e executar no SQL Editor
- [ ] Verificar que a política foi criada
- [ ] Testar criar couple na aplicação
- [ ] ✅ Funciona!

---

**Última Atualização**: 28 de Dezembro de 2025  
**Status**: ✅ Fix Pronto para Aplicar

