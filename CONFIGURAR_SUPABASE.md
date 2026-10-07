# Configurar Supabase na OralClin

## 1. Criar as tabelas

No painel do Supabase, abra **SQL Editor**, clique em **New query**, cole todo o conteúdo de `supabase-setup.sql` e clique em **Run**.

## 2. Copiar as credenciais

No Supabase, abra **Project Settings → API** e copie:

- **Project URL** → use em `NEXT_PUBLIC_SUPABASE_URL`
- **service_role / secret key** → use em `SUPABASE_SERVICE_ROLE_KEY`

A service role é secreta. Não coloque essa chave em arquivos públicos, componentes client ou GitHub.

## 3. Variáveis na Vercel

Em **Vercel → projeto → Settings → Environment Variables**, configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SECRETA
AUTH_SECRET=SEU_SEGREDO_DE_SESSAO
SEED_DEMO_DATA=false
```

Se `AUTH_SECRET` ainda não existir, gere um valor aleatório forte com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Redeploy

Depois de salvar as variáveis, abra **Deployments → último deploy → Redeploy**.

## 5. Testar

Abra:

- `/api/health` → deve retornar `"ok": true` e `"kind": "supabase"`
- `/admin/login`

O login em `/admin/login` consulta exclusivamente os usuários já cadastrados no banco de dados. O e-mail precisa existir na coleção `users`, o usuário precisa estar ativo e a senha é comparada pelo hash armazenado no servidor.
