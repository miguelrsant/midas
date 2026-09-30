# RadioCards (Escolhas grandes das calculadoras)

> Rádios grandes, com uma frase de ajuda em cada opção, para as perguntas de escolha das calculadoras e do "Monte seu mês".

Grupo: Calculadoras · Componente React: `<RadioCards />` em `src/components/midas/radio-cards.tsx`

## Anatomia

- `fieldset` com a pergunta no `legend` (estilo `title`) e rádios nativos.
- Cada opção é um cartão de pelo menos 48px: círculo do rádio à esquerda, rótulo em `body` 600 e ajuda em `caption` `tinta-suave`, tudo dentro do `<label>`.
- Fundo `superficie`, borda 1px `borda`, `radius-md`, 8px entre opções.

## Estados

| Estado | Aparência |
| --- | --- |
| Selecionado | Borda 2px `ouro`, círculo preenchido em `ouro` com ponto `sobre-ouro` |
| Foco | Anel 2px `foco` no cartão |
| Erro (ao tentar continuar sem escolher) | Borda 2px `alerta` no grupo e a mensagem "Escolha uma opção para continuar." com `triangle-alert` |

## Exemplo

"Como foi a saída?"
- Pedi demissão — "Você avisou a empresa que ia sair."
- Fui demitido ou demitida sem justa causa — "A empresa encerrou o contrato sem acusar falta grave."
- Fui demitido ou demitida por justa causa — "A empresa encerrou o contrato por uma falta grave."
- Acordo com a empresa — "Vocês combinaram a saída (acordo da reforma trabalhista)."
- Fim do contrato de experiência — "O contrato acabou na data combinada."

## Acessibilidade

- Nada vem marcado sem motivo; quando a resposta tem um padrão seguro (por exemplo, "Nenhuma" nas férias vencidas), ele vem marcado e a ajuda diz isso.
- Setas movem entre as opções (nativo).
