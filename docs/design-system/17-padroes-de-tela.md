# Padrões de tela

Esta página junta os componentes em telas: a estrutura do app, a navegação e o desenho de cada tela principal. Cada tela responde **uma pergunta** ([Princípios](01-principios.md#2-uma-pergunta-por-tela)). Os desenhos em texto mostram a ordem e a hierarquia, não medidas exatas: as medidas estão nos componentes.

> Estes padrões são a referência da primeira versão. Ajustes que surgirem na construção e nos testes com pessoas voltam para esta página.

## Mapa do app

| Tela | Rota | Pergunta |
| --- | --- | --- |
| Entrada | `/entrar` | "Como eu entro?" |
| Criar conta | `/criar-conta` | "Como eu começo?" |
| Recuperar senha | `/recuperar-senha`, `/redefinir-senha` | "Esqueci a senha, e agora?" |
| Painel (Início) | `/` | "Quanto sobrou este mês?" |
| Adicionar lançamento | `/lancamentos/novo` (`?tipo=renda` para renda) | "Quanto foi e com o quê?" |
| Lançamentos | `/lancamentos` | "Onde eu gastei?" |
| Editar lançamento | `/lancamentos/[id]` | "Como corrijo isso?" |
| Resumo do mês | `/resumo/[aaaa-mm]` | "Como foi o mês?" |
| Planejamento | `/planejamento` | "Como vão ficar os próximos meses?" |
| Rendas e gastos fixos | `/planejamento/fixos` | "O que entra e sai todo mês?" |
| Adicionar ou editar fixo | `/planejamento/fixos/novo` (`?modelo=aluguel`, `?tipo=renda`), `/planejamento/fixos/[id]` | "O que se repete e quando?" |
| Monte seu mês | `/comecar` | "O que entra e sai todo mês?" (primeiro acesso) |
| Limites por categoria | `/planejamento/limites`, `/planejamento/limites/[categoria]` | "Quanto quero gastar com cada coisa?" |
| Calculadoras | `/calculadoras` | "Quanto vou receber?" |
| Férias, 13º, Rescisão, Salário líquido, Seguro-desemprego | `/calculadoras/ferias`, `/calculadoras/decimo-terceiro`, `/calculadoras/rescisao`, `/calculadoras/salario-liquido`, `/calculadoras/seguro-desemprego` | "Quanto vou receber de…?" |
| Seus dados | `/seus-dados` | "O que o Midas guarda e como eu apago?" |
| Conta apagada | `/conta-apagada` (pública) | "Minha conta foi mesmo apagada?" |
| Configurações | `/configuracoes` | "Como eu ajusto o app?" |
| Suas categorias | `/configuracoes/categorias`, `/configuracoes/categorias/nova` (`?tipo=renda`), `/configuracoes/categorias/[id]` | "Como deixo as categorias do meu jeito?" |
| Ajuda | `/ajuda` | "Como faço…?" |
| Sobre | `/sobre` | "O que é o Midas?" |
| Política de privacidade, Termos de uso | `/privacidade`, `/termos` | |

O mês exibido fica na URL (`?mes=2026-09`), para o botão Voltar do navegador e os links funcionarem como esperado. Em Início e Lançamentos, a troca de mês vai do primeiro mês com dados até o **mês atual**: lançamento não tem data futura, e os meses seguintes são assunto do Planejamento.

**Nada de dado financeiro na URL.** A URL leva só mês, ano, passo e ids aleatórios. Valor, salário, respostas de calculadora e termos de busca ficam na tela, nunca no endereço (ele vai para o histórico e para os logs).

## Estrutura do app

### Celular

```
┌──────────────────────────────┐
│ Midas     ‹ Setembro 2026 ›  (MA) │  AppHeader (não é fixo)
│                              │
│  …conteúdo da tela…          │  <main>
│                              │
├──────────────────────────────┤
│  ⌂        ☰        ▥        ⊞  │  Navegação inferior (fixa)
│ Início Lançamentos Planejamento Calculadoras │
└──────────────────────────────┘
```

- **Navegação inferior** fixa, com quatro destinos, **sempre com ícone e texto**: Início (`house`), Lançamentos (`list`), Planejamento (`chart-column`), Calculadoras (`calculator`).
- Altura de 64px mais a área segura do aparelho; fundo `superficie`, linha `veio` em cima; ícones de 24px; texto em `caption` 600.
- Item atual: texto e ícone em `tinta`, uma barra de 3px em `ouro` em cima do item e `aria-current="page"`. Os outros em `tinta-suave`.
- A navegação some nas telas de tarefa (adicionar, editar, passos das calculadoras), que têm um "Voltar" no topo. Assim a pessoa não sai no meio de uma tarefa sem querer.
- A página ganha `scroll-padding-bottom` igual à altura da navegação, para o foco nunca ficar escondido.

### Computador (a partir de 1024px)

- A navegação passa para o topo, dentro do `AppHeader`, como links de texto entre o logo e a troca de mês.
- O painel usa duas colunas (veja [Espaço e forma](06-espaco-e-forma.md#larguras)); formulários ficam numa coluna de até 480px, centralizada.

### Telas de tarefa

Adicionar, editar, "Monte seu mês", fixos, limites, categorias e os passos das calculadoras são páginas próprias (com rota), não janelas por cima:

- No topo, o link **"Voltar"** (`chevron-left` + texto) e o título da tarefa.
- O botão Voltar do navegador e do celular fazem o mesmo que o "Voltar" da tela.
- Se a pessoa já digitou algo e toca em "Voltar", o Midas pergunta na própria tela: "Sair sem salvar? O que você digitou vai se perder." com "Sair sem salvar" e "Continuar editando".

### Depois de salvar

**Terminar uma tarefa leva ao Início**, com o aviso por cima ("Anotado: …"). Isso vale para lançamento (novo, editado ou excluído), fixo, limite, "Monte seu mês", "Adicionar ao planejamento" das calculadoras e "Recebi" de uma renda prevista. A pessoa vê na hora o efeito no saldo e no gráfico, sem procurar onde está. Um lançamento de um mês passado abre o Início naquele mês (`/?mes=2026-08`). "Voltar" sem salvar continua levando à tela de origem. Ações que só arrumam uma lista ("Não recebi", apagar uma conta de calculadora) ficam na mesma tela.

## Painel (Início)

**Pergunta:** "Quanto sobrou este mês?"

```
Midas        ‹ Setembro 2026 ›          (MA)
QUARTA, 30 DE SETEMBRO
Bom dia, Miguel. Setembro vai bem.        ← h1, acento em "bem"
∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿         ← veio de ouro
Sobraram R$ 1.842,10 até agora, R$ 310 a mais que em agosto.

[aviso, se houver: um só]

┌ SOBROU EM SETEMBRO ─────────────────┐   ← BalanceCard (mármore)
│ R$ 1.842,10                         │
│ ↙ Entrou          ↗ Saiu            │
│ + R$ 6.200,00     − R$ 4.357,90     │
│ ████████████████░░░░░               │
│ Você usou 70% do que entrou este mês.│
└─────────────────────────────────────┘
[ + Adicionar gasto ]                      ← primário grande
[ Adicionar renda ]                        ← secundário

┌ ÚLTIMOS LANÇAMENTOS ───── Ver todos ┐
│ 🛒 Mercado do bairro   − R$ 127,90  │
│ 💼 Salário             + R$ 5.400,00│
│ …5 linhas                           │
└─────────────────────────────────────┘
┌ RENDA X GASTOS ─────────────────────┐
│ Dezembro deve fechar com R$ 6.300…  │
│ ▮▮ ▮▮ ▮▮ ┆ ▯▯ ▯▯ ▯▯                  │
└─────────────────────────────────────┘
```

(Os símbolos acima só indicam os ícones Lucide; a interface não usa emoji.)

Ordem dos blocos:

1. [AppHeader](componentes/app-header.md) com a saudação e a frase-resumo.
2. **Um** [Notice](componentes/notice.md), se houver algo a avisar (limite perto do fim, projeção negativa, falta de conexão). Prioridade: conexão > limite > projeção.
3. [Achievement](componentes/achievement.md), só nos primeiros dias do mês seguinte a um mês com sobra. Nesses dias, a conquista fica com o mármore, e o cartão de saldo fica liso.
4. [BalanceCard](componentes/balance-card.md).
5. Botão primário grande **"Adicionar gasto"** e, abaixo, o secundário **"Adicionar renda"**. No celular, os dois ocupam a largura toda.
6. Últimos lançamentos: até 5 [TransactionRow](componentes/transaction-row.md) e o link "Ver todos".
7. [IncomeExpenseChart](componentes/income-expense-chart.md) do mês atual (o real até hoje mais o que ainda deve entrar e sair) e dos cinco meses seguintes, projetados.

Estados:

| Estado | O que muda |
| --- | --- |
| Primeiro acesso (nenhum lançamento) | Tudo abaixo da saudação vira um [EmptyState](componentes/empty-state.md): "Tudo pronto para *começar*." / "Comece anotando quanto você recebe por mês. Assim o Midas mostra quanto sobra." / "Adicionar minha renda" (primário) e "Anotar um gasto" (secundário). |
| Mês novo, sem lançamentos | O cartão de saldo mostra R$ 0,00; a lista vira o estado vazio "Outubro começa *aqui*."; o gráfico continua, a partir do mês atual. |
| Carregando | Blocos em `superficie-funda` no formato do cartão de saldo e de três linhas; `aria-busy="true"`. |
| Sem conexão | Aviso de alerta no topo com "Tentar de novo"; os dados já carregados continuam visíveis. |

## Adicionar lançamento

**Pergunta:** "Quanto foi e com o quê?" É a tela mais usada do app: tem que funcionar em segundos, com uma mão.

```
‹ Voltar                    Adicionar gasto
( − Gasto | + Renda )                         ← SegmentedToggle
Quanto foi?
┌──────────────────────────────┐
│ − R$  127,90                 │              ← MoneyInput (foco ao abrir)
└──────────────────────────────┘
Use vírgula para os centavos.
Atalhos
(Café) (Almoço) (Ônibus e metrô) (Farmácia) (Gasolina) (Mais ⌄)   ← Shortcuts
Categoria
(🛒 Mercado) (🍴 Restaurante) (🚗 Transporte)
(⌂ Moradia) (🧾 Contas) (♡ Saúde) (Mais ⌄)    ← CategoryChips
Descrição (opcional)
┌──────────────────────────────┐
│ Mercado do bairro            │
└──────────────────────────────┘
Quando?
(Hoje) (Ontem) (Outro dia)
[ ] Repete todo mês
[        Salvar gasto        ]                ← primário grande + toque de ouro
```

1. **Tipo** ([SegmentedToggle](componentes/segmented-toggle.md)): Gasto já marcado. Trocar para Renda muda o título ("Adicionar renda"), o rótulo do valor ("Quanto entrou?"), as categorias e o botão ("Salvar renda").
2. **Valor** ([MoneyInput](componentes/money-input.md)): recebe o foco ao abrir, com teclado numérico. É o único campo obrigatório.
3. **Atalhos** ([Shortcuts](componentes/shortcuts.md)): gastos comuns prontos, logo abaixo do valor. Um toque preenche categoria e descrição de uma vez; o valor continua com a pessoa. Opcional.
4. **Categoria** ([CategoryChip](componentes/category-chip.md)): seis mais usadas e "Mais". Opcional: sem escolha, vai para "Outros".
5. **Descrição** (opcional): campo de texto, até 60 caracteres.
6. **Quando?**: três opções em chips de escolha única, com "Hoje" marcado. "Outro dia" mostra um campo de data nativo (`<input type="date">`) que vai de 10 anos atrás **até hoje**: data futura não existe em lançamento. Para anotar algo que ainda vai acontecer, a pessoa usa um fixo ("só uma vez") no Planejamento. Quem chega de um mês passado ("Adicionar lançamento em agosto") já encontra "Outro dia" marcado com o último dia daquele mês.
7. **Repete todo mês** (caixa de seleção, desmarcada): ao salvar, cria também um fixo com o mesmo valor, categoria, descrição e dia, a partir do mês seguinte, e liga este lançamento a ele. O aviso diz: "Anotado: Aluguel, − R$ 1.650,00. Ele se repete todo dia 10."
8. **Salvar gasto**: primário grande, com o [toque de ouro](componentes/golden-touch.md). Depois de salvar, o app volta ao Início ([depois de salvar](#depois-de-salvar)), com a linha nova brilhando uma vez e o aviso "Anotado: Mercado do bairro, − R$ 127,90".

Regras:

- Nada é perguntado duas vezes, e nada além do valor é obrigatório.
- `Enter` no campo de valor leva à categoria; o formulário só é enviado pelo botão.
- Erros aparecem junto do campo, ao tocar em salvar (não enquanto a pessoa digita), e o foco vai para o primeiro campo com erro.

## Lançamentos

**Pergunta:** "Onde eu gastei?"

- Título "Lançamentos" e o mês no topo (troca de mês do `AppHeader`).
- Linha de totais do mês: "Entrou + R$ 6.200,00 · Saiu − R$ 4.357,90".
- Filtros em chips de escolha única: **Todos**, **Gastos**, **Rendas**. Busca por descrição (ícone `search`), com o texto "Buscar lançamento". A busca filtra na própria tela, sobre o mês aberto; o termo não vai para a URL nem para o servidor.
- Rendas previstas das calculadoras **não** aparecem aqui; elas ficam no Planejamento até "Recebi".
- Lançamentos que vieram de um fixo mostram "Fixo" na meta ("Moradia · Fixo").
- Lista agrupada por dia, com cabeçalho de dia ("Hoje", "Ontem", "Sábado, 26 de setembro") e o total do dia à direita. Dentro de um dia, a linha mostra só a categoria na meta, porque a data já está no cabeçalho.
- Botão primário "Adicionar gasto" no topo da lista.
- Busca ou filtro sem resultado: frase simples e saída, sem ilustração: "Nenhum lançamento com “farmácia” em setembro." + "Limpar busca".
- Listas longas carregam por mês (um mês por vez), sem rolagem infinita: no fim da lista, "Ver agosto".

## Editar lançamento

- Mesmo formulário do lançamento novo, preenchido. Título "Editar gasto" ou "Editar renda".
- Botão primário "Salvar alterações". Sem toque de ouro: a confirmação é só o aviso "Alterado: Mercado do bairro, − R$ 132,90".
- Se o lançamento veio de um fixo, uma nota diz "Veio do fixo “Aluguel”. Mudar aqui vale só para este mês." com o link "Ver o fixo".
- No fim da tela, "Excluir lançamento" ([Button](componentes/button.md) de perigo). Ao tocar, a confirmação aparece no mesmo lugar: "Excluir “Mercado do bairro”, − R$ 127,90? Não dá para desfazer." com "Excluir lançamento" e "Manter lançamento".

## Resumo do mês

**Pergunta:** "Como foi o mês?" (`/resumo/2026-09`)

1. Título display: "Setembro de 2026".
2. Se o mês fechou com sobra: a [conquista](componentes/achievement.md). Se não, o resumo em fatos: "Setembro fechou com R$ 210 a menos. Quer ver onde dá para ajustar?"
3. Entrou, saiu e sobrou (ou faltou), no formato do cartão de saldo, sem mármore.
4. Gastos por categoria: barras horizontais da maior para a menor, com valor e porcentagem ([Gráficos e dados](13-graficos-e-dados.md#barras-por-categoria)). Título-conclusão: "Mercado levou a maior parte de setembro: R$ 1.230."
5. Comparação com o mês anterior, em frases: "Você gastou R$ 180 a menos com restaurante do que em agosto."
6. Os cinco maiores gastos do mês.

Abrir o resumo de um mês fechado marca a conquista daquele mês como vista (em todos os aparelhos).

## Planejamento

**Pergunta:** "Como vão ficar os próximos meses?"

1. Título-conclusão dos próximos 12 meses: "Nos próximos 12 meses, devem sobrar R$ 14.200." (ou, sem acento, "Novembro pode fechar no vermelho."). Sem histórico e sem renda fixa, a projeção ainda não conhece a renda, e o título pede: "Anote sua renda para ver quanto deve sobrar."
2. Gráfico do mês atual até 11 meses à frente: o mês atual com o real até hoje e o que ainda falta, os seguintes projetados, com o 13º e as férias previstas aparecendo nos meses em que caem.
3. Tabela "Mês a mês" com Entrou, Saiu e Sobrou para cada mês, marcando "(projeção)".
4. **Rendas previstas** (das calculadoras, [ExpectedIncomeRow](componentes/expected-income-row.md)): "13º salário, 1ª parcela · até 30 nov · + R$ 2.700" com a etiqueta "prevista", "Recebi" e "Não recebi".
5. **Fixos:** rendas e gastos que se repetem ("Salário, todo dia 5, + R$ 5.400,00"; "Aluguel, todo dia 10, − R$ 1.650,00"; "Geladeira, 3 de 10, − R$ 250,00"), com "Adicionar renda fixa" e "Adicionar gasto fixo" e o link "Ver todos os fixos". Fixos entram sozinhos na lista no dia marcado, e a pessoa pode ajustar o valor daquele mês editando o lançamento.
6. **Limites por categoria:** barras de limite ([Categorias](15-categorias.md#limites-por-categoria)) e "Definir um limite".
7. A nota da projeção: "Estimativa com base nos últimos 3 meses, nos fixos e nas rendas já previstas." ([Gráficos e dados](13-graficos-e-dados.md#projeção-como-é-calculada-e-como-é-explicada)).

O gráfico sempre começa no mês atual: o planejamento olha para a frente. Os meses que já passaram ficam no Início (troca de mês) e no resumo de cada mês.

### Rendas e gastos fixos

**Pergunta:** "O que entra e sai todo mês?" (`/planejamento/fixos`)

- Duas seções, "Rendas fixas" e "Gastos fixos", cada uma com a soma do mês ("Todo mês: − R$ 3.100,00") e a lista de fixos: ícone da categoria, nome, "todo dia 10" ou "3 de 10 parcelas" ou "só em 15 de dezembro", e o valor.
- "Adicionar gasto fixo" (primário) e "Adicionar renda fixa" (secundário).
- Estado vazio: "Nenhum fixo *ainda*." / "Aluguel, contas e salário entram sozinhos no dia marcado." / "Adicionar gasto fixo".

**Adicionar fixo** (`/planejamento/fixos/novo`, tela de tarefa):

```
‹ Voltar                   Adicionar gasto fixo
Comece por um modelo
(Aluguel) (Condomínio) (Luz) (Água) (Internet) (Celular) (Mais ⌄)   ← fixos prontos
Quanto é?            [ − R$  1.650,00 ]
Categoria            (chips, como no lançamento)
Nome (opcional)      [ Aluguel ]
Que dia?             [ 10 ⌄ ]                  ← select nativo, 1 a 31
Repete               (Todo mês) (Por alguns meses) (Só uma vez)
Quantos meses?       [ 10 ]                    ← só em "Por alguns meses"
A primeira vez entra em 10 de outubro.
[      Salvar gasto fixo      ]
```

- **Fixos prontos** ([15-categorias](15-categorias.md), `src/lib/presets.ts`): um toque preenche categoria, nome e um dia sugerido; o valor fica com a pessoa. Com `?modelo=aluguel`, a tela já abre preenchida.
- **Que dia?**: dias 29, 30 e 31 caem no último dia dos meses mais curtos, e a tela avisa: "Em meses com menos dias, entra no último dia."
- **Repete**: "Todo mês" (sem fim); "Por alguns meses" (parcelas: de 2 a 120 meses; "Quantos meses?"); "Só uma vez" (um gasto ou renda futura: pede o mês).
- **Primeira vez**: a frase "A primeira vez entra em 10 de outubro." sempre diz a data. Se o dia deste mês já passou, a tela pergunta: "Já anotou o de setembro?" com "Já anotei" (começa no mês que vem) e "Anotar agora" (cria o de setembro também). Criar um fixo nunca preenche meses passados.
- Salvar confirma no aviso: "Aluguel entra todo dia 10." Sem toque de ouro.

**Editar fixo** (`/planejamento/fixos/[id]`): o mesmo formulário. Mudanças valem **dali para a frente**; lançamentos já anotados não mudam. "Parar este fixo" (perigo, com confirmação na tela: "Parar “Aluguel”? O que já foi anotado continua na lista.").

### Monte seu mês

**Pergunta:** "O que entra e sai todo mês?" (`/comecar`, tela de tarefa com passos, destino de "Adicionar minha renda" no primeiro acesso)

1. **Quanto você recebe por mês?** MoneyInput + "Que dia cai?" + a opção "Minha renda muda todo mês" (pula para o passo 2 sem criar renda fixa). Link "Não sabe o líquido? Calcule pelo salário bruto" para a calculadora de salário líquido.
2. **Quais destes gastos você tem todo mês?** Caixas de seleção grandes com os fixos prontos (Aluguel, Condomínio, Luz, Água, Gás, Internet, Celular, Plano de saúde, Escola ou faculdade, Academia, Streaming, Transporte, Parcela de compra). "Nenhum destes" é válido.
3. **Quanto é e que dia vence?** Uma linha por gasto escolhido: nome, valor e dia.
4. **Algum já aconteceu este mês?** Para os que já passaram do dia: marcar os que já foram pagos, para o Midas anotar agora.
5. **Confira** com "Alterar" em cada item e "Salvar meu mês".

Ao salvar, volta ao Início com o aviso "Seu mês está montado." Cada passo tem "Pular".

### Limites por categoria

**Pergunta:** "Quanto quero gastar com cada coisa?" (`/planejamento/limites`)

- Lista das categorias com limite, com a barra ([Bar](componentes/bar.md)) e a frase ("R$ 360 de R$ 400 em setembro"), da mais perto do limite para a mais longe; embaixo, "Definir um limite".
- `/planejamento/limites/[categoria]`: "Quanto você quer gastar com Restaurante por mês?" (MoneyInput), "Salvar limite" e, se já existe, "Remover limite" (perigo, confirmação na tela). "Definir um limite" abre antes a escolha da categoria de gasto (chips).
- Estado vazio: "Nenhum limite *ainda*." / "Escolha uma categoria e o Midas avisa quando o gasto chegar a 90%." / "Definir um limite".

## Calculadoras

**Pergunta:** "Quanto vou receber?" É o diferencial do Midas: transformar férias, 13º, rescisão, salário líquido e seguro-desemprego em números que entram no planejamento do ano.

### Tela inicial

Cinco cartões, um por calculadora, cada um com título, uma frase que explica o termo e o botão "Calcular":

| Calculadora | Frase do cartão |
| --- | --- |
| Férias | "Veja quanto você recebe nas férias, com o terço a mais." |
| 13º salário | "Veja o valor das duas parcelas e quando cada uma cai." |
| Rescisão | "Veja uma estimativa do que você recebe quando o contrato termina." |
| Salário líquido | "Veja quanto do salário bruto cai na sua conta, depois do INSS e do Imposto de Renda." |
| Seguro-desemprego | "Veja quantas parcelas e de quanto, se você foi dispensado ou dispensada sem justa causa." |

Abaixo, "Suas últimas contas": só as contas que a pessoa **adicionou ao planejamento**, com o tipo, o valor principal, a data e "Apagar esta conta". A calculadora roda no aparelho; uma conta que não foi adicionada ao planejamento não é guardada.

### Passo a passo

Uma pergunta por tela, na ordem em que a pessoa pensa, com o progresso visível:

```
‹ Voltar                       Férias
Passo 2 de 4
━━━━━━━━━━░░░░░░░░░
Qual é o seu salário bruto?                ← title
┌──────────────────────────────┐
│ R$  3.200,00                 │           ← MoneyInput
└──────────────────────────────┘
É o valor antes dos descontos, como aparece no contracheque.
[          Continuar          ]
```

- Barra de progresso em `ouro` com o texto "Passo 2 de 4" (a barra é decorativa; o texto é a informação).
- Botões "Continuar" (primário) e "Voltar" (no topo). A pessoa pode voltar a qualquer passo sem perder as respostas.
- Cada termo técnico vem explicado na própria tela ([Conteúdo e tom](11-conteudo-e-tom.md#calculadoras)).
- Perguntas de escolha usam rádios grandes (48px), com uma frase de ajuda em cada opção. Exemplo, na rescisão: "Como foi a saída?" com "Pedi demissão", "Fui demitido ou demitida sem justa causa", "Fui demitido ou demitida por justa causa", "Acordo com a empresa", "Fim do contrato de experiência".
- Antes do resultado, uma tela "Confira suas respostas", com um link "Alterar" em cada item.

Perguntas sugeridas:

| Calculadora | Passos |
| --- | --- |
| Férias | Salário bruto · Média de horas extras e adicionais (opcional) · Quantos dias de férias e se vai vender 10 dias · Quando começam |
| 13º salário | Salário bruto · Desde quando trabalha na empresa (para os meses do ano) · Média de horas extras e adicionais (opcional) · Número de dependentes (para o Imposto de Renda) |
| Rescisão | Salário bruto · Data de entrada e último dia de trabalho · Como foi a saída · Aviso prévio (trabalhado, pago em dinheiro ou dispensado; não aparece em justa causa e fim de contrato) · Férias vencidas (nenhuma, 1 período ou 2) · FGTS: saldo para fins rescisórios (opcional) e adesão ao saque-aniversário · Número de dependentes |
| Salário líquido | Salário bruto · Número de dependentes · Outros descontos do contracheque (opcional: vale-transporte, plano de saúde) · Que dia o salário cai (só para "Adicionar ao planejamento") |
| Seguro-desemprego | Como foi a saída (só dispensa sem justa causa tem direito; as outras respostas explicam e encerram) · Último dia de trabalho · Salários dos 3 últimos meses (com "Foi o mesmo nos três") · Meses com carteira assinada nos últimos 3 anos · Quantas vezes já pediu o seguro e se faz mais de 16 meses desde o último |

As férias e o 13º também perguntam o **número de dependentes** (para o Imposto de Renda). As respostas ficam só na memória da tela; a URL leva apenas o passo (`?passo=3`). Da rescisão sem justa causa, o resultado oferece "Ver o seguro-desemprego", que abre a calculadora com as respostas que já servem.

### Resultado

```
Suas férias, em números.                    ← display-lg com acento
VOCÊ DEVE RECEBER CERCA DE
R$ 3.874,00                                 ← display-xl
até 13 de dezembro
┌ De onde vem esse valor ──────────────┐
│ Férias (30 dias)        + R$ 3.200,00 │
│ Um terço a mais         + R$ 1.066,67 │
│ INSS                    − R$ 392,67   │
│ Imposto de Renda        −   R$ 0,00   │
│ Você recebe             R$ 3.874,00   │
└──────────────────────────────────────┘
[i] É uma estimativa. Confira os valores com o RH ou o sindicato.
    Tabelas de INSS e IR de 2026.
[ Adicionar ao planejamento ]              ← primário
[ Refazer as contas ]                      ← secundário
```

- O valor principal usa `display-xl` e sempre vem com "cerca de" e a data prevista.
- A tabela "De onde vem esse valor" mostra cada parcela com sinal, em `amount`, e o total.
- O aviso de estimativa ([Notice](componentes/notice.md)) é obrigatório, com o ano das tabelas usadas.
- "Adicionar ao planejamento" cria as rendas previstas (13º em duas parcelas; férias na data; rescisão na data de pagamento e, separado, o saque do FGTS; seguro-desemprego em uma prevista por parcela) e confirma: "Férias adicionadas ao planejamento de dezembro." No salário líquido, cria ou atualiza o fixo "Salário": "Seu salário entra todo dia 5."
- O servidor refaz a conta a partir das respostas; o resultado mostrado nunca é aceito como veio do aparelho.
- Sem toque de ouro aqui: ele é só para lançamentos.

Resultados de cada calculadora:

| Calculadora | Título | Valor principal | "De onde vem esse valor" |
| --- | --- | --- | --- |
| Férias | "Suas férias, *em números*." | "Você deve receber cerca de R$ 3.874,00 até 13 de dezembro" | Férias (N dias), Um terço a mais, Venda de 10 dias e o terço dela (se houver), INSS, Imposto de Renda, Você recebe. Nota: "O salário do mês das férias vem menor, porque parte dele foi paga adiantada." |
| 13º salário | "Seu 13º, *parte por parte*." | "Você deve receber cerca de R$ 5.400,00 em duas parcelas" | 1ª parcela (até 30 de novembro, sem descontos); 13º integral (N meses de 12), INSS do 13º, Imposto de Renda do 13º, 1ª parcela já paga, 2ª parcela (até 20 de dezembro) |
| Rescisão | "Sua rescisão, *explicada*." | Dois blocos: "A empresa paga cerca de R$ X até 10 de outubro" e "FGTS para sacar na Caixa: cerca de R$ Y" | Empresa: Saldo de salário (N dias), Aviso prévio (N dias, trabalhado ou pago), 13º proporcional (N/12), Férias vencidas + 1/3, Férias proporcionais (N/12) + 1/3, Desconto do aviso não cumprido, INSS, Imposto de Renda. FGTS: saldo informado ou estimado, depósito da rescisão, multa de 40% ou 20%, quanto pode sacar |
| Salário líquido | "Seu salário, *no bolso*." | "Cai na sua conta cerca de R$ 4.498,49 por mês" | Salário bruto, INSS, Imposto de Renda (com a redução de 2026, quando houver), Outros descontos, Você recebe |
| Seguro-desemprego | "Seu seguro, *mês a mês*." | "Cerca de 4 parcelas de R$ 2.080,00" | Média dos salários, Faixa da tabela, Valor da parcela, Número de parcelas e datas estimadas (a 1ª cerca de 37 dias depois da saída; depois, a cada 30) |

Situações sem direito ou fora do escopo mostram um [Notice](componentes/notice.md) de informação e nenhum número inventado: "Na justa causa, não há 13º nem férias proporcionais." / "Só quem é dispensado sem justa causa tem direito ao seguro-desemprego." / "Saída antes do fim do contrato de experiência ainda não é calculada pelo Midas."

## Seus dados

A tela dos direitos da pessoa, descrita em [Privacidade na interface](16-privacidade-na-interface.md#seus-dados): o que o Midas guarda, corrigir, baixar, com quem compartilha, aparelhos conectados, apagar a conta e quem cuida dos dados. O aviso "Seus dados são só seus." fica no topo.

## Configurações

| Seção | Itens |
| --- | --- |
| Aparência | Tema: "Claro", "Escuro", "Automático" (rádios, com Claro marcado de início). "Ocultar valores" (liga e desliga o modo discreto). |
| Conta | "Como você quer que o Midas te chame?", e-mail, "Trocar senha". |
| Lançamentos | "Suas categorias": link para `/configuracoes/categorias` (criar categorias, trocar nome e ícone, esconder do formulário; veja [Categorias](15-categorias.md#personalização)). |
| Sobre | Versão, "Sobre o Midas", "Ajuda". |

Cada mudança vale na hora e confirma com um aviso curto ("Tema escuro ativado."); não há botão "Salvar configurações".

## Conta apagada

Tela pública (`/conta-apagada`), depois de apagar a conta: o selo pequeno, "Sua conta foi apagada." em `display-lg`, "Obrigado por ter usado o Midas." e um parágrafo curto: "Cópias de segurança são apagadas em até 7 dias. Enviamos uma confirmação para o seu e-mail." Link "Voltar para o início" (que leva à entrada). Não depende de sessão e não mostra dado nenhum da conta.

## Sobre

- O [selo](componentes/seal.md) (160 a 200px), o nome e a promessa "Suas finanças, seu controle."
- Uma frase sobre o projeto: "O Midas é um app de finanças pessoais de código aberto. Qualquer pessoa pode conferir o que ele faz."
- Link para o código-fonte (`external-link`), licença, versão.
- Créditos: fontes (Marcellus, Cormorant Garamond, Atkinson Hyperlegible Next e Mono, todas SIL Open Font License) e ícones (Lucide, ISC).

## Padrões que se repetem

| Situação | Padrão |
| --- | --- |
| Carregando | Blocos estáticos em `superficie-funda` no formato do conteúdo; `aria-busy="true"`; nada de girador no meio da tela. |
| Sem conexão | [Notice](componentes/notice.md) de alerta no topo, com "Tentar de novo". O que a pessoa digitou fica na tela. |
| Erro do servidor | Mesmo padrão, com "Não deu para salvar agora. Tente de novo em alguns instantes." Nunca mostre códigos de erro. |
| Página não encontrada | Título "Não achamos esta página.", frase "O endereço pode ter mudado." e o botão "Ir para o início". |
| Sessão expirada | Leva para a entrada com "Por segurança, sua sessão terminou. Entre de novo para continuar." e volta para onde a pessoa estava. |
| Confirmação destrutiva | Na própria tela, dizendo o que será apagado, com botões que dizem o que fazem. |
| Confirmação de senha | Diálogo simples: "Por segurança, digite sua senha para continuar." |
| Aviso depois de uma ação | Uma região `role="status"` fixa na página, perto da navegação inferior, com o texto trocado a cada ação. |

## Checklist de uma tela nova

- [ ] A tela responde uma pergunta, e o `h1` diz qual.
- [ ] Existe no máximo uma ação primária.
- [ ] Estados vazio, carregando, erro e sem conexão estão desenhados.
- [ ] No máximo um aviso, um mármore, um veio de ouro e um acento por título.
- [ ] Rota em português, título da aba "Tela · Midas", mês na URL quando a tela depende do mês.
- [ ] Funciona com teclado, leitor de tela, zoom de 200% e a 320px.
- [ ] Segue o [checklist de revisão](01-principios.md#checklist-de-revisão-de-uma-tela) dos princípios.
