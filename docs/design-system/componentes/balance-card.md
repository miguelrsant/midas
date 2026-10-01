# BalanceCard (Cartão de saldo)

> Cartão no topo do painel que responde "quanto sobrou?": o saldo do mês em destaque, quanto entrou, quanto saiu e quanto da renda já foi gasto.

Grupo: Painel · Classe base: `md-card md-marmore` + `md-balance` · Componente React sugerido: `<BalanceCard />`

## Quando usar

- No topo do painel (`/`), logo abaixo da saudação do [AppHeader](app-header.md), uma vez por tela.
- Para o mês exibido no seletor de mês: o mês atual (valores "até agora") ou um mês já fechado.

## Quando não usar

- Fora do painel. Resumos em outras telas (categoria, resumo do mês) usam um `md-card` liso, sem mármore e sem `display-xl`.
- Para comemorar o mês fechado: isso é papel do [Achievement](achievement.md). Nos dias em que a conquista aparece no painel, ela fica acima do cartão de saldo e fica com o mármore; o cartão de saldo passa para a variante lisa e mostra o mês atual.
- Em listas ou repetido por mês. O mármore aparece em no máximo uma superfície por tela ([07-marmore-e-texturas](../07-marmore-e-texturas.md)).

## Anatomia

1. **Contêiner**: `<section>` com `md-card md-marmore`. Fundo `superficie` + textura de mármore (Calacatta ou Portoro) + `veu` por cima. Raio `radius-lg`, sombra `sombra-cartao`, padding `space-6`. É o único cartão com textura na tela. Nos dias da conquista, o contêiner é só `md-card` (fundo `superficie`, sem textura nem véu).
2. **Sobretítulo** (`md-eyebrow`): "Sobrou em setembro" ou "Faltou em setembro". `sans` 600, 14/20, maiúsculas, espaçamento `.06em`, `tinta-suave`. Dá nome à seção (`aria-labelledby`).
3. **Saldo** (`md-balance`): `display-xl`, ou seja, `classica` (Cormorant Garamond) 700, 48/52, `lining-nums tabular-nums`, em `tinta`. Com saldo negativo, em `gasto` e com sinal `−`. É o único número desse tamanho na tela.
4. **Entrou / Saiu** (`md-split`): lista de definição (`<dl>`) em duas colunas, com linha `veio` de 1px em cima.
   - Termo (`dt`): ícone `arrow-down-left` (Entrou) ou `arrow-up-right` (Saiu), 20px, + palavra. `sans` 400, 14/20, `tinta-suave`.
   - Valor (`dd`): `mono` (Atkinson Hyperlegible Mono) 500, 19/26, `tabular-nums`. Entrou em `renda` com `+`; Saiu em `gasto` com `−`.
5. **Barra** (`md-meter`): trilha de 8px em `superficie-funda`, preenchimento em `ouro`, cantos `radius-pill`. Decorativa (`aria-hidden="true"`).
6. **Frase da barra** (`md-help`): diz em palavras o que a barra mostra. `sans` 400, 14/20, `tinta-suave`.

## Variantes

| Variante | Quando usar | Tokens |
| --- | --- | --- |
| Sobrou (padrão) | Saldo maior ou igual a zero | Saldo em `tinta`, sem sinal |
| Faltou | Saldo negativo | Saldo em `gasto`, com `−`; sobretítulo "Faltou em …" |
| Mês atual | O mês exibido é o mês corrente | Mesmo visual; textos com "até agora". Se ainda faltam fixos ou rendas previstas no mês, um bloco em `superficie-funda` com o sobretítulo "Até o fim de outubro", as linhas "Ainda vai entrar + R$ …" e "Ainda vai sair − R$ …" (ícone `clock`, valor em `amount`) e, embaixo de um veio, "Deve sobrar cerca de R$ 2.476." (ou "Pode faltar"). Quem só cadastrou fixos não vê só R$ 0,00 |
| Mês fechado | Mês anterior ao atual | Mesmo visual; textos no passado, sem "até agora" |
| Sem renda | Nenhuma renda anotada no mês | Sem barra; frase pede a renda |
| Liso (`md-card` sem `md-marmore`) | Dias 1 a 7 do mês, enquanto o [Achievement](achievement.md) aparece acima dele | Fundo `superficie`, sem textura nem véu; o resto igual |

A tela só pode ter uma superfície com mármore: nos dias da conquista ela é da conquista; nos outros, do cartão de saldo. Não há outra variante de cor nem de tamanho. O cartão não é clicável.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Saldo, Entrou/Saiu, barra e frase | ver Anatomia | |
| Saldo negativo | "Faltou em setembro", `− R$ 210,00` em `gasto` | `gasto` (5,13:1 no claro e 5,26:1 no escuro sobre o véu) | Sem acento dourado, sem bronca |
| Gasto acima da renda | Barra cheia (100%) | `ouro` | Frase: "Você gastou mais do que entrou este mês." |
| Sem renda | Sem barra | | Frase: "Anote sua renda para ver quanto já foi gasto." |
| Carregando | Mesmo tamanho, blocos em `superficie-funda` no lugar dos números | `superficie-funda`, `radius-sm` | `aria-busy="true"` no `<section>`; sem animação de pulso com movimento reduzido |
| Erro de rede | Sobretítulo mantido; no lugar do saldo e de Entrou/Saiu, a frase "Não foi possível carregar o saldo." em `tinta-suave`, sem barra | `tinta-suave` | O [Notice](notice.md) de alerta no topo da tela diz o que fazer e traz "Tentar de novo". Nunca mostre R$ 0,00 quando o dado não chegou |

Não há hover, foco nem estado pressionado: o cartão não é interativo.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Padding do cartão | 24px | `space-6` |
| Raio | 16px | `radius-lg` |
| Sobretítulo | 14/20, 600, `.06em` | `caption` + `md-eyebrow` |
| Saldo | 48/52, 700 | `display-xl` |
| Margem do saldo | 8px em cima, 24px embaixo | `space-2`, `space-6` |
| Colunas Entrou/Saiu | 2 × `1fr`, vão de 16px; empilhadas (vão de 8px) abaixo de 340px de largura útil | `space-4`, `space-2` |
| Linha acima de Entrou/Saiu | 1px, padding de 16px abaixo | `veio`, `space-4` |
| Vão ícone–palavra | 4px | `space-1` |
| Valor Entrou/Saiu | 19/26, 500 | (fora da escala; veja Referência CSS) |
| Barra | 8px de altura, 16px acima | `space-4` |
| Frase da barra | 14/20, 8px acima | `caption`, `space-2` |
| Largura máxima | 420px no protótipo; no app, a largura da coluna do painel | |

## Tokens usados

| Token | Onde |
| --- | --- |
| `superficie`, `veu`, textura | Fundo do cartão (`md-marmore`); só `superficie` na variante lisa |
| `sombra-cartao`, `radius-lg`, `space-6` | Cartão |
| `tinta` | Saldo positivo |
| `tinta-suave` | Sobretítulo, termos Entrou/Saiu, frase da barra |
| `renda` | Valor de Entrou |
| `gasto` | Valor de Saiu; saldo negativo |
| `veio` | Linha acima de Entrou/Saiu |
| `superficie-funda` | Trilha da barra; esqueleto de carregamento |
| `ouro` | Preenchimento da barra |
| `classica`, `sans`, `mono` | Saldo; textos; valores |

## Conteúdo

- Sobretítulo: "Sobrou em {mês}" ou "Faltou em {mês}", mês por extenso e minúsculo. No mês atual: "Sobrou em setembro até agora".
- Saldo positivo sem sinal (o sobretítulo já diz que sobrou): `R$ 1.842,10`. Negativo com `−`: `− R$ 210,00`. Saldo zero: "Sobrou em setembro", `R$ 0,00`.
- Entrou/Saiu sempre com sinal: `+ R$ 6.200,00`, `− R$ 4.357,90`. Valor zero sem sinal: `R$ 0,00`.
- Frase da barra, por caso:

| Caso | Frase |
| --- | --- |
| Mês atual, gasto ≤ renda | "Você usou 70% do que entrou este mês." |
| Mês fechado, gasto ≤ renda | "Você usou 70% do que entrou em agosto." |
| Gasto = renda | "Você usou tudo o que entrou este mês." |
| Gasto > renda | "Você gastou mais do que entrou este mês." (ou "… em agosto.") |
| Sem renda | "Anote sua renda para ver quanto já foi gasto." |
| Gasto zero | "Você ainda não anotou gastos este mês." |

- Percentual: arredonde para baixo (`Math.floor`), para nunca mostrar "100%" quando ainda sobra algo. Abaixo de 1%, escreva "menos de 1%".

| Faça | Evite |
| --- | --- |
| "Faltou em setembro" | "Saldo negativo", "Déficit" |
| "Entrou" / "Saiu" | "Receitas" / "Débitos" |
| "Você gastou mais do que entrou este mês." | "Atenção! Você estourou o orçamento!" |
| `− R$ 210,00` | `-R$ 210,00` (hífen, sem espaço) |

## Acessibilidade

- **Semântica.** `<section aria-labelledby>` apontando para o sobretítulo: o leitor de tela anuncia a região "Sobrou em setembro". Entrou/Saiu é um `<dl>` real: "Entrou, + R$ 6.200,00".
- **Sinais.** Nos valores de Entrou/Saiu e no saldo negativo, o sinal fica em `<span aria-hidden="true">`. Aqui **não** entra o texto escondido "Entrou"/"Saiu" da regra geral de valores, porque o `dt` e o sobretítulo já dizem isso; repetir faria o leitor dizer "Entrou, Entrou R$ 6.200,00".
- **Barra (correção do protótipo).** A marcação de referência usa `role="img"` com `aria-label="70% da renda já foi gasta"` na barra, e a frase logo abaixo diz o mesmo. Resultado: o leitor de tela anuncia a mesma informação duas vezes, com palavras diferentes. No app, a barra leva `aria-hidden="true"` e nenhum `role`; a frase é a única fonte da informação. Não use `<progress>` nem `role="progressbar"`: a barra não é progresso de tarefa.
- **Ícones** `arrow-down-left` e `arrow-up-right`: `aria-hidden="true"`, sempre com a palavra ao lado. Entrada e saída se distinguem por palavra, ícone e sinal, não só por cor.
- **Contraste sobre o mármore com véu (pior caso).** Calacatta: `tinta` 13,02:1, `tinta-suave` 5,72:1, `renda` 5,49:1, `gasto` 5,13:1. Portoro: 10,19 / 5,90 / 6,07 / 5,26. Na variante lisa, sobre `superficie`: `tinta` 15,51 / 14,59, `tinta-suave` 6,81 / 8,44, `renda` 6,54 / 8,69, `gasto` 6,11 / 7,53 (claro / escuro). A barra é decorativa, então o contraste de `ouro` (2,10:1 sobre `superficie-funda` no claro) não carrega informação.
- **Leitura completa** (mês atual): "Região Sobrou em setembro até agora. R$ 1.842,10. Lista com 2 itens. Entrou, + R$ 6.200,00. Saiu, − R$ 4.357,90. Você usou 70% do que entrou este mês."
- **Mudança de mês.** Quando a pessoa troca o mês no AppHeader, o nome do mês é anunciado lá (`aria-live`). O cartão não tem `aria-live` próprio, para não anunciar tudo de novo.
- **Movimento.** Sem animação. A barra não "enche" ao carregar.

## Comportamento responsivo

- O cartão ocupa a largura da coluna do painel (margem lateral `space-4` no celular).
- **Entrou/Saiu.** Em 19px mono, `+ R$ 6.200,00` ocupa cerca de 150px. Duas colunas só cabem com uns 340px de largura útil (cartão de 388px). Num celular de 360px, a largura útil é 280px (360 − 2 × 16 de margem − 2 × 24 de padding), então Entrou e Saiu empilham: cada item vira uma linha, com o termo à esquerda e o valor à direita, vão `space-2`. A partir de 340px de largura útil, voltam as duas colunas do protótipo. Use container query no cartão, não o tamanho da tela.
- **Saldo.** `R$ 1.842,10` em `display-xl` ocupa cerca de 235px e cabe nos 280px. Para valores maiores, veja Casos-limite.
- Com zoom de texto de 200%, os itens de Entrou/Saiu já estão empilhados e o saldo desce para 34/40 pela mesma regra de largura.

## Casos-limite

- **Valores grandes.** O saldo nunca quebra linha (`white-space: nowrap`). A partir de `R$ 100.000,00`, com menos de 360px de largura útil, o saldo desce para 34/40 (tamanho de `display-lg`), mantendo `classica` 700. Continua sendo o maior número da tela.
- **Saldo zero.** "Sobrou em setembro", `R$ 0,00` em `tinta`, barra cheia, "Você usou tudo o que entrou este mês."
- **Gasto acima da renda.** Barra em 100% (nunca passa da trilha), frase "Você gastou mais do que entrou este mês." e saldo em "Faltou".
- **Mês sem renda, com gastos.** Saldo negativo ("Faltou"), Entrou `R$ 0,00`, sem barra, frase "Anote sua renda para ver quanto já foi gasto."
- **Mês sem nada.** `R$ 0,00` em tudo, sem barra, a mesma frase de renda. A lista abaixo mostra o [EmptyState](empty-state.md).
- **Centavos.** Some em centavos inteiros; o saldo é `renda − gasto` calculado em centavos, nunca em ponto flutuante.
- **Mês futuro.** A troca de mês não chega a meses futuros; projeções ficam no [gráfico](income-expense-chart.md) e no Planejamento.

## Referência HTML

Marcação do protótipo já corrigida (barra decorativa, sinais escondidos, ids únicos). Caminhos SVG resumidos.

```html
<section class="md-card md-marmore md-balance-card" aria-labelledby="saldo-titulo">
  <h2 class="md-eyebrow" id="saldo-titulo">Sobrou em setembro até agora</h2>
  <p class="md-balance">R$ 1.842,10</p>
  <dl class="md-split">
    <div>
      <dt><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>Entrou</dt>
      <dd class="md-in"><span aria-hidden="true">+ </span>R$ 6.200,00</dd>
    </div>
    <div>
      <dt><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>Saiu</dt>
      <dd class="md-out"><span aria-hidden="true">− </span>R$ 4.357,90</dd>
    </div>
  </dl>
  <div class="md-meter" aria-hidden="true"><span class="w-[70%]"></span></div>
  <p class="md-help md-meter-frase">Você usou 70% do que entrou este mês.</p>
</section>

<!-- Saldo negativo -->
<h2 class="md-eyebrow" id="saldo-titulo">Faltou em setembro</h2>
<p class="md-balance md-out"><span aria-hidden="true">− </span>R$ 210,00</p>
```

O sobretítulo virou `<h2>` para entrar na navegação por títulos; o estilo continua o de `md-eyebrow` (zere a margem padrão do `h2`). A partir de `R$ 100.000,00`, some `is-grande` ao `md-balance`.

## Referência CSS

```css
.md-card { background: var(--superficie); border-radius: var(--radius-lg); box-shadow: var(--sombra-cartao); padding: var(--space-6); }
.md-marmore { background: linear-gradient(var(--veu), var(--veu)), var(--textura) center / cover no-repeat, var(--superficie); }
.md-eyebrow { font: 600 14px/20px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; color: var(--tinta-suave); }
.md-balance { font: 700 48px/52px var(--font-classica); font-variant-numeric: lining-nums tabular-nums; color: var(--tinta); margin: var(--space-2) 0 var(--space-6); }
.md-split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); border-top: 1px solid var(--veio); padding-top: var(--space-4); }
.md-split dt { font: 400 14px/20px var(--font-sans); color: var(--tinta-suave); display: flex; align-items: center; gap: var(--space-1); }
.md-split dd { margin: 0; font: 500 19px/26px var(--font-mono); font-variant-numeric: tabular-nums; }
.md-in { color: var(--renda); }
.md-out { color: var(--gasto); }
.md-meter { height: 8px; border-radius: var(--radius-pill); background: var(--superficie-funda); overflow: hidden; margin-top: var(--space-4); }
.md-meter > span { display: block; height: 100%; background: var(--ouro); border-radius: inherit; }
.md-help { font: 400 14px/20px var(--font-sans); color: var(--tinta-suave); }

/* Ajustes desta documentação */
h2.md-eyebrow { margin: 0; }
.md-balance-card { container-type: inline-size; } /* no <section>, com ou sem md-marmore */
@container (max-width: 339px) {
  .md-split { grid-template-columns: 1fr; gap: var(--space-2); }
  .md-split > div { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
}
@container (max-width: 359px) {
  .md-balance.is-grande { font-size: 34px; line-height: 40px; }
}
.md-balance, .md-split dd { white-space: nowrap; }
.md-meter-frase { margin: var(--space-2) 0 0; }
.md-balance.md-out { color: var(--gasto); }
```

O valor de Entrou/Saiu usa 19/26, que não está na escala de tipos (`amount` é 17/24). Mantenha 19/26 como no `bundle.css`: é um valor de destaque, maior que os da lista.

## Implementação no app

Base: nenhum componente shadcn é necessário; é um `<section>` com classes. `formatMoney` e o cálculo ficam em `src/lib/money.ts`.

```ts
// src/components/midas/balance-card.tsx (props sugeridas)
export interface BalanceCardProps {
  /** Nome do mês por extenso, minúsculo: "setembro". */
  monthName: string;
  /** true no mês corrente: textos com "até agora" e "este mês". */
  isCurrentMonth: boolean;
  /** Totais do mês em centavos inteiros, sempre >= 0. */
  incomeCents: number;
  expenseCents: number;
  /** true nos dias em que a conquista aparece no painel: ela fica com o mármore. */
  plain?: boolean;
}
```

```tsx
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/money";

export function BalanceCard({ monthName, isCurrentMonth, incomeCents, expenseCents, plain = false }: BalanceCardProps) {
  const balance = incomeCents - expenseCents;
  const negative = balance < 0;
  const when = isCurrentMonth ? "este mês" : `em ${monthName}`;
  const big = Math.abs(balance) >= 10_000_000; // R$ 100.000,00
  const pct = incomeCents > 0 ? Math.floor((expenseCents / incomeCents) * 100) : null;

  const sentence =
    incomeCents === 0 ? "Anote sua renda para ver quanto já foi gasto."
    : expenseCents === 0 ? `Você ainda não anotou gastos ${when}.`
    : expenseCents > incomeCents ? `Você gastou mais do que entrou ${when}.`
    : expenseCents === incomeCents ? `Você usou tudo o que entrou ${when}.`
    : `Você usou ${pct! < 1 ? "menos de 1" : pct}% do que entrou ${when}.`;

  return (
    <section aria-labelledby="saldo-titulo" className={`@container rounded-lg p-6 shadow-cartao ${plain ? "bg-superficie" : "md-marmore"}`}>
      <h2 id="saldo-titulo" className="m-0 text-caption font-semibold uppercase tracking-[0.06em] text-tinta-suave">
        {negative ? "Faltou" : "Sobrou"} em {monthName}{isCurrentMonth && " até agora"}
      </h2>
      <p className={`mt-2 mb-6 whitespace-nowrap font-classica font-bold lining-nums tabular-nums ${big ? "text-display-lg @[360px]:text-display-xl" : "text-display-xl"} ${negative ? "text-gasto" : "text-tinta"}`}>
        {negative && <span aria-hidden="true">−&nbsp;</span>}
        {formatMoney(Math.abs(balance), { sign: "never" })}
      </p>
      <dl className="grid grid-cols-1 gap-2 border-t border-veio pt-4 @[340px]:grid-cols-2 @[340px]:gap-4">
        <div className="flex items-center justify-between gap-2 @[340px]:block">
          <dt className="flex items-center gap-1 text-caption text-tinta-suave">
            <ArrowDownLeft aria-hidden="true" size={20} strokeWidth={1.75} />Entrou
          </dt>
          <dd className="m-0 whitespace-nowrap font-mono text-[1.1875rem]/[1.625rem] font-medium tabular-nums text-renda">
            <SignedValue cents={incomeCents} sign="+" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 @[340px]:block">
          <dt className="flex items-center gap-1 text-caption text-tinta-suave">
            <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.75} />Saiu
          </dt>
          <dd className="m-0 whitespace-nowrap font-mono text-[1.1875rem]/[1.625rem] font-medium tabular-nums text-gasto">
            <SignedValue cents={expenseCents} sign="−" />
          </dd>
        </div>
      </dl>
      {pct !== null && (
        <Bar percent={pct} tone="ouro" className="mt-4" />
      )}
      <p className="mt-2 mb-0 text-caption text-tinta-suave">{sentence}</p>
    </section>
  );
}

/** Sinal visual escondido do leitor de tela; zero sai sem sinal. */
function SignedValue({ cents, sign }: { cents: number; sign: "+" | "−" }) {
  return (
    <>
      {cents > 0 && <span aria-hidden="true">{sign}&nbsp;</span>}
      {formatMoney(cents, { sign: "never" })}
    </>
  );
}
```

Notas:

- A barra é o componente [Bar](bar.md): a largura vem de uma classe pronta (`w-[70%]`), nunca de `style=""`, que a CSP do Midas bloqueia quando vem do servidor.
- As regras de largura usam container queries do Tailwind v4 (`@container` no cartão, variantes `@[340px]:` e `@[360px]:`), que medem a largura útil do cartão. O saldo só desce para 34/40 quando passa de `R$ 100.000,00` e falta largura.
- `formatMoney(cents, { sign: "never" })` devolve `R$ 1.842,10` com espaço inseparável (U+00A0).
- O id `saldo-titulo` só pode existir uma vez por página; se o cartão for reutilizado, gere o id com `useId()`.
- Os totais vêm do servidor já em centavos. O componente não busca dados.
- A textura por tema vem da classe global `md-marmore`, que troca `--textura` com `data-theme="dark"`.
- O painel decide `plain` com a mesma regra que mostra a conquista (`shouldShowAchievement`, em [Achievement](achievement.md#implementação-no-app)): `<BalanceCard plain={showAchievement} … />`.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Uma frase que diga o que a barra mostra | `aria-label` na barra repetindo a frase |
| Barra cheia quando o gasto passa da renda | Barra que vaza a trilha ou muda para vermelho |
| "Faltou em setembro" com o valor em `gasto` | Acento dourado ou tom de bronca no mês negativo |
| Um único `display-xl` na tela | Outro número grande (conquista, gráfico) no mesmo tamanho ao lado |
| Mármore só neste cartão (ou só na conquista, nos dias dela) | Mármore também na lista, no gráfico ou em dois cartões |

## Relacionados

- Componentes: [AppHeader](app-header.md), [TransactionRow](transaction-row.md), [IncomeExpenseChart](income-expense-chart.md), [Achievement](achievement.md), [EmptyState](empty-state.md), [Button](button.md).
- Fundamentos: [Cores](../04-cores.md), [Tipografia](../05-tipografia.md), [Mármore e texturas](../07-marmore-e-texturas.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Gráficos e dados](../13-graficos-e-dados.md), [Padrões de tela](../17-padroes-de-tela.md).
