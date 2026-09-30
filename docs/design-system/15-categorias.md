# Categorias

As categorias prontas deixam o lançamento em dois toques: valor e categoria. Elas usam as palavras do dia a dia, têm um ícone cada uma e **não têm cores próprias**. Esta página é a lista oficial: nomes, ícones, o que entra em cada uma, a ordem em que aparecem e o que a pessoa pode personalizar.

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

As calculadoras de 13º, férias, rescisão e seguro-desemprego criam **rendas previstas** no planejamento. Elas têm categorias próprias, que não aparecem no formulário de lançamento novo e não podem ser personalizadas:

| Id | Nome | Ícone | Criada por | Quando cai |
| --- | --- | --- | --- | --- |
| `decimo-terceiro` | 13º salário | `coins` | Calculadora de 13º | 1ª parcela até 30 de novembro; 2ª até 20 de dezembro |
| `ferias` | Férias | `tree-palm` | Calculadora de férias | Até 2 dias antes do início das férias |
| `rescisao` | Rescisão | `file-text` | Calculadora de rescisão | O que a empresa paga: até 10 dias depois do último dia de trabalho. O saque do FGTS ("Saque do FGTS") usa a mesma categoria |
| `seguro-desemprego` | Seguro-desemprego | `umbrella` | Calculadora de seguro-desemprego | Estimativa: 1ª parcela cerca de 37 dias depois da saída; as outras a cada 30 dias |

A calculadora de salário líquido não cria renda prevista: ela cria ou atualiza o **fixo** "Salário" (categoria `salario`).

- Rendas previstas **não entram na lista de Lançamentos**. Elas aparecem no Planejamento (com a etiqueta "prevista") e nos gráficos, até a data em que caem.
- Quando o dinheiro chega, a pessoa toca em "Recebi", confirma o valor real e a data, e o Midas cria o lançamento de verdade no lugar da prevista. "Não recebi" apaga a prevista.
- Ao editar uma delas, o chip da categoria dela aparece primeiro e já selecionado.
- Os prazos de pagamento acima seguem a legislação trabalhista vigente e ficam no código junto das tabelas de cálculo, com a fonte oficial citada (veja o [CLAUDE.md](../../CLAUDE.md)).

## Regras visuais

- **Sem cor por categoria.** Ícone de gasto em `tinta` sobre `superficie-funda`; ícone de renda em `renda` sobre `renda-fundo`. Uma paleta de arco-íris deixaria a tela agitada e competiria com as cores de renda e gasto.
- **Um ícone por categoria, sempre o mesmo** em chips, linhas de lançamento, gráficos por categoria, relatórios e exportações. Se a pessoa troca o ícone, ele muda em todos esses lugares ao mesmo tempo.
- **Nome curto**, com inicial maiúscula, em uma ou duas palavras. Nada de "Supermercado/Hortifrúti" ou "Diversos".
- **Chip selecionado:** fundo `ouro`, texto `sobre-ouro` e o ícone da categoria trocado por `check`. Veja [CategoryChip](componentes/category-chip.md).

## Comportamento

- **Nenhuma categoria vem pré-selecionada.** Adivinhar faria a pessoa salvar sem perceber uma categoria errada.
- **Categoria é opcional.** Salvar sem escolher grava em "Outros" do tipo atual, e o aviso diz isso: "Anotado em Outros: − R$ 8,50".
- **Trocar Gasto/Renda limpa a categoria** escolhida, porque as listas são diferentes.
- **Categorias prontas não podem ser apagadas**, porque lançamentos antigos dependem delas. A pessoa pode **escondê-las** do formulário e trocar o nome e o ícone.

## Personalização

Fica em **Configurações › Suas categorias** (`/configuracoes/categorias`), com duas seções: Gastos e Rendas. Cada categoria abre uma tela de tarefa com o nome, o ícone e "Mostrar no formulário".

| O que a pessoa faz | Categoria pronta | Categoria própria |
| --- | --- | --- |
| Trocar o nome | Sim; "Voltar ao nome original" desfaz | Sim |
| Trocar o ícone | Sim; "Voltar ao ícone original" desfaz | Sim |
| Esconder do formulário | Sim, exceto "Outros" (é para onde vai o que não tem categoria) | Sim |
| Apagar | Não | Sim, com confirmação na própria tela: "Apagar “Academia”? Os 12 lançamentos dela vão para Outros." Fixos vão para Outros e o limite dela é removido |
| Criar | — | "Criar categoria de gasto" / "Criar categoria de renda"; no máximo 30 por pessoa |

Regras:

- **Nome** de 1 a 20 caracteres, com a primeira letra maiúscula automática; não pode repetir o nome de outra categoria do mesmo tipo (sem diferenciar maiúsculas e acentos).
- **Ícone** escolhido na lista curada abaixo, numa grade de rádios de 44px (fieldset "Ícone"); o selecionado ganha fundo `ouro` e borda, e o ícone continua visível. Cada ícone tem um nome em português para o leitor de tela.
- **Sem cor**, nunca. A mesma regra das prontas.
- Categoria escondida continua nos lançamentos antigos, nos gráficos e nas listas; só some dos chips do formulário. Ao editar um lançamento que usa uma categoria escondida, ela aparece selecionada.
- Categorias próprias entram na ordem por uso como as prontas; "Outros" continua por último.
- O nome e o ícone das categorias próprias ficam **cifrados** no banco, porque podem revelar saúde ("Remédios", ícone de pílula).

### Ícones da personalização

Guardamos no banco uma **chave do Midas** (coluna da esquerda), nunca o nome do Lucide, para uma troca de nome na biblioteca não quebrar os dados.

| Grupo | Chave → ícone Lucide (nome para o leitor de tela) |
| --- | --- |
| Categorias prontas | `mercado` ShoppingCart (carrinho), `restaurante` Utensils (talheres), `transporte` Car (carro), `moradia` House (casa), `contas` Receipt (recibo), `saude` Heart (coração), `educacao` BookOpen (livro), `lazer` Ticket (ingresso), `compras` ShoppingBag (sacola), `outros` Shapes (formas), `salario` Briefcase (maleta), `freelance` Laptop (notebook), `vendas` Store (loja), `investimentos` TrendingUp (gráfico subindo) |
| Casa e contas | `predio` Building (prédio), `chave` Key (chave), `sofa` Sofa (sofá), `luz` Lightbulb (lâmpada), `agua` Droplets (gotas), `gas` Flame (chama), `internet` Wifi (wi-fi), `celular` Smartphone (celular), `tv` Tv (televisão), `conserto` Wrench (chave inglesa), `obra` Hammer (martelo), `pintura` PaintRoller (rolo de pintura) |
| Comida | `cafe` Coffee (café), `pizza` Pizza (pizza), `lanche` Sandwich (sanduíche), `bebida` Beer (cerveja), `doce` Cake (bolo), `feira` ShoppingBasket (cesta), `fruta` Apple (maçã) |
| Transporte | `onibus` Bus (ônibus), `metro` TrainFront (trem), `bicicleta` Bike (bicicleta), `moto` Motorbike (moto), `combustivel` Fuel (bomba de combustível), `taxi` CarTaxiFront (táxi), `estacionamento` ParkingMeter (parquímetro), `viagem` Plane (avião) |
| Pessoas e bichos | `bebe` Baby (bebê), `familia` Users (pessoas), `cachorro` Dog (cachorro), `gato` Cat (gato), `pet` PawPrint (pata), `presente` Gift (presente), `doacao` HeartHandshake (doação), `igreja` Church (igreja) |
| Cuidado | `remedio` Pill (remédio), `consulta` Stethoscope (estetoscópio), `academia` Dumbbell (haltere), `cabelo` Scissors (tesoura), `beleza` Sparkles (brilhos), `oculos` Glasses (óculos) |
| Estudo e lazer | `faculdade` GraduationCap (capelo), `escola` School (escola), `material` Backpack (mochila), `musica` Music (nota musical), `jogos` Gamepad2 (controle de videogame), `cinema` Film (filme), `arte` Palette (paleta), `acampar` Tent (barraca) |
| Dinheiro e coisas | `poupanca` PiggyBank (cofrinho), `carteira` Wallet (carteira), `cartao` CreditCard (cartão), `dinheiro` Banknote (nota de dinheiro), `emprestimo` HandCoins (mão com moedas), `imposto` Landmark (prédio público), `roupa` Shirt (camiseta), `encomenda` Package (pacote), `mudanca` Truck (caminhão), `seguro` Umbrella (guarda-chuva) |

Os ícones das categorias de calculadora (`coins`, `tree-palm`, `file-text`, `umbrella`) ficam fixos e não entram na personalização das prontas, mas `seguro` (Umbrella) pode ser escolhido por uma categoria própria.

## Limites por categoria

No Planejamento, a pessoa pode definir um limite mensal para uma categoria de gasto ("Restaurante: R$ 400 por mês").

| Situação | O que o Midas mostra |
| --- | --- |
| Até 89% do limite | Barra de progresso em `ouro` com a frase "R$ 360 de R$ 400" |
| De 90% a 100% | Barra em `alerta` e um [Notice](componentes/notice.md) no painel: "**Restaurante chegou a 90% do limite.** Faltam R$ 40,00 para o valor que você planejou em setembro." |
| Acima de 100% | Barra cheia em `alerta` e a frase "Passou R$ 25,00 do limite." Sem bronca e sem vermelho. |

Só um aviso por vez no topo do painel: se várias categorias passarem de 90%, o aviso fala da que está mais perto do limite (maior proporção gasto/limite) e diz "e mais 2 categorias".

- O limite vale para todo mês, até a pessoa mudar ou remover. A conta é feita em centavos inteiros: 90% é `gasto * 10 >= limite * 9`.
- Só categorias de gasto têm limite (prontas ou próprias). Categoria escondida mantém o limite.

## Modelo de dados

```ts
type EntryKind = "expense" | "income";

interface Category {
  /** Id estável. Prontas: minúsculas sem acento ("mercado"). Próprias: "u-<uuid>". Nunca muda. */
  id: string;
  kind: EntryKind;
  /** Nome exibido (o da pessoa, se ela trocou). */
  name: string;             // "Mercado"
  /** Chave de ícone do Midas (tabela acima), nunca o nome do Lucide. */
  icon: string;             // "mercado"
  /** Ordem padrão (antes de a ordem por uso entrar). */
  defaultOrder: number;
  /** Pronta do sistema (não pode ser apagada). */
  system: boolean;
  /** Escondida do formulário. */
  hidden: boolean;
  /** Criada por uma calculadora; não aparece no formulário de lançamento novo. */
  fromCalculator?: boolean;
}
```

- As categorias prontas ficam numa lista fixa no código (`src/lib/categories.ts`), não no banco, e o lançamento guarda só o `id`. Os ajustes da pessoa (nome, ícone, escondida) e as categorias próprias ficam na tabela `user_category`.
- O id da categoria "Outros" é diferente por tipo (`outros-gasto`, `outros-renda`), para os relatórios não misturarem renda e gasto.
- Trocar o nome exibido de uma categoria não exige migração de dados: o `id` continua o mesmo.
- Exportações ("Baixar meus dados") levam o `id` e o nome da categoria, para o arquivo fazer sentido fora do app.
