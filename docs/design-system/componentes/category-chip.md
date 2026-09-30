# CategoryChip (Chip de categoria)

> Pílula com ícone e nome de uma categoria pronta; um grupo de chips é o segundo passo do formulário de lançamento.

Grupo: Lançamentos · Classe base: `md-chip` · Componentes React sugeridos: `<CategoryChipGroup />` e `<CategoryChip />`

## Quando usar

- No formulário de lançamento, logo depois do [MoneyInput](money-input.md), para dizer onde o dinheiro foi ou de onde veio.
- Sempre em grupo, com seleção única.

## Quando não usar

- Para filtros com várias escolhas ao mesmo tempo: este grupo é de seleção única.
- Para mostrar a categoria de um lançamento já salvo: a [TransactionRow](transaction-row.md) mostra o ícone e o nome na linha.
- Para escolher Gasto ou Renda: use o [SegmentedToggle](segmented-toggle.md).
- Para categorias criadas pela pessoa: o design system só tem categorias prontas (veja [Categorias](../15-categorias.md)).

## Anatomia

1. **Grupo:** `<fieldset class="md-chips">` com `<legend class="md-label">Categoria</legend>` visível; chips em linha que quebra, 8px (`space-2`) entre eles.
2. **Chip:** `<label class="md-chip">`, pílula com borda 1px `borda`, fundo `superficie`, altura mínima 44px, padding 0 16px 0 12px.
3. **Rádio nativo:** `<input type="radio" name="category">`, visualmente escondido (`md-sr`), mas focável.
4. **Ícone:** o ícone Lucide da categoria, 20px, `aria-hidden="true"`. No chip selecionado, dá lugar ao ícone `check`.
5. **Nome:** `sans` 600 15px/20px, em `tinta` (ou `sobre-ouro` quando selecionado).
6. **Chip "Mais":** `<button type="button">` com o mesmo visual de chip, texto "Mais" e ícone `chevron-down` à direita. Revela o restante no próprio lugar e some.

## Variantes

| Variante / classe | Quando usar | Tokens |
| --- | --- | --- |
| `md-chip` | Categoria não selecionada. | `superficie`, `borda`, `tinta` |
| `md-chip` selecionado | A categoria escolhida (no máximo uma). | `ouro` (fundo e borda), `sobre-ouro`, ícone `check` |
| `md-chip md-chip-mais` | Sexto chip em diante, quando a lista tem mais de seis. | como `md-chip`, ícone `chevron-down` |

Chips **não** têm cor por categoria: todos são neutros, para a tela ficar calma. O único dourado é o do chip escolhido.

## Categorias

Gasto (ordem padrão; os seis primeiros aparecem, o resto fica atrás de "Mais"):

| # | Categoria | Ícone Lucide | `lucide-react` |
| --- | --- | --- | --- |
| 1 | Mercado | `shopping-cart` | `ShoppingCart` |
| 2 | Restaurante | `utensils` | `Utensils` |
| 3 | Transporte | `car` | `Car` |
| 4 | Moradia | `house` | `House` |
| 5 | Contas | `receipt` | `Receipt` |
| 6 | Saúde | `heart` | `Heart` |
| Mais → 7 | Educação | `book-open` | `BookOpen` |
| 8 | Lazer | `ticket` | `Ticket` |
| 9 | Compras | `shopping-bag` | `ShoppingBag` |
| 10 | Outros | `shapes` | `Shapes` |

Renda (cinco, todas visíveis, sem "Mais"): Salário `briefcase` (`Briefcase`), Freelance `laptop` (`Laptop`), Vendas `store` (`Store`), Investimentos `trending-up` (`TrendingUp`), Outros `shapes` (`Shapes`).

Rendas criadas pelas calculadoras: 13º salário `coins`, Férias `tree-palm`, Rescisão `file-text`. Não aparecem no formulário de lançamento novo; na edição de uma delas, o chip dela aparece primeiro e já selecionado.

Com o uso, os seis primeiros de gasto passam a ser as seis categorias que a pessoa mais usa (contagem dos últimos 90 dias; empate segue a ordem padrão). A ordem é calculada ao abrir o formulário e nunca muda com ele aberto.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Fundo `superficie`, borda `borda`, ícone e nome em `tinta`. | `superficie`, `borda`, `tinta` | |
| Hover | Fundo `superficie-funda`. | `superficie-funda` | Ajuste proposto; o `bundle.css` não tem hover. |
| Foco (teclado) | Anel 2px `foco`, afastado 2px. | `foco` | Com rádio nativo, `:has(input:focus-visible)` no `<label>`. |
| Selecionado | Fundo e borda `ouro`, texto `sobre-ouro`, ícone troca para `check`. | `ouro`, `sobre-ouro` | A largura não muda (os dois ícones têm 20px). |
| Nenhum selecionado | Todos no padrão. | | Estado inicial. Ao salvar assim, vai para "Outros". |
| "Mais" | Como o padrão, com `chevron-down`. | | Some depois de tocado. |
| Desabilitado | O `<fieldset disabled>` inteiro, opacidade 0,45. | | Só durante "Salvando…". |

A troca de estado acontece em `duracao-rapida` (150ms); com movimento reduzido, é instantânea.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Altura mínima | 44px | |
| Padding | 0 16px 0 12px (ícone à esquerda) | `space-4`, `space-3` |
| Espaço ícone–nome | 8px | `space-2` |
| Espaço entre chips | 8px | `space-2` |
| Espaço legenda–chips | 8px | `space-2` |
| Raio | 999px | `radius-pill` |
| Borda | 1px | `borda` / `ouro` |
| Fonte | 600 15px/20px | `label`, `sans` |
| Ícone | 20px, traço 1,75 | |

## Tokens usados

| Token | Onde |
| --- | --- |
| `superficie` | Fundo do chip |
| `superficie-funda` | Hover proposto |
| `borda` | Borda do chip |
| `tinta` | Nome e ícone; legenda |
| `ouro` | Fundo e borda do selecionado |
| `sobre-ouro` | Nome e `check` do selecionado |
| `foco` | Anel de foco |
| `radius-pill`, `space-2`, `space-3`, `space-4` | Forma e espaço |
| `duracao-rapida` | Troca de estado |

## Conteúdo

- Nome da categoria em uma ou duas palavras, com inicial maiúscula, como a pessoa fala: "Mercado", não "Supermercado e hortifrúti".
- A legenda é "Categoria", sem "(opcional)": a pessoa pode pular, e o lançamento vai para "Outros".
- Nenhuma categoria vem pré-selecionada. Adivinhar pela mais usada faria a pessoa salvar sem perceber uma categoria errada.
- Se salvar sem escolher, o aviso diz para onde foi: "Anotado em Outros: − R$ 8,50".
- O chip de revelar diz só "Mais" na tela; o leitor de tela ouve "Mais categorias".

| Faça | Evite |
| --- | --- |
| "Mercado", "Contas", "Outros" | "Supermercado/Hortifrúti", "Diversos", "Sem categoria" |
| "Mais" com `chevron-down` | "Ver todas as 10 categorias" |
| "Anotado em Outros: − R$ 8,50" | Salvar em "Outros" sem avisar |

## Acessibilidade

- **Semântica recomendada:** `<fieldset>` com `<legend>Categoria</legend>` visível e `<input type="radio">` nativos com o mesmo `name`. O leitor anuncia: "Categoria, agrupamento. Mercado, botão de opção, não marcado, 1 de 6."
- **Teclado (nativo):** Tab entra no grupo (na opção marcada ou, sem nenhuma, na primeira); setas trocam e selecionam; Tab seguinte vai para "Mais" e depois para fora. Espaço marca a opção focada.
- **Referência do protótipo:** `role="group"` com `aria-label="Categoria"` e `<button aria-pressed>`. Visualmente igual; use só se o rádio nativo não for possível, e aí garanta por código que só um fica `aria-pressed="true"`.
- **Não depende só de cor:** `ouro` sobre `superficie` tem só 2,54:1 no claro; por isso o chip selecionado troca o ícone pelo `check` (`sobre-ouro` sobre `ouro`: 6,10:1 no claro, 8,99:1 no escuro). Isso atende WCAG 1.4.1 e 1.4.11.
- **"Mais":** `<button type="button">` com texto visível "Mais" e `<span class="md-sr"> categorias</span>` (o nome acessível começa pelo texto visível, WCAG 2.5.3). Ao ser tocado, os chips restantes entram no mesmo grupo, o "Mais" sai do DOM e o foco vai para o primeiro chip revelado (Educação), sem marcá-lo.
- **Contraste:** nome em `tinta` 15,51:1 (claro) e 14,59:1 (escuro) sobre `superficie`; `borda` 4,01:1 e 4,08:1 sobre `superficie`, 3,71:1 e 4,42:1 sobre `marmore`.
- **Alvo de toque:** 44px de altura, com 8px entre chips.
- **Movimento reduzido:** sem transição.

## Comportamento responsivo

- Os chips quebram linha (`flex-wrap`) e mantêm a largura do conteúdo; nunca rolam na horizontal (rolagem lateral esconde opções).
- No celular com 360px, os seis chips de gasto e o "Mais" ocupam três ou quatro linhas; tudo bem.
- Com fonte ampliada, os chips crescem; o nome nunca é cortado.

## Casos-limite

- **Troca de Gasto para Renda:** a seleção é limpa e, se estava expandido, o grupo volta aos seis primeiros com "Mais".
- **Edição com categoria depois da sexta:** o grupo abre já expandido, sem "Mais", para a categoria marcada ficar visível.
- **Categoria "Outros" entre as seis mais usadas:** tudo bem; ela fica onde o uso colocar.
- **Pessoa nova, sem histórico:** ordem padrão.
- **Desmarcar:** rádio não se desmarca. Quem quiser tirar a categoria escolhe "Outros".
- **Salvar sem categoria:** grava `Outros` do tipo atual e o aviso diz "Anotado em Outros: …".
- **Nome longo em outro idioma ou com fonte grande:** o chip cresce e quebra para a linha de baixo; não use reticências.

## Referência HTML

Recomendada (rádio nativo), com o primeiro chip selecionado para mostrar o `check`:

```html
<fieldset class="md-chips">
  <legend class="md-label">Categoria</legend>
  <label class="md-chip">
    <input class="md-sr" type="radio" name="category" value="mercado" checked>
    <svg class="md-icon md-chip-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
    Mercado
  </label>
  <label class="md-chip">
    <input class="md-sr" type="radio" name="category" value="restaurante">
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="…"/></svg><!-- utensils -->
    Restaurante
  </label>
  <!-- Transporte (car), Moradia (house), Contas (receipt), Saúde (heart) -->
  <button type="button" class="md-chip md-chip-mais">
    Mais<span class="md-sr"> categorias</span>
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
</fieldset>
```

Protótipo (visualmente igual):

```html
<div class="md-row" role="group" aria-label="Categoria">
  <button type="button" class="md-chip" aria-pressed="true"><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Mercado</button>
  <button type="button" class="md-chip" aria-pressed="false"><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="…"/></svg>Restaurante</button>
</div>
```

## Referência CSS

```css
/* bundle.css */
.md-chip { font: 600 15px/20px var(--font-sans); min-height: 44px; padding: 0 var(--space-4) 0 var(--space-3); border-radius: var(--radius-pill); border: 1px solid var(--borda); background: var(--superficie); color: var(--tinta); display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; }
.md-chip[aria-pressed="true"] { background: var(--ouro); border-color: var(--ouro); color: var(--sobre-ouro); }
.md-chip:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px; }

/* Ajustes propostos: grupo, rádio nativo, hover, "Mais" */
.md-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; border: 0; min-inline-size: 0; }
.md-chips > legend { margin-bottom: var(--space-2); padding: 0; }
.md-chip { position: relative; transition: background-color var(--duracao-rapida), border-color var(--duracao-rapida); }
.md-chip:not(:has(input:checked)):not([aria-pressed="true"]):hover { background: var(--superficie-funda); }
.md-chip:has(input:checked) { background: var(--ouro); border-color: var(--ouro); color: var(--sobre-ouro); }
.md-chip:has(input:focus-visible) { outline: 2px solid var(--foco); outline-offset: 2px; }
.md-chip-mais { padding: 0 var(--space-3) 0 var(--space-4); } /* ícone à direita */
@media (prefers-reduced-motion: reduce) { .md-chip { transition: none; } }
```

A `legend` de um `fieldset` não entra no fluxo flexível: ela fica sozinha na primeira linha e os chips quebram abaixo dela.

## Implementação no app

Base: sem equivalente direto no shadcn com rádio nativo (o `RadioGroup` e o `ToggleGroup` do Radix usam botões com ARIA). Construa em `src/components/midas/category-chip.tsx`. Os dados das categorias ficam em `src/lib/categories.ts` (veja [Categorias](../15-categorias.md)).

```ts
// src/lib/categories.ts (trecho)
import type { LucideIcon } from "lucide-react";
export interface Category { id: string; label: string; kind: EntryKind; Icon: LucideIcon; }
export const EXPENSE_CATEGORIES: Category[] = [
  { id: "mercado", label: "Mercado", kind: "expense", Icon: ShoppingCart },
  { id: "restaurante", label: "Restaurante", kind: "expense", Icon: Utensils },
  // … transporte, moradia, contas, saude, educacao, lazer, compras, outros
];
```

```tsx
interface CategoryChipGroupProps {
  categories: Category[];           // já na ordem de uso
  value: string | null;             // null = nenhuma (vai para "Outros" ao salvar)
  onValueChange: (id: string) => void;
  visibleCount?: number;            // padrão 6
  disabled?: boolean;
}

export function CategoryChipGroup({ categories, value, onValueChange, visibleCount = 6, disabled }: CategoryChipGroupProps) {
  const selectedIndex = categories.findIndex((c) => c.id === value);
  const [expanded, setExpanded] = useState(selectedIndex >= visibleCount);
  const firstRevealed = useRef<HTMLInputElement>(null);
  const revealedByTap = useRef(false); // só move o foco quando a pessoa tocou em "Mais"
  const hasMore = categories.length > visibleCount + 1;
  const shown = expanded || !hasMore ? categories : categories.slice(0, visibleCount);

  useEffect(() => {
    if (expanded && revealedByTap.current) firstRevealed.current?.focus();
  }, [expanded]);

  return (
    <fieldset disabled={disabled} className="flex flex-wrap gap-2">
      <legend className="mb-2 font-sans text-label font-semibold text-tinta">Categoria</legend>
      {shown.map((c, i) => (
        <CategoryChip key={c.id} category={c} checked={c.id === value}
          onCheck={() => onValueChange(c.id)} inputRef={i === visibleCount ? firstRevealed : undefined} />
      ))}
      {hasMore && !expanded && (
        <button type="button" onClick={() => { revealedByTap.current = true; setExpanded(true); }}
          className={cn(chipClasses, "pr-3 pl-4")}>
          Mais<span className="sr-only"> categorias</span>
          <ChevronDown className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
      )}
    </fieldset>
  );
}

const chipClasses = cn(
  "relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-borda bg-superficie",
  "pr-4 pl-3 font-sans text-label font-semibold text-tinta",
  "transition-colors duration-(--duracao-rapida) motion-reduce:transition-none",
  "[&:not(:has(input:checked)):hover]:bg-superficie-funda",
  "has-[input:checked]:border-ouro has-[input:checked]:bg-ouro has-[input:checked]:text-sobre-ouro",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
  "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-foco",
);

function CategoryChip({ category: { id, label, Icon }, checked, onCheck, inputRef }: {
  category: Category; checked: boolean; onCheck: () => void; inputRef?: React.Ref<HTMLInputElement>;
}) {
  const Shown = checked ? Check : Icon; // ajuste de acessibilidade: check no selecionado
  return (
    <label className={chipClasses}>
      <input ref={inputRef} type="radio" name="category" value={id} checked={checked} onChange={onCheck} className="sr-only" />
      <Shown className="size-5" strokeWidth={1.75} aria-hidden />
      {label}
    </label>
  );
}
```

Notas:

- O grupo de renda tem cinco categorias, então `hasMore` é falso e o "Mais" não aparece.
- A regra `hasMore = length > visibleCount + 1` evita um "Mais" que revelaria um único chip; com sete categorias, mostre as sete.
- Ao trocar o tipo, remonte o grupo com `key={kind}` para o estado `expanded` voltar ao início.
- Ao salvar com `value === null`, o formulário grava o id de "Outros" do tipo atual.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Rádio nativo em `fieldset` com legenda "Categoria". | Chips soltos sem grupo. |
| `check` no lugar do ícone do selecionado. | Indicar seleção só com o fundo dourado. |
| Nenhuma pré-selecionada; "Outros" dito no aviso. | Pré-selecionar a mais usada. |
| Chips neutros. | Uma cor para cada categoria. |
| "Mais" revela no lugar e some. | Abrir uma lista em outra tela ou um menu suspenso. |

## Relacionados

- [SegmentedToggle](segmented-toggle.md), [MoneyInput](money-input.md), [GoldenTouch](golden-touch.md), [TransactionRow](transaction-row.md)
- [Categorias](../15-categorias.md), [Iconografia](../09-iconografia.md), [Cores](../04-cores.md), [Acessibilidade](../12-acessibilidade.md)
