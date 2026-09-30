# Conteúdo e tom

> O Midas fala como alguém calmo e gentil que entende de dinheiro e fala a sua língua.

Texto é interface. Para boa parte do público do Midas, uma palavra técnica é uma porta fechada. Esta página define como o app escreve: vocabulário, formatos de dinheiro e data, rótulos, mensagens e o tom nos momentos bons e ruins.

## Princípios de escrita

1. **Português do Brasil, falando com "você".** Sem "o usuário", sem "prezado cliente".
2. **Frases curtas, voz ativa.** Uma ideia por frase. "Anote o primeiro gasto do mês", não "O primeiro gasto do mês deve ser anotado".
3. **As palavras da pessoa, não as do banco.** "Entrou" e "Saiu", não "crédito" e "débito".
4. **Fato + caminho.** Toda notícia, boa ou ruim, diz o que aconteceu e o que dá para fazer.
5. **Nunca julgar, nunca assustar.** Sem "cuidado!", sem "você gastou demais", sem piada com aperto.
6. **Linguagem neutra quando possível.** "Que bom te ver de novo", não "Bem-vindo de volta"; "Como quer ser chamado ou chamada?" vira "Como você quer que o Midas te chame?".
7. **Sem emoji, sem exclamação.** A calma está também na pontuação.

## Vocabulário

| Use | Evite | Por quê |
| --- | --- | --- |
| gasto | despesa, débito, saída de caixa | É a palavra do dia a dia. |
| renda, ganho | receita, crédito, entrada de caixa | "Receita" confunde com receita de bolo e de médico. |
| Entrou / Saiu | Créditos / Débitos | Verbos concretos. |
| Sobrou / Faltou | Saldo positivo / negativo, superávit, déficit | Diz o resultado em uma palavra. |
| lançamento (em listas e configurações) | transação, movimentação, registro | Termo genérico aceitável; prefira "gasto" ou "renda" quando souber qual é. |
| anotar | registrar, cadastrar, inserir | "Anotar" é o que a pessoa faz no caderno. |
| planejamento, próximos meses | forecast, orçamento projetado | |
| projeção, estimativa | previsão garantida | Projeção é projeção: nunca prometa. |
| apagar | excluir definitivamente, deletar | "Excluir" é aceitável em botões ("Excluir lançamento"); nunca "deletar". |
| baixar meus dados | exportar dump, fazer backup | |
| Seus dados | Privacidade e LGPD, Titular de dados | O nome da seção é o que a pessoa procura. |
| senha | credencial, chave de acesso | |
| no azul / no vermelho | positivo / negativo | Expressões populares, só em títulos e resumos. |

Termos das calculadoras são inevitáveis (13º salário, férias, rescisão, aviso prévio, FGTS). Use-os, mas explique cada um na primeira vez que aparece na tela (veja [Calculadoras](#calculadoras)).

## Dinheiro

### Formato

| Situação | Formato | Exemplo |
| --- | --- | --- |
| Renda | sinal + espaço + R$ + espaço + valor | `+ R$ 5.400,00` |
| Gasto | sinal de menos + espaço + R$ + espaço + valor | `− R$ 127,90` |
| Saldo e totais sem direção | R$ + espaço + valor | `R$ 1.842,10` |
| Saldo negativo | como gasto, em `gasto`, com a palavra "Faltou" | `− R$ 210,00` |
| Resumo em frase | arredondado ao real, sem centavos | "Sobraram R$ 1.842 até agora" |
| Eixo de gráfico | forma compacta | "4 mil", "1,2 mi" |

- Separador de milhar: ponto. Decimal: vírgula. Sempre duas casas nos valores exatos.
- O sinal de menos é **−** (U+2212), nunca o hífen `-`.
- Os espaços são **inseparáveis** (U+00A0), e o valor inteiro fica numa linha só (`white-space: nowrap`).
- Listas, tabelas e o campo de valor mostram centavos. Frases de resumo podem arredondar ao real; o número exato fica a um toque de distância.
- Nunca escreva "R$" duas vezes na mesma linha de valor, nem "reais" junto de "R$".

### Implementação

`Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` produz `R$ 5.400,00` (com espaço inseparável) e `-R$ 127,90` para negativos, com hífen e sem espaço. Por isso o Midas formata o valor absoluto e põe o sinal à mão. Sugestão (`src/lib/money.ts`):

```ts
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const NBSP = " ";
const MINUS = "−";

/** Formata centavos inteiros. sign: "auto" mostra − só em negativos; "always" mostra + e −; "never" não mostra sinal. */
export function formatMoney(cents: number, { sign = "auto" }: { sign?: "auto" | "always" | "never" } = {}): string {
  if (!Number.isInteger(cents)) throw new Error("Valor em centavos precisa ser inteiro");
  const abs = brl.format(Math.abs(cents) / 100).replace(/\s/g, NBSP); // "R$ 1.234,56"
  if (sign === "never" || cents === 0) return abs;
  if (cents < 0) return `${MINUS}${NBSP}${abs}`;
  return sign === "always" ? `+${NBSP}${abs}` : abs;
}
```

Para o leitor de tela, o sinal visual fica escondido e a direção vai em palavra:

```html
<span class="md-tx-amount md-out"><span class="md-sr">Saiu </span><span aria-hidden="true">−</span> R$ 127,90</span>
```

A leitura do que a pessoa digita (vírgula, ponto, limites e mensagens de erro) está em [MoneyInput](componentes/money-input.md).

## Datas e horas

| Situação | Formato | Exemplo |
| --- | --- | --- |
| Lançamento de hoje | "hoje" | Mercado · hoje |
| Lançamento de ontem | "ontem" | Almoço · ontem |
| Outros dias do ano | dia + mês abreviado, minúsculo, sem ponto | 5 set |
| Outro ano | dia + mês abreviado + ano | 5 set 2025 |
| Topo do painel | dia da semana (sem "-feira"), dia e mês por extenso | Quarta, 30 de setembro |
| Cabeçalho de dia na lista | "Hoje", "Ontem", depois dia da semana e data | Sábado, 26 de setembro |
| Mês no topo | nome do mês + ano | Setembro 2026 |
| Mês em frase | minúsculo | "em setembro", "até outubro" |
| Hora | 24 horas, com "h" | 9h, 9h30, 18h |

- Meses abreviados: jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez. `Intl.DateTimeFormat` devolve "set." com ponto: tire o ponto.
- Dia da semana: `Intl` devolve "quarta-feira"; o Midas mostra "Quarta" (sem "-feira", inicial maiúscula no começo da frase).
- Semanas começam no domingo no calendário, como no Brasil.
- "Agora" não é uma data: um lançamento salvo agora aparece como "hoje".

## Números, porcentagens e plurais

- Números em algarismos: "3 lançamentos", "12 meses".
- Porcentagem colada ao número: "70%".
- Plural certo sempre: "1 lançamento", "2 lançamentos"; "falta 1 dia", "faltam 3 dias". Use `Intl.PluralRules("pt-BR")`.
- Ordinal com º (U+00BA): "13º salário", "1ª parcela". Nunca o símbolo de grau (°).

## Rótulos e botões

- **Botões começam com verbo** e, quando preciso, levam o objeto: "Adicionar gasto", "Salvar gasto", "Salvar renda", "Baixar meus dados", "Apagar minha conta", "Ver todos".
- Em confirmações destrutivas, os dois botões dizem o que acontece: "Excluir lançamento" e "Manter lançamento", nunca "Sim" e "Não", nem "OK" e "Cancelar" sozinhos.
- Estado em andamento com reticências (…, um caractere só): "Salvando…", "Entrando…", "Calculando…".
- **Rótulos de campo** são curtos; quando o campo é o centro da tela, o rótulo é uma pergunta: "Quanto foi?", "Quanto entrou?", "Qual era o seu salário bruto?".
- Campos opcionais dizem "(opcional)" no rótulo, em peso normal e `tinta-suave`. Campos obrigatórios não levam asterisco.
- Links dizem para onde vão: "Esqueci minha senha", "Ver a política de privacidade". Nunca "clique aqui".

## Títulos

- Títulos de tela são curtos e sem ponto final: "Lançamentos", "Calculadoras", "Seus dados".
- Títulos em frase (saudação, estados vazios, conquista) terminam com ponto e podem levar **um** acento dourado.
- Caixa de frase sempre: "Renda x gastos", não "Renda x Gastos".

### Banco de títulos com acento

| Situação | Título |
| --- | --- |
| Saudação, mês indo bem | "Bom dia, Miguel. Setembro vai *bem*." |
| Saudação, começo de mês | "Boa tarde. Outubro está só *começando*." |
| Saudação, mês fechado no positivo | "Boa noite. Setembro fechou *no azul*." |
| Conquista do mês | "Mês fechado *no azul*." |
| Entrada | "Que bom te ver *de novo*." |
| Cadastro | "Suas finanças *em ordem*." |
| Estado vazio do mês | "Outubro começa *aqui*." |
| Primeiro acesso | "Tudo pronto para *começar*." |
| Planejamento com sobra prevista | "Dezembro deve fechar *com folga*." |
| Calculadora concluída | "Suas férias, *em números*." |

### Mês apertado ou no vermelho (sem acento)

| Situação | Título e frase |
| --- | --- |
| Mês em andamento, gastos acima do ritmo | "Setembro está apertado: faltam R$ 120 para fechar no azul." |
| Mês fechado no vermelho | "Setembro fechou com R$ 210 a menos. Quer ver onde dá para ajustar?" |
| Projeção negativa | "Novembro pode fechar no vermelho. Veja os gastos que mais pesam." |

## Mensagens

### Confirmações

A confirmação repete o que aconteceu, para a pessoa conferir sem abrir nada:

| Ação | Mensagem |
| --- | --- |
| Salvou um gasto | "Anotado: Mercado do bairro, − R$ 127,90" |
| Salvou sem descrição | "Anotado: Mercado, − R$ 127,90" (usa o nome da categoria) |
| Salvou sem categoria | "Anotado em Outros: − R$ 8,50" |
| Salvou uma renda | "Anotado: Salário, + R$ 5.400,00" |
| Editou | "Alterado: Mercado do bairro, − R$ 132,90" |
| Excluiu | "Lançamento excluído: Mercado do bairro, − R$ 127,90" |
| Adicionou o resultado de uma calculadora | "Férias adicionadas ao planejamento de dezembro." |
| Pediu os dados | "Seu arquivo está pronto para baixar." |

### Erros

Todo erro diz **o que fazer**, na linguagem da pessoa, sem culpa ("Você digitou errado") e sem código ("Erro 422").

| Situação | Mensagem |
| --- | --- |
| Valor vazio ou zero | "Digite um valor maior que zero." |
| Mais de dois decimais | "Use no máximo dois números depois da vírgula." |
| Valor acima do teto | "Esse valor parece alto demais. Confira os números." |
| E-mail inválido | "Confira o e-mail: falta o @ ou o domínio (por exemplo, nome@exemplo.com)." |
| Login falhou | "E-mail ou senha incorretos." (não diz qual dos dois) |
| Muitas tentativas | "Muitas tentativas. Espere 1 hora e tente de novo." |
| Senha curta no cadastro | "A senha precisa ter pelo menos 8 caracteres. Faltam 3." |
| Senha comum ou vazada | "Essa senha aparece em listas de senhas vazadas. Escolha outra." |
| Sem internet | "Sem conexão agora. O que você digitou continua aqui; tente salvar de novo." |
| Erro do servidor | "Não deu para salvar agora. Tente de novo em alguns instantes." |
| Sessão expirou | "Por segurança, sua sessão terminou. Entre de novo para continuar." |

### Avisos

Avisos têm uma frase em negrito que resume e uma frase que explica ou dá o caminho:

- "**Restaurante chegou a 90% do limite.** Faltam R$ 40,00 para o valor que você planejou em setembro."
- "**Seus dados são só seus.** O Midas não pede CPF nem acessa seu banco. Você pode baixar ou apagar tudo quando quiser."
- "**É uma estimativa.** Confira os valores com o RH ou o sindicato."

### Estados vazios

Um título curto com o contexto, uma frase que diz o que acontece depois do primeiro passo e um botão que resolve o vazio. Exemplo: "Outubro começa *aqui*." / "Anote o primeiro gasto do mês e o Midas passa a mostrar para onde vai o seu dinheiro." / "Adicionar gasto". Banco completo em [EmptyState](componentes/empty-state.md).

## Saudação

| Hora | Saudação |
| --- | --- |
| 5h às 11h59 | "Bom dia" |
| 12h às 17h59 | "Boa tarde" |
| 18h às 4h59 | "Boa noite" |

"Bom dia, Miguel." O nome é pedido no cadastro, e a pessoa escolhe como quer ser chamada (pode ser um apelido).

## Calculadoras

Os termos trabalhistas aparecem com uma explicação curta na primeira vez, em `caption` abaixo do título ou do campo:

| Termo | Explicação na tela |
| --- | --- |
| 13º salário | "Um salário extra por ano, pago em duas parcelas: a primeira até 30 de novembro e a segunda até 20 de dezembro." |
| Férias + 1/3 | "Nas férias, você recebe o salário do mês mais um terço dele." |
| Rescisão | "O que a empresa paga quando o contrato de trabalho termina." |
| Aviso prévio | "O tempo entre avisar a saída e o último dia de trabalho. Pode ser trabalhado ou pago em dinheiro." |
| Saldo de salário | "Os dias que você trabalhou no mês da saída." |
| FGTS | "Um dinheiro que a empresa deposita todo mês numa conta no seu nome." |
| Multa de 40% do FGTS | "Na demissão sem justa causa, a empresa paga 40% do que foi depositado no seu FGTS." |
| Descontos | "INSS e Imposto de Renda, que saem do valor bruto." |
| Salário bruto | "O valor antes dos descontos, como aparece no contracheque." |
| Salário líquido | "O que cai na sua conta depois do INSS e do Imposto de Renda." |
| Dependentes | "Filhos e outras pessoas que você pode declarar no Imposto de Renda. Cada um diminui o imposto." |
| Venda de 10 dias | "Você pode trocar 10 dos 30 dias de férias por dinheiro. Esse valor não tem desconto." |
| Férias vencidas | "Um ano inteiro de trabalho sem tirar as férias desse ano." |
| Acordo com a empresa | "Quando vocês combinam a saída: o aviso pago e a multa do FGTS caem pela metade, e o seguro-desemprego não vale." |
| Saque-aniversário | "Se você escolheu sacar parte do FGTS todo ano no seu aniversário, na demissão só pode sacar a multa." |
| Saldo do FGTS para fins rescisórios | "Aparece no app do FGTS. Inclui o que você já sacou, porque a multa é calculada sobre tudo que foi depositado." |
| Seguro-desemprego | "Um valor pago pelo governo por alguns meses a quem foi dispensado sem justa causa." |
| Redução do Imposto de Renda de 2026 | "Desde 2026, quem ganha até R$ 5.000 por mês não paga Imposto de Renda no salário, e quem ganha até R$ 7.350 paga menos." |

- O resultado sempre se chama **estimativa** e vem com o aviso "É uma estimativa. Confira os valores com o RH ou o sindicato."
- A tabela de cálculo (INSS, IRRF, regras de cada tipo de saída) mostra de onde veio cada número e o ano da tabela usada: "Tabela do INSS de 2026".
- Quando a data passa da última tabela conhecida: "Usamos as tabelas de 2026, as mais recentes que o Midas conhece." Antes da primeira: "O Midas calcula a partir de 2025."
- Sem direito ou fora do escopo, nunca um número inventado: uma frase que explica ("Na justa causa, não há 13º nem férias proporcionais.").

## Textos para acessibilidade

- `aria-label`, `alt` e textos escondidos também são conteúdo: em português, curtos, sem "botão de" ou "imagem de" (o leitor de tela já diz o papel).
- Logo: "Midas". Selo: "Selo Midas: suas finanças, seu controle". Ornamentos: sem texto (`aria-hidden`).
- Gráficos: um `aria-label` que resume os dados, além do título que diz a conclusão. Exemplo: "Barras de renda e gastos de julho a dezembro. Outubro a dezembro são projeção, com 13º em dezembro."

## Pontuação e tipografia do texto

| Use | Evite |
| --- | --- |
| Reticências de um caractere: … | Três pontos: ... |
| Aspas curvas: “assim” | Aspas retas em texto de interface: "assim" |
| Travessão só em código de exemplo; em texto, vírgula ou dois-pontos | Frases emendadas por travessão |
| Sinal de menos em valores: − | Hífen em valores: - |
| "x" em "Renda x gastos" | "vs." ou "versus" |
| Frases que terminam em ponto | Exclamação: "Parabéns!!!" |
