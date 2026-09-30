# Ornamentos

Os ornamentos são pequenos objetos clássicos que dão personalidade ao Midas: o **veio de ouro**, a **coroa de louros**, a **coluna jônica**, o **selo** e a **moeda**. Cada um tem um lugar certo e um limite. Todos são **decorativos**: levam `aria-hidden="true"` e nunca carregam uma informação que não esteja também em texto.

| Ornamento | Onde aparece | Limite | Arquivo |
| --- | --- | --- | --- |
| Veio de ouro | Entre a saudação e o resumo; no cartão de entrada | Um por tela | CSS (`md-veio`) |
| Louros | Conquista do mês, quando o mês fecha com sobra | Um por tela, só nesse caso | `louros.svg`, `louros-noite.svg` ou inline |
| Coluna jônica | Estados vazios de começo | Um por tela | `coluna.svg`, `coluna-noite.svg` ou inline |
| Selo | Entrada, página "Sobre", divulgação | Um por tela | `midas-selo*.svg` ou inline |
| Moeda | Aviso "Anotado", logo | Onde o componente pede | CSS (`md-moeda`) |

Louros e coluna nunca aparecem na mesma tela: um é o fim de um ciclo bom, o outro é o começo.

## Veio de ouro

Uma divisória ondulada em `ouro`, fina como um veio no mármore. É a assinatura de "aqui começa o conteúdo".

- **Onde:** separa a saudação (título) da frase-resumo no topo do painel; separa o login da linha "Ainda não tem conta?" no cartão de entrada.
- **Limite:** um por tela. Nas outras divisões, use espaço ou uma linha `veio` de 1px.
- **Medidas:** 12px de altura, largura do contêiner, traço principal de 1,6px e um veio secundário de 1px a 45% de opacidade; opacidade geral 0,9.
- **Semântica:** é um ornamento, não uma quebra de assunto para o leitor de tela: use `<span class="md-veio" aria-hidden="true"></span>`, não `<hr>`.

```css
.md-veio {
  display: block;
  height: 12px;
  border: 0;
  margin: 0;
  background: var(--ouro);
  opacity: .9;
  -webkit-mask: var(--veio-mascara) center / 100% 100% no-repeat;
          mask: var(--veio-mascara) center / 100% 100% no-repeat;
}
```

A máscara é um SVG em linha (dois caminhos com `vector-effect: non-scaling-stroke`, para o traço não engrossar quando a divisória estica):

```css
--veio-mascara: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' preserveAspectRatio='none'%3E%3Cpath d='M0 7C40 4 70 9 112 7s80-5 120-2 70 5 104 1 50-3 64 0' fill='none' stroke='%23000' stroke-width='1.6' vector-effect='non-scaling-stroke'/%3E%3Cpath d='M150 5c30-3 55 2 90-1s50 4 70 2' fill='none' stroke='%23000' stroke-opacity='.45' stroke-width='1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E");
```

Por usar máscara, o veio pega a cor do tema sozinho (`ouro` claro ou escuro). No modo de cores forçadas, troque o fundo por `CanvasText` ou esconda o veio.

## Louros

Uma coroa de louros dourada em volta do valor guardado no mês. É o prêmio do Midas: aparece **só quando o mês fecha com sobra**, no componente [Achievement](componentes/achievement.md).

- **Construção:** dois ramos em arco (raio 80 no `viewBox` `-110 -110 220 220`), cada um com 11 pares de folhas que diminuem em direção ao topo, deixando uma abertura em cima e as pontas cruzando embaixo, como nas moedas e coroas romanas.
- **Cores:** folhas em `ouro`; ramos em `ouro-texto` a 70% de opacidade, com traço de 1,4px e pontas arredondadas. Nos arquivos: folhas #c19a4b e ramos #a88236 (claro); folhas #d6b263 e ramos #b89448 (escuro).
- **Tamanho:** 240px de largura (no máximo 100% do contêiner), proporção 1:1, com o valor centralizado dentro.
- **Nunca:** em mês no vermelho, em listas, como ícone, como enfeite de título, animado.

```html
<div class="md-louros">
  <svg viewBox="-110 -110 220 220" aria-hidden="true">
    <path class="folhas" d="…" />
    <path class="ramos" d="M1.4 79.99 A80 80 0 0 1 -37.56 -70.64M-1.4 79.99 A80 80 0 0 0 37.56 -70.64" />
  </svg>
  <div class="md-louros-centro">
    <span class="md-eyebrow">Setembro</span>
    <span class="md-louros-valor">R$ 1.842</span>
    <span class="md-help">guardados</span>
  </div>
</div>
```

```css
.md-louros { position: relative; width: 240px; max-width: 100%; aspect-ratio: 1; display: grid; place-items: center; }
.md-louros svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.md-louros .folhas { fill: var(--ouro); }
.md-louros .ramos { fill: none; stroke: var(--ouro-texto); stroke-width: 1.4; stroke-linecap: round; opacity: .7; }
.md-louros-centro { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; padding-top: 8px; }
.md-louros-valor { font: 700 36px/40px var(--font-classica); color: var(--tinta); font-variant-numeric: lining-nums tabular-nums; }
```

Prefira a versão em linha (que pega as cores dos tokens) à imagem `louros.svg`. Os arquivos servem para materiais fora do app.

## Coluna jônica

Uma coluna clássica desenhada em linha: capitel com volutas, fuste com caneluras e base. Representa "a base de tudo o que vem depois" e aparece nos **estados vazios de começo** ([EmptyState](componentes/empty-state.md)): mês sem lançamentos, primeiro acesso, categoria sem gastos, calculadora nunca usada.

- **Cor:** `borda` (#8a7a68 no claro, #8a7866 no escuro), traço de 1,6px, pontas e junções arredondadas. Caneluras a 55% de opacidade.
- **Tamanho:** 72px de largura no app (a altura acompanha, cerca de 133px).
- **Nunca:** em busca ou filtro sem resultado (ali basta uma frase), junto dos louros, como ícone de navegação.

```html
<svg viewBox="-20 -6 90 166" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">…</g>
</svg>
```

```css
.md-vazio > svg { width: 72px; height: auto; color: var(--borda); }
```

## Selo

Uma moeda antiga com a legenda "SUAS FINANÇAS · SEU CONTROLE" no aro e o monograma no centro. Construção e arquivos em [Logo](03-logo.md#selo); uso como componente em [Seal](componentes/seal.md).

- **Onde:** tela de entrada (versão contorno, cortada no canto, a 50 a 55% de opacidade), página "Sobre", README do projeto e materiais de divulgação.
- **Onde não:** dentro do painel, em listas, em diálogos, como botão.
- **Tamanho mínimo:** 96px de diâmetro.
- **Movimento:** o aro dá uma volta a cada 90 segundos (`duracao-selo`); o centro fica parado. Com `prefers-reduced-motion`, não gira.

## Moeda

Um disco em `folha-de-ouro` com um aro interno sutil: a moeda do Midas fora do logo.

```css
.md-moeda {
  width: 28px; height: 28px;
  border-radius: var(--radius-pill);
  background: var(--folha-de-ouro);
  box-shadow: inset 0 0 0 2px rgba(122, 86, 26, .35);
  flex: none;
  display: inline-block;
}
```

- **Onde:** no aviso "Anotado" do [toque de ouro](componentes/golden-touch.md) (22px). É também a moeda do logo, que no logo é `ouro` chapado.
- **Nunca:** como marcador de lista, botão, contador ou "moeda virtual" de gamificação.

## Regras comuns

- Todo ornamento é decorativo: `aria-hidden="true"`, nenhum texto dentro que não se repita fora.
- Ornamentos não se movem, exceto o aro do selo, e param com `prefers-reduced-motion`.
- Ornamentos usam as cores dos tokens (versão em linha) sempre que estiverem dentro do app.
- Na dúvida entre pôr ou não um ornamento, não ponha. A calma é parte da marca.
