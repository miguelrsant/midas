# Componentes

Cada componente tem uma página com o que ele faz, quando usar e quando não usar, anatomia, variantes, estados, medidas, tokens, conteúdo, acessibilidade, comportamento responsivo, código (HTML de referência, CSS e sugestão em React com Tailwind) e uma tabela de faça e evite.

As classes `md-*` vêm do protótipo do design system (`bundle.css`). No app, elas viram componentes React em `src/components/midas/`, construídos sobre shadcn/ui quando fizer sentido e sempre com os tokens de [14-tokens.md](../14-tokens.md).

## Ações

| Componente | O que é |
| --- | --- |
| [Button](button.md) | Botão primário, secundário, ghost e de perigo, com o modificador `md-toque` para salvar lançamentos. |

## Lançamentos

| Componente | O que é |
| --- | --- |
| [SegmentedToggle](segmented-toggle.md) | Alternador Gasto/Renda no topo do formulário. |
| [MoneyInput](money-input.md) | Campo grande de valor em reais, primeiro passo do lançamento. |
| [CategoryChip](category-chip.md) | Pílulas de categoria, segundo passo do lançamento. |
| [GoldenTouch](golden-touch.md) | O toque de ouro: onda, reflexo e aviso "Anotado" ao salvar. |

## Painel

| Componente | O que é |
| --- | --- |
| [BalanceCard](balance-card.md) | Cartão de saldo do mês: quanto sobrou, entrou e saiu. |
| [TransactionRow](transaction-row.md) | Linha de um gasto ou renda nas listas. |
| [IncomeExpenseChart](income-expense-chart.md) | Barras de renda e gastos por mês, com a projeção. |
| [Achievement](achievement.md) | Conquista do mês, com louros, quando o mês fecha positivo. |

## Mensagens

| Componente | O que é |
| --- | --- |
| [Notice](notice.md) | Aviso curto com ícone: privacidade, limite, projeção, erro de rede. |
| [EmptyState](empty-state.md) | O que aparece quando ainda não há nada, com o primeiro passo. |

## Marca

| Componente | O que é |
| --- | --- |
| [AppHeader](app-header.md) | Topo do app com logo, troca de mês, conta e saudação. |
| [LoginScreen](login-screen.md) | Entrada, cadastro e recuperação de senha sobre o mármore. |
| [Seal](seal.md) | O selo em forma de moeda antiga. |

## Antes de criar um componente novo

1. Veja se um destes, com outra variante, já resolve.
2. Escreva a página dele aqui, no mesmo formato, antes ou junto do código.
3. Confira a [checklist de tela nova](../17-padroes-de-tela.md#checklist-de-uma-tela-nova) e a [acessibilidade](../12-acessibilidade.md).
