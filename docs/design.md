---
version: alpha
name: Ascend
description: Sistema de design dark e focado, com faisca de RPG, para o gerenciador de tarefas gamificado Ascend.
colors:
  background: "#0F0F18"
  surface: "#1A1A2A"
  surface-raised: "#24243A"
  primary: "#7C5CFC"
  primary-hover: "#9277FF"
  on-primary: "#FFFFFF"
  accent: "#2DD4BF"
  on-accent: "#08231F"
  on-surface: "#F4F4F8"
  on-surface-variant: "#A0A0B8"
  border: "#2E2E44"
  success: "#4ADE80"
  warning: "#F5A623"
  error: "#F2555A"
  info: "#5B9DF9"
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  numeric:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: 44px
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: 44px
  input-text:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
    height: 44px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  task-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  task-row-completed:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  sidebar-item:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  sidebar-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.h3}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  xp-bar:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.full}"
    height: 8px
  level-badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.numeric}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# Ascend Design System

## Overview

O Ascend é um gerenciador de tarefas pessoal que transforma a produtividade num RPG. O usuário é o próprio fundador — um profissional que abre o app no desktop várias vezes por dia para conduzir trabalho e vida pessoal. O visual precisa provocar duas coisas ao mesmo tempo: foco e uma faísca de progressão. Escuro o suficiente para concentrar, com um brilho de game que aparece nos momentos de XP e de Level Up. A personalidade é a de um coach sereno: presente e encorajador, nunca estridente. Dois anti-padrões guiam todas as decisões — o sistema nunca deve cansar a vista com neon excessivo, nem soar como um dashboard corporativo genérico, sem alma de RPG.

## Colors

O sistema é dark-only. A profundidade nasce de três superfícies em tons crescentes: `background` (`#0F0F18`) para a página, `surface` (`#1A1A2A`) para cartões e painéis, e `surface-raised` (`#24243A`) para inputs e elementos elevados. `primary` é o violeta `#7C5CFC` — a cor da marca, dos botões principais e da navegação ativa; `primary-hover` apenas o clareia. `accent` é o ciano-esverdeado `#2DD4BF` e tem um papel restrito: é a cor da energia de progressão — barra de XP, Level Up, foco e destaques. Usá-lo como cor decorativa geral o esvazia, então ele fica reservado a esses momentos. O texto usa `on-surface` (`#F4F4F8`, quase branco) e `on-surface-variant` (`#A0A0B8`, lavanda dessaturado) para conteúdo secundário. As cores semânticas — `success`, `warning`, `error`, `info` — cobrem estados; todo texto sobre superfície atinge no mínimo WCAG AA, e o `accent` é usado como cor de preenchimento ou fundo de elementos pequenos, não como texto fino.

## Typography

A família única é a Inter — uma sans geométrica humanista, neutra e altamente legível, coerente com o caráter das duas referências e bem suportada por ferramentas de código. A escala tem sete níveis com papéis claros: `display` para números grandes de destaque (o nível na tela de progresso); `h1` a `h3` para a hierarquia de telas e seções; `body` para o texto corrente; `caption` para metadados e texto secundário; e `numeric`, uma variante da Inter com algarismos tabulares (`tnum`), para XP, contagens e nível — assim os números não "dançam" ao atualizar. Os pesos são três: 400 para corpo, 600 para ênfase e elementos de UI, 700 para títulos. Nenhuma serifa, em nenhum contexto.

## Layout

A densidade é confortável — pensada para uso diário e prolongado, sem apertar a informação. O espaçamento segue uma escala sobre base 4/8, de `xs` (4px) a `xxxl` (48px), aplicada de forma consistente. O layout autenticado tem uma sidebar fixa à esquerda, o HUD de XP no topo e a área de conteúdo principal com largura contida e respiro generoso entre os cartões. Listas de tarefas usam espaçamento `sm`–`md` entre linhas; blocos e seções se separam por `xl`. O ritmo regular do espaçamento é o que mantém a interface calma mesmo com muita tarefa na tela.

## Elevation & Depth

A profundidade vem do contraste de tons das três superfícies — `background` → `surface` → `surface-raised` —, não de sombras pesadas. Cartões e linhas são superfícies planas, diferenciadas pelo valor da cor; bordas em `border` (`#2E2E44`) aparecem apenas quando a separação por tom não basta. A exceção é a faísca de game: um glow suave do `accent` é reservado aos momentos de gamificação — a barra de XP enchendo, o overlay de Level Up, o item ativo da navegação. Esse glow é o único recurso de "luz" do sistema. Mantê-lo restrito a esses instantes é o que o torna especial e evita o cansaço do neon constante.

## Shapes

O arredondamento é macio e consistente. `rounded.sm` (8px) para inputs e elementos pequenos; `rounded.md` (12px) para botões, linhas de tarefa e itens de navegação; `rounded.lg` (16px) para cartões e painéis; `rounded.full` para chips, avatares e a barra de XP. Não há cantos vivos (0px) em lugar nenhum — a forma macia comunica um app acolhedor, não uma ferramenta fria. A barra de XP totalmente arredondada reforça a leitura imediata de "medidor de jogo".

## Components

O `button-primary` carrega a ação principal: fundo `primary`, texto branco, raio `md`; o `button-primary-hover` apenas clareia o violeta. O `button-secondary` usa `surface-raised`, para ações de menor peso. O `input-text` tem fundo `surface-raised` e raio `sm`; no estado de foco, recebe uma borda `accent`. O `card` é a superfície de conteúdo, com raio `lg` e padding `xl`. O `task-row` é a linha de tarefa, raio `md`; o `task-row-completed` mantém o layout mas esmaece o texto para `on-surface-variant`, marcando a conclusão sem removê-la da vista. O `sidebar-item` é discreto, em `on-surface-variant`; o `sidebar-item-active` ganha fundo `primary` e o glow sutil. O `chip`, totalmente arredondado, identifica o projeto de uma tarefa em `caption`. O `xp-bar` é o medidor central: trilho em `surface-raised`, preenchimento em `accent` com glow suave, animando rápido a cada ganho de XP. O `level-badge` mostra o nível em `numeric` sobre fundo `accent`. O momento de Level Up usa uma animação curta e dispensável — o brilho do `accent` mais a subida do número —, nunca um modal que trave o fluxo.

## Do's and Don'ts

**Do:** manter o `accent` ciano-esverdeado exclusivo dos momentos de progressão (XP, Level Up, foco, ativo). **Do:** criar hierarquia com as três superfícies, sem recorrer a sombras pesadas. **Do:** animar o ganho de XP de forma rápida e sutil, para o feedback ser sentido sem distrair. **Do:** manter a lista de tarefas como protagonista de toda tela. **Do:** garantir contraste WCAG AA para todo texto.

**Don't:** espalhar glows e gradientes pela interface inteira — neon constante cansa no uso diário. **Don't:** empilhar ícones, medalhas e enfeites de jogo a ponto de competir com as tarefas — é o erro do Habitica. **Don't:** cair num cinza corporativo sem nenhum traço de RPG. **Don't:** introduzir serifas ou um segundo tema claro. **Don't:** usar o vermelho de `error` para sinalizar tarefa vencida — vencida é `warning` (âmbar); `error` é só falha de sistema.
