# Acessibilidade

O Midas é para qualquer pessoa, e isso inclui quem enxerga pouco, quem não enxerga cores, quem usa leitor de tela, quem tem tremor nas mãos, quem se confunde com tecnologia e quem só tem uma mão livre no ônibus. Acessibilidade é **critério de pronto**: uma tela que não passa nesta página não está pronta.

## Meta

- **WCAG 2.2, nível AA**, em todas as telas, nos dois temas.
- Onde custa pouco, vamos além: alvos de 44 a 48px (o AAA pede 44), textos com contraste acima de 7:1 na maior parte do tema escuro, linguagem simples.
- Contexto legal: a Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63) exige acessibilidade em sites mantidos por empresas com sede ou representação no país. Mesmo como projeto open source, o Midas segue a mesma régua.

## Perceber

### Contraste

| Elemento | Mínimo | No Midas |
| --- | --- | --- |
| Texto normal | 4,5:1 | 4,73:1 no pior caso (`alerta` sobre `superficie-funda`, claro); a maioria acima de 5,5:1 |
| Texto grande (24px, ou 19px negrito) | 3:1 | Todos acima de 4,5:1 |
| Bordas de controle, ícones, anel de foco | 3:1 | `borda` de 3,31 a 4,42:1; `foco` de 4,94 a 10,90:1 |
| Texto sobre o mármore | 4,5:1 | Só com o `veu` (5,02:1 no pior caso) |

A tabela completa está em [Cores](04-cores.md#pares-de-contraste). Ao criar qualquer combinação nova, meça antes de usar.

### Cor nunca sozinha

| Informação | Além da cor |
| --- | --- |
| Renda ou gasto | Sinal + ou −, palavra "Entrou"/"Saiu" (visível ou escondida), ícone de seta |
| Categoria selecionada | Ícone `check` no lugar do ícone da categoria |
| Tipo selecionado (Gasto/Renda) | Pílula com borda e sombra; ícone − ou + |
| Aviso de alerta | Ícone `triangle-alert` + frase em negrito |
| Erro de campo | Borda de 2px + ícone + mensagem em texto |
| Meses projetados no gráfico | Contorno tracejado + rótulo "Projeção" + legenda |
| Saldo negativo | Palavra "Faltou" + sinal − |

Teste: veja a tela em escala de cinza. Tudo precisa continuar compreensível.

### Texto que cresce

- Tamanhos de fonte e alturas mínimas em `rem`, para acompanhar o tamanho de fonte escolhido no aparelho ou no navegador.
- Nada de `maximum-scale=1` ou `user-scalable=no` na meta viewport: a pessoa sempre pode dar zoom.
- A tela funciona com **zoom de 200%** e com **320px de largura** (WCAG 1.4.10), sem rolagem horizontal: colunas viram uma, textos quebram, valores de lista encolhem a descrição em vez de estourar.
- Espaçamento de texto aumentado pela pessoa (entrelinha 1,5, espaço entre letras 0,12em, entre palavras 0,16em) não pode cortar nem sobrepor conteúdo (WCAG 1.4.12): evite alturas fixas em caixas com texto.

### Temas e modos especiais

- Os dois temas (Calacatta e Portoro) passam nos mesmos critérios.
- **Alto contraste** (`forced-colors: active`): texturas saem, ornamentos podem sumir, bordas e anéis de foco usam as cores do sistema (`CanvasText`, `Highlight`). Não use `forced-color-adjust: none` sem motivo.
- **Movimento reduzido:** veja [Movimento](10-movimento.md#movimento-reduzido).

## Operar

### Teclado

- Tudo que se faz com o dedo se faz com o teclado, na ordem visual da tela.
- **Anel de foco sempre visível:** 2px sólido em `foco`, afastado 2px. Use `:focus-visible` (o anel aparece no teclado, não no toque). Nunca `outline: none` sem substituto.
- Grupos de escolha única (Gasto/Renda, categorias) são rádios nativos: `Tab` entra no grupo, as setas trocam a opção.
- `Esc` fecha diálogos, folhas e menus, e o foco volta para o elemento que os abriu.
- Um link "Pular para o conteúdo" é o primeiro item focável de cada tela e leva ao `<main>`.
- Com a navegação inferior fixa no celular, dê `scroll-padding-bottom` à página, para o elemento focado nunca ficar escondido atrás dela (WCAG 2.4.11).

### Alvos

| Alvo | Tamanho |
| --- | --- |
| Botões, linhas clicáveis | 48px de altura (linhas de lançamento, 64px) |
| Chips, alternador, setas de mês, avatar | 44 × 44px |
| Botão fechar | 48 × 48px |
| Espaço entre alvos | 8px ou mais |

Nenhuma ação depende de arrastar (WCAG 2.5.7): se um dia houver reordenação de categorias, ela também terá botões "Subir" e "Descer".

### Tempo

- O aviso "Anotado" some em 4 segundos e, por isso, **não tem botão**. Nada que a pessoa precise fazer depende de um tempo curto.
- A sessão é longa e se renova com o uso. Ações sensíveis (apagar a conta, trocar a senha, baixar os dados) pedem a senha de novo, e o que a pessoa estava digitando não se perde. Veja [Privacidade na interface](16-privacidade-na-interface.md#sessão-e-segurança).
- O único movimento automático, o assentamento do selo, dura 5 segundos e para sozinho (WCAG 2.2.2).

## Entender

### Linguagem e estrutura

- Linguagem simples, frases curtas, as palavras da pessoa ([Conteúdo e tom](11-conteudo-e-tom.md)).
- Cada tela tem **um** `<h1>` que diz do que ela trata; os títulos seguem a ordem (`h1` → `h2` → `h3`) sem pular níveis.
- O título da aba do navegador diz a tela e o app: "Lançamentos · Midas", "Adicionar gasto · Midas".
- O `<html lang="pt-BR">` está sempre presente, para o leitor de tela usar a pronúncia certa.
- Navegação, nomes e ícones são consistentes em todas as telas (WCAG 3.2.3 e 3.2.4). A ajuda fica sempre no mesmo lugar, no menu da conta (WCAG 3.2.6).

### Formulários

- **Rótulo visível e permanente** em todo campo. Placeholder não é rótulo.
- Um passo por vez: primeiro o valor, depois a categoria; o resto é opcional e já vem preenchido com o mais provável.
- `autocomplete` correto (`email`, `current-password`, `new-password`), `inputmode="decimal"` no valor, `type="email"` no e-mail.
- Colar é sempre permitido, inclusive na senha (WCAG 3.3.8): gerenciadores de senha precisam funcionar.
- Sem campo "confirme a senha" nem "confirme o e-mail" (WCAG 3.3.7): no lugar, o botão "Mostrar" deixa conferir o que foi digitado.
- Sem CAPTCHA de imagens ou quebra-cabeças. A proteção contra robôs fica no servidor (limite de tentativas).
- Erros: `aria-invalid="true"` no campo, mensagem ligada por `aria-describedby`, foco levado ao primeiro campo com erro ao enviar, texto que diz o que fazer.
- Ações destrutivas pedem uma segunda confirmação na própria tela, dizendo o que será apagado.

## Robustez: semântica e leitor de tela

### Estrutura da página

```html
<body>
  <a class="md-sr md-sr-focavel" href="#conteudo">Pular para o conteúdo</a>
  <header>…logo, mês, conta…</header>
  <main id="conteudo" tabindex="-1">…</main>
  <nav aria-label="Principal">…Início, Lançamentos, Planejamento, Calculadoras…</nav>
</body>
```

- Use o elemento HTML certo antes de ARIA: `<button>` para ações, `<a href>` para navegação, `<fieldset>` + `<legend>` para grupos, `<dl>` para pares rótulo-valor, `<ul>` para listas, `<table>` para tabelas de dados.
- ARIA só onde o HTML não basta, e sempre testada.

### O que o leitor de tela precisa anunciar

| Situação | Como |
| --- | --- |
| Valor de um lançamento | "Saiu R$ 127,90": texto escondido "Saiu"/"Entrou" e sinal visual com `aria-hidden` |
| Troca de mês | Nome do mês numa região `aria-live="polite"` |
| Lançamento salvo | Aviso "Anotado: …" numa região `role="status"` que já existe na página (troque o texto, não crie a região na hora) |
| Erro ao enviar | Foco no primeiro campo com erro; a mensagem é lida junto com o rótulo |
| Carregando | `aria-busy="true"` na região que carrega; texto escondido "Carregando lançamentos" |
| Troca de rota | O anunciador de rotas do Next.js lê o título da nova página; o foco vai para o `<h1>` ou para o `<main>` |
| Gráfico | Título com a conclusão, `role="img"` com `aria-label` que resume os dados e uma tabela alternativa ("Ver em tabela") |
| Ornamentos, texturas | Nada: `aria-hidden="true"` |

### Texto escondido

```css
.md-sr {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
/* versão que aparece ao receber foco (link "Pular para o conteúdo") */
.md-sr-focavel:focus { position: static; width: auto; height: auto; clip: auto; }
```

No Tailwind, `sr-only` e `focus:not-sr-only` fazem o mesmo.

## Como testar

### Automático

- `eslint-plugin-jsx-a11y` (já vem na configuração de lint do Next.js) em todo commit.
- `@axe-core/playwright` nos testes de ponta a ponta de cada tela, nos dois temas: zero violações.
- Um teste de contraste que lê os tokens e confere os pares de [Cores](04-cores.md#pares-de-contraste), para que ninguém mude um hexadecimal sem perceber.

### Manual (a cada tela nova)

| Teste | Como |
| --- | --- |
| Só teclado | Desconecte o mouse. Faça a tarefa principal da tela do começo ao fim. |
| Leitor de tela | NVDA com Firefox ou Chrome (Windows), VoiceOver com Safari (iPhone e Mac), TalkBack com Chrome (Android). |
| Zoom | 200% no navegador e fonte máxima no celular. Nada cortado, nada sobreposto, sem rolagem horizontal. |
| Largura mínima | 320px. |
| Cores | Escala de cinza e simulação de daltonismo (DevTools do Chrome: *Rendering → Emulate vision deficiencies*). |
| Movimento | Ative "reduzir movimento" no sistema e repita a tarefa. |
| Alto contraste | Modo de contraste do Windows. |
| Pessoa real | Sempre que possível, peça a alguém com pouca familiaridade com tecnologia para fazer a tarefa sem ajuda. |

## Checklist de acessibilidade para cada PR

- [ ] Contraste conferido nos dois temas para toda cor nova.
- [ ] Nenhuma informação só por cor.
- [ ] Rótulos visíveis em todos os campos; `autocomplete` e `inputmode` certos.
- [ ] Alvos de 44px ou mais.
- [ ] Anel de foco visível e ordem de foco lógica.
- [ ] Valores com "Entrou"/"Saiu" para o leitor de tela.
- [ ] Mudanças de estado anunciadas (`role="status"`, `aria-live`).
- [ ] Funciona com zoom de 200%, a 320px e com movimento reduzido.
- [ ] axe sem violações.
