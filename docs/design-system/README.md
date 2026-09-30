# Design system do Midas

> Versão 3.1 · setembro de 2026 · Protótipo visual: [Midas Design System](https://claude.ai/artifact/S92PKRq1pybfHpSttekfe4)

O design system do Midas junta **mármore, ouro e mogno** a uma interface calma, de números grandes e textos simples. A ideia vem do rei Midas, mas ao contrário do mito: aqui o toque de ouro é o **controle** que a pessoa ganha sobre o próprio dinheiro, sem cobiça e sem pressa.

Estes documentos são a fonte da verdade para quem desenha ou programa o Midas. Quando o protótipo e um documento discordarem, **vale o documento**: várias decisões foram ajustadas aqui depois de revisões de acessibilidade (veja o [Histórico](#histórico)).

## Por onde começar

| Se você vai... | Leia primeiro |
| --- | --- |
| Entender o espírito do Midas | [Princípios](01-principios.md) e [Marca](02-marca.md) |
| Programar uma tela | [Tokens](14-tokens.md), [Padrões de tela](17-padroes-de-tela.md) e os [componentes](componentes/README.md) |
| Escrever qualquer texto | [Conteúdo e tom](11-conteudo-e-tom.md) |
| Revisar uma entrega | [Acessibilidade](12-acessibilidade.md) e o [checklist de tela nova](17-padroes-de-tela.md#checklist-de-uma-tela-nova) |
| Mexer em dados pessoais | [Privacidade na interface](16-privacidade-na-interface.md) e o [CLAUDE.md](../../CLAUDE.md#lgpd-e-o-plugin-lgpd-skills) |

## Mapa

### Fundamentos

| # | Página | Resumo |
| --- | --- | --- |
| 01 | [Princípios](01-principios.md) | Os princípios de design e como decidir quando eles entram em conflito. |
| 02 | [Marca](02-marca.md) | Nome, história, personalidade, promessa e os símbolos da marca. |
| 03 | [Logo](03-logo.md) | Logotipo, símbolo, ícone do app, favicon e selo: geometria, versões, área de proteção e usos proibidos. |
| 04 | [Cores](04-cores.md) | Paleta dos dois temas, papéis de cada cor, contrastes medidos e combinações permitidas. |
| 05 | [Tipografia](05-tipografia.md) | Midas Display, Cormorant Garamond e Atkinson Hyperlegible Next: escala, números e regras. |
| 06 | [Espaço e forma](06-espaco-e-forma.md) | Grade de 4px, espaços, cantos, sombra, alvos de toque e layout. |
| 07 | [Mármore e texturas](07-marmore-e-texturas.md) | Calacatta e Portoro: onde a textura aparece e onde não. |
| 08 | [Ornamentos](08-ornamentos.md) | Veio de ouro, louros, coluna jônica, acento itálico e folha de ouro. |
| 09 | [Iconografia](09-iconografia.md) | Lucide: tamanhos, traço, lista de ícones do app. |
| 10 | [Movimento](10-movimento.md) | O toque de ouro, o selo que assenta e o que nunca se mexe. |

### Linguagem e acesso

| # | Página | Resumo |
| --- | --- | --- |
| 11 | [Conteúdo e tom](11-conteudo-e-tom.md) | Voz, vocabulário, formatos de dinheiro e datas, mensagens prontas. |
| 12 | [Acessibilidade](12-acessibilidade.md) | WCAG 2.2 AA como piso, o que vamos além e o checklist. |
| 13 | [Gráficos e dados](13-graficos-e-dados.md) | Títulos-conclusão, projeção, eixos, tabela alternativa. |

### Implementação e produto

| # | Página | Resumo |
| --- | --- | --- |
| 14 | [Tokens](14-tokens.md) | Todos os tokens e o `globals.css` pronto para Tailwind v4. Dados em [tokens.json](tokens.json). |
| 15 | [Categorias](15-categorias.md) | Categorias prontas de gasto e renda, ícones, limites e modelo de dados. |
| 16 | [Privacidade na interface](16-privacidade-na-interface.md) | Como a LGPD aparece nas telas: cadastro, senha, "Seus dados", apagar a conta. |
| 17 | [Padrões de tela](17-padroes-de-tela.md) | Mapa de rotas, navegação e o desenho de cada tela principal. |
| — | [Componentes](componentes/README.md) | 14 componentes com anatomia, estados, código e acessibilidade. |

## Regras de ouro

1. **Uma pergunta por tela, respondida com um número grande.** "Quanto sobrou?" vem antes de tudo.
2. **Renda e gasto nunca dependem só da cor.** Sempre sinal (+ ou −), ícone e palavra. Renda em azul-petróleo (`renda`), gasto em terracota (`gasto`); nada de verde e vermelho.
3. **Números nunca em Marcellus.** Os algarismos da Marcellus parecem letras; valores usam `classica` (Cormorant Garamond) ou a Midas Display, que já troca os dígitos.
4. **Ouro não é cor de texto.** Texto dourado usa `ouro-texto`; texto sobre ouro usa `sobre-ouro`.
5. **Um mármore por tela.** A textura aparece numa superfície de destaque; o resto é cor lisa.
6. **Um acento itálico dourado por título**, no máximo.
7. **O toque de ouro é só para salvar um lançamento novo.** Nenhuma outra ação comemora.
8. **Texto do corpo com 17px ou mais**, alvos de 44px ou mais, contraste AA nos dois temas.
9. **Português simples.** "Sobrou", "Entrou", "Saiu"; nunca "saldo líquido" ou "fluxo de caixa".
10. **Pedir só o necessário.** E-mail e senha. Nada de CPF, RG, telefone ou banco.

## Arquivos da marca

Ficam em [`public/`](../../public), servidos pelo próprio app:

| Pasta | Arquivos |
| --- | --- |
| `public/marca/` | `midas-logo.svg`, `midas-logo-noite.svg`, `midas-logo-mono.svg`, `midas-simbolo.svg`, `midas-simbolo-noite.svg`, `midas-icone.svg`, `midas-icone-app.png`, `midas-favicon.svg`, `midas-selo.svg`, `midas-selo-ouro.svg`, `midas-selo-noite.svg`, `midas-selo-contorno.svg` |
| `public/ornamentos/` | `louros.svg`, `louros-noite.svg`, `coluna.svg`, `coluna-noite.svg` |
| `public/texturas/` | `marmore-calacatta.webp`, `marmore-portoro.webp` |
| `public/fontes/` | A criar junto com o app: os arquivos da Midas Display (veja [Tipografia](05-tipografia.md)). |

Os arquivos trazem metadados de procedência (C2PA). Não os remova ao otimizar os SVGs.

## Como mudar o design system

1. Proponha a mudança na página certa, com o motivo.
2. Atualize [tokens.json](tokens.json) e o `globals.css` de [14-tokens.md](14-tokens.md) juntos, se for um token.
3. Refaça as contas de contraste dos dois temas quando mexer em cor.
4. Registre no [Histórico](#histórico).

## Histórico

### 3.2 (30 de setembro de 2026): telas de entrada

- Entrada, cadastro e recuperação de senha ficam sempre no tema claro (Calacatta): o Portoro com mármore ficou pesado atrás do cartão.
- Cadastro pede nome (obrigatório, pode ser apelido), e-mail e senha, nessa ordem.
- Senha com no mínimo 8 caracteres, e não mais 15; senhas comuns e vazadas continuam recusadas.
- O cartão de entrada cabe sem rolagem a partir de 390×844 e 1366×768, com ajudas de uma linha e o aviso de privacidade como linha simples com ícone.
- O tema claro é o padrão do app, também sem JavaScript; "Escuro" e "Automático" são escolhas em Configurações.
- Estrutura do app no celular: topo com logo e avatar (menu da conta com Seus dados, Configurações e Sair) e navegação inferior fixa. Cada item ocupa a largura do próprio rótulo, para nenhum ser cortado; abaixo de 360px o rótulo cai para peso 400, mantendo 14px. A partir de 1024px, a navegação vai para o topo.
- O menu da conta é um botão que abre uma lista de links (padrão *disclosure*), sem `role="menu"`: Esc e clique fora fecham e o foco volta ao avatar. Evita uma dependência a mais para quatro itens.
- Links de navegação não usam o estilo de `md-link` (dourado sublinhado): ficam em `tinta-suave`, e o atual em `tinta` com a barra de ouro.

### 3.1 (setembro de 2026): documentação

Ajustes feitos ao documentar, que valem sobre o protótipo:

- Chip de categoria selecionado troca o ícone por `check`, porque o `ouro` tem contraste abaixo de 3:1 sobre as superfícies claras.
- Pílula selecionada do alternador Gasto/Renda ganha borda de 1px em `borda`.
- Escolhas únicas (categoria, tipo) usam rádios nativos dentro de `fieldset` e `legend`.
- O selo não gira sem parar: o aro assenta uma vez, de −20° a 0° em 5s (`duracao-selo`), para cumprir a WCAG 2.2.2.
- Gráficos sem animação de entrada; eixo em forma compacta ("4 mil"); textos dos eixos com 14px.
- Erro de formulário com borda de 2px em `alerta` e ícone `triangle-alert`; a mensagem fica em `tinta`.
- Botão em carregamento ("Salvando…") não fica apagado e usa `aria-busy`.
- Um mármore por tela: nos dias da conquista do mês, o cartão de conquista leva o mármore e o de saldo fica liso.
- Senha com no mínimo 8 caracteres, sem regras de composição e sem campo de confirmação (NIST SP 800-63B-4).
- "13º" com o indicador ordinal, ícone `utensils` para Restaurante, aviso "Anotado" sem botão.
- Botão fechar com 48 × 48px; botão "Mostrar senha" sem `aria-pressed`.

### 3.0 (setembro de 2026): personalidade e logo

Logo com a moeda como pingo do i, símbolo M com moeda e coroa, selo de moeda antiga, texturas Calacatta e Portoro, veio de ouro, louros, coluna jônica, acento itálico dourado e o toque de ouro.

### 1.0 (setembro de 2026): primeira versão

Paleta de mármore, ouro e mogno, temas claro e escuro, tipografia e componentes base.
