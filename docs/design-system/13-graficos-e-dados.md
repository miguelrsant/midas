# Gráficos e dados

Um gráfico do Midas existe para responder uma pergunta, e a resposta vem **escrita no título**, antes do gráfico. O desenho confirma o que o texto já disse. Quem não vê o gráfico (leitor de tela, baixa visão, pressa) recebe a mesma informação em palavras e numa tabela.

## Princípios

1. **Título é conclusão.** "Dezembro deve fechar com R$ 6.300 de sobra", não "Renda x gastos 2026". O nome do gráfico vai no sobretítulo.
2. **Poucos tipos, sempre os mesmos.** Barras verticais para meses, uma rosca para os gastos do mês por categoria, barras horizontais para progresso e limites. Nada além disso sem um bom motivo.
3. **Duas cores de dado nos meses.** `grafico-renda` e `grafico-gasto`, mais `grafico-projecao` para marcar o futuro. Só a rosca por categoria usa a paleta de fatias (`grafico-cat-1` a `grafico-cat-5` e `grafico-cat-outros`), pela posição: categorias não têm cor fixa.
4. **Projeção nunca parece fato.** Meses projetados têm preenchimento claro, contorno tracejado, rótulo "Projeção" e uma nota que diz de onde vem a estimativa.
5. **Fixa embaixo, variável em cima.** Cada barra de mês empilha duas camadas da mesma série: a parte fixa (fixos e rendas previstas) cheia, embaixo, e a variável hachurada, em cima. A hachura é textura, não cor nova.
6. **Tudo também em texto.** Título-conclusão, `aria-label` com o resumo e tabela com os mesmos dados.
7. **Sem animação de entrada.** As barras aparecem prontas.

## Tipos de gráfico

| Pergunta | Gráfico | Onde | Componente |
| --- | --- | --- | --- |
| "Como vão os próximos meses?" | Barras verticais de renda e gasto por mês, do mês atual em diante, com a parte fixa e a variável empilhadas e os meses seguintes projetados | Painel, Planejamento | [IncomeExpenseChart](componentes/income-expense-chart.md) |
| "Onde eu gastei?" | Rosca por categoria, com a legenda ao lado | Início (mês escolhido), Resumo do mês | [CategoryDonut](componentes/category-donut.md) |
| "Quanto já usei do que entrou?" | Barra de progresso simples | Cartão de saldo | [BalanceCard](componentes/balance-card.md) |
| "Quanto falta para o limite?" | Barra de progresso por categoria | Planejamento | Barra de limite (abaixo) |

### Rosca por categoria

Decisão de 2026-10-01: a pessoa pediu para ver "quanto foi em transporte, em comida…" num desenho de pizza. A rosca substitui as barras por categoria, com regras que compensam o ponto fraco dela (ângulos são difíceis de comparar):

- **Até seis fatias.** Com até 6 categorias no mês, todas aparecem; com mais, as cinco maiores e "Outros", que junta as menores e a categoria Outros da pessoa. "Outros" vai sempre por último, em `grafico-cat-outros`.
- **Da maior para a menor**, começando no topo, em sentido horário. A cor vai pela posição: a maior é sempre `grafico-cat-1`. Assim, seis cores bastam para qualquer número de categorias, e a pessoa nunca precisa decorar "a cor do Mercado".
- **Legenda obrigatória ao lado** (embaixo, no celular), na mesma ordem: amostra de cor, ícone, nome, valor e porcentagem. **A legenda é a informação**; a rosca é o desenho. Nunca se lê uma fatia só pela cor.
- **2px de espaço** entre as fatias, na cor da superfície, para separar vizinhas mesmo para quem não distingue as cores.
- **Total no centro**: "Saiu" e o valor, com o modo discreto valendo.
- Porcentagens arredondadas para baixo ("38%"). Uma fatia só fecha o círculo.
- Título-conclusão: "Mercado levou a maior parte de setembro: R$ 1.230."
- "Ver em tabela" lista **todas** as categorias, inclusive as que foram juntadas em "Outros".

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
| Parte fixa | preenchimento cheio na cor da série | Embaixo, com base comum em zero |
| Parte variável | preenchimento `renda-fundo` / `gasto-fundo`, hachura horizontal (linhas de 1,5px a cada 4px) e contorno de 1px na cor da série | Em cima da fixa. A hachura é horizontal porque o SVG estica só na largura. Nos meses projetados, a hachura fica a 50% e o contorno, tracejado |
| O que falta no mês atual | estilo de projeção (fundo claro e contorno tracejado), em cima da parte real | Fixos que faltam, rendas previstas e o que falta da média |
| Grade | `veio`, 1px, só linhas horizontais | |
| Eixos e legenda | `tinta-suave`, `caption` (14px) | |
| Coluna em foco | faixa `superficie-funda` atrás do par de barras | |
| Fatias da rosca | `grafico-cat-1` a `grafico-cat-5` pela posição, `grafico-cat-outros` (= `borda`) para "Outros"; trilha `superficie-funda` | Cada tema tem os seus tons, conferidos juntos: 3:1 ou mais sobre `superficie`, separação para daltonismo entre vizinhas acima do piso, com espaço e legenda |

Renda fica sempre **à esquerda** do gasto no mesmo mês, e a legenda segue a mesma ordem: "Renda", "Gastos", "Fixa" (quadrado cheio), "Variável" (quadrado hachurado, classe `md-hachura`) e "Projeção".

**O que é fixo:** lançamentos criados por um fixo, rendas das calculadoras (13º, férias, rescisão, seguro-desemprego) e, na projeção, os fixos e as rendas previstas. **Variável** é todo o resto.

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
- Conteúdo: mês por extenso, com "(projeção)" ou "(até agora)" quando for o caso, e os valores com sinal e rótulo: "Outubro (projeção) · Entrou + R$ 6.200 · Saiu − R$ 4.800". Embaixo de cada valor, em `caption`, a divisão ("fixa R$ 5.400 · variável R$ 800") e, no mês atual, "deve entrar mais R$ 300".
- Visual: fundo `superficie`, borda 1px `veio`, `radius-md`, `sombra-cartao`, padding `space-3`; mês em `label`, valores em `amount` na cor da série.
- O balão é um atalho. Nenhuma informação existe só nele.

## Tabela alternativa

Todo gráfico tem um botão "Ver em tabela" (`md-btn-ghost`, com `aria-expanded`) que mostra os mesmos dados numa `<table>`:

- `<caption>` com o nome da tabela ("Renda e gastos por mês").
- Cabeçalhos de coluna (`<th scope="col">`) e de linha (`<th scope="row">`, o mês).
- Meses projetados marcados no próprio cabeçalho da linha: "Outubro (projeção)".
- Valores com sinal visual escondido do leitor de tela quando o cabeçalho já diz o sentido.
- Valores alinhados à direita, em `amount`, com `tabular-nums`.
- A divisão fixa e variável e o que falta no mês atual vão numa linha menor embaixo de cada total, não em colunas novas: seis colunas de números não cabem em 360px.

## Estados

| Estado | O que mostrar |
| --- | --- |
| Carregando | O cartão com o sobretítulo e a área do gráfico em `superficie-funda`, sem barras falsas; `aria-busy="true"`. |
| Sem dados suficientes | Sem gráfico. Uma frase: "O gráfico aparece quando você anotar uma renda fixa ou fechar o primeiro mês com lançamentos." |
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

- **SVG próprio, desenhado no servidor**, para os gráficos de meses (sem biblioteca de gráficos: nada a baixar, sem JavaScript para desenhar e sem conflito com a política de segurança de conteúdo). A rosca por categoria também é SVG desenhado no servidor (arcos com `stroke-dasharray` e `stroke-dashoffset` em atributo, num círculo de perímetro 100). As barras de progresso usam o componente [Bar](componentes/bar.md).
- **Nada de `style=""`**: a CSP do Midas bloqueia estilo em linha vindo do servidor. Larguras e alturas saem de classes prontas (`w-[37%]`, geradas no `globals.css`) ou de atributos do SVG (`width`, `height`, `y`).
- As marcas do eixo saem de `niceTicks()` (4 ou 5 valores "redondos" a partir de zero), em `src/lib/finance/chart.ts`.
- Cores sempre por variável CSS (`fill="var(--grafico-renda)"`), para trocarem com o tema. Nunca hexadecimais no componente.
- Valores chegam em **centavos** e só viram reais para desenhar. Títulos, resumos e notas são montados no servidor, com as regras de arredondamento desta página, e passados prontos ao componente.
- Sem animação nas barras.
- Detalhes, props sugeridas e código em [IncomeExpenseChart](componentes/income-expense-chart.md).

## O que não usar

| Evite | Por quê | Use |
| --- | --- | --- |
| Pizza cheia, ou rosca com mais de seis fatias, sem legenda ou sem espaço entre fatias | Ângulos são difíceis de comparar, e muitas fatias exigem muitas cores. | A [rosca por categoria](#rosca-por-categoria), com as regras dela. |
| Gráfico de linha para renda e gasto mensais | Sugere continuidade entre meses que são totais separados. | Barras por mês. |
| Barras empilhadas com várias categorias | Só a primeira camada tem base comum; as outras não se comparam. | A rosca por categoria. A única pilha permitida é a de **duas camadas da mesma série** (fixa embaixo, variável em cima) no gráfico de meses: a parte fixa, que é a que a pessoa planeja, fica com a base comum. |
| 3D, sombras, gradientes nas barras | Distorcem valores e poluem. | Barras chapadas. |
| Dois eixos de valores | Induzem a comparações falsas. | Dois gráficos. |
| Eixo que não começa em zero | Exagera diferenças. | Eixo a partir de zero. |
| Verde e vermelho para renda e gasto | Problema para daltonismo e tom de alarme. | `renda` e `gasto`. |
| Velas, setas de bolsa, "tendência" | Linguagem de mercado financeiro, fora do tom. | Frases em português simples. |
