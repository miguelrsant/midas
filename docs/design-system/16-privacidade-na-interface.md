# Privacidade na interface

A privacidade é parte da marca do Midas: **"Seus dados são só seus."** Esta página diz como a interface cumpre essa promessa e como ela traduz a LGPD (Lei 13.709/2018) em telas, textos e comportamentos. As decisões jurídicas (bases legais, registro das operações, relatório de impacto, política de privacidade) são feitas com o plugin `lgpd-skills`, conforme o [CLAUDE.md](../../CLAUDE.md#lgpd-e-o-plugin-lgpd-skills); aqui fica o lado de design.

> Esta página orienta o design. Não é aconselhamento jurídico.

## Os princípios da LGPD na tela

| Princípio (LGPD, art. 6º) | Como aparece no Midas |
| --- | --- |
| Finalidade e adequação | Cada dado pedido tem um motivo dito na tela: "Seu e-mail serve para entrar e recuperar a senha." |
| Necessidade | O cadastro pede só nome (ou apelido), e-mail e senha. Nada de CPF, RG, telefone, endereço, data de nascimento ou dados bancários. |
| Livre acesso | "Seus dados" mostra o que o Midas guarda e permite baixar tudo. |
| Qualidade dos dados | Todo lançamento pode ser corrigido com um toque na linha. |
| Transparência | Política de privacidade em linguagem simples, com data e versão, a um toque de qualquer tela. |
| Segurança e prevenção | Sessão protegida, senha forte sem regras chatas, confirmação de senha para ações sensíveis. |
| Não discriminação | Os dados não são usados para perfilar, pontuar ou oferecer produtos. |
| Responsabilização | O que o Midas faz com os dados está registrado em `.lgpd/` e é público no repositório. |

## O que o Midas guarda e o que não guarda

| Guarda | Para quê |
| --- | --- |
| E-mail | Entrar, recuperar a senha, avisos de segurança |
| Senha (só o resumo criptográfico, nunca a senha) | Entrar |
| Nome ou apelido | A saudação ("Bom dia, Miguel.") |
| Lançamentos: valor, tipo, categoria, data e descrição opcional | Mostrar o mês, os gráficos e a projeção |
| Respostas das calculadoras (salário, datas, tipo de saída) | Calcular e guardar as rendas previstas |
| Limites por categoria | Avisar quando estiver perto do limite |
| Preferência de tema | Fica só no aparelho |

| Não guarda, nunca | |
| --- | --- |
| CPF, RG, telefone, endereço, data de nascimento | |
| Dados de banco, cartão, senha de banco, acesso a contas | |
| Localização, contatos, fotos | |
| Rastreadores, pixels de anúncio, analytics de terceiros | |

**Atenção a dados sensíveis.** Lançamentos podem revelar mais do que dinheiro: a categoria Saúde e descrições como "consulta" ou "farmácia" podem indicar informações de saúde, que a LGPD trata como dado sensível (art. 5º, II). Por isso todo lançamento é tratado como confidencial: só a própria pessoa vê, nada é usado para outro fim e nada vai para registros de erro ou e-mails.

## A promessa na tela

O aviso de privacidade ([Notice](componentes/notice.md), ícone `shield-check`) fica **sempre visível** onde a pessoa decide confiar:

| Onde | Texto |
| --- | --- |
| Entrada e cadastro | "Sem CPF e sem acesso ao seu banco. Seus dados são só seus." |
| "Seus dados" | "**Seus dados são só seus.** O Midas não pede CPF nem acessa seu banco. Você pode baixar ou apagar tudo quando quiser." |
| Página "Sobre" | Mesmo texto, com link para o código-fonte: "O código do Midas é aberto. Qualquer pessoa pode conferir o que ele faz." |

## Cadastro

- Campos, nesta ordem: **nome** (pode ser um apelido), **e-mail** e **senha**. Mais nada.
- Ao lado de cada campo, o motivo em `caption`: "Seu e-mail serve para entrar e recuperar a senha. Não mandamos propaganda."
- Aceite dos termos e da política numa caixa **desmarcada**, com os links abertos na mesma aba e voltando ao formulário sem perder o que foi digitado: "Li e aceito os [Termos de uso] e a [Política de privacidade]."
- Nenhuma outra caixa de marcar. Se um dia existir algo opcional (por exemplo, receber novidades por e-mail), é uma caixa separada, desmarcada, que não impede o cadastro.
- Confirmação do e-mail por link antes do primeiro uso. A tela diz: "Enviamos um link para [e-mail]. Abra para confirmar sua conta."
- Se o e-mail já tiver conta, a tela mostra a mesma mensagem (e o e-mail enviado explica que a conta já existe), para não revelar quem usa o Midas.

## Senha

Regras alinhadas à recomendação do NIST (SP 800-63B-4) para senha como único fator:

| Regra | Na tela |
| --- | --- |
| Mínimo de **8 caracteres** (piso do NIST; decisão do projeto), máximo de 128 | Contador em `caption`: "5 de 8 caracteres" |
| Sem exigência de maiúscula, número ou símbolo | Dica: "Uma frase fácil de lembrar funciona bem, como 'café com leite na varanda'." |
| Recusa senhas comuns e vazadas | "Essa senha aparece em listas de senhas vazadas. Escolha outra." |
| Espaços e acentos permitidos | Nada a dizer: simplesmente funciona |
| Colar permitido; gerenciadores de senha funcionam | `autocomplete="new-password"` no cadastro, `current-password` na entrada |
| Sem troca obrigatória periódica | Só se houver suspeita de vazamento |
| Sem "confirme a senha" | O botão "Mostrar" deixa conferir o que foi digitado |

A verificação contra senhas vazadas pode usar uma lista local de senhas comuns e, se o projeto decidir consultar um serviço externo, só o prefixo do resumo da senha é enviado (k-anonimato), e isso fica dito na política de privacidade.

## Entrada, recuperação e mensagens de segurança

- Erro de login genérico: "E-mail ou senha incorretos." Nunca diga qual dos dois.
- Recuperação sempre com a mesma resposta: "Se esse e-mail tiver conta no Midas, você vai receber um link em alguns minutos." O link vale uma vez só e expira em 30 minutos.
- Muitas tentativas: "Muitas tentativas. Espere 1 hora e tente de novo."
- Sem CAPTCHA de imagens: a proteção contra robôs é o limite de tentativas no servidor.
- E-mails de segurança (senha trocada, conta apagada) em linguagem simples e **sem nenhum dado financeiro**. O Midas não manda e-mail de propaganda.

## Sessão e segurança

- A sessão dura 30 dias e se renova com o uso. A pessoa não precisa entrar toda vez, o que também ajuda quem tem dificuldade para digitar.
- **Ações sensíveis pedem a senha de novo:** apagar a conta, trocar a senha, trocar o e-mail, baixar os dados. O pedido aparece num diálogo simples ("Por segurança, digite sua senha para continuar.") e, depois, a ação segue de onde parou.
- Em "Seus dados", a pessoa vê os aparelhos conectados (navegador e data do último uso, sem localização) e pode **"Sair de todos os aparelhos"**.
- Sessão expirada: "Por segurança, sua sessão terminou. Entre de novo para continuar." O que estava sendo digitado não se perde.

## "Seus dados"

A tela onde a pessoa exerce os direitos da LGPD (art. 18) sem precisar pedir a ninguém. Fica no menu da conta.

| Seção | O que faz | Direito (art. 18) |
| --- | --- | --- |
| O que o Midas guarda | Lista em linguagem simples, com os números da pessoa ("312 lançamentos desde março de 2026") | Confirmação e acesso (I, II) |
| Corrigir | Explica que todo lançamento se corrige tocando nele; o e-mail e o apelido se corrigem aqui | Correção (III) |
| Baixar meus dados | Arquivo com tudo, em JSON (completo) e CSV (planilha de lançamentos) | Acesso e portabilidade (II, V) |
| Aparelhos conectados | Lista e "Sair de todos os aparelhos" | Segurança |
| Apagar minha conta | Apaga a conta e todos os dados | Eliminação (VI) |
| Quem cuida dos seus dados | Contato do encarregado pelo tratamento de dados (e-mail) e link para a política, que lista os serviços que operam o app (hospedagem, banco, envio de e-mail) e o motivo de cada um | Canal com o encarregado (art. 41) e informação sobre compartilhamento (VII) |

### Apagar a conta

É tão fácil quanto criar a conta, mas nunca acontece por acidente:

1. Botão `md-btn-danger` "Apagar minha conta" (ícone `trash-2`) no fim da tela.
2. Na própria tela (sem diálogo surpresa), um bloco explica o que acontece: "Isso apaga sua conta, seus 312 lançamentos e as respostas das calculadoras. Não dá para desfazer." Com a sugestão: "Quer baixar seus dados antes?"
3. A pessoa digita a senha e toca em "Apagar minha conta e meus dados". O outro botão diz "Manter minha conta".
4. Tela final: "Sua conta foi apagada. Obrigado por ter usado o Midas." E um e-mail de confirmação, sem dados financeiros.

Prazos de eliminação (imediata ou após alguns dias, cópias de segurança) são decididos com a skill `lgpd-retention-erasure` e ditos na tela e na política.

## Modo discreto (padrão recomendado)

Para quem abre o app em público (no ônibus, no trabalho), um botão "Ocultar valores" (ícone `eye-off`) no topo do painel troca os valores por `R$ •••••`.

- A escolha fica no aparelho e vale até a pessoa desligar.
- Os valores escondidos continuam escondidos para o leitor de tela ("valor oculto"), para quem usa fone em público.
- Os gráficos escondem os eixos e o balão, mas mantêm as barras.
- É uma camada visual: o dado continua carregado no aparelho.

## Cookies e rastreamento

- O Midas usa **só dois cookies, os dois estritamente necessários** (`HttpOnly`, `Secure`, `SameSite=Lax`):
  - o **de sessão**, para a pessoa continuar conectada;
  - o **de aparelho** (`midas.device`, só em `/api/auth`, 1 ano), que lembra que a pessoa já entrou por aquele navegador. Guarda um HMAC do e-mail e um número aleatório, nunca o e-mail. Serve só para que alguém que erre a senha de outra pessoa de propósito não tranque a entrada dela no aparelho de sempre (OWASP, "Device Cookies").
- **Sem analytics de terceiros, pixels, mapas de calor ou gravação de sessão.** Sem fontes, scripts ou imagens de outros domínios: tudo é servido pelo próprio app.
- Com só cookies estritamente necessários, não há banner de cookies. Se um dia entrar qualquer cookie não essencial, ele só é ativado depois de um consentimento livre, com o botão "Recusar" tão visível quanto "Aceitar", seguindo o guia orientativo da ANPD sobre cookies.

## Mudanças futuras que exigem revisão

- **Integração com WhatsApp:** exige o número de telefone, um dado novo. Antes de desenhar a tela, revise base legal, registro de operações e política com o `lgpd-skills`; na interface, o número é pedido só por quem ativar a integração, com o motivo dito na hora e um jeito fácil de desligar e apagar o número.
- **Idade mínima:** se o Midas for restrito a adultos, ou se passar a atender menores, a decisão é tomada com a skill `lgpd-eca-digital-minors` (Lei 15.211/2025) antes de mudar o cadastro.
- **Qualquer dado novo** no cadastro ou nos lançamentos passa pelo mesmo caminho: motivo claro, necessidade real, registro em `.lgpd/`.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Pedir só e-mail e senha, e dizer para quê. | Pedir CPF "para segurança" ou telefone "para contato". |
| Caixas desmarcadas, uma por finalidade. | Caixa pré-marcada ou aceite escondido no botão. |
| "Apagar minha conta" visível em "Seus dados". | Esconder a exclusão atrás de um e-mail para o suporte. |
| Mensagens de erro que não revelam se o e-mail tem conta. | "Esse e-mail não está cadastrado." |
| E-mails de segurança sem valores. | "Você gastou R$ 1.230 com mercado este mês" por e-mail. |
| Fontes e imagens servidas pelo próprio app. | Google Fonts, CDNs e analytics de terceiros. |
