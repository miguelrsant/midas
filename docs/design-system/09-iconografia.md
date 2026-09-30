# Iconografia

Os ícones do Midas são **de linha, simples e sempre acompanhados de texto**. Eles ajudam a reconhecer (o carrinho é Mercado), mas nunca substituem a palavra.

## Biblioteca

- **[Lucide](https://lucide.dev)** (licença ISC), no app pelo pacote `lucide-react`.
- Os nomes abaixo foram conferidos no pacote `lucide-static` 1.49. Se uma versão futura renomear um ícone, atualize esta página e a tabela de categorias.
- Não misture outras bibliotecas de ícones, não use ícones preenchidos e não use emoji no lugar de ícone.

## Especificação

| Propriedade | Valor |
| --- | --- |
| Tamanho padrão | 20px (`size={20}`) |
| Tamanho na navegação inferior | 24px |
| Traço | 1,75 (`strokeWidth={1.75}`) |
| Pontas e junções | arredondadas (padrão do Lucide) |
| Cor | herdada do texto (`currentColor`) |
| Preenchimento | nenhum |
| Distância do texto | 8px (`space-2`) em botões, chips e aviso; 12px (`space-3`) em linhas de lista; 4px (`space-1`) em rótulos curtos |

```css
.md-icon {
  width: 20px; height: 20px; flex: none;
  fill: none; stroke: currentColor; stroke-width: 1.75;
  stroke-linecap: round; stroke-linejoin: round;
}
```

```tsx
import { Plus } from "lucide-react";

<Plus size={20} strokeWidth={1.75} aria-hidden="true" />
```

Para não repetir `size` e `strokeWidth` em todo lugar, crie um componente `Icon` (ou use os padrões do `LucideProvider`, se a versão do pacote oferecer) com esses valores.

## Ícones da interface

| Ação ou ideia | Ícone | Observação |
| --- | --- | --- |
| Adicionar (gasto, renda) | `plus` | No botão "Adicionar gasto". |
| Gasto (no alternador) | `minus` | O sinal reforça o tipo sem depender da cor. |
| Renda (no alternador) | `plus` | |
| Entrou | `arrow-down-left` | Seta para dentro, no cartão de saldo. |
| Saiu | `arrow-up-right` | Seta para fora. |
| Mês anterior / próximo mês | `chevron-left` / `chevron-right` | No topo do app. |
| Ver mais categorias | `chevron-down` | No chip "Mais". |
| Selecionado | `check` | Substitui o ícone da categoria no chip selecionado. |
| Fechar | `x` | Único ícone sem texto visível: leva `aria-label="Fechar"`. |
| Editar | `pencil` | |
| Excluir | `trash-2` | Sempre com o texto "Excluir…". |
| Mostrar senha / ocultar senha | `eye` / `eye-off` | Com o texto "Mostrar"/"Ocultar". |
| Privacidade, dados protegidos | `shield-check` | Aviso de privacidade. |
| Alerta | `triangle-alert` | Em `alerta`. |
| Informação | `info` | Em `ouro-texto`. |
| Erro de campo | `triangle-alert` | Em `alerta`, antes da mensagem, com borda de 2px em `alerta` no campo. |
| Data | `calendar` | Campo de data do lançamento. |
| Calculadoras | `calculator` | Navegação. |
| Painel (início) | `house` | Navegação. |
| Lançamentos | `list` | Navegação. |
| Planejamento (projeção) | `chart-column` | Navegação. |
| Baixar meus dados | `download` | Em "Seus dados". |
| Sair da conta | `log-out` | Menu da conta. |
| Configurações | `settings` | Menu da conta. |
| Tema | `sun-moon` | Em Configurações. |
| Buscar | `search` | Busca de lançamentos. |
| Link externo | `external-link` | Links para fora do app (código-fonte, política da ANPD). |

## Ícones das categorias

Cada categoria tem **um ícone fixo**, o mesmo em chips, linhas de lançamento, gráficos e relatórios. A lista completa, com o que entra em cada categoria, está em [Categorias](15-categorias.md).

| Gasto | Ícone | Renda | Ícone |
| --- | --- | --- | --- |
| Mercado | `shopping-cart` | Salário | `briefcase` |
| Restaurante | `utensils` | Freelance | `laptop` |
| Transporte | `car` | Vendas | `store` |
| Moradia | `house` | Investimentos | `trending-up` |
| Contas | `receipt` | Outros | `shapes` |
| Saúde | `heart` | 13º salário (calculadora) | `coins` |
| Educação | `book-open` | Férias (calculadora) | `tree-palm` |
| Lazer | `ticket` | Rescisão (calculadora) | `file-text` |
| Compras | `shopping-bag` | | |
| Outros | `shapes` | | |

O ícone `house` aparece em Moradia e na navegação (Painel). O contexto separa os dois: na navegação ele vem com o texto "Início"; na categoria, com "Moradia".

## Onde o ícone fica

| Contexto | Ícone | Fundo | Cor do ícone |
| --- | --- | --- | --- |
| Botão | À esquerda do texto | O do botão | A do texto do botão |
| Chip de categoria | À esquerda do nome | `superficie` (ou `ouro` quando selecionado) | `tinta` (ou `sobre-ouro`) |
| Linha de lançamento de gasto | Círculo de 44px | `superficie-funda` | `tinta` |
| Linha de lançamento de renda | Círculo de 44px | `renda-fundo` | `renda` |
| Aviso | À esquerda, alinhado à primeira linha | O do aviso | `ouro-texto` (informação) ou `alerta` |
| Rótulo "Entrou"/"Saiu" | À esquerda | — | `tinta-suave` |

## Acessibilidade

- Ícone ao lado de texto é decorativo: `aria-hidden="true"`. O leitor de tela lê só o texto.
- O único botão só com ícone é o de fechar, com `aria-label="Fechar"` e alvo de 44 × 44px.
- As setas de mês têm texto escondido por `aria-label` ("Mês anterior", "Próximo mês"), porque o nome do mês entre elas já dá o contexto visual.
- Ícones de controle precisam de 3:1 de contraste com o fundo: `tinta`, `tinta-suave`, `ouro-texto`, `renda`, `gasto` e `alerta` passam sobre todos os fundos do sistema (veja [Cores](04-cores.md#pares-de-contraste)).
- Nunca use o ícone como a única diferença entre dois estados. O chip selecionado troca o ícone **e** o fundo; o alternador troca a cor **e** a pílula.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Ícone + palavra, sempre. | Ícone sozinho como botão (exceto fechar). |
| O mesmo ícone para a mesma categoria em todo o app. | Um carrinho no chip e uma sacola na lista para Mercado. |
| Traço 1,75 e 20px. | Ícones preenchidos, duotone ou de outra biblioteca. |
| Cor herdada do texto. | Ícones coloridos por categoria. |
| `aria-hidden` no ícone decorativo. | Leitor de tela anunciando "imagem, carrinho de compras, Mercado". |
