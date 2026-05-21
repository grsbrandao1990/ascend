# Comece aqui — Build do Ascend

Este guia te leva do zero até o build do Ascend rodando, fase a fase, com o Claude Code na sua máquina. Siga as partes na ordem.

---

## Parte 1 — O que instalar na sua máquina

Você vai precisar de três coisas. Todas gratuitas.

**1. Node.js (versão LTS)**
Baixe em [nodejs.org](https://nodejs.org) e instale a versão LTS. É o que roda o Next.js, o Convex e o `npm`.
Para conferir, abra o terminal e rode: `node --version` (deve mostrar um número de versão).

**2. Git**
Baixe em [git-scm.com](https://git-scm.com). É o controle de versão — o roadmap usa uma branch por fase.
Para conferir: `git --version`.

**3. Claude Code**
É o agente de código que vai construir o app. Depois de instalar o Node, rode no terminal:
`npm install -g @anthropic-ai/claude-code`
Para iniciar, digite `claude` dentro da pasta do projeto. Se o comando de instalação mudar, confira em [docs.claude.com](https://docs.claude.com).

---

## Parte 2 — Contas a criar

**Agora (necessárias para a Fase 0):**

- **Convex** — [convex.dev](https://convex.dev). Crie a conta gratuita. O comando `npx convex dev` (TASK-002) vai pedir login na primeira vez e criar seu deployment.
- **GitHub** — [github.com](https://github.com). Crie a conta e um repositório vazio chamado `ascend`. É onde o código fica e onde abrem os PRs de revisão de cada fase.
- **Vercel** — [vercel.com](https://vercel.com). Crie a conta gratuita (plano Hobby) e conecte ao seu GitHub. É onde o app é publicado (TASK-011).

**Depois (só na Fase 4):**

- **Azure** — [portal.azure.com](https://portal.azure.com). Conta gratuita, necessária só para a integração com Outlook (TASK-053). Pode deixar para quando chegar lá.

**Opcional:**

- **CodeRabbit** — [coderabbit.ai](https://coderabbit.ai). Revisão automática de cada PR. Gratuito para projetos open-source. Recomendado, mas o build funciona sem.

---

## Parte 3 — Montar a pasta do projeto

1. Crie uma pasta no seu computador chamada `ascend`.
2. Dentro dela, crie uma subpasta chamada `docs`.
3. Coloque os arquivos que o PLAID gerou nos lugares certos:
   - `vision.json` → na raiz: `ascend/vision.json`
   - `product-vision.md` → em `ascend/docs/`
   - `prd.md` → em `ascend/docs/`
   - `product-roadmap.md` → em `ascend/docs/`
   - `design.md` → em `ascend/docs/`

A estrutura inicial fica assim:

```
ascend/
├── vision.json
└── docs/
    ├── product-vision.md
    ├── prd.md
    ├── product-roadmap.md
    └── design.md
```

O Claude Code vai criar todo o resto (o app Next.js, a pasta `convex/`, etc.) a partir daqui.

---

## Parte 4 — Rodar a Fase 0

1. Abra o terminal dentro da pasta `ascend`.
2. Inicie o Claude Code com o comando `claude`.
3. Cole o prompt de arranque da Fase 0 (abaixo) e deixe ele trabalhar.

**Prompt de arranque — Fase 0:**

> Leia docs/product-roadmap.md e encontre a Fase 0. Depois leia apenas as Reference sections listadas para essa fase em docs/prd.md e docs/product-vision.md. Comece pela primeira tarefa não marcada. Após cada tarefa, marque-a como concluída no roadmap (troque `- [ ]` por `- [x]`) e atualize a linha de status no topo. Ao terminar todas as tarefas da fase, crie a branch `phase-0/fundacao-e-setup`, faça commit, push e abra um PR para revisão.

Durante a Fase 0, o Claude Code vai pedir para você fazer login no Convex (uma janela do navegador abre) e configurar o deploy na Vercel. Isso é esperado — siga as instruções que ele der.

---

## Parte 5 — O ciclo de cada fase

São 5 fases, 62 tarefas. O ciclo se repete:

1. **Build** — dê ao Claude Code o prompt de arranque da fase (cada fase tem o seu, dentro do próprio `product-roadmap.md`, no bloco "Phase prompt").
2. **Verifique** — ao fim da fase, rode o app e confira que o objetivo da fase foi atingido.
3. **Revise** — o Claude Code abre um PR; deixe o CodeRabbit (ou outro revisor) analisar antes de seguir.
4. **Merge** — junte o PR à branch principal.
5. **Próxima fase** — repita.

As 5 fases, na ordem:

| Fase | Entrega | Tarefas |
|---|---|---|
| 0 — Fundação e Setup | App roda como shell autenticado | TASK-001 a 011 |
| 1 — Projetos e Tarefas | Gerenciador de tarefas funcional | TASK-012 a 025 |
| 2 — Gamificação | XP, níveis e o "Level Up" funcionando | TASK-026 a 041 |
| 3 — Recorrência e Busca | Tarefas recorrentes e busca robusta | TASK-042 a 052 |
| 4 — Outlook e Lançamento | Integração com Outlook, app polido | TASK-053 a 062 |

**Prompt para retomar depois de uma pausa:**

> Leia docs/product-roadmap.md e encontre a fase atual (a primeira com tarefas não marcadas). Leia apenas as Reference sections listadas para essa fase. Continue da primeira tarefa não marcada.

---

## Parte 6 — Dicas

- **Uma sessão = uma fase.** Tente concluir uma fase inteira por sessão do Claude Code; ajuda a manter o contexto.
- **Não pule tarefas.** Elas estão ordenadas de propósito; pular cria problemas de dependência.
- **O roadmap se atualiza sozinho.** O Claude Code marca os checkboxes conforme avança — é assim que você acompanha o progresso.
- **Recalibre a gamificação depois.** Os números de XP e metas (em `convex/gameConfig.ts`) são um ponto de partida. Depois de 2 a 4 semanas usando o app, ajuste-os conforme o seu ritmo real de tarefas.
- **Travou?** Diga ao Claude Code: "Há um problema com [descrição]. Leia a seção relevante de docs/prd.md para o comportamento esperado e corrija."
