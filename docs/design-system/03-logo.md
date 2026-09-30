# Logo

O sistema de logo do Midas tem quatro peças: o **nome** (logotipo), o **símbolo** (monograma), o **ícone** do app e o **selo**. Todas saem da mesma ideia: uma moeda de ouro segurada pelas letras.

Todos os arquivos ficam em [`public/marca/`](../../public/marca/) e são servidos pelo app em `/marca/…`.

## Construção

### Nome (logotipo)

- Letras da **Marcellus** (fonte de inscrição romana, licença SIL Open Font License), convertidas em curvas e levemente engrossadas para ganhar presença em tamanhos pequenos. O logo não depende da fonte instalada.
- O **i** não tem pingo: no lugar dele fica a **moeda de ouro**, um círculo cheio em `ouro`.
- Proporção do arquivo: 3,25 : 1 (largura : altura). A 28px de altura, o logo tem cerca de 91px de largura; a 40px, cerca de 130px.
- A moeda tem diâmetro de cerca de 26% da altura total do logo. Esse diâmetro é a unidade de medida da área de respiro.

Geometria de referência (unidades do `viewBox` do arquivo):

| Parte | Valor |
| --- | --- |
| `viewBox` do arquivo | `-0.17 -83.26 285.77 88.07` (com 1 unidade de folga) |
| `viewBox` justo (para uso em linha) | `0.83 -82.26 283.77 86.07` |
| Moeda | centro (116,84; −68,88), raio 11,38 |
| Tamanho padrão do arquivo | 155,75 × 48px |

### Símbolo (monograma)

- Um **M** no desenho da Marcellus, engrossado, com a **moeda de ouro apoiada no vale** entre as duas hastes.
- A moeda sobe acima das pontas do M: o conjunto lê como uma **coroa**. É o elemento mais reconhecível da marca.
- Proporção: 1,28 : 1. `viewBox` `-4 -13 150.33 117`; moeda com centro (72,65; 14,04) e raio 23,04.

### Ícone e favicon

- **Ícone** (`midas-icone.svg`): quadrado `mogno` (#5b3a24) com cantos arredondados (raio de 22% do lado), monograma em creme (#f2ebe0) e moeda em ouro do Portoro (#d6b263).
- **Ícone do app** (`midas-icone-app.png`): 512 × 512px, monograma sobre o mármore Portoro, sangrado até a borda para as máscaras de ícone do Android e do iOS. O monograma fica dentro do círculo central com raio de 40% do lado (a zona segura dos ícones mascaráveis; medido: 37%), então sobrevive à máscara redonda.
- **Favicon** (`midas-favicon.svg`): versão reforçada para 16 a 32px. O monograma é maior no quadrado (escala 0,48 em vez de 0,44), o traço é mais grosso e a moeda é um pouco menor e mais afastada das pontas (raio 19,89), para não "grudar" no M em tamanho de aba.

### Selo

Uma moeda antiga, em camadas do centro para fora:

| Camada | Raio (unidades do `viewBox` `-101 -101 202 202`) |
| --- | --- |
| Monograma no centro | escala 0,52, centralizado |
| Linha interna | 63,5 |
| Legenda "SUAS FINANÇAS · SEU CONTROLE" em curvas | entre 66,5 e 83,2 |
| Contas (serrilha de moeda): 96 pontos de raio 1,45 | 89,5 |
| Aro externo (traço de 1,6) | 95,5 |
| Disco | 100 |

Regras completas do selo como componente em [Seal](componentes/seal.md).

## Arquivos

| Arquivo | O que é | Use sobre | Cores |
| --- | --- | --- | --- |
| `midas-logo.svg` | Nome com a moeda | Fundos claros (`marmore`, `superficie`, Calacatta com `veu`) | Letras `mogno` #5b3a24, moeda `ouro` #c19a4b |
| `midas-logo-noite.svg` | Nome com a moeda | Fundos escuros (Portoro) | Letras `tinta` do Portoro #f2ebe0, moeda `ouro` do Portoro #d6b263 |
| `midas-logo-mono.svg` | Nome em uma cor só | Impressão, documentos, carimbos | Tudo em `tinta` #2b1f16 |
| `midas-simbolo.svg` | Monograma | Fundos claros | M `mogno`, moeda `ouro` |
| `midas-simbolo-noite.svg` | Monograma | Fundos escuros | M #f2ebe0, moeda #d6b263 |
| `midas-icone.svg` | Ícone liso | Onde o PNG não servir (manifesto, documentação) | Fundo `mogno`, M creme, moeda ouro |
| `midas-icone-app.png` | Ícone do app, 512px | Tela inicial do celular, manifesto PWA, `apple-touch-icon` | Mármore Portoro, M creme, moeda ouro |
| `midas-favicon.svg` | Favicon reforçado | Aba do navegador, 16 a 32px | Fundo `mogno`, M creme, moeda ouro |
| `midas-selo.svg` | Selo, disco ouro | Fundos claros | Disco `ouro`, tinta `mogno`, moeda `marmore` |
| `midas-selo-noite.svg` | Selo, disco escuro | Fundos escuros | Disco `superficie` do Portoro, tinta `ouro`, moeda creme |
| `midas-selo-contorno.svg` | Selo só em linhas | Sobre o mármore ou fotos claras | Linhas `mogno`, moeda `ouro` |
| `midas-selo-ouro.svg` | Selo em folha de ouro | Só momentos especiais (divulgação, marcos do projeto) | Gradiente `folha-de-ouro`, tinta #4a2e1b |

Os arquivos já trazem as cores fixas. Um SVG usado em `<img>` não herda cor do CSS, então escolha o arquivo certo para o fundo, ou use o logo em linha (abaixo) quando ele precisar trocar de cor com o tema.

## Área de respiro

Deixe livre, em volta de todo o logo, um espaço igual ao **diâmetro da moeda**. Nada entra nessa área: texto, borda de cartão, outro ícone, canto da tela.

```
        ┌──────────────────────────────────┐
        │   ○                              │   ○ = diâmetro da moeda
        │ ○ M ı●d a s ○                     │
        │   ○                              │
        └──────────────────────────────────┘
```

No topo do app (logo com 28 a 32px de altura), isso dá cerca de 8px (`space-2`) de respiro em cada lado, o que o `md-topo` já garante com o `gap` de 16px.

## Tamanhos mínimos

| Peça | Mínimo | Abaixo disso |
| --- | --- | --- |
| Nome | 20px de altura (cerca de 65px de largura) | Use o símbolo. |
| Símbolo | 24px de altura | Use o favicon. |
| Favicon | 16px | É o menor tamanho previsto. |
| Selo | 96px de diâmetro | A legenda deixa de ser legível: use o símbolo. |

Tamanhos de uso no app:

| Lugar | Peça | Tamanho |
| --- | --- | --- |
| Topo do app (`AppHeader`) | Nome em linha | 28px no celular, 32px a partir de 768px |
| Tela de entrada e cadastro | Nome em linha | 40px, centralizado |
| Carregamento inicial | Símbolo | 48px |
| Avatar sem apelido | Símbolo | 24px dentro do círculo de 44px |
| Página "Sobre" | Selo | 160 a 200px |
| Aba do navegador | Favicon | 16 a 32px (automático) |

## Logo em linha (SVG inline que troca de cor com o tema)

No app, o logo do topo é desenhado em linha, para trocar de cor com o tema sem trocar de arquivo. As partes recebem classes e as cores vêm dos tokens:

```html
<svg class="md-logo" viewBox="0.83 -82.26 283.77 86.07" role="img" aria-label="Midas">
  <path class="tinta" d="…" />
  <circle class="moeda" cx="116.84" cy="-68.88" r="11.38" />
</svg>
```

```css
.md-logo { display: block; height: 28px; width: auto; }
.md-logo .tinta { fill: var(--mogno); }
.md-logo .moeda { fill: var(--ouro); }
[data-theme="dark"] .md-logo .tinta { fill: var(--tinta); }
```

Sugestão de componente React (`src/components/midas/logo.tsx`), com o caminho copiado de `public/marca/midas-logo.svg`:

```tsx
type LogoProps = {
  /** Altura em px. O mínimo é 20. */
  height?: number;
  /** Quando o logo só enfeita (por exemplo, ao lado do nome "Midas" escrito), esconda do leitor de tela. */
  decorative?: boolean;
  className?: string;
};

export function Logo({ height = 28, decorative = false, className }: LogoProps) {
  return (
    <svg
      viewBox="0.83 -82.26 283.77 86.07"
      height={height}
      className={cn("block w-auto", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Midas" })}
    >
      <path className="fill-mogno dark:fill-tinta" d={LOGO_PATH} />
      <circle className="fill-ouro" cx="116.84" cy="-68.88" r="11.38" />
    </svg>
  );
}
```

O mesmo vale para o símbolo (`Symbol`/`Monogram`), com `viewBox="-4 -13 150.33 117"` e a moeda em `cx="72.65" cy="14.04" r="23.04"`.

Quando o logo for um link para o painel, o link recebe o nome acessível, e o SVG fica decorativo:

```html
<a href="/" aria-label="Midas, ir para o painel"><svg class="md-logo" aria-hidden="true">…</svg></a>
```

## Ícones do app no Next.js

Quando o app for criado, use as convenções de arquivo do App Router:

| Arquivo no app | Origem | Para quê |
| --- | --- | --- |
| `src/app/icon.svg` | cópia de `public/marca/midas-favicon.svg` | Favicon moderno (SVG) |
| `src/app/apple-icon.png` | `public/marca/midas-icone-app.png` reduzido para 180 × 180px | Ícone na tela inicial do iPhone |
| `src/app/manifest.ts` | `midas-icone-app.png` em 192 e 512px | Instalação como app (PWA), com `purpose: "maskable"` no de 512px |

A cor do tema do navegador (`theme-color`) é `#f5f2ec` no tema claro e `#17110c` no escuro.

## Regras de uso

**A moeda é sempre ouro.** Ela é o coração da marca.

- Faça: use o arquivo certo para o fundo (claro, noite, mono).
- Faça: mantenha a área de respiro e o tamanho mínimo.
- Faça: sobre o mármore, coloque o logo dentro de um cartão `superficie` ou sobre o `veu`.
- Evite: trocar a cor da moeda, girar, inclinar, distorcer ou espelhar o logo.
- Evite: aplicar sombra, brilho, contorno, gradiente ou efeito 3D.
- Evite: colocar o logo direto sobre os veios do mármore, sobre fotos ou sobre padrões.
- Evite: redesenhar o logo com a fonte Marcellus digitada (o logo é desenhado e engrossado; a fonte pura fica diferente).
- Evite: recriar o pingo do i com outro elemento (cifrão, estrela, ponto comum).
- Evite: usar o selo como logo em tamanhos pequenos ou dentro do painel.
- Evite: escrever "MIDAS" em maiúsculas ao lado do logo.

## Acessibilidade

- Logo sozinho como imagem: `role="img"` e `aria-label="Midas"` (os arquivos já trazem `<title>Midas</title>`).
- Logo dentro de um link: o nome acessível vai no link ("Midas, ir para o painel") e o SVG leva `aria-hidden="true"`.
- Logo ao lado do nome escrito: decorativo (`aria-hidden="true"`), para o leitor de tela não repetir "Midas Midas".
- Contraste: letras `mogno` sobre `marmore` têm 9,06:1; no Portoro, `tinta` sobre `marmore` tem 15,81:1.

## Origem dos arquivos

O nome, o símbolo e a legenda do selo foram gerados a partir dos contornos da Marcellus (SIL Open Font License) com scripts em Python (fontTools e pyclipper). Os scripts ficam fora do repositório do app, junto do material de design. Para ajustes finos, prefira editar os SVGs existentes a gerar tudo de novo.
