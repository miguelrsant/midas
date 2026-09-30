# IncomeExpenseChart (Gráfico renda x gastos)

> Gráfico de barras que compara, mês a mês, quanto entrou e quanto saiu, com os próximos meses projetados. Fica no painel, abaixo dos últimos lançamentos.

Grupo: Painel · Classe base: `md-chart` (SVG) + `md-legend` · Componente React sugerido: `<IncomeExpenseChart />`

## Quando usar

- No painel, para responder "como vão os próximos meses?": três meses reais (dois fechados e o atual) e três projetados.
- Na tela de resumo do mês, com o mesmo formato.

## Quando não usar

- Para mostrar gastos por categoria: é outra pergunta ("onde gastei?") e pede outro gráfico.
- Com menos de um mês fechado: não há base para projetar (veja Casos-limite).
- Sobre o mármore. O gráfico fica sempre num `md-card` liso (`superficie`).
- Como único lugar de um dado. Tudo o que o gráfico mostra também está no título, no `aria-label` e na tabela.

## Anatomia

1. **Cartão**: `md-card` (`superficie`, `radius-lg`, `sombra-cartao`, padding `space-6`).
2. **Sobretítulo** (`md-eyebrow`): "Renda x gastos". `sans` 600, 14/20, maiúsculas, `tinta-suave`.
3. **Título-conclusão**: a conclusão em palavras, antes do gráfico. `heading`: `display` (Midas Display) 400, 24/30, `lining-nums`, `tinta`. Margem 4px em cima e 12px embaixo.
4. **Área do gráfico** (`md-chart`): SVG de 240px de altura, largura total.
   - **Grade**: linhas horizontais de 1px em `veio` nos valores do eixo.
   - **Eixo Y**: "0", "4 mil", "8 mil", "12 mil", à esquerda, alinhados à direita. Texto `sans` em `tinta-suave`.
   - **Eixo X**: meses abreviados ("Jul", "Ago", "Set"), centralizados sob cada par.
   - **Barras reais**: renda em `grafico-renda`, gasto em `grafico-gasto`, lado a lado (renda à esquerda), 22px de largura, 6px entre as duas, cantos de 4px.
   - **Barras projetadas**: preenchimento `renda-fundo` / `gasto-fundo`, contorno tracejado de 1,5px (traço 4, espaço 3) em `grafico-renda` / `grafico-gasto`.
   - **Linha de projeção**: vertical, entre o último mês real e o primeiro projetado, em `grafico-projecao` (`ouro`), 2px, tracejada (5, 4).
   - **Rótulo "Projeção"**: ao lado da linha, no alto, em `ouro-texto`.
5. **Legenda** (`md-legend`): sempre visível, com texto. Quadrados de 12px (cantos de 3px): "Renda", "Gastos", "Projeção" (com "(inclui 13º)" quando houver). `sans` 400, 14/20, `tinta-suave`.
6. **Nota da projeção** (`md-help`): "Estimativa com base nos últimos 3 meses e nas rendas já previstas, como o 13º." `caption`, `tinta-suave`.
7. **Botão "Ver em tabela"** (`md-btn-ghost`): mostra ou esconde a tabela com os mesmos dados.
8. **Balão** (ao tocar ou passar o mouse numa coluna): mês e valores com sinal.

## Variantes

| Variante | Quando usar | Tokens |
| --- | --- | --- |
| Com projeção (padrão) | Painel, com pelo menos 1 mês fechado | Barras reais + projetadas + linha `grafico-projecao` |
| Só meses reais | Resumo de um mês passado, ou sem base para projetar | Sem linha, sem rótulo, legenda sem "Projeção" |

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Barras, legenda, nota | ver Anatomia | |
| Coluna em foco ou hover | Faixa de fundo `superficie-funda` atrás do par de barras + balão | `superficie-funda`, `superficie`, `sombra-cartao` | O balão fica dentro do cartão |
| Tabela aberta | Tabela abaixo do gráfico; botão diz "Esconder tabela" | `aria-expanded="true"` | O gráfico continua visível |
| Carregando | Cartão com sobretítulo; área de 240px em `superficie-funda`, sem barras falsas | `superficie-funda` | `aria-busy="true"` |
| Sem dados | Sem gráfico: frase "O gráfico aparece quando você fechar o primeiro mês com lançamentos." | `tinta-suave` | |
| Erro de rede | Sem gráfico; frase "Não foi possível carregar o gráfico." em `tinta-suave` | `tinta-suave` | O [Notice](notice.md) de alerta no topo traz "Tentar de novo" |

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Padding do cartão | 24px | `space-6` |
| Título | 24/30; 4px acima, 12px abaixo | `heading`, `space-1`, `space-3` |
| Altura do gráfico | 240px | |
| Largura da barra | 22px (máximo; afina em telas estreitas, mínimo 12px) | |
| Vão entre renda e gasto | 6px | |
| Raio da barra | 4px | |
| Contorno projetado | 1,5px, `4 3` | |
| Linha de projeção | 2px, `5 4` | |
| Texto dos eixos | 14px (o protótipo usa 13px; veja Referência CSS) | `caption` |
| Legenda | 14/20; vão de 16px entre itens, 8px entre quadrado e texto | `caption`, `space-4`, `space-2` |
| Quadrado da legenda | 12 × 12px, cantos de 3px | |
| Alvo da coluna (toque) | largura da coluna inteira × 240px | |

## Tokens usados

| Token | Onde |
| --- | --- |
| `grafico-renda` (= `renda`) | Barras de renda; contorno projetado de renda |
| `grafico-gasto` (= `gasto`) | Barras de gasto; contorno projetado de gasto |
| `renda-fundo`, `gasto-fundo` | Preenchimento das barras projetadas |
| `grafico-projecao` (= `ouro`) | Linha de projeção; contorno do quadrado "Projeção" |
| `ouro-texto` | Rótulo "Projeção" |
| `veio` | Grade |
| `tinta`, `tinta-suave` | Título; eixos, legenda, nota |
| `superficie`, `superficie-funda` | Cartão; faixa da coluna em foco; quadrado "Projeção" |

## Conteúdo

**Título-conclusão.** Uma frase que diz o que o gráfico mostra, com número. Escolha, nesta ordem, a primeira que for verdadeira:

| Situação | Título |
| --- | --- |
| Um mês projetado fecha no vermelho | "Novembro pode fechar com R$ 300 a menos." (sem acento dourado) |
| O último mês projetado fecha com sobra | "Dezembro deve fechar com R$ 6.300 de sobra." |
| Sem projeção | "Setembro fechou com R$ 1.842 de sobra." |

- Valores projetados são arredondados à centena de reais ("R$ 6.300"), porque são estimativas. Valores de meses reais vão com centavos no balão e na tabela.
- Use "deve" para sobra projetada e "pode" para falta projetada: a falta é possibilidade, não sentença.

**Eixo Y.** "0", "4 mil", "8 mil", "12 mil"; acima de um milhão, "1,2 mi". Nunca "4k".

**Legenda.** "Renda", "Gastos", "Projeção". Some "(inclui 13º)" quando um mês projetado tiver o 13º. Escreva sempre "13º" com o indicador ordinal (U+00BA).

**Nota da projeção.** Explica em uma frase de onde vem a estimativa: "Estimativa com base nos últimos 3 meses e nas rendas já previstas, como o 13º." Com só 1 ou 2 meses fechados: "Estimativa com base em agosto e setembro." Sem rendas previstas, termine em "…nos últimos 3 meses."

Cálculo sugerido (o texto acima é o que a pessoa lê sobre ele):
- Gasto projetado: média dos gastos dos últimos 3 meses fechados.
- Renda projetada: média das rendas dos últimos 3 meses fechados, sem as rendas de uma vez só (13º, férias, rescisão), mais as rendas previstas pelas calculadoras no mês em que caem.

**Balão.** Mês por extenso, "(projeção)" ou "(até agora)" quando for o caso, e os valores com sinal: "Outubro (projeção) · Entrou + R$ 6.200 · Saiu − R$ 4.800".

| Faça | Evite |
| --- | --- |
| "Dezembro deve fechar com R$ 6.300 de sobra." | "Renda x gastos 2026" como título |
| "4 mil" | "4k", "4.000,00" |
| "Projeção (inclui 13º)" | "Projeção (inclui 13°)" |
| "Novembro pode fechar com R$ 300 a menos." | "Cuidado: *prejuízo* em novembro!" |

## Acessibilidade

- **Ordem.** Sobretítulo, título-conclusão, gráfico, legenda, nota, botão da tabela. A conclusão vem antes do gráfico para quem lê e para quem ouve.
- **SVG.** `role="img"` e um `aria-label` que resume os dados em até três frases, gerado a partir deles: "Gráfico de barras de renda e gastos, de julho a dezembro. De outubro a dezembro, os valores são projeção. A renda fica acima dos gastos em todos os meses; em dezembro, com o 13º, entram cerca de R$ 12.400." Os elementos internos do SVG ficam fora da árvore de acessibilidade.
- **Tabela.** O botão "Ver em tabela" tem `aria-expanded` e `aria-controls`. A tabela tem `<caption>` ("Renda e gastos por mês"), cabeçalhos `<th scope="col">` (Mês, Entrou, Saiu, Sobrou ou faltou) e `<th scope="row">` no mês. Nos meses projetados, o mês diz "Outubro (projeção)". Nas colunas Entrou e Saiu, o sinal fica `aria-hidden` (o cabeçalho já diz o sentido); na última coluna, o sinal é trocado por texto escondido "Sobrou" ou "Faltou".
- **Balão.** É um atalho visual. Se a versão do Recharts instalada oferecer navegação por teclado (prop `accessibilityLayer`), ligue-a; ainda assim, a tabela é a alternativa garantida para teclado e leitor de tela.
- **Não só cor.** Renda e gasto se distinguem por posição (renda sempre à esquerda) e pela legenda com texto; projeção, por tracejado, rótulo "Projeção" e o texto "(projeção)" no balão e na tabela. O par azul-petróleo e terracota é seguro para daltonismo.
- **Contraste.** Barras sobre `superficie`: `grafico-renda` 6,54:1 (claro) e 8,69:1 (escuro); `grafico-gasto` 6,11:1 e 7,53:1. Nas barras projetadas, quem dá o contraste é o contorno, na cor da série. O rótulo "Projeção" em `ouro-texto`: 5,98:1 e 10,06:1. A linha de projeção em `ouro` tem 2,54:1 no claro (abaixo de 3:1), mas não é a única pista: o rótulo em texto e o tracejado das barras dizem o mesmo. No escuro, 8,56:1.
- **Movimento.** Nenhuma animação de entrada, com ou sem `prefers-reduced-motion`: as barras aparecem prontas (veja [Gráficos e dados](../13-graficos-e-dados.md#princípios)).

## Comportamento responsivo

- Largura fluida (100% do cartão), altura fixa de 240px.
- Com barras de 22px, seis meses pedem cerca de 380px de largura útil (6 colunas de 56px + eixo de 44px). Num celular de 360px sobram 280px: as barras afinam até caber (cerca de 15px cada), com 22px como máximo (`maxBarSize`). Não deixe a barra passar abaixo de 12px: com menos de 240px de largura útil, mostre 2 meses reais e 2 projetados.
- A legenda quebra em linhas (`flex-wrap`), nunca some.
- O balão nunca sai do cartão: prenda-o dentro da área do gráfico.

## Casos-limite

- **Menos de um mês fechado**: sem gráfico, com a frase do estado "Sem dados".
- **Um ou dois meses fechados**: mostre os que existem; a nota cita os meses ("Estimativa com base em agosto e setembro.").
- **Mês atual**: barra sólida (dado real), mas o balão e a tabela dizem "Setembro (até agora)".
- **Mês sem renda ou sem gasto**: barra de altura zero (nada desenhado); no balão e na tabela, `R$ 0,00` sem sinal.
- **Gasto acima da renda**: sem cor extra. O título conta a história ("Novembro pode fechar com R$ 300 a menos.").
- **Valor muito maior que os outros** (rescisão, 13º): a escala acompanha; o eixo usa "mil" ou "mi". Não corte a barra.
- **Valores enormes**: `Intl.NumberFormat('pt-BR', { notation: 'compact' })` dá "1,2 mi"; no balão e na tabela, o valor completo.
- **Erro de rede**: estado "Erro de rede"; nunca desenhe barras com zeros no lugar de dados que não chegaram.

## Referência HTML

Marcação do protótipo corrigida (eixo em "mil", "13º", legenda e tabela). Coordenadas das barras omitidas.

```html
<section class="md-card" aria-labelledby="grafico-titulo">
  <p class="md-eyebrow">Renda x gastos</p>
  <h2 id="grafico-titulo" class="md-chart-titulo">Dezembro deve fechar com R$ 6.300 de sobra.</h2>
  <svg class="md-chart" viewBox="0 0 560 240" width="100%" role="img"
       aria-label="Gráfico de barras de renda e gastos, de julho a dezembro. De outubro a dezembro, os valores são projeção. A renda fica acima dos gastos em todos os meses; em dezembro, com o 13º, entram cerca de R$ 12.400.">
    <line class="grid" x1="44" x2="552" y1="208" y2="208"/><text x="36" y="212" text-anchor="end">0</text>
    <line class="grid" x1="44" x2="552" y1="153" y2="153"/><text x="36" y="157" text-anchor="end">4 mil</text>
    <line class="grid" x1="44" x2="552" y1="98" y2="98"/><text x="36" y="102" text-anchor="end">8 mil</text>
    <line class="grid" x1="44" x2="552" y1="43" y2="43"/><text x="36" y="47" text-anchor="end">12 mil</text>
    <rect class="bar-renda" x="69" y="126" width="22" height="82" rx="4"/>
    <rect class="bar-gasto" x="97" y="141" width="22" height="67" rx="4"/>
    <text x="94" y="230" text-anchor="middle">Jul</text>
    <!-- … Ago e Set iguais … -->
    <rect class="proj-renda" x="319" y="123" width="22" height="85" rx="4"/>
    <rect class="proj-gasto" x="347" y="142" width="22" height="66" rx="4"/>
    <text x="344" y="230" text-anchor="middle">Out</text>
    <!-- … Nov e Dez iguais … -->
    <line class="proj" x1="298" x2="298" y1="16" y2="208"/>
    <text x="304" y="28" class="proj-rotulo">Projeção</text>
  </svg>
  <div class="md-legend">
    <span><i style="background: var(--grafico-renda)"></i>Renda</span>
    <span><i style="background: var(--grafico-gasto)"></i>Gastos</span>
    <span><i class="is-projecao"></i>Projeção (inclui 13º)</span>
  </div>
  <p class="md-help">Estimativa com base nos últimos 3 meses e nas rendas já previstas, como o 13º.</p>
  <button class="md-btn md-btn-ghost" aria-expanded="false" aria-controls="grafico-tabela">Ver em tabela</button>
  <table id="grafico-tabela" hidden>
    <caption>Renda e gastos por mês</caption>
    <thead><tr><th scope="col">Mês</th><th scope="col">Entrou</th><th scope="col">Saiu</th><th scope="col">Sobrou ou faltou</th></tr></thead>
    <tbody>
      <tr><th scope="row">Setembro (até agora)</th>
        <td><span aria-hidden="true">+ </span>R$ 6.200,00</td>
        <td><span aria-hidden="true">− </span>R$ 4.357,90</td>
        <td><span class="md-sr">Sobrou </span><span aria-hidden="true">+ </span>R$ 1.842,10</td></tr>
      <tr><th scope="row">Outubro (projeção)</th>
        <td><span aria-hidden="true">+ </span>R$ 6.200</td>
        <td><span aria-hidden="true">− </span>R$ 4.800</td>
        <td><span class="md-sr">Sobrou </span><span aria-hidden="true">+ </span>R$ 1.400</td></tr>
    </tbody>
  </table>
</section>
```

## Referência CSS

```css
.md-chart text { font: 400 14px var(--font-sans); fill: var(--tinta-suave); } /* protótipo: 13px */
.md-chart .grid { stroke: var(--veio); stroke-width: 1; }
.md-chart .bar-renda { fill: var(--grafico-renda); }
.md-chart .bar-gasto { fill: var(--grafico-gasto); }
.md-chart .proj { fill: none; stroke: var(--grafico-projecao); stroke-width: 2; stroke-dasharray: 5 4; }
.md-chart .proj-renda { fill: var(--renda-fundo); stroke: var(--grafico-renda); stroke-width: 1.5; stroke-dasharray: 4 3; }
.md-chart .proj-gasto { fill: var(--gasto-fundo); stroke: var(--grafico-gasto); stroke-width: 1.5; stroke-dasharray: 4 3; }
.md-legend { display: flex; flex-wrap: wrap; gap: var(--space-4); font: 400 14px/20px var(--font-sans); color: var(--tinta-suave); }
.md-legend span { display: inline-flex; align-items: center; gap: var(--space-2); }
.md-legend i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }

/* Ajustes desta documentação */
.md-chart-titulo { font: 400 24px/30px var(--font-display); font-variant-numeric: lining-nums; color: var(--tinta); margin: var(--space-1) 0 var(--space-3); text-wrap: balance; }
.md-chart .proj-rotulo { fill: var(--ouro-texto); }
.md-legend i.is-projecao { background: var(--superficie-funda); outline: 1.5px dashed var(--grafico-projecao); }
```

O texto dos eixos sobe de 13px (protótipo) para 14px, o piso de `caption`: nenhum texto do Midas fica abaixo de 14px.

## Implementação no app

Base: Recharts (`ResponsiveContainer`, `BarChart`, `Bar`, `Cell`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ReferenceLine`). O componente `chart` do shadcn/ui também usa Recharts e pode servir de contêiner, mas o balão e a legenda aqui são próprios. O código abaixo é uma sugestão: confira cada prop na versão instalada do Recharts.

```ts
export interface MonthPoint {
  /** "2026-10" */
  month: string;
  incomeCents: number;
  expenseCents: number;
  projected: boolean;
  /** Mês corrente: dado real, ainda em andamento. */
  current?: boolean;
  /** Mês com 13º previsto (para a legenda e o resumo). */
  hasThirteenth?: boolean;
}

export interface IncomeExpenseChartProps {
  data: MonthPoint[];
  /** Frase-conclusão já montada no servidor. */
  title: string;
  /** Resumo para o aria-label, montado a partir dos dados. */
  summary: string;
  /** Nota da projeção; omitida quando não há meses projetados. */
  projectionNote?: string;
}
```

```tsx
"use client";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact" }); // 4000 → "4 mil"

export function IncomeExpenseChart({ data, title, summary, projectionNote }: IncomeExpenseChartProps) {
  const rows = data.map((d) => ({ ...d, label: monthAbbr(d.month), income: d.incomeCents / 100, expense: d.expenseCents / 100 }));
  const firstProjected = rows.find((r) => r.projected);
  const anim = { isAnimationActive: false }; // sem animação de entrada

  return (
    <section aria-labelledby="grafico-titulo" className="rounded-lg bg-superficie p-6 shadow-cartao">
      <p className="m-0 text-caption font-semibold uppercase tracking-[0.06em] text-tinta-suave">Renda x gastos</p>
      <h2 id="grafico-titulo" className="mt-1 mb-3 text-balance font-display text-heading lining-nums text-tinta">{title}</h2>

      <div role="img" aria-label={summary} className="h-[240px] text-caption">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} barGap={6} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--veio)" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--tinta-suave)", fontSize: 14 }} />
            <YAxis width={44} axisLine={false} tickLine={false} tickFormatter={(v: number) => compact.format(v)}
                   tick={{ fill: "var(--tinta-suave)", fontSize: 14 }} />
            <Tooltip content={<MonthTooltip />} cursor={{ fill: "var(--superficie-funda)" }} />
            <Bar dataKey="income" name="Renda" radius={4} maxBarSize={22} {...anim}>
              {rows.map((r) => (
                <Cell key={r.month} fill={r.projected ? "var(--renda-fundo)" : "var(--grafico-renda)"}
                      stroke={r.projected ? "var(--grafico-renda)" : "none"} strokeWidth={1.5}
                      strokeDasharray={r.projected ? "4 3" : undefined} />
              ))}
            </Bar>
            <Bar dataKey="expense" name="Gastos" radius={4} maxBarSize={22} {...anim}>
              {rows.map((r) => (
                <Cell key={r.month} fill={r.projected ? "var(--gasto-fundo)" : "var(--grafico-gasto)"}
                      stroke={r.projected ? "var(--grafico-gasto)" : "none"} strokeWidth={1.5}
                      strokeDasharray={r.projected ? "4 3" : undefined} />
              ))}
            </Bar>
            {firstProjected && (
              <ReferenceLine x={firstProjected.label} stroke="var(--grafico-projecao)" strokeWidth={2} strokeDasharray="5 4"
                             label={{ value: "Projeção", position: "insideTopRight", fill: "var(--ouro-texto)", fontSize: 14 }} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend showProjection={!!firstProjected} thirteenth={rows.some((r) => r.projected && r.hasThirteenth)} />
      {projectionNote && <p className="mt-2 mb-0 text-caption text-tinta-suave">{projectionNote}</p>}
      <ChartTable rows={rows} /> {/* botão "Ver em tabela" + <table> da Referência HTML */}
    </section>
  );
}
```

Notas:

- **Cores por variável CSS.** `fill="var(--grafico-renda)"` funciona como atributo de apresentação do SVG e troca de tema sozinho com `data-theme="dark"`. Não copie valores hexadecimais para o componente.
- **Linha entre colunas.** Num eixo de categorias, a `ReferenceLine` fica no centro da coluna indicada, não entre duas colunas como no protótipo. Aceite a linha sobre o primeiro mês projetado ou desenhe-a com um elemento SVG próprio; não dependa de prop que você não confirmou.
- **`role="img"` no invólucro.** O SVG que o Recharts gera tem muitos elementos; o invólucro com `role="img"` e `aria-label` entrega o resumo em uma frase e esconde o resto. Por isso a navegação por teclado do Recharts, se ligada, não substitui a tabela.
- **Balão (`MonthTooltip`).** Recebe `active` e `payload` do `Tooltip`; leia a linha em `payload[0].payload`. Fundo `superficie`, borda `veio`, `radius-md`, `sombra-cartao`, padding `space-3`; título do mês em `label`, valores em `amount` com sinal e cor da série.
- **Dados.** Os valores chegam em centavos e viram reais só para desenhar. O título, o `summary` e a nota são montados no servidor com as mesmas regras de arredondamento.
- **`monthAbbr`.** Devolve "Jul", "Ago", "Set"… de uma lista fixa (sem ponto).

## Faça e evite

| Faça | Evite |
| --- | --- |
| Título que já diz a conclusão | Gráfico sem título ou com título genérico |
| Legenda com texto, sempre visível | Legenda só no balão ou só por cor |
| Projeção com tracejado e rótulo "Projeção" | Projeção com a mesma barra sólida dos meses reais |
| Tabela com os mesmos dados | Informação que só existe no balão |
| Eixo em "mil" e "mi" | "k", "M" ou valores com centavos no eixo |
| Barras que aparecem prontas com movimento reduzido | Animação longa ou em cascata |

## Relacionados

- Componentes: [BalanceCard](balance-card.md), [Notice](notice.md) (projeção negativa), [Button](button.md), [EmptyState](empty-state.md), [TransactionRow](transaction-row.md).
- Fundamentos: [Gráficos e dados](../13-graficos-e-dados.md), [Cores](../04-cores.md), [Tipografia](../05-tipografia.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Movimento](../10-movimento.md), [Tokens](../14-tokens.md).
