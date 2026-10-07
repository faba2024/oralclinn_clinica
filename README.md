# Oralclin — Plataforma de gestão odontológica + site institucional

Sistema completo para a clínica **Oralclin | Odontologia e Saúde**: site institucional premium com agendamento online e painel administrativo com agenda, pacientes, prontuário com odontograma, CRM, planos de tratamento/orçamentos, financeiro, profissionais, relatórios, central de WhatsApp, CMS e configurações.

> **Um único projeto.** Site público e painel administrativo são o mesmo app Next.js, no mesmo domínio, com o mesmo banco de dados. Um agendamento feito em `/agendar` é gravado no banco e aparece na hora em `/admin/agendamentos`.

---

## Endereços

| | Local | Produção (Vercel) |
| --- | --- | --- |
| Site | http://localhost:3000/ | https://SEU-DOMINIO/ |
| Painel | http://localhost:3000/admin/login | https://SEU-DOMINIO/admin/login |

O site público **não tem** link nem botão para o painel. O acesso é feito digitando `/admin/login`.

---

## Rodar localmente

Requisitos: Node.js 20 ou superior.

```bash
npm install
cp .env.example .env.local   # configure Supabase + AUTH_SECRET
npm run dev                  # http://localhost:3000
```

O login do painel usa exclusivamente os usuários cadastrados na coleção `users` do banco. Credenciais não são mais lidas de `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

Sem Supabase configurado, os dados ficam em `.data/oralclin-db.json` apenas no desenvolvimento local (arquivo ignorado pelo git). Apague esse arquivo para recomeçar do zero.

Validação:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

---

## Publicar na Vercel (um único deploy)

1. Importe o repositório na Vercel. O framework Next.js é detectado sozinho e não precisa de nenhuma configuração extra.
2. **Banco:** crie/conecte um projeto Supabase e execute `supabase-setup.sql` no **SQL Editor** do Supabase.
3. **Variáveis de ambiente** (*Settings → Environment Variables*):

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | Chave secreta server-side usada pelas APIs do projeto para acessar o banco. Nunca exponha no navegador. |
| `AUTH_SECRET` | sim | Assina o cookie de sessão. Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `SEED_DEMO_DATA` | não | Padrão: o banco começa sem pacientes, agenda ou financeiro fictícios. Use `true` apenas para demonstração. |
| `NEXT_PUBLIC_SITE_URL` | recomendada | URL final do site (SEO e sitemap). |

4. Faça o deploy (ou *Redeploy* depois de mudar variáveis).
5. Confira em `https://SEU-DOMINIO/api/health`. O retorno deve ser `"ok": true` e `"kind": "supabase"`. Nenhum segredo aparece nessa resposta.

Na Vercel o banco em arquivo não é usado. Sem as credenciais do Supabase, o painel mostra a tela *Configuração pendente*, e o site continua no ar com o conteúdo padrão.

---

## Acesso ao painel

- **Login oficial pelo banco:** e-mail, status, perfil e hash da senha são lidos da coleção `users` no Supabase. Nenhuma credencial administrativa fica no código ou em variáveis de ambiente.
- **Trocar a própria senha:** menu do perfil (canto superior direito) → *Alterar minha senha*.
- **Outros usuários:** *Configurações → Usuários*, somente para administrador. Lá você cria usuários com perfil e senha inicial, redefine senhas e ativa ou desativa acessos.
- **Sessão:** cookie `httpOnly`, `SameSite=Lax`, `Secure` em produção, assinado com HMAC e válido por 12 horas.
- **Proteção:** o `middleware` bloqueia todas as rotas `/admin/*` (exceto `/admin/login`) e `/api/admin/*`. O layout do painel confirma no banco que o usuário continua ativo. As APIs validam a permissão de cada perfil no servidor.
- **Segurança extra:** login com limite de tentativas, bloqueio de escrita vinda de outra origem e honeypot antispam nos formulários do site.

---

## Integração site ↔ painel

| Ação no site | Resultado no painel |
| --- | --- |
| Agendamento em `/agendar` | Cria a consulta na agenda e em *Agendamentos* (origem **Site**), cadastra o paciente se ele for novo, gera um lead no CRM e uma notificação |
| Formulário em `/contato` | Cria um lead no CRM e uma notificação |

| Ação no painel | Resultado no site |
| --- | --- |
| Conteúdo, tratamentos, profissionais, antes e depois | Aparecem no site na próxima visita, porque as páginas leem o banco a cada requisição |
| *Horários* (expediente, horários por profissional, antecedência, ativar ou desativar o agendamento online) | O agendamento online passa a usar as novas regras na hora |

Os horários livres são recalculados e validados no servidor no momento da confirmação. Um horário já ocupado é recusado e o paciente é avisado. O painel se atualiza sozinho a cada 20 segundos e ao voltar para a aba.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · React Hook Form + Zod · Recharts · Lucide · date-fns · Zustand.

Componentes de interface (diálogo, drawer, popover, dropdown, tabs, tooltip, toast, combobox, date picker, data table, command palette) foram implementados no próprio projeto, sem dependências pesadas, com foco em acessibilidade (foco preso em modais, ESC, navegação por setas, `aria-*`).

Fontes: Manrope (interface) e Playfair Display (títulos institucionais) via `next/font`.

---

## Estrutura

```
src/
  app/
    (site)/            site público: /, /tratamentos, /tratamentos/[slug], /antes-e-depois,
                       /profissionais, /clinica, /contato, /agendar
    admin/login/       login (autenticação real)
    admin/(panel)/     painel: /admin, /agenda, /agendamentos, /pacientes, /pacientes/[id], /crm, /tratamentos,
                       /orcamentos, /orcamentos/[id], /financeiro, /profissionais, /prontuarios,
                       /antes-depois, /horarios, /relatorios, /conteudo, /whatsapp, /configuracoes
    api/               auth/* (login, logout, me, password) · admin/* (dados, documentos, usuários, reset)
                       public/* (slots, bookings, contact) · health
    sitemap.ts, robots.ts, not-found.tsx
  middleware.ts        proteção de /admin e /api/admin
  server/              banco (Supabase/arquivo local), autenticação, repositórios no servidor, dados públicos do site
  components/
    ui/                design system (button, input, dialog, drawer, data-table, calendar…)
    admin/             shell do painel (sidebar, topbar, busca Ctrl+K, notificações, atalhos)
    site/              header, footer, seções do site
    shared/            marca, page header, stat card, upload de imagem, ilustrações
    charts/            gráficos (Recharts) com tema da marca
  features/<módulo>/   types · repository · service · hooks · components
    appointments, patients, records, treatments, budgets, crm, finance, professionals,
    before-after, documents, notifications, users, content, settings, reports, whatsapp,
    dashboard, site
  repositories/
    core/              contrato Repository<T>, DataBackend, barramento de eventos
    api/               ApiBackend: o navegador acessa os dados via /api/admin
    storage/           FileStorage (uploads)
    index.ts           CONTAINER de repositórios
  data/seed/           dados fictícios coerentes (datas relativas ao dia atual)
  hooks/ stores/ types/ utils/
```

### Fluxo de dados

`Painel: componente → hook (useLiveQuery) → service → repository → ApiBackend → /api/admin/* → ServerBackend → banco`

`Site: layout do servidor → getPublicSiteData() → banco` · `formulários → /api/public/* → services → banco`

- As regras de negócio (conflito de horários, horários livres, parcelamento, CRM, comissões) ficam nos services e rodam no servidor quando chamadas pelas APIs públicas.
- O banco é acessado por `src/server/store`: Supabase/PostgREST em produção ou arquivo JSON local no desenvolvimento. O arquivo `supabase-setup.sql` cria as tabelas necessárias.
- Uploads: imagens são redimensionadas no navegador e salvas no banco junto ao registro. PDFs aceitam até 900 KB. Para arquivos grandes, implemente `FileStorage` com S3/R2/Vercel Blob em `src/repositories/storage/file-storage.ts`.

---

## Funcionalidades principais

- **Visão geral:** indicadores (consultas, faturamento, a receber, inadimplência, leads, tratamentos ativos), faturamento mensal, origem e conversão de leads, novos pacientes, consultas por dia da semana, pagamentos pendentes, leads recentes, tratamentos em andamento e aniversariantes.
- **Agenda:** visões Hoje (fluxo da recepção: a chegar → recepção → atendimento → finalizadas), Dia (por profissional), Semana e Mês; filtros por dentista, procedimento, status e sala; criar clicando no horário; drawer com ações (confirmar, chegada, iniciar, finalizar, falta, cancelar, remarcar, WhatsApp); bloqueio de conflitos.
- **Pacientes:** tabela com busca instantânea, filtros, ordenação, paginação, exportação CSV e versão em cartões no celular; perfil com Resumo, Consultas, Prontuário, Tratamentos, Financeiro, Documentos, Fotos e Histórico.
- **Prontuário:** anamnese, alertas clínicos, odontograma interativo (FDI, 8 estados, anotações por dente) e evolução clínica. Não há diagnóstico automático nem sugestão de conduta.
- **Orçamentos:** editor de planos com itens do catálogo ou personalizados, descontos, status, documento A4 para impressão, envio pelo WhatsApp e geração de parcelas no financeiro.
- **CRM:** Kanban com arrastar e soltar (e menu “Mover para” no celular), timeline de interações, conversão em paciente, origem mais eficiente.
- **Financeiro:** receitas, despesas, pagamentos, parcelas (baixa, cobrança por WhatsApp), visão por período.
- **Profissionais:** cadastro, horários, procedimentos, agenda individual, produção e comissão.
- **Relatórios:** faturamento, consultas, cancelamentos e faltas, novos pacientes, conversão, tratamentos mais vendidos, origem dos leads, desempenho profissional; exportação CSV e impressão.
- **WhatsApp:** filas de confirmação, lembrete, pós-atendimento e retorno; mensagem rápida com variáveis; editor de modelos.
- **Conteúdo (CMS):** logo, página inicial, clínica, depoimentos, contatos, horários e SEO — refletidos imediatamente no site.
- **Agendamentos:** lista única do site e do painel, com origem, filtros, mudança de status na linha, WhatsApp e exportação CSV.
- **Horários:** expediente da clínica, dias e horários de cada profissional e regras do agendamento online.
- **Configurações:** clínica, usuários (com senha) e permissões, status do banco, agenda e salas, financeiro, notificações, WhatsApp, site e aparência.
- **Site:** home, tratamentos com páginas individuais, galeria antes/depois com comparação interativa, profissionais, clínica, contato (gera lead no CRM) e agendamento online em 6 etapas (gera consulta, paciente, lead e notificação no painel; adicionar à agenda Google/.ics; WhatsApp).

Atalhos do painel: `Ctrl + K` busca global · `?` lista de atalhos · `G` + `A/P/C/O/F/R/D` navegação rápida.

---

## Imagens

Todas as imagens ficam em `public/images`, em WebP (o OG em JPG), e são referenciadas pelo catálogo `src/data/images.ts`:

```
public/images/
  hero/hero-oralclin.webp                 imagem principal da home
  treatments/<tratamento>.webp            uma imagem por tratamento (13) + fallback-treatment.webp
  professionals/dra-camila|dr-lucas|dra-beatriz.webp  retratos dos profissionais
  before-after/<caso>-antes|depois.webp   casos de antes e depois
  clinic/fachada-oralclin.webp            fachada (seção clínica e contato) + fallback-clinic.webp
  avatars/fallback-avatar.webp            retrato reserva
  og/og-oralclin.jpg                      imagem de compartilhamento (WhatsApp/Instagram/Google)
```

- `SafeImage` (`src/components/shared/safe-image.tsx`) envolve o `next/image` e troca automaticamente qualquer imagem ausente ou com erro pela imagem reserva da marca. Nenhuma área exibe ícone quebrado.
- Pacientes sem foto exibem iniciais em tons da marca.
- Para trocar uma imagem: substitua o arquivo mantendo o nome, ou envie outra pelo painel (Conteúdo, Tratamentos, Profissionais, Antes **Situação das imagens:**

| Arquivo | Situação |
| --- | --- |
| `hero/hero-oralclin.webp` | Fotografia definitiva (fornecida pela clínica). |
| `treatments/*.webp` (13) | Fotografias definitivas, uma por tratamento. Cada uma tem ponto focal ajustado em `src/data/images.ts` (`IMAGE_FOCUS`). |
| `professionals/dra-camila.webp`, `dr-lucas.webp`, `dra-beatriz.webp` | **Temporárias** (retratos ilustrados). Substitua pelas fotos reais mantendo os nomes (ideal: 1200×1500, vertical). |
| `before-after/*.webp` (4) | Fotos publicadas pela clínica, em baixa resolução. Substitua pelos originais, com autorização dos pacientes. |
| `clinic/fachada-oralclin.webp` | Foto real da fachada em baixa resolução. Substitua pelo original. |

riginal. |

## Service worker (`/sw.js`)

O projeto **não usa PWA** e nenhum código registra service worker. O `GET /sw.js 404` vinha do navegador: um service worker antigo, registrado por outro projeto que rodou antes em `localhost:3000`, continua pedindo `/sw.js` para se atualizar. O arquivo `public/sw.js` responde a esse pedido e **se auto-remove** (limpa caches e cancela o registro), deixando o console e o terminal limpos.

## Observações sobre o conteúdo

- Endereço, CNPJ, e-mail e profissionais iniciais são **demonstrativos** e editáveis em *Conteúdo* e *Configurações*. WhatsApp e Instagram usam os canais públicos da clínica.
- As fotos de antes/depois e da fachada vêm das publicações da própria clínica (ver tabela de imagens temporárias).
