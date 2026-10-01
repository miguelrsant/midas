# Mapa de Dados — Midas

**Versão**: v2 (núcleo do produto: A013 e A014, tabelas planejadas)
**Data**: 2026-09-30
**Owner global**: Miguel (controlador); encarregado pendente de designação ([gaps.md](./gaps.md))
**Skill**: `lgpd-data-mapping` (F2, Pipeline A, greenfield)

> Inventário por funcionalidade, feito antes do código das próximas etapas. Base legal em [legal-basis.md](./legal-basis.md); prazos em [retention.md](./retention.md); operadores em [vendors/](./vendors/); transferências em [transfers/](./transfers/).

## Visão geral

- **Titulares**: pessoas usuárias do app (adultas, se confirmada a idade mínima de 18 anos — decisão pendente, ver G04 em [gaps.md](./gaps.md)). Não há funcionários, prospects ou terceiros cadastrados.
- **Coletado do titular**: nome ou apelido (obrigatório, só para a saudação), e-mail, senha; na próxima etapa, lançamentos, respostas das calculadoras e limites.
- **Observado**: tipo de navegador (reduzido a rótulo), IP apenas em contadores de limite de tentativas e em logs da plataforma.
- **Nunca coletado**: CPF, RG, telefone, endereço, data de nascimento, dados bancários, localização, contatos, fotos (Art. 6º, III; [Privacidade na interface](../docs/design-system/16-privacidade-na-interface.md)).
- **Fica só no aparelho (não vai ao servidor)**: preferência de tema e "Ocultar valores".
- **Cookies**: só estritamente necessários: os de sessão do Better Auth e o de aparelho (`midas.device`, A006), que guarda HMAC do e-mail + número aleatório. Sem analytics, pixels, gravação de sessão ou fontes e scripts de terceiros no navegador.
- **Bibliotecas locais (não são operadores)**: Better Auth, Prisma, Argon2 rodam no próprio servidor do Midas.

## Resumo

| ID | Atividade | Base | Sensível | Alto risco | Situação |
|---|---|---|---|---|---|
| A001 | Cadastro e conta | 7º, V | Não | Não | em uso |
| A002 | Autenticação e sessões | 7º, V | Não | Não | em uso |
| A003 | Confirmação de e-mail e redefinição de senha | 7º, V | Não | Não | em uso |
| A004 | E-mails transacionais | 7º, V | Não | Não | em uso |
| A005 | Verificação de senha vazada (HIBP) | 7º, V | Não | Não | em uso |
| A006 | Limite de tentativas | 7º, IX | Não | Não | em uso |
| A007 | Eventos de segurança | 7º, IX | Não | Não | em uso |
| A008 | Operação e logs técnicos | 7º, IX | Não | Não | em uso |
| A009 | Direitos do titular ("Seus dados") | 7º, II | Pode conter | Não | a implementar |
| A010 | Lançamentos, gráficos e projeção | 7º, V + 11, II, "d" | **Potencial (saúde)** | **Sim** (RIPD v1) | a implementar |
| A011 | Calculadoras trabalhistas | 7º, V | Não | Coberto pela RIPD | a implementar |
| A012 | Limites por categoria | 7º, V + 11, II, "d" | Potencial | Coberto pela RIPD | a implementar |
| A013 | Categorias próprias e personalização | 7º, V + 11, II, "d" | Potencial | Coberto pela RIPD | a implementar |
| A014 | Fixos, rendas previstas e preferências | 7º, V + 11, II, "d" | Potencial | Coberto pela RIPD | a implementar |

Teste de alto risco (Res. CD/ANPD nº 2/2022, Art. 4º, critério geral **e** específico): A001 a A008 não têm critério específico (sem sensível, sem menores, sem decisão automatizada, sem tecnologia emergente). A010 atende o específico (dado sensível potencial) e, por serem dados financeiros confidenciais, pode "afetar significativamente interesses e direitos" (critério geral) → tratar como alto risco e fazer RIPD (Art. 38).

## Atividades de Tratamento

### A001 — Cadastro e conta

| Campo | Valor |
|---|---|
| Slug | a001-cadastro-e-conta |
| Finalidade | Criar e manter a conta |
| Base legal | Art. 7º, V ([detalhes](./legal-basis.md#a001)) |
| Categorias de titulares | Usuários (adultos, a confirmar) |
| Sensíveis? | Não |
| Dados | `user`: id, email, emailVerified, name (nome ou apelido, obrigatório; só para a saudação), image (sempre nulo), termsVersion, termsAcceptedAt, createdAt, updatedAt; `account`: hash Argon2id da senha, providerId "credential" |
| Fonte | Coletado do titular no cadastro |
| Sistemas | Postgres (Neon, aws-sa-east-1): tabelas `user`, `account` |
| Operadores | Neon (banco), Vercel (funções gru1) |
| Transferência intl. | Potencial (empresas dos EUA; ver [transfers/neon.md](./transfers/neon.md), [transfers/vercel.md](./transfers/vercel.md)) |
| Retenção | Enquanto a conta existir; não confirmada: 7 dias |
| Segurança | Argon2id (parâmetros OWASP), TLS com `sslmode=verify-full`, autorização por `userId` da sessão, validação no servidor |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A002 — Autenticação e sessões

| Campo | Valor |
|---|---|
| Slug | a002-autenticacao-e-sessoes |
| Finalidade | Manter a pessoa conectada; listar e encerrar sessões |
| Base legal | Art. 7º, V ([detalhes](./legal-basis.md#a002)) |
| Categorias de titulares | Usuários |
| Sensíveis? | Não (dado de autenticação: Res. 15/2024, Art. 5º, IV em incidente) |
| Dados | `session`: token (**em claro no banco**), expiresAt, userAgent reduzido a rótulo ("Chrome no Android"), ipAddress sempre nulo, userId; cookie de sessão assinado com HMAC (`HttpOnly`, `Secure`, `SameSite=Lax`) |
| Fonte | Gerado no login; rótulo observado do navegador |
| Sistemas | Postgres (`session`); cookie no navegador |
| Operadores | Neon, Vercel |
| Transferência intl. | Potencial (idem A001) |
| Retenção | 30 dias após o último uso; apagada ao sair, ao trocar a senha e em "Sair de todos os aparelhos" |
| Segurança | Cookie assinado; renovação do id ao entrar e ao trocar a senha. **Divergência**: o CLAUDE.md pede "id aleatório guardado com hash no banco" — ver G13 em [gaps.md](./gaps.md) |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A003 — Confirmação de e-mail e redefinição de senha

| Campo | Valor |
|---|---|
| Slug | a003-verificacao-e-recuperacao |
| Finalidade | Confirmar o e-mail e recuperar o acesso |
| Base legal | Art. 7º, V ([detalhes](./legal-basis.md#a003)) |
| Categorias de titulares | Usuários e pessoas em cadastro |
| Sensíveis? | Não |
| Dados | `verification`: identificador, hash do token, expiresAt |
| Fonte | Gerado pelo sistema a pedido do titular |
| Sistemas | Postgres (`verification`) |
| Operadores | Neon, Vercel |
| Transferência intl. | Potencial (idem A001) |
| Retenção | 24 h (confirmação), 30 min (redefinição), uso único |
| Segurança | Token guardado só como hash; resposta idêntica exista ou não a conta |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A004 — E-mails transacionais

| Campo | Valor |
|---|---|
| Slug | a004-emails-transacionais |
| Finalidade | Confirmação, "você já tem conta", redefinição de senha, "senha trocada" |
| Base legal | Art. 7º, V ([detalhes](./legal-basis.md#a004)) |
| Categorias de titulares | Usuários e pessoas em cadastro |
| Sensíveis? | Não. Nunca contém dado financeiro. Sem marketing |
| Dados | E-mail do destinatário, apelido (se houver), link com token, texto fixo |
| Fonte | Coletado do titular |
| Sistemas | Não guardado no banco; cópia na pasta "Enviados" da conta Gmail (a verificar e tratar, ver [retention.md](./retention.md)) |
| Operadores | Google (Gmail via SMTP, senha de app) |
| Transferência intl. | **Sim** (servidores globais; ver [transfers/google-gmail.md](./transfers/google-gmail.md)) |
| Retenção | Midas: não guarda. Google: conforme a conta (a verificar) |
| Segurança | SMTP com TLS (porta 465); segredo só em variável de ambiente |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A005 — Verificação de senha vazada (HIBP)

| Campo | Valor |
|---|---|
| Slug | a005-senha-vazada |
| Finalidade | Recusar senhas vazadas |
| Base legal | Art. 7º, V ([detalhes](./legal-basis.md#a005)) |
| Categorias de titulares | Usuários em cadastro ou troca de senha |
| Sensíveis? | Não |
| Dados | Enviado: prefixo de 5 caracteres hex do SHA-1 da senha (k-anonimato, `Add-Padding`). Nada é guardado |
| Fonte | Derivado da senha digitada, no servidor |
| Sistemas | Nenhum (memória do processo) |
| Operadores | Have I Been Pwned (API Pwned Passwords, servida via Cloudflare) |
| Transferência intl. | Avaliação: não há dado pessoal identificável no envio (ver [transfers/hibp.md](./transfers/hibp.md)) |
| Retenção | Nenhuma no Midas |
| Segurança | k-anonimato, padding, chamada do servidor (sem IP do titular); desligável por `PASSWORD_BREACH_CHECK` |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A006 — Limite de tentativas

| Campo | Valor |
|---|---|
| Slug | a006-limite-de-tentativas |
| Finalidade | Barrar força bruta e abuso em entrar, cadastrar e recuperar senha |
| Base legal | Art. 7º, IX + Art. 10 — LIA pendente ([detalhes](./legal-basis.md#a006)) |
| Categorias de titulares | Qualquer pessoa que acesse as rotas de autenticação |
| Sensíveis? | Não |
| Dados | `rateLimit`: `key` = IP + rota, contador, `lastRequest`. `throttle`: `key` = HMAC-SHA256 do e-mail (com `BETTER_AUTH_SECRET`) + finalidade (`signin`, `mail`), com sufixo do número do aparelho conhecido em `signin.<aparelho>`; `pwcheck:<userId>` (senha atual errada ao trocar a senha); `mail:global`; contador, `expiresAt`. Cookie `midas.device` no navegador: HMAC do e-mail + número aleatório, assinado, `HttpOnly`, só em `/api/auth`, 1 ano |
| Fonte | Observado na requisição (IP) e digitado pela pessoa (e-mail, só como HMAC) |
| Sistemas | Postgres (`rateLimit`, `throttle`); cookie `midas.device` no navegador |
| Operadores | Neon, Vercel |
| Transferência intl. | Potencial (idem A001) |
| Retenção | `rateLimit`: janela de 15 min a 1 h; registro apagado 1 dia após a última requisição. `throttle`: janela de 1 h (por e-mail) ou 24 h (total); apagado quando vence. Ambos pela limpeza interna do app (ver [retention.md](./retention.md)) |
| Segurança | Sem vínculo com `userId`. `throttle` já guarda só HMAC do e-mail (pseudonimizado, Art. 13, § 4º). Recomendação: guardar HMAC do IP em vez do IP no `rateLimit` (G12) |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A007 — Eventos de segurança

| Campo | Valor |
|---|---|
| Slug | a007-eventos-de-seguranca |
| Finalidade | Linha do tempo de segurança da conta para investigar abuso e incidentes |
| Base legal | Art. 7º, IX + Art. 10 — LIA pendente ([detalhes](./legal-basis.md#a007)) |
| Categorias de titulares | Usuários |
| Sensíveis? | Não |
| Dados | `securityEvent`: userId, tipo (SIGNUP, LOGIN, PASSWORD_CHANGED, PASSWORD_RESET, SESSIONS_REVOKED), data. Sem IP e sem conteúdo |
| Fonte | Gerado pelo sistema |
| Sistemas | Postgres (`securityEvent`) |
| Operadores | Neon, Vercel |
| Transferência intl. | Potencial (idem A001) |
| Retenção | Proposta: 6 meses; apagados com a conta ([retention.md](./retention.md)) |
| Segurança | Sem IP; só leitura pelo sistema. Encadeamento por hash (F6) pendente |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

### A008 — Operação e logs técnicos

| Campo | Valor |
|---|---|
| Slug | a008-logs-tecnicos |
| Finalidade | Servir o app e diagnosticar falhas |
| Base legal | Art. 7º, IX + Art. 10 — LIA pendente ([detalhes](./legal-basis.md#a008)) |
| Categorias de titulares | Usuários e visitantes |
| Sensíveis? | Não |
| Dados | Logs do app: lista fechada (`userId`, rota, status, código, duração, contagem) em `src/lib/log.ts`. Logs de requisição da Vercel: podem conter IP, user-agent, caminho (a verificar) |
| Fonte | Observado |
| Sistemas | Vercel (logs de runtime e de borda) |
| Operadores | Vercel |
| Transferência intl. | Potencial (ver [transfers/vercel.md](./transfers/vercel.md)) |
| Retenção | Conforme plano da Vercel (a verificar); sem *log drains* |
| Segurança | Logger sem texto livre; `errorCode` descarta mensagens de erro que podem carregar valores |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | Miguel |

## Núcleo do produto (a implementar, RIPD v1 aprovada no merge)

> Tabelas planejadas no plano do núcleo do produto. Todas têm `userId` com `ON DELETE CASCADE` e entram na exportação de "Seus dados". Texto livre é cifrado na aplicação (AES-256-GCM, ver [encryption.md](./encryption.md)). Risco e salvaguardas em [RIPD/ripd-lancamentos.md](./RIPD/ripd-lancamentos.md).

### A009 — Direitos do titular ("Seus dados")

| Campo | Valor |
|---|---|
| Slug | a009-direitos-do-titular |
| Finalidade | Acessar, corrigir, baixar (JSON completo e CSV de lançamentos), ver aparelhos e apagar a conta (Art. 18, I, II, III, V, VI, VII) |
| Base legal | Art. 7º, II ([detalhes](./legal-basis.md#a009)) |
| Dados | Todos os dados da conta; `security_event` ganha o tipo `DATA_EXPORTED`; `deleted_account` guarda só o id da conta apagada e a data |
| Sistemas | Postgres; arquivo de exportação gerado na hora no servidor e baixado pelo navegador, nunca guardado |
| Operadores | Neon, Vercel; Google (e-mail de confirmação de exclusão, enviado depois da exclusão, sem dado financeiro) |
| Retenção | Exportação: não guardada. `deleted_account`: até o fim da janela do PITR (7 dias) + margem de 1 dia |
| Segurança | Reautenticação com senha e limite por conta (`pwcheck`); exclusão numa transação; fluxo em [dsar/workflow.md](./dsar/workflow.md) |
| Alto risco? | Não |
| Owner | Miguel |

### A010 — Lançamentos, gráficos e projeção

| Campo | Valor |
|---|---|
| Slug | a010-lancamentos |
| Finalidade | Mostrar o mês, gráficos por mês e categoria e a projeção (estimativa) só para a própria pessoa |
| Base legal | Art. 7º, V; parte sensível: Art. 11, II, "d" ([detalhes](./legal-basis.md#a010)) |
| Categorias de titulares | Usuários |
| Sensíveis? | **Potencial**: categoria Saúde e descrição livre podem revelar dado de saúde (Art. 5º, II; Art. 11) |
| Dados | `entry`: id (UUID gerado no aparelho), tipo (renda/gasto), valor em centavos, categoria (id pronto ou `u-<uuid>`), data (sem hora), descrição opcional **cifrada**, vínculo com fixo e mês da ocorrência |
| Fonte | Coletado do titular; ocorrências de fixos geradas pelo sistema no dia marcado |
| Sistemas | Postgres (`entry`) |
| Operadores | Neon, Vercel |
| Transferência intl. | Potencial (idem A001) |
| Retenção | Enquanto a conta existir ou até a pessoa excluir; exclusão física |
| Segurança | Filtro por `userId` da sessão em toda consulta; descrição cifrada com AAD por linha; busca feita no navegador; fora de logs, e-mails e URLs; sem inferência ou perfil |
| Alto risco? | **Sim** — Res. 2/2022, Art. 4º |
| RIPD | [ripd-lancamentos.md](./RIPD/ripd-lancamentos.md) |
| Owner | Miguel |

### A011 — Calculadoras trabalhistas

| Campo | Valor |
|---|---|
| Slug | a011-calculadoras |
| Finalidade | Estimar férias, 13º, rescisão, salário líquido e seguro-desemprego e criar rendas previstas no planejamento |
| Base legal | Art. 7º, V ([detalhes](./legal-basis.md#a011)) |
| Categorias de titulares | Usuários |
| Sensíveis? | Não |
| Dados | Respostas (salário bruto, média de extras, datas de admissão, saída e férias, tipo de saída, aviso prévio, férias vencidas, número de dependentes, saldo do FGTS opcional, adesão ao saque-aniversário, pedidos anteriores de seguro-desemprego) e resultado: `calculation` com tudo **cifrado** num só campo |
| Fonte | Coletado do titular |
| Sistemas | Cálculo no aparelho; Postgres (`calculation`) só quando a pessoa toca em "Adicionar ao planejamento" |
| Operadores | Neon, Vercel |
| Retenção | Enquanto a conta existir ou até a pessoa apagar a conta de calculadora |
| Segurança | Sem empregador, CPF, CTPS, PIS ou nome de dependentes; respostas nunca na URL; servidor recalcula e ignora totais do cliente |
| Alto risco? | Não isoladamente; coberto pela RIPD de A010 |
| Owner | Miguel |

### A012 — Limites por categoria

| Campo | Valor |
|---|---|
| Slug | a012-limites |
| Finalidade | Avisar quando o gasto de uma categoria chega a 90% do limite mensal definido pela pessoa |
| Base legal | Art. 7º, V; parte sensível: Art. 11, II, "d" |
| Dados | `category_limit`: categoria, valor mensal |
| Retenção | Enquanto a conta existir ou até a pessoa remover |
| Segurança | Como A010; aviso só na tela, nunca por e-mail |
| Alto risco? | Coberto pela RIPD de A010 |
| Owner | Miguel |

### A013 — Categorias próprias e personalização

| Campo | Valor |
|---|---|
| Slug | a013-categorias-proprias |
| Finalidade | Criar categorias com nome e ícone, trocar nome e ícone das prontas e escondê-las do formulário |
| Base legal | Art. 7º, V; parte sensível: Art. 11, II, "d" (um nome ou ícone como "remédio" pode revelar saúde) |
| Dados | `user_category`: tipo, id da categoria pronta ajustada (se for ajuste), nome e ícone **cifrados juntos**, escondida |
| Retenção | Enquanto a conta existir; ao apagar uma categoria, os lançamentos e fixos dela vão para "Outros" |
| Segurança | Como A010; no máximo 30 por pessoa; ícones guardados como chaves próprias do Midas |
| Alto risco? | Coberto pela RIPD de A010 |
| Owner | Miguel |

### A014 — Fixos, rendas previstas e preferências do planejamento

| Campo | Valor |
|---|---|
| Slug | a014-fixos-e-previstas |
| Finalidade | Anotar sozinho, no dia marcado, rendas e gastos que se repetem (inclusive parcelas e "só uma vez"); mostrar rendas previstas das calculadoras até a pessoa confirmar "Recebi"; lembrar se o resumo do mês já foi visto |
| Base legal | Art. 7º, V; parte sensível: Art. 11, II, "d" |
| Dados | `recurring`: tipo, valor, categoria, descrição **cifrada**, dia do mês, mês inicial e final, próxima ocorrência e, só no adiantamento do salário, o vínculo técnico com o fixo do salário (`salaryId`, não é dado novo da pessoa). `expected_income`: categoria, chave do rótulo, valor, data prevista, conta de calculadora de origem. `user_preference`: último mês de resumo aberto |
| Fonte | Coletado do titular ou gerado pelas calculadoras a pedido dele. **Salário bruto** digitado no fixo ou no "Monte seu mês": usado só para calcular o líquido no servidor, na hora, e descartado; nunca é gravado, devolvido ou registrado em log (minimização, art. 6º, III). Só o líquido (e, se dividido, as duas partes) vira fixo |
| Retenção | Enquanto a conta existir; "Recebi" transforma a prevista em lançamento e apaga a prevista; "Não recebi" apaga |
| Segurança | Como A010; ocorrências criadas de forma idempotente, sem agendador externo |
| Alto risco? | Coberto pela RIPD de A010 |
| Owner | Miguel |

## Checklist de qualidade

- [x] Toda tabela com FK para `user` está coberta (`account`, `session`, `securityEvent`; `verification` e `rateLimit` sem FK também cobertas)
- [x] Toda integração de terceiro está listada (Vercel, Neon, Google, HIBP; GitHub sem dados de titulares)
- [x] Toda atividade tem base legal explícita (A010, A012–A014: parte sensível no Art. 11, II, "d")
- [x] Atividades de alto risco flagadas (A010; A011–A014 cobertas pela mesma RIPD)
- [ ] Atividades com menores flagadas — depende da decisão de idade mínima (G04)
- [x] Retenção definida (itens "a verificar" dependem dos operadores)

## Sugestão para o schema Prisma

Anotar cada model com `/// @lgpd:activity=a00N`, `@lgpd:legal_basis`, `@lgpd:retention` e `@lgpd:sensitive` (formato da skill `lgpd-data-mapping`), para extrair o inventário com `assets/extract-prisma-annotations.sh` e manter este mapa em sincronia.
