# Tokens

Os tokens são as decisões do design system em forma de dados: cores, fontes, tamanhos, espaços, cantos, sombra, gradiente e tempos. A fonte da verdade é [`tokens.json`](tokens.json), nesta pasta. O app usa os tokens como **variáveis CSS**, expostas ao **Tailwind CSS v4** por `@theme`.

## Convenções

- **Nomes em português**, em minúsculas com hífen: `marmore`, `superficie-funda`, `ouro-texto`, `duracao-toque`.
- Cada cor tem valor para os dois temas: `light` (Calacatta) e `dark` (Portoro). Tokens que apontam para outros usam chaves: `primario` = `{mogno}` no claro e `{ouro}` no escuro.
- Nenhum componente usa valor hexadecimal, px de espaço fora da escala ou duração solta. Sempre o token.
- Os tokens mudam por proposta documentada (veja [Como propor um token novo](#como-propor-um-token-novo)).

## Mapa dos tokens

| Grupo | Tokens | Utilitários Tailwind |
| --- | --- | --- |
| Cores | `marmore`, `superficie`, `superficie-funda`, `veio`, `borda`, `tinta`, `tinta-suave`, `ouro`, `sobre-ouro`, `ouro-texto`, `mogno`, `primario`, `primario-hover`, `sobre-primario`, `renda`, `renda-fundo`, `gasto`, `gasto-fundo`, `alerta`, `veu`, `brilho`, `foco`, `grafico-renda`, `grafico-gasto`, `grafico-projecao`, `grafico-cat-1` a `grafico-cat-5`, `grafico-cat-outros` | `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`, `outline-*`, `ring-*` com o nome do token: `bg-superficie`, `text-tinta-suave`, `border-borda`, `fill-ouro`, `outline-foco` |
| Fontes | `display`, `classica`, `sans`, `mono` | `font-display`, `font-classica`, `font-sans`, `font-mono` |
| Tipos | `display-xl`, `display-lg`, `heading`, `title`, `body`, `label`, `caption`, `amount` | `text-display-xl`, `text-display-lg`, `text-heading`, `text-title`, `text-body`, `text-label`, `text-caption`, `text-amount` (tamanho + entrelinha, e peso onde houver) |
| Espaço | `space-1` (4), `space-2` (8), `space-3` (12), `space-4` (16), `space-6` (24), `space-8` (32), `space-12` (48) | Escala padrão do Tailwind: `p-1`, `gap-2`, `mt-3`, `px-4`, `p-6`, `gap-8`, `min-h-12` |
| Cantos | `radius-sm` (6), `radius-md` (10), `radius-lg` (16), `radius-pill` (999) | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-pill` |
| Sombra | `sombra-cartao` | `shadow-cartao` |
| Gradiente | `folha-de-ouro` | `bg-folha-de-ouro` (utilitário próprio) |
| Duração | `duracao-rapida` (150ms), `duracao-toque` (650ms), `duracao-selo` (5s) | `duration-(--duracao-rapida)`; animações `animate-onda`, `animate-brilho`, `animate-assentar` |

## CSS pronto para o app

O bloco abaixo é o começo do `src/app/globals.css` do app. Ele define os tokens nos dois temas, liga os tokens ao Tailwind e declara as classes do sistema (`md-*`) que não viram utilitários.

### 1. Importação e variante escura

```css
@import "tailwindcss";

/* O tema escuro é o atributo data-theme="dark" no <html> (next-themes com attribute="data-theme"). */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

### 2. Tokens por tema

```css
/* ——— Calacatta (claro, padrão) ——— */
:root {
  color-scheme: light;

  --marmore: #f5f2ec;
  --superficie: #fdfbf7;
  --superficie-funda: #ebe5db;
  --veio: #ddd4c7;
  --borda: #8a7a68;
  --tinta: #2b1f16;
  --tinta-suave: #65564a;
  --ouro: #c19a4b;
  --sobre-ouro: #2b1f16;
  --ouro-texto: #7e5b17;
  --mogno: #5b3a24;
  --primario: var(--mogno);
  --primario-hover: #4a2e1b;
  --sobre-primario: #fbf7f0;
  --renda: #1d6470;
  --renda-fundo: #dcebec;
  --gasto: #a3402a;
  --gasto-fundo: #f5e1da;
  --alerta: #8a5a00;
  --veu: rgba(253, 251, 247, 0.76);
  --brilho: rgba(193, 154, 75, 0.32);
  --foco: #7e5b17;
  --grafico-renda: var(--renda);
  --grafico-gasto: var(--gasto);
  --grafico-projecao: var(--ouro);
  /* Fatias da rosca por categoria, pela posição (a maior é a 1). */
  --grafico-cat-1: #2a78d6;
  --grafico-cat-2: #c4520f;
  --grafico-cat-3: #138a60;
  --grafico-cat-4: #a87200;
  --grafico-cat-5: #c2477a;
  --grafico-cat-outros: var(--borda);

  --sombra-cartao: 0 1px 2px rgba(43, 31, 22, 0.06), 0 8px 24px rgba(43, 31, 22, 0.06);
  --folha-de-ouro: linear-gradient(135deg, #ecd58f 0%, #c9a04d 38%, #a97f31 62%, #dcbb6c 100%);
  --textura: url("/texturas/marmore-calacatta.webp");

  --duracao-rapida: 150ms;
  --duracao-toque: 650ms;
  --duracao-selo: 5s;
}

/* ——— Portoro (escuro) ——— */
:root[data-theme="dark"] {
  color-scheme: dark;

  --marmore: #17110c;
  --superficie: #221912;
  --superficie-funda: #2d2219;
  --veio: #3d2f24;
  --borda: #8a7866;
  --tinta: #f2ebe0;
  --tinta-suave: #c2b3a2;
  --ouro: #d6b263;
  --sobre-ouro: #1d140d;
  --ouro-texto: #e2c27a;
  --mogno: #7a5033;
  --primario: var(--ouro);
  --primario-hover: #e2c27a;
  --sobre-primario: #1d140d;
  --renda: #7cc3cf;
  --renda-fundo: #1c2d2f;
  --gasto: #ec957c;
  --gasto-fundo: #3a2019;
  --alerta: #f0c060;
  --veu: rgba(34, 25, 18, 0.8);
  --brilho: rgba(214, 178, 99, 0.28);
  --foco: #e2c27a;

  --grafico-cat-1: #3987e5;
  --grafico-cat-2: #d95926;
  --grafico-cat-3: #199e70;
  --grafico-cat-4: #c98500;
  --grafico-cat-5: #d55181;

  --sombra-cartao: 0 1px 2px rgba(0, 0, 0, 0.5);
  --textura: url("/texturas/marmore-portoro.webp");
}
```

O tema claro é o padrão, inclusive sem JavaScript: o Portoro só vale com `data-theme="dark"`, quando a pessoa escolhe "Escuro" (ou "Automático" com o aparelho no escuro) em Configurações. Um teste que lê `tokens.json` e compara com o CSS evita que os dois se separem.

**Por que não `light-dark()`?** A função CSS `light-dark()` evitaria a repetição, mas só funciona a partir do Safari 17.5, e parte do público usa iPhones mais antigos. O piso de navegadores do app é o do Tailwind v4 (Safari 16.4, Chrome 111, Firefox 128).

**Por que as variáveis de gráfico não se repetem no escuro?** `--grafico-renda: var(--renda)` é resolvida onde é usada, então acompanha o `--renda` do tema sem precisar ser redeclarada. As cores das fatias (`grafico-cat-1` a `grafico-cat-5`) são a exceção: cada tema tem os seus tons, escolhidos juntos e conferidos com o validador de paleta (faixa de luminosidade, croma, separação para daltonismo entre fatias vizinhas e contraste de 3:1 ou mais sobre `superficie`). Na rosca, a separação entre fatias vizinhas fica entre 7,6 e 8,4 (ΔE OKLab) para protanopia; por isso as fatias têm 2px de espaço entre si e a legenda com nome e porcentagem é obrigatória.

### 3. Tokens ligados ao Tailwind

```css
/* Tira as paletas padrão do Tailwind: só existem as cores e fontes do Midas. */
@theme {
  --color-*: initial;
  --font-*: initial;
}

/* Cores e sombra que trocam com o tema: "inline" faz o utilitário usar var(--token) direto. */
@theme inline {
  --color-marmore: var(--marmore);
  --color-superficie: var(--superficie);
  --color-superficie-funda: var(--superficie-funda);
  --color-veio: var(--veio);
  --color-borda: var(--borda);
  --color-tinta: var(--tinta);
  --color-tinta-suave: var(--tinta-suave);
  --color-ouro: var(--ouro);
  --color-sobre-ouro: var(--sobre-ouro);
  --color-ouro-texto: var(--ouro-texto);
  --color-mogno: var(--mogno);
  --color-primario: var(--primario);
  --color-primario-hover: var(--primario-hover);
  --color-sobre-primario: var(--sobre-primario);
  --color-renda: var(--renda);
  --color-renda-fundo: var(--renda-fundo);
  --color-gasto: var(--gasto);
  --color-gasto-fundo: var(--gasto-fundo);
  --color-alerta: var(--alerta);
  --color-veu: var(--veu);
  --color-brilho: var(--brilho);
  --color-foco: var(--foco);
  --color-grafico-renda: var(--grafico-renda);
  --color-grafico-gasto: var(--grafico-gasto);
  --color-grafico-projecao: var(--grafico-projecao);
  --color-grafico-cat-1: var(--grafico-cat-1);
  --color-grafico-cat-2: var(--grafico-cat-2);
  --color-grafico-cat-3: var(--grafico-cat-3);
  --color-grafico-cat-4: var(--grafico-cat-4);
  --color-grafico-cat-5: var(--grafico-cat-5);
  --color-grafico-cat-outros: var(--grafico-cat-outros);

  --shadow-cartao: var(--sombra-cartao);

  /* As variáveis --font-atkinson, --font-atkinson-mono e --font-cormorant vêm do next/font (veja Tipografia). */
  --font-display: "Midas Display", "Marcellus", Georgia, serif;
  --font-classica: var(--font-cormorant), "Cormorant Garamond", Georgia, serif;
  --font-sans: var(--font-atkinson), "Atkinson Hyperlegible Next", "Atkinson Hyperlegible", system-ui, sans-serif;
  --font-mono: var(--font-atkinson-mono), "Atkinson Hyperlegible Mono", ui-monospace, monospace;
}

/* Escala de tipos, cantos e animações (iguais nos dois temas). Tamanhos em rem: 1rem = 16px. */
@theme {
  --text-display-xl: 3rem;              /* 48px */
  --text-display-xl--line-height: 3.25rem;  /* 52px */
  --text-display-xl--font-weight: 700;
  --text-display-lg: 2.125rem;          /* 34px */
  --text-display-lg--line-height: 2.5rem;   /* 40px */
  --text-heading: 1.5rem;               /* 24px */
  --text-heading--line-height: 1.875rem;    /* 30px */
  --text-title: 1.1875rem;              /* 19px */
  --text-title--line-height: 1.625rem;      /* 26px */
  --text-title--font-weight: 600;
  --text-body: 1.0625rem;               /* 17px */
  --text-body--line-height: 1.625rem;       /* 26px */
  --text-label: 0.9375rem;              /* 15px */
  --text-label--line-height: 1.25rem;       /* 20px */
  --text-label--font-weight: 600;
  --text-caption: 0.875rem;             /* 14px */
  --text-caption--line-height: 1.25rem;     /* 20px */
  --text-amount: 1.0625rem;             /* 17px */
  --text-amount--line-height: 1.5rem;       /* 24px */
  --text-amount--font-weight: 500;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  --animate-onda: md-onda var(--duracao-toque) cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  --animate-brilho: md-brilho var(--duracao-toque) ease-out 1 both;
  --animate-assentar: md-assentar var(--duracao-selo) cubic-bezier(0.2, 0.7, 0.2, 1) 1 both;

  @keyframes md-onda { to { transform: scale(28); opacity: 0; } }
  @keyframes md-brilho { from { background-position: 120% 0; } to { background-position: -60% 0; } }
  @keyframes md-assentar { from { transform: rotate(-20deg); } to { transform: rotate(0deg); } }
}

@utility bg-folha-de-ouro {
  background-image: var(--folha-de-ouro);
}
```

A escala de espaço não precisa de nada: o `--spacing` padrão do Tailwind (0,25rem) já coincide com os tokens. **Use só os passos 1, 2, 3, 4, 6, 8 e 12.**

### 4. Base

```css
@layer base {
  html {
    background: var(--marmore);
    color: var(--tinta);
    font-family: var(--font-sans);
    -webkit-text-size-adjust: 100%;
  }
  body {
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    font-variant-numeric: lining-nums;
  }
  :focus-visible {
    outline: 2px solid var(--foco);
    outline-offset: 2px;
  }
  h1, h2, h3 { text-wrap: balance; }
  p { text-wrap: pretty; }
}
```

O Tailwind v4 só publica no `:root` as variáveis de tema que o projeto usa. Se alguma delas (por exemplo `--text-body`) não aparecer no CSS gerado, declare o bloco correspondente como `@theme static`.

### 5. Classes do sistema

Algumas peças do Midas são mais claras como classes do que como uma fileira de utilitários. Elas ficam no CSS global, com o prefixo `md-`:

| Classe | O que faz | Definida em |
| --- | --- | --- |
| `md-marmore` | Textura do tema sob o `veu`, sobre `superficie` | [Mármore e texturas](07-marmore-e-texturas.md#implementação) |
| `md-marmore-pleno` | Textura inteira sobre `marmore` | [Mármore e texturas](07-marmore-e-texturas.md#implementação) |
| `md-veio` | Divisória ondulada de ouro (máscara SVG) | [Ornamentos](08-ornamentos.md#veio-de-ouro) |
| `md-acento` | Itálico dourado dentro de título | [Tipografia](05-tipografia.md#acento-o-itálico-dourado) |
| `md-eyebrow` | Sobretítulo em maiúsculas | [Tipografia](05-tipografia.md#sobretítulo-eyebrow) |
| `md-moeda` | Moeda em folha de ouro | [Ornamentos](08-ornamentos.md#moeda) |
| `md-onda`, `md-brilho` | Onda e reflexo do toque de ouro | [Movimento](10-movimento.md#toque-de-ouro) |
| `md-sr` | Texto só para leitor de tela (igual a `sr-only`) | [Acessibilidade](12-acessibilidade.md#texto-escondido) |

As demais classes `md-*` que aparecem nas páginas de componentes (`md-btn`, `md-chip`, `md-tx`…) são a **referência do protótipo**. No app, elas viram componentes React com utilitários Tailwind; não é preciso copiá-las para o CSS global.

### 6. Modos especiais

```css
@media (prefers-reduced-motion: reduce) {
  .md-onda { display: none; }
  .md-brilho, .md-selo .aro { animation: none; }
}

@media (forced-colors: active) {
  .md-marmore, .md-marmore-pleno { background-image: none; }
  .md-veio { background: CanvasText; }
}

@media print {
  .md-marmore, .md-marmore-pleno { background: none; }
}
```

## Tema no Next.js

- Use `next-themes` com `attribute="data-theme"`, `defaultTheme="light"`, `enableSystem` e `disableTransitionOnChange`. Ele aplica o tema antes da primeira pintura (sem piscar) e guarda a escolha no aparelho.
- O `<html>` recebe `suppressHydrationWarning`, porque o atributo muda antes da hidratação.
- A meta `theme-color` usa o `marmore` do tema padrão: `#f5f2ec`.
- Em Configurações, o controle de tema tem três opções: "Claro" (marcado de início), "Escuro" e "Automático".

## Nomes do protótipo e nomes do app

O protótipo (o design system publicado) usa as variáveis `--font-display`, `--font-classica`, `--font-sans` e `--font-mono` diretamente, e as larguras de espaço como `--space-1` a `--space-12` e cantos como `--radius-*`. No app:

| Protótipo | App |
| --- | --- |
| `var(--space-4)` | utilitário `p-4`, `gap-4`… ou `var(--spacing) * 4` |
| `var(--radius-lg)` | `rounded-lg` ou `var(--radius-lg)` |
| `var(--sombra-cartao)` | `shadow-cartao` ou `var(--sombra-cartao)` |
| `font: 600 15px/20px var(--font-sans)` | `font-sans text-label` |
| `var(--duracao-rapida)` | `duration-(--duracao-rapida)` |

## Como propor um token novo

1. Confira se um token existente não resolve. A maioria dos pedidos de cor nova é, na verdade, um uso de `tinta-suave`, `superficie-funda` ou `ouro-texto`.
2. Escreva a proposta num PR que altere, juntos: `tokens.json`, esta página, a página do fundamento ([Cores](04-cores.md), [Tipografia](05-tipografia.md)…) e o `globals.css`.
3. Para cor: valores nos dois temas, uso, e os contrastes medidos contra `marmore`, `superficie` e `superficie-funda` (4,5:1 para texto, 3:1 para bordas e ícones).
4. Registre a mudança no [histórico do design system](README.md#histórico).
