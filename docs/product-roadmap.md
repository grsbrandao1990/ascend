# Product Roadmap — Ascend

> Gerado pelo PLAID. Os checkboxes são atualizados conforme as tarefas são concluídas.
> O agente de código DEVE marcar as tarefas como `- [x]` à medida que as termina.

**Status:** 25/62 tarefas concluídas
**Fase atual:** Fase 2 — Gamificação e o Momento Mágico

## Build Philosophy

1. **Cada fase entrega algo usável.** Nenhuma fase deixa o app quebrado. Ao fim de qualquer fase, dá para rodar e demonstrar o que foi construído.
2. **Infraestrutura antes de funcionalidades.** A primeira fase configura tudo para que o trabalho de feature nas fases seguintes seja rápido e limpo.
3. **Momento mágico primeiro.** A proposta de valor central — concluir tarefa, ganhar XP, subir de nível — funciona o mais cedo possível (fim da Fase 2). Tudo o mais constrói sobre isso.
4. **Teste enquanto constrói.** Não deixe o teste para o fim. Cada tarefa inclui uma verificação.
5. **Aprimoramento progressivo.** Comece com a versão funcional mais simples e depois adicione polimento.
6. **Revise antes de prosseguir.** Suba cada fase concluída como um PR e deixe um agente de revisão (ex.: CodeRabbit) analisar antes de iniciar a próxima. A revisão externa pega problemas que o agente de código não sinaliza.
7. **Constantes de jogo isoladas.** Toda regra numérica da gamificação vive em `convex/gameConfig.ts` — recalibrar nunca exige caçar valores pelo código.
8. **"Hoje" é sagrado.** A tela de entrada sempre responde com honestidade "o que faço hoje?" — essa é a tela mais importante do app.

## Phase 0: Fundação e Setup

> **Goal:** O app roda como um shell autenticado — login funciona, rotas protegidas, layout base no ar e publicado na Vercel. Sem features ainda, mas a base está correta.

**Reference sections — leia antes de começar esta fase:**
- PRD: § Technical Architecture, § Auth Implementation, § Dependencies & Integrations
- Vision: § Estratégia de Marca (voz, para os textos de login)
- Design: `docs/design.md` (tokens) — **ainda não existe**; ver TASK-008.

**Phase prompt — entregue isto ao seu agente de código:**
> "Leia docs/product-roadmap.md e encontre a Fase 0. Depois leia apenas as Reference sections listadas acima de docs/prd.md e docs/product-vision.md. Comece pela primeira tarefa não marcada. Após cada tarefa, marque-a como concluída no roadmap. Ao terminar todas, crie a branch `phase-0/fundacao-e-setup`, faça commit, push e abra um PR para revisão."

- [x] **TASK-001** — Inicializar o projeto Next.js com TypeScript, App Router e Tailwind CSS
  Files: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`
  Notes: Usar `create-next-app` com TypeScript, App Router e Tailwind. Verify: `npm run dev` sobe o app em localhost sem erros.

- [x] **TASK-002** — Instalar e inicializar o Convex no projeto
  Files: `convex/`, `.env.local`, `package.json`
  Notes: Rodar `npm install convex` e `npx convex dev` para criar o deployment e o diretório `convex/`. Define `NEXT_PUBLIC_CONVEX_URL` e `CONVEX_DEPLOYMENT` no `.env.local`. Verify: o painel do Convex mostra o deployment conectado.

- [x] **TASK-003** — Configurar o provider do Convex no app
  Files: `src/app/layout.tsx`, `src/components/ConvexClientProvider.tsx`
  Notes: Envolver a aplicação com o provider do Convex no root layout. Verify: um componente de teste consegue chamar uma query simples sem erro.

- [x] **TASK-004** — Instalar e configurar o Convex Auth com provedor de e-mail/senha
  Files: `convex/auth.ts`, `convex/auth.config.ts`, `convex/schema.ts`, `.env.local`
  Notes: Instalar `@convex-dev/auth`, rodar o inicializador, configurar o provedor `Password`. Definir `AUTH_SECRET` no ambiente do Convex. Ver PRD § Auth Implementation. Verify: as tabelas de auth aparecem no painel do Convex.

- [x] **TASK-005** — Criar a estrutura de rotas com grupos `(auth)` e `(app)`
  Files: `src/app/(auth)/login/page.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/today/page.tsx`
  Notes: Grupo `(auth)` público; grupo `(app)` autenticado. `today/page.tsx` por ora é um placeholder. Verify: as rotas `/login` e `/today` carregam.

- [x] **TASK-006** — Criar o middleware de proteção de rotas
  Files: `src/middleware.ts`
  Notes: Usar `convexAuthNextjsMiddleware` para proteger o grupo `(app)`. Visitante não autenticado é redirecionado para `/login`. Verify: acessar `/today` deslogado redireciona para `/login`.

- [x] **TASK-007** — Construir a tela de login
  Files: `src/app/(auth)/login/page.tsx`, `src/components/auth/LoginForm.tsx`
  Notes: Formulário de e-mail/senha usando `useAuthActions`. Headline da marca: "Sua produtividade, com a progressão de um RPG." Mensagens de erro na voz da marca (ver Vision § Guia de Voz e Tom). Verify: criar conta e logar redireciona para `/today`.

- [x] **TASK-008** — Definir tokens de design provisórios no Tailwind
  Files: `src/app/globals.css` (Tailwind v4 usa CSS — sem `tailwind.config.ts`)
  Notes: `docs/design.md` ainda NÃO existe. Paleta escura provisória com accent roxo definida via `@theme inline` em `globals.css`. **Sinalizar ao fundador:** rodar `/plaid design` para gerar `docs/design.md` antes do polimento visual (Fase 4). Verify: classes de cor/tipografia aplicam no app.

- [x] **TASK-009** — Construir o shell do layout autenticado (sidebar + topo)
  Files: `src/app/(app)/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/TopBar.tsx`
  Notes: Sidebar à esquerda (placeholder de projetos + links Hoje/Busca/Perfil/Config); barra de topo reservada para o HUD de XP (preenchido na Fase 2). Verify: o layout aparece em todas as rotas de `(app)`.

- [x] **TASK-010** — Criar helpers de data e fuso horário
  Files: `src/lib/dates.ts`, `convex/lib/dates.ts`
  Notes: Instalar `date-fns` e `date-fns-tz`. Funções para "data de hoje" (`YYYY-MM-DD` em America/Sao_Paulo), chave de semana (`YYYY-Www`) e chave de mês (`YYYY-MM`). Ver PRD § Stack Integration Guide. Verify: testes manuais retornam as datas corretas para o fuso.

- [x] **TASK-011** — Publicar o deploy inicial na Vercel
  Files: `.env.local`, `README.md`
  Notes: README documenta todos os passos de deploy. AÇÃO NECESSÁRIA DO FUNDADOR: (1) rodar `npx convex dev` para conectar ao Convex e preencher `.env.local`; (2) fazer push para o GitHub; (3) conectar repositório à Vercel e configurar as variáveis de ambiente. Verify: o app publicado abre e o login funciona em produção.

## Phase 1: Projetos e Tarefas

> **Goal:** O Ascend é um gerenciador de tarefas funcional — dá para criar projetos, cadastrar e concluir tarefas avulsas, e a tela Hoje prioriza o dia por data de entrega.

**Reference sections — leia antes de começar esta fase:**
- PRD: § Data Model, § API Specification, § User Stories (Epics Projetos e Tarefas), § Functional Requirements (FR-002, FR-003, FR-005), § UI/UX Requirements (telas Hoje, Projeto; modal Formulário de Tarefa)
- Vision: § Fluxos Principais do Usuário
- Design: `docs/design.md § Components` (se já gerado)

**Phase prompt — entregue isto ao seu agente de código:**
> "Leia docs/product-roadmap.md e encontre a Fase 1. Leia apenas as Reference sections listadas de docs/prd.md, docs/product-vision.md e docs/design.md. Continue da primeira tarefa não marcada. Após cada tarefa, marque-a como concluída no roadmap. Ao terminar a fase, crie a branch `phase-1/projetos-e-tarefas`, faça commit, push e abra um PR."

- [x] **TASK-012** — Definir o schema do banco para projetos, tarefas e conclusões
  Files: `convex/schema.ts`
  Notes: Implementar as tabelas `projects`, `tasks` e `taskCompletions` exatamente como em PRD § Data Model, com seus índices. `userStats` e `goalAwards` virão na Fase 2. Verify: `npx convex dev` aplica o schema sem erro.

- [x] **TASK-013** — Implementar as queries e mutations de projetos
  Files: `convex/projects.ts`
  Notes: `projects.list`, `projects.create`, `projects.rename`, `projects.setColor`, `projects.archive`, `projects.remove`. Toda função autentica e filtra por `userId`. `remove` faz soft delete do projeto e das tarefas. Ver PRD § API Specification. Verify: criar/listar/arquivar projeto pelo painel de funções do Convex.

- [x] **TASK-014** — Listar projetos na sidebar
  Files: `src/components/layout/Sidebar.tsx`, `src/components/projects/ProjectList.tsx`
  Notes: Usar `useQuery` em `projects.list`. Projetos arquivados ficam ocultos por padrão. Verify: projetos criados aparecem na sidebar e atualizam sozinhos.

- [x] **TASK-015** — Construir o formulário de criar/editar projeto
  Files: `src/components/projects/ProjectForm.tsx`
  Notes: Dialog com campo de nome e seletor de cor. Botão de salvar desabilitado com nome vazio (FR-002). Verify: criar e renomear projeto pela UI.

- [x] **TASK-016** — Construir a página de um projeto
  Files: `src/app/(app)/projects/[id]/page.tsx`, `src/components/projects/ProjectHeader.tsx`
  Notes: Cabeçalho com nome do projeto e ações (renomear, recolorir, arquivar, excluir com confirmação). A lista de tarefas é preenchida na TASK-022. Ver PRD § UI/UX Requirements > Projeto. Verify: abrir um projeto pela sidebar mostra o cabeçalho e suas ações.

- [x] **TASK-017** — Implementar as queries e mutations de tarefas (CRUD básico)
  Files: `convex/tasks.ts`
  Notes: `tasks.create`, `tasks.update`, `tasks.remove` (soft delete), `tasks.get`, `tasks.listByProject`. Validar argumentos com os validadores do Convex. Sem recorrência ainda (campo opcional fica vazio). Ver PRD § API Specification. Verify: criar e editar tarefa pelo painel do Convex.

- [x] **TASK-018** — Implementar a query `tasks.listToday`
  Files: `convex/tasks.ts`
  Notes: Retornar tarefas avulsas com `dueDate` igual a hoje ou no passado (vencidas), ordenadas por data, com flags `isOverdue` e `isToday`. Ocorrências recorrentes entram na Fase 3. Verify: tarefas com prazo de hoje e vencidas retornam corretamente.

- [x] **TASK-019** — Construir o componente de linha de tarefa (TaskRow)
  Files: `src/components/tasks/TaskRow.tsx`
  Notes: Mostra checkbox de conclusão, título, projeto e prazo. Estados visuais distintos para vencida e concluída (FR-015). Verify: a linha renderiza nos três estados.

- [x] **TASK-020** — Construir o modal de formulário de tarefa
  Files: `src/components/tasks/TaskForm.tsx`
  Notes: Dialog com projeto (select), título, descrição (textarea opcional), prazo (date picker opcional). Validação com `react-hook-form` + `zod`. Salvar desabilitado sem projeto+título. O controle de recorrência entra na Fase 3. Ver PRD § UI/UX Requirements > Modal Formulário de Tarefa. Verify: criar tarefa em menos de 10 s e 4 campos.

- [x] **TASK-021** — Construir a tela Hoje
  Files: `src/app/(app)/today/page.tsx`, `src/components/tasks/TaskList.tsx`
  Notes: Consumir `tasks.listToday`, listar com `TaskRow` ordenado por data; hoje em destaque, vencidas sinalizadas no topo. Botão de nova tarefa. Ver PRD § UI/UX Requirements > Hoje. Verify: a tela responde "o que faço hoje?".

- [x] **TASK-022** — Listar tarefas na página do projeto
  Files: `src/app/(app)/projects/[id]/page.tsx`
  Notes: Consumir `tasks.listByProject`. Botão de nova tarefa já com o projeto pré-selecionado. Verify: tarefas do projeto aparecem na página dele.

- [x] **TASK-023** — Implementar conclusão básica de tarefa (sem XP ainda)
  Files: `convex/tasks.ts`, `src/components/tasks/TaskRow.tsx`
  Notes: `tasks.complete` e `tasks.uncomplete` em versão simples — só registram `taskCompletions` e marcam `isCompleted`. A lógica de gamificação completa entra na Fase 2. Verify: marcar/desmarcar tarefa funciona e persiste.

- [x] **TASK-024** — Adicionar estados de carregando e vazio às listas de tarefas
  Files: `src/components/tasks/TaskList.tsx`, `src/components/ui/EmptyState.tsx`
  Notes: Skeleton durante o carregamento; estado vazio na voz da marca ("Lista de hoje limpa. Ou você é uma máquina, ou esqueceu de cadastrar tarefas."). Ver Vision § Guia de Voz e Tom. Verify: estados aparecem corretamente sem dados.

- [x] **TASK-025** — Adicionar a query `tasks.search` e a tela de Busca (texto + filtro de projeto)
  Files: `convex/tasks.ts`, `src/app/(app)/search/page.tsx`
  Notes: Versão inicial: filtrar por texto no título/descrição em memória e por `projectId`. O search index do Convex é otimizado na Fase 3 (TASK-049). Verify: buscar por termo e por projeto retorna resultados.

## Phase 2: Gamificação e o Momento Mágico

> **Goal:** Concluir uma tarefa rende XP visível, metas dão bônus, o nível sobe e o "Level Up" do fim do dia dispara. **O momento mágico está vivo.**

**Reference sections — leia antes de começar esta fase:**
- PRD: § Data Model (`userStats`, `goalAwards`), § API Specification (`tasks.complete`, `stats.get`), § Functional Requirements (FR-006 a FR-010, FR-012, FR-013, FR-016), § UI/UX Requirements (tela Perfil, overlay Level Up), § Open Questions (Q1–Q5)
- Vision: § Design do Momento Mágico, § Princípios de Produto
- Design: `docs/design.md § Components`, `§ Elevation & Depth`

**Phase prompt — entregue isto ao seu agente de código:**
> "Leia docs/product-roadmap.md e encontre a Fase 2. Leia apenas as Reference sections listadas de docs/prd.md, docs/product-vision.md e docs/design.md. Continue da primeira tarefa não marcada. Após cada tarefa, marque-a como concluída no roadmap. Ao terminar a fase, crie a branch `phase-2/gamificacao`, faça commit, push e abra um PR."

- [ ] **TASK-026** — Adicionar as tabelas `userStats` e `goalAwards` ao schema
  Files: `convex/schema.ts`
  Notes: Implementar conforme PRD § Data Model, com os índices `by_user` e `by_user_type_period`. Verify: o schema aplica sem erro.

- [ ] **TASK-027** — Criar o arquivo de constantes de gamificação
  Files: `convex/gameConfig.ts`
  Notes: Centralizar TODAS as constantes (FR-016): `XP_PER_TASK = 10`; metas `DAILY_TARGET = 5`/`DAILY_BONUS = 50`, `WEEKLY_TARGET = 25`/`WEEKLY_BONUS = 200`, `MONTHLY_TARGET = 80`/`MONTHLY_BONUS = 500`; curva `xpToNextLevel(level) = 100 + 50 * level`. Ver PRD § Open Questions Q1–Q3. Verify: o arquivo exporta todas as constantes e funções.

- [ ] **TASK-028** — Criar `userStats` no primeiro login
  Files: `convex/gamification.ts`, `convex/auth.ts`
  Notes: Ao autenticar pela primeira vez, criar a linha de `userStats` (nível 1, 0 XP, streak 0). Função idempotente — não recriar se já existe. Verify: novo usuário tem `userStats` criado uma única vez.

- [ ] **TASK-029** — Implementar a lógica de XP e níveis
  Files: `convex/gamification.ts`
  Notes: Funções puras: somar XP a `totalXp`; derivar `level`, `xpIntoLevel` e XP para o próximo nível a partir da curva de `gameConfig.ts`. Nível trava em 100; XP continua acumulando (PRD § 11). Verify: testes manuais com vários valores de XP retornam o nível certo.

- [ ] **TASK-030** — Implementar a avaliação de metas diária, semanal e mensal
  Files: `convex/gamification.ts`
  Notes: Contar conclusões via índice `taskCompletions.by_user_date` para o dia/semana/mês; comparar com os alvos; conceder o bônus uma única vez por período, registrando em `goalAwards` (FR-008). Verify: bater uma meta concede o bônus exatamente uma vez.

- [ ] **TASK-031** — Implementar a lógica de sequência (streak)
  Files: `convex/gamification.ts`
  Notes: Quando a meta diária é batida, atualizar `currentStreak` (incrementa se o dia anterior bateu meta, senão reinicia em 1) e `longestStreak`; usar `lastGoalMetDate`. Definição de "dia" no fuso America/Sao_Paulo (FR-009). Verify: streak incrementa em dias consecutivos e zera ao pular um dia.

- [ ] **TASK-032** — Reescrever `tasks.complete` com a gamificação completa
  Files: `convex/tasks.ts`, `convex/gamification.ts`
  Notes: A mutation registra a conclusão, concede o XP da tarefa, reavalia metas e concede bônus, recalcula nível e streak, e retorna `{ xpAwarded, goalBonuses, leveledUp, newLevel, totalXp }`. Ver PRD § API Specification (regra-chave). Verify: concluir tarefa atualiza `userStats` e retorna o objeto completo.

- [ ] **TASK-033** — Atualizar `tasks.uncomplete` para estornar o XP da tarefa
  Files: `convex/tasks.ts`, `convex/gamification.ts`
  Notes: Desfazer remove a conclusão e o XP daquela tarefa; recalcula nível. Bônus de meta concedidos NÃO são estornados (PRD § Open Questions Q5). Verify: desfazer reduz o XP corretamente sem rebaixar nível abaixo do correto.

- [ ] **TASK-034** — Implementar a query `stats.get`
  Files: `convex/stats.ts`
  Notes: Retornar `userStats` + progresso para o próximo nível + estado das três metas do dia/semana/mês (atual vs. alvo) + streak. Verify: a query retorna todos os campos de progressão.

- [ ] **TASK-035** — Construir os componentes de XP e nível
  Files: `src/components/game/XpBar.tsx`, `src/components/game/LevelBadge.tsx`
  Notes: `XpBar` mostra o progresso dentro do nível atual; `LevelBadge` mostra o número do nível. Ligados a `stats.get` via `useQuery` — reativos. Ver `docs/design.md § Components`. Verify: os componentes refletem o estado real.

- [ ] **TASK-036** — Colocar o HUD de XP no layout autenticado
  Files: `src/components/layout/TopBar.tsx`, `src/app/(app)/layout.tsx`
  Notes: `XpBar` + `LevelBadge` visíveis no topo de todas as telas autenticadas (FR-010). Discreto, sem competir com o conteúdo. Verify: o HUD aparece em Hoje, Projeto, Busca e Perfil.

- [ ] **TASK-037** — Aplicar atualização otimista na conclusão de tarefa
  Files: `src/components/tasks/TaskRow.tsx`
  Notes: Usar o optimistic update do Convex para refletir o ganho de XP em < 200 ms; reverter se o servidor falhar (PRD § 11). Verify: a barra de XP sobe instantaneamente ao concluir.

- [ ] **TASK-038** — Construir o overlay de "Level Up"
  Files: `src/components/game/LevelUpOverlay.tsx`
  Notes: Quando `tasks.complete` retorna `leveledUp = true`, exibir um overlay breve com o novo nível e mensagem na voz da marca ("Lvl 24 desbloqueado. O Guilherme de ontem não chegava aos seus pés."). Dispensável por clique, some sozinho. Ver PRD § UI/UX > Overlay Level Up. Verify: subir de nível dispara o overlay de forma confiável.

- [ ] **TASK-039** — Construir o feedback de ganho de XP e de bônus de meta
  Files: `src/components/game/XpToast.tsx`, `src/components/tasks/TaskRow.tsx`
  Notes: Ao concluir, mostrar o `+XP` ganho; quando `goalBonuses` vier preenchido, mostrar o bônus de meta na voz da marca ("Semana fechada com folga. +200 XP de bônus na conta."). Verify: concluir tarefa mostra o XP; bater meta mostra o bônus.

- [ ] **TASK-040** — Construir a tela de Perfil/Progresso
  Files: `src/app/(app)/profile/page.tsx`, `src/components/game/GoalCard.tsx`, `src/components/game/StatCard.tsx`
  Notes: Cartão de nível (nível, XP total, progresso), cartões das três metas (atual vs. alvo) e cartão da sequência (atual/recorde). Consome `stats.get` (FR-012). Ver PRD § UI/UX > Perfil. Verify: todos os dados de progressão exibidos e corretos.

- [ ] **TASK-041** — Verificar o momento mágico de ponta a ponta
  Files: —
  Notes: Teste de aceitação: criar um projeto, cadastrar as tarefas do dia, concluir todas e confirmar que o XP sobe a cada conclusão e que o "Level Up" dispara ao cruzar o limiar. Ver Vision § Design do Momento Mágico. Verify: o fluxo completo funciona; o momento mágico acontece.

## Phase 3: Recorrência e Busca

> **Goal:** Tarefas recorrentes aparecem sozinhas no dia certo e a busca encontra qualquer tarefa por título, descrição ou projeto.

**Reference sections — leia antes de começar esta fase:**
- PRD: § Data Model (campo `recurrence`), § API Specification (`recurrence.ensureTodayOccurrences`, `tasks.search`), § Functional Requirements (FR-004, FR-011), § Edge Cases & Error Handling (Tarefas e Recorrência)
- Vision: § Fluxos Principais do Usuário
- Design: `docs/design.md § Components`

**Phase prompt — entregue isto ao seu agente de código:**
> "Leia docs/product-roadmap.md e encontre a Fase 3. Leia apenas as Reference sections listadas de docs/prd.md, docs/product-vision.md e docs/design.md. Continue da primeira tarefa não marcada. Após cada tarefa, marque-a como concluída no roadmap. Ao terminar a fase, crie a branch `phase-3/recorrencia-e-busca`, faça commit, push e abra um PR."

- [ ] **TASK-042** — Adicionar o controle de recorrência ao formulário de tarefa
  Files: `src/components/tasks/TaskForm.tsx`
  Notes: Controle opcional: tipo (diária/semanal/mensal); para semanal, dias da semana; para mensal, dia do mês. Ao ativar recorrência, substituir o campo de prazo pela regra. Ver PRD § UI/UX > Modal Formulário de Tarefa. Verify: criar tarefa recorrente nos três tipos.

- [ ] **TASK-043** — Implementar a lógica do motor de recorrência
  Files: `convex/recurrence.ts`
  Notes: Função pura: dada uma regra de recorrência e uma data, decidir se a tarefa "ocorre" naquele dia. Recorrência mensal no dia 31 em mês de 30 dias cai no último dia do mês (PRD § Edge Cases). Verify: testes manuais cobrem diária, semanal e os casos de borda mensais.

- [ ] **TASK-044** — Implementar `recurrence.ensureTodayOccurrences`
  Files: `convex/recurrence.ts`
  Notes: `internalMutation` idempotente que garante a disponibilidade das ocorrências recorrentes do dia. Não duplicar se rodar duas vezes (FR-004). Verify: rodar a função duas vezes não gera duplicatas.

- [ ] **TASK-045** — Configurar o cron diário de recorrência
  Files: `convex/crons.ts`
  Notes: Agendar `recurrence.ensureTodayOccurrences` para rodar uma vez por dia (início do dia, fuso America/Sao_Paulo). Ver PRD § Architecture Overview. Verify: o cron aparece registrado no painel do Convex.

- [ ] **TASK-046** — Incluir as ocorrências recorrentes em `tasks.listToday`
  Files: `convex/tasks.ts`
  Notes: A tela Hoje passa a mostrar as ocorrências recorrentes do dia além das tarefas avulsas. Uma ocorrência recorrente já concluída hoje (via `taskCompletions.by_task_date`) não reaparece. Verify: tarefa "toda terça" aparece nas terças e some ao ser concluída.

- [ ] **TASK-047** — Suportar a conclusão de ocorrências recorrentes
  Files: `convex/tasks.ts`, `src/components/tasks/TaskRow.tsx`
  Notes: `tasks.complete` aceita `occurrenceDate`; registra a conclusão da ocorrência sem afetar as futuras (FR-004). Concluir a ocorrência também concede XP normalmente. Verify: concluir a ocorrência de hoje mantém a próxima ocorrência programada.

- [ ] **TASK-048** — Sinalizar visualmente tarefas recorrentes
  Files: `src/components/tasks/TaskRow.tsx`
  Notes: Indicador visual de que uma linha é uma ocorrência recorrente, distinguindo-a de uma tarefa avulsa (FR-015). Verify: ocorrências recorrentes são identificáveis na lista.

- [ ] **TASK-049** — Otimizar a busca com o search index do Convex
  Files: `convex/tasks.ts`
  Notes: Reescrever `tasks.search` para usar o `searchIndex` `search_title` (definido no schema), filtrado por `userId`; complementar com filtro por descrição e por `projectId` (FR-011). Verify: a busca retorna resultados corretos e rápidos.

- [ ] **TASK-050** — Refinar a tela de Busca
  Files: `src/app/(app)/search/page.tsx`
  Notes: Busca ao vivo conforme digita; filtro de projeto; estados vazio/sem-resultado na voz da marca. Ver PRD § UI/UX > Busca. Verify: encontrar qualquer tarefa por título, descrição ou projeto.

- [ ] **TASK-051** — Tratar a edição de recorrência de uma tarefa existente
  Files: `convex/tasks.ts`, `src/components/tasks/TaskForm.tsx`
  Notes: Editar a regra de recorrência vale da edição em diante; ocorrências passadas já concluídas permanecem registradas (PRD § Edge Cases). Verify: alterar a recorrência não apaga o histórico de conclusões.

- [ ] **TASK-052** — Verificar a recorrência de ponta a ponta
  Files: —
  Notes: Teste de aceitação: criar tarefas recorrentes diária, semanal e mensal; avançar datas; confirmar que aparecem nos dias certos, sem duplicar, e que a conclusão não afeta ocorrências futuras. Verify: todos os casos de recorrência do PRD § Edge Cases passam.

## Phase 4: Outlook, Polimento e Lançamento

> **Goal:** A integração com Outlook funciona, o app está polido (erros, estados, acessibilidade, performance) e publicado para uso diário.

**Reference sections — leia antes de começar esta fase:**
- PRD: § Functional Requirements (FR-014), § Non-Functional Requirements, § Edge Cases & Error Handling, § Auth Implementation (OAuth Microsoft), § Open Questions (Q6)
- Vision: § Guia de Voz e Tom, § Riscos
- Design: `docs/design.md` (tokens completos, `§ Do's and Don'ts`)

**Phase prompt — entregue isto ao seu agente de código:**
> "Leia docs/product-roadmap.md e encontre a Fase 4. Leia apenas as Reference sections listadas de docs/prd.md, docs/product-vision.md e docs/design.md. Continue da primeira tarefa não marcada. Após cada tarefa, marque-a como concluída no roadmap. Ao terminar a fase, crie a branch `phase-4/outlook-polimento-e-lancamento`, faça commit, push e abra um PR."

- [ ] **TASK-053** — Registrar o app no Azure AD e documentar o setup
  Files: `README.md`, `.env.local`
  Notes: Criar um registro de app no Azure AD, obter `MS_CLIENT_ID`/`MS_CLIENT_SECRET`/`MS_TENANT_ID`, configurar o `redirect URI` e o escopo `Mail.ReadWrite`. Documentar os passos no README. Ver PRD § Dependencies > Third-Party Services. Verify: as credenciais existem e estão no ambiente.

- [ ] **TASK-054** — Implementar o fluxo de conexão da conta Microsoft
  Files: `src/app/(app)/settings/page.tsx`, `src/components/outlook/ConnectMicrosoft.tsx`
  Notes: Botão em Configurações para conectar a conta Microsoft via OAuth. Token de curta duração, escopo mínimo, não persistido em texto puro (PRD § Security). Verify: conectar a conta Microsoft conclui o OAuth.

- [ ] **TASK-055** — Implementar a action `outlook.createDraft`
  Files: `convex/outlook.ts`
  Notes: `action` que chama a Microsoft Graph API (`@microsoft/microsoft-graph-client`) para criar um rascunho com assunto = título da tarefa e corpo = descrição. Retorna o link do rascunho. Verify: a action cria um rascunho real no Outlook.

- [ ] **TASK-056** — Implementar o fallback `mailto:`
  Files: `src/components/outlook/EmailTaskButton.tsx`
  Notes: Se a Graph API falhar ou a conta não estiver conectada, abrir um link `mailto:` pré-preenchido (PRD § Open Questions Q6, § Edge Cases). Verify: com a integração indisponível, o `mailto:` abre com o contexto certo.

- [ ] **TASK-057** — Adicionar o botão "rascunhar e-mail" à tarefa
  Files: `src/components/tasks/TaskDetail.tsx`, `src/components/tasks/TaskRow.tsx`
  Notes: Ação na tarefa que chama `outlook.createDraft` (ou o fallback). Token expirado → pede reautenticação (FR-014). Verify: rascunhar e-mail a partir de uma tarefa funciona.

- [ ] **TASK-058** — Passar por todo o tratamento de erros e estados
  Files: `src/components/ui/ErrorState.tsx`, vários componentes
  Notes: Cobrir falha de rede (toast + repetir), sessão expirada (redirecionar), conclusão otimista que falha (reverter). Mensagens na voz da marca. Ver PRD § Edge Cases. Verify: cada cenário de erro se comporta como especificado.

- [ ] **TASK-059** — Revisar estados vazios e skeletons de carregamento
  Files: `src/components/ui/EmptyState.tsx`, telas diversas
  Notes: Garantir estado vazio e skeleton em Hoje, Projeto, Busca e Perfil, todos na voz da marca. Verify: nenhuma tela mostra um vazio sem tratamento.

- [ ] **TASK-060** — Aplicar os tokens visuais de `docs/design.md`
  Files: `tailwind.config.ts`, `src/app/globals.css`, componentes de `src/components/ui/`
  Notes: Substituir os tokens provisórios da TASK-008 pelos definitivos de `docs/design.md`. **Se `docs/design.md` ainda não existir, rodar `/plaid design` antes desta tarefa.** Verify: o app reflete a identidade visual definida.

- [ ] **TASK-061** — Passe de acessibilidade e performance
  Files: vários componentes
  Notes: Navegação por teclado nos fluxos principais (criar/concluir tarefa, busca); contraste AA; checar LCP < 2 s e bundle inicial < 250 KB. Ver PRD § Non-Functional Requirements. Verify: os fluxos-chave funcionam só com teclado; as metas de performance são atingidas.

- [ ] **TASK-062** — Deploy final de produção e teste de fumaça
  Files: `README.md`
  Notes: Deploy de produção na Vercel + `npx convex deploy`. Rodar um teste de fumaça do fluxo completo (login → criar projeto → criar tarefas → concluir → Level Up → recorrência → busca → e-mail). Anotar no README que as constantes de `gameConfig.ts` devem ser recalibradas após 2-4 semanas de uso (Vision § Riscos, PRD § Open Questions). Verify: o app de produção passa no teste de fumaça de ponta a ponta.

## Agent Session Guide

### Como usar este roadmap com seu agente de código

1. **Inicie uma sessão:** dê ao agente o "Phase prompt" do início de cada fase.
2. **Leia seletivamente:** cada fase lista suas Reference sections — as partes específicas do PRD, da visão e do design necessárias. O agente lê só essas, não os documentos inteiros.
3. **Deixe trabalhar:** o agente lê o roadmap, acha a primeira tarefa não marcada, implementa e marca como concluída.
4. **Uma sessão = uma fase (ideal):** tente concluir uma fase inteira por sessão. Se precisar parar, o agente retoma da última tarefa não marcada.
5. **Suba um PR para revisão:** ao terminar uma fase, suba o trabalho como PR e deixe um agente de revisão (ex.: CodeRabbit) analisar antes de iniciar a próxima.
6. **Precisa de mais contexto?** Se uma tarefa referenciar uma seção fora das Reference sections da fase, o agente lê só aquela seção sob demanda.

### Dicas de sessão

- **Não leia tudo:** o PRD e a visão são grandes. As Reference sections de cada fase dizem exatamente o que ler. Carregar os documentos inteiros desperdiça contexto.
- **Não pule tarefas:** elas estão ordenadas de propósito. Pular cria problemas de dependência.
- **Verifique ao fim de cada fase:** rode o app depois de cada fase para confirmar que tudo funciona antes de seguir.
- **Revise antes de avançar:** suba um PR por fase concluída e deixe o agente de revisão checar. Não comece a próxima fase antes do merge.
- **Atualize a linha de status:** após concluir tarefas, atualize o cabeçalho: `**Status:** X/62 tarefas concluídas` e `**Fase atual:** Fase N`.

### Fluxo de revisão por fase

Ao concluir uma fase, crie a branch `phase-{N}/{slug}`, faça commit e push, e abra um PR para `main`. Título: `Fase {N}: {Título da Fase}`. No corpo, inclua o objetivo da fase, a contagem de tarefas concluídas (TASK-XXX a TASK-YYY) e o que verificar manualmente.

Recomendação de agente de revisão: [CodeRabbit](https://coderabbit.ai) — gratuito para projetos open-source, faz revisão automática a cada PR. Se houver apontamentos, trate-os em commits adicionais na mesma branch, deixe revisar de novo e só faça merge com a revisão limpa. Se você não usa GitHub ou não quer revisão por PR, pode pular esse passo — você abre mão de uma checagem automática que pega bugs e problemas de segurança, mas a verificação por tarefa continua valendo.

### Modelos de prompt

**Iniciar uma nova fase:**
> "Leia docs/product-roadmap.md e encontre a fase atual. Leia apenas as Reference sections listadas para essa fase de docs/prd.md, docs/product-vision.md e docs/design.md. Comece pela primeira tarefa não marcada. Após cada tarefa, marque o checkbox como [x] no roadmap. Continue pela fase."

**Retomar após uma pausa:**
> "Leia docs/product-roadmap.md. Encontre onde paramos (primeira tarefa não marcada). Leia apenas as Reference sections da fase atual de docs/prd.md, docs/product-vision.md e docs/design.md. Continue da primeira tarefa não marcada."

**Após concluir uma fase:**
> "A Fase [N] está concluída. Crie a branch phase-{N}/{slug}, faça commit de tudo, push e abra um PR para a main. Titule 'Fase {N}: {Título}' e inclua o objetivo da fase e a contagem de tarefas concluídas no corpo."

**Corrigir um problema:**
> "Há um problema com [descrição]. Leia a seção relevante de docs/prd.md para o comportamento esperado e corrija. Não marque novas tarefas como concluídas até a correção ser verificada."
rificada."
