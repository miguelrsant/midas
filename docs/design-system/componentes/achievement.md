# Achievement (Conquista do mês)

> Cartão com uma coroa de louros em volta do valor que sobrou, mostrado no painel nos primeiros dias do mês seguinte quando o mês fechado terminou com sobra.

Grupo: Painel · Classe base: `md-conquista` (+ `md-louros`, `md-louros-valor`) · Componente React sugerido: `<Achievement />`

## Quando usar

- Só quando o mês que acabou de fechar teve sobra (saldo de pelo menos R$ 1,00).
- No painel, acima do [BalanceCard](balance-card.md), a partir do dia 1 do mês seguinte, até a pessoa abrir o resumo do mês ou por 7 dias (dias 1 a 7), o que vier primeiro.
- Uma conquista por vez, sempre do último mês fechado.

## Quando não usar

- **Mês no vermelho ou zerado.** Não há louros nem bronca: o painel segue normal, e o resumo do mês diz os fatos com uma saída ("Setembro fechou com R$ 210 a menos. Quer ver onde dá para ajustar?"), sem acento dourado.
- Para o mês em andamento: "até agora" não é conquista. O [BalanceCard](balance-card.md) cuida disso.
- Para outras metas (categoria abaixo do limite, dias sem gastar). Os louros são só do mês fechado no azul ([08-ornamentos](../08-ornamentos.md)).
- Como efeito ao salvar: a única comemoração em movimento é o [GoldenTouch](golden-touch.md).

## Anatomia

1. **Cartão** (`md-card md-marmore md-conquista`): textura de mármore (Calacatta ou Portoro) sob o `veu`, sobre `superficie`. Coluna centralizada, vão `space-2`, padding `space-6`, `radius-lg`, `sombra-cartao`.
2. **Louros** (`md-louros`): SVG inline de 240 × 240px (no máximo 100% da largura), `aria-hidden="true"`. Folhas em `ouro`; ramos em `ouro-texto`, traço 1,4, opacidade 0,7.
3. **Miolo dos louros** (`md-louros-centro`), empilhado e centralizado:
   - mês (`md-eyebrow`): "Setembro", `sans` 600, 14/20, maiúsculas, `tinta-suave`;
   - valor (`md-louros-valor`): `classica` (Cormorant Garamond) 700, 36/40, `lining-nums tabular-nums`, `tinta`, arredondado ao real: "R$ 1.842";
   - legenda (`md-help`): "guardados", `sans` 400, 14/20, `tinta-suave`.
4. **Título** (`h2`, `md-display` em tamanho `heading`): "Mês fechado *no azul*." `display` 400, 24/30, `tinta`, com um `acento` ("no azul") em Cormorant Garamond itálica 600, `ouro-texto`.
5. **Frase** (`md-help`): uma comparação verdadeira e útil, ou uma sugestão. 14/20, `tinta-suave`, largura máxima de 32 caracteres (`32ch`).
6. **Ação** (`md-btn md-btn-ghost`): "Ver resumo do mês", em `ouro-texto`, 48px de altura.

## Variantes

| Variante | Quando usar | Tokens |
| --- | --- | --- |
| Única (`md-card md-marmore md-conquista`) | Dias 1 a 7 do mês seguinte a um mês com sobra | Textura sob o `veu`; louros `ouro` e `ouro-texto` |

Não há outras variantes. A tela só pode ter uma superfície com mármore: nos dias em que a conquista aparece, ela fica com o mármore, e o BalanceCard logo abaixo passa para a variante lisa (`md-card` sem `md-marmore`). Nos outros dias, o mármore volta para o BalanceCard.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Visível | Cartão completo | ver Anatomia | Sem animação de entrada |
| Foco na ação | Anel de 2px em `foco` no botão | `foco` | |
| Hover na ação | Fundo `superficie-funda` no botão | `superficie-funda` | `duracao-rapida` |
| Encerrado | O cartão não é renderizado | | Depois de abrir o resumo ou no dia 8 |

Não há estado de carregamento próprio: o cartão só aparece quando os dados do mês fechado já chegaram. Se não chegarem, ele simplesmente não aparece.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Padding do cartão | 24px | `space-6` |
| Vão entre as partes | 8px | `space-2` |
| Coroa de louros | 240 × 240px, `max-width: 100%`, proporção 1:1 | |
| Miolo | 8px de respiro em cima, 2px entre linhas | (fora da escala, como no protótipo) |
| Valor | 36/40, 700 | `md-louros-valor` |
| Título | 24/30 | `heading` |
| Acento | 1,12em do título, `-0.01em` de espaçamento | `acento` |
| Frase | 14/20, até 32ch | `caption` |
| Ação | 48px de altura, padding lateral 12px | `space-12`, `space-3` |

## Tokens usados

| Token | Onde |
| --- | --- |
| `superficie`, `veu`, textura | Fundo do cartão (`md-marmore`) |
| `sombra-cartao`, `radius-lg` | Cartão |
| `ouro` | Folhas dos louros |
| `ouro-texto` | Ramos dos louros; acento do título; ação |
| `tinta` | Valor; título |
| `tinta-suave` | Mês; "guardados"; frase |
| `superficie-funda`, `foco` | Hover e foco da ação |
| `classica`, `display`, `sans` | Valor e acento; título; textos |

## Conteúdo

- **Valor**: arredondado para baixo, ao real: R$ 1.842,10 vira `R$ 1.842`. Nunca mostre mais do que sobrou.
- **Título**: "Mês fechado *no azul*." Um acento só, sempre no fim.
- **Frase**: escolha a primeira que for verdadeira, nesta ordem. Uma frase só.

| Situação | Frase |
| --- | --- |
| Maior sobra desde um mês anterior | "É o seu melhor resultado desde junho." |
| Maior sobra desde o começo (3 meses ou mais de uso) | "É o seu melhor resultado até agora." |
| Sobrou mais que no mês anterior | "Sobraram R$ 310 a mais que em agosto." |
| Dois meses ou mais seguidos no azul | "É o terceiro mês seguido no azul." |
| Primeiro mês fechado, ou nenhuma comparação boa | "Quer separar uma parte para as férias?" |

- Comparação só a favor: nunca "R$ 200 a menos que em agosto". Se o mês foi pior que o anterior, use a sequência de meses ou a sugestão.
- **Ação**: "Ver resumo do mês". Sem segunda ação.

| Faça | Evite |
| --- | --- |
| "Mês fechado *no azul*." | "Parabéns!!! Você é demais!" |
| "É o seu melhor resultado desde junho." | "Você foi melhor que 80% das pessoas." |
| `R$ 1.842` | `R$ 1.842,10` ou `R$ 1,8 mil` |
| "Ver resumo do mês" | "Clique aqui", "Resgatar prêmio" |

## Acessibilidade

- **Semântica.** `<section aria-labelledby>` apontando para o título: o leitor de tela anuncia a região "Mês fechado no azul." ao entrar nela, antes do conteúdo.
- **Ordem de leitura.** Segue a ordem visual: "Setembro, R$ 1.842, guardados", o título, a frase e o link. Não reordene com CSS.
- **Louros.** Decorativos: `aria-hidden="true"`, sem `<title>`. Nenhuma informação fica só neles.
- **Acento.** `<em>` dá ênfase de estilo; leitores de tela em geral não mudam a voz. O título continua claro sem o itálico.
- **Ação.** Leva a outra página, então é um link (`<a>`) com aparência de `md-btn-ghost`, não um `<button>`.
- **Contraste** sobre o mármore com `veu` (pior caso medido, claro / escuro): valor e título em `tinta` 13,02:1 / 10,19:1; mês, "guardados" e frase em `tinta-suave` 5,72 / 5,90; acento e ação em `ouro-texto` 5,02 / 7,03. As folhas em `ouro` são decorativas.
- **Movimento.** Nenhum: sem confete, som, brilho ou entrada animada. Nada muda com `prefers-reduced-motion`, porque não há nada para desligar.

## Comportamento responsivo

- A coroa tem 240px e encolhe com `max-width: 100%` em cartões mais estreitos (proporção 1:1). A 360px de tela, a largura útil é 280px, e a coroa fica inteira.
- O título usa `text-wrap: balance` e pode quebrar em duas linhas; a frase fica em até 32 caracteres por linha.
- No painel em telas largas, o cartão ocupa a mesma coluna do BalanceCard, logo acima dele.

## Casos-limite

- **Sobra abaixo de R$ 1,00**: não mostre a conquista (o valor arredondado seria R$ 0).
- **Sobra grande**: até `R$ 9.999`, o valor cabe em 36px no miolo da coroa de 240px. A partir de `R$ 10.000`, desça o valor para 24/30 (tamanho de `heading`), ainda em `classica` 700. Nunca quebre a linha do valor.
- **Sem histórico**: use a sugestão ("Quer separar uma parte para as férias?").
- **A pessoa abre o resumo por outro caminho**: a conquista também se encerra.
- **Vários aparelhos**: guarde no servidor que a conquista de setembro foi vista, para não voltar a aparecer no celular depois de vista no computador.
- **Lançamento atrasado muda o mês fechado**: recalcule. Se a sobra virar falta, a conquista some sem aviso; se o valor mudar, o cartão mostra o novo.
- **Primeiro dia do mês sem abrir o app**: a janela é de 7 dias a partir do dia 1, não da primeira visita.

## Referência HTML

Marcação do protótipo com a ação como link e o valor com a classe corrigida. Caminhos dos louros resumidos.

```html
<section class="md-card md-marmore md-conquista" aria-labelledby="conquista-titulo">
  <div class="md-louros">
    <svg viewBox="-110 -110 220 220" aria-hidden="true">
      <path class="folhas" d="…"/>
      <path class="ramos" d="M1.4 79.99 A80 80 0 0 1 -37.56 -70.64M-1.4 79.99 A80 80 0 0 0 37.56 -70.64"/>
    </svg>
    <div class="md-louros-centro">
      <span class="md-eyebrow">Setembro</span>
      <span class="md-louros-valor">R$ 1.842</span>
      <span class="md-help">guardados</span>
    </div>
  </div>
  <h2 id="conquista-titulo" class="md-display md-conquista-titulo">Mês fechado <em class="md-acento">no azul</em>.</h2>
  <p class="md-help md-conquista-frase">É o seu melhor resultado desde junho.</p>
  <a class="md-btn md-btn-ghost" href="/resumo/2026-09">Ver resumo do mês</a>
</section>
```

No protótipo, a frase traz uma comparação e uma sugestão juntas ("É o seu melhor resultado desde junho. Quer separar uma parte para as férias?"). No app, use uma frase só, pela tabela de Conteúdo. A rota `/resumo/2026-09` é uma sugestão.

## Referência CSS

```css
.md-conquista { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
.md-louros { position: relative; width: 240px; max-width: 100%; aspect-ratio: 1; display: grid; place-items: center; }
.md-louros svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.md-louros .folhas { fill: var(--ouro); }
.md-louros .ramos { fill: none; stroke: var(--ouro-texto); stroke-width: 1.4; stroke-linecap: round; opacity: .7; }
.md-louros-centro { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; padding-top: 8px; }
.md-louros-valor { font: 700 36px/40px var(--font-classica); color: var(--tinta); font-variant-numeric: lining-nums tabular-nums; }
.md-display { font: 400 34px/40px var(--font-display); font-variant-numeric: lining-nums; color: var(--tinta); margin: 0; text-wrap: balance; }
.md-acento { font-family: var(--font-classica); font-style: italic; font-weight: 600; font-size: 1.12em; letter-spacing: -0.01em; color: var(--ouro-texto); }

/* Ajustes desta documentação (substituem os estilos inline do protótipo) */
.md-conquista-titulo { font-size: 24px; line-height: 30px; }
.md-conquista-frase { margin: 0; max-width: 32ch; }
.md-louros-valor { white-space: nowrap; }
.md-louros-valor.is-grande { font-size: 24px; line-height: 30px; }
```

## Implementação no app

Base: nenhum componente shadcn; `Link` do Next.js, o ornamento como componente SVG (`<Laurels />`) e o `<Acento>` do design system. A decisão de mostrar ou não fica no servidor.

```ts
export interface AchievementProps {
  /** Mês fechado, por extenso: "setembro". */
  monthName: string;
  /** Sobra do mês em centavos inteiros, >= 100. */
  savedCents: number;
  /** Frase já escolhida pela tabela de Conteúdo. */
  sentence: string;
  /** Link do resumo do mês fechado. */
  summaryHref: string;
}

/** Regra de exibição no painel (servidor). */
export function shouldShowAchievement(o: {
  closedMonthBalanceCents: number;
  today: Date;              // no fuso da pessoa
  summaryOpened: boolean;   // guardado no servidor por mês
}): boolean {
  return o.closedMonthBalanceCents >= 100 && o.today.getDate() <= 7 && !o.summaryOpened;
}
```

```tsx
import Link from "next/link";
import { Button } from "@/components/midas/button";
import { Acento } from "@/components/midas/acento";
import { Laurels } from "@/components/midas/laurels";

export function Achievement({ monthName, savedCents, sentence, summaryHref }: AchievementProps) {
  const reais = Math.floor(savedCents / 100);
  const value = `R$ ${new Intl.NumberFormat("pt-BR").format(reais)}`; // "R$ 1.842"
  const big = reais >= 10_000;

  return (
    <section
      aria-labelledby="conquista-titulo"
      className="md-marmore flex flex-col items-center gap-2 rounded-lg p-6 text-center shadow-cartao"
    >
      <div className="relative grid aspect-square w-[240px] max-w-full place-items-center">
        <Laurels aria-hidden="true" className="absolute inset-0 size-full" />
        <div className="relative flex flex-col items-center gap-[2px] pt-2">
          <span className="text-caption font-semibold uppercase tracking-[0.06em] text-tinta-suave">{capitalize(monthName)}</span>
          <span className={`whitespace-nowrap font-classica font-bold lining-nums tabular-nums text-tinta ${big ? "text-heading" : "text-[2.25rem]/[2.5rem]"}`}>
            {value}
          </span>
          <span className="text-caption text-tinta-suave">guardados</span>
        </div>
      </div>
      <h2 id="conquista-titulo" className="m-0 text-balance font-display text-heading lining-nums text-tinta">
        Mês fechado <Acento>no azul</Acento>.
      </h2>
      <p className="m-0 max-w-[32ch] text-caption text-tinta-suave">{sentence}</p>
      <Button variant="ghost" asChild>
        <Link href={summaryHref}>Ver resumo do mês</Link>
      </Button>
    </section>
  );
}
```

```tsx
// src/components/midas/laurels.tsx: louros inline, coloridos por token
export function Laurels(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-110 -110 220 220" {...props}>
      <path className="fill-ouro" d="…" />
      <path className="fill-none stroke-ouro-texto opacity-70" strokeWidth={1.4} strokeLinecap="round" d="M1.4 79.99 A80 80 0 0 1 -37.56 -70.64M-1.4 79.99 A80 80 0 0 0 37.56 -70.64" />
    </svg>
  );
}
```

Notas:

- Prefira o SVG inline ao arquivo `/ornamentos/louros.svg`: um SVG em `<img>` não herda cor, e o inline troca de tema pelos tokens. Use `louros.svg` / `louros-noite.svg` só fora do app (e-mail, divulgação).
- `<Button variant="ghost" asChild>` (veja [Button](button.md)) dá ao link a aparência de `md-btn-ghost`, com 48px de altura, hover e anel de foco.
- Quando a pessoa abre o resumo do mês, a página do resumo marca `summaryOpened` no servidor; o painel deixa de mostrar a conquista na próxima visita.
- No painel, a mesma decisão controla os dois cartões: `const show = shouldShowAchievement(…)`; renderize `{show && <Achievement … />}` e, logo abaixo, `<BalanceCard plain={show} … />`.
- A escolha da frase fica numa função pura no servidor (`pickAchievementSentence(history)`), testável com os casos da tabela de Conteúdo.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Mostrar só com sobra de verdade | Louros num mês zerado ou no vermelho |
| Uma frase de comparação a favor | Comparar com outras pessoas ou com o mês pior |
| Valor arredondado para baixo ao real | Centavos ou valor arredondado para cima |
| Um link leve "Ver resumo do mês" | Botão primário, confete, som, animação |
| Conquista com mármore e BalanceCard liso nos mesmos dias | Dois cartões de mármore na mesma tela |

## Relacionados

- Componentes: [BalanceCard](balance-card.md), [GoldenTouch](golden-touch.md), [Button](button.md), [Seal](seal.md), [EmptyState](empty-state.md).
- Fundamentos: [Ornamentos](../08-ornamentos.md), [Mármore e texturas](../07-marmore-e-texturas.md), [Tipografia](../05-tipografia.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Movimento](../10-movimento.md), [Acessibilidade](../12-acessibilidade.md), [Padrões de tela](../17-padroes-de-tela.md).
