# CategoryDonut (Rosca de gastos por categoria)

> Rosca com os gastos de um mês por categoria, da maior para a menor, com a legenda ao lado. Responde "onde foi o meu dinheiro este mês?".

Grupo: Painel · Componente React: `<CategoryDonut />` em `src/components/midas/category-donut.tsx` · Regras em [Gráficos e dados](../13-graficos-e-dados.md#rosca-por-categoria)

## Quando usar

- No Início, para o mês escolhido, quando houver pelo menos um gasto.
- No resumo do mês.

## Quando não usar

- Para comparar meses: é o [IncomeExpenseChart](income-expense-chart.md).
- Para rendas: a pessoa costuma ter uma ou duas, e a lista basta.
- Sobre o mármore. A rosca fica num cartão liso (`superficie`).

## Anatomia

1. **Cartão**: `superficie`, `radius-lg`, `sombra-cartao`, padding `space-6`.
2. **Sobretítulo** (`md-eyebrow`): "Gastos por categoria".
3. **Título-conclusão** (`heading`): "Mercado levou a maior parte de outubro: R$ 1.230."
4. **Rosca**: 176px, SVG com `viewBox="0 0 42 42"`, círculo de raio 15,9155 (perímetro 100), traço de 6. Trilha em `superficie-funda`; fatias em `grafico-cat-1` a `grafico-cat-5` pela posição e `grafico-cat-outros` para "Outros"; 2px de espaço entre fatias. Começa no topo, em sentido horário.
5. **Centro**: "Saiu" em `caption` `tinta-suave` e o total arredondado ao real, em `label`, com [Money](../11-conteudo-e-tom.md#dinheiro) (respeita o modo discreto).
6. **Legenda**: uma linha por fatia, na mesma ordem: amostra de 12px (cantos de 3px), ícone da categoria (a partir de 640px; no celular sai, para o nome caber), nome, valor em `amount` e porcentagem em `caption`. Ao lado da rosca a partir de 640px; embaixo dela no celular.
7. **"Ver em tabela"**: todas as categorias do mês, inclusive as juntadas em "Outros", com valor e parte.
8. **Rodapé opcional**: no Início, o link "Ver o resumo de outubro".

## Estados

| Estado | Aparência |
| --- | --- |
| Padrão | Rosca, legenda e "Ver em tabela" |
| Uma categoria só | Círculo inteiro, sem espaço; legenda com 100% |
| Mês sem gastos | No Início, o cartão não aparece. No resumo, o título "Nenhum gasto anotado em outubro." e a frase "Quando você anotar um gasto em outubro, ele aparece aqui." |
| Modo discreto | Valores viram "R$ •••••"; a rosca e as porcentagens continuam |

## Conteúdo

- Título: a maior fatia e o valor, arredondado ao real. Se a maior for "Outros", o título diz "Outros".
- Porcentagens inteiras, arredondadas para baixo: nunca "100%" se houver outra fatia.
- Nada de jargão: "Saiu", não "Despesas totais".

## Acessibilidade

- O SVG tem `role="img"` e um `aria-label` com a lista: "Gráfico de rosca dos gastos de outubro por categoria: Mercado 38%, Moradia 25%, …".
- A legenda está sempre visível e diz tudo em texto; a cor nunca é a única pista.
- A paleta de fatias tem 3:1 ou mais sobre `superficie` nos dois temas e foi conferida para daltonismo entre fatias vizinhas (o espaço de 2px e a legenda compensam os pares mais próximos).
- Sem animação.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Junte em "Outros" o que passar de seis fatias | Uma fatia fina para cada categoria |
| Ponha o nome, o valor e a % na legenda | Cor sem nome, ou valor só no balão |
| Mantenha a cor pela posição | Dar uma cor fixa a cada categoria (não há cores para todas) |
