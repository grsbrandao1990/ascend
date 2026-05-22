# Visão de Produto — Ascend

> Gerado pelo PLAID a partir de `vision.json`. Este documento é a base estratégica não técnica do Ascend. Ele orienta as decisões de produto, marca e design. O blueprint técnico está em `docs/prd.md` e o plano de build em `docs/product-roadmap.md`.

## 1. Visão e Missão

### Declaração de Visão

Um mundo onde se manter organizado é tão envolvente quanto evoluir um personagem no seu RPG favorito — onde a disciplina diária deixa de ser esforço de vontade e vira progressão visível.

### Declaração de Missão

O Ascend transforma cada tarefa concluída em progresso mensurável — XP, metas e níveis — para que o hábito de organização se sustente pela motivação intrínseca de "evoluir", e não pela cobrança.

### Por Que o Fundador

Guilherme é gerente de marketing no mercado imobiliário de locação multifamily em São Paulo. No dia a dia, conduz um time que toca branding e performance ao mesmo tempo — duas frentes com ritmos, prazos e métricas diferentes. Para dar conta disso sem deixar nada cair, ele precisa de um sistema de organização que funcione todos os dias, não só nas semanas em que a motivação está alta.

O Ascend nasce de uma frustração concreta e repetida. Guilherme é usuário fiel do Todoist e gosta da ferramenta, mas três coisas o incomodam: a mensalidade, as limitações que não moldam ao fluxo dele e — principalmente — uma gamificação rasa demais para sustentar o foco. O Todoist tem "pontos de karma", mas isso nunca foi suficiente para criar um loop de motivação real. O padrão se repete: ele começa organizado, mantém o ritmo por algumas semanas e depois a disciplina se dissolve, e as tarefas se acumulam.

A vantagem do Guilherme aqui é dupla. Primeiro, ele é o usuário — cada decisão de produto é testada na rotina real dele, sem suposições. Segundo, ele é gamer de longa data: Diablo, Pokémon, Final Fantasy. Ele não admira a mecânica de progressão de RPG de fora; ele já passou centenas de horas dentro dela e entende, na prática, o que faz uma curva de XP prender e o que a torna entediante. O Ascend é a tentativa de pegar exatamente esse loop — "mais uma quest, só mais um nível" — e apontá-lo para a produtividade.

### Valores Centrais

**A gamificação serve ao foco, nunca o contrário.** Cada elemento de RPG existe para fazer Guilherme concluir tarefas reais. Se uma mecânica for divertida mas não aumentar a conclusão de tarefas, ela não entra. A pergunta de teste para qualquer feature de jogo é: "isso me faz fechar mais tarefas ou só me distrai?"

**Construir só o que vai ser usado de verdade.** O Ascend é de uso pessoal e single-user. Não há pressão de mercado, então não há desculpa para feature inchada. Toda funcionalidade precisa passar pelo filtro: "eu, Guilherme, vou usar isso toda semana?" Se a resposta for "talvez", fica fora.

**A tela de entrada nunca mente sobre o dia.** A primeira coisa que Guilherme vê ao abrir o app é uma resposta honesta e priorizada para "o que eu preciso fazer hoje". Sem listas infladas, sem tarefas vencidas escondidas. Clareza acima de conforto.

**Progresso é irreversível e visível.** XP ganho não se perde. Nível alcançado não regride. O sistema recompensa a consistência acumulada — uma semana ruim atrasa o progresso, mas nunca o apaga. Isso protege a motivação nos momentos em que ela é mais frágil.

### Pilares Estratégicos

**O momento mágico vem cedo e se repete.** O "Level Up" ao fechar o dia precisa ser alcançável já na primeira semana de uso e acontecer de forma confiável depois. Tudo no produto é desenhado em volta de tornar esse instante frequente e satisfatório.

**Velocidade de captura acima de tudo.** Criar uma tarefa precisa levar segundos. Se cadastrar uma tarefa der trabalho, Guilherme volta para o papel ou para a cabeça — e o sistema inteiro falha. Atrito na entrada de dados é o inimigo número um.

**Uma curva de XP que respeita o jogador.** A escala de níveis 1 a 100 precisa ser calibrada: rápida o suficiente no começo para fisgar, lenta o suficiente no fim para ter peso. Uma curva mal calibrada mata o loop de motivação — ou entrega níveis fáceis demais, ou trava o jogador.

**Decisões reversíveis primeiro.** Como é um projeto pessoal construído nas horas vagas com um agente de código, a estratégia é começar simples e ajustar. Constantes de gamificação (XP por tarefa, valores de bônus, curva de níveis) ficam num único arquivo de configuração, fáceis de recalibrar depois do uso real.

### Como É o Sucesso

Daqui a 12 meses, o Ascend é o único gerenciador de tarefas do Guilherme — o Todoist foi aposentado. Ele abre o app várias vezes por dia, no desktop, sem pensar. A tela de entrada virou um reflexo: a primeira coisa de manhã, a última à noite. O número que mais importa subiu de forma constante — ele está em algum lugar entre o nível 30 e o nível 50, e esse número representa meses de dias consistentes, não um pico isolado de motivação. As sequências de metas diárias batidas se tornaram um jogo contra si mesmo que ele não quer perder. As tarefas de trabalho (campanhas, aprovações, relatórios do time) e as pessoais convivem no mesmo lugar, e ele parou de sentir que "esqueceu de alguma coisa". O sucesso não é um app bonito — é Guilherme dizendo, sem exagero, que está mais organizado e mais consistente do que jamais foi com o Todoist.

## 2. Pesquisa de Usuário

### Persona Primária

**Guilherme, 30 e poucos anos, gerente de marketing no mercado imobiliário (locação multifamily), São Paulo.**

Rotina: o dia dele é fragmentado. Conduz um time que executa branding (marca, conteúdo, posicionamento) e performance (mídia paga, métricas, otimização) — duas disciplinas com lógicas distintas. Entre reuniões de alinhamento, aprovações, acompanhamento de campanhas e demandas que chegam de outras áreas, ele alterna de contexto dezenas de vezes por dia. À noite e nos fins de semana, ainda precisa organizar a vida pessoal: compromissos, contas, recados, projetos próprios.

Conforto com tecnologia: alto como usuário, baixo como construtor. Ele usa software o dia todo e tem opinião formada sobre boas e más ferramentas, mas não programa. Vai construir o Ascend com um agente de código (Claude Code), o que significa que ele consegue avaliar o resultado, mas não escrever ou depurar o código sozinho.

O que ele faz hoje: usa o Todoist, pago, como ferramenta principal. Em paralelo, ainda recorre a lembretes do celular, ao calendário/Outlook e a anotações soltas — sinal de que nenhuma ferramenta única resolveu tudo.

Estado emocional em relação ao problema: não é ansiedade aguda, é um desgaste de fundo. A sensação recorrente de "será que esqueci alguma coisa?" e a frustração de começar organizado e perder o ritmo. Ele não odeia organização — ele gosta, e até se diverte com isso quando há um retorno. O problema é sustentar.

O que o faria trocar de ferramenta: um sistema de progressão que ele queira voltar a ver. O Todoist resolve a parte funcional; o que falta é o gancho motivacional. Guilherme troca de ferramenta quando a nova entrega o mesmo nível funcional **mais** um motivo emocional para abrir o app todo dia.

### Personas Secundárias

O Ascend é, por decisão explícita, um produto single-user de uso pessoal. Não há personas secundárias reais no MVP. Registramos aqui apenas um cenário futuro hipotético, sem nenhum compromisso de implementação:

**Amigo gamer com a mesma dor (futuro hipotético).** Outra pessoa que goste de RPG e se frustre com a gamificação rasa dos apps de tarefa. Se o Ascend funcionar bem para o Guilherme por meses, poderia eventualmente ser aberto para essas pessoas — o que exigiria multiusuário, contas separadas e isolamento de dados. Isso está fora de escopo e não deve influenciar nenhuma decisão técnica do MVP.

### Trabalhos a Serem Feitos (JTBD)

**Funcionais — o que Guilherme precisa realizar:**
- Capturar uma tarefa em segundos, antes de esquecê-la, vinculando-a a um projeto.
- Saber, ao abrir o app, exatamente o que precisa ser feito hoje, em ordem de prioridade.
- Definir tarefas recorrentes (ex.: "toda terça") sem recadastrá-las manualmente.
- Reencontrar uma tarefa específica entre dezenas, por título, descrição ou projeto.
- Disparar um e-mail relacionado a uma tarefa sem trocar de ferramenta nem reescrever o contexto.

**Emocionais — como ele quer se sentir:**
- Sentir que está progredindo, não só "correndo atrás".
- Sentir o alívio de uma lista do dia zerada.
- Sentir orgulho de uma sequência longa de dias consistentes.

**Sociais — como ele quer se perceber:**
- Ver-se como alguém organizado e no controle — uma identidade, não um esforço pontual.

### Pontos de Dor

**1. Perda de ritmo (severidade: alta; frequência: a cada poucas semanas).** O padrão central. Guilherme começa organizado e, sem um retorno que prenda, a disciplina se dissolve. Hoje ele não faz nada estrutural sobre isso — apenas "recomeça" periodicamente. Consequência: tarefas se acumulam, e o custo emocional do recomeço cresce a cada ciclo.

**2. Gamificação rasa do Todoist (severidade: alta; frequência: diária).** Os pontos de karma do Todoist existem, mas não criam um loop. Não há a sensação de "evoluir". Hoje Guilherme simplesmente ignora esse aspecto da ferramenta. Consequência: a ferramenta funciona, mas não motiva — e motivação é justamente o que falta.

**3. Mensalidade por algo que não molda ao fluxo dele (severidade: média; frequência: mensal/recorrente).** Pagar é tolerável; pagar por uma ferramenta que ele não consegue adaptar incomoda. Consequência: irritação recorrente, sem ação — até agora.

**4. Dispersão entre ferramentas (severidade: média; frequência: diária).** Tarefas espalhadas entre Todoist, lembretes, calendário e anotações. Consequência: a dúvida de fundo "esqueci algo?" e tempo perdido conferindo múltiplos lugares.

**5. Quebra de contexto ao agir sobre uma tarefa (severidade: baixa-média; frequência: diária).** Muitas tarefas de trabalho terminam em "mandar um e-mail". Hoje isso significa sair do gerenciador, abrir o Outlook e reconstruir o contexto. Consequência: pequenas fricções que somadas desestimulam o uso.

### Alternativas Atuais e Cenário Competitivo

**Todoist (concorrente direto, em uso hoje).** Faz bem: captura rápida, projetos, recorrência robusta, multiplataforma. Falha para Guilherme: gamificação rasa (karma), mensalidade, customização limitada. Trocar exige replicar o essencial funcional dele — daí a recorrência e os projetos serem P0 no Ascend.

**Habitica (concorrente direto em gamificação).** Faz bem: gamificação profunda de RPG — personagem, equipamento, batalhas, recompensas. Falha: justamente por isso é confuso e disperso; a camada de jogo compete com a gestão de tarefas em vez de servi-la. É o anti-exemplo central do Ascend — gamificação séria, mas com a gestão de tarefas limpa.

**TickTick / Microsoft To Do (concorrentes adjacentes).** Faz bem: organização sólida, e o To Do integra ao ecossistema Microsoft/Outlook. Falha: gamificação inexistente ou simbólica. Não resolvem a dor principal.

**Lembretes, calendário e anotações soltas (alternativa "improvisada").** Faz bem: captura instantânea, zero atrito. Falha: nenhuma noção de projeto, prioridade ou progresso; é onde as tarefas se perdem.

**Não fazer nada / confiar na memória (alternativa "do nothing").** O custo real: o desgaste de fundo e o acúmulo. É contra esse estado que o Ascend precisa ganhar todos os dias.

### Principais Suposições a Validar

1. **Supomos que a progressão de RPG vai sustentar o hábito do Guilherme onde o karma do Todoist falhou — porque ele é gamer e responde a esse loop.** Validar: usar o Ascend por 30 dias e medir se a sequência de dias ativos supera o recorde histórico com o Todoist.

2. **Supomos que uma curva de XP de 1 a 100 vai manter o engajamento — porque dá horizonte longo.** Risco real: a calibração. Curva fácil demais perde a graça em semanas; difícil demais frustra. Validar: jogar com os números após 2-4 semanas de uso e ajustar a constante da curva.

3. **Supomos que XP por tarefa concluída não vai distorcer o comportamento.** Risco: Guilherme criar tarefas triviais só para "farmar" XP, esvaziando o sentido. Validar: observar se a contagem de tarefas inflada aparece; se sim, ponderar XP por esforço/prioridade.

4. **Supomos que metas diárias/semanais/mensais vão motivar, e não pressionar.** Risco: uma sequência quebrada gerar culpa e abandono — o oposto do objetivo. Validar: observar a reação emocional a uma sequência perdida; o sistema talvez precise de "perdão" (ex.: tolerância de 1 dia).

5. **Supomos que a integração com Outlook será usada o suficiente para justificar o esforço de construí-la.** É a feature tecnicamente mais cara do MVP. Validar: estimar quantas tarefas por semana realmente viram e-mail; se for pouco, ela cai de prioridade.

6. **Supomos que um app web (sem versão mobile) é suficiente — porque o uso é principalmente no desktop.** Risco: querer capturar tarefas longe do computador. Validar: ao longo de algumas semanas, anotar quantas vezes uma tarefa surgiu fora do desktop e se perdeu.

7. **Supomos que Guilherme consegue construir e manter o Ascend com um agente de código, sem saber programar.** Risco: travar em bugs ou em deploy. Mitigação: roadmap em fases pequenas e verificáveis, e um stack (Convex) que minimiza código manual.

### Mapa da Jornada do Usuário

**Consciência.** Não há aquisição — Guilherme é o fundador e o usuário. A "consciência" é a decisão de construir o Ascend em vez de continuar no Todoist.

**Consideração.** Acontece agora, neste planejamento. O risco desta fase é o escopo crescer e o projeto nunca sair do papel. O roadmap em fases curtas existe para combater isso.

**Primeiro uso.** Guilherme abre o Ascend pela primeira vez com a conta criada. A tela de entrada está vazia. O primeiro passo é criar um projeto (ex.: "Performance") e cadastrar 3 ou 4 tarefas reais. Emoção: curiosidade e alguma checagem — "será que isso aguenta meu fluxo?". Atrito a vigiar: se criar tarefa for lento, a primeira impressão já é negativa.

**Momento mágico.** No fim do primeiro dia de uso real, Guilherme conclui a última tarefa. A barra de XP enche e estoura o "Level Up" — Lvl 1 para Lvl 2. Emoção: a fisgada. O loop de RPG que ele conhece, agora apontado para a vida real. É aqui que o Ascend ganha ou perde.

**Formação de hábito.** Semanas 1 a 4. Guilherme abre o app diariamente. As primeiras metas diárias são batidas, a primeira meta semanal entrega um bônus gordo de XP. A sequência de dias ativos vira algo a defender. Atrito a vigiar: a primeira sequência quebrada — se gerar culpa em vez de "ok, recomeço hoje", o sistema precisa de ajuste.

**Consolidação.** Mês 2 em diante. O Ascend substituiu o Todoist. O nível alcançado é prova material de consistência. O hábito não depende mais de novidade — depende da progressão acumulada, que Guilherme não quer interromper.

## 3. Estratégia de Produto

### Princípios de Produto

**Captura em três campos ou menos.** O fluxo mínimo para criar uma tarefa — escolher projeto, digitar título, salvar — não pode exigir mais do que isso. Prazo e recorrência são opcionais e ficam um passo atrás.

**A recompensa segue a ação imediatamente.** Concluir uma tarefa mostra o XP ganho na hora, sem delay e sem tela intermediária. O elo entre "fiz" e "ganhei" precisa ser instantâneo para o loop funcionar.

**O progresso é sempre visível, mas nunca no caminho.** Nível e barra de XP estão presentes em toda tela, mas nunca bloqueiam a tarefa de gerenciar tarefas. A camada de jogo é um HUD, não um menu.

**Nada de punição, só de aceleração.** O sistema nunca tira XP nem rebaixa nível. Metas batidas aceleram o progresso; metas perdidas apenas não aceleram. A motivação é frágil — o design a protege.

**Configuração de jogo num só lugar.** Todos os números da gamificação (XP por tarefa, bônus de metas, curva de níveis) vivem num único arquivo de constantes, para serem recalibrados com base no uso real sem caçar valores pelo código.

**O hoje é sagrado.** A tela de entrada destaca o que vence hoje acima de tudo. Tarefas futuras existem, mas não competem visualmente com o dia corrente.

### Diferenciação de Mercado

O Ascend vive numa lacuna específica entre dois tipos de produto. De um lado, gerenciadores de tarefas competentes e limpos — Todoist, TickTick, Microsoft To Do — cuja gamificação é simbólica ou inexistente; eles organizam, mas não motivam. Do outro, o Habitica, que leva a gamificação a sério, mas ao custo de transformar a gestão de tarefas num RPG completo e disperso, em que a camada de jogo compete com o trabalho de fato.

O Ascend ocupa o meio que ninguém ocupa bem: a gestão de tarefas limpa e direta de um Todoist, com uma progressão de RPG de verdade — níveis 1 a 100, XP escalonado, bônus por metas — como camada de motivação, não de distração. O diferencial não é "ter gamificação"; é a disciplina de manter o jogo a serviço do foco. Para Guilherme isso importa porque ele já testou os dois lados: o Todoist o deixa frio, o Habitica o dispersa. Ele quer o gancho do RPG sem perder a ferramenta.

Como o Ascend é de uso pessoal, "defensável" não significa barreira competitiva — significa que o produto é moldado ao fluxo exato de uma pessoa. Esse encaixe sob medida é algo que nenhum produto de mercado, otimizado para o usuário médio, consegue oferecer.

### Design do Momento Mágico

O momento mágico é o "Level Up" do fim do dia: Guilherme conclui a última tarefa, a barra de XP enche e estoura a subida de nível.

Para que esse instante aconteça de forma confiável, algumas coisas precisam ser verdade no produto:

- **Concluir tarefa precisa render XP visível na hora.** O ganho de XP é mostrado no ato da conclusão, com a barra animando.
- **A barra de XP precisa estar sempre à vista**, para que "encher" seja perceptível e antecipável ao longo do dia.
- **A subida de nível precisa de um momento próprio** — uma animação ou destaque que interrompa brevemente a tela e marque a conquista. Sem isso, é só um número mudando.
- **A curva de XP dos primeiros níveis precisa ser curta o suficiente** para que o primeiro "Level Up" caiba no primeiro dia de uso real.

O caminho mais curto até esse momento: criar conta → criar um projeto → cadastrar as tarefas do dia → concluí-las → ver o nível subir. Tudo isso é alcançável no MVP. O momento mágico, portanto, **não exige nada além do escopo do MVP** — o que confirma que o escopo está correto.

### Definição do MVP

O MVP precisa ser construível em aproximadamente 4 a 8 semanas de trabalho nas horas vagas, com um agente de código. Está dentro dele:

**Login de usuário único.** Acesso à conta para proteger os dados na nuvem. "Pronto" = Guilherme entra com e-mail/senha e vê só os dados dele.

**Projetos (CRUD).** Criar, renomear e arquivar/excluir projetos. "Pronto" = é possível organizar tarefas em projetos nomeados.

**Tarefas (CRUD).** Criar tarefa com projeto, título, descrição opcional, prazo opcional e recorrência opcional; editar; concluir; excluir. "Pronto" = o ciclo completo de uma tarefa funciona.

**Motor de recorrência.** Regras simples — diária, semanal por dia(s) da semana, mensal por data. Gera a ocorrência da tarefa na lista do dia certo. "Pronto" = uma tarefa "toda terça" aparece automaticamente nas terças.

**Tela de entrada (Hoje).** Lista de tarefas priorizada por data de entrega, com o que vence hoje em destaque e o que está vencido sinalizado. "Pronto" = abrir o app responde "o que eu faço hoje?".

**Sistema de gamificação.** XP por tarefa concluída; bônus de XP por meta diária, semanal e mensal; níveis de 1 a 100 com curva de XP escalonada; barra de XP e nível visíveis. "Pronto" = concluir tarefas faz o nível subir, e o "Level Up" acontece.

**Busca e filtros.** Busca por texto em título e descrição; filtro por projeto. "Pronto" = é possível reencontrar qualquer tarefa.

**Tela de perfil/progresso.** Nível atual, XP total, progresso para o próximo nível e estado das metas. "Pronto" = Guilherme vê sua progressão consolidada.

**Integração com Outlook (P1, construída por último).** A partir de uma tarefa, abrir um rascunho de e-mail no Outlook já com contexto preenchido. Fica em escopo, mas é a última feature do MVP — e a primeira a ser cortada se o tempo apertar, por ser a mais cara tecnicamente e não fazer parte do momento mágico.

### Explicitamente Fora de Escopo

**App mobile / nativo.** Tentador porque tarefas surgem longe do computador. Adiado porque o uso é majoritariamente no desktop e um segundo cliente multiplicaria o esforço. Reconsiderar após 2-3 meses de uso, se a captura fora do desktop se mostrar uma dor real.

**Multiusuário, contas separadas e compartilhamento.** Tentador como "e se amigos quiserem usar". Adiado porque muda a arquitetura inteira (isolamento de dados, permissões) por um ganho hipotético. Reconsiderar só se o Ascend provar valor por meses.

**Subtarefas e tarefas aninhadas.** Tentador para tarefas complexas. Adiado porque projeto + tarefa já cobre 95% dos casos e o aninhamento complica a UI e o motor de recorrência. Reconsiderar se uma dor concreta aparecer no uso.

**Notificações e lembretes (push, e-mail).** Tentador para "não esquecer". Adiado porque a tela de entrada já é o mecanismo de lembrete num app de desktop aberto durante o dia. Reconsiderar se o esquecimento persistir.

**Visão de calendário e sincronização de agenda.** Tentador para ver o mês. Adiado porque a lista priorizada por data resolve o essencial com muito menos esforço. Reconsiderar pós-MVP.

**Conquistas, avatares, equipamentos e recompensas cosméticas.** Tentador — é "mais RPG". Adiado porque é exatamente a complexidade que torna o Habitica disperso. O nível e o XP carregam a progressão sozinhos no MVP. Reconsiderar com muito critério.

**Tags/etiquetas além de projetos.** Adiado para manter o modelo de organização simples. Reconsiderar se a busca por projeto se mostrar insuficiente.

**Relatórios e dashboards de produtividade.** Adiado; a tela de progresso já dá o sinal essencial. Reconsiderar pós-MVP.

**Recalibração temática (modo escuro, temas).** Decisão de design, não de produto; não bloqueia o MVP.

### Prioridade de Funcionalidades (MoSCoW)

**Must Have (P0 — o produto não existe sem):** login de usuário único; CRUD de projetos; CRUD de tarefas com projeto/título/descrição/prazo; motor de recorrência; tela de entrada (Hoje) priorizada por data; XP por tarefa; sistema de níveis 1-100 com curva escalonada; bônus de meta diária, semanal e mensal; barra de XP e nível visíveis; busca e filtros.

**Should Have (P1 — o produto funciona sem, mas fica incompleto):** integração com Outlook para rascunho de e-mail; tela de perfil/progresso detalhada; estados visuais de tarefa vencida; animação dedicada de "Level Up".

**Could Have (P2 — só depois, se for trivial):** ordenação manual de tarefas; arquivo de tarefas concluídas com histórico; ajuste das constantes de gamificação por uma tela de configuração (em vez de arquivo).

**Won't Have (desta vez):** app mobile; multiusuário; subtarefas; notificações; visão de calendário; conquistas/avatares/cosméticos; tags; relatórios.

### Fluxos Principais do Usuário

**Fluxo 1 — Capturar uma tarefa.** Gatilho: surge algo a fazer. Passos: clicar em "nova tarefa" → escolher projeto → digitar título → (opcional) descrição, prazo, recorrência → salvar. Resultado: tarefa na lista, aparecendo no dia certo. Critério de sucesso: do clique ao salvar em menos de 10 segundos para o caso simples.

**Fluxo 2 — Trabalhar o dia.** Gatilho: Guilherme abre o app. Passos: a tela de entrada lista as tarefas priorizadas por data, com hoje em destaque → ele conclui tarefas uma a uma → cada conclusão rende XP visível → ao fechar a última do dia, o "Level Up" pode disparar. Resultado: lista do dia zerada, XP ganho, possível subida de nível. Critério de sucesso: o momento mágico acontece de forma confiável quando todas as tarefas do dia são concluídas.

**Fluxo 3 — Reencontrar uma tarefa.** Gatilho: Guilherme precisa de uma tarefa específica. Passos: digitar texto na busca ou filtrar por projeto → ver os resultados → abrir a tarefa. Resultado: a tarefa é encontrada. Critério de sucesso: qualquer tarefa existente é localizável por título, descrição ou projeto.

### Métricas de Sucesso

Como o Ascend é de uso pessoal, as métricas são pessoais — sinais de que o hábito pegou, não números de negócio. Alinhadas com a meta de 90 dias ("criar o hábito diário").

**Métrica primária — dias ativos consecutivos (sequência).** O número que mais importa. Bom: uma sequência de 14 dias. Ótimo: uma sequência de 30+ dias, superando o recorde histórico do Guilherme com o Todoist.

**Métricas secundárias:** nível alcançado em 90 dias (bom: ~15; ótimo: ~25+); taxa de metas diárias batidas (bom: 60% dos dias; ótimo: 80%+); número de tarefas concluídas por semana de forma estável.

**Indicadores antecedentes:** frequência de abertura do app por dia; tarefas capturadas por dia (sinal de que o Ascend virou o destino padrão); o Todoist deixou de ser aberto.

### Riscos

**1. Curva de XP mal calibrada (probabilidade: alta; impacto: alto).** É o risco número um. Uma curva ruim mata o loop. Mitigação: constantes isoladas num arquivo de config; recalibração planejada após 2-4 semanas de uso real.

**2. Escopo cresce e o projeto não é lançado (probabilidade: alta; impacto: alto).** Clássico de projeto pessoal. Mitigação: MoSCoW rígido; roadmap em fases curtas e demonstráveis; Outlook como último item, cortável.

**3. Gamificação distorce o comportamento (probabilidade: média; impacto: médio).** Criar tarefas-lixo para farmar XP. Mitigação: monitorar no uso; se aparecer, mudar XP de "por tarefa" para "por esforço/prioridade".

**4. Sequência quebrada gera culpa e abandono (probabilidade: média; impacto: alto).** O oposto do objetivo. Mitigação: design sem punição; considerar tolerância de 1 dia ("streak freeze") se o uso mostrar necessidade.

**5. Guilherme trava na construção (probabilidade: média; impacto: alto).** Sem experiência de código, um bug ou um problema de deploy pode parar tudo. Mitigação: stack que minimiza código (Convex); roadmap com tarefas pequenas e verificáveis; revisão de PR por fase.

**6. Integração com Outlook consome tempo demais (probabilidade: média; impacto: médio).** OAuth e API da Microsoft são a parte mais complexa. Mitigação: deixá-la por último; ter um caminho simples de fallback (link `mailto:` pré-preenchido) caso a integração completa via Microsoft Graph se mostre cara demais.

**7. Falta de versão mobile vira atrito real (probabilidade: média; impacto: médio).** Tarefas que surgem longe do desktop podem se perder. Mitigação: validar a dor antes de agir; um app web é acessível pelo navegador do celular como paliativo.

**8. O app fica pronto mas o hábito não pega (probabilidade: média; impacto: alto).** O risco de fundo: a gamificação pode simplesmente não ser suficiente. Mitigação: tratar os primeiros 30 dias como experimento explícito, com a métrica de sequência como termômetro honesto.

## 4. Estratégia de Marca

### Declaração de Posicionamento

Para o profissional que quer se organizar mas perde o ritmo, o Ascend é o gerenciador de tarefas que transforma a produtividade num RPG — cada tarefa concluída vira XP rumo ao próximo nível. Diferente do Todoist, cuja gamificação é simbólica, e do Habitica, que afoga a gestão de tarefas num jogo disperso, o Ascend mantém a lista limpa e direta, com a progressão de RPG como motor de motivação.

### Personalidade da Marca

O Ascend é um coach sereno e focado. Se fosse uma pessoa, seria aquele mentor que já passou pela jornada e não precisa gritar para te empurrar. Fala de forma calma e direta, sem hype e sem sermão. Comemora suas conquistas com leveza e bom humor — uma piada rápida, nunca uma celebração forçada. Não é durão nem sisudo; também não é o "treinador motivacional" que fala em maiúsculas. Ele confia que você é capaz e trata cada nível como um fato, não como um milagre. O que ele nunca faz: culpar você por um dia ruim, inflar conquistas pequenas com drama, ou usar a linguagem genérica de app de produtividade ("Parabéns! Você arrasou!").

### Guia de Voz e Tom

A **voz** é constante: calma, encorajadora, direta e levemente bem-humorada. O **tom** se ajusta ao contexto.

| Contexto | DO (faça) | DON'T (evite) |
|---|---|---|
| Onboarding | "Bora começar. Cria seu primeiro projeto — pode ser 'Trabalho' mesmo." | "Bem-vindo à sua jornada de produtividade transformadora!" |
| Conclusão de tarefa | "Mais uma que mordeu a poeira. +20 XP." | "PARABÉNS!!! Você é incrível!" |
| Estado vazio (lista do dia) | "Lista de hoje limpa. Ou você é uma máquina, ou esqueceu de cadastrar tarefas." | "Nenhuma tarefa encontrada." |
| Subida de nível | "Lvl 24 desbloqueado. O Guilherme de ontem não chegava aos seus pés." | "Level up! Continue assim, campeão!" |
| Erro | "Não consegui salvar isso agora. Tenta de novo num instante." | "Erro inesperado. Código 500." |
| Meta semanal batida | "Semana fechada com folga. +200 XP de bônus na conta." | "Uau! Que semana espetacular e produtiva!" |
| Sequência quebrada | "A sequência zerou. Sem drama — recomeça hoje." | "Você perdeu sua sequência de 12 dias. :(" |

### Framework de Mensagens

**Tagline:** "Suba de nível fechando tarefas."

**Headline (tela inicial / login):** "Sua produtividade, com a progressão de um RPG."

**Propostas de valor:** (1) Cada tarefa concluída é XP — o progresso é visível e acumula. (2) Metas diárias, semanais e mensais transformam consistência em recompensa. (3) Gestão de tarefas limpa, sem a bagunça de um jogo cheio de menus.

**Descrições de funcionalidade:** Projetos ("agrupe suas tarefas por frente de trabalho ou área da vida"); Recorrência ("tarefas que se repetem aparecem sozinhas no dia certo"); Tela Hoje ("abra o app e veja exatamente o que fazer hoje").

**Tratamento de objeções:** "Já uso o Todoist" → "O Ascend faz o básico que você já espera, e adiciona o que falta: um motivo para voltar todo dia." "Gamificação é infantil" → "O objetivo não é brincar — é usar o mesmo gancho que te prende num RPG para fechar tarefas reais."

### Pitches de Elevador

**5 segundos:** "Um gerenciador de tarefas que vira um RPG — cada tarefa fechada é XP."

**30 segundos:** "O Ascend é um gerenciador de tarefas de uso pessoal. Você organiza projetos, define prazos e recorrências, como em qualquer app do tipo. A diferença é a progressão: cada tarefa concluída rende XP, metas diárias e semanais dão bônus, e você sobe de nível, de 1 a 100. É o loop de motivação de um RPG apontado para a sua produtividade."

**2 minutos:** "O problema é conhecido: a gente começa organizado e perde o ritmo. As ferramentas de tarefa resolvem a parte funcional, mas não dão motivo para voltar todo dia. O Todoist tem uma gamificação rasa que ninguém liga; o Habitica leva a gamificação a sério, mas vira um RPG tão complexo que a gestão de tarefas se perde no meio. O Ascend fica no meio que ninguém ocupa bem: a lista limpa de um Todoist, com uma progressão de RPG de verdade — XP por tarefa, bônus por metas batidas, níveis de 1 a 100 com curva escalonada. Por que agora: é um projeto pessoal, construído com um agente de código, moldado ao fluxo exato de uma pessoa — algo que nenhum app de mercado, feito para o usuário médio, entrega. O pedido é simples: construir o MVP em poucas semanas e usá-lo por 90 dias, com a meta de criar, enfim, o hábito que nunca se sustentou."

### Narrativa de Diferenciação Competitiva

A maioria dos gerenciadores de tarefas trata produtividade como um problema de organização: dê às pessoas listas, prazos e projetos, e elas se viram. Isso ignora a parte difícil — não é organizar uma vez, é voltar todo dia. O Todoist resolve a organização com competência e tenta a motivação com "pontos de karma" que quase ninguém percebe. O Habitica acertou o diagnóstico — falta motivação — mas errou a dose: transformou o app inteiro num RPG, com personagem, equipamento e batalhas, ao ponto de a gestão de tarefas virar coadjuvante. O usuário que só queria fechar a lista do dia se vê gerenciando um jogo.

O Ascend parte de um princípio simples: a gamificação serve ao foco, nunca o contrário. Mantém a gestão de tarefas tão limpa quanto a de um Todoist e adiciona uma única camada de jogo bem calibrada — XP, metas, níveis — que existe só para fazer você voltar e fechar tarefas. Sem personagem para vestir, sem menu de jogo para administrar. É a aposta de que o loop de progressão de um RPG, isolado e bem feito, é suficiente — e que tudo além disso é distração disfarçada de feature.

## 5. Design Visual

Os tokens de design visual (cores, tipografia, espaçamento, componentes, movimento) **não** fazem parte deste documento. Eles vivem em `docs/design.md`, gerado separadamente por `/plaid design` a partir de referências de imagem.

Como `docs/design.md` ainda não existe, rode `/plaid design` com referências visuais (capturas de tela de apps que você gosta, paletas, exemplos de RPG/dashboards) antes de iniciar o trabalho de estilização no build. O PRD e o roadmap referenciam `docs/design.md` para os valores de implementação visual.
