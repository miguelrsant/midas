# Gráficos e dados

Um gráfico do Midas existe para responder uma pergunta, e a resposta vem **escrita no título**, antes do gráfico. O desenho confirma o que o texto já disse. Quem não vê o gráfico (leitor de tela, baixa visão, pressa) recebe a mesma informação em palavras e numa tabela.

## Princípios

1. **Título é conclusão.** "Dezembro deve fechar com R$ 6.300 de sobra", não "Renda x gastos 2026". O nome do gráfico vai no sobretítulo.
2. **Poucos tipos, sempre os mesmos.** Barras verticais para meses, barras horizontais para categorias. Nada além disso sem um bom motivo.
3. **Duas cores de dado.** `grafico-renda` e `grafico-gasto`, mais `grafico-projecao` para marcar o futuro. Categorias não ganham cores.
4. **Projeção nunca parece fato.** Meses projetados têm preenchimento claro, contorno tracejado, rótulo "Projeção" e uma nota que diz de onde vem a estimativa.
5. **Tudo também em texto.** Título-conclusão, `aria-label` com o resumo e tabela com os mesmos dados.
6. **Sem animação de entrada.** As barras aparecem prontas.

## Tipos de gráfico

| Pergunta | Gráfico | Onde | Componente |
| --- | --- | --- | --- |
| "Como vão os próximos meses?" | Barras verticais de renda e gasto por mês, com meses projetados | Painel, Planejamento | [IncomeExpenseChart](componentes/income-expense-chart.md) |
| "Onde eu gastei?" | Barras horizontais por categoria, da maior para a menor | Resumo do mês, Lançamentos | Barras por categoria (abaixo) |
| "Quanto já usei do que entrou?" | Barra de progresso simples | Cartão de saldo | [BalanceCard](componentes/balance-card.md) |
| "Quanto falta para o limite?" | Barra de progresso por categoria | Planejamento | Barra de limite (abaixo) |

### Barras por categoria

- Uma linha por categoria: ícone e nome à esquerda, valor em `amount` à direita, barra embaixo ocupando a largura.
- Barra em `gasto` (ou `renda`, na lista de rendas) sobre trilha `superficie-funda`, 8px de altura, cantos `radius-pill`. O comprimento é proporcional à maior categoria do mês (que ganha a barra cheia).
- Ordem: do maior valor para o menor. "Outros" vai sempre por último, mesmo se for grande.
- Mostre as cinco maiores e um botão "Ver todas as categorias".
- Porcentagem do total em `caption` ao lado do valor: "38%".
- Título-conclusão: "Mercado levou a maior parte de setembro: R$ 1.230."

### Barra de limite por categoria

- Trilha `superficie-funda`, preenchimento `ouro` até 89%; a partir de 90%, o preenchimento vira `alerta`; acima de 100%, a barra fica cheia em `alerta`.
- Sempre com a frase ao lado ou abaixo: "R$ 360 de R$ 400", "Faltam R$ 40,00", "Passou R$ 25,00 do limite".
- A cor é reforço; a frase é a informação.

## Cores

| Uso | Token | Observação |
| --- | --- | --- |
| Série de renda | `grafico-renda` (= `renda`) | 6,54:1 sobre `superficie` no claro |
| Série de gasto | `grafico-gasto` (= `gasto`) | 6,11:1 sobre `superficie` no claro |
| Mês projetado de renda | preenchimento `renda-fundo`, contorno tracejado `grafico-renda` | |
| Mês projetado de gasto | preenchimento `gasto-fundo`, contorno tracejado `grafico-gasto` | |
| Início da projeção | linha vertical tracejada `grafico-projecao` (= `ouro`), rótulo "Projeção" em `ouro-texto` | O rótulo em texto compensa o contraste baixo do ouro no claro |
| Grade | `veio`, 1px, só linhas horizontais | |
| Eixos e legenda | `tinta-suave`, `caption` (14px) | |
| Coluna em foco | faixa `superficie-funda` atrás do par de barras | |

Renda fica sempre **à esquerda** do gasto no mesmo mês, e a legenda segue a mesma ordem.

## Eixos e números

- **Eixo de valores:** poucos rótulos (4 ou 5), números redondos, forma compacta em português: "0", "4 mil", "8 mil", "12 mil", "1,2 mi". Nunca "4k", "4K" ou "4.000,00". Sem "R$" no eixo: o título e a legenda já dizem que é dinheiro.
- **Eixo de meses:** abreviação com inicial maiúscula e sem ponto ("Jul", "Ago", "Set"), porque é um rótulo solto. No texto corrido, os meses continuam minúsculos.
- O eixo de valores começa sempre em zero. Nada de eixo "quebrado" que exagera diferenças.
- Sem dois eixos de valores no mesmo gráfico.

```ts
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact" }); // 4000 → "4 mil"; 1200000 → "1,2 mi"
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
```

### Arredondamento

| Onde | Precisão |
| --- | --- |
| Valores de meses reais no balão e na tabela | Centavos |
| Valores projetados (títulos, balão, tabela) | Centena de reais: "R$ 6.300" |
| Título-conclusão de mês real | Real: "R$ 1.842" |
| Porcentagens | Inteiro, arredondado para baixo (nunca mostre 100% se ainda sobra dinheiro) |

## Projeção: como é calculada e como é explicada

O cálculo fica em `src/lib/finance/projection.ts`, com testes. As regras:

- **Meses de referência:** os últimos 3 meses fechados **que têm lançamentos**, dentro dos últimos 6 meses. Mês sem lançamento não conta como zero ("não usou o app" não é "não gastou"). O primeiro mês de uso só entra se o primeiro lançamento foi até o dia 7 (um mês começado no meio puxaria a média para baixo). Sem nenhum mês de referência, a projeção conta só os fixos e as rendas previstas (sem médias), e a nota diz isso.
- **Variável** é o lançamento que não veio de um fixo e não é das categorias de calculadora (13º, férias, rescisão, seguro-desemprego).
- **Gasto projetado** de cada mês futuro: média dos gastos **variáveis** dos meses de referência, mais os gastos fixos que caem naquele mês. Os lançamentos criados pelos fixos ficam fora da média, para não contar duas vezes.
- **Renda projetada:** as rendas fixas que caem naquele mês, se a pessoa tiver alguma; na falta delas, a média das rendas variáveis dos meses de referência. Mais as **rendas previstas pelas calculadoras** que caem no mês.
- **Mês atual (até o fim):** o que já entrou e saiu, mais os fixos e as rendas previstas que ainda faltam no mês, mais o que falta da média de gastos variáveis: `max(0, média variável − gasto variável até agora)`. É a base do "Setembro vai bem" do painel e da barra do mês atual no gráfico, onde a parte que falta aparece no estilo de projeção.
- **Rendas previstas atrasadas** (a data passou e a pessoa ainda não tocou em "Recebi" nem em "Não recebi") continuam esperadas **no mês atual**, nunca num mês que já passou. "Recebi" troca a prevista por um lançamento real, sem contar duas vezes.
- **Sem renda conhecida** (sem histórico e sem renda fixa), a projeção não diz que um mês "pode fechar no vermelho": o título pede "Anote sua renda para ver quanto deve sobrar."
- **Arredondamento:** as contas guardam centavos; a tela mostra projeções arredondadas à centena de reais.
- **Dupla contagem conhecida:** quem anotava um gasto à mão e depois cria um fixo para ele vê o gasto contado duas vezes até os 3 meses de referência passarem. A nota da projeção lembra disso quando há fixo criado há menos de 3 meses.

A explicação para a pessoa fica sempre ao lado do gráfico, em `caption`:

- "Estimativa com base nos últimos 3 meses, nos fixos e nas rendas já previstas, como o 13º."
- "Estimativa com base em agosto e setembro e nos fixos." (com menos de 3 meses)
- "Como você tem renda fixa, a estimativa conta só ela; ganhos avulsos não entram." (quando há renda fixa e também rendas variáveis nos meses de referência)
- "Estimativa com base nos fixos e nas rendas já previstas, como o 13º. Os gastos do dia a dia entram depois do primeiro mês com lançamentos." (sem mês de referência)

Palavras: sobra projetada **"deve"** acontecer; falta projetada **"pode"** acontecer. Projeção nunca é chamada de previsão garantida.

## Balão (tooltip)

- Aparece ao tocar, ao passar o mouse ou ao focar uma coluna.
- Conteúdo: mês por extenso, com "(projeção)" ou "(até agora)" quando for o caso, e os valores com sinal e rótulo: "Outubro (projeção) · Entrou + R$ 6.200 · Saiu − R$ 4.800".
- Visual: fundo `superficie`, borda 1px `veio`, `radius-md`, `sombra-cartao`, padding `space-3`; mês em `label`, valores em `amount` na cor da série.
- O balão é um atalho. Nenhuma informação existe só nele.

## Tabela alternativa

Todo gráfico tem um botão "Ver em tabela" (`md-btn-ghost`, com `aria-expanded`) que mostra os mesmos dados numa `<table>`:

- `<caption>` com o nome da tabela ("Renda e gastos por mês").
- Cabeçalhos de coluna (`<th scope="col">`) e de linha (`<th scope="row">`, o mês).
- Meses projetados marcados no próprio cabeçalho da linha: "Outubro (projeção)".
- Valores com sinal visual escondido do leitor de tela quando o cabeçalho já diz o sentido.
- Valores alinhados à direita, em `amount`, com `tabular-nums`.

## Estados

| Estado | O que mostrar |
| --- | --- |
| Carregando | O cartão com o sobretítulo e a área do gráfico em `superficie-funda`, sem barras falsas; `aria-busy="true"`. |
| Sem dados suficientes | Sem gráfico. Uma frase: "O gráfico aparece quando você fechar o primeiro mês com lançamentos." |
| Erro | Sem gráfico. "Não foi possível carregar o gráfico." O botão "Tentar de novo" fica no aviso do topo da tela. Nunca desenhe zeros no lugar de dados que não chegaram. |
| Um valor muito maior que os outros | A escala acompanha. Nada de cortar a barra ou mudar o eixo para escala logarítmica. |

## Acessibilidade

- Título-conclusão antes do gráfico, como `h2` do cartão.
- O invólucro do gráfico tem `role="img"` e um `aria-label` gerado a partir dos dados, com até três frases: o que o gráfico mostra, quais meses são projeção e o destaque. Os elementos internos do SVG ficam fora da árvore de acessibilidade.
- Legenda sempre visível e com texto.
- Diferença entre séries por posição (renda à esquerda) e legenda, além da cor; projeção por tracejado e rótulo, além do tom.
- Os pares de cor são seguros para daltonismo (eixo azul–laranja).
- Sem animação: nada a desligar com `prefers-reduced-motion`.

## Implementação

- **SVG próprio, desenhado no servidor**, para os gráficos de meses (sem biblioteca de gráficos: nada a baixar, sem JavaScript para desenhar e sem conflito com a política de segurança de conteúdo). As barras por categoria e as barras de progresso usam o componente [Bar](componentes/bar.md).
- **Nada de `style=""`**: a CSP do Midas bloqueia estilo em linha vindo do servidor. Larguras e alturas saem de classes prontas (`w-[37%]`, geradas no `globals.css`) ou de atributos do SVG (`width`, `height`, `y`).
- As marcas do eixo saem de `niceTicks()` (4 ou 5 valores "redondos" a partir de zero), em `src/lib/finance/chart.ts`.
- Cores sempre por variável CSS (`fill="var(--grafico-renda)"`), para trocarem com o tema. Nunca hexadecimais no componente.
- Valores chegam em **centavos** e só viram reais para desenhar. Títulos, resumos e notas são montados no servidor, com as regras de arredondamento desta página, e passados prontos ao componente.
- Sem animação nas barras.
- Detalhes, props sugeridas e código em [IncomeExpenseChart](componentes/income-expense-chart.md).

## O que não usar

| Evite | Por quê | Use |
| --- | --- | --- |
| Pizza e rosca | Ângulos são difíceis de comparar, e muitas fatias exigem muitas cores. | Barras horizontais por categoria. |
| Gráfico de linha para renda e gasto mensais | Sugere continuidade entre meses que são totais separados. | Barras por mês. |
| Barras empilhadas com várias categorias | Só a primeira camada tem base comum; as outras não se comparam. | Barras por categoria. |
| 3D, sombras, gradientes nas barras | Distorcem valores e poluem. | Barras chapadas. |
| Dois eixos de valores | Induzem a comparações falsas. | Dois gráficos. |
| Eixo que não começa em zero | Exagera diferenças. | Eixo a partir de zero. |
| Verde e vermelho para renda e gasto | Problema para daltonismo e tom de alarme. | `renda` e `gasto`. |
| Velas, setas de bolsa, "tendência" | Linguagem de mercado financeiro, fora do tom. | Frases em português simples. |
