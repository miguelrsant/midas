# ExpectedIncomeRow (Renda prevista)

> Linha de uma renda que ainda vai cair, criada por uma calculadora (13º, férias, rescisão, saque do FGTS, seguro-desemprego), com a etiqueta "prevista" e as ações "Recebi" e "Não recebi".

Grupo: Planejamento · Componente React: `<ExpectedIncomeRow />` em `src/components/midas/expected-income-row.tsx`

## Anatomia

- Mesma grade da [TransactionRow](transaction-row.md): ícone da categoria (em `renda` sobre `renda-fundo`), título ("13º salário, 1ª parcela"), meta ("até 30 nov" ou "era até 30 nov"), valor "+ R$ 2.700,00" em `amount`, `renda`.
- Etiqueta "prevista": pílula `superficie-funda`, texto `caption` 600 `tinta-suave`.
- Ações abaixo, em botões secundários pequenos (48px de altura): "Recebi" e "Não recebi".

## Comportamento

- **Recebi**: abre, no mesmo lugar, "Quanto entrou?" (MoneyInput já com o valor previsto) e "Quando?" (Hoje, Ontem, Outro dia), com "Anotar renda". Ao salvar, a prevista vira um lançamento de verdade e sai da lista; aviso: "Anotado: 13º salário, 1ª parcela, + R$ 2.712,40". Sem toque de ouro.
- **Não recebi**: confirmação na tela: "Tirar “13º salário, 1ª parcela” do planejamento?" com "Tirar do planejamento" e "Manter".
- Data passada: a meta diz "era até 30 nov" e a linha ganha a frase "Chegou? Toque em Recebi."
- Previstas de meses passados não entram na projeção; as do mês atual e dos seguintes entram.

## Acessibilidade

- O valor tem o texto escondido "Vai entrar"; a etiqueta "prevista" é texto (não só cor).
- Os botões dizem de qual renda são: `aria-label="Recebi: 13º salário, 1ª parcela"`.
