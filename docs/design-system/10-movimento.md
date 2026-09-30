# Movimento

O Midas se move pouco, e de propósito. Movimento serve para confirmar uma ação ou mostrar de onde algo veio, nunca para enfeitar. Existe **um único efeito comemorativo**, o toque de ouro ao salvar um lançamento, e é por ser único que ele tem valor.

## Durações

| Token | Valor | Curva | Uso |
| --- | --- | --- | --- |
| `duracao-rapida` | 150ms | `ease` | Troca de estado de botões, chips, alternador e campos (hover, pressionado, seleção). |
| `duracao-toque` | 650ms | onda: `cubic-bezier(.2, .7, .2, 1)`; reflexo: `ease-out` | O toque de ouro: a onda dourada no botão e o reflexo que passa pela linha nova. |
| `duracao-selo` | 5s | `cubic-bezier(.2, .7, .2, 1)`, uma vez | O aro do selo gira 20° e assenta, uma única vez, quando a tela de entrada abre. |

Não crie outras durações. Se algo precisa de movimento e não cabe aqui, provavelmente não precisa de movimento.

## Catálogo

| Movimento | Onde | Como |
| --- | --- | --- |
| Troca de estado | Botões, chips, alternador, campos, linhas | Só cor de fundo, cor de texto e sombra, em `duracao-rapida`. Sem mudar tamanho nem posição. |
| Toque de ouro | Salvar um lançamento | Onda + reflexo + aviso "Anotado". Veja abaixo. |
| Assentamento do selo | Tela de entrada | O aro gira 20° em `duracao-selo` e para; o centro fica parado. |
| Aviso "Anotado" | Depois de salvar | Aparece sem animação de entrada e some sozinho depois de 4 segundos. |
| Diálogos e folhas | Adicionar lançamento no celular, confirmações | Aparecem com um esmaecimento de `duracao-rapida`, sem deslizar pela tela. |
| Troca de mês | Topo do app | O conteúdo troca direto, sem deslizar. O nome do mês é anunciado ao leitor de tela. |
| Carregamento | Listas e cartões | Blocos estáticos em `superficie-funda` no formato do conteúdo, sem brilho passando (o brilho é do toque de ouro). |
| Gráficos | Painel, planejamento | Sem animação de entrada. |

## Toque de ouro

O momento de personalidade do app: quando a pessoa salva um gasto ou uma renda, o Midas "toca" o registro com ouro.

1. **Onda** (`md-onda`): um círculo `ouro` nasce no ponto tocado do botão (no centro, quando a ação veio do teclado) e cresce 28 vezes enquanto some, em `duracao-toque`.
2. **Reflexo** (`md-brilho`): uma faixa de `brilho` atravessa a linha nova da lista uma única vez.
3. **Aviso** (`md-aviso-toque`): "Anotado: Mercado, − R$ 127,90", com a moeda em `folha-de-ouro`, em `role="status"`. Some depois de 4 segundos. Não tem botão (um botão que some em 4 segundos seria difícil de alcançar); para desfazer, a pessoa toca na linha nova.

```css
.md-onda {
  position: absolute; border-radius: 50%;
  width: 12px; height: 12px; margin: -6px 0 0 -6px;
  background: var(--ouro); opacity: .55; pointer-events: none;
  animation: md-onda var(--duracao-toque, 650ms) cubic-bezier(.2,.7,.2,1) forwards;
}
@keyframes md-onda { to { transform: scale(28); opacity: 0; } }

.md-brilho {
  background-image: linear-gradient(100deg, transparent 20%, var(--brilho) 45%, transparent 70%);
  background-size: 250% 100%;
  background-repeat: no-repeat;
  animation: md-brilho var(--duracao-toque, 650ms) ease-out 1 both;
}
@keyframes md-brilho { from { background-position: 120% 0; } to { background-position: -60% 0; } }
```

O botão que dispara a onda precisa de `position: relative` e `overflow: hidden` (a classe `md-btn` já tem). Detalhes de uso, marcação e implementação React em [GoldenTouch](componentes/golden-touch.md).

**Use só ao salvar lançamentos.** Não é efeito para todo botão, nem para salvar configurações, nem para entrar na conta.

## Assentamento do selo

Ao abrir a tela de entrada, o aro do selo gira de −20° até 0° em 5 segundos, desacelerando, e para: a moeda "assenta" no lugar. O centro (monograma) fica parado.

```css
.md-selo .aro {
  transform-origin: 0 0;
  animation: md-assentar var(--duracao-selo, 5s) cubic-bezier(.2,.7,.2,1) 1 both;
}
@keyframes md-assentar { from { transform: rotate(-20deg); } to { transform: rotate(0deg); } }
```

**Ajuste em relação ao protótipo:** o protótipo girava o aro uma volta a cada 90 segundos, sem parar. Um movimento automático que dura mais de 5 segundos ao lado de outro conteúdo precisa de um jeito de ser pausado (WCAG 2.2.2, nível A). Parar sozinho em 5 segundos resolve sem acrescentar um botão de pausa à tela de entrada.

## Movimento reduzido

Com `prefers-reduced-motion: reduce`, **nada se move e nada se perde**:

| Movimento | Com movimento reduzido |
| --- | --- |
| Onda do toque de ouro | Não aparece. |
| Reflexo na linha nova | Não passa; a linha aparece normalmente. |
| Aviso "Anotado" | Aparece e é lido pelo leitor de tela igual. |
| Assentamento do selo | Não acontece: o selo aparece parado. |
| Esmaecimento de diálogos | Some: o diálogo aparece direto. |
| Trocas de estado | Instantâneas. |

```css
@media (prefers-reduced-motion: reduce) {
  .md-selo .aro, .md-onda, .md-brilho { animation: none; }
  .md-onda { display: none; }
  *, *::before, *::after { transition-duration: 0.01ms !important; }
}
```

Em Tailwind, use `motion-reduce:animate-none` e `motion-reduce:transition-none`. No JavaScript, antes de criar a onda, confira `window.matchMedia("(prefers-reduced-motion: reduce)").matches`.

## Regras

- Movimento só com motivo: confirmar uma ação ou mostrar uma relação. Nunca para "dar vida" a uma tela parada.
- Nada pisca, nada treme, nada quica. Sem parallax, sem rolagem animada, sem carrossel automático.
- Nada se move sozinho por mais de 5 segundos (WCAG 2.2.2). O assentamento do selo, o movimento automático mais longo do app, dura exatamente 5 segundos.
- Nenhum som.
- Sem confete, fogos ou chuva de moedas, nem na conquista do mês.
- Transições de estado mexem só em cor e sombra, nunca em tamanho: o layout não pode "pular" quando a pessoa passa o mouse.
