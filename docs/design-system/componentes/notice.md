# Notice (Aviso)

> Mensagem curta em destaque, com ícone, uma frase em negrito que resume e uma frase que explica ou diz o que fazer. Aparece no topo da tela, uma de cada vez.

Grupo: Mensagens · Classe base: `md-notice` (+ `is-alerta`) · Componente React sugerido: `<Notice />`

## Quando usar

- Para uma informação que a pessoa precisa ter antes de agir: a promessa de privacidade no cadastro, o aviso de estimativa nas calculadoras.
- Para um alerta sobre o dinheiro dela: uma categoria perto do limite, um mês projetado no vermelho.
- Para falha de conexão, ao carregar a tela ou ao salvar: alerta com o botão "Tentar de novo".
- Quando a mensagem vale para a tela inteira, não para um campo.

## Quando não usar

- **Erros de formulário.** Ficam junto do campo, em texto abaixo dele ("Digite um valor maior que zero"), ligados por `aria-describedby`. Não use Notice para repetir erros no topo.
- **Confirmação de salvamento.** "Anotado: Mercado, − R$ 127,90" é o aviso do [GoldenTouch](golden-touch.md), que some sozinho.
- **Tela vazia.** Use o [EmptyState](empty-state.md).
- **Comemoração.** Mês no azul é a [Achievement](achievement.md).
- **Mais de uma mensagem ao mesmo tempo.** Escolha a mais importante (veja Conteúdo).
- **Texto longo, lista ou tabela.** Se precisa de mais de duas frases, é uma página ou um diálogo.

## Anatomia

1. **Contêiner** (`md-notice`): linha flexível com vão `space-3`, padding `space-4`, cantos `radius-md`, fundo `superficie`, borda de 1px em `veio`. Texto `sans` 400, 15/22, `tinta`.
2. **Ícone**: Lucide, 20px, traço 1,75, `aria-hidden="true"`, 1px abaixo do topo para alinhar com a primeira linha.
   - Informação: `shield-check` (privacidade) ou `info` (demais casos), em `ouro-texto`.
   - Alerta: `triangle-alert`, em `alerta`.
3. **Resumo** (`<strong>`): a primeira frase, em 600.
4. **Explicação**: a segunda frase, no mesmo parágrafo, em 400. Pode terminar com um link (`md-link`) para a saída.
5. **Botão "Tentar de novo"** (só no erro de conexão): `md-btn md-btn-ghost`, abaixo do texto, alinhado à esquerda do texto.

## Variantes

| Variante / classe | Quando usar | Tokens |
| --- | --- | --- |
| Informação (`md-notice`) | Promessa de privacidade, aviso de estimativa, explicação de uma regra | Ícone `shield-check` ou `info` em `ouro-texto`; `role="note"` |
| Alerta (`md-notice is-alerta`) | Categoria perto do limite, projeção negativa | Ícone `triangle-alert` em `alerta`; `role="status"` quando aparece depois de uma ação |

Fundo, borda e texto são os mesmos nas duas variantes. A diferença está no ícone (forma e cor) e nas palavras, nunca só na cor.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Estático | Presente desde que a tela abre | ver Anatomia | Informação: `role="note"`. Alerta presente ao abrir: sem `role`, lido na ordem normal da página |
| Surgido após uma ação | Aparece no topo depois de salvar | `role="status"` no contêiner | O contêiner vivo já existe vazio antes; só o texto entra depois |
| Com link | Link sublinhado em `ouro-texto` no fim da explicação | `ouro-texto`, `foco` | O foco é o do link; o aviso não recebe foco |
| Resolvido | O aviso some quando a causa some (limite ajustado, projeção positiva) | | Sem animação de saída |

O Notice não tem hover, não é clicável como um todo e não tem botão de fechar: ele sai quando deixa de ser verdade. A única ação em botão é "Tentar de novo" no erro de conexão (`md-btn md-btn-ghost`, 48px, abaixo do texto); como o aviso não some sozinho, o botão não tem prazo (WCAG 2.2.1).

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Padding | 16px | `space-4` |
| Vão ícone–texto | 12px | `space-3` |
| Raio | 10px | `radius-md` |
| Borda | 1px | `veio` |
| Texto | 15/22 | (fora da escala; veja Referência CSS) |
| Ícone | 20px, traço 1,75, `margin-top: 1px` | |
| Largura | a da coluna de conteúdo (no protótipo, até 520px) | |
| Distância do conteúdo abaixo | 24px | `space-6` |

## Tokens usados

| Token | Onde |
| --- | --- |
| `superficie` | Fundo |
| `veio` | Borda |
| `tinta` | Texto |
| `ouro-texto` | Ícone de informação; link |
| `alerta` | Ícone de alerta |
| `radius-md`, `space-3`, `space-4` | Forma e espaço |
| `foco` | Anel de foco do link |

## Conteúdo

Sempre duas partes: **uma frase em negrito que resume** e **uma frase que explica ou diz o que fazer**. Números reais, com as regras de dinheiro e data do sistema. Tom calmo: o alerta informa, não assusta.

Exemplos do Midas:

| Onde | Variante e ícone | Texto |
| --- | --- | --- |
| Criar conta; Configurações > Seus dados | Informação, `shield-check` | **Seus dados são só seus.** O Midas não pede CPF nem acessa seu banco. Você pode baixar ou apagar tudo quando quiser. |
| Painel ou categoria, depois de salvar um gasto que passou de 90% do limite | Alerta, `triangle-alert`, `role="status"` | **Restaurante chegou a 90% do limite.** Faltam R$ 40,00 para o valor que você planejou em setembro. |
| Painel, quando um mês projetado fecha com falta | Alerta, `triangle-alert` | **Novembro pode fechar no vermelho.** Se os gastos seguirem como nos últimos 3 meses, vão faltar cerca de R$ 300. [Ver onde dá para ajustar] |
| Calculadoras (13º, férias, rescisão), acima do resultado | Informação, `info` | **É uma estimativa.** Confira os valores com o RH ou o sindicato. |
| Qualquer tela, quando os dados não carregam | Alerta, `triangle-alert` | **Não foi possível carregar seus dados.** Confira sua conexão e tente de novo. [Tentar de novo] |
| Depois de tocar em Salvar, sem conexão | Alerta, `triangle-alert`, `role="status"` | **O lançamento não foi salvo.** Confira sua conexão; o que você digitou continua aqui. [Tentar de novo] |

**Prioridade (uma mensagem por vez).** Se houver mais de uma, mostre só a primeira desta ordem: erro de conexão, alerta que surgiu depois de uma ação, alerta estático, informação. As outras aparecem onde fazem sentido (a do limite, na tela da categoria; a da projeção, junto do gráfico).

**Regras de texto.**

- O resumo cabe numa linha do celular (até uns 45 caracteres) e termina com ponto.
- Na projeção negativa, o resumo diz o fato e a explicação dá a saída. Nada de acento dourado (título de notícia ruim não leva acento).
- Link de saída começa com verbo: "Ver onde dá para ajustar", "Ajustar limite".
- Sem "Atenção!", "Cuidado!", pontos de exclamação ou letras maiúsculas para gritar.

| Faça | Evite |
| --- | --- |
| "**Restaurante chegou a 90% do limite.** Faltam R$ 40,00 para o valor que você planejou em setembro." | "**Atenção!** Limite quase estourado!" |
| "**Novembro pode fechar no vermelho.** … Ver onde dá para ajustar" | "**Você vai ficar no prejuízo em novembro.**" |
| "**É uma estimativa.** Confira os valores com o RH ou o sindicato." | "Valores meramente ilustrativos, sem garantia." |
| Erro junto do campo: "Digite um valor maior que zero" | Notice no topo: "Erro no formulário" |

## Acessibilidade

- **Papéis.**
  - Informação: `role="note"` (conteúdo complementar, lido na ordem normal).
  - Alerta que surge depois de uma ação: `role="status"` (região viva educada, `aria-live="polite"` implícito). O leitor de tela anuncia o texto sem interromper, por exemplo: "Restaurante chegou a 90% do limite. Faltam R$ 40,00 para o valor que você planejou em setembro."
  - Não use `role="alert"`: nada aqui é urgente a ponto de interromper a pessoa.
- **Região viva.** Para o anúncio funcionar, o elemento com `role="status"` precisa existir na página antes da mensagem. Renderize o contêiner vazio no topo e troque só o conteúdo. Um elemento vivo que nasce já com o texto costuma não ser anunciado.
- **Foco.** O aviso não recebe foco nem o rouba. O foco continua onde a ação deixou.
- **Ícone.** `aria-hidden="true"`: a palavra em negrito já diz o tipo de mensagem. A diferença entre informação e alerta está no ícone (forma), na cor e no texto, nunca só na cor.
- **Negrito.** `<strong>` é lido como texto normal; por isso o resumo precisa fazer sentido sozinho, como frase.
- **Contraste** sobre `superficie` (claro / escuro): texto `tinta` 15,51:1 / 14,59:1; ícone `ouro-texto` 5,98 / 10,06; ícone `alerta` 5,73 / 10,21; link `ouro-texto` 5,98 / 10,06. A borda `veio` é decorativa: o aviso não é um controle.
- **Movimento.** O aviso aparece e some sem animação.

## Comportamento responsivo

- Ocupa a largura da coluna de conteúdo; o texto quebra em quantas linhas precisar.
- O ícone fica preso ao topo (`align-items` padrão `stretch` + `margin-top: 1px`), alinhado com a primeira linha, mesmo com três ou quatro linhas.
- Com zoom de texto de 200%, nada é cortado: sem altura fixa, sem `overflow: hidden`.

## Casos-limite

- **Texto longo** (nome de categoria grande, "Educação e cursos online"): quebra de linha normal, sem reticências.
- **Valor restante zero ou negativo**: a mensagem muda de fato, não de cor. "**Restaurante chegou ao limite.** Você planejou R$ 400,00 para setembro." Passou do limite: "**Restaurante passou do limite em R$ 25,00.** Você planejou R$ 400,00 para setembro."
- **Várias categorias perto do limite**: um aviso só, com a que está mais perto: "**Restaurante chegou a 90% do limite.** …". As demais aparecem na tela de categorias.
- **Projeção sem base** (menos de um mês fechado): não mostre o aviso de projeção.
- **Pessoa corrige a causa** (edita o gasto, muda o limite): o aviso some na próxima renderização.
- **Erro de rede**: um Notice de alerta no topo, com "Tentar de novo", mesmo que várias partes da tela tenham falhado. Cada parte que falhou mostra só uma frase curta no lugar dos dados ("Não foi possível carregar o saldo."), sem botão próprio, e nunca zeros no lugar de dados que não chegaram. Ao salvar sem conexão, o formulário mantém o que a pessoa digitou.

## Referência HTML

Marcação do protótipo, mais os casos de projeção e estimativa. Caminhos SVG resumidos.

```html
<!-- Informação: privacidade -->
<div class="md-notice" role="note">
  <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><!-- shield-check --><path d="…"/><path d="m9 12 2 2 4-4"/></svg>
  <p><strong>Seus dados são só seus.</strong> O Midas não pede CPF nem acessa seu banco. Você pode baixar ou apagar tudo quando quiser.</p>
</div>

<!-- Alerta depois de salvar: o contêiner vivo já existe vazio no topo da tela -->
<div id="aviso-topo" role="status">
  <div class="md-notice is-alerta">
    <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><!-- triangle-alert --><path d="…"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    <p><strong>Restaurante chegou a 90% do limite.</strong> Faltam R$ 40,00 para o valor que você planejou em setembro.</p>
  </div>
</div>

<!-- Alerta estático: projeção negativa, com saída -->
<div class="md-notice is-alerta">
  <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><!-- triangle-alert --><path d="…"/></svg>
  <p><strong>Novembro pode fechar no vermelho.</strong> Se os gastos seguirem como nos últimos 3 meses, vão faltar cerca de R$ 300. <a class="md-link" href="/planejamento/limites">Ver onde dá para ajustar</a></p>
</div>

<!-- Informação: calculadoras -->
<div class="md-notice" role="note">
  <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true"><!-- info --><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  <p><strong>É uma estimativa.</strong> Confira os valores com o RH ou o sindicato.</p>
</div>
```

No protótipo, o texto fica num `<div>`; aqui ele virou `<p>` (com margem zerada), para ser lido como parágrafo. A rota `/categorias` é ilustrativa.

## Referência CSS

```css
.md-notice { display: flex; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-md); background: var(--superficie); border: 1px solid var(--veio); color: var(--tinta); font: 400 15px/22px var(--font-sans); }
.md-notice .md-icon { margin-top: 1px; color: var(--ouro-texto); }
.md-notice.is-alerta .md-icon { color: var(--alerta); }
.md-notice strong { font-weight: 600; }
.md-icon { width: 20px; height: 20px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.md-link { color: var(--ouro-texto); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; border-radius: 2px; }
.md-link:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px; }

/* Ajustes desta documentação */
.md-notice p { margin: 0; }
#aviso-topo > .md-notice { margin-bottom: var(--space-6); } /* a região vazia não ocupa espaço; nunca a esconda com display: none */
```

O texto do Notice usa 15/22, que não está na escala de tipos (`label` é 15/20 em 600; `body` é 17/26). Siga o `bundle.css` (15/22) até o design system decidir; se mudar, a troca natural é `body`.

## Implementação no app

Base: o `Alert` do shadcn/ui (`Alert`, `AlertTitle`, `AlertDescription`) pode servir de ponto de partida. Mas ele usa `role="alert"` por padrão e separa título e descrição em blocos; aqui o papel é `note` ou `status` e as duas frases ficam no mesmo parágrafo. Construa um `<Notice />` próprio ou sobrescreva o `role`.

```ts
export interface NoticeProps {
  variant: "info" | "alert";
  /** Só na variante info: escudo para privacidade, "i" para o resto. */
  icon?: "shield-check" | "info";
  /** Frase em negrito que resume, com ponto final. */
  title: string;
  /** Frase que explica ou diz o que fazer. Pode incluir um link. */
  children: React.ReactNode;
  /** Só no erro de conexão: botão "Tentar de novo". */
  onRetry?: () => void;
}
```

```tsx
import { Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/midas/button";

export function Notice({ variant, icon = "info", title, children, onRetry }: NoticeProps) {
  const Icon = variant === "alert" ? TriangleAlert : icon === "shield-check" ? ShieldCheck : Info;
  return (
    <div
      role={variant === "info" ? "note" : undefined}
      className="flex gap-3 rounded-md border border-veio bg-superficie p-4 text-[0.9375rem]/[1.375rem] text-tinta"
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.75}
            className={`mt-px shrink-0 ${variant === "alert" ? "text-alerta" : "text-ouro-texto"}`} />
      <div>
        <p className="m-0"><strong className="font-semibold">{title}</strong> {children}</p>
        {onRetry && (
          <Button variant="ghost" onClick={onRetry} className="mt-2 -ml-3">Tentar de novo</Button>
        )}
      </div>
    </div>
  );
}
```

```tsx
// Região viva no topo da tela: existe sempre, vazia até haver um alerta depois de uma ação.
export function TopNoticeRegion({ notice }: { notice: NoticeProps | null }) {
  return (
    <div role="status">
      {notice && <div className="mb-6"><Notice {...notice} /></div>}
    </div>
  );
}
```

```tsx
// Uso
<Notice variant="alert" title="Novembro pode fechar no vermelho.">
  Se os gastos seguirem como nos últimos 3 meses, vão faltar cerca de R$ 300.{" "}
  <Link href="/planejamento/limites" className="font-semibold text-ouro-texto underline underline-offset-3 decoration-1">
    Ver onde dá para ajustar
  </Link>
</Notice>
```

Notas:

- Não esconda a região vazia com `display: none` ou `hidden`: fora da árvore de acessibilidade, ela deixa de ser uma região viva, e a mensagem pode não ser anunciada. Vazia, ela já não ocupa espaço.
- A variante `alert` não recebe `role` no próprio `<Notice />`. Quando surge depois de uma ação, ela é renderizada dentro de `TopNoticeRegion`, que tem `role="status"`. Assim não há duas regiões vivas aninhadas.
- A regra de prioridade (uma mensagem por vez) fica num só lugar, por exemplo `pickTopNotice(context)` no servidor, e alimenta `TopNoticeRegion`.
- O limite de 90% é calculado em centavos inteiros: `spentCents * 10 >= limitCents * 9`.
- `text-[0.9375rem]/[1.375rem]` é 15/22 em rem, para respeitar o tamanho de fonte escolhido pela pessoa.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Ícone + frase em negrito + frase que explica | Só ícone colorido ou só uma palavra |
| Uma mensagem por vez no topo | Pilha de avisos |
| `role="status"` para alerta que surge após uma ação | `role="alert"` ou foco roubado |
| Erro de formulário junto do campo | Notice no topo repetindo o erro |
| Dizer a saída ("Ver onde dá para ajustar") | Alertar sem dizer o que a pessoa pode fazer |

## Relacionados

- Componentes: [GoldenTouch](golden-touch.md), [EmptyState](empty-state.md), [MoneyInput](money-input.md) (erros junto do campo), [IncomeExpenseChart](income-expense-chart.md), [Achievement](achievement.md), [Button](button.md).
- Fundamentos: [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Cores](../04-cores.md), [Iconografia](../09-iconografia.md), [Privacidade na interface](../16-privacidade-na-interface.md), [Padrões de tela](../17-padroes-de-tela.md).
