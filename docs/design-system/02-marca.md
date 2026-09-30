# Marca

## O nome e a história

Na lenda grega, tudo o que o rei Midas tocava virava ouro, e o dom quase o matou de fome: ouro não se come. O Midas pega o outro lado da história. Aqui, o ouro não é acumular: **o ouro é saber para onde vai cada real**, sem ganância e sem bronca.

O símbolo conta essa ideia sem palavras: um **M** que segura uma **moeda de ouro** no seu vale. A moeda sobe acima das pontas do M e, junto com elas, forma uma **coroa**. É o controle (o M) segurando o valor (a moeda), e o resultado é se sentir dono do próprio dinheiro (a coroa).

## Promessa

> **Suas finanças, seu controle.**

É a legenda do selo e a síntese da marca. Ela aparece gravada no aro do selo ("SUAS FINANÇAS · SEU CONTROLE") e, em texto corrido, com pontuação normal: "Suas finanças, seu controle."

A promessa se desdobra em três compromissos, que a interface precisa cumprir:

1. **Simples:** registrar um gasto leva segundos, e cada tela responde uma pergunta.
2. **Seu:** o Midas não pede CPF, não acessa o banco, não vende nem compartilha dados, e a pessoa baixa ou apaga tudo quando quiser.
3. **Tranquilo:** o app mostra fatos e caminhos, nunca culpa.

## Personalidade

| O Midas é | O Midas não é |
| --- | --- |
| **Calmo**: fala baixo, com frases curtas e sem pressa. | Apressado, alarmista, cheio de alertas. |
| **Gentil**: acolhe quem tem dificuldade e comemora sem exagero. | Infantil, bajulador, cheio de "Parabéns!!!". |
| **Clássico**: mármore, ouro, letras de inscrição romana. | Antiquado, rebuscado, difícil de ler. |
| **Confiável**: preciso nos números, honesto nas estimativas. | Burocrático, frio, cheio de letras miúdas. |
| **Discreto**: a personalidade aparece em poucos lugares. | Sem graça, genérico, "mais um app de planilha". |
| **Claro**: usa as palavras que a pessoa usa. | Técnico, cheio de jargão financeiro. |

## Referências visuais

O visual vem da Antiguidade clássica e do Renascimento: mármore, folha de ouro, madeira escura, moedas antigas, colunas, coroas de louros e letras gravadas em pedra. As referências que orientaram o sistema:

| Referência | O que aproveitamos |
| --- | --- |
| Sites de finanças com pintura clássica no destaque ("Smart Finance" e o site pictórico "Good Move") | O clima renascentista, o título serifado e grande, o contraste entre algo antigo e um produto moderno. |
| Página de fintech escura com um único destaque vivo | O tema escuro com um só acento brilhante: no Midas, o ouro sobre o mármore Portoro. |
| Consultoria financeira em tons de verde | O tom sóbrio e confiável, com muito respiro. |
| Painel claro de finanças | Cartões limpos, hierarquia por espaço e tipografia, gráficos simples. |

## Elementos de assinatura

A personalidade da marca mora em seis elementos. Eles aparecem sempre nos mesmos lugares e em quantidade limitada; fora desses lugares, a interface é calma.

| Elemento | O que é | Onde aparece | Limite | Detalhes |
| --- | --- | --- | --- | --- |
| **Logo** | Nome "Midas" com a moeda de ouro no lugar do pingo do i; símbolo do M com a moeda. | Topo do app, entrada, ícone, favicon, materiais. | Um por tela. | [Logo](03-logo.md) |
| **Mármore** | Texturas Calacatta (claro) e Portoro (escuro) geradas para o Midas. | Fundo da entrada e do cadastro, cartão de saldo, conquista do mês. | Uma superfície por tela. | [Mármore e texturas](07-marmore-e-texturas.md) |
| **Itálico dourado** (`acento`) | Uma palavra ou expressão em Cormorant Garamond itálica, em `ouro-texto`, dentro de um título. | Títulos da saudação, entrada, estados vazios, conquista. | Um por título; nunca em notícia ruim. | [Tipografia](05-tipografia.md#acento-o-itálico-dourado) |
| **Veio de ouro** (`md-veio`) | Divisória ondulada dourada, como um veio no mármore. | Entre a saudação e o resumo; no cartão de entrada. | Um por tela. | [Ornamentos](08-ornamentos.md#veio-de-ouro) |
| **Louros** | Coroa de louros dourada em volta do valor guardado. | Só na conquista do mês, quando o mês fecha com sobra. | Um por tela, só nesse caso. | [Ornamentos](08-ornamentos.md#louros) |
| **Toque de ouro** | Onda dourada no botão, reflexo na linha nova e o aviso "Anotado". | Só ao salvar um lançamento. | É o único efeito comemorativo do app. | [Movimento](10-movimento.md#toque-de-ouro) |

Dois elementos de apoio completam o repertório: a **coluna jônica** (só em estados vazios de começo) e o **selo** (entrada, página "Sobre" e divulgação).

## Cores da marca

A marca se apoia em três materiais:

- **Mármore** (`marmore`, `superficie`): o fundo claro e quente de tudo. No escuro, o mármore Portoro, quase preto.
- **Ouro** (`ouro`, `ouro-texto`, `folha-de-ouro`): o brilho. Moedas, seleção, progresso, projeção, louros. Pouco e no lugar certo.
- **Mogno** (`mogno`): o marrom da madeira escura. Cor do nome no logo e da ação principal no tema claro.

Os valores, os pares de contraste e as regras de uso estão em [Cores](04-cores.md).

## Como escrever o nome

- Sempre **Midas**, com inicial maiúscula e o resto minúsculo. Nunca "MIDAS", "midas" ou "MiDaS" em texto corrido.
- O artigo é masculino: "o Midas", "no Midas", "do Midas". Exemplo: "O Midas não pede CPF."
- Não traduza nem abrevie o nome. Não use "Midas App" na interface; em lojas e no GitHub, "Midas: finanças pessoais" é aceitável como título descritivo.
- Em maiúsculas só onde a própria tipografia pede, como no aro do selo e nos sobretítulos (`md-eyebrow`), e sempre por CSS (`text-transform`), nunca digitado em maiúsculas.

## Capa e materiais de divulgação

A composição de capa do Midas (usada na capa do design system e indicada para o banner do README e a imagem de compartilhamento do repositório) segue esta receita:

- Fundo `marmore` (ou a textura Calacatta) com o nome "Midas" enorme à esquerda, em Marcellus, com a moeda de ouro no lugar do pingo do i, e a linha "Suas finanças, seu controle." embaixo em `sans` 14px `tinta-suave`.
- À direita, uma composição geométrica: um bloco `mogno` com o **V do monograma recortado no topo e a moeda de ouro apoiada nele**; ao lado, um bloco `tinta` e um bloco `ouro` empilhados, este último com quatro moedas deitadas (pílulas `mogno` de 16px de altura) como uma pilha de moedas.
- Espaços de 16px (`space-4`) entre os blocos; cantos retos, exceto as pílulas.
- Imagem de compartilhamento (GitHub/Open Graph): 1280 × 640px, com a mesma composição e margem de segurança de 40px em volta do texto.

## Onde a marca nunca vai

- Pilhas de notas, cifrões gigantes, fotos de banco de imagem com pessoas sorrindo para o celular.
- Promessas de enriquecer, "fique rico", "invista já".
- Gráficos de bolsa, velas, setas verdes e vermelhas de mercado.
- Emoji, confete, fogos, sons de caixa registradora.
- Gamificação que pressiona: sequências de dias, rankings, medalhas por frequência.
- Gírias do mercado financeiro ("aporte", "carteira", "rentabilizar") sem explicação.

## Tom de voz em uma frase

> Alguém calmo e gentil que entende de dinheiro e fala a sua língua.

Todas as regras de escrita estão em [Conteúdo e tom](11-conteudo-e-tom.md).
