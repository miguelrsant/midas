# Categorias

As categorias prontas deixam o lançamento em dois toques: valor e categoria. Elas usam as palavras do dia a dia, têm um ícone fixo cada uma e **não têm cores próprias**. Esta página é a lista oficial: nomes, ícones, o que entra em cada uma e a ordem em que aparecem.

## Categorias de gasto

| Ordem | Id | Nome | Ícone (Lucide) | O que entra | Exemplos de descrição |
| --- | --- | --- | --- | --- | --- |
| 1 | `mercado` | Mercado | `shopping-cart` | Supermercado, feira, padaria, açougue, hortifrúti | "Mercado do bairro", "Feira de sábado" |
| 2 | `restaurante` | Restaurante | `utensils` | Comer fora, lanche, delivery, café na rua | "Almoço com a família", "Pizza" |
| 3 | `transporte` | Transporte | `car` | Ônibus, metrô, aplicativo de corrida, combustível, estacionamento, pedágio | "Uber", "Gasolina" |
| 4 | `moradia` | Moradia | `house` | Aluguel, condomínio, prestação da casa, IPTU, reparos | "Aluguel", "Conserto do chuveiro" |
| 5 | `contas` | Contas | `receipt` | Luz, água, gás, internet, celular, assinaturas | "Conta de luz", "Internet" |
| 6 | `saude` | Saúde | `heart` | Farmácia, consultas, exames, plano de saúde, dentista | "Farmácia", "Dentista" |
| 7 | `educacao` | Educação | `book-open` | Escola, faculdade, cursos, livros, material escolar | "Mensalidade", "Livro" |
| 8 | `lazer` | Lazer | `ticket` | Cinema, shows, passeios, viagens, jogos | "Cinema", "Passeio no parque" |
| 9 | `compras` | Compras | `shopping-bag` | Roupas, calçados, eletrônicos, casa e decoração, presentes | "Tênis", "Presente da Ana" |
| 10 | `outros-gasto` | Outros | `shapes` | O que não cabe nas outras | |

- No formulário, aparecem as **seis primeiras** e um chip **"Mais"** (ícone `chevron-down`) que revela as outras no mesmo lugar.
- Com o uso, as seis primeiras passam a ser as seis que a pessoa mais usa (contagem dos últimos 90 dias; empate segue a ordem acima). A ordem é calculada quando o formulário abre e não muda com ele aberto.
- "Outros" fica sempre por último nas listas e nos gráficos, mesmo se for grande.

## Categorias de renda

| Ordem | Id | Nome | Ícone (Lucide) | O que entra |
| --- | --- | --- | --- | --- |
| 1 | `salario` | Salário | `briefcase` | Salário, pró-labore, aposentadoria, pensão, vale-alimentação e vale-refeição em dinheiro |
| 2 | `freelance` | Freelance | `laptop` | Trabalhos avulsos, bicos, serviços prestados |
| 3 | `vendas` | Vendas | `store` | Venda de produtos, artesanato, revenda, desapego |
| 4 | `investimentos` | Investimentos | `trending-up` | Rendimentos, juros, dividendos, resgates |
| 5 | `outros-renda` | Outros | `shapes` | Presentes em dinheiro, reembolsos, prêmios |

As cinco aparecem juntas, sem "Mais".

### Rendas criadas pelas calculadoras

As calculadoras de 13º, férias e rescisão criam **rendas previstas** no planejamento. Elas têm categorias próprias, que não aparecem no formulário de lançamento novo:

| Id | Nome | Ícone | Criada por | Quando cai |
| --- | --- | --- | --- | --- |
| `decimo-terceiro` | 13º salário | `coins` | Calculadora de 13º | 1ª parcela até 30 de novembro; 2ª até 20 de dezembro |
| `ferias` | Férias | `tree-palm` | Calculadora de férias | Até 2 dias antes do início das férias |
| `rescisao` | Rescisão | `file-text` | Calculadora de rescisão | Até 10 dias depois do fim do contrato |

- Na lista e no gráfico, elas aparecem como qualquer renda, com "(prevista)" até a data em que caem.
- Quando o dinheiro chega, a pessoa confirma o valor real com um toque ("Recebi"), e a renda deixa de ser prevista.
- Ao editar uma delas, o chip da categoria dela aparece primeiro e já selecionado.
- Os prazos de pagamento acima seguem a legislação trabalhista vigente e ficam no código junto das tabelas de cálculo, com a fonte oficial citada (veja o [CLAUDE.md](../../CLAUDE.md)).

## Regras visuais

- **Sem cor por categoria.** Ícone de gasto em `tinta` sobre `superficie-funda`; ícone de renda em `renda` sobre `renda-fundo`. Uma paleta de arco-íris deixaria a tela agitada e competiria com as cores de renda e gasto.
- **Um ícone por categoria, sempre o mesmo** em chips, linhas de lançamento, gráficos por categoria, relatórios e exportações.
- **Nome curto**, com inicial maiúscula, em uma ou duas palavras. Nada de "Supermercado/Hortifrúti" ou "Diversos".
- **Chip selecionado:** fundo `ouro`, texto `sobre-ouro` e o ícone da categoria trocado por `check`. Veja [CategoryChip](componentes/category-chip.md).

## Comportamento

- **Nenhuma categoria vem pré-selecionada.** Adivinhar faria a pessoa salvar sem perceber uma categoria errada.
- **Categoria é opcional.** Salvar sem escolher grava em "Outros" do tipo atual, e o aviso diz isso: "Anotado em Outros: − R$ 8,50".
- **Trocar Gasto/Renda limpa a categoria** escolhida, porque as listas são diferentes.
- **Categorias prontas não podem ser apagadas**, porque lançamentos antigos dependem delas. Se um dia a pessoa puder personalizar, ela poderá **escondê-las** do formulário.

### Categorias criadas pela pessoa (quando existirem)

O primeiro momento do app usa só as categorias prontas. Se o app passar a permitir categorias próprias, elas seguem as mesmas regras visuais:

- Nome de até 20 caracteres, com inicial maiúscula automática.
- Ícone escolhido numa lista curta de ícones Lucide aprovados (os das categorias prontas mais, por exemplo, `dog`, `baby`, `gift`, `plane`, `dumbbell`, `wrench`, `smartphone`, `church`), para a tela continuar coerente.
- Mesma ausência de cor e mesmas regras de ordem por uso.

## Limites por categoria

No Planejamento, a pessoa pode definir um limite mensal para uma categoria de gasto ("Restaurante: R$ 400 por mês").

| Situação | O que o Midas mostra |
| --- | --- |
| Até 89% do limite | Barra de progresso em `ouro` com a frase "R$ 360 de R$ 400" |
| De 90% a 100% | Barra em `alerta` e um [Notice](componentes/notice.md) no painel: "**Restaurante chegou a 90% do limite.** Faltam R$ 40,00 para o valor que você planejou em setembro." |
| Acima de 100% | Barra cheia em `alerta` e a frase "Passou R$ 25,00 do limite." Sem bronca e sem vermelho. |

Só um aviso por vez no topo do painel: se várias categorias passarem de 90%, o aviso fala da que está mais perto do limite e diz "e mais 2 categorias".

## Modelo de dados (sugestão)

```ts
type CategoryKind = "expense" | "income";

interface Category {
  /** Id estável, em minúsculas e sem acento. Nunca muda, mesmo que o nome mude. */
  id: string;               // "mercado", "outros-gasto", "decimo-terceiro"
  kind: CategoryKind;
  /** Nome exibido. */
  name: string;             // "Mercado"
  /** Nome do ícone Lucide. */
  icon: string;             // "shopping-cart"
  /** Ordem padrão (antes de a ordem por uso entrar). */
  defaultOrder: number;
  /** Categoria pronta do sistema (não pode ser apagada). */
  system: boolean;
  /** Criada por uma calculadora; não aparece no formulário de lançamento novo. */
  fromCalculator?: boolean;
}
```

- As categorias prontas ficam numa lista fixa no código (`src/lib/categories.ts`), não no banco, e o lançamento guarda só o `id`.
- O id da categoria "Outros" é diferente por tipo (`outros-gasto`, `outros-renda`), para os relatórios não misturarem renda e gasto.
- Trocar o nome exibido de uma categoria não exige migração de dados: o `id` continua o mesmo.
- Exportações ("Baixar meus dados") levam o `id` e o nome da categoria, para o arquivo fazer sentido fora do app.
