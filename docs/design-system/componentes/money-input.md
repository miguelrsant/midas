# MoneyInput (Campo de valor)

> Campo grande para digitar um valor em reais, o primeiro passo do formulário de lançamento; também aparece nas calculadoras.

Grupo: Lançamentos · Classe base: `md-field` + `md-input` · Componente React sugerido: `<MoneyInput />`

## Quando usar

- Para o valor de um lançamento ("Quanto foi?", "Quanto entrou?").
- Para valores em reais nas calculadoras (salário, férias, rescisão).
- A variante de texto (`md-input-text`) serve para descrição e notas do lançamento.

## Quando não usar

- Para mostrar um valor que não se edita: use `amount` em listas ([TransactionRow](transaction-row.md)) ou o saldo ([BalanceCard](balance-card.md)).
- Para quantidades que não são dinheiro (dias, meses): use um campo numérico comum com `inputmode="numeric"`.
- Para senha, e-mail ou busca: use o campo de texto do formulário correspondente ([LoginScreen](login-screen.md)).

## Anatomia

1. **Campo:** `<div class="md-field">`, coluna com 8px (`space-2`) entre as partes, largura máxima 360px.
2. **Rótulo:** `<label class="md-label" for="…">`, `sans` 600 15px/20px em `tinta`. Uma pergunta: "Quanto foi?".
3. **Caixa:** `<span class="md-input">`, fundo `superficie-funda`, borda 1px `borda`, raio `radius-md`, altura mínima 64px, padding 12px 16px, itens alinhados pela linha de base.
4. **Sinal (quando há tipo):** "−" ou "+" antes do prefixo, na cor `gasto` ou `renda`, `aria-hidden="true"`.
5. **Prefixo:** "R$" em `display` (Midas Display) 400 20px, cor `tinta-suave`, `aria-hidden="true"`.
6. **Entrada:** `<input type="text">` em `sans` (Atkinson Hyperlegible Next) 600 32px/40px, `tabular-nums`, cor `tinta` (ou `gasto`/`renda` quando há tipo).
7. **Ajuda / erro:** `<p class="md-help">`, `sans` 400 14px/20px (`caption`) em `tinta-suave`; no erro vira a mensagem, com ícone `triangle-alert`.

## Variantes

| Variante / classe | Quando usar | Tokens |
| --- | --- | --- |
| `md-input` (valor) | Valores em reais. | `superficie-funda`, `borda`, `tinta`, `tinta-suave`, `sans` 600 32/40 |
| `md-input` com tipo Gasto | Formulário de lançamento com Gasto marcado. | sinal "−" e valor em `gasto` |
| `md-input` com tipo Renda | Formulário de lançamento com Renda marcada. | sinal "+" e valor em `renda` |
| `md-input md-input-text` | Descrição (uma linha) e notas. Sem prefixo. | `sans` 400 17/26 (`body`), altura mínima 52px, itens centralizados |

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Vazio | Caixa com "R$" e cursor; ajuda "Use vírgula para os centavos." | `tinta-suave` | Sem placeholder: a ajuda fica sempre visível. |
| Foco | Anel 2px `foco`, afastado 2px, em volta da caixa (`:focus-within`). | `foco` | A entrada em si não tem contorno. |
| Preenchido | Valor como digitado; ao sair, formatado ("1.234,56"). | `tinta` / `gasto` / `renda` | |
| Erro | Borda 2px `alerta`; ajuda troca pela frase de erro, em `tinta`, com ícone `triangle-alert` em `alerta`. | `alerta`, `tinta` | Ajuste proposto (o `bundle.css` não tem estado de erro). `alerta` tem 4,73:1 sobre `superficie-funda` no claro. |
| Desabilitado | Opacidade 0,45 no campo todo. | | Só durante "Salvando…". |

## Regras de leitura do valor

O campo aceita o que a pessoa digitar e só interpreta ao sair do campo ou ao salvar. Antes de ler, ignore espaços (inclusive U+00A0) e um "R$" no começo. Depois:

1. **Tem vírgula:** a vírgula separa os centavos e os pontos são ignorados. Mais de uma vírgula é erro de formato.
2. **Sem vírgula, com um único ponto seguido de 1 ou 2 dígitos no fim:** o ponto é decimal (teclados de celular em algumas regiões só mostram ponto).
3. **Nos outros casos:** pontos são separadores de milhar e são ignorados.
4. **No máximo duas casas decimais.**
5. **Maior que zero** e **no máximo R$ 9.999.999,99** (999.999.999 centavos, cabe em `int4`).
6. **Sem sinal:** "−", "-" e "+" são recusados; quem define o sinal é o tipo (Gasto/Renda).

| Digitado | Resultado (centavos) | Mostrado ao sair |
| --- | --- | --- |
| `127,90` | 12790 | 127,90 |
| `1.234,56` | 123456 | 1.234,56 |
| `1234,56` | 123456 | 1.234,56 |
| `8,5` | 850 | 8,50 |
| `8.50` | 850 | 8,50 |
| `8.5` | 850 | 8,50 |
| `1.234` | 123400 | 1.234,00 |
| `1.234.567` | 123456700 | 1.234.567,00 |
| `12` | 1200 | 12,00 |
| `,50` | 50 | 0,50 |
| `8,` | 800 | 8,00 |
| `R$ 12,00` | 1200 | 12,00 |
| `9.999.999,99` | 999999999 | 9.999.999,99 |
| `1,234` | erro | "Use no máximo dois números depois da vírgula." |
| (vazio), `0`, `0,00` | erro | "Digite um valor maior que zero." |
| `10.000.000` | erro | "Esse valor parece alto demais. Confira os números." |
| `-5`, `−5`, `+5` | erro | "Digite só o número, sem sinal." |
| `abc`, `12a`, `1,2,3` | erro | "Use só números, com vírgula para os centavos." |

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Largura máxima do campo | 360px | |
| Espaço rótulo–caixa–ajuda | 8px | `space-2` |
| Altura mínima da caixa | 64px (52px no texto) | |
| Padding da caixa | 12px 16px | `space-3`, `space-4` |
| Espaço sinal/prefixo–valor | 8px | `space-2` |
| Borda | 1px (2px no erro) | `borda` / `alerta` |
| Raio | 10px | `radius-md` |
| Valor | 600 32px/40px, `tabular-nums` | `sans` |
| Prefixo | 400 20px/1 | `display` |
| Rótulo | 600 15px/20px | `label` |
| Ajuda | 400 14px/20px | `caption` |
| Texto (`md-input-text`) | 400 17px/26px | `body` |

## Tokens usados

| Token | Onde |
| --- | --- |
| `superficie-funda` | Fundo da caixa |
| `borda` | Borda da caixa |
| `tinta` | Rótulo, valor sem tipo, texto do erro |
| `tinta-suave` | Prefixo "R$", ajuda, "(opcional)" |
| `gasto`, `renda` | Sinal e valor conforme o tipo |
| `alerta` | Borda e ícone do erro (proposto) |
| `foco` | Anel de foco |
| `radius-md`, `space-2`, `space-3`, `space-4` | Forma e espaço |

## Conteúdo

- O rótulo é uma pergunta curta: "Quanto foi?", "Quanto entrou?", "Qual é o seu salário?".
- Ajuda padrão: "Use vírgula para os centavos."
- Mensagens de erro dizem o que fazer, sem culpa, e terminam com ponto.
- Campos opcionais levam "(opcional)" no rótulo, em peso 400 e `tinta-suave`: "Descrição (opcional)".

| Faça | Evite |
| --- | --- |
| "Quanto foi?" | "Valor da transação" |
| "Digite um valor maior que zero." | "Valor inválido" |
| "Esse valor parece alto demais. Confira os números." | "Excedeu o limite" |
| "Descrição (opcional)" com exemplo na ajuda: "Por exemplo: Mercado do bairro." | Placeholder cinza que some ao digitar |

## Acessibilidade

- **Rótulo:** `<label for>` só em volta do texto do rótulo. Inclua " em reais" em `md-sr` dentro do rótulo, porque o "R$" é `aria-hidden`. O leitor anuncia: "Quanto foi? em reais, editar texto, Use vírgula para os centavos."
- **Tipo de entrada:** `type="text"` com `inputmode="decimal"` (teclado numérico com separador), `autocomplete="off"`, `enterkeyhint="next"`, `spellcheck="false"`. Não use `type="number"`: ele recusa vírgula em vários navegadores e muda o valor com a roda do mouse.
- **Enter:** no campo de valor, Enter não envia o formulário; leva o foco ao grupo de categorias, o próximo passo (combina com `enterkeyhint="next"`).
- **Foco inicial:** o campo de valor recebe o foco quando o formulário abre (`autoFocus`), porque é o primeiro passo.
- **Erro:** `aria-invalid="true"` na entrada; a ajuda, ligada por `aria-describedby`, vira a mensagem. Ao salvar com erro, o foco volta ao campo e o leitor lê a mensagem. Não use região viva: a mensagem aparece ao sair do campo e é lida quando a pessoa volta a ele.
- **Não reformatar enquanto digita:** mexer no texto a cada tecla faz o cursor pular, e quem usa leitor de tela ouve o texto mudar. Formate só ao sair do campo.
- **Contraste:** valor em `tinta` 12,79:1 sobre `superficie-funda` no claro (13,09:1 no escuro); `gasto` 5,04:1 e 6,76:1; `renda` 5,39:1 e 7,80:1; prefixo e ajuda em `tinta-suave` 5,62:1 e 7,58:1; `borda` 3,31:1 e 3,66:1.
- **Sinal:** o "−"/"+" é visual; o rótulo ("Quanto foi?"/"Quanto entrou?") já diz a direção.
- **Movimento:** nenhum.

## Comportamento responsivo

- No celular, o campo ocupa a largura toda (`max-width: none`); a partir de 640px, respeita os 360px.
- O valor de 32px cabe "9.999.999,99" numa caixa de 320px; em telas menores ou com fonte ampliada, a entrada rola na horizontal dentro da caixa (`min-width: 0`), e o prefixo não encolhe.
- Os tamanhos ficam em rem no app, para acompanhar a fonte escolhida pela pessoa.

## Casos-limite

- **Campo vazio ao sair:** sem erro (a pessoa pode ter ido ao alternador). O erro "Digite um valor maior que zero." aparece só ao salvar.
- **Depois do primeiro erro:** revalide a cada mudança, para a mensagem sumir assim que o valor ficar certo.
- **Ao sair com valor inválido:** mantenha o texto como está e mostre o erro. Não apague o que a pessoa digitou.
- **Formatado e lido de novo:** "1.234,56" lido de novo dá o mesmo valor; teste essa ida e volta.
- **Casos estranhos pela regra 3:** "1.2.3" vira 123,00 e "8.505" vira 8.505,00. A formatação ao sair mostra o resultado, e a pessoa confere.
- **Colar texto:** colar "R$ 1.234,56" funciona (prefixo e espaços são ignorados).
- **Tamanho máximo:** `maxLength={20}` evita textos absurdos sem cortar valores válidos com espaços.
- **Edição:** o campo abre com o valor formatado ("127,90"), a partir dos centavos guardados.

## Referência HTML

```html
<div class="md-field">
  <label class="md-label" for="valor">Quanto foi?<span class="md-sr"> em reais</span></label>
  <span class="md-input is-gasto">
    <span class="md-sinal" aria-hidden="true">−</span>
    <span class="md-prefix" aria-hidden="true">R$</span>
    <input id="valor" name="amount" type="text" inputmode="decimal" autocomplete="off"
           enterkeyhint="next" spellcheck="false" maxlength="20" autofocus
           value="127,90" aria-describedby="valor-ajuda">
  </span>
  <p class="md-help" id="valor-ajuda">Use vírgula para os centavos.</p>
</div>

<!-- Erro -->
<div class="md-field">
  <label class="md-label" for="valor2">Quanto foi?<span class="md-sr"> em reais</span></label>
  <span class="md-input is-gasto">
    <span class="md-sinal" aria-hidden="true">−</span><span class="md-prefix" aria-hidden="true">R$</span>
    <input id="valor2" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="next"
           value="1,234" aria-invalid="true" aria-describedby="valor2-ajuda">
  </span>
  <p class="md-help is-erro" id="valor2-ajuda">
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="…"/></svg>
    Use no máximo dois números depois da vírgula.
  </p>
</div>

<!-- Texto: descrição -->
<div class="md-field">
  <label class="md-label" for="desc">Descrição <span class="md-opcional">(opcional)</span></label>
  <span class="md-input md-input-text"><input id="desc" name="description" type="text" autocomplete="off" enterkeyhint="done" maxlength="60" aria-describedby="desc-ajuda"></span>
  <p class="md-help" id="desc-ajuda">Por exemplo: Mercado do bairro.</p>
</div>
```

Diferente do protótipo, o `<label>` não envolve a caixa e a ajuda: no protótipo, o nome acessível incluía "R$" e o texto da ajuda.

## Referência CSS

```css
/* bundle.css */
.md-field { display: flex; flex-direction: column; gap: var(--space-2); max-width: 360px; }
.md-label { font: 600 15px/20px var(--font-sans); color: var(--tinta); }
.md-help { font: 400 14px/20px var(--font-sans); color: var(--tinta-suave); }
.md-input { display: flex; align-items: baseline; gap: var(--space-2); min-height: 64px; padding: var(--space-3) var(--space-4); background: var(--superficie-funda); border: 1px solid var(--borda); border-radius: var(--radius-md); }
.md-input .md-prefix { font: 400 20px/1 var(--font-display); color: var(--tinta-suave); }
.md-input input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--tinta); font: 600 32px/40px var(--font-sans); font-variant-numeric: tabular-nums; outline: none; }
.md-input-text input { font: 400 17px/26px var(--font-sans); }
.md-input-text { min-height: 52px; align-items: center; }
.md-input:focus-within { outline: 2px solid var(--foco); outline-offset: 2px; }

/* Ajustes propostos: sinal por tipo, opcional, erro */
.md-input .md-sinal { font: 400 20px/1 var(--font-display); }
.md-input.is-gasto .md-sinal, .md-input.is-gasto input { color: var(--gasto); }
.md-input.is-renda .md-sinal, .md-input.is-renda input { color: var(--renda); }
.md-opcional { font-weight: 400; color: var(--tinta-suave); }
.md-input:has(input[aria-invalid="true"]) { border-color: var(--alerta); box-shadow: inset 0 0 0 1px var(--alerta); }
.md-help.is-erro { display: flex; gap: var(--space-2); color: var(--tinta); }
.md-help.is-erro .md-icon { color: var(--alerta); flex: none; }
@media (max-width: 639px) { .md-field { max-width: none; } }
```

## Implementação no app

Base shadcn: `Label` e `Input` (`src/components/ui/`), com as classes do Midas no lugar das do shadcn. O componente fica em `src/components/midas/money-input.tsx`; a leitura e a formatação, em `src/lib/money.ts`.

```ts
// src/lib/money.ts
export const MAX_CENTS = 999_999_999; // R$ 9.999.999,99, cabe em int4

export type MoneyError = "empty" | "zero" | "sign" | "format" | "decimals" | "tooHigh";
export type MoneyRead = { ok: true; cents: number } | { ok: false; error: MoneyError };

export const MONEY_ERRORS: Record<MoneyError, string> = {
  empty: "Digite um valor maior que zero.",
  zero: "Digite um valor maior que zero.",
  sign: "Digite só o número, sem sinal.",
  format: "Use só números, com vírgula para os centavos.",
  decimals: "Use no máximo dois números depois da vírgula.",
  tooHigh: "Esse valor parece alto demais. Confira os números.",
};

export function readMoney(text: string): MoneyRead {
  const t = text.replace(/[\s ]/g, "").replace(/^R\$/i, "");
  if (t === "") return { ok: false, error: "empty" };
  if (/^[-−+]/.test(t)) return { ok: false, error: "sign" };
  if (!/^[\d.,]+$/.test(t)) return { ok: false, error: "format" };
  const parts = t.split(",");
  if (parts.length > 2) return { ok: false, error: "format" };
  let int: string;
  let frac: string;
  if (parts.length === 2) {
    int = parts[0].replaceAll(".", "");
    frac = parts[1];
    if (frac.includes(".")) return { ok: false, error: "format" };
  } else {
    const decimal = /^(\d*)\.(\d{1,2})$/.exec(t); // um único ponto + 1 ou 2 dígitos no fim
    [int, frac] = decimal ? [decimal[1], decimal[2]] : [t.replaceAll(".", ""), ""];
  }
  if (int === "" && frac === "") return { ok: false, error: "format" };
  if (frac.length > 2) return { ok: false, error: "decimals" };
  int = int.replace(/^0+/, "");
  if (int.length > 7) return { ok: false, error: "tooHigh" };
  const cents = Number(int || "0") * 100 + Number(frac.padEnd(2, "0"));
  if (cents === 0) return { ok: false, error: "zero" };
  if (cents > MAX_CENTS) return { ok: false, error: "tooHigh" };
  return { ok: true, cents };
}

export const parseMoney = (text: string): number | null => {
  const r = readMoney(text);
  return r.ok ? r.cents : null;
};

const amountFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "1.234,56", sem sinal e sem "R$": o texto do campo ao sair. */
export const formatAmount = (cents: number) => amountFmt.format(cents / 100);
```

```tsx
// src/components/midas/money-input.tsx (sugestão de props)
interface MoneyInputProps {
  id: string;
  label: string;                     // "Quanto foi?"
  kind?: EntryKind;                  // define sinal e cor; sem kind, só "R$"
  text: string;                      // texto controlado, como digitado
  onTextChange: (text: string) => void;
  error?: string | null;             // mensagem já pronta (MONEY_ERRORS)
  onBlur?: () => void;               // o formulário valida e formata aqui
  help?: string;                     // padrão "Use vírgula para os centavos."
  autoFocus?: boolean;
  disabled?: boolean;
  onEnter?: () => void;              // leva o foco às categorias
}
```

```tsx
<div className="flex flex-col gap-2 sm:max-w-[22.5rem]">
  <Label htmlFor={id} className="font-sans text-label font-semibold text-tinta">
    {label}<span className="sr-only"> em reais</span>
  </Label>
  <span className={cn(
    "flex min-h-16 items-baseline gap-2 rounded-md border border-borda bg-superficie-funda px-4 py-3",
    "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foco",
    error && "border-alerta shadow-[inset_0_0_0_1px_var(--alerta)]",
    kind === "expense" && "text-gasto", kind === "income" && "text-renda",
  )}>
    {kind && <span aria-hidden className="font-display text-[1.25rem] leading-none">{kind === "expense" ? "−" : "+"}</span>}
    <span aria-hidden className="font-display text-[1.25rem] leading-none text-tinta-suave">R$</span>
    <input
      id={id} type="text" inputMode="decimal" autoComplete="off" enterKeyHint="next" spellCheck={false}
      maxLength={20} autoFocus={autoFocus} disabled={disabled}
      value={text} onChange={(e) => onTextChange(e.target.value)} onBlur={onBlur}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter?.(); } }}
      aria-invalid={error ? true : undefined} aria-describedby={`${id}-ajuda`}
      className={cn("min-w-0 flex-1 bg-transparent font-sans text-[2rem] leading-10 font-semibold tabular-nums outline-none",
        kind ? "text-current" : "text-tinta")}
    />
  </span>
  <p id={`${id}-ajuda`} className={cn("flex gap-2 font-sans text-caption", error ? "text-tinta" : "text-tinta-suave")}>
    {error && <TriangleAlert className="size-5 flex-none text-alerta" strokeWidth={1.75} aria-hidden />}
    {error ?? help ?? "Use vírgula para os centavos."}
  </p>
</div>
```

No formulário, ao sair do campo: `const r = readMoney(text); if (r.ok) setText(formatAmount(r.cents)); else if (text.trim() !== "") setError(MONEY_ERRORS[r.error]);`. Ao salvar, rode `readMoney` de novo e guarde `r.cents` (inteiro) com o tipo; nunca guarde o valor com sinal nem em ponto flutuante.

A variante de texto usa a mesma estrutura sem sinal nem prefixo, com `min-h-13` (52px), `items-center` e entrada em `text-body`. Para notas de várias linhas, use `<textarea rows={3}>` com as mesmas classes e `resize-y`.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Aceitar vírgula e ponto, e explicar com a ajuda. | Recusar "8.50" de quem tem teclado com ponto. |
| Formatar ao sair do campo. | Máscara que reformata a cada tecla. |
| Guardar centavos inteiros. | Guardar `8.5` em ponto flutuante. |
| Erro que diz como corrigir. | "Valor inválido". |
| Foco no valor ao abrir o formulário. | Foco no título ou no alternador. |

## Relacionados

- [SegmentedToggle](segmented-toggle.md), [CategoryChip](category-chip.md), [Button](button.md), [GoldenTouch](golden-touch.md), [TransactionRow](transaction-row.md)
- [Tipografia](../05-tipografia.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Padrões de tela](../17-padroes-de-tela.md)
