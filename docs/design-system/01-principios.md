# Princípios

O Midas existe para responder, sem esforço, uma pergunta que muita gente evita: **"como está o meu dinheiro?"**. Cada decisão de design parte daí. Quando um caso não estiver coberto por esta documentação, volte a estes princípios: eles decidem.

## Para quem desenhamos

O Midas é para qualquer pessoa, mas é desenhado a partir de quem costuma ficar de fora dos apps de finanças. Se funciona para essas pessoas, funciona para todo mundo.

| Pessoa de referência | Situação | O que ela precisa do Midas |
| --- | --- | --- |
| **Cida**, 64 anos, aposentada | Anota os gastos num caderno. Usa o celular com a fonte no tamanho máximo. Tem medo de "apertar o botão errado". | Letras grandes, poucos passos, nenhuma palavra técnica, a certeza de que nada se perde e de que dá para corrigir. |
| **Rafael**, 27 anos, CLT | Recebe salário no dia 5 e vale-refeição. Quer saber quanto sobra e planejar as férias. | Registrar gastos em segundos, ver o mês de relance e usar as calculadoras de férias e 13º para planejar o ano. |
| **Joana**, 38 anos, autônoma | Renda variável: cada semana é diferente. | Anotar ganhos do dia rapidamente e ver uma projeção honesta dos próximos meses. |
| **Beto**, 45 anos, baixa visão | Usa zoom de 200% e, às vezes, leitor de tela. | Contraste alto, textos que não quebram com zoom, tudo anunciado corretamente pelo leitor de tela, nada que dependa só de cor. |

As pessoas acima são ilustrativas: servem para testar decisões ("a Cida entenderia este rótulo?"), não descrevem pessoas reais.

## Os dez princípios

### 1. Clareza antes do ornamento

O visual vem da Antiguidade clássica (mármore, ouro, marrom, letras gravadas em pedra), mas a informação vem primeiro. Ornamento que atrapalha a leitura sai.

- **Na interface:** texto sempre sobre `superficie` ou sobre o mármore coberto pelo `veu`; nunca direto sobre a textura. Números grandes em fonte legível, nunca na Marcellus pura.
- **Faça:** um cartão de saldo com o número grande e duas linhas de apoio.
- **Evite:** um título bonito que a pessoa precisa ler duas vezes para entender.

### 2. Uma pergunta por tela

Cada tela responde uma pergunta simples, e o título diz qual é, ou já responde:

| Tela | Pergunta |
| --- | --- |
| Painel | "Quanto sobrou este mês?" |
| Adicionar gasto | "Quanto foi e com o quê?" |
| Lançamentos | "Onde eu gastei?" |
| Planejamento | "Como vão ficar os próximos meses?" |
| Calculadoras | "Quanto vou receber de férias, 13º ou rescisão?" |
| Seus dados | "O que o Midas guarda sobre mim e como eu apago?" |

Se uma tela precisa responder duas perguntas, ela vira duas telas ou uma tela com duas seções bem separadas, cada uma com seu título.

### 3. Um passo de cada vez

Formulários pedem uma coisa por vez, na ordem em que a pessoa pensa. No lançamento: primeiro o valor, depois a categoria. Descrição e data são opcionais e já vêm preenchidas com o mais provável ("hoje"). As calculadoras perguntam uma coisa por tela, com o progresso visível ("Passo 2 de 5").

### 4. Calma, nunca bronca

Dinheiro é assunto sensível. O Midas fala como alguém calmo e gentil que entende do assunto: nunca julga, nunca assusta, nunca faz piada com o aperto de ninguém.

- Mês no vermelho é dito com fatos e uma saída: "Setembro fechou com R$ 210 a menos. Quer ver onde dá para ajustar?"
- Não existe tela vermelha, alarme, contagem regressiva ou mensagem de culpa.
- Notícia ruim não leva acento dourado no título. O itálico dourado é para momentos bons ou neutros.

### 5. Personalidade em poucos lugares, sempre os mesmos

A personalidade da marca aparece em seis elementos, sempre nos mesmos lugares: o logo, o mármore, o itálico dourado, o veio de ouro, os louros da conquista e o toque de ouro ao salvar. Todo o resto fica calmo. Isso faz os momentos especiais parecerem especiais. Veja o mapa completo em [Marca](02-marca.md#elementos-de-assinatura).

### 6. Nada depende só de cor

Renda e gasto têm cor (`renda` azul-petróleo, `gasto` terracota), mas também têm sinal (+ ou −), ícone e palavra ("Entrou", "Saiu"). Avisos têm ícone e frase. Estados selecionados têm forma, não só tom. Quem não enxerga cores, quem imprime em preto e branco e quem usa leitor de tela recebe a mesma informação.

### 7. Privacidade que se vê

O Midas pede o mínimo (e-mail e senha), não pede CPF, RG, telefone nem acesso ao banco, e diz isso na tela. A promessa "Seus dados são só seus" aparece na entrada, no cadastro e em "Seus dados", onde a pessoa baixa ou apaga tudo em poucos toques. Veja [Privacidade na interface](16-privacidade-na-interface.md).

### 8. Acessível desde o primeiro rascunho

Acessibilidade não é uma etapa no fim: é critério de pronto. Contraste AA nos dois temas, alvos de toque de 44 a 48px, texto que cresce com a configuração da pessoa, teclado completo, leitor de tela, movimento reduzido. Veja [Acessibilidade](12-acessibilidade.md).

### 9. Dinheiro exato

Valores são guardados em centavos inteiros e mostrados sempre do mesmo jeito: `+ R$ 5.400,00`, `− R$ 127,90`. Listas mostram centavos. Resumos em frase podem arredondar ao real ("R$ 310 a mais"), e o número exato continua disponível um toque adiante. Projeções são chamadas de projeção e estimativas de estimativa, sempre.

### 10. Sem truques

Nada de padrões enganosos: nenhuma caixa pré-marcada, nenhum botão "Cancelar" disfarçado, nenhuma sequência de dias para a pessoa "não perder", nenhuma notificação para gerar culpa, nenhum rastreador. Apagar a conta é tão fácil quanto criá-la.

## Quando os princípios entram em conflito

Siga esta ordem de prioridade:

1. **Segurança e privacidade** da pessoa.
2. **Acessibilidade.**
3. **Clareza.**
4. **Consistência** com o resto do app.
5. **Personalidade** da marca.

Exemplo: o selo girando na tela de entrada é personalidade; com `prefers-reduced-motion`, ele para (acessibilidade vence). O mármore é personalidade; atrás de uma lista, ele atrapalha a leitura (clareza vence), então não vai lá.

## Checklist de revisão de uma tela

Antes de considerar uma tela pronta, confira:

- [ ] O título diz a pergunta da tela, ou já a responde.
- [ ] Existe no máximo uma ação principal (`primario`), e ela é a mais importante.
- [ ] Todo texto passa de 4,5:1 de contraste nos dois temas (3:1 para bordas e ícones de controle).
- [ ] Nenhuma informação depende só de cor: há sinal, ícone ou palavra.
- [ ] Todo alvo de toque tem pelo menos 44px (48px para botões e linhas).
- [ ] Valores seguem o formato `+ R$ 1.234,56` / `− R$ 1.234,56`, com o sinal de menos − e sem quebra de linha.
- [ ] Os textos seguem o [tom de voz](11-conteudo-e-tom.md): "você", frases curtas, sem jargão, botões com verbo.
- [ ] No máximo uma superfície com mármore, um veio de ouro e um acento dourado por título.
- [ ] A tela funciona com zoom de 200% e a 320px de largura, sem rolagem horizontal.
- [ ] Dá para usar tudo só com o teclado, com o anel de foco sempre visível.
- [ ] O leitor de tela anuncia títulos, rótulos, valores com "Entrou"/"Saiu" e mudanças de estado.
- [ ] Com `prefers-reduced-motion`, nada se move e nada se perde.
- [ ] Estados vazio, carregando e erro foram desenhados, não só o caso feliz.
- [ ] A tela não pede nenhum dado pessoal além do necessário para a tarefa.
- [ ] Em notícia ruim, o texto traz o fato e uma saída, sem bronca e sem acento dourado.
