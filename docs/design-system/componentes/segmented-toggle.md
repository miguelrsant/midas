# SegmentedToggle (Alternador Gasto/Renda)

> Par de pílulas no topo do formulário de lançamento que diz se o dinheiro saiu (Gasto) ou entrou (Renda).

Grupo: Lançamentos · Classe base: `md-seg` · Componente React sugerido: `<SegmentedToggle />`

## Quando usar

- No formulário de lançamento (`/lancamentos/novo` e na edição), para escolher entre Gasto e Renda.
- Sempre com exatamente duas opções, nesta ordem: **Gasto**, **Renda**.

## Quando não usar

- Para mais de duas opções ou opções que não se excluem: use [CategoryChip](category-chip.md) ou uma lista de rádios.
- Para ligar e desligar uma configuração: use um interruptor de configuração, não este componente.
- Para trocar o tema ("Claro", "Escuro", "Automático"): são três opções de configuração, com rádios comuns na página de configurações.
- Para filtrar listas (por exemplo, só gastos): um filtro não é o tipo de um lançamento; use um controle próprio de filtro.

## Anatomia

1. **Grupo:** `<fieldset class="md-seg">` com fundo `superficie-funda`, raio `radius-pill`, 4px de respiro interno e 4px entre as pílulas.
2. **Legenda:** `<legend class="md-sr">Tipo de lançamento</legend>`, visualmente escondida, lida pelo leitor de tela.
3. **Pílula (×2):** `<label>` que contém o rádio, o ícone e o texto; `sans` 600 15px/20px, altura mínima 44px, raio `radius-pill`.
4. **Rádio nativo:** `<input type="radio" name="kind">`, visualmente escondido (`md-sr`), mas focável e acessível.
5. **Ícone:** `minus` em Gasto, `plus` em Renda; Lucide 20px, `aria-hidden="true"`. É o sinal que o valor vai receber.
6. **Texto:** "Gasto" ou "Renda".
7. **Pílula selecionada:** fundo `superficie`, `sombra-cartao`, borda de 1px em `borda` (ajuste de acessibilidade) e texto em `gasto` ou `renda`.

## Variantes

| Variante / classe | Quando usar | Tokens |
| --- | --- | --- |
| `is-gasto` selecionada | Lançamento de gasto (padrão ao abrir). | `superficie`, `gasto`, `borda`, `sombra-cartao` |
| `is-renda` selecionada | Lançamento de renda. | `superficie`, `renda`, `borda`, `sombra-cartao` |
| Pílula não selecionada | A outra opção. | `tinta-suave` sobre `superficie-funda` |

Não há variante de tamanho. As duas implementações (rádio nativo e `<button aria-pressed>`) são visualmente iguais; a recomendada é a nativa.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão (não selecionada) | Fundo transparente sobre a trilha, texto `tinta-suave`. | `superficie-funda`, `tinta-suave` | 5,62:1 (claro), 7,58:1 (escuro). |
| Hover (não selecionada) | Texto passa a `tinta`. | `tinta` | Ajuste proposto; o `bundle.css` não tem hover. |
| Foco (teclado) | Anel 2px em `foco`, afastado 2px, em volta da pílula que tem o rádio focado. | `foco` | Com rádio nativo, use `:has(input:focus-visible)` no `<label>`. |
| Selecionada, Gasto | Fundo `superficie`, sombra, borda 1px `borda`, texto e ícone `minus` em `gasto`. | `superficie`, `sombra-cartao`, `borda`, `gasto` | `gasto` 6,11:1 (claro) e 7,53:1 (escuro) sobre `superficie`. |
| Selecionada, Renda | Idem, texto e ícone `plus` em `renda`. | `renda` | 6,54:1 (claro) e 8,69:1 (escuro). |
| Desabilitado | Não se aplica: o tipo sempre pode ser trocado enquanto o formulário está aberto. Durante "Salvando…", o `<fieldset disabled>` inteiro fica bloqueado. | | |

A troca entre as pílulas acontece em `duracao-rapida` (150ms) no fundo e na cor; com movimento reduzido, é instantânea.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Respiro interno da trilha | 4px | `space-1` |
| Espaço entre pílulas | 4px | `space-1` |
| Altura mínima da pílula | 44px (trilha com 52px no total) | |
| Padding lateral da pílula | 24px | `space-6` |
| Espaço ícone–texto | 8px | `space-2` |
| Raio | 999px | `radius-pill` |
| Borda da pílula | 1px (transparente; `borda` quando selecionada) | `borda` |
| Fonte | 600 15px/20px | `label`, `sans` |
| Ícone | 20px, traço 1,75 | |

Toda pílula tem borda de 1px transparente desde o início, para que a borda da selecionada não mude a largura.

## Tokens usados

| Token | Onde |
| --- | --- |
| `superficie-funda` | Trilha |
| `superficie` | Fundo da pílula selecionada |
| `sombra-cartao` | Sombra da pílula selecionada |
| `borda` | Borda da pílula selecionada (ajuste de acessibilidade) |
| `tinta-suave`, `tinta` | Texto da não selecionada; hover proposto |
| `gasto`, `renda` | Texto e ícone da selecionada |
| `foco` | Anel de foco |
| `radius-pill`, `space-1`, `space-2`, `space-6` | Forma e espaço |
| `duracao-rapida` | Troca de estado |

## Conteúdo

- Sempre "Gasto" e "Renda", no singular, com inicial maiúscula. Nunca "Débito"/"Crédito", "Despesa"/"Receita" ou "Saída"/"Entrada".
- Gasto vem primeiro e já selecionado: é o lançamento mais comum.
- O que muda ao trocar o tipo:

| O que muda | Gasto | Renda |
| --- | --- | --- |
| Título do formulário | "Adicionar gasto" | "Adicionar renda" |
| Rótulo do valor ([MoneyInput](money-input.md)) | "Quanto foi?" | "Quanto entrou?" |
| Sinal e cor do valor | "−" e `gasto` | "+" e `renda` |
| Lista de categorias ([CategoryChip](category-chip.md)) | Mercado, Restaurante, Transporte, Moradia, Contas, Saúde + "Mais" | Salário, Freelance, Vendas, Investimentos, Outros |
| Botão de salvar | "Salvar gasto" | "Salvar renda" |
| Aviso ao salvar | "Anotado: Café, − R$ 8,50" | "Anotado: Salário, + R$ 5.400,00" |

| Faça | Evite |
| --- | --- |
| "Gasto" / "Renda" | "Despesa" / "Receita" |
| Legenda escondida "Tipo de lançamento" | Legenda visível "Selecione o tipo de transação" |

## Acessibilidade

- **Semântica recomendada:** `<fieldset>` + `<legend>` + dois `<input type="radio">` nativos com o mesmo `name`. O leitor de tela anuncia, por exemplo: "Tipo de lançamento, agrupamento. Gasto, botão de opção, marcado, 1 de 2."
- **Teclado (nativo):** Tab entra no grupo pela opção marcada; setas (← → ↑ ↓) trocam e já selecionam; Tab sai do grupo. Nada disso precisa de JavaScript.
- **Referência do protótipo:** `role="group"` com `aria-label="Tipo de lançamento"` e dois `<button aria-pressed>`. Funciona, mas cada botão é uma parada de Tab separada e o leitor anuncia "botão alternar, pressionado", sem dizer que as opções se excluem. Use só se o rádio nativo não for possível.
- **Não depende só de cor:** a selecionada tem fundo diferente, sombra, borda de 1px e o ícone de sinal. A borda existe porque `superficie` sobre `superficie-funda` quase não se distingue; `borda` tem 3,31:1 sobre `superficie-funda` no claro e 3,66:1 no escuro (WCAG 1.4.11).
- **Troca de tipo:** não mova o foco ao trocar; ele fica na pílula. As mudanças no resto do formulário (rótulo, categorias) aparecem quando a pessoa avança; não anuncie com região viva.
- **Ícones:** `aria-hidden="true"`; o texto "Gasto"/"Renda" dá o nome.
- **Alvo de toque:** 44px de altura; a largura (ícone + texto + 24px de cada lado) passa bem disso.
- **Movimento reduzido:** sem transição de cor e fundo.

## Comportamento responsivo

- No celular, o alternador ocupa a largura toda do formulário e as duas pílulas dividem o espaço por igual (`flex: 1`), com texto centralizado.
- A partir de 640px, fica com a largura do conteúdo (`inline-flex`), alinhado à esquerda, acima do campo de valor.
- Com fonte ampliada (200%), as pílulas crescem em altura; o texto não quebra nem é cortado ("Gasto" e "Renda" são curtos).

## Casos-limite

- **Ordem de foco:** o alternador vem antes do valor no DOM (fica no topo), mas o foco inicial vai para o campo de valor, o primeiro passo. Shift+Tab leva do valor ao alternador.
- **Troca com categoria marcada:** as listas são diferentes; a seleção de categoria é limpa e o grupo volta a mostrar os seis primeiros com "Mais".
- **Troca com valor digitado:** o texto digitado fica como está; muda só o sinal e a cor.
- **Abrir já em Renda:** um atalho "Adicionar renda" (por exemplo, `/lancamentos/novo?tipo=renda`) abre com Renda marcada. Sem parâmetro, Gasto.
- **Edição:** abre com o tipo do lançamento. Trocar o tipo na edição limpa a categoria, como no novo.
- **Rendas das calculadoras** (13º salário, Férias, Rescisão): na edição, o alternador fica em Renda e funciona igual.

## Referência HTML

Recomendada (rádio nativo):

```html
<fieldset class="md-seg">
  <legend class="md-sr">Tipo de lançamento</legend>
  <label class="is-gasto">
    <input class="md-sr" type="radio" name="kind" value="expense" checked>
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>
    Gasto
  </label>
  <label class="is-renda">
    <input class="md-sr" type="radio" name="kind" value="income">
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    Renda
  </label>
</fieldset>
```

Protótipo (visualmente igual):

```html
<div class="md-seg" role="group" aria-label="Tipo de lançamento">
  <button type="button" class="is-gasto" aria-pressed="true"><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>Gasto</button>
  <button type="button" class="is-renda" aria-pressed="false"><svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>Renda</button>
</div>
```

## Referência CSS

```css
/* bundle.css */
.md-seg { display: inline-flex; padding: 4px; gap: 4px; background: var(--superficie-funda); border-radius: var(--radius-pill); }
.md-seg button { font: 600 15px/20px var(--font-sans); min-height: 44px; padding: 0 var(--space-6); border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--tinta-suave); cursor: pointer; display: inline-flex; align-items: center; gap: var(--space-2); }
.md-seg button[aria-pressed="true"].is-gasto { background: var(--superficie); color: var(--gasto); box-shadow: var(--sombra-cartao); }
.md-seg button[aria-pressed="true"].is-renda { background: var(--superficie); color: var(--renda); box-shadow: var(--sombra-cartao); }
.md-seg button:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px; }

/* Ajuste de acessibilidade: borda de 1px na selecionada (sem mudar a largura) */
.md-seg button { border: 1px solid transparent; transition: background-color var(--duracao-rapida), color var(--duracao-rapida); }
.md-seg button[aria-pressed="true"] { border-color: var(--borda); }

/* Versão com rádio nativo */
fieldset.md-seg { margin: 0; border: 0; min-inline-size: 0; }
.md-seg label { position: relative; font: 600 15px/20px var(--font-sans); min-height: 44px; padding: 0 var(--space-6); border: 1px solid transparent; border-radius: var(--radius-pill); color: var(--tinta-suave); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); transition: background-color var(--duracao-rapida), color var(--duracao-rapida); }
.md-seg label:not(:has(input:checked)):hover { color: var(--tinta); }
.md-seg label:has(input:checked) { background: var(--superficie); border-color: var(--borda); box-shadow: var(--sombra-cartao); }
.md-seg label.is-gasto:has(input:checked) { color: var(--gasto); }
.md-seg label.is-renda:has(input:checked) { color: var(--renda); }
.md-seg label:has(input:focus-visible) { outline: 2px solid var(--foco); outline-offset: 2px; }
@media (max-width: 639px) { .md-seg { display: flex; } .md-seg label, .md-seg button { flex: 1; justify-content: center; } }
@media (prefers-reduced-motion: reduce) { .md-seg label, .md-seg button { transition: none; } }
```

## Implementação no app

Base: não há um equivalente direto no shadcn com rádio nativo (o `ToggleGroup` e o `RadioGroup` do Radix usam botões com ARIA). Construa em `src/components/midas/segmented-toggle.tsx` com `<fieldset>` e `<input type="radio">`, usando `Label` do shadcn só se quiser.

```ts
// src/lib/entry.ts
export type EntryKind = "expense" | "income";
```

```tsx
// src/components/midas/segmented-toggle.tsx
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentedToggleProps {
  value: EntryKind;
  onValueChange: (kind: EntryKind) => void;
  name?: string;          // padrão "kind"
  disabled?: boolean;     // true durante "Salvando…"
}

const OPTIONS = [
  { value: "expense", label: "Gasto", Icon: Minus, selected: "has-[input:checked]:text-gasto" },
  { value: "income", label: "Renda", Icon: Plus, selected: "has-[input:checked]:text-renda" },
] as const;

export function SegmentedToggle({ value, onValueChange, name = "kind", disabled }: SegmentedToggleProps) {
  return (
    <fieldset disabled={disabled} className="flex gap-1 rounded-pill bg-superficie-funda p-1 sm:inline-flex">
      <legend className="sr-only">Tipo de lançamento</legend>
      {OPTIONS.map(({ value: v, label, Icon, selected }) => (
        <label
          key={v}
          className={cn(
            "relative inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 sm:flex-none",
            "rounded-pill border border-transparent px-6 font-sans text-label font-semibold text-tinta-suave",
            "transition-colors duration-(--duracao-rapida) motion-reduce:transition-none",
            "[&:not(:has(input:checked)):hover]:text-tinta",
            "has-[input:checked]:border-borda has-[input:checked]:bg-superficie has-[input:checked]:shadow-cartao",
            "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-foco",
            selected,
          )}
        >
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onValueChange(v)}
            className="sr-only"
          />
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
```

Uso no formulário:

```tsx
const [kind, setKind] = useState<EntryKind>(searchParams.get("tipo") === "renda" ? "income" : "expense");

<SegmentedToggle
  value={kind}
  onValueChange={(next) => { setKind(next); setCategory(null); }}
  disabled={saving}
/>
<MoneyInput kind={kind} label={kind === "expense" ? "Quanto foi?" : "Quanto entrou?"} autoFocus … />
```

Notas:

- O `className="sr-only"` do Tailwind equivale a `md-sr`.
- Confira no seu Tailwind se `rounded-pill` e `shadow-cartao` foram declarados no `@theme inline`.
- Se usar `react-hook-form`, registre os dois rádios com o mesmo nome; o componente continua o mesmo.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Gasto primeiro e já marcado. | Nenhum marcado, obrigando um toque a mais. |
| Rádio nativo em `fieldset`/`legend`. | Dois botões soltos sem grupo. |
| Borda + sombra + ícone de sinal na selecionada. | Indicar a seleção só pela cor do texto. |
| Limpar a categoria ao trocar o tipo. | Manter "Mercado" marcado numa renda. |

## Relacionados

- [MoneyInput](money-input.md), [CategoryChip](category-chip.md), [Button](button.md), [GoldenTouch](golden-touch.md)
- [Cores](../04-cores.md), [Acessibilidade](../12-acessibilidade.md), [Categorias](../15-categorias.md), [Padrões de tela](../17-padroes-de-tela.md)
