# Cores

A paleta do Midas vem de três materiais: **mármore** (os fundos), **ouro** (o brilho) e **mogno** (a madeira escura). Em volta deles, um marrom quase preto para o texto e um par de cores seguro para daltonismo para o dinheiro que entra e o que sai.

Cada cor é um **token** com nome em português. O código usa sempre o token, nunca o valor hexadecimal: é o token que troca de valor entre os temas. A implementação em CSS e Tailwind está em [Tokens](14-tokens.md).

## Temas

| Tema | Nome na documentação | Nome na interface | Descrição |
| --- | --- | --- | --- |
| Claro (padrão) | **Calacatta** | "Claro" | Mármore branco quente com veios cinza e um veio dourado. |
| Escuro | **Portoro** | "Escuro" | Mármore quase preto com veios dourados. |

- O app começa no **Claro** (Calacatta). Em Configurações, as opções são **Claro**, **Escuro** e **Automático** (segue o aparelho), com Claro marcado de início.
- A escolha fica no próprio aparelho (não precisa de conta) e é aplicada antes da primeira pintura, para a tela não piscar.
- Os nomes Calacatta e Portoro são para a equipe; a interface nunca os mostra.

## Tokens

### Superfícies

| Token | Calacatta | Portoro | Uso |
| --- | --- | --- | --- |
| `marmore` | `#f5f2ec` | `#17110c` | Fundo da página. |
| `superficie` | `#fdfbf7` | `#221912` | Cartões, painéis, diálogos e folhas sobre o `marmore`. |
| `superficie-funda` | `#ebe5db` | `#2d2219` | Campos de formulário, trilhas de progresso, fundo de ícone de gasto, linha em hover. |
| `veio` | `#ddd4c7` | `#3d2f24` | Linhas divisórias finas (1px) entre itens. Decorativo: nunca é borda de controle. |
| `borda` | `#8a7a68` | `#8a7866` | Borda de campos, do botão secundário, dos chips e da pílula selecionada do alternador. 3:1 ou mais sobre os fundos. |

### Texto

| Token | Calacatta | Portoro | Uso |
| --- | --- | --- | --- |
| `tinta` | `#2b1f16` | `#f2ebe0` | Texto principal. |
| `tinta-suave` | `#65564a` | `#c2b3a2` | Texto secundário: rótulos auxiliares, datas, ajuda, eixos de gráfico. |
| `ouro-texto` | `#7e5b17` | `#e2c27a` | Links, botão fantasma, acento em itálico, ícone de informação, rótulo "Projeção". |

### Marca e ação

| Token | Calacatta | Portoro | Uso |
| --- | --- | --- | --- |
| `ouro` | `#c19a4b` | `#d6b263` | Brilho da marca: moedas, chip selecionado, barra de progresso, louros, veio de ouro, linha de projeção. **Nunca é cor de texto.** |
| `sobre-ouro` | `#2b1f16` | `#1d140d` | Texto e ícones sobre fundo `ouro`. |
| `mogno` | `#5b3a24` | `#7a5033` | Marrom da marca: letras do logo, avatar, blocos de identidade. |
| `primario` | = `mogno` | = `ouro` | A ação principal da tela (botão primário). Mogno de dia, ouro à noite. |
| `primario-hover` | `#4a2e1b` | `#e2c27a` | Botão primário ao passar o mouse ou pressionar. |
| `sobre-primario` | `#fbf7f0` | `#1d140d` | Texto e ícones sobre `primario`. |

### Dinheiro

| Token | Calacatta | Portoro | Uso |
| --- | --- | --- | --- |
| `renda` | `#1d6470` | `#7cc3cf` | Dinheiro que entra: valores de renda, ícone de entrada, série de renda. Sempre com sinal + e palavra ou ícone. |
| `renda-fundo` | `#dcebec` | `#1c2d2f` | Fundo do ícone de renda e dos meses projetados de renda. Texto sobre ele em `renda`. |
| `gasto` | `#a3402a` | `#ec957c` | Dinheiro que sai: valores de gasto, ícone de saída, série de gasto, botão de perigo. Sempre com sinal − e palavra ou ícone. |
| `gasto-fundo` | `#f5e1da` | `#3a2019` | Fundo dos meses projetados de gasto e de destaques de saída. Texto sobre ele em `gasto`. |

`renda` é um **azul-petróleo** e `gasto` é uma **terracota**: o par fica no eixo azul–laranja, que continua distinguível nos tipos mais comuns de daltonismo (deuteranopia e protanopia), ao contrário do par verde–vermelho. Mesmo assim, a cor nunca trabalha sozinha: há sempre sinal, ícone e palavra.

### Estado e efeitos

| Token | Calacatta | Portoro | Uso |
| --- | --- | --- | --- |
| `alerta` | `#8a5a00` | `#f0c060` | Avisos de orçamento perto do limite, projeção negativa e erros de formulário, sempre com o ícone `triangle-alert` e uma frase. |
| `foco` | `#7e5b17` | `#e2c27a` | Anel de foco do teclado: 2px sólido, 2px de afastamento, em todos os controles. |
| `veu` | `rgba(253,251,247,0.76)` | `rgba(34,25,18,0.8)` | Véu sobre as texturas de mármore. Sempre entre a textura e qualquer texto. |
| `brilho` | `rgba(193,154,75,0.32)` | `rgba(214,178,99,0.28)` | Onda e reflexo do toque de ouro. Só em movimento, nunca como fundo fixo. |

### Gráficos

| Token | Valor | Uso |
| --- | --- | --- |
| `grafico-renda` | = `renda` | Série de renda. |
| `grafico-gasto` | = `gasto` | Série de gastos. |
| `grafico-projecao` | = `ouro` | Linha que marca o início da projeção e contornos de meses projetados. |

### Gradiente e sombra

| Token | Valor | Uso |
| --- | --- | --- |
| `folha-de-ouro` | `linear-gradient(135deg, #ecd58f 0%, #c9a04d 38%, #a97f31 62%, #dcbb6c 100%)` | Moedas e selos de momentos especiais (moeda do aviso "Anotado", selo em folha de ouro, ícone do app). **Nunca atrás de texto.** |
| `sombra-cartao` | Claro: `0 1px 2px rgba(43,31,22,0.06), 0 8px 24px rgba(43,31,22,0.06)` · Escuro: `0 1px 2px rgba(0,0,0,0.5)` | A única elevação do sistema: cartões sobre o `marmore`, pílula selecionada, aviso "Anotado". |

## Pares de contraste

Razões de contraste medidas pela fórmula da WCAG 2.2. O mínimo é **4,5:1** para texto normal, **3:1** para texto grande (24px, ou 19px em negrito) e **3:1** para bordas, ícones e estados de controles.

### Texto sobre os fundos

| Texto | Tema | sobre `marmore` | sobre `superficie` | sobre `superficie-funda` |
| --- | --- | --- | --- | --- |
| `tinta` | Calacatta | 14,34 | 15,51 | 12,79 |
| `tinta` | Portoro | 15,81 | 14,59 | 13,09 |
| `tinta-suave` | Calacatta | 6,30 | 6,81 | 5,62 |
| `tinta-suave` | Portoro | 9,15 | 8,44 | 7,58 |
| `ouro-texto` | Calacatta | 5,53 | 5,98 | 4,94 |
| `ouro-texto` | Portoro | 10,90 | 10,06 | 9,03 |
| `renda` | Calacatta | 6,05 | 6,54 | 5,39 |
| `renda` | Portoro | 9,42 | 8,69 | 7,80 |
| `gasto` | Calacatta | 5,65 | 6,11 | 5,04 |
| `gasto` | Portoro | 8,16 | 7,53 | 6,76 |
| `alerta` | Calacatta | 5,30 | 5,73 | 4,73 |
| `alerta` | Portoro | 11,06 | 10,21 | 9,17 |

### Pares de preenchimento

| Par | Calacatta | Portoro |
| --- | --- | --- |
| `sobre-primario` sobre `primario` | 9,47 | 8,99 |
| `sobre-primario` sobre `primario-hover` | 11,58 | 10,56 |
| `sobre-ouro` sobre `ouro` | 6,10 | 8,99 |
| `renda` sobre `renda-fundo` | 5,51 | 7,21 |
| `gasto` sobre `gasto-fundo` | 5,01 | 6,54 |
| `marmore` sobre `mogno` (avatar no claro) | 9,06 | não use (2,69) |
| `tinta` sobre `ouro` | 6,10 | **não use (1,70)** |

No Portoro, texto sobre ouro usa sempre `sobre-ouro`, e o avatar troca para fundo `ouro` com `sobre-ouro`.

### Bordas e elementos gráficos (mínimo 3:1)

| Elemento | Tema | sobre `marmore` | sobre `superficie` | sobre `superficie-funda` |
| --- | --- | --- | --- | --- |
| `borda` | Calacatta | 3,71 | 4,01 | 3,31 |
| `borda` | Portoro | 4,42 | 4,08 | 3,66 |
| `foco` | Calacatta | 5,53 | 5,98 | 4,94 |
| `foco` | Portoro | 10,90 | 10,06 | 9,03 |
| `ouro` | Calacatta | **2,35** | **2,54** | **2,10** |
| `ouro` | Portoro | 9,28 | 8,56 | 7,68 |

No Calacatta, `ouro` fica abaixo de 3:1 sobre os fundos claros. Por isso ele nunca carrega sozinho uma informação ou um estado:

- **Chip selecionado:** além do fundo `ouro`, o ícone da categoria vira um `check` (6,10:1 sobre o ouro).
- **Barra de progresso:** a frase logo abaixo diz o mesmo em palavras ("Você usou 70% do que entrou este mês."); a barra é decorativa.
- **Linha de projeção:** vem com o rótulo "Projeção" em `ouro-texto` e com a legenda.
- **Veio de ouro, louros, moedas:** são decorativos (`aria-hidden`).

### Texto sobre o mármore com véu

Pior caso medido sobre as texturas cobertas pelo `veu`:

| Texto | Calacatta + véu | Portoro + véu |
| --- | --- | --- |
| `tinta` | 13,02 | 10,19 |
| `tinta-suave` | 5,72 | 5,90 |
| `ouro-texto` | 5,02 | 7,03 |
| `renda` | 5,49 | 6,07 |
| `gasto` | 5,13 | 5,26 |

Sem o véu, os veios da textura derrubam o contraste em pontos imprevisíveis. Por isso a regra é absoluta: **texto nunca fica direto sobre a textura.**

## Regras de uso

### Fundo e hierarquia

- Página em `marmore`. Cartões em `superficie` com `sombra-cartao` e `radius-lg`. Campos e trilhas em `superficie-funda`.
- A hierarquia vem de espaço e tipografia, não de cor. Não use cores de fundo diferentes para separar seções.
- `veio` só em linhas de 1px entre itens de lista e no topo de divisões internas de cartão.

### Ouro

- `ouro` é brilho, não texto. Para texto dourado, use `ouro-texto`; sobre fundo ouro, use `sobre-ouro`.
- Pouco ouro vale mais: em uma tela típica do painel, o ouro aparece na moeda do logo, na barra de progresso e em no máximo um ou dois destaques.
- `folha-de-ouro` só em moedas e selos de momentos especiais. Nunca atrás de texto, nunca em botões, nunca em áreas grandes.

### Ação principal

- `primario` só no botão da ação mais importante da tela. Uma por tela.
- No Calacatta, o primário é mogno (sóbrio); no Portoro, é ouro (o único ponto brilhante da tela escura).
- Não use `mogno` nem `ouro` como fundo de outros botões para "parecerem importantes".

### Dinheiro

- Renda sempre em `renda` com `+`; gasto sempre em `gasto` com `−` (sinal de menos U+2212).
- Saldo positivo fica em `tinta` (é o normal, não precisa comemorar com cor). Saldo negativo fica em `gasto`, com "Faltou" no lugar de "Sobrou".
- As categorias **não têm cores próprias**: todas usam o mesmo ícone neutro sobre `superficie-funda` (ou `renda-fundo`, se for renda). Uma paleta de arco-íris deixaria a tela agitada e confundiria com renda e gasto.

### Erros de formulário

O sistema não tem uma cor de erro separada, de propósito: erro é uma instrução, não um alarme. E não usa `gasto` para erro, porque no formulário de lançamento o valor já aparece em `gasto` quando é um gasto: a cor de erro precisa ser outra.

- O campo com erro ganha borda de 2px em `alerta` e `aria-invalid="true"`.
- A mensagem fica logo abaixo do campo, em `tinta`, com o ícone `triangle-alert` em `alerta` antes do texto.
- A mensagem diz o que fazer: "Digite um valor maior que zero."

### Estados de interação

| Estado | Regra |
| --- | --- |
| Hover | Botões secundários, fantasmas, chips e linhas ganham fundo `superficie-funda`. O primário vai para `primario-hover`. |
| Pressionado | Igual ao hover. Sem escurecer além disso, sem "afundar". |
| Foco | Anel de 2px em `foco`, afastado 2px. Nunca remova sem substituir. |
| Selecionado | Chip: fundo `ouro`, texto `sobre-ouro`, ícone `check`. Alternador: pílula `superficie` com borda `borda`, sombra e texto em `gasto`/`renda`. |
| Desabilitado | Opacidade 0,45 e `cursor: not-allowed`. Prefira não desabilitar: deixe clicar e explique o que falta. |
| Em andamento | "Salvando…": o botão **não** fica esmaecido (com 0,45 o texto cairia para cerca de 2,3:1). Mantém as cores, ganha `aria-busy="true"` e ignora novos cliques. |

## O que evitar

- Criar cores novas "só para esta tela". Se faltar uma cor, proponha um token (veja [Tokens](14-tokens.md#como-propor-um-token-novo)).
- Usar opacidade para criar tons de texto (`tinta` a 60%): o contraste fica imprevisível. Use `tinta-suave`.
- Usar verde para dinheiro que entra e vermelho para dinheiro que sai.
- Colocar texto sobre `ouro` no Portoro com `tinta` (1,70:1).
- Usar `brilho` como fundo parado, ou `folha-de-ouro` atrás de texto.
- Deixar o hexadecimal no código em vez do token.
