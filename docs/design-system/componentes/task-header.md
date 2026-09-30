# TaskHeader (Topo das telas de tarefa)

> O topo das telas de tarefa (adicionar, editar, fixos, limites, categorias, "Monte seu mês", passos das calculadoras): "Voltar" e o título da tarefa, sem navegação inferior.

Grupo: Estrutura · Componente React: `<TaskHeader />` em `src/components/midas/task-header.tsx`

## Anatomia

- Link "Voltar" (`chevron-left` + texto, 44px de altura, `tinta`) à esquerda; título da tarefa em `title` centralizado no celular e à esquerda no computador.
- Nas calculadoras e no "Monte seu mês", abaixo: "Passo 2 de 4" em `caption` e a [Bar](bar.md) em `ouro`.

## Comportamento

- "Voltar" leva ao lugar de onde a pessoa veio (histórico); sem histórico, à tela-mãe (Lançamentos, Planejamento, Calculadoras, Configurações).
- Com algo digitado, "Voltar" não sai direto: a tela mostra, no lugar do formulário, "Sair sem salvar? O que você digitou vai se perder." com "Sair sem salvar" e "Continuar editando" (foco em "Continuar editando").
- Nos passos, "Voltar" volta um passo sem perder respostas; no primeiro passo, sai da calculadora (com a mesma pergunta, se já houver respostas).
- O botão Voltar do navegador faz o mesmo: cada passo tem `?passo=N` na URL.

## Acessibilidade

- O título é o `h1` da página; "Passo 2 de 4" fica numa região `aria-live="polite"` que já existe desde o primeiro render.
- Ao trocar de passo, o foco vai para o título da pergunta.
