# Ascend

> Gerenciador de tarefas com progressão de RPG. Cada tarefa concluída vira XP.

## Stack

- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind v4) — hospedado na Vercel
- **Backend/Banco/Auth:** Convex — deployment separado por ambiente (dev / prod)
- **Integração (Fase 4):** Microsoft Graph API (rascunho de e-mail no Outlook)

## Setup local

### 1. Pré-requisitos

- Node.js LTS instalado (`node --version`)
- Conta no [Convex](https://convex.dev) criada (gratuita)
- Conta no [GitHub](https://github.com) com repositório `ascend` criado
- Conta na [Vercel](https://vercel.com) conectada ao GitHub (para deploy)

### 2. Instalar dependências

```bash
npm install
```

### 3. Conectar ao Convex

```bash
npx convex dev
```

> Este comando abre o navegador para login no Convex, cria o deployment e preenche `.env.local` com `NEXT_PUBLIC_CONVEX_URL` e `CONVEX_DEPLOYMENT`.
> O Convex também vai solicitar a configuração do `AUTH_SECRET` — siga as instruções no terminal.

### 4. Rodar o dev server

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel (TASK-011)

1. Fazer push do código para o repositório GitHub.
2. Na Vercel, importar o repositório e configurar as variáveis de ambiente:
   - `NEXT_PUBLIC_CONVEX_URL` — URL do deployment Convex de produção
   - `CONVEX_DEPLOYMENT` — identificador do deployment de produção
3. No painel do Convex, criar um deployment de **produção** separado do de desenvolvimento.
4. No build command da Vercel, adicionar: `npx convex deploy && next build`
5. O deploy inicial verifica: app abre em HTTPS, login funciona, redirecionamento para `/today` funciona.

## Variáveis de ambiente

| Variável | Onde configurar | Quando |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` e Vercel | Fase 0 |
| `CONVEX_DEPLOYMENT` | `.env.local` e Vercel | Fase 0 |
| `AUTH_SECRET` | Painel do Convex (servidor) | Fase 0 |
| `MS_CLIENT_ID` | `.env.local` e Vercel | Fase 4 |
| `MS_CLIENT_SECRET` | Painel do Convex (servidor) | Fase 4 |
| `MS_TENANT_ID` | `.env.local` e Vercel | Fase 4 |
| `MS_REDIRECT_URI` | `.env.local` e Vercel | Fase 4 |

## Recalibração da gamificação

Após 2–4 semanas de uso real, ajustar as constantes em `convex/gameConfig.ts`:
- `XP_PER_TASK` — XP por tarefa concluída (default: 10)
- `DAILY_TARGET` / `DAILY_BONUS` — meta diária
- `WEEKLY_TARGET` / `WEEKLY_BONUS` — meta semanal
- `MONTHLY_TARGET` / `MONTHLY_BONUS` — meta mensal
- `xpToNextLevel(level)` — curva de XP por nível

## Smoke test de produção

Após cada deploy, rodar o seguinte checklist no app de produção:

- [ ] Login com e-mail e senha funciona, redireciona para `/today`
- [ ] Criar projeto com nome e cor
- [ ] Criar tarefa avulsa com prazo de hoje → aparece na tela Hoje
- [ ] Concluir tarefa → XP sobe na barra do topo
- [ ] Bater meta diária (5 tarefas) → toast de bônus aparece
- [ ] Criar tarefa recorrente diária → aparece no dia seguinte
- [ ] Buscar por título de uma tarefa → resultado aparece
- [ ] Acessar Perfil → nível, XP, metas e streak exibidos
- [ ] Sair da conta (Configurações → Sair) → redireciona para login

## Fases do build

| Fase | Branch | Tarefas |
|---|---|---|
| 0 — Fundação e Setup | `phase-0/fundacao-e-setup` | TASK-001 a 011 |
| 1 — Projetos e Tarefas | `phase-1/projetos-e-tarefas` | TASK-012 a 025 |
| 2 — Gamificação | `phase-2/gamificacao` | TASK-026 a 041 |
| 3 — Recorrência e Busca | `phase-3/recorrencia-e-busca` | TASK-042 a 052 |
| 4 — Outlook e Lançamento | `phase-4/outlook-polimento-e-lancamento` | TASK-053 a 062 |
