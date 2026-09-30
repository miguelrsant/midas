# AppHeader (Topo do app)

> A faixa no alto de todas as telas logadas, com o logo, a troca de mês e a conta; no painel, seguida da saudação do dia.

Grupo: Marca · Classe base: `md-topo` (topo) e `md-saudacao` (saudação) · Componentes React sugeridos: `<AppHeader />`, `<MidasLogo />`, `<MonthSwitcher />`, `<AccountMenu />`, `<Greeting />`

## Quando usar

- **AppHeader:** no alto de toda tela depois da entrada (painel, lançamentos, calculadoras, configurações). É sempre o primeiro bloco da página, dentro de um `<header>`.
- **Troca de mês:** nas telas que mostram um mês (painel, lista de lançamentos, categoria). Nas telas sem mês (configurações, calculadoras, seus dados), o topo fica só com logo e avatar.
- **Saudação (`Greeting`):** só no painel, logo abaixo do topo. É o título da página (`h1`) do painel.

## Quando não usar

- Na entrada, no cadastro e na recuperação de senha: essas telas usam o [LoginScreen](login-screen.md), sem topo.
- Não use a saudação fora do painel. As outras telas têm um título `display-lg` próprio ("Seus dados", "Calculadoras").
- Não fixe o topo na rolagem (`position: sticky` ou `fixed`). Com zoom alto ou fonte grande, um cabeçalho fixo ocupa boa parte da tela e esconde o conteúdo.
- Não coloque o selo, o mármore ou os louros no topo.

## Anatomia

Topo (`md-topo`), da esquerda para a direita:

1. **Logo:** `midas-logo.svg` inline, 28 a 32px de altura (30px no protótipo). Nome (`.tinta`) em `mogno` no Calacatta e `tinta` no Portoro; moeda (`.moeda`) em `ouro`. `role="img"` e `aria-label="Midas"`, dentro de um link para o painel.
2. **Troca de mês (`md-mes`):** botão "Mês anterior" (`chevron-left`), nome do mês e ano em `label` (`sans` 600, 15px/20px) com largura mínima de 110px, botão "Próximo mês" (`chevron-right`). Botões redondos de 44px, ícone 20px em `tinta`, hover em `superficie-funda`.
3. **Avatar (`md-avatar`):** botão redondo de 44px com as iniciais do apelido em `display` 17px, espaçamento de letras 0,04em. Calacatta: fundo `mogno`, letras `marmore`. Portoro: fundo `ouro`, letras `sobre-ouro`. Sem apelido, mostra o símbolo do Midas. Abre o menu da conta.

Saudação (`md-saudacao`), de cima para baixo:

4. **Data por extenso (`md-eyebrow`):** `sans` 600, 14px/20px, maiúsculas via CSS, espaçamento 0,06em, `tinta-suave`. Texto-fonte: "Quarta, 30 de setembro".
5. **Título (`md-display`, `h1`):** `display-lg` (Midas Display 34px/40px), `tinta`, `text-wrap: balance`. Cumprimento, vírgula, apelido (se houver) e a avaliação do mês com no máximo um acento.
6. **Veio (`md-veio`):** divisória ondulada em `ouro`, 12px de altura, decorativa. É o único veio da tela.
7. **Frase-resumo:** um fato do mês com um número real, em `sans` e `tinta-suave`.

## Variantes

| Variante | Quando usar | Tokens |
| --- | --- | --- |
| Topo completo (logo + mês + avatar) | Painel, lançamentos, categoria. | `tinta`, `superficie-funda`, `mogno`, `ouro`, `marmore`, `sobre-ouro`, `foco` |
| Topo sem mês (logo + avatar) | Configurações, calculadoras, seus dados. | os mesmos, sem `md-mes` |
| Avatar com iniciais | A pessoa informou um apelido. | Calacatta `mogno`/`marmore`; Portoro `ouro`/`sobre-ouro` |
| Avatar com símbolo | Sem apelido. | Fundo `superficie-funda` com borda 1px `borda`; símbolo com as cores do logo (`mogno` ou `tinta`, moeda `ouro`) |
| Saudação "vai bem" | Mês com sobra (ou projeção de sobra). | título com um acento em `ouro-texto` |
| Saudação "apertado" | Mês com falta (ou projeção de falta). | título sem acento, com o fato e o valor |

O avatar com símbolo usa fundo neutro de propósito: a moeda do símbolo é sempre `ouro` e sumiria sobre o fundo `ouro` do avatar no Portoro.

## Estados

| Parte | Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- | --- |
| Botões de mês | Padrão | Fundo transparente, ícone `tinta`. | `tinta` | |
| | Hover | Fundo `superficie-funda`. | `superficie-funda` | Transição em `duracao-rapida`. |
| | Foco | Anel 2px `foco`, afastado 2px. | `foco` | |
| | No limite | Opacidade 0,45, cursor `not-allowed`. | | "Próximo mês" a 12 meses do mês atual. Use `aria-disabled="true"`, não `disabled` (veja Acessibilidade). |
| Nome do mês | Mês futuro | Igual, com "Projeção" abaixo em `caption` `tinta-suave` (sugestão). | `tinta-suave` | Deixa claro que os números são previstos. |
| Avatar | Hover | Anel 2px `borda` por dentro (sugestão). | `borda` | |
| | Foco | Anel 2px `foco`, afastado 2px. | `foco` | |
| | Menu aberto | `aria-expanded="true"`; menu em `superficie` com `sombra-cartao` e `radius-md`. | `superficie`, `sombra-cartao` | |
| Saudação | Carregando | Eyebrow e cumprimento aparecem na hora; avaliação e frase-resumo em esqueleto. | `superficie-funda` | O cumprimento não depende dos dados. |
| | Erro | Cumprimento sem avaliação ("Bom dia, Miguel.") e um [Notice](notice.md) de alerta no lugar da frase-resumo. | `alerta` | Nunca invente uma avaliação sem dados. |

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Padding vertical do topo | 12px | `space-3` |
| Espaço entre logo, mês e avatar | 16px mínimo | `space-4` |
| Altura do logo | 28 a 32px (30px no protótipo), largura automática | |
| Botões de mês | 44 × 44px, `radius-pill` | |
| Espaço entre botão e nome do mês | 4px | `space-1` |
| Largura mínima do nome do mês | 110px | |
| Avatar | 44 × 44px, `radius-pill` | |
| Padding da saudação | 16px em cima, 8px embaixo | `space-4`, `space-2` |
| Espaço entre as linhas da saudação | 8px | `space-2` |
| Veio | 12px de altura, largura total | |
| Largura máxima do conteúdo | 720px (protótipo) | |

## Tokens usados

| Token | Onde |
| --- | --- |
| `mogno` / `tinta` | Nome do logo (Calacatta / Portoro); fundo do avatar no Calacatta. |
| `ouro` | Moeda do logo; veio; fundo do avatar no Portoro. |
| `marmore` | Iniciais do avatar no Calacatta (9,06:1 sobre `mogno`). |
| `sobre-ouro` | Iniciais do avatar no Portoro (8,99:1 sobre `ouro`). |
| `tinta` | Ícones de mês, nome do mês, título da saudação. |
| `tinta-suave` | Eyebrow, frase-resumo. |
| `ouro-texto` | Acento do título. |
| `superficie-funda` | Hover dos botões de mês; fundo do avatar com símbolo. |
| `foco` | Anel de foco. |
| `display`, `classica`, `sans` | Título e iniciais; acento; o resto. |
| `duracao-rapida` | Hover. |

## Conteúdo

**Nome do mês:** mês com inicial maiúscula e ano: "Setembro 2026".

**Eyebrow:** dia da semana sem "-feira", com inicial maiúscula, vírgula, dia e mês por extenso: "Quarta, 30 de setembro". O CSS põe em maiúsculas; o texto-fonte fica em caixa normal (o leitor de tela lê melhor).

**Cumprimento:** pela hora local da pessoa.

| Hora | Cumprimento |
| --- | --- |
| 5h00 a 11h59 | Bom dia |
| 12h00 a 17h59 | Boa tarde |
| 18h00 a 4h59 | Boa noite |

Com apelido: "Bom dia, Miguel." Sem apelido: "Bom dia." Nunca use o nome completo nem o e-mail.

**Avaliação do mês:** uma frase curta, depois do cumprimento, sobre o mês exibido. No máximo um acento, e nenhum quando a notícia é ruim.

| Situação | Título |
| --- | --- |
| Mês atual, projeção com sobra | Bom dia, Miguel. Setembro vai *bem*. |
| Mês atual, apertado | Boa noite. Setembro está apertado: faltam R$ 120 para fechar no azul. |
| Mês passado com sobra | Bom dia, Miguel. Agosto fechou *no azul*. |
| Mês passado com falta | Bom dia, Miguel. Agosto fechou com R$ 210 a menos. |
| Mês futuro (projeção) | Boa tarde. Outubro deve fechar *no azul*. |
| Mês sem lançamentos | Bom dia, Miguel. (sem avaliação; o [EmptyState](empty-state.md) cuida do resto) |

O limite entre "vai bem" e "apertado" é o saldo projetado para o fim do mês: zero ou mais é "vai bem"; abaixo de zero é "apertado", com o valor que falta. A regra fica numa função só (sugestão: `assessMonth()` em `src/lib/greeting.ts`) para que título, gráfico e avisos digam a mesma coisa.

**Frase-resumo:** um fato útil em palavras com um número real, sem sinal (as palavras fazem o papel do sinal).

| Faça | Evite |
| --- | --- |
| Sobraram R$ 1.842,10 até agora, R$ 310 a mais que em agosto. | Saldo: + R$ 1.842,10 |
| Setembro está apertado: faltam R$ 120 para fechar no azul. | Setembro está *apertado*. (acento em notícia ruim) |
| Faltam R$ 120 para fechar no azul. Quer ver onde dá para ajustar? | Cuidado! Você está gastando demais. |
| Bom dia, Miguel. | Bom dia, Miguel Santos! |

## Acessibilidade

- **Estrutura:** `<header>` (landmark `banner`) com o link do logo, o grupo de mês e o botão do avatar. A saudação fica fora do `<header>`, dentro do `<main>`, porque o `h1` é o título do painel.
- **Logo:** `<svg role="img" aria-label="Midas">` dentro de `<a href="/">`. O link é anunciado como "Midas, link". Os caminhos internos não precisam de `aria-hidden`.
- **Troca de mês:** contêiner `role="group"` com `aria-label="Mês"`. Botões com `aria-label="Mês anterior"` e `aria-label="Próximo mês"`, ícones com `aria-hidden="true"`. O nome do mês fica num `<span aria-live="polite">` que já existe no primeiro render; ao trocar, o leitor anuncia "Outubro 2026" sem mover o foco, que fica no botão.
- **Limite de 12 meses:** no último mês permitido, "Próximo mês" recebe `aria-disabled="true"` e ignora o clique. Com `disabled`, o botão perderia o foco no meio da navegação por teclado. Anuncie o motivo uma vez na região ao vivo: "Outubro 2027. Esse é o último mês com projeção."
- **Avatar:** `<button>` com `aria-label="Sua conta"`, `aria-haspopup="menu"` e `aria-expanded`. As iniciais ficam com `aria-hidden="true"` para o leitor não soletrar "M A". O protótipo usa `<div aria-label>`, que não é focável nem anunciado de forma confiável; no app, é sempre botão.
- **Menu da conta:** `role="menu"` com itens `role="menuitem"` (o `DropdownMenu` do shadcn/Radix já entrega isso). Setas movem entre itens, Esc fecha e devolve o foco ao avatar, Enter ativa.
- **Saudação:** `h1` único da página. O acento é `<em>` sem texto extra. O eyebrow é um `<p>`, não um heading. O veio tem `aria-hidden="true"`.
- **Valores na frase:** texto corrido, sem `aria-hidden`, porque não há sinal visual; "Sobraram" e "faltam" dizem a direção.
- **Contraste (Calacatta / Portoro):** ícones e nome do mês em `tinta` 14,34 / 15,81 sobre `marmore`; eyebrow e frase em `tinta-suave` 6,30 / 9,15; acento em `ouro-texto` 5,53 / 10,90; iniciais 9,06 / 8,99. Nome do logo em `mogno` sobre `marmore`: 9,06:1 (no Portoro, `tinta`). A moeda em `ouro` não é texto.
- **Movimento:** nada se move no topo.
- **Toque:** botões de mês e avatar com 44px, a medida de alternadores e chips no Midas.

## Comportamento responsivo

- **Celular (até 480px):** uma linha: logo (28px), troca de mês e avatar. Se não couber (fonte grande, zoom), o `md-topo` quebra em duas linhas: logo e avatar em cima, troca de mês embaixo, centralizada (`flex-wrap: wrap`; a troca de mês com `order: 3` e `flex-basis: 100%`).
- **Tablet e desktop:** uma linha, conteúdo limitado a 720px e centralizado; logo a 32px.
- **Saudação:** o `h1` quebra com `text-wrap: balance`. Em telas estreitas, "Bom dia, Miguel." e "Setembro vai bem." costumam cair em linhas separadas, e está certo.
- **Fonte grande:** medidas em rem no app; o nome do mês pode passar de 110px, e os botões continuam com 44px.
- **Rolagem:** o topo rola junto com a página. Não use `sticky`.

## Casos-limite

- **Apelido longo** ("Maria Aparecida"): o título quebra; não corte o apelido. Iniciais: "MA".
- **Iniciais:** duas palavras ou mais, a primeira letra das duas primeiras ("Ana Luiza" → "AL"); uma palavra, só a primeira letra ("Miguel" → "M"). Maiúsculas com `toLocaleUpperCase('pt-BR')`, acentos preservados ("Érica" → "É").
- **Apelido com emoji ou símbolo no início:** use a primeira letra encontrada; se não houver letra, mostre o símbolo do Midas.
- **Virada de hora com a tela aberta:** o cumprimento pode ficar "Boa tarde" às 18h05 até a próxima navegação. Aceitável; não atualize no meio da leitura.
- **Virada de dia (meia-noite):** a data e o mês atual se recalculam na próxima navegação ou ao voltar para a aba (`visibilitychange`).
- **Renderização no servidor:** a hora e o fuso vêm do aparelho. Calcule cumprimento e data no fuso da pessoa (salvo na conta ou em cookie) ou no cliente, para não haver divergência de hidratação.
- **Mês além do limite pela URL** (`?mes=2028-01`): redirecione para o último mês permitido.
- **Meses antes da conta:** "Mês anterior" para no mês de criação da conta ou do lançamento mais antigo (sugestão), com o mesmo tratamento de `aria-disabled`.
- **Valor zero:** "Setembro fechou no zero: tudo o que entrou, saiu." Sem acento.
- **Valores enormes:** a frase quebra; o valor nunca quebra (`white-space: nowrap`).
- **Erro de rede:** veja Estados.

## Referência HTML

```html
<header class="md-topo">
  <a href="/" class="md-focusable">
    <svg class="md-logo" style="height:30px" viewBox="0.83 -82.26 283.77 86.07" role="img" aria-label="Midas">
      <path class="tinta" d="…"/>
      <circle class="moeda" cx="116.84" cy="-68.88" r="11.38"/>
    </svg>
  </a>
  <div class="md-mes" role="group" aria-label="Mês">
    <button type="button" aria-label="Mês anterior">
      <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span aria-live="polite">Setembro 2026</span>
    <button type="button" aria-label="Próximo mês">
      <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>
  <button type="button" class="md-avatar md-focusable" aria-label="Sua conta" aria-haspopup="menu" aria-expanded="false">
    <span aria-hidden="true">M</span>
  </button>
</header>

<main>
  <div class="md-saudacao">
    <p class="md-eyebrow" style="margin:0">Quarta, 30 de setembro</p>
    <h1 class="md-display">Bom dia, Miguel. Setembro vai <em class="md-acento">bem</em>.</h1>
    <span class="md-veio" aria-hidden="true"></span>
    <p style="margin:0;color:var(--tinta-suave)">Sobraram R$ 1.842,10 até agora, R$ 310 a mais que em agosto.</p>
  </div>
</main>
```

Diferenças em relação ao protótipo: o avatar vira `<button>` (era `<div>`); o logo ganha o link; o `viewBox` do logo é o do arquivo `midas-logo.svg` (o protótipo usa `0.83 -82.26 283.77 86.07`, que corta 1 unidade de respiro); a frase-resumo passa de `md-help` (14px) para `body` (17px), porque é texto corrido.

## Referência CSS

```css
.md-topo { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: var(--space-3) 0; }
.md-mes { display: inline-flex; align-items: center; gap: var(--space-1); }
.md-mes button { width: 44px; height: 44px; border-radius: var(--radius-pill); border: 0; background: transparent; color: var(--tinta); display: grid; place-items: center; cursor: pointer; }
.md-mes button:hover { background: var(--superficie-funda); }
.md-mes button:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px; }
.md-mes button[aria-disabled="true"] { opacity: .45; cursor: not-allowed; background: transparent; } /* ajuste */
.md-mes span { font: 600 15px/20px var(--font-sans); min-width: 110px; text-align: center; }
.md-avatar { width: 44px; height: 44px; border-radius: var(--radius-pill); background: var(--mogno); color: var(--marmore); display: grid; place-items: center; font: 400 17px/1 var(--font-display); letter-spacing: .04em; border: 0; cursor: pointer; }
[data-theme="dark"] .md-avatar { background: var(--ouro); color: var(--sobre-ouro); }
.md-avatar.is-simbolo { background: var(--superficie-funda); box-shadow: inset 0 0 0 1px var(--borda); } /* ajuste: sem apelido */
.md-saudacao { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-4) 0 var(--space-2); }

.md-logo { display: block; height: 28px; width: auto; }
.md-logo .tinta { fill: var(--mogno); }
.md-logo .moeda { fill: var(--ouro); }
[data-theme="dark"] .md-logo .tinta { fill: var(--tinta); }

.md-eyebrow { font: 600 14px/20px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; color: var(--tinta-suave); }
.md-display { font: 400 34px/40px var(--font-display); font-variant-numeric: lining-nums; color: var(--tinta); margin: 0; text-wrap: balance; }
.md-acento { font-family: var(--font-classica); font-style: italic; font-weight: 600; font-size: 1.12em; letter-spacing: -0.01em; color: var(--ouro-texto); }
/* .md-veio: veja ../08-ornamentos.md (máscara SVG em ouro, 12px) */
```

## Implementação no app

Bases shadcn/ui: `Button` (variante `ghost`, tamanho de ícone 44px) para as setas; `DropdownMenu` (Radix) para o menu da conta; `Avatar` não é necessário (as iniciais são texto num botão).

```tsx
// src/components/midas/midas-logo.tsx
export function MidasLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0.83 -82.26 283.77 86.07" role="img" aria-label="Midas" className={className}>
      <path className="fill-mogno dark:fill-tinta" d="…" /> {/* copie de /marca/midas-logo.svg */}
      <circle className="fill-ouro" cx="116.84" cy="-68.88" r="11.38" />
    </svg>
  );
}
```

O `dark:` precisa seguir o atributo do tema: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` no CSS global (veja [Tokens](../14-tokens.md)).

```tsx
// src/components/midas/app-header.tsx
export interface AppHeaderProps {
  /** Mês exibido, "AAAA-MM". Omitido: topo sem troca de mês. */
  month?: string;
  /** Mês atual, "AAAA-MM" (limite da projeção = currentMonth + 12). */
  currentMonth?: string;
  /** Primeiro mês navegável (criação da conta ou lançamento mais antigo). */
  firstMonth?: string;
  onMonthChange?: (month: string) => void;
  /** Apelido opcional. Sem ele, o avatar mostra o símbolo. */
  nickname?: string | null;
}

export interface GreetingProps {
  now: Date;              // no fuso da pessoa
  nickname?: string | null;
  assessment: ReactNode;  // "Setembro vai <Acento>bem</Acento>." ou o fato do mês apertado
  summary: ReactNode;     // frase-resumo com um número real
}
```

```tsx
<header className="flex flex-wrap items-center justify-between gap-4 py-3">
  <Link href="/" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco">
    <MidasLogo className="h-7 w-auto sm:h-8" />
  </Link>
  <div role="group" aria-label="Mês" className="order-3 flex basis-full items-center justify-center gap-1 sm:order-none sm:basis-auto">
    <Button variant="ghost" className="size-11 rounded-pill p-0" aria-label="Mês anterior"
      aria-disabled={atFirst || undefined} onClick={() => !atFirst && go(-1)}>
      <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-5" />
    </Button>
    <span aria-live="polite" className="min-w-[110px] text-center font-sans text-label font-semibold">
      {monthLabel /* "Setembro 2026" */}
    </span>
    <Button variant="ghost" className="size-11 rounded-pill p-0" aria-label="Próximo mês"
      aria-disabled={atLast || undefined} onClick={() => !atLast && go(1)}>
      <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-5" />
    </Button>
  </div>
  <AccountMenu nickname={nickname} />
</header>
```

```ts
// src/lib/greeting.ts
export function salutation(d: Date): 'Bom dia' | 'Boa tarde' | 'Boa noite' {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function longDate(d: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(d).replace(/-feira$/, '');
  const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(d); // "30 de setembro"
  return `${weekday.charAt(0).toLocaleUpperCase('pt-BR')}${weekday.slice(1)}, ${dayMonth}`;
}

export function initials(nickname?: string | null): string | null {
  const words = (nickname ?? '').trim().split(/\s+/).map((w) => w.match(/\p{L}/u)?.[0]).filter(Boolean);
  if (words.length === 0) return null; // mostra o símbolo
  return words.slice(0, words.length > 1 ? 2 : 1).join('').toLocaleUpperCase('pt-BR');
}
```

Menu da conta (no app, um *disclosure*: botão com `aria-expanded` e `aria-controls` abrindo uma lista de links; veja o histórico 3.2 no README): gatilho é o botão do avatar (`aria-label="Sua conta"`); itens "Seus dados" (`shield-check`), "Configurações" (`settings`), separador, "Sair" (`log-out`). Itens com 48px de altura, texto `label` em `tinta`, ícones 20px `aria-hidden`. "Sair" encerra a sessão e leva a `/entrar`.

Notas:

- Guarde o mês exibido na URL (`?mes=2026-09`) para o botão Voltar do navegador e o recarregamento funcionarem.
- A saudação usa `text-display-lg font-display`; o acento, o componente `<Acento>`; o veio, a classe global `md-veio`.
- A frase-resumo usa `formatMoney(cents, { sign: 'never' })` e as palavras fazem a direção.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Topo que rola com a página. | Cabeçalho fixo. |
| Avatar como `<button>` com `aria-label="Sua conta"`. | `<div>` com `aria-label` e clique. |
| `aria-disabled` no limite de 12 meses. | `disabled`, que tira o foco do botão. |
| Um acento só quando o mês vai bem. | Acento em mês apertado. |
| Um veio por tela, na saudação. | Veio também em cartões abaixo. |
| Frase com um número real e palavras de direção. | Sinal + e − em frase corrida. |

## Relacionados

- [LoginScreen](login-screen.md), [Seal](seal.md), [EmptyState](empty-state.md), [BalanceCard](balance-card.md), [IncomeExpenseChart](income-expense-chart.md), [Notice](notice.md), [Button](button.md)
- [Logo](../03-logo.md), [Tipografia](../05-tipografia.md), [Ornamentos](../08-ornamentos.md), [Iconografia](../09-iconografia.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Tokens](../14-tokens.md), [Padrões de tela](../17-padroes-de-tela.md)
