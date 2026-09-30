# Tipografia

A tipografia do Midas combina duas vozes: **letras de inscrição romana** nos títulos (a personalidade) e uma **fonte criada para baixa visão** em todo o resto (a clareza). Os números têm regras próprias, porque em um app de finanças eles são o conteúdo principal.

## Famílias

| Token | Família | Autoria e licença | Pesos usados | Papel |
| --- | --- | --- | --- | --- |
| `display` | **Midas Display** (composta: letras da Marcellus + algarismos da Cormorant Garamond 700) | Marcellus: Astigmatic (Brian J. Bonislawsky), SIL OFL 1.1 | 400 | Títulos de página, de seção e de cartão. |
| `classica` | **Cormorant Garamond** | Christian Thalmann (Catharsis Fonts), SIL OFL 1.1 | 700 normal, 600 itálico | Números grandes (saldo, conquista) e o acento em itálico dourado. |
| `sans` | **Atkinson Hyperlegible Next** | Braille Institute, SIL OFL 1.1 | 400, 600, 700 | Todo o texto de interface: corpo, rótulos, botões, ajuda. |
| `mono` | **Atkinson Hyperlegible Mono** | Braille Institute, SIL OFL 1.1 | 400, 500, 600 | Valores em listas e tabelas. |

Pilhas completas (com fontes de reserva):

```css
--font-display: "Midas Display", "Marcellus", Georgia, serif;
--font-classica: "Cormorant Garamond", Georgia, serif;
--font-sans: "Atkinson Hyperlegible Next", "Atkinson Hyperlegible", system-ui, sans-serif;
--font-mono: "Atkinson Hyperlegible Mono", ui-monospace, monospace;
```

### Por que essas fontes

- **Marcellus** tem o desenho das inscrições romanas gravadas em pedra: dá o tom clássico do mármore sem perder a leitura em tamanhos de título.
- **Atkinson Hyperlegible** foi criada pelo Braille Institute para pessoas com baixa visão: letras que costumam se confundir (I, l, 1; O, 0; rn, m) têm formas bem diferentes. É a escolha certa para quem tem dificuldade de leitura, e é bonita para todo mundo.
- **Cormorant Garamond** tem números clássicos e elegantes, que conversam com a Marcellus e são claros em tamanhos grandes.

## A regra dos números

**Nunca escreva números com a Marcellus pura.** Os algarismos da Marcellus parecem letras: o 1 parece um I maiúsculo e o 0 parece um O. Em um app de dinheiro, isso é inaceitável.

Por isso existe a **Midas Display**, uma família composta por `unicode-range`:

- Letras, pontuação e símbolos (inclusive `R$`, vírgula e ponto) vêm da **Marcellus**.
- Os dez algarismos (`U+0030` a `U+0039`) vêm da **Cormorant Garamond 700**, aumentados em 12% (`size-adjust: 112%`) para ficarem da altura das maiúsculas da Marcellus.

O resultado: "Setembro de 2026" num título mostra letras romanas e números claros, sem nenhum trabalho extra de quem escreve o código.

| Onde há número | Fonte |
| --- | --- |
| Título com número no meio ("Dezembro deve fechar com R$ 6.300 de sobra") | `display` (Midas Display resolve sozinha) |
| Saldo do mês, valor grande | `classica` 700 com `lining-nums` (`display-xl`) |
| Valor da conquista dentro dos louros | `classica` 700, 36/40, `lining-nums tabular-nums` |
| Valores em listas e tabelas | `mono` 500 com `tabular-nums` (`amount`) |
| Entrou/Saiu no cartão de saldo | `mono` 500, 19/26, `tabular-nums` |
| Campo de valor enquanto a pessoa digita | `sans` 600, 32/40, `tabular-nums`, para conferir cada dígito |
| Números no meio de texto corrido | `sans` (proporcionais, como estão) |

Todos os números usam **algarismos alinhados** (`lining-nums`). Em colunas e listas, use também **algarismos tabulares** (`tabular-nums`), para que as casas decimais fiquem alinhadas.

## Escala

Os tamanhos estão em px para leitura; no app eles são definidos em `rem` (base 16px), para crescerem junto com o tamanho de fonte que a pessoa escolheu no aparelho.

| Estilo | Família | Tamanho / entrelinha | rem | Peso | Uso |
| --- | --- | --- | --- | --- | --- |
| `display-xl` | `classica` | 48 / 52 | 3 / 3,25 | 700 | O saldo do mês. É o único número desse tamanho na tela. |
| `display-lg` | `display` | 34 / 40 | 2,125 / 2,5 | 400 | Título da página e saudação. |
| `acento` | `classica` itálico | 1,12em (38 / 40 dentro de um `display-lg`) | — | 600 | Uma expressão em itálico dourado dentro de um título display. |
| `heading` | `display` | 24 / 30 | 1,5 / 1,875 | 400 | Título de seção e de cartão; título de estado vazio e da conquista. |
| `title` | `sans` | 19 / 26 | 1,1875 / 1,625 | 600 | Título de diálogo e de folha; item em destaque. |
| `body` | `sans` | 17 / 26 | 1,0625 / 1,625 | 400 | Texto corrido. **Nunca menor que 17px.** |
| `label` | `sans` | 15 / 20 | 0,9375 / 1,25 | 600 | Rótulos de campo, botões, abas, chips, alternador. |
| `caption` | `sans` | 14 / 20 | 0,875 / 1,25 | 400 | Datas, ajuda de campo, notas, eixos de gráfico. **O menor tamanho do sistema.** |
| `amount` | `mono` | 17 / 24 | 1,0625 / 1,5 | 500 | Valores em listas e tabelas, alinhados à direita. |
| `eyebrow` | `sans` | 14 / 20 | 0,875 / 1,25 | 600 | Sobretítulo em maiúsculas, com espaçamento de 0,06em, em `tinta-suave`. Só no topo de cartões e seções. |

Tamanhos especiais, definidos nos componentes:

| Onde | Estilo |
| --- | --- |
| Valor digitado no [MoneyInput](componentes/money-input.md) | `sans` 600, 32 / 40, `tabular-nums`; prefixo "R$" em `display` 20px `tinta-suave` |
| Valor da [conquista](componentes/achievement.md) | `classica` 700, 36 / 40 |
| Título dentro do cartão de entrada | `display` 30 / 36 (o `display-lg` reduzido para caber no cartão de 400px) |
| Descrição na [linha de lançamento](componentes/transaction-row.md) | `sans` 600, 17 / 24 |
| Texto do [aviso](componentes/notice.md) | `sans` 400, 15 / 22 |
| Iniciais do avatar | `display` 17px, espaçamento 0,04em |

O protótipo usa 13px nos rótulos dos eixos do gráfico; no app, use 14px (`caption`), o menor tamanho do sistema.

### Tamanho em telas estreitas

- O saldo (`display-xl`) usa `font-size: clamp(2.5rem, 1rem + 8vw, 3rem)`: cerca de 42px em telas de 320px e 48px a partir de 400px.
- Títulos `display-lg` quebram em várias linhas com `text-wrap: balance`; não reduza o tamanho para caber em uma linha.
- Com fonte ampliada pela pessoa, o saldo pode quebrar a linha depois do "R$". Nunca force rolagem horizontal. Em listas, o valor nunca quebra: quem encolhe é a descrição, com reticências.

## Acento: o itálico dourado

O acento é a assinatura tipográfica do Midas: **uma** palavra ou expressão curta, em Cormorant Garamond itálica 600, na cor `ouro-texto`, dentro de um título display.

```html
<h1 class="md-display">Bom dia, Miguel. Setembro vai <em class="md-acento">bem</em>.</h1>
```

```css
.md-acento {
  font-family: var(--font-classica);
  font-style: italic;
  font-weight: 600;
  font-size: 1.12em;          /* compensa o olho menor da Cormorant */
  letter-spacing: -0.01em;
  color: var(--ouro-texto);
}
```

Regras:

- **No máximo um acento por título.** De uma a três palavras.
- Só em títulos `display-lg` e `heading`. Nunca em texto corrido, botões, rótulos, listas ou números.
- O acento marca o ponto positivo ou acolhedor da frase: "vai *bem*", "*no azul*", "*de novo*", "começa *aqui*", "em *ordem*".
- **Notícia ruim não leva acento.** "Setembro fechou com R$ 210 a menos." fica sem itálico dourado.
- Use o elemento `<em>`: a ênfase é real, e leitores de tela podem anunciá-la.
- O número nunca vai no acento ("vai *R$ 300* melhor" não).

| Faça | Evite |
| --- | --- |
| "Mês fechado *no azul*." | "Mês *fechado* no *azul*." (dois acentos) |
| "Que bom te ver *de novo*." | "*Que bom te ver de novo.*" (frase inteira) |
| "Outubro começa *aqui*." | "Adicionar *gasto*" (botão) |
| "Setembro fechou com R$ 210 a menos." | "Setembro fechou *no vermelho*." (acento em notícia ruim) |

## Sobretítulo (eyebrow)

```css
.md-eyebrow {
  font: 600 14px/20px var(--font-sans);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--tinta-suave);
}
```

- Só no topo de cartões e seções: "Sobrou em setembro", "Renda x gastos", "Quarta, 30 de setembro".
- Escreva o texto normalmente ("Sobrou em setembro"); a caixa-alta vem do CSS. Assim o leitor de tela lê a frase, e não letra por letra.

## Regras gerais

- **Caixa de frase** em tudo: só a primeira letra da frase e os nomes próprios em maiúscula. "Adicionar gasto", não "Adicionar Gasto".
- **Nunca digite texto em maiúsculas.** Quando o desenho pede caixa-alta (sobretítulo, aro do selo), use `text-transform`.
- **Negrito** só em `label`, `title`, na frase-resumo de um aviso e em valores de destaque. Não use negrito para "chamar atenção" no meio de parágrafos.
- **Itálico** só no acento. Não use itálico em texto de interface.
- **Sublinhado** só em links (`md-link`: 1px, afastado 3px, em `ouro-texto`, peso 600).
- **Comprimento de linha:** até 65 caracteres em texto corrido; 32 a 40 caracteres em frases de estado vazio e da conquista.
- `text-wrap: balance` em títulos; `text-wrap: pretty` em parágrafos (melhora progressiva).
- Entrelinha nunca abaixo de 1,2 em títulos nem de 1,5 em texto corrido.
- Respeite a configuração de tamanho de fonte da pessoa: tamanhos em `rem`, nada de `maximum-scale` ou `user-scalable=no` na meta viewport.

## Carregamento das fontes no app

As fontes são **servidas pelo próprio app**, nunca buscadas no Google a cada visita. Isso evita enviar o endereço IP da pessoa a terceiros (boa prática de LGPD) e deixa o carregamento mais rápido.

### Atkinson Next, Atkinson Mono e Cormorant Garamond: `next/font/google`

O `next/font` baixa as fontes na hora do build e as serve do próprio domínio, com fontes de reserva ajustadas para evitar saltos de layout. Sugestão (`src/app/fonts.ts`; confira os nomes exportados na versão do Next.js usada):

```ts
import { Atkinson_Hyperlegible_Next, Atkinson_Hyperlegible_Mono, Cormorant_Garamond } from "next/font/google";

export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-atkinson",
});

export const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-atkinson-mono",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});
```

As variáveis entram no `<html>` (`className={`${atkinson.variable} ${atkinsonMono.variable} ${cormorant.variable}`}`) e são ligadas aos tokens em [Tokens](14-tokens.md#3-tokens-ligados-ao-tailwind).

### Midas Display: `@font-face` próprio

A família composta precisa de `unicode-range` por arquivo, o que o `next/font` não faz. Ela é declarada à mão, com os arquivos em `public/fontes/` (junto do `OFL.txt` das duas fontes):

| Arquivo | Conteúdo | Como obter |
| --- | --- | --- |
| `public/fontes/marcellus-latin.woff2` | Marcellus 400, subconjunto latino | Google Fonts ou pacote `@fontsource/marcellus` |
| `public/fontes/marcellus-latin-ext.woff2` | Marcellus 400, latino estendido | Idem |
| `public/fontes/cormorant-garamond-700-digitos.woff2` | Só os dez algarismos da Cormorant Garamond 700 | `pyftsubset CormorantGaramond-Bold.ttf --unicodes=U+0030-0039 --flavor=woff2 --output-file=cormorant-garamond-700-digitos.woff2` |

```css
/* Midas Display: letras da Marcellus + algarismos da Cormorant Garamond 700 */
@font-face {
  font-family: "Midas Display";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fontes/marcellus-latin.woff2") format("woff2");
  unicode-range: U+0000-002F, U+003A-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Midas Display";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fontes/marcellus-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-0130, U+0132-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F,
    U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Midas Display";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fontes/cormorant-garamond-700-digitos.woff2") format("woff2");
  unicode-range: U+0030-0039;
  size-adjust: 112%;
}
```

Repare que o primeiro intervalo pula `U+0030-0039` (os algarismos): é isso que faz os números virem da Cormorant.

Pré-carregue a Marcellus latina no layout raiz, porque ela aparece no primeiro título de quase toda tela:

```tsx
<link rel="preload" href="/fontes/marcellus-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
```

Sirva os arquivos de `public/fontes/` com cache longo (`Cache-Control: public, max-age=31536000, immutable`) e troque o nome do arquivo se a fonte mudar.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Números grandes em `classica` 700 com `lining-nums`. | Números na Marcellus pura. |
| Valores de lista em `mono` com `tabular-nums`, à direita. | Valores em fonte proporcional desalinhados. |
| Texto corrido em 17px. | Texto de interface abaixo de 14px. |
| Um acento dourado por título, em momento bom ou neutro. | Acento em botão, rótulo, número ou notícia ruim. |
| Caixa-alta por CSS no sobretítulo. | Texto digitado em maiúsculas. |
| Fontes servidas pelo próprio app. | Links para `fonts.googleapis.com` no app em produção. |
