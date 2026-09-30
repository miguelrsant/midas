# Shortcuts (Atalhos do lançamento)

> Chips de gastos e rendas comuns que preenchem categoria e descrição com um toque, no formulário de lançamento. O valor continua com a pessoa.

Grupo: Lançamentos · Componente React: `<Shortcuts />` em `src/components/midas/shortcuts.tsx` · Dados: `src/lib/presets.ts`

## Quando usar

- Em `/lancamentos/novo`, logo abaixo do [MoneyInput](money-input.md), com o rótulo "Atalhos".

## Quando não usar

- Na edição de um lançamento (lá tudo já está preenchido).
- Para criar fixos: lá entram os **fixos prontos**, com o mesmo visual (veja [Padrões de tela](../17-padroes-de-tela.md#rendas-e-gastos-fixos)).

## Conteúdo

| Tipo | Atalhos (nome → categoria) |
| --- | --- |
| Gasto | Café → Restaurante · Almoço → Restaurante · Lanche → Restaurante · Padaria → Mercado · Mercado → Mercado · Ônibus e metrô → Transporte · Aplicativo de corrida → Transporte · Gasolina → Transporte · Farmácia → Saúde · Presente → Compras |
| Renda | Salário → Salário · Freela → Freelance · Venda → Vendas · Pix recebido → Outros · Reembolso → Outros · Rendimento → Investimentos |

- Aparecem os 5 primeiros e "Mais" (`chevron-down`), que revela os outros no mesmo lugar, como no [CategoryChip](category-chip.md).
- Se a pessoa escondeu a categoria de um atalho, o atalho também some.

## Comportamento

- Um toque preenche a descrição (o nome do atalho) e marca a categoria (abrindo "Mais" das categorias se ela estiver escondida atrás dele).
- Se o valor está vazio, o foco vai para o valor; senão, para o botão "Salvar gasto".
- Os atalhos são botões (`<button type="button">`), não escolhas: tocar outro troca o que foi preenchido. Nenhum fica "selecionado".
- Trocar Gasto/Renda troca a lista.

## Visual e acessibilidade

- Pílulas de 44px de altura, `superficie` com borda `borda`, texto `label`, sem ícone (para não competir com as categorias). Espaço de 8px entre elas; quebram linha, nunca rolam de lado.
- O grupo tem `role="group"` com `aria-labelledby` apontando para o rótulo "Atalhos"; a ajuda "Preenche categoria e descrição." fica ligada por `aria-describedby`.
- Depois do toque, a região de status anuncia: "Categoria Restaurante e descrição Café preenchidas."
