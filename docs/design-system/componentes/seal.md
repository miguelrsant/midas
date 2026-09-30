# Seal (Selo)

> O selo do Midas, desenhado como uma moeda antiga, com a legenda "SUAS FINANÇAS · SEU CONTROLE" no aro e o monograma no centro; aparece na entrada, na página Sobre e nos materiais de divulgação.

Grupo: Marca · Classe base: `md-selo` · Componente React sugerido: `<Seal />`

## Quando usar

- **Tela de entrada, cadastro e recuperação de senha:** selo contorno, grande, cortado no canto, atrás do cartão (veja [LoginScreen](login-screen.md)).
- **Página Sobre:** selo cheio (`md-selo`), centralizado, como imagem de marca.
- **Materiais de divulgação:** site, redes, apresentações, cartazes. Em peças comemorativas, a versão folha de ouro (`midas-selo-ouro.svg`).
- **README do projeto:** o arquivo `midas-selo.svg` (ou `midas-selo-noite.svg` com `<picture>` e `prefers-color-scheme`), acima do título.

## Quando não usar

- **Dentro do painel e de listas:** nada de selo no painel, em cartões, linhas de lançamento, avisos ou diálogos. Ali a marca é só o logo do [AppHeader](app-header.md).
- **Abaixo de 96px:** a legenda deixa de ser legível. Use o símbolo (`midas-simbolo.svg`, a partir de 24px) ou o favicon (16 a 32px).
- **Como botão, ícone ou carimbo de status** ("verificado", "pago"): o selo é marca, não sinal de estado.
- **Para comemorar o mês no azul:** isso é papel do [Achievement](achievement.md) com os louros.
- **Mais de um selo por tela**, ou selo e louros juntos.
- **Folha de ouro no dia a dia:** `midas-selo-ouro.svg` é só para momentos especiais (lançamento de versão, aniversário do projeto).

## Anatomia

O desenho usa um `viewBox="-101 -101 202 202"`, com o centro na origem. De fora para dentro:

1. **Disco (`.fundo`):** círculo de raio 100. `ouro` no Calacatta, `superficie` no Portoro, transparente no contorno.
2. **Aro (`.aro`), a parte que se move (assenta ao abrir a tela):**
   - linha externa (`.linha`, raio 95,5, traço 1,6);
   - 96 pontos de perolado (`.tinta`, raio 1,45, a 89,5 do centro);
   - legenda "SUAS FINANÇAS · SEU CONTROLE" (`.tinta`), letras da Marcellus em maiúsculas, entre os raios 66,5 e 83, convertidas em curvas.
3. **Linha interna (`.linha`, raio 63,5):** parada, separa o aro do centro.
4. **Monograma (parado):** o M do símbolo (`.tinta`) com a moeda (`.moeda`, raio 23,04 no desenho do símbolo), em escala 0,52.

Cores por variáveis locais: `--selo-fundo`, `--selo-tinta` (linhas, pontos, legenda, M) e `--selo-moeda`.

## Variantes

| Variante / classe | Quando usar | Calacatta (claro) | Portoro (escuro) |
| --- | --- | --- | --- |
| `md-selo` (cheio) | Página Sobre, peças de marca sobre fundo liso. | Disco `ouro`, tinta `mogno`, moeda `marmore` | Disco `superficie`, tinta `ouro`, moeda `tinta` |
| `md-selo md-selo-contorno` | Sobre o mármore ou fotos claras (entrada). | Sem disco, tinta `mogno`, moeda `ouro` | Sem disco, tinta `ouro-texto`, moeda `ouro` |

Arquivos (cores fixas, para `<img>`, README e materiais; em `/marca/`):

| Arquivo | Conteúdo | Uso |
| --- | --- | --- |
| `midas-selo.svg` | Disco `#c19a4b`, tinta `#5b3a24`, moeda `#f5f2ec` | Fundos claros. |
| `midas-selo-noite.svg` | Disco `#221912`, tinta `#d6b263`, moeda `#f2ebe0` | Fundos escuros. |
| `midas-selo-contorno.svg` | Sem disco, tinta `#5b3a24`, moeda `#c19a4b` | Sobre mármore claro ou foto clara. |
| `midas-selo-ouro.svg` | Disco em folha de ouro (gradiente `folha-de-ouro` + reflexo), tinta `#4a2e1b`, moeda `#f5f2ec` | Só momentos especiais. |

Os arquivos são estáticos: o aro não está agrupado para girar. Para a animação de assentar, use o SVG inline do componente.

A moeda do monograma é a única exceção à regra "a moeda é sempre `ouro`": sobre o disco ouro, ela fica em `marmore` (ou `tinta` no Portoro) para aparecer. Nas outras versões, continua `ouro`.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Parado | Aro e centro fixos. | ver Variantes | Padrão fora da entrada, e sempre com movimento reduzido. |
| Assentando | Ao abrir a tela, o aro gira de −20° até 0° em 5s, com `cubic-bezier(.2,.7,.2,1)`, uma única vez, e para; linha interna e monograma parados. | `duracao-selo` | Só na entrada, onde é decorativo. |
| Assentado | O aro parado na posição final (0°), igual ao estado Parado. | | Fim da animação (`animation-fill-mode: both`). |

**Ajuste em relação ao protótipo:** o protótipo girava o aro uma volta a cada 90s, sem parar. Um giro infinito falha na WCAG 2.2.2 (nível A: movimento automático de mais de 5 segundos ao lado de outro conteúdo precisa poder ser pausado). Agora o aro só assenta, uma vez, em 5s, e o token `duracao-selo` passa de 90s para 5s.

O selo não tem hover, foco nem estado de erro: não é interativo.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Tamanho mínimo | 96px | |
| Tamanhos de referência | 96px, 200px (Sobre), 240px (arquivo), 380px (entrada) | |
| Proporção | 1:1 (`viewBox` 202 × 202, 1 unidade de respiro em volta do disco) | |
| Traço das linhas | 1,6 unidades | |
| Raios | disco 100, linha externa 95,5, pontos 89,5, legenda 66,5 a 83, linha interna 63,5 | |
| Área de respiro | um quarto do diâmetro em volta, no mínimo (sugestão) | |
| Opacidade na entrada | 0,50 a 0,55 | |
| Animação do aro | de −20° a 0°, 5s, `cubic-bezier(.2,.7,.2,1)`, uma vez (antes: 360° em 90s, infinita) | `duracao-selo` (5s) |

A 96px, a legenda fica com cerca de 8px de altura: é o menor tamanho em que as letras ainda se distinguem.

## Tokens usados

| Token | Onde |
| --- | --- |
| `ouro` | Disco (claro); tinta (escuro); moeda do contorno. |
| `mogno` | Tinta no claro (cheio e contorno). |
| `superficie` | Disco no escuro. |
| `marmore` | Moeda do cheio no claro. |
| `tinta` | Moeda do cheio no escuro. |
| `ouro-texto` | Tinta do contorno no escuro. |
| `folha-de-ouro` | Disco do `midas-selo-ouro.svg`. |
| `duracao-selo` | Animação de assentar do aro (5s). |

## Conteúdo

- A legenda é fixa: "SUAS FINANÇAS · SEU CONTROLE". Não troque, não traduza, não acrescente data ou versão no aro.
- Em texto (aria-label, `alt`, legendas de imagem), escreva em caixa normal: "Selo Midas: suas finanças, seu controle".
- Não escreva texto por cima do selo nem dentro do centro.
- Não recolora fora dos tokens, não distorça, não gire o selo inteiro (só o aro se move, ao assentar), não aplique sombra ou brilho (o reflexo do `midas-selo-ouro.svg` já faz parte do arquivo).

| Faça | Evite |
| --- | --- |
| `aria-label="Selo Midas: suas finanças, seu controle"` quando é a imagem de marca. | `aria-label="Selo"` ou `aria-label="SUAS FINANÇAS · SEU CONTROLE"`. |
| Selo contorno a 55% no canto da entrada. | Selo cheio atrás do cartão, competindo com o título. |
| Símbolo abaixo de 96px. | Selo de 64px com a legenda ilegível. |

## Acessibilidade

- **Decorativo (entrada, fundos):** `aria-hidden="true"` no `<svg>` (ou no contêiner), sem `role`, sem `aria-label`, com `focusable="false"`. O protótipo da entrada põe `role="img" aria-label=""` dentro de um contêiner `aria-hidden`; remova o `role` e o `aria-label` vazio. Em `<img>`, use `alt=""`.
- **Imagem de marca sozinha (página Sobre, README):** `role="img"` e `aria-label="Selo Midas: suas finanças, seu controle"` no `<svg>`. Em `<img>`, o mesmo texto no `alt`. Os arquivos já trazem `<title>` e `aria-label` com esse texto.
- **Leitor de tela:** decorativo, nada é anunciado; como imagem, "Selo Midas: suas finanças, seu controle, imagem".
- **Informação:** nada depende do selo. A legenda repete a promessa da marca que também está em texto (o aviso de privacidade na entrada).
- **Contraste:** a legenda é parte de um logotipo e está fora da exigência de contraste de texto (WCAG 1.4.3). Mesmo assim, `mogno` sobre `ouro` tem 3,85:1 e `ouro` sobre `superficie` no Portoro, 8,56:1.
- **Movimento reduzido:** com `prefers-reduced-motion: reduce`, nada gira (`animation: none`) e o selo aparece já na posição final, parado.
- **WCAG 2.2.2 (Pausar, parar, ocultar):** a animação dura 5 segundos, acontece uma única vez e termina parada, então não precisa de controle de pausa. Não volte ao giro infinito do protótipo, e não repita a animação em loop ou a cada foco.

## Comportamento responsivo

- O selo escala pelo `width`/`height`; a proporção é sempre 1:1 e os traços acompanham (não use `vector-effect: non-scaling-stroke`).
- Na entrada: 380px no desktop, 280px no celular, sempre cortado no canto inferior direito e atrás do cartão.
- Na página Sobre: 200px no celular, até 240px em telas largas, centralizado.
- Nunca abaixo de 96px em nenhuma largura; se o espaço não comporta, troque pelo símbolo.

## Casos-limite

- **Tema troca com a página aberta:** o selo inline muda de cor na hora, pelas variáveis. Um `<img>` não muda: use `<picture>` com `media="(prefers-color-scheme: dark)"` ou troque o `src` pelo tema.
- **Fundo fotográfico escuro:** o contorno do claro (`mogno`) some. Use `midas-selo-noite.svg` ou o contorno inline com `data-theme="dark"` no contêiner.
- **Impressão:** use `midas-selo-contorno.svg` ou o logo mono; o disco ouro gasta tinta e perde definição em impressora comum.
- **Fonte não carregada:** não afeta. Legenda e monograma estão em curvas.
- **Animação e `transform-origin`:** o aro gira em torno de `0 0`, que é o centro porque o `viewBox` começa em −101. Se alguém mudar o `viewBox` para `0 0 202 202`, o aro passa a girar em torno do canto. Mantenha o `viewBox` original.

## Referência HTML

Selo cheio como imagem de marca (96 pontos e caminhos resumidos):

```html
<svg class="md-selo" width="200" height="200" viewBox="-101 -101 202 202"
     role="img" aria-label="Selo Midas: suas finanças, seu controle">
  <circle class="fundo" r="100"/>
  <g class="aro">
    <circle class="linha" r="95.5"/>
    <g class="tinta">
      <circle cx="89.5" cy="0" r="1.45"/>
      <circle cx="89.31" cy="5.85" r="1.45"/>
      <!-- … 96 pontos, a cada 3,75° -->
    </g>
    <path class="tinta" d="…"/><!-- legenda SUAS FINANÇAS · SEU CONTROLE -->
  </g>
  <circle class="linha" r="63.5"/>
  <g transform="translate(-37 -21.66) scale(0.52)">
    <path class="tinta" d="…"/><!-- M do monograma -->
    <circle class="moeda" cx="72.65" cy="14.04" r="23.04"/>
  </g>
</svg>
```

Selo contorno decorativo (entrada):

```html
<div class="md-entrada-selo" aria-hidden="true">
  <svg class="md-selo md-selo-contorno" viewBox="-101 -101 202 202" focusable="false">…</svg>
</div>
```

Arquivo em `<img>`:

```html
<img src="/marca/midas-selo.svg" width="200" height="200" alt="Selo Midas: suas finanças, seu controle">
```

## Referência CSS

```css
.md-selo { --selo-fundo: var(--ouro); --selo-tinta: var(--mogno); --selo-moeda: var(--marmore); display: inline-block; }
[data-theme="dark"] .md-selo { --selo-fundo: var(--superficie); --selo-tinta: var(--ouro); --selo-moeda: var(--tinta); }
.md-selo .fundo { fill: var(--selo-fundo); }
.md-selo .tinta { fill: var(--selo-tinta); }
.md-selo .linha { fill: none; stroke: var(--selo-tinta); stroke-width: 1.6; }
.md-selo .moeda { fill: var(--selo-moeda); }
/* Ajuste: no protótipo, `animation: md-girar var(--duracao-selo, 90s) linear infinite` (uma volta a cada 90s, sem parar) */
.md-selo .aro { transform-origin: 0 0; animation: md-assentar var(--duracao-selo, 5s) cubic-bezier(.2,.7,.2,1) 1 both; }
.md-selo-contorno { --selo-fundo: transparent; --selo-moeda: var(--ouro); }
[data-theme="dark"] .md-selo-contorno { --selo-fundo: transparent; --selo-moeda: var(--ouro); --selo-tinta: var(--ouro-texto); }
@keyframes md-assentar { from { transform: rotate(-20deg); } to { transform: rotate(0deg); } }

@media (prefers-reduced-motion: reduce) {
  .md-selo .aro { animation: none; }
}

/* Ajustes para o app */
.md-selo.is-parado .aro { animation: none; }   /* fora da entrada: sem animação */
```

## Implementação no app

Base: nenhuma do shadcn/ui; é um SVG inline. Guarde os caminhos longos (legenda e M) num módulo próprio, copiados de `/marca/midas-selo.svg`, e gere os 96 pontos no código.

```tsx
// src/components/midas/seal.tsx
export interface SealProps {
  /** "solid": disco cheio. "outline": só linhas (sobre mármore ou foto clara). */
  variant?: 'solid' | 'outline';
  /** Lado em px. Mínimo 96. */
  size?: number;
  /** true: aria-hidden, sem nome. false: role="img" com o nome da marca. */
  decorative?: boolean;
  /** Aro assenta ao abrir (−20° → 0° em 5s, uma vez). Só na entrada. Padrão: false. */
  animated?: boolean;
  className?: string;
}

const DOTS = Array.from({ length: 96 }, (_, i) => {
  const a = (i * 2 * Math.PI) / 96;
  return { cx: +(89.5 * Math.cos(a)).toFixed(2), cy: +(89.5 * Math.sin(a)).toFixed(2) };
});

export function Seal({ variant = 'solid', size = 200, decorative = false, animated = false, className }: SealProps) {
  const px = Math.max(size, 96);
  const a11y = decorative
    ? { 'aria-hidden': true as const, focusable: 'false' as const }
    : { role: 'img', 'aria-label': 'Selo Midas: suas finanças, seu controle' };
  return (
    <svg viewBox="-101 -101 202 202" width={px} height={px} {...a11y}
      className={cn('md-selo', variant === 'outline' && 'md-selo-contorno', !animated && 'is-parado', className)}>
      <circle className="fundo" r="100" />
      <g className="aro">
        <circle className="linha" r="95.5" />
        <g className="tinta">{DOTS.map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r="1.45" />)}</g>
        <path className="tinta" d={SEAL_LEGEND_PATH} />
      </g>
      <circle className="linha" r="63.5" />
      <g transform="translate(-37 -21.66) scale(0.52)">
        <path className="tinta" d={MONOGRAM_PATH} />
        <circle className="moeda" cx="72.65" cy="14.04" r="23.04" />
      </g>
    </svg>
  );
}
```

Uso:

```tsx
<Seal variant="outline" decorative animated className="size-full" />      // entrada
<Seal size={200} />                                                         // página Sobre
```

Notas:

- As classes `.fundo`, `.tinta`, `.linha`, `.moeda` e `.aro` do `bundle.css` ficam como CSS global (escopadas por `.md-selo`). Em Tailwind, a animação seria um utilitário `animate-assentar` (definido com `--animate-assentar` e o `@keyframes md-assentar` no `@theme`), usado com `motion-reduce:animate-none origin-[0_0]` no `<g>` do aro. Ele substitui o antigo `animate-girar` (giro infinito).
- O componente nunca desenha abaixo de 96px; para tamanhos menores, use o símbolo.
- Em um README do GitHub, use o arquivo com `<picture>`: `<source media="(prefers-color-scheme: dark)" srcset="…/midas-selo-noite.svg">` e `<img src="…/midas-selo.svg" alt="Selo Midas: suas finanças, seu controle" width="160">`.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Selo na entrada, no Sobre, na divulgação e no README. | Selo no painel, em cartões ou listas. |
| 96px ou mais; símbolo abaixo disso. | Selo pequeno com legenda ilegível. |
| O aro assenta uma vez (5s) e para; nada com movimento reduzido. | Girar o selo inteiro ou girar sem parar (giro infinito do protótipo). |
| `aria-hidden` quando enfeita; `role="img"` com nome quando é a marca. | `role="img"` com `aria-label` vazio. |
| Folha de ouro só em momentos especiais. | `midas-selo-ouro.svg` como decoração do dia a dia. |

## Relacionados

- [LoginScreen](login-screen.md), [AppHeader](app-header.md), [Achievement](achievement.md), [README dos componentes](README.md)
- [Marca](../02-marca.md), [Logo](../03-logo.md), [Mármore e texturas](../07-marmore-e-texturas.md), [Ornamentos](../08-ornamentos.md), [Movimento](../10-movimento.md), [Acessibilidade](../12-acessibilidade.md), [Tokens](../14-tokens.md)
