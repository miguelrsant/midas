# Button (Botão)

> Botão de ação do Midas: dispara o que a pessoa quer fazer na tela, de "Adicionar gasto" no painel a "Excluir lançamento" na edição.

Grupo: Ações · Classe base: `md-btn` · Componente React sugerido: `<Button />`

## Quando usar

- Para **fazer** algo: salvar, adicionar, baixar, confirmar, excluir.
- Para a ação principal da tela (`md-btn-primary`), sempre uma só.
- Para ações alternativas ao lado da principal (`md-btn-secondary`): voltar, cancelar uma confirmação, exportar.
- Para ações de baixa ênfase dentro de cartões (`md-btn-ghost`): "Ver todos".
- Para apagar algo, sempre em duas etapas na própria tela (`md-btn-danger`).

## Quando não usar

- Para navegar entre páginas: use um link (`<a>` / `next/link`, classe `md-link`). Se o destino é outra página, o elemento é link, mesmo que pareça botão (com `asChild`, veja Implementação).
- Para escolher uma opção entre várias: use [SegmentedToggle](segmented-toggle.md) ou [CategoryChip](category-chip.md).
- Para comemorar qualquer ação: o toque de ouro (`md-toque`) é só para salvar lançamentos novos. Veja [GoldenTouch](golden-touch.md).
- Botão só com ícone: não existe no Midas, com uma exceção (fechar, `x`, com `aria-label`).

## Anatomia

1. **Contêiner:** `<button>` com `md-btn`; cantos `radius-md` (10px), borda de 1px (transparente, `borda` no secundário, `gasto` no perigo), altura mínima `space-12` (48px).
2. **Ícone (opcional):** à esquerda do rótulo, Lucide 20px, traço 1,75, `currentColor`, `aria-hidden="true"`. Separado do rótulo por `space-2` (8px).
3. **Rótulo:** `sans` (Atkinson Hyperlegible Next) 600, 15px/20px (`label`); 17px no tamanho `lg`. Verbo + objeto.
4. **Onda (só com `md-toque`):** `<span class="md-onda">` criado no clique, em `ouro`, recortado pelo `overflow: hidden` do botão.

## Variantes

| Variante / classe | Quando usar | Tokens |
| --- | --- | --- |
| `md-btn md-btn-primary` | A ação principal da tela. Uma por tela. | `primario`, `sobre-primario`, `primario-hover` |
| `md-btn md-btn-secondary` | Alternativas: "Voltar", "Manter lançamento", "Exportar". | `superficie`, `tinta`, `borda`, `superficie-funda` (hover) |
| `md-btn md-btn-ghost` | Baixa ênfase dentro de cartões: "Ver todos". | `ouro-texto`, `superficie-funda` (hover) |
| `md-btn md-btn-danger` | Excluir, apagar dados, encerrar conta. Sempre com segunda etapa. | `superficie`, `gasto` (texto e borda) |
| `md-btn-lg` (tamanho) | Somado ao primário em "Adicionar gasto" no painel, o atalho mais usado. | 56px de altura, 17px, `space-8` lateral |
| `md-toque` (modificador) | Somado ao primário nos botões que salvam um lançamento novo ("Salvar gasto", "Salvar renda"). Dispara o toque de ouro. | `ouro`, `duracao-toque` |

`primario` é mogno no tema Calacatta e ouro no tema Portoro: o botão principal troca de cor com o tema sem mudar de classe.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Como na tabela de variantes. | ver acima | |
| Hover | Primário escurece (claro) ou clareia (escuro); secundário e ghost ganham fundo `superficie-funda`. | `primario-hover`, `superficie-funda` | Transição de fundo em `duracao-rapida` (150ms). O perigo não tem hover no `bundle.css`; ajuste proposto: fundo `gasto-fundo` (texto `gasto` 5,01:1 no claro, 6,54:1 no escuro). |
| Foco (teclado) | Anel 2px sólido em `foco`, afastado 2px. | `foco` | Só com `:focus-visible`. `foco` tem 5,98:1 sobre `superficie` no claro. |
| Pressionado | Igual ao hover. | idem | Não há regra `:active` própria; no celular o hover aparece no toque. |
| Desabilitado | Opacidade 0,45, cursor `not-allowed`. | | Use pouco: prefira deixar o botão ativo e explicar o erro no campo. |
| Carregando | Rótulo troca para o gerúndio ("Salvando…"), `disabled` e `aria-busy="true"`. | | Ajuste proposto: com `aria-busy`, opacidade 1 (a 0,45 o texto cai para 2,30:1 no claro e 2,84:1 no escuro) e cursor `progress`. |
| Confirmando (perigo) | O botão dá lugar a uma frase e a dois botões: perigo ("Apagar lançamento") e secundário ("Manter lançamento"). | `gasto`, `borda` | Na própria tela, sem diálogo modal. Veja Conteúdo e Casos-limite. |

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Altura mínima | 48px (56px no `lg`) | `space-12` |
| Padding lateral | 24px (32px no `lg`, 12px no ghost) | `space-6`, `space-8`, `space-3` |
| Espaço ícone–rótulo | 8px | `space-2` |
| Raio | 10px | `radius-md` |
| Borda | 1px | `borda` / `gasto` / transparente |
| Fonte | 600 15px/20px (17px no `lg`, entrelinha mantida em 20px) | `label`, `sans` |
| Ícone | 20px, traço 1,75 | |
| Anel de foco | 2px + 2px de afastamento | `foco` |
| Transição | 150ms no fundo | `duracao-rapida` |
| Botão fechar | 48 × 48px, só ícone `x` | `space-12` |

## Tokens usados

| Token | Onde |
| --- | --- |
| `primario`, `primario-hover`, `sobre-primario` | Fundo, hover e texto do primário |
| `superficie`, `superficie-funda` | Fundo do secundário e do perigo; hover do secundário e do ghost |
| `tinta` | Texto do secundário e do botão fechar |
| `borda` | Borda do secundário |
| `ouro-texto` | Texto do ghost |
| `gasto`, `gasto-fundo` | Texto e borda do perigo; hover proposto |
| `foco` | Anel de foco |
| `ouro`, `duracao-toque` | Onda do `md-toque` |
| `radius-md`, `space-2`, `space-3`, `space-6`, `space-8`, `space-12` | Forma e espaço |
| `duracao-rapida` | Troca de fundo |

## Conteúdo

- **Verbo + objeto, sempre.** O rótulo diz o que acontece quando a pessoa toca.
- Rótulos curtos (até três palavras, cabem numa linha no celular).
- No carregando, o mesmo verbo no gerúndio, com reticências de um caractere (…): "Salvando…", "Baixando…", "Apagando…".
- A confirmação de exclusão diz **o que** será apagado e que não volta.

| Faça | Evite |
| --- | --- |
| "Adicionar gasto" | "Novo", "+" |
| "Salvar gasto" / "Salvar renda" | "OK", "Enviar", "Salvar" sozinho |
| "Baixar meus dados" | "Exportar CSV" |
| "Excluir lançamento" | "Excluir", "Remover item" |
| "Apagar o lançamento Mercado do bairro, − R$ 127,90? Ele sai do seu histórico e não volta." | "Tem certeza?" |
| "Apagar lançamento" + "Manter lançamento" | "Sim" + "Não" |
| "Ver todos" (dentro do cartão "Lançamentos de hoje") | "Clique aqui" |

## Acessibilidade

- **Semântica:** sempre `<button>` nativo, com `type` explícito: `type="submit"` no salvar de formulário, `type="button"` no resto. Enter e Espaço acionam de graça.
- **Ícone:** `aria-hidden="true"`; o nome acessível vem do rótulo. O único botão só com ícone é fechar: `aria-label="Fechar"`, ícone `x`.
- **Carregando:** `disabled` impede o segundo envio; `aria-busy="true"` marca a espera. A mudança de rótulo nem sempre é lida, por isso o resultado é anunciado pelo aviso do [GoldenTouch](golden-touch.md) (`role="status"`) ou por um [Notice](notice.md) de erro. Alguns navegadores tiram o foco de um botão que fica `disabled`: depois de salvar, mova o foco de forma explícita (veja Casos-limite).
- **Confirmação de perigo:** ao tocar em "Excluir lançamento", a frase de confirmação e os dois botões entram no lugar, dentro de um `role="group"` com `aria-labelledby` apontando para a frase. O foco vai para "Manter lançamento" (a opção segura); Esc também cancela. Ao cancelar, o foco volta para "Excluir lançamento".
- **Contraste:** `sobre-primario` sobre `primario` 9,47:1 (claro) e 8,99:1 (escuro); no hover 11,58:1 e 10,56:1. `tinta` sobre `superficie` 15,51:1 e 14,59:1. `ouro-texto` do ghost 5,98:1 sobre `superficie` e 4,94:1 sobre `superficie-funda` (hover) no claro. `gasto` do perigo 6,11:1 e 7,53:1 sobre `superficie`. A borda do secundário (`borda`) tem 4,01:1 sobre `superficie`.
- **Alvo de toque:** 48px de altura em todos (56px no `lg`); o fechar tem 48 × 48px.
- **Movimento reduzido:** com `prefers-reduced-motion: reduce`, a onda do `md-toque` não aparece e a troca de fundo fica instantânea. Nada se perde: o aviso continua.

## Comportamento responsivo

- No celular (até 640px), o botão principal de um formulário ocupa a largura toda (`w-full`) e fica no fim do formulário, depois do último campo. Secundário vem abaixo do principal, também em largura toda.
- A partir de 640px, os botões ficam lado a lado, alinhados à direita, com o principal por último (mais perto da mão e do fim da leitura).
- "Adicionar gasto" (`md-btn-lg`) no painel ocupa a largura toda no celular.
- O rótulo nunca é cortado com reticências. Com fonte ampliada pela pessoa (200%), ele quebra em duas linhas e o botão cresce em altura.

## Casos-limite

- **Toque duplo no salvar:** o primeiro toque já põe `disabled`; o segundo não faz nada. No servidor, o lançamento novo leva um identificador gerado no cliente para que um reenvio não crie duplicata.
- **Erro de rede ao salvar:** o botão volta ao rótulo normal e ativo; um [Notice](notice.md) com `role="status"` diz o que fazer: "Não deu para salvar agora. Confira a internet e toque em Salvar gasto de novo." O que a pessoa digitou fica no formulário.
- **Foco depois de salvar:** o formulário fecha e o foco volta para o botão que o abriu ("Adicionar gasto").
- **Confirmação esquecida:** se a pessoa sai da tela com a confirmação aberta, nada é apagado. Ao voltar, o botão "Excluir lançamento" aparece de novo, sem confirmação pendente.
- **Rótulo com valor:** não coloque valores no rótulo ("Pagar R$ 127,90"). O valor fica no conteúdo da tela.
- **Dois primários:** se a tela parece pedir dois, uma das ações é secundária ou é outra tela.

## Referência HTML

```html
<!-- Principal grande, com ícone (painel) -->
<button type="button" class="md-btn md-btn-primary md-btn-lg">
  <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  Adicionar gasto
</button>

<!-- Salvar lançamento novo, com toque de ouro -->
<button type="submit" class="md-btn md-btn-primary md-toque">Salvar gasto</button>

<!-- Carregando -->
<button type="submit" class="md-btn md-btn-primary md-toque" disabled aria-busy="true">Salvando…</button>

<button type="button" class="md-btn md-btn-secondary">Voltar</button>
<button type="button" class="md-btn md-btn-ghost">Ver todos</button>

<!-- Perigo, etapa 1 -->
<button type="button" class="md-btn md-btn-danger">Excluir lançamento</button>

<!-- Perigo, etapa 2: substitui a etapa 1 no mesmo lugar -->
<div role="group" aria-labelledby="apagar-frase" class="md-col">
  <p id="apagar-frase">Apagar o lançamento Mercado do bairro, − R$ 127,90? Ele sai do seu histórico e não volta.</p>
  <div class="md-row">
    <button type="button" class="md-btn md-btn-danger">Apagar lançamento</button>
    <button type="button" class="md-btn md-btn-secondary">Manter lançamento</button>
  </div>
</div>

<!-- Fechar: único botão só com ícone -->
<button type="button" class="md-btn md-btn-ghost md-btn-fechar" aria-label="Fechar">
  <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
</button>
```

## Referência CSS

```css
/* bundle.css */
.md-btn { position: relative; overflow: hidden; font: 600 15px/20px var(--font-sans); min-height: 48px; padding: 0 var(--space-6); border-radius: var(--radius-md); border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); cursor: pointer; transition: background .15s ease; }
.md-btn-primary { background: var(--primario); color: var(--sobre-primario); }
.md-btn-primary:hover { background: var(--primario-hover); }
.md-btn-secondary { background: var(--superficie); color: var(--tinta); border-color: var(--borda); }
.md-btn-secondary:hover { background: var(--superficie-funda); }
.md-btn-ghost { background: transparent; color: var(--ouro-texto); padding: 0 var(--space-3); }
.md-btn-ghost:hover { background: var(--superficie-funda); }
.md-btn-danger { background: var(--superficie); color: var(--gasto); border-color: var(--gasto); }
.md-btn-lg { min-height: 56px; font-size: 17px; padding: 0 var(--space-8); }
.md-btn[disabled] { opacity: .45; cursor: not-allowed; }
.md-btn:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px; }

/* Ajustes propostos por esta documentação */
.md-btn { transition: background var(--duracao-rapida) ease; }
.md-btn-danger:hover { background: var(--gasto-fundo); }
.md-btn[aria-busy="true"] { opacity: 1; cursor: progress; }
.md-btn-fechar { width: 48px; padding: 0; color: var(--tinta); }
@media (prefers-reduced-motion: reduce) { .md-btn { transition: none; } }
```

A classe `md-toque` não tem regra própria: ela marca o botão para o script do toque de ouro. A onda depende do `position: relative` e do `overflow: hidden` que o `.md-btn` já tem. As regras de `.md-onda` estão em [GoldenTouch](golden-touch.md).

## Implementação no app

Base: o `Button` do shadcn/ui (`src/components/ui/button.tsx`), que monta as classes com `cva` e aceita `asChild` (Radix `Slot`) para virar link. Troque as variantes do shadcn pelas do Midas e exponha como `src/components/midas/button.tsx`.

```tsx
// src/components/midas/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden",
    "rounded-md border border-transparent px-6 font-sans text-label font-semibold",
    "transition-colors duration-(--duracao-rapida) motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
    "disabled:cursor-not-allowed disabled:opacity-45",
    "aria-busy:cursor-progress aria-busy:opacity-100",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primario text-sobre-primario enabled:hover:bg-primario-hover",
        secondary: "border-borda bg-superficie text-tinta enabled:hover:bg-superficie-funda",
        ghost: "bg-transparent px-3 text-ouro-texto enabled:hover:bg-superficie-funda",
        danger: "border-gasto bg-superficie text-gasto enabled:hover:bg-gasto-fundo",
      },
      size: {
        md: "",
        lg: "min-h-14 px-8 text-[1.0625rem]",
        close: "size-12 px-0 text-tinta",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

// Sugestão de props (interface, não contrato de biblioteca)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;        // vira link com <Link> (Radix Slot), como no shadcn
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  loading?: boolean;        // põe disabled + aria-busy e troca o rótulo
  loadingLabel?: string;    // "Salvando…"
}
```

Exemplos de uso:

```tsx
import { Plus } from "lucide-react";

<Button size="lg" icon={Plus} className="w-full sm:w-auto" asChild>
  <Link href="/lancamentos/novo">Adicionar gasto</Link>
</Button>

// Salvar com toque de ouro: as props vêm do hook (veja golden-touch.md)
const touch = useGoldenTouch();
<Button type="submit" loading={saving} loadingLabel="Salvando…" {...touch.buttonProps}>
  {kind === "expense" ? "Salvar gasto" : "Salvar renda"}
  {touch.ripple}
</Button>

<Button type="button" size="close" variant="ghost" aria-label="Fechar">
  <X className="size-5" strokeWidth={1.75} aria-hidden />
</Button>
```

Notas:

- Dentro do componente, o ícone recebe `className="size-5"`, `strokeWidth={1.75}` e `aria-hidden`.
- `loading` renderiza `disabled` e `aria-busy="true"` e troca o texto por `loadingLabel`. Não use spinner: o gerúndio basta e não gira.
- A confirmação de perigo pode ser um componente `<ConfirmDelete what="o lançamento Mercado do bairro, − R$ 127,90" onConfirm={…} />` que alterna entre as duas etapas com estado local e move o foco com `ref.focus()`. Não use o `AlertDialog` do shadcn aqui: o Midas pede a confirmação na própria tela, sem modal.
- Com Tailwind v4, os variantes `enabled:` e `aria-busy:` já existem; confira no projeto se `outline-foco` e `bg-gasto-fundo` saem do `@theme inline`.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Um único primário por tela. | Dois primários lado a lado. |
| Verbo + objeto no rótulo. | "OK", "Enviar", "Sim". |
| "Salvando…" com `disabled` e `aria-busy`. | Spinner girando sem texto. |
| Confirmar exclusão na própria tela, dizendo o que some. | Diálogo modal surpresa com "Tem certeza?". |
| `md-toque` só no salvar de lançamento novo. | Onda dourada em "Adicionar gasto", "Entrar" ou "Baixar". |
| Ícone sempre com texto; fechar com `aria-label`. | Botão só com ícone para editar ou excluir. |

## Relacionados

- [GoldenTouch](golden-touch.md), [Notice](notice.md), [MoneyInput](money-input.md), [EmptyState](empty-state.md)
- [Cores](../04-cores.md), [Tipografia](../05-tipografia.md), [Espaço e forma](../06-espaco-e-forma.md), [Movimento](../10-movimento.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Iconografia](../09-iconografia.md)
