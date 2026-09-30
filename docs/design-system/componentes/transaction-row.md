# TransactionRow (Linha de lançamento)

> Uma linha por gasto ou renda anotado: ícone da categoria, descrição, categoria com data e valor com sinal. Aparece em "Últimos lançamentos" no painel e na tela Lançamentos, agrupada por dia.

Grupo: Painel · Classe base: `md-tx` (dentro de `md-list`) · Componentes React sugeridos: `<TransactionRow />`, `<TransactionList />`, `<TransactionDayGroup />`

## Quando usar

- Para listar lançamentos já salvos: no painel (os últimos 5, com um `md-btn-ghost` "Ver todos") e na tela `/lancamentos` (todos do mês, agrupados por dia).
- Sempre que tocar no item deve abrir a edição do lançamento.

## Quando não usar

- Para totais por categoria ("Mercado: − R$ 812,40 no mês"). Um total não abre edição de um lançamento; use uma lista própria de categorias.
- Para rendas previstas pelas calculadoras (13º, férias, rescisão) que ainda não aconteceram: elas aparecem no [gráfico](income-expense-chart.md) como projeção, não na lista.
- Em tabelas com várias colunas de valores: use `<table>`.

## Anatomia

1. **Linha** (`md-tx`): um link (`<a>`) que ocupa a linha inteira e abre `/lancamentos/[id]`. Grade de três colunas (`44px 1fr auto`), vão `space-3`, altura mínima 64px, padding vertical `space-2`.
2. **Ícone** (`md-tx-icon`): círculo de 44px (`radius-pill`) com o ícone Lucide da categoria, 20px, traço 1,75.
   - Gasto: fundo `superficie-funda`, ícone em `tinta`.
   - Renda (`is-renda`): fundo `renda-fundo`, ícone em `renda`.
3. **Descrição** (`md-tx-title`): `sans` 600, 17/24, `tinta`, uma linha só, com reticências. Sem descrição, mostra o nome da categoria.
4. **Meta** (`md-tx-meta`): "Categoria · data relativa". `sans` 400, 14/20, `tinta-suave`.
5. **Valor** (`md-tx-amount`): `amount`, ou seja, `mono` (Atkinson Hyperlegible Mono) 500, 17/24, `tabular-nums`, alinhado à direita, sem quebra. `+` em `renda` ou `−` em `gasto`, e o texto escondido "Entrou" ou "Saiu".
6. **Divisória**: 1px em `veio` entre linhas, nunca depois da última.
7. **Cabeçalho de dia** (só na tela Lançamentos): "Hoje", "Ontem", "Sábado, 26 de setembro". `sans` 600, 15/20 (`label`), `tinta-suave`.

## Variantes

| Variante | Quando usar | Tokens |
| --- | --- | --- |
| Gasto | Lançamento de saída | Ícone `tinta` sobre `superficie-funda`; valor `gasto` com `−` |
| Renda (`is-renda` no ícone, `md-in` no valor) | Lançamento de entrada | Ícone `renda` sobre `renda-fundo`; valor `renda` com `+` |
| Lista simples (`md-list`) | Painel, "Últimos lançamentos" | Meta com categoria e data |
| Lista por dia | Tela Lançamentos | Cabeçalho de dia; meta só com a categoria |

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Como na Anatomia | | |
| Hover | Fundo `superficie-funda` na linha, cantos `radius-md` | `superficie-funda` | Troca em `duracao-rapida` |
| Foco | Anel de 2px em `foco`, afastado 2px | `foco` (5,98:1 sobre `superficie` no claro) | `:focus-visible` no link |
| Pressionado | Mesmo fundo do hover | `superficie-funda` | |
| Recém-salvo | Reflexo `brilho` atravessa a linha uma vez | `brilho`, `duracao-toque` | Classe `md-brilho`; veja [GoldenTouch](golden-touch.md) |
| Carregando | 3 linhas-esqueleto de 64px: círculo e duas barras em `superficie-funda` | `superficie-funda` | `aria-busy="true"` na lista |
| Vazio | Sem lista; [EmptyState](empty-state.md) com "Adicionar gasto" | | |
| Erro de rede | Sem lista; frase "Não foi possível carregar seus lançamentos." em `tinta-suave` | `tinta-suave` | O [Notice](notice.md) de alerta no topo traz "Tentar de novo" |

A linha não tem estado desabilitado nem selecionado.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Altura mínima da linha (alvo de toque) | 64px | acima de `space-12` |
| Padding vertical | 8px | `space-2` |
| Colunas | `44px 1fr auto` | |
| Vão entre colunas | 12px | `space-3` |
| Círculo do ícone | 44 × 44px | `radius-pill` |
| Ícone | 20px, traço 1,75 | |
| Descrição | 17/24, 600 | (`body` em 600, entrelinha 24) |
| Meta | 14/20, 400 | `caption` |
| Valor | 17/24, 500, mono | `amount` |
| Divisória | 1px | `veio` |
| Hover (recuo do fundo) | 8px para cada lado | `space-2` |
| Cabeçalho de dia | 15/20, 600; 24px acima, 4px abaixo | `label`, `space-6`, `space-1` |

## Tokens usados

| Token | Onde |
| --- | --- |
| `tinta` | Descrição; ícone de gasto |
| `tinta-suave` | Meta; cabeçalho de dia |
| `superficie-funda` | Fundo do ícone de gasto; hover; esqueleto |
| `renda`, `renda-fundo` | Ícone e valor de renda |
| `gasto` | Valor de gasto |
| `veio` | Divisória |
| `foco` | Anel de foco |
| `brilho`, `duracao-toque` | Linha recém-salva |
| `duracao-rapida` | Transição do hover |

## Conteúdo

- **Descrição**: o que a pessoa escreveu, como escreveu. Sem descrição, o nome da categoria ("Mercado").
- **Meta**: "Categoria · data". Datas: "hoje", "ontem", depois "5 set" (mês abreviado, minúsculo, sem ponto). De outro ano: "5 set 2025". Na lista por dia, a data já está no cabeçalho, então a meta fica só com a categoria.
- **Valor**: sempre com sinal e espaços inseparáveis: `+ R$ 5.400,00`, `− R$ 127,90`. Sinal de menos U+2212.
- **Cabeçalho de dia**: "Hoje", "Ontem", depois o dia da semana sem "-feira", com inicial maiúscula: "Sábado, 26 de setembro". De outro ano: "Sexta, 26 de setembro de 2025".
- **Ícones de categoria** (fixos): Mercado `shopping-cart`, Restaurante `utensils`, Moradia `house`, Transporte `car`, Contas `receipt`, Saúde `heart`, Educação `book-open`, Lazer `ticket`, Compras `shopping-bag`, Outros `shapes`; Salário `briefcase`, Freelance `laptop`, Vendas `store`, Investimentos `trending-up`, Outros `shapes`; 13º salário `coins`, Férias `tree-palm`, Rescisão `file-text`.

| Faça | Evite |
| --- | --- |
| "Almoço com a família" / "Restaurante · 3 set" | "ALMOÇO C/ FAMÍLIA" / "Restaurante - 03/09/2026" |
| `− R$ 86,00` | `R$ -86,00`, `-86` |
| "Quarta, 30 de setembro" | "Quarta-feira, 30/09" |
| Categoria como descrição quando não há texto | Linha com descrição vazia |

## Acessibilidade

- **Semântica.** `<ul>` com `aria-label` ("Últimos lançamentos") ou dentro de uma seção com título. Cada `<li>` contém um único `<a href="/lancamentos/[id]">`. A linha inteira é o alvo (64px de altura), sem botões dentro dela.
- **Nome do link.** Vem do conteúdo, na ordem visual. O leitor de tela anuncia, por exemplo: "Mercado do bairro, Mercado, hoje, Saiu R$ 127,90, link". Para isso:
  - o ícone tem `aria-hidden="true"`;
  - o ponto do meio "·" fica em `<span aria-hidden="true">`, seguido de uma vírgula escondida (`md-sr`), para não ser lido como "ponto";
  - o sinal do valor fica em `<span aria-hidden="true">` e entra o texto escondido "Entrou" ou "Saiu";
  - a data abreviada ganha a forma por extenso para o leitor de tela: `<span aria-hidden="true">5 set</span><span class="md-sr">5 de setembro</span>`.
- **Descrição cortada.** As reticências são só visuais (`text-overflow: ellipsis`). O texto completo continua no DOM e o leitor de tela lê o nome inteiro. Nunca corte a descrição em JavaScript. O nome completo também aparece na tela de edição.
- **Teclado.** Tab passa de linha em linha; Enter abre a edição. O anel de foco aparece por fora da linha.
- **Cabeçalhos de dia** são títulos reais (`<h2>` na tela Lançamentos, ou o nível seguinte ao título da página), para que a pessoa pule de dia em dia.
- **Contraste** (claro / escuro, sobre `superficie`): descrição `tinta` 15,51 / 14,59; meta `tinta-suave` 6,81 / 8,44; `renda` 6,54 / 8,69; `gasto` 6,11 / 7,53. Ícone de renda: `renda` sobre `renda-fundo` 5,51 / 7,21. Ícone de gasto: `tinta` sobre `superficie-funda` 12,79 / 13,09.
- **Não só cor.** Entrada e saída têm sinal, texto escondido e ícone de categoria diferente; a cor é reforço.
- **Movimento.** O reflexo da linha recém-salva some com `prefers-reduced-motion`: a linha só aparece. O hover não anima.

## Comportamento responsivo

- A descrição encolhe primeiro (`min-width: 0` e reticências); o valor nunca quebra nem encolhe.
- Espaço real num celular de 360px, com um valor de `− R$ 1.650,00` (cerca de 133px em mono 17px): dentro de um `md-card` do painel (padding `space-6`), sobram uns 80px para a descrição; na tela Lançamentos, onde a lista fica direto sobre o `marmore` com a margem lateral `space-4`, sobram uns 125px. Por isso a lista completa não vai dentro de cartão, e o painel mostra só os últimos 5.
- Com zoom de texto de 200%, a linha cresce na altura; o ícone continua centralizado na vertical.
- Em telas largas, a lista não passa de 640px de largura, para o valor não ficar longe da descrição.

## Casos-limite

- **Descrição longa**: uma linha com reticências; nome completo no DOM.
- **Sem descrição**: a descrição é o nome da categoria; a meta mostra a categoria de novo ("Mercado" / "Mercado · hoje"). Aceite a repetição: a linha fica com a mesma forma de todas as outras.
- **Categoria apagada ou desconhecida**: use "Outros" com `shapes`.
- **Valor enorme** (`− R$ 125.000,00`): cabe; a descrição encolhe. Nunca abrevie valor na lista.
- **Valor zero**: não existe (o formulário pede "Digite um valor maior que zero").
- **Lançamento com data futura**: aparece no dia dele, com o cabeçalho "Quinta, 15 de outubro".
- **Muitos lançamentos**: a tela Lançamentos mostra o mês escolhido no AppHeader; não use rolagem infinita entre meses.
- **Linha recém-salva**: entra no topo do seu dia com `md-brilho`. É por ela que a pessoa desfaz: tocar na linha abre a edição (o aviso "Anotado" não tem botão).

## Referência HTML

Marcação do protótipo corrigida: a linha é um link, o sinal é escondido e a data tem forma por extenso. SVGs resumidos.

```html
<ul class="md-list" aria-label="Últimos lançamentos">
  <li>
    <a class="md-tx" href="/lancamentos/9f3c">
      <span class="md-tx-icon"><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><!-- shopping-cart --><path d="…"/></svg></span>
      <span class="md-tx-main">
        <span class="md-tx-title">Mercado do bairro</span>
        <span class="md-tx-meta">Mercado<span aria-hidden="true"> · </span><span class="md-sr">, </span>hoje</span>
      </span>
      <span class="md-tx-amount md-out"><span class="md-sr">Saiu </span><span aria-hidden="true">− </span>R$ 127,90</span>
    </a>
  </li>
  <li>
    <a class="md-tx" href="/lancamentos/7a21">
      <span class="md-tx-icon is-renda"><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><!-- briefcase --><path d="…"/></svg></span>
      <span class="md-tx-main">
        <span class="md-tx-title">Salário</span>
        <span class="md-tx-meta">Salário<span aria-hidden="true"> · </span><span class="md-sr">, </span><span aria-hidden="true">5 set</span><span class="md-sr">5 de setembro</span></span>
      </span>
      <span class="md-tx-amount md-in"><span class="md-sr">Entrou </span><span aria-hidden="true">+ </span>R$ 5.400,00</span>
    </a>
  </li>
</ul>

<!-- Tela Lançamentos: agrupada por dia -->
<section aria-labelledby="dia-2026-09-26">
  <h2 class="md-dia" id="dia-2026-09-26">Sábado, 26 de setembro</h2>
  <ul class="md-list">
    <li><a class="md-tx" href="/lancamentos/51b0">…<span class="md-tx-meta">Restaurante</span>…</a></li>
  </ul>
</section>
```

## Referência CSS

```css
.md-list { list-style: none; margin: 0; padding: 0; }
.md-tx { display: grid; grid-template-columns: 44px 1fr auto; gap: var(--space-3); align-items: center; min-height: 64px; padding: var(--space-2) 0; }
.md-tx-icon { width: 44px; height: 44px; border-radius: var(--radius-pill); display: grid; place-items: center; background: var(--superficie-funda); color: var(--tinta); }
.md-tx-icon.is-renda { background: var(--renda-fundo); color: var(--renda); }
.md-tx-main { min-width: 0; }
.md-tx-title { display: block; font: 600 17px/24px var(--font-sans); color: var(--tinta); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.md-tx-meta { font: 400 14px/20px var(--font-sans); color: var(--tinta-suave); }
.md-tx-amount { font: 500 17px/24px var(--font-mono); font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.md-in { color: var(--renda); }
.md-out { color: var(--gasto); }

/* Ajustes: a divisória sai do .md-tx (agora um link dentro do li) e vai para o li */
.md-list > li { border-bottom: 1px solid var(--veio); }
.md-list > li:last-child { border-bottom: 0; }
a.md-tx { color: inherit; text-decoration: none; margin-inline: calc(-1 * var(--space-2)); padding-inline: var(--space-2); border-radius: var(--radius-md); transition: background var(--duracao-rapida) ease; }
a.md-tx:hover, a.md-tx:active { background: var(--superficie-funda); }
a.md-tx:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px; }
.md-dia { margin: var(--space-6) 0 var(--space-1); font: 600 15px/20px var(--font-sans); color: var(--tinta-suave); }
@media (prefers-reduced-motion: reduce) { a.md-tx { transition: none; } }
```

No protótipo, a divisória está no `.md-tx` com `.md-tx:last-child`. Com o link dentro do `<li>`, o `:last-child` passa a valer para todo link, e nenhuma divisória apareceria; por isso a regra vai para o `<li>`.

## Implementação no app

Base: nenhum componente shadcn; `Link` do Next.js e ícones do `lucide-react`. Utilitários sugeridos: `formatMoney` em `src/lib/money.ts` e `formatShortDate` / `formatDayHeading` em `src/lib/dates.ts`.

```ts
// Props sugeridas
export type TransactionKind = "expense" | "income";

export interface TransactionRowProps {
  id: string;
  kind: TransactionKind;
  /** Texto da pessoa; vazio usa o nome da categoria. */
  description: string | null;
  category: { name: string; icon: LucideIcon };
  /** Data do lançamento (sem hora), ISO "2026-09-26". */
  date: string;
  /** Centavos inteiros, sempre > 0; o tipo decide o sinal. */
  amountCents: number;
  /** Omitir a data na meta (lista agrupada por dia). */
  hideDate?: boolean;
  /** Linha recém-salva: aplica o reflexo uma vez. */
  justSaved?: boolean;
}
```

```tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatShortDate } from "@/lib/dates";

export function TransactionRow(p: TransactionRowProps) {
  const Icon = p.category.icon;
  const isIncome = p.kind === "income";
  const date = formatShortDate(p.date); // { short: "5 set", long: "5 de setembro" }

  return (
    <li className="border-b border-veio last:border-b-0">
      <Link
        href={`/lancamentos/${p.id}`}
        className={`-mx-2 grid min-h-[64px] grid-cols-[44px_1fr_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors duration-(--duracao-rapida) hover:bg-superficie-funda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco motion-reduce:transition-none ${p.justSaved ? "md-brilho" : ""}`}
      >
        <span className={`grid size-[44px] place-items-center rounded-pill ${isIncome ? "bg-renda-fundo text-renda" : "bg-superficie-funda text-tinta"}`}>
          <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body/6 font-semibold text-tinta">
            {p.description?.trim() || p.category.name}
          </span>
          <span className="text-caption text-tinta-suave">
            {p.category.name}
            {!p.hideDate && (
              <>
                <span aria-hidden="true"> · </span><span className="sr-only">, </span>
                <span aria-hidden="true">{date.short}</span><span className="sr-only">{date.long}</span>
              </>
            )}
          </span>
        </span>
        <span className={`whitespace-nowrap text-right font-mono text-amount font-medium tabular-nums ${isIncome ? "text-renda" : "text-gasto"}`}>
          <span className="sr-only">{isIncome ? "Entrou " : "Saiu "}</span>
          <span aria-hidden="true">{isIncome ? "+" : "−"}&nbsp;</span>
          {formatMoney(p.amountCents, { sign: "never" })}
        </span>
      </Link>
    </li>
  );
}
```

```tsx
// Tela Lançamentos: grupos por dia
export function TransactionDayGroup({ date, children }: { date: string; children: React.ReactNode }) {
  const id = `dia-${date}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mt-6 mb-1 text-label font-semibold text-tinta-suave">{formatDayHeading(date)}</h2>
      <ul className="m-0 list-none p-0">{children}</ul>
    </section>
  );
}
```

Notas:

- `formatShortDate` devolve "hoje", "ontem" ou "5 set"; na forma longa, "hoje", "ontem" ou "5 de setembro". Não use `Intl.DateTimeFormat` com `month: "short"` direto: em pt-BR ele produz "set." com ponto. Use uma lista fixa de abreviações ("jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez").
- `formatDayHeading` devolve "Hoje", "Ontem" ou "Sábado, 26 de setembro": pegue o dia da semana com `Intl.DateTimeFormat("pt-BR", { weekday: "long" })`, tire o "-feira" e ponha a inicial maiúscula.
- Compare datas no fuso da pessoa (o lançamento guarda só o dia). "Hoje" muda à meia-noite local.
- Ordem: dias do mais recente para o mais antigo; dentro do dia, o último salvo primeiro.
- A `key` de cada linha é o `id` do lançamento.
- `justSaved` vem do retorno da ação de salvar (por exemplo, um parâmetro de busca ou estado); tire a classe depois de `duracao-toque`.

## Faça e evite

| Faça | Evite |
| --- | --- |
| A linha inteira como um link | Um ícone de lápis pequeno como único alvo |
| Sinal visual escondido + "Entrou"/"Saiu" escondido | Só cor para diferenciar entrada e saída |
| Reticências em uma linha | Descrição quebrando em várias linhas e empurrando o valor |
| Divisória só entre linhas | Divisória também depois da última |
| Cabeçalho de dia como título (`h2`) | Cabeçalho de dia como texto solto |

## Relacionados

- Componentes: [GoldenTouch](golden-touch.md), [BalanceCard](balance-card.md), [EmptyState](empty-state.md), [Button](button.md), [CategoryChip](category-chip.md), [AppHeader](app-header.md).
- Fundamentos: [Categorias](../15-categorias.md), [Iconografia](../09-iconografia.md), [Tipografia](../05-tipografia.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Movimento](../10-movimento.md), [Padrões de tela](../17-padroes-de-tela.md).
