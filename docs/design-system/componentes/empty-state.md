# EmptyState (Estado vazio)

> O que aparece no lugar de uma lista, um painel ou uma calculadora que ainda não têm nada: diz o que vem depois e oferece o primeiro passo.

Grupo: Mensagens · Classe base: `md-vazio` · Componente React sugerido: `<EmptyState />`

## Quando usar

O EmptyState tem dois usos. Eles não se misturam.

| Tipo | Quando | Forma |
| --- | --- | --- |
| **Vazio de começo** | Ainda não existe nada ali e o primeiro passo cria a base do que vem depois: mês sem lançamentos, primeira vez no app, categoria sem gastos no mês, calculadora nunca usada. | Coluna jônica + título + frase + botão. |
| **Sem resultado** | Existem dados, mas a busca ou o filtro da pessoa não achou nada. | Só uma frase com a saída: frase + botão que desfaz a busca ou o filtro. Sem coluna, sem título. |

A coluna jônica é a base de um edifício. Por isso ela só aparece no vazio de começo, onde o primeiro lançamento é literalmente a base do que vem depois.

## Quando não usar

- **Carregando:** enquanto os dados não chegaram, mostre o esqueleto da lista, nunca o estado vazio. Mostrar "Setembro começa aqui" por meio segundo e depois a lista cheia assusta.
- **Erro de rede ou de servidor:** use o [Notice](notice.md) de alerta com a saída ("Tentar de novo"). Vazio é "não há nada", erro é "não consegui ver".
- **Mês no vermelho, orçamento estourado ou qualquer notícia ruim:** isso é informação, não vazio. Use [Notice](notice.md) ou a saudação do [AppHeader](app-header.md).
- **Mês futuro com projeção:** os próximos meses mostram a projeção no [gráfico](income-expense-chart.md), não um vazio.
- **Dentro de campos, chips ou linhas:** o EmptyState ocupa um cartão ou uma área de conteúdo, nunca um pedaço de controle.

## Anatomia

Vazio de começo:

1. **Coluna jônica** (opcional só em telas muito baixas; veja Responsivo): SVG inline de 72px de largura, traço de 1,6 em `currentColor` com `color: var(--borda)`. Decorativa, `aria-hidden="true"`.
2. **Título:** `heading` (24px/30px) na família `display` (Midas Display), cor `tinta`, com no máximo um `acento` (Cormorant Garamond 600 itálico, 1,12em, `ouro-texto`).
3. **Frase:** `body` (17px/26px) em `sans`, cor `tinta-suave`, largura máxima de 34ch. Diz o que acontece depois do primeiro passo.
4. **Botão:** [Button](button.md) com ícone e verbo, que resolve o vazio. `md-btn-primary` quando é a ação principal da tela; `md-btn-secondary` quando a tela já tem outra ação principal.

Sem resultado:

1. **Frase:** `body` em `tinta-suave`, com o termo buscado entre aspas curvas e o período.
2. **Botão de saída:** `md-btn-secondary` (ou `md-btn-ghost` quando o espaço é curto) com o verbo que desfaz: "Limpar busca", "Limpar filtros".

## Variantes

| Variante | Classe | Quando usar | Tokens |
| --- | --- | --- | --- |
| Começo, em cartão | `md-card md-vazio` | Dentro do cartão da lista do painel, do extrato ou da calculadora. | `superficie`, `sombra-cartao`, `radius-lg`, `borda` (coluna), `tinta`, `tinta-suave`, `ouro-texto` |
| Começo, página inteira | `md-vazio` | Primeira vez no app, quando o vazio é o conteúdo todo da página (sem cartão em volta). | `marmore` (fundo da página), demais iguais |
| Sem resultado | `md-vazio md-vazio-busca` (sugerida, não existe no `bundle.css`) | Busca ou filtro sem resultado. | `tinta-suave`, `space-6` |

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Coluna, título, frase e botão centralizados. | ver Anatomia | É o único estado do bloco em si. |
| Botão em hover, foco, pressionado | Os do [Button](button.md). | `primario-hover`, `foco` | O anel de foco é o do botão: 2px em `foco`, afastado 2px. |
| Botão carregando | Os do [Button](button.md). | | Quando o botão cria algo direto (raro). Em geral ele só navega. |
| Sem resultado | Só frase e botão, alinhados ao centro, com `space-6` em cima e embaixo. | `tinta-suave` | A região é anunciada (veja Acessibilidade). |

Não existe estado desabilitado: um vazio sem saída não é permitido.

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Padding do bloco | 32px em cima e embaixo, 16px nas laterais | `space-8`, `space-4` |
| Espaço entre as partes | 12px | `space-3` |
| Largura da coluna | 72px (altura automática, cerca de 133px pela proporção 90 × 166) | |
| Traço da coluna | 1,6 unidades do `viewBox` | |
| Título | 24px/30px | `heading` |
| Frase | 17px/26px, até 34ch | `body` |
| Altura do botão | 48px | `space-12` |
| Padding do cartão (variante em cartão) | 24px | `space-6` |
| Sem resultado: padding vertical | 24px | `space-6` |

## Tokens usados

| Token | Onde |
| --- | --- |
| `borda` | Cor da coluna (`color`, herdada pelo `stroke="currentColor"`). |
| `tinta` | Título. |
| `ouro-texto` | Acento do título. |
| `tinta-suave` | Frase. |
| `superficie`, `sombra-cartao`, `radius-lg` | Cartão em volta (variante em cartão). |
| `primario`, `sobre-primario`, `foco` | Botão. |
| `space-3`, `space-4`, `space-6`, `space-8` | Espaços. |
| `display`, `classica`, `sans` | Famílias do título, do acento e da frase. |

## Conteúdo

Regras:

- **Título:** curto, com o contexto (mês, categoria, calculadora). Tom de começo, nunca de falta. No máximo um acento, e ele é opcional.
- **Frase:** diz o que acontece **depois** do primeiro passo, não repete o título. Uma frase só.
- **Botão:** verbo + objeto, o mesmo nome da ação em todo o app ("Adicionar gasto", "Adicionar renda", "Calcular 13º salário").
- **Sem resultado:** uma frase que repete o termo e o período, mais a saída. Sem título, sem culpa ("Você não tem..."), sem sugestão de tentar outra coisa sem botão.
- Números no título saem da Midas Display (algarismos da Cormorant); nunca force a Marcellus pura.

### Banco de exemplos

| Contexto | Título | Frase | Botão |
| --- | --- | --- | --- |
| Mês atual sem lançamentos | Outubro começa *aqui*. | Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro. | Adicionar gasto |
| Mês atual sem lançamentos, já com renda anotada | Falta só o *primeiro gasto*. | Com os gastos anotados, o painel mostra quanto sobra até o fim do mês. | Adicionar gasto |
| Mês passado sem lançamentos | Agosto ficou em branco. | Se lembrar de algum gasto ou renda de agosto, anote aqui e o gráfico do ano fica completo. | Adicionar lançamento em agosto |
| Primeira vez no app | Tudo começa *aqui*. | Anote sua renda do mês e depois o primeiro gasto. Com isso, o Midas mostra quanto sobra. | Adicionar renda |
| Primeira vez, pessoa com apelido | Boas-vindas ao Midas, Ana. | Anote sua renda do mês e depois o primeiro gasto. Com isso, o Midas mostra quanto sobra. | Adicionar renda |
| Categoria sem gastos no mês | Nada em Restaurante em setembro. | Quando você anotar um gasto nessa categoria, ele aparece aqui, com o total do mês. | Adicionar gasto em Restaurante |
| Categoria de renda sem entradas | Nenhum freelance em setembro. | Quando entrar um pagamento de freelance, anote aqui e ele entra na conta do mês. | Adicionar renda de Freelance |
| Calculadora de 13º nunca usada | Seu 13º *sem mistério*. | Informe o salário e os meses trabalhados. O Midas calcula as duas parcelas e pode anotar cada uma como renda. | Calcular 13º salário |
| Calculadora de férias nunca usada | Férias com as contas *em dia*. | Informe o salário e os dias de férias. O Midas calcula o valor com o terço a mais e pode anotar como renda. | Calcular férias |
| Calculadora de rescisão nunca usada | Rescisão explicada *parte por parte*. | Responda algumas perguntas sobre a saída do emprego e veja cada parte do valor, explicada. | Calcular rescisão |
| Mês futuro sem histórico para projetar | Novembro ainda não chegou. | Com um mês de lançamentos, o Midas passa a projetar os próximos. | Adicionar gasto |

Sem resultado:

| Contexto | Frase | Botão |
| --- | --- | --- |
| Busca no mês | Nenhum lançamento com “farmácia” em setembro. | Limpar busca |
| Busca no ano | Nenhum lançamento com “academia” em 2026. | Limpar busca |
| Filtro de categoria | Nenhum gasto em Saúde em setembro. | Limpar filtros |
| Filtro de tipo | Nenhuma renda em setembro com esses filtros. | Limpar filtros |

### Faça e evite (texto)

| Faça | Evite |
| --- | --- |
| Outubro começa *aqui*. | Nenhum dado encontrado. |
| Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro. | Você ainda não cadastrou nenhuma transação. |
| Nenhum lançamento com “farmácia” em setembro. | Ops! Não encontramos nada. |
| Adicionar gasto | Clique aqui |
| Nada em Restaurante em setembro. | Parabéns! Nenhum gasto com restaurante! (o vazio não julga) |

## Acessibilidade

- **Semântica:** o bloco é uma `<section>` com `aria-labelledby` apontando para o título. O nível do título segue a página: `h2` dentro de um cartão do painel; `h1` quando o vazio é a página inteira (primeira vez).
- **Coluna:** `aria-hidden="true"` no `<svg>` inline, sem `role`, sem `<title>`. Se usar o arquivo `/ornamentos/coluna.svg` em `<img>`, use `alt=""`. O arquivo traz `role="img"` e `<title>Coluna jônica</title>`; no inline, remova os dois.
- **Leitor de tela (começo):** anuncia "Outubro começa aqui., título nível 2", depois a frase, depois "Adicionar gasto, botão". O acento é só estilo (`<em>`), sem texto extra.
- **Sem resultado:** a frase fica dentro de um contêiner `role="status"` que já existe na página antes da busca. Ao ficar sem resultado, o leitor anuncia "Nenhum lançamento com farmácia em setembro." sem mover o foco. O foco continua no campo de busca.
- **Ao limpar a busca:** o foco volta para o campo de busca (vazio) e a lista reaparece.
- **Teclado:** o único item focável é o botão. Nada de `tabindex` no título ou na frase.
- **Contraste:** título em `tinta` 15,51:1 sobre `superficie` (Calacatta) e 14,59:1 (Portoro); frase em `tinta-suave` 6,81:1 e 8,44:1; acento em `ouro-texto` 5,98:1 e 10,06:1. A coluna em `borda` tem 4,01:1 sobre `superficie` no claro e 4,08:1 no escuro, mas é decorativa e não carrega informação.
- **Movimento:** o EmptyState não tem animação.
- **Zoom e fonte grande:** a frase quebra em várias linhas sem cortar; o botão cresce com o texto.

## Comportamento responsivo

- O bloco é uma coluna centralizada que ocupa a largura do contêiner. A frase para em 34ch, então em telas largas o texto não se espalha.
- No celular, o cartão tem a margem lateral da página (`space-4`) e o botão mantém a largura do conteúdo. Abaixo de 360px de largura, o botão pode ocupar a largura toda (`w-full`).
- Em telas baixas (paisagem no celular, ou zoom de 200% ou mais), esconda a coluna para que título, frase e botão caibam sem rolagem: `@media (max-height: 480px) { .md-vazio > svg { display: none; } }`. Nenhuma informação se perde, porque ela é decorativa.
- Sem resultado não muda com a largura: frase e botão empilhados e centralizados.

## Casos-limite

- **Nome de categoria longo** ("Mensalidade da escola das crianças"): o título quebra em duas linhas com `text-wrap: balance` (a `md-display` já aplica). Não corte com reticências.
- **Termo de busca longo:** limite o eco do termo a 40 caracteres com reticências ("Nenhum lançamento com “mensalidade da escola das crianç…” em setembro.").
- **Termo com aspas ou HTML:** trate como texto. Em React, a interpolação já escapa.
- **Primeira vez + mês vazio:** mostre só o vazio de primeira vez. Nunca dois EmptyStates na mesma tela.
- **Vazio num mês passado com a conta criada depois:** não mostre "Agosto ficou em branco" para meses antes da criação da conta; a troca de mês nem deveria chegar lá (veja [AppHeader](app-header.md)).
- **Carregando ou erro:** não é vazio (veja "Quando não usar").
- **Pessoa apagou o último lançamento do mês:** volta ao vazio de começo do mês, sem mensagem extra.

## Referência HTML

Vazio de começo (protótipo, com a coluna inline e a ARIA completa; os caminhos longos foram resumidos):

```html
<section class="md-card md-vazio" aria-labelledby="vazio-titulo">
  <svg viewBox="-20 -6 90 166" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-6" y="0" width="58" height="6" rx="1"/>
      <path d="M-2 7 Q23 16 48 7"/>
      <path d="…"/><!-- voluta esquerda -->
      <path d="…"/><!-- voluta direita -->
      <path d="M4 24 L42 24"/>
      <path d="M5 26 L3 134 M41 26 L43 134"/>
      <path d="M12.2 30 L11 130" opacity=".55"/>
      <path d="M19.4 30 L19 130" opacity=".55"/>
      <path d="M26.6 30 L27 130" opacity=".55"/>
      <path d="M33.8 30 L35 130" opacity=".55"/>
      <rect x="-1" y="134" width="48" height="6" rx="3"/>
      <rect x="-6" y="141" width="58" height="8" rx="1"/>
    </g>
  </svg>
  <h2 id="vazio-titulo" class="md-display" style="font-size:24px;line-height:30px">
    Outubro começa <em class="md-acento">aqui</em>.
  </h2>
  <p>Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro.</p>
  <a class="md-btn md-btn-primary" href="/lancamentos/novo?tipo=gasto">
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    Adicionar gasto
  </a>
</section>
```

O protótipo usa `<button>`; no app, como o botão leva para outra rota, use um link com aparência de botão. O protótipo põe `md-toque` nesse botão; tire. O toque de ouro é só para salvar um lançamento novo (veja [Button](button.md) e [GoldenTouch](golden-touch.md)).

Sem resultado:

```html
<div role="status" class="md-vazio md-vazio-busca">
  <p>Nenhum lançamento com “farmácia” em setembro.</p>
  <button type="button" class="md-btn md-btn-secondary">Limpar busca</button>
</div>
```

## Referência CSS

Do `bundle.css`, mais a variante sem resultado (sugerida):

```css
.md-vazio { display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: var(--space-3); padding: var(--space-8) var(--space-4); }
.md-vazio > svg { width: 72px; height: auto; color: var(--borda); }
.md-vazio p { margin: 0; max-width: 34ch; color: var(--tinta-suave); }

/* Título: md-display no tamanho heading (Midas Display 24/30) */
.md-vazio .md-display { font-size: 24px; line-height: 30px; }

/* Sugerida: busca ou filtro sem resultado */
.md-vazio-busca { padding: var(--space-6) var(--space-4); }

@media (max-height: 480px) { .md-vazio > svg { display: none; } }
```

A frase herda `body` (17px/26px) do contêiner da página (`md-stage` no protótipo).

## Implementação no app

Base: nenhum primitivo do shadcn/ui é necessário para o bloco; o botão é o `Button` do shadcn (`src/components/ui/button.tsx`) com as variantes do Midas, usado com `asChild` para envolver o `Link` do Next.js. A coluna vira um componente `IonicColumn` com o SVG inline.

```tsx
// src/components/midas/empty-state.tsx
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** "start": coluna + título + frase + botão. "no-results": só frase + botão. */
  kind?: 'start' | 'no-results';
  /** Título (só em "start"). Use <Acento> para o acento opcional. */
  title?: ReactNode;
  /** Nível do título: 2 dentro de cartão, 1 quando o vazio é a página. */
  headingLevel?: 1 | 2 | 3;
  /** Frase: o que acontece depois do primeiro passo, ou o eco da busca. */
  description: ReactNode;
  /** O botão que resolve o vazio. Obrigatório. */
  action: ReactNode;
  /** Envolve num cartão (md-card). Padrão: true em "start". */
  inCard?: boolean;
}
```

```tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Acento } from '@/components/midas/acento';
import { EmptyState } from '@/components/midas/empty-state';

export function EmptyMonth({ monthName }: { monthName: string }) {
  return (
    <EmptyState
      title={<>{monthName} começa <Acento>aqui</Acento>.</>}
      description="Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro."
      action={
        <Button asChild>
          <Link href="/lancamentos/novo?tipo=gasto">
            <Plus aria-hidden="true" strokeWidth={1.75} className="size-5" />
            Adicionar gasto
          </Link>
        </Button>
      }
    />
  );
}
```

Estrutura interna sugerida do componente (variante "start"):

```tsx
<section
  aria-labelledby={titleId}
  className="flex flex-col items-center gap-3 rounded-lg bg-superficie px-4 py-8 text-center shadow-cartao"
>
  <IonicColumn className="w-[72px] text-borda [@media(max-height:480px)]:hidden" />
  <Heading id={titleId} className="m-0 font-display text-heading text-tinta text-balance">
    {title}
  </Heading>
  <p className="m-0 max-w-[34ch] text-body text-tinta-suave">{description}</p>
  {action}
</section>
```

Notas:

- `IonicColumn` renderiza o SVG com `aria-hidden="true"` e `focusable="false"`, `stroke="currentColor"`, e recebe a cor por `text-borda`. Copie os caminhos de `/ornamentos/coluna.svg` e tire o `role`, o `aria-label` e o `<title>`.
- Na variante "no-results", o componente renderiza só `<p>` e `action` dentro de um contêiner com `role="status"` que deve existir antes da busca (monte-o vazio junto com a lista e preencha quando o resultado for zero).
- Para "Limpar busca", use `Button variant="secondary"` com `onClick` que limpa o termo e devolve o foco ao campo (`inputRef.current?.focus()`).
- Os títulos e frases vêm de um único arquivo de textos (por exemplo `src/content/empty-states.ts`) para manter o banco de exemplos consistente.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Coluna só no vazio de começo. | Coluna em busca sem resultado. |
| Sempre um botão que resolve o vazio. | Vazio sem saída ou só com texto. |
| Frase que diz o que vem depois do primeiro passo. | Frase que repete o título. |
| Esqueleto enquanto carrega. | EmptyState piscando antes dos dados. |
| Um acento no título, quando fizer sentido. | Acento em frase, botão ou em mais de uma palavra. |
| Coluna decorativa, `aria-hidden`. | Informação que só a coluna transmite. |

## Relacionados

- [Button](button.md), [Notice](notice.md), [AppHeader](app-header.md), [TransactionRow](transaction-row.md), [IncomeExpenseChart](income-expense-chart.md), [README dos componentes](README.md)
- [Ornamentos](../08-ornamentos.md), [Tipografia](../05-tipografia.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Categorias](../15-categorias.md), [Padrões de tela](../17-padroes-de-tela.md)
