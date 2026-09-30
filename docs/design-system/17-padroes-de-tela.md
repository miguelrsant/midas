# Padrões de tela

Esta página junta os componentes em telas: a estrutura do app, a navegação e o desenho de cada tela principal. Cada tela responde **uma pergunta** ([Princípios](01-principios.md#2-uma-pergunta-por-tela)). Os desenhos em texto mostram a ordem e a hierarquia, não medidas exatas: as medidas estão nos componentes.

> O app ainda não foi construído. Estes padrões são a referência para a primeira versão; ajustes que surgirem na construção e nos testes com pessoas voltam para esta página.

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
| Limites por categoria | `/planejamento/limites` | "Quanto quero gastar com cada coisa?" |
| Calculadoras | `/calculadoras` | "Quanto vou receber?" |
| Férias, 13º, Rescisão | `/calculadoras/ferias`, `/calculadoras/decimo-terceiro`, `/calculadoras/rescisao` | "Quanto vou receber de…?" |
| Seus dados | `/seus-dados` | "O que o Midas guarda e como eu apago?" |
| Configurações | `/configuracoes` | "Como eu ajusto o app?" |
| Ajuda | `/ajuda` | "Como faço…?" |
| Sobre | `/sobre` | "O que é o Midas?" |
| Política de privacidade, Termos de uso | `/privacidade`, `/termos` | |

O mês exibido fica na URL (`?mes=2026-09`), para o botão Voltar do navegador e os links funcionarem como esperado.

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

Adicionar, editar e os passos das calculadoras são páginas próprias (com rota), não janelas por cima:

- No topo, o link **"Voltar"** (`chevron-left` + texto) e o título da tarefa.
- O botão Voltar do navegador e do celular fazem o mesmo que o "Voltar" da tela.
- Se a pessoa já digitou algo e toca em "Voltar", o Midas pergunta na própria tela: "Sair sem salvar? O que você digitou vai se perder." com "Sair sem salvar" e "Continuar editando".

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
7. [IncomeExpenseChart](componentes/income-expense-chart.md) com três meses reais e três projetados.

Estados:

| Estado | O que muda |
| --- | --- |
| Primeiro acesso (nenhum lançamento) | Tudo abaixo da saudação vira um [EmptyState](componentes/empty-state.md): "Tudo pronto para *começar*." / "Comece anotando quanto você recebe por mês. Assim o Midas mostra quanto sobra." / "Adicionar minha renda" (primário) e "Anotar um gasto" (secundário). |
| Mês novo, sem lançamentos | O cartão de saldo mostra R$ 0,00; a lista vira o estado vazio "Outubro começa *aqui*."; o gráfico continua, com os meses anteriores. |
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
Categoria
(🛒 Mercado) (🍴 Restaurante) (🚗 Transporte)
(⌂ Moradia) (🧾 Contas) (♡ Saúde) (Mais ⌄)    ← CategoryChips
Descrição (opcional)
┌──────────────────────────────┐
│ Mercado do bairro            │
└──────────────────────────────┘
Quando?
(Hoje) (Ontem) (Outro dia)
[        Salvar gasto        ]                ← primário grande + toque de ouro
```

1. **Tipo** ([SegmentedToggle](componentes/segmented-toggle.md)): Gasto já marcado. Trocar para Renda muda o título ("Adicionar renda"), o rótulo do valor ("Quanto entrou?"), as categorias e o botão ("Salvar renda").
2. **Valor** ([MoneyInput](componentes/money-input.md)): recebe o foco ao abrir, com teclado numérico. É o único campo obrigatório.
3. **Categoria** ([CategoryChip](componentes/category-chip.md)): seis mais usadas e "Mais". Opcional: sem escolha, vai para "Outros".
4. **Descrição** (opcional): campo de texto, até 60 caracteres.
5. **Quando?**: três opções em chips de escolha única, com "Hoje" marcado. "Outro dia" mostra um campo de data nativo (`<input type="date">`).
6. **Salvar gasto**: primário grande, com o [toque de ouro](componentes/golden-touch.md). Depois de salvar, o app volta para a tela de onde a pessoa veio, com a linha nova brilhando uma vez e o aviso "Anotado: Mercado do bairro, − R$ 127,90".

Regras:

- Nada é perguntado duas vezes, e nada além do valor é obrigatório.
- `Enter` no campo de valor leva à categoria; o formulário só é enviado pelo botão.
- Erros aparecem junto do campo, ao tocar em salvar (não enquanto a pessoa digita), e o foco vai para o primeiro campo com erro.

## Lançamentos

**Pergunta:** "Onde eu gastei?"

- Título "Lançamentos" e o mês no topo (troca de mês do `AppHeader`).
- Linha de totais do mês: "Entrou + R$ 6.200,00 · Saiu − R$ 4.357,90".
- Filtros em chips de escolha única: **Todos**, **Gastos**, **Rendas**. Busca por descrição (ícone `search`), com o texto "Buscar lançamento".
- Lista agrupada por dia, com cabeçalho de dia ("Hoje", "Ontem", "Sábado, 26 de setembro") e o total do dia à direita. Dentro de um dia, a linha mostra só a categoria na meta, porque a data já está no cabeçalho.
- Botão primário "Adicionar gasto" no topo da lista.
- Busca ou filtro sem resultado: frase simples e saída, sem ilustração: "Nenhum lançamento com “farmácia” em setembro." + "Limpar busca".
- Listas longas carregam por mês (um mês por vez), sem rolagem infinita: no fim da lista, "Ver agosto".

## Editar lançamento

- Mesmo formulário do lançamento novo, preenchido. Título "Editar gasto" ou "Editar renda".
- Botão primário "Salvar alterações". Sem toque de ouro: a confirmação é só o aviso "Alterado: Mercado do bairro, − R$ 132,90".
- No fim da tela, "Excluir lançamento" ([Button](componentes/button.md) de perigo). Ao tocar, a confirmação aparece no mesmo lugar: "Excluir “Mercado do bairro”, − R$ 127,90? Não dá para desfazer." com "Excluir lançamento" e "Manter lançamento".

## Resumo do mês

**Pergunta:** "Como foi o mês?" (`/resumo/2026-09`)

1. Título display: "Setembro de 2026".
2. Se o mês fechou com sobra: a [conquista](componentes/achievement.md). Se não, o resumo em fatos: "Setembro fechou com R$ 210 a menos. Quer ver onde dá para ajustar?"
3. Entrou, saiu e sobrou (ou faltou), no formato do cartão de saldo, sem mármore.
4. Gastos por categoria: barras horizontais da maior para a menor, com valor e porcentagem ([Gráficos e dados](13-graficos-e-dados.md#barras-por-categoria)). Título-conclusão: "Mercado levou a maior parte de setembro: R$ 1.230."
5. Comparação com o mês anterior, em frases: "Você gastou R$ 180 a menos com restaurante do que em agosto."
6. Os cinco maiores gastos do mês.

## Planejamento

**Pergunta:** "Como vão ficar os próximos meses?"

1. Título-conclusão do ano: "2026 deve fechar com R$ 14.200 de sobra." (ou, sem acento, "Novembro pode fechar no vermelho.").
2. Gráfico do ano (janeiro a dezembro): meses reais sólidos, meses futuros projetados, com o 13º e as férias previstas aparecendo nos meses em que caem.
3. Tabela "Mês a mês" com Entrou, Saiu e Sobrou para cada mês, marcando "(projeção)".
4. **Rendas previstas** (das calculadoras): "13º salário, 1ª parcela · até 30 nov · + R$ 2.700" com a etiqueta "prevista" e o botão "Recebi" quando a data chegar.
5. **Fixos:** rendas e gastos que se repetem ("Salário, todo dia 5, + R$ 5.400,00"; "Aluguel, todo dia 10, − R$ 1.650,00"), com "Adicionar renda fixa" e "Adicionar gasto fixo". Fixos entram sozinhos na lista no dia marcado, e a pessoa pode ajustar o valor daquele mês.
6. **Limites por categoria:** barras de limite ([Categorias](15-categorias.md#limites-por-categoria)) e "Definir um limite".
7. A nota da projeção: "Estimativa com base nos últimos 3 meses, nos fixos e nas rendas já previstas."

## Calculadoras

**Pergunta:** "Quanto vou receber?" É o diferencial do Midas: transformar férias, 13º e rescisão em números que entram no planejamento do ano.

### Tela inicial

Três cartões, um por calculadora, cada um com título, uma frase que explica o termo e o botão "Calcular":

| Calculadora | Frase do cartão |
| --- | --- |
| Férias | "Veja quanto você recebe nas férias, com o terço a mais." |
| 13º salário | "Veja o valor das duas parcelas e quando cada uma cai." |
| Rescisão | "Veja uma estimativa do que você recebe quando o contrato termina." |

Abaixo, "Suas últimas contas", com as estimativas já feitas e a data.

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
| Rescisão | Salário bruto · Data de entrada e data de saída · Como foi a saída · Aviso prévio (trabalhado, pago ou dispensado) · Férias vencidas · Saldo do FGTS (opcional, para estimar a multa) |

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
- "Adicionar ao planejamento" cria as rendas previstas (13º em duas parcelas; férias na data; rescisão na data de pagamento) e confirma: "Férias adicionadas ao planejamento de dezembro."
- Sem toque de ouro aqui: ele é só para lançamentos.

## Seus dados

A tela dos direitos da pessoa, descrita em [Privacidade na interface](16-privacidade-na-interface.md#seus-dados): o que o Midas guarda, corrigir, baixar, com quem compartilha, aparelhos conectados, apagar a conta e quem cuida dos dados. O aviso "Seus dados são só seus." fica no topo.

## Configurações

| Seção | Itens |
| --- | --- |
| Aparência | Tema: "Claro", "Escuro", "Automático" (rádios, com Claro marcado de início). "Ocultar valores" (liga e desliga o modo discreto). |
| Conta | "Como você quer que o Midas te chame?", e-mail, "Trocar senha". |
| Lançamentos | "Categorias no formulário" (esconder as que a pessoa não usa, se o app permitir). |
| Sobre | Versão, "Sobre o Midas", "Ajuda". |

Cada mudança vale na hora e confirma com um aviso curto ("Tema escuro ativado."); não há botão "Salvar configurações".

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
