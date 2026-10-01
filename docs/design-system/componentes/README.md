# Componentes

Cada componente tem uma página com o que ele faz, quando usar e quando não usar, anatomia, variantes, estados, medidas, tokens, conteúdo, acessibilidade, comportamento responsivo, código (HTML de referência, CSS e sugestão em React com Tailwind) e uma tabela de faça e evite.

As classes `md-*` vêm do protótipo do design system (`bundle.css`). No app, elas viram componentes React:

- **`src/components/midas/`**: componentes de domínio do Midas (os desta lista).
- **`src/components/ui/`**: peças de base, incluindo as do shadcn/ui (Button com `cva` e `asChild`, Dialog, Collapsible, Tooltip, Popover, Switch, Skeleton), sempre com os tokens de [14-tokens.md](../14-tokens.md).

Usamos shadcn/ui onde ele não esbarra no design system. Ficam **nativos**, como pedem as páginas deles: chips e rádios (CategoryChip, SegmentedToggle, Shortcuts, CategoryIconPicker, RadioCards), o MoneyInput, o aviso "Anotado" do GoldenTouch, a confirmação de exclusão na própria tela e o menu da conta. Nenhum componente usa `style=""` renderizado no servidor: a CSP bloqueia.

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
| [Shortcuts](shortcuts.md) | Atalhos que preenchem categoria e descrição com um toque. |
| [GoldenTouch](golden-touch.md) | O toque de ouro: onda, reflexo e aviso "Anotado" ao salvar. |

## Painel

| Componente | O que é |
| --- | --- |
| [BalanceCard](balance-card.md) | Cartão de saldo do mês: quanto sobrou, entrou e saiu. |
| [TransactionRow](transaction-row.md) | Linha de um gasto ou renda nas listas. |
| [IncomeExpenseChart](income-expense-chart.md) | Barras de renda e gastos por mês, com a projeção. |
| [Achievement](achievement.md) | Conquista do mês, com louros, quando o mês fecha positivo. |
| [CategoryDonut](category-donut.md) | Rosca dos gastos do mês por categoria, com a legenda ao lado. |
| [Bar](bar.md) | Barra fina de proporção (saldo, limites, passos). |

## Planejamento e calculadoras

| Componente | O que é |
| --- | --- |
| [ExpectedIncomeRow](expected-income-row.md) | Renda prevista das calculadoras, com "Recebi" e "Não recebi". |
| [RadioCards](radio-cards.md) | Escolhas grandes, com ajuda, das calculadoras e do "Monte seu mês". |

## Estrutura e configurações

| Componente | O que é |
| --- | --- |
| [TaskHeader](task-header.md) | Topo das telas de tarefa: "Voltar", título e passos. |
| [CategoryIconPicker](category-icon-picker.md) | Grade de ícones para personalizar categorias. |
| [PasswordConfirm](password-confirm.md) | Diálogo que pede a senha antes de baixar os dados. |

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
