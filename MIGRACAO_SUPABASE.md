# Migração concluída: Redis/KV → Supabase

Este projeto não usa mais `KV_REST_API_URL`, `KV_REST_API_TOKEN`, Upstash ou Redis.

## O que mudou

- Persistência de produção agora usa Supabase/PostgREST.
- O painel, o site público, agendamentos, pacientes, financeiro, CMS e usuários continuam usando a mesma abstração de dados existente.
- A autenticação usa exclusivamente os usuários persistidos no Supabase; as senhas são armazenadas apenas como hash PBKDF2 no banco.
- O cookie de sessão continua protegido por `AUTH_SECRET`.
- Em desenvolvimento local, se não houver Supabase, continua disponível o arquivo `.data/oralclin-db.json`.

## Arquivos principais

- `src/server/store/supabase-store.ts` — novo driver Supabase.
- `src/server/store/index.ts` — seleciona Supabase em produção.
- `src/server/env.ts` — lê as credenciais do Supabase.
- `supabase-setup.sql` — cria as tabelas no Supabase.
- `CONFIGURAR_SUPABASE.md` — passo a passo de configuração.

## Variáveis obrigatórias na Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
```

Depois de configurar, faça **Redeploy**.
