# Bar (Barra de progresso e de proporção)

> Barra horizontal fina que mostra uma proporção: quanto do que entrou já saiu, quanto do limite já foi usado, o tamanho de cada categoria. É reforço visual; a frase ao lado é a informação.

Grupo: Dados · Componente React: `<Bar />` em `src/components/midas/bar.tsx`

## Quando usar

- No [BalanceCard](balance-card.md) ("Você usou 70% do que entrou este mês.").
- Nos limites por categoria ("R$ 360 de R$ 400").
- Nas barras por categoria do resumo do mês ([Gráficos e dados](../13-graficos-e-dados.md#barras-por-categoria)).
- No passo a passo das calculadoras ("Passo 2 de 4").

## Quando não usar

- Sozinha, sem frase: toda barra tem um texto que diz o mesmo número.
- Para carregamento: use blocos de esqueleto; nada de barra que anda sozinha.

## Anatomia e variantes

- **Trilha**: `superficie-funda`, 8px de altura, `radius-pill`, `overflow: hidden`.
- **Preenchimento** (`tone`): `ouro` (padrão; progresso e limite abaixo de 90%), `alerta` (limite de 90% em diante; cheio acima de 100%), `gasto` e `renda` (barras por categoria).
- Largura do preenchimento: de 0 a 100%, inteiro, arredondado para baixo; acima de 100% fica cheia.

## Acessibilidade

- A barra inteira é `aria-hidden="true"`: nunca `<progress>`, `<meter>` nem `role="progressbar"`. Quem lê a informação é a frase.
- Contraste: o preenchimento `ouro` sobre `superficie-funda` é decorativo; a frase leva o contraste de texto normal.

## Implementação

```tsx
export interface BarProps {
  /** 0 a 100 (valores maiores ficam cheios; menores que 0 viram 0). */
  percent: number;
  tone?: "ouro" | "alerta" | "gasto" | "renda";
  className?: string;
}
```

- **Sem `style=""`.** A CSP do Midas bloqueia estilo em linha vindo do servidor. A largura sai de uma classe pronta: `pctClass(n)` devolve `w-[37%]`, e o `globals.css` gera as 101 classes com `@source inline("w-[{0..100}%]")`.
- Funciona como componente de servidor (sem JavaScript).
