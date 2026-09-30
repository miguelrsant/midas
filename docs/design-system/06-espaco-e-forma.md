# Espaço e forma

O Midas respira. Espaço generoso deixa cada número sozinho o bastante para ser lido, e alvos grandes deixam cada toque certeiro. A hierarquia vem de **espaço e tipografia**, não de caixas, cores de fundo ou camadas de sombra.

## Grade de 4px

Todo espaço é múltiplo de 4px e usa um dos tokens abaixo. Não existem valores intermediários (nada de 10px, 14px, 20px de margem).

| Token | Valor | Tailwind | Uso típico |
| --- | --- | --- | --- |
| `space-1` | 4px | `1` (`gap-1`, `p-1`) | Entre ícone e texto curto (rótulo "Entrou"); entre as setas e o nome do mês. |
| `space-2` | 8px | `2` | Entre rótulo e campo; entre chips; entre ícone e texto em botões e chips. |
| `space-3` | 12px | `3` | Padding interno de chips e selos; entre ícone e texto em linhas e avisos; entre colunas da linha de lançamento. |
| `space-4` | 16px | `4` | Margem lateral no celular; padding de avisos; espaço entre blocos dentro de um cartão. |
| `space-6` | 24px | `6` | Padding de cartões; espaço entre campos de um formulário; padding lateral de botões. |
| `space-8` | 32px | `8` | Espaço entre seções de uma tela; padding vertical do cartão de entrada. |
| `space-12` | 48px | `12` | Altura mínima de botões e linhas clicáveis; respiro de topo das telas. |

A escala padrão do Tailwind (`--spacing: 0.25rem`) já coincide com os tokens: `p-4` é 16px, `gap-6` é 24px. **Use só os passos 1, 2, 3, 4, 6, 8 e 12.** Se um layout parece pedir outro valor, o problema costuma ser de conteúdo ou de alinhamento, não de espaço.

## Alvos de toque

| Elemento | Altura mínima | Observação |
| --- | --- | --- |
| Botões | 48px (`space-12`) | 56px no botão grande (`md-btn-lg`). |
| Linhas clicáveis (lançamentos, itens de menu) | 64px na lista de lançamentos; 48px em menus | A linha inteira é o alvo. |
| Chips de categoria e alternador Gasto/Renda | 44px | |
| Setas de mês, avatar | 44 × 44px | Mesmo quando o ícone tem 20px. |
| Botão fechar (`x`) | 48 × 48px | Fica num canto, onde errar o toque é mais fácil. |
| Campo de valor | 64px | Campos de texto: 52px. |

Entre dois alvos vizinhos, deixe pelo menos 8px (`space-2`). A WCAG 2.2 pede 24px no mínimo (critério 2.5.8); o Midas usa 44 a 48px porque parte do público tem tremor, pouca coordenação fina ou usa o celular com uma mão só.

## Layout

O Midas é desenhado **primeiro para o celular** e cresce para telas maiores.

### Pontos de quebra

Os pontos de quebra padrão do Tailwind:

| Nome | A partir de | Layout |
| --- | --- | --- |
| (base) | 0 | Celular: uma coluna, margem lateral de 16px. |
| `sm` | 640px | Celular grande e tablet em pé: uma coluna, margem de 24px. |
| `md` | 768px | Tablet: uma coluna centralizada de até 720px; logo do topo a 32px. |
| `lg` | 1024px | Computador: duas colunas no painel. |
| `xl` | 1280px | Igual ao `lg`, com mais respiro nas laterais. |

### Larguras

| Contexto | Largura máxima |
| --- | --- |
| Painel e listas (uma coluna) | 720px, centralizado |
| Painel em duas colunas (`lg`+) | 1120px, grade de 12 colunas com `gap` de 32px: 7 colunas à esquerda (saldo, ação principal, lançamentos), 5 à direita (gráfico, conquista, avisos) |
| Formulários (lançamento, calculadoras, configurações) | 480px |
| Campo de valor | 360px |
| Cartão de entrada e cadastro | 400px |
| Texto corrido | 65 caracteres (`max-w-[65ch]`) |
| Frase de estado vazio e da conquista | 32 a 34 caracteres |

### Ritmo vertical

- Entre seções de uma tela: `space-8` (32px).
- Dentro de um cartão: `space-6` de padding e `space-4` entre blocos.
- Entre um sobretítulo e seu conteúdo: `space-2`.
- Entre campos de formulário: `space-6`.
- Topo da tela: o `AppHeader` ocupa a primeira faixa; o conteúdo começa `space-4` abaixo da saudação.

### Margens seguras

Em celulares com entalhe e barra de gestos, respeite as áreas seguras: `padding-bottom: max(16px, env(safe-area-inset-bottom))` na barra de navegação inferior e no rodapé de folhas, e `viewport-fit=cover` na meta viewport.

## Cantos

| Token | Valor | Tailwind | Uso |
| --- | --- | --- | --- |
| `radius-sm` | 6px | `rounded-sm` | Selos pequenos, marcadores, campos pequenos. |
| `radius-md` | 10px | `rounded-md` | Botões, campos, avisos. |
| `radius-lg` | 16px | `rounded-lg` | Cartões, diálogos, cantos de cima das folhas inferiores, cartão de entrada. |
| `radius-pill` | 999px | `rounded-pill` | Chips, alternador Gasto/Renda, avatar, ícone de categoria, barra de progresso, aviso "Anotado". |

Regra de aninhamento: um elemento dentro de um cartão nunca tem canto maior que o do cartão. Quadrados de legenda de gráfico usam 3px.

## Elevação

**Existe uma única sombra**, `sombra-cartao`:

| Tema | Valor |
| --- | --- |
| Calacatta | `0 1px 2px rgba(43,31,22,0.06), 0 8px 24px rgba(43,31,22,0.06)` |
| Portoro | `0 1px 2px rgba(0,0,0,0.5)` |

Ela vai em cartões sobre o `marmore`, na pílula selecionada do alternador e no aviso "Anotado". Diálogos e folhas usam a mesma sombra sobre um fundo escurecido (`rgb(23 17 12 / 0.55)` nos dois temas). Não empilhe cartões dentro de cartões para criar profundidade: dentro de um cartão, separe com espaço ou com uma linha `veio`.

## Linhas e bordas

| Linha | Espessura | Cor | Uso |
| --- | --- | --- | --- |
| Divisória | 1px | `veio` | Entre linhas de lista (nunca depois da última) e no topo do bloco Entrou/Saiu. |
| Borda de controle | 1px | `borda` | Campos, botão secundário, chips, pílula selecionada do alternador. |
| Borda de erro | 2px | `alerta` | Campo com erro. |
| Borda de perigo | 1px | `gasto` | Botão de ação destrutiva. |
| Anel de foco | 2px + 2px de afastamento | `foco` | Todo controle focado pelo teclado. |
| Veio de ouro | 12px de altura (traço de 1,6px) | `ouro` | Ornamento: uma vez por tela. Veja [Ornamentos](08-ornamentos.md#veio-de-ouro). |

## Camadas (z-index)

| Camada | `z-index` | Tailwind | O que fica nela |
| --- | --- | --- | --- |
| Conteúdo | 0 | `z-0` | Tudo o que rola. |
| Navegação inferior | 20 | `z-20` | Barra de navegação do celular. |
| Avisos | 40 | `z-40` | Aviso "Anotado" e outros `role="status"` flutuantes. |
| Diálogos e folhas | 50 | `z-50` | Diálogos, folhas inferiores, menus (portais do Radix). |

O topo do app (`AppHeader`) não é fixo: com zoom alto, um cabeçalho fixo tomaria boa parte da tela.

## Composição de um cartão

```
┌─────────────────────────────────────────┐  radius-lg, superficie, sombra-cartao
│  SOBROU EM SETEMBRO          ← eyebrow  │  padding space-6
│                                         │
│  R$ 1.842,10                 ← display-xl
│                                         │  space-6
│ ─────────────────────────────── veio ── │
│  ↙ Entrou          ↗ Saiu               │  grade 1fr 1fr, gap space-4
│  + R$ 6.200,00     − R$ 4.357,90        │
│                                         │  space-4
│  ████████████████░░░░░░  ← barra 8px    │
│  Você usou 70% do que entrou este mês.  │  caption, space-2 acima
└─────────────────────────────────────────┘
```

## Faça e evite

| Faça | Evite |
| --- | --- |
| Separar seções com `space-8` e um título. | Separar seções com fundos coloridos ou linhas grossas. |
| Um cartão por assunto, sobre o `marmore`. | Cartão dentro de cartão. |
| Alvos de 44 a 48px, mesmo com ícone pequeno. | Ícones de 20px como alvo de 20px. |
| Valores dos tokens de espaço. | 10px, 14px, 18px, 20px "no olho". |
| Uma sombra, sempre a mesma. | Sombras diferentes para "hierarquia". |
