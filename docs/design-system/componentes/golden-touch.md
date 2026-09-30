# GoldenTouch (Toque de ouro)

> O único efeito comemorativo do Midas: ao salvar um lançamento novo, uma onda dourada nasce no botão, a linha nova recebe um reflexo e um aviso repete o que foi anotado.

Grupo: Lançamentos · Classes base: `md-toque`, `md-onda`, `md-brilho`, `md-aviso-toque` · Sugestão React: hook `useGoldenTouch()` + `<GoldenTouchProvider />`

## Quando usar

- Só ao salvar um **lançamento novo** (gasto ou renda), no botão principal do formulário: "Salvar gasto", "Salvar renda".
- Também quando uma calculadora cria uma renda (13º salário, Férias, Rescisão) e a pessoa toca em salvar.

## Quando não usar

- Em qualquer outro botão: "Adicionar gasto" (só abre o formulário), "Entrar", "Baixar meus dados", "Salvar" de configurações.
- Na edição de um lançamento: sem onda nem brilho; a confirmação usa a mesma região de status, só com texto ("Alterado: Café, − R$ 9,00"), sem a moeda.
- Ao excluir: nada de dourado. A confirmação é texto ("Lançamento apagado.").
- Para erros ou avisos: use [Notice](notice.md).
- Nunca para "premiar" gastos menores ou metas: a conquista do mês é o [Achievement](achievement.md).

## Anatomia

1. **Botão com toque:** o primário do formulário com o modificador `md-toque` (veja [Button](button.md)). O `position: relative` e o `overflow: hidden` do `.md-btn` recortam a onda.
2. **Onda (`md-onda`):** `<span aria-hidden="true">` de 12px, redondo, em `ouro` com opacidade 0,55, centrado no ponto tocado (no centro do botão quando veio do teclado). Cresce 28 vezes (cerca de 336px) e some em `duracao-toque` (650ms), curva `cubic-bezier(.2,.7,.2,1)`.
3. **Reflexo (`md-brilho`):** faixa diagonal (100°) em `brilho` que atravessa a linha nova da [TransactionRow](transaction-row.md) uma única vez, da direita para a esquerda, em 650ms `ease-out`.
4. **Aviso (`md-aviso-toque`):** pílula com a moeda (`md-moeda`, 22px, `folha-de-ouro`, `aria-hidden`) e o texto "Anotado: …", em `sans` 600 15px/20px. Fundo `tinta` com texto `marmore` no Calacatta; fundo `superficie-funda` com texto `tinta` no Portoro.
5. **Região de status:** contêiner com `role="status"`, sempre presente na página, onde o aviso aparece. Sem botão (veja Acessibilidade).

## Variantes

| Variante / classe | Quando usar | Tokens |
| --- | --- | --- |
| Toque completo (onda + brilho + aviso) | Salvar lançamento novo. | `ouro`, `brilho`, `folha-de-ouro`, `duracao-toque` |
| Só aviso, sem moeda | Edição salva ("Alterado: …"). | `tinta`, `marmore` / `superficie-funda` |
| Movimento reduzido | `prefers-reduced-motion: reduce`: sem onda e sem brilho; o aviso aparece e é lido igual. | |

## Estados e sequência

| Momento | O que acontece | Tokens | Observação |
| --- | --- | --- | --- |
| Toque em "Salvar gasto" com formulário válido | A onda nasce no ponto tocado; o botão vira "Salvando…" (`disabled`, `aria-busy`). | `ouro`, `duracao-toque` | Formulário inválido: sem onda; o erro aparece no campo. |
| Salvo (e a onda terminou) | O formulário fecha; o foco volta para "Adicionar gasto". | | A navegação espera a onda acabar (no máximo 650ms). |
| Linha nova na lista | Entra no topo com `md-brilho`, uma vez. | `brilho` | O reflexo roda uma vez e não repete ao rolar. |
| Aviso visível | "Anotado: Café, − R$ 8,50" na região de status. | `tinta`, `marmore`, `folha-de-ouro` | Some sozinho em 4 segundos. |
| Outro lançamento salvo antes de 4s | O texto é trocado e a contagem de 4s recomeça. | | Um aviso por vez. |
| Erro de rede | Sem brilho e sem aviso "Anotado"; o botão volta ao normal e um [Notice](notice.md) diz o que fazer. | | A onda já tocou: ela só confirma o toque, não o resultado. |

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Onda: tamanho inicial | 12 × 12px, margem −6px (centrada no ponto) | |
| Onda: escala final | 28 (cerca de 336px de diâmetro) | |
| Onda: opacidade | 0,55 → 0 | |
| Duração da onda e do brilho | 650ms | `duracao-toque` |
| Brilho: faixa | gradiente 100°, `transparent` 20%, `brilho` 45%, `transparent` 70%; `background-size` 250% 100% | `brilho` |
| Brilho: percurso | `background-position` de 120% a −60% | |
| Aviso: padding | 12px 16px | `space-3`, `space-4` |
| Aviso: espaço moeda–texto | 12px | `space-3` |
| Aviso: raio | 999px | `radius-pill` |
| Aviso: fonte | 600 15px/20px | `label`, `sans` |
| Aviso: moeda | 22 × 22px | `folha-de-ouro` |
| Aviso: posição | fixo, centrado, 24px acima da borda inferior (mais a área segura) | `space-6` |
| Aviso: tempo na tela | 4 segundos | |

## Tokens usados

| Token | Onde |
| --- | --- |
| `ouro` | Onda |
| `brilho` | Reflexo na linha nova (só em movimento) |
| `folha-de-ouro` | Moeda do aviso |
| `tinta`, `marmore` | Fundo e texto do aviso no Calacatta |
| `superficie-funda`, `tinta` | Fundo e texto do aviso no Portoro |
| `sombra-cartao` | Sombra do aviso |
| `duracao-toque` | Onda e brilho |
| `radius-pill`, `space-3`, `space-4`, `space-6` | Forma e espaço do aviso |

## Conteúdo

- O aviso repete o que foi salvo: **"Anotado: " + descrição (ou o nome da categoria, se não houver descrição) + ", " + valor com sinal**.
- Quando a pessoa não escolheu categoria, o aviso diz para onde foi: **"Anotado em Outros: − R$ 8,50"** (com descrição: "Anotado em Outros: Café, − R$ 8,50").
- O valor segue a regra de valores: sinal, espaço, "R$", espaço, número, com espaços inseparáveis (U+00A0) e sinal de menos U+2212.
- Sem ponto de exclamação, sem "Sucesso!", sem emoji.

| Faça | Evite |
| --- | --- |
| "Anotado: Café, − R$ 8,50" | "Sucesso!" |
| "Anotado: Salário, + R$ 5.400,00" | "Transação criada com êxito" |
| "Anotado em Outros: − R$ 8,50" | "Anotado." (sem dizer o quê) |
| "Anotado: Mercado, − R$ 127,90" | "Anotado: Mercado, -R$127,90" (hífen, sem espaços) |

## Acessibilidade

- **Região de status:** `role="status"` (educada: espera o leitor terminar o que está lendo). O contêiner existe desde o carregamento da página e só o texto muda; uma região criada junto com o texto, ou que sai de `hidden`, pode não ser anunciada. O sinal visual do valor fica com `aria-hidden="true"` e entra o texto escondido "Saiu"/"Entrou" (`md-sr`), como em toda a interface; o leitor anuncia: "Anotado: Café, Saiu R$ 8,50".
- **Mesmo texto duas vezes:** limpe o texto e escreva de novo no quadro seguinte, para o segundo aviso também ser lido.
- **Sem botão no aviso:** um botão ("Desfazer") num aviso que some em 4 segundos não dá tempo a quem navega por teclado ou leitor de tela (WCAG 2.2.1). Para desfazer, a pessoa toca na linha nova, que abre a edição, onde está "Excluir lançamento". A informação do aviso também fica na lista, por isso ele pode sumir sozinho.
- **Não rouba o foco:** o aviso não recebe foco e não bloqueia toques (`pointer-events: none`). O foco volta para o botão que abriu o formulário.
- **Decorativos:** onda e moeda são `aria-hidden="true"`; o brilho é só fundo.
- **Contraste do aviso:** `marmore` sobre `tinta` 14,34:1 (Calacatta); `tinta` sobre `superficie-funda` 13,09:1 (Portoro).
- **Contraste durante o brilho:** no pico da faixa, o texto da linha continua legível (`tinta` 11,82:1 no claro, 7,93:1 no escuro); o valor em `gasto` no Portoro cai por um instante para 4,10:1 e volta em menos de 1 segundo.
- **Movimento reduzido:** com `prefers-reduced-motion: reduce`, nada se move: sem onda, sem brilho, sem transição do aviso. A linha nova aparece, o aviso aparece, é lido e some em 4 segundos, igual.
- **Sem piscar:** a onda e o brilho acontecem uma vez por salvamento, longe do limite de três flashes por segundo.

## Comportamento responsivo

- O aviso fica fixo, centrado na parte de baixo da tela, com largura máxima de 100% menos 32px (16px de cada lado) e acima da área segura do celular (`env(safe-area-inset-bottom)`).
- Texto longo quebra em duas linhas; o valor nunca quebra (`white-space: nowrap` no valor).
- A onda se adapta ao tamanho do botão: ela é recortada pelo botão, que no celular ocupa a largura toda.

## Casos-limite

- **Toque vindo do teclado** (Enter ou Espaço): a onda nasce do centro do botão.
- **Ponto antigo:** o ponto tocado só vale se o toque aconteceu há menos de 1 segundo; senão, centro.
- **Salvamento muito rápido:** o formulário espera a onda terminar antes de fechar, para ela não ser cortada no meio.
- **Linha nova fora da tela** (lista rolada ou mês diferente): o aviso basta; não role a página até a linha.
- **Lançamento em outro mês:** o painel continua no mês que estava; o aviso diz o que foi salvo e a linha aparece quando a pessoa for ao mês dela.
- **Vários salvamentos seguidos:** um aviso por vez, com o texto do último.
- **Troca de página durante o aviso:** o aviso vive no layout raiz e continua visível até completar 4 segundos.
- **Sem JavaScript de animação carregado:** a linha e o aviso aparecem sem movimento; nada depende do efeito.

## Referência HTML

```html
<!-- No formulário -->
<button type="submit" class="md-btn md-btn-primary md-toque">
  Salvar gasto
  <!-- inserido pelo script ao tocar, removido no fim da animação -->
  <span class="md-onda" aria-hidden="true" style="left: 64px; top: 22px"></span>
</button>

<!-- Na lista, a linha nova -->
<li class="md-tx md-brilho">…</li>

<!-- No layout raiz: região sempre presente -->
<div class="md-aviso-regiao" role="status">
  <div class="md-aviso-toque">
    <span class="md-moeda" aria-hidden="true"></span>
    <span>Anotado: Café, <span class="md-valor"><span aria-hidden="true">−</span><span class="md-sr">Saiu</span>&nbsp;R$&nbsp;8,50</span></span>
  </div>
</div>
```

No protótipo, o aviso é o próprio `role="status"` e alterna o atributo `hidden`, e a linha nova do Café usa uma xícara; no app, a região fica sempre presente e o ícone de Restaurante é `utensils`.

## Referência CSS

```css
/* bundle.css */
.md-onda { position: absolute; border-radius: 50%; width: 12px; height: 12px; margin: -6px 0 0 -6px; background: var(--ouro); opacity: .55; pointer-events: none; animation: md-onda var(--duracao-toque, 650ms) cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes md-onda { to { transform: scale(28); opacity: 0; } }
.md-brilho { background-image: linear-gradient(100deg, transparent 20%, var(--brilho) 45%, transparent 70%); background-size: 250% 100%; background-repeat: no-repeat; animation: md-brilho var(--duracao-toque, 650ms) ease-out 1 both; }
@keyframes md-brilho { from { background-position: 120% 0; } to { background-position: -60% 0; } }
.md-aviso-toque { display: inline-flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-pill); background: var(--tinta); color: var(--marmore); font: 600 15px/20px var(--font-sans); box-shadow: var(--sombra-cartao); }
[data-theme="dark"] .md-aviso-toque { background: var(--superficie-funda); color: var(--tinta); }
.md-aviso-toque .md-moeda { width: 22px; height: 22px; }
.md-moeda { width: 28px; height: 28px; border-radius: var(--radius-pill); background: var(--folha-de-ouro); box-shadow: inset 0 0 0 2px rgba(122,86,26,.35); flex: none; display: inline-block; }
@media (prefers-reduced-motion: reduce) {
  .md-onda, .md-brilho { animation: none; }
  .md-onda { display: none; }
}

/* Ajustes propostos: região fixa do aviso e valor sem quebra */
.md-valor { white-space: nowrap; }
.md-aviso-regiao { position: fixed; left: 50%; bottom: calc(var(--space-6) + env(safe-area-inset-bottom)); transform: translateX(-50%); width: max-content; max-width: calc(100% - 2 * var(--space-4)); pointer-events: none; z-index: 50; }
```

Com `data-theme="dark"` no `<html>`, a regra do escuro vale para o aviso; no tema "Automático", o app aplica o atributo conforme o aparelho.

## Implementação no app

Não há base shadcn equivalente: o `Toaster` (Sonner) do shadcn traz botões de ação e empilha avisos, o que o Midas não quer. Sugestão de implementação:

- `src/components/midas/golden-touch-provider.tsx`: provedor no `app/layout.tsx` que renderiza a região de status, guarda o aviso atual e o id da linha a destacar.
- `src/hooks/use-golden-touch.ts`: hook para o formulário (onda + celebração) e para a lista (brilho).

As animações vêm do CSS global do Tailwind v4 (`animate-onda`, `animate-brilho`), com os `@keyframes` acima:

```css
@theme inline {
  --animate-onda: md-onda var(--duracao-toque) cubic-bezier(.2,.7,.2,1) forwards;
  --animate-brilho: md-brilho var(--duracao-toque) ease-out 1 both;
}
```

```ts
// Sugestão de API (não é contrato de biblioteca)
interface GoldenTouchContext {
  announce: (message: React.ReactNode, opts?: { coin?: boolean }) => void; // aviso por 4s
  highlightId: string | null;                                     // linha com brilho
  highlight: (rowId: string) => void;
  clearHighlight: () => void;
}

interface UseGoldenTouch {
  buttonProps: {                     // espalhar no <Button> de salvar
    className: "md-toque";
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void; // guarda o ponto e a hora
  };
  ripple: React.ReactNode;           // renderizar dentro do botão
  playRipple: () => Promise<void>;   // resolve no fim (na hora, com movimento reduzido)
  celebrate: (opts: { message: string; rowId: string }) => void;
}
```

```tsx
// Provedor: região sempre presente
export function GoldenTouchProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<{ text: React.ReactNode; coin: boolean } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const announce = useCallback((text: React.ReactNode, { coin = true } = {}) => {
    window.clearTimeout(timer.current);
    setNotice(null);                                       // limpa para reler o mesmo texto
    requestAnimationFrame(() => setNotice({ text, coin }));
    timer.current = window.setTimeout(() => { setNotice(null); setHighlightId(null); }, 4000);
  }, []);

  return (
    <GoldenTouchCtx.Provider value={{ announce, highlightId, highlight: setHighlightId, clearHighlight: () => setHighlightId(null) }}>
      {children}
      <div role="status" className="pointer-events-none fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-max max-w-[calc(100%-2rem)] -translate-x-1/2">
        {notice && (
          <div className="md-aviso-toque">
            {notice.coin && <span className="md-moeda" aria-hidden />}
            <span>{notice.text}</span>
          </div>
        )}
      </div>
    </GoldenTouchCtx.Provider>
  );
}
```

```tsx
// Formulário de lançamento
const touch = useGoldenTouch();

async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  const amount = readMoney(amountText);
  if (!amount.ok) { setAmountError(MONEY_ERRORS[amount.error]); amountRef.current?.focus(); return; }
  setSaving(true);
  try {
    const [saved] = await Promise.all([saveEntry({ kind, cents: amount.cents, categoryId, description }), touch.playRipple()]);
    touch.celebrate({ message: noticeText(saved), rowId: saved.id });
    router.back(); // o foco volta para "Adicionar gasto"
  } catch {
    setSaving(false);
    setNetworkError(true); // Notice: "Não deu para salvar agora. Confira a internet e toque em Salvar gasto de novo."
  }
}

<Button type="submit" loading={saving} loadingLabel="Salvando…" {...touch.buttonProps}>
  {kind === "expense" ? "Salvar gasto" : "Salvar renda"}
  {touch.ripple}
</Button>
```

```tsx
// Na lista: brilho uma vez na linha nova
const { highlightId, clearHighlight } = useGoldenTouchHighlight();
<li className={cn("md-tx", entry.id === highlightId && "md-brilho")}
    onAnimationEnd={clearHighlight}>…</li>
```

Notas:

- A linha usa a classe global `md-brilho` (gradiente + animação, já desligada com movimento reduzido); `animate-brilho` sozinho não desenha a faixa.
- `ripple` é um `<span className="md-onda animate-onda" aria-hidden style={{ left, top }} />` renderizado pelo React enquanto a onda dura; `onAnimationEnd` remove o span e resolve `playRipple`. Com `matchMedia("(prefers-reduced-motion: reduce)")`, `playRipple` resolve na hora e não renderiza nada.
- O ponto vem do `onPointerDown` (coordenadas menos o `getBoundingClientRect()` do botão). Sem `pointerdown` recente (teclado), o centro.
- `noticeText(entry)` devolve um `ReactNode`: o prefixo ("Anotado: Café, " ou "Anotado em Outros: ", quando a categoria caiu em "Outros" por padrão) e o valor: o sinal (− ou +) à parte, em `aria-hidden`, seguido de `formatMoney(entry.cents, { sign: "never" })` ("R$ 8,50") e do texto "Saiu"/"Entrou" em `sr-only`, tudo dentro de um `<span className="whitespace-nowrap">`.
- Com movimento reduzido, a linha não dispara `animationend`; por isso o provedor limpa o destaque junto com o aviso, em 4 segundos.
- Chame `celebrate` só depois de o servidor confirmar. Nunca chame na edição (use `announce(text, { coin: false })`).

## Faça e evite

| Faça | Evite |
| --- | --- |
| Toque de ouro só ao salvar lançamento novo. | Onda em todo botão primário. |
| Aviso que repete o que foi salvo. | "Sucesso!" genérico. |
| Região de status sempre presente. | Criar a região junto com o texto. |
| Desfazer tocando na linha nova. | Botão "Desfazer" num aviso de 4 segundos. |
| Nada se move com movimento reduzido; o aviso continua. | Desligar o aviso junto com a animação. |

## Relacionados

- [Button](button.md), [TransactionRow](transaction-row.md), [Notice](notice.md), [MoneyInput](money-input.md), [CategoryChip](category-chip.md), [SegmentedToggle](segmented-toggle.md)
- [Movimento](../10-movimento.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Marca](../02-marca.md), [Cores](../04-cores.md)
