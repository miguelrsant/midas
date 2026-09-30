# Bases Legais por Atividade de Tratamento

**Projeto**: Midas
**Última atualização**: 2026-09-30
**Escopo**: fundação + autenticação (A001 a A008, em uso) e núcleo do produto (A009 a A014, a implementar)
**Skill**: `lgpd-legal-basis` (F1, Pipeline A)

> Registro técnico de apoio. Não é aconselhamento jurídico: as decisões marcadas como pendentes precisam de revisão por pessoa especialista em proteção de dados.

Regras aplicadas (skill `lgpd-legal-basis`): autenticação e conta usam execução de contrato (Art. 7º, V); prevenção a fraude com dado comum usa legítimo interesse (Art. 7º, IX + Art. 10, com LIA); legítimo interesse e execução de contrato **não** valem para dado sensível (Art. 11). O aceite dos termos é caixa desmarcada e não é tratado como "consentimento" para nenhuma finalidade (Art. 8º; Art. 9º, § 2º).

## Resumo

| ID | Atividade | Base legal | Situação |
|---|---|---|---|
| A001 | Cadastro e conta | Art. 7º, V | em uso |
| A002 | Autenticação e sessões | Art. 7º, V | em uso |
| A003 | Confirmação de e-mail e redefinição de senha | Art. 7º, V | em uso |
| A004 | E-mails transacionais | Art. 7º, V | em uso |
| A005 | Verificação de senha vazada (HIBP) | Art. 7º, V | em uso |
| A006 | Limite de tentativas | Art. 7º, IX + Art. 10 | em uso, **LIA pendente** |
| A007 | Eventos de segurança da conta | Art. 7º, IX + Art. 10 | em uso, **LIA pendente** |
| A008 | Operação e logs técnicos | Art. 7º, IX + Art. 10 | em uso, **LIA pendente** |
| A009 | Direitos do titular ("Seus dados") | Art. 7º, II (Art. 18 e 19) | a implementar |
| A010 | Lançamentos, gráficos e projeção | Art. 7º, V + Art. 11, II, "d" | a implementar, RIPD v1 |
| A011 | Calculadoras trabalhistas | Art. 7º, V | a implementar |
| A012 | Limites por categoria | Art. 7º, V + Art. 11, II, "d" | a implementar |
| A013 | Categorias próprias e personalização | Art. 7º, V + Art. 11, II, "d" | a implementar |
| A014 | Fixos, rendas previstas e preferências | Art. 7º, V + Art. 11, II, "d" | a implementar |

---

<a id="a001"></a>
## Atividade: A001 — Cadastro e conta

- **Finalidade**: criar e manter a conta da pessoa para que ela use o Midas (Art. 6º, I).
- **Dados tratados**: `user.id`, `user.email`, `user.emailVerified`, `user.name` (nome ou apelido, obrigatório), `user.image` (sempre nulo), `user.termsVersion`, `user.termsAcceptedAt`, `createdAt`, `updatedAt`; `account` com hash Argon2id da senha (`providerId = "credential"`).
- **Sensíveis?**: Não.
- **Base legal**: Art. 7º, V — execução de contrato e procedimentos preliminares a pedido do titular.
- **Justificativa**: sem e-mail e senha não há conta nem serviço. O nome passou a ser obrigatório (decisão do produto, 30/09/2026) e só serve à saudação; a pessoa pode usar um apelido, e ele nunca sai do app nem entra em e-mails ou logs (Art. 6º, III). O registro de versão e data do aceite dos termos documenta a formação do contrato; não é consentimento.
- **LIA**: N/A.
- **Retenção**: enquanto a conta existir; contas não confirmadas são apagadas em 7 dias. Ver [retention.md](./retention.md).
- **Revogação possível?**: não se aplica (não é consentimento); o titular pode apagar a conta a qualquer momento (Art. 18, VI).
- **Última revisão**: 2026-09-30

<a id="a002"></a>
## Atividade: A002 — Autenticação e sessões

- **Finalidade**: manter a pessoa conectada com segurança e permitir ver e encerrar sessões ("Sair de todos os aparelhos").
- **Dados tratados**: `session.token`, `session.expiresAt`, `session.userAgent` reduzido a rótulo curto ("Chrome no Android"), `session.ipAddress` (sempre nulo), `session.userId`; cookie de sessão do Better Auth (assinado com HMAC).
- **Sensíveis?**: Não. Dado de autenticação é categoria de atenção em incidente (Res. CD/ANPD nº 15/2024, Art. 5º, IV).
- **Base legal**: Art. 7º, V — execução de contrato.
- **Justificativa**: autenticação é parte indispensável do serviço (regra de ouro 5 da skill). O cookie é estritamente necessário, sem consentimento.
- **LIA**: N/A.
- **Retenção**: 30 dias após o último uso (renova com o uso); apagada ao sair, ao trocar a senha e em "Sair de todos os aparelhos".
- **Revogação possível?**: não se aplica; a pessoa encerra sessões quando quiser.
- **Última revisão**: 2026-09-30

<a id="a003"></a>
## Atividade: A003 — Confirmação de e-mail e redefinição de senha

- **Finalidade**: confirmar que o e-mail pertence à pessoa e permitir recuperar o acesso.
- **Dados tratados**: `verification.identifier`, hash do token, `expiresAt` (24 h para confirmação; 30 min para redefinição).
- **Sensíveis?**: Não.
- **Base legal**: Art. 7º, V — execução de contrato.
- **Justificativa**: necessário para abrir a conta e recuperar o acesso a pedido do titular.
- **LIA**: N/A.
- **Retenção**: até o uso ou a expiração (24 h / 30 min); uso único.
- **Revogação possível?**: não se aplica.
- **Última revisão**: 2026-09-30

<a id="a004"></a>
## Atividade: A004 — E-mails transacionais

- **Finalidade**: enviar confirmação de cadastro, aviso "você já tem conta", link de redefinição e aviso de "senha trocada".
- **Dados tratados**: e-mail do destinatário, apelido (se houver), link com token. **Nunca** dado financeiro. Sem marketing.
- **Sensíveis?**: Não.
- **Base legal**: Art. 7º, V — execução de contrato.
- **Justificativa**: mensagens necessárias ao funcionamento e à segurança da conta. O aviso "você já tem conta" vai só ao dono do e-mail e evita revelar a terceiros quem usa o Midas (Art. 6º, VII — segurança). Qualquer e-mail de novidades exigiria consentimento próprio, separado e desmarcado (Art. 7º, I; Art. 8º).
- **LIA**: N/A.
- **Retenção**: o Midas não guarda cópia; o operador (Google) pode guardar. Ver [vendors/google-gmail.md](./vendors/google-gmail.md) e [retention.md](./retention.md).
- **Revogação possível?**: não se aplica.
- **Última revisão**: 2026-09-30

<a id="a005"></a>
## Atividade: A005 — Verificação de senha vazada (Have I Been Pwned)

- **Finalidade**: recusar senhas que aparecem em vazamentos, protegendo a conta (Art. 46).
- **Dados tratados**: sai do servidor apenas o prefixo de 5 caracteres hexadecimais do SHA-1 da senha, com cabeçalho `Add-Padding` (k-anonimato). A senha e o e-mail não saem. A consulta parte do servidor, sem IP do titular.
- **Sensíveis?**: Não.
- **Base legal**: Art. 7º, V — execução de contrato (segurança da conta contratada). Avaliação: o prefixo, isolado, dificilmente identifica alguém; mesmo assim a atividade fica registrada por transparência (Art. 6º, VI).
- **Justificativa**: exigência de segurança do projeto (NIST SP 800-63B-4, citado no CLAUDE.md). Pode ser desligada por `PASSWORD_BREACH_CHECK`.
- **LIA**: N/A.
- **Retenção**: nada é guardado pelo Midas; a resposta é descartada após a comparação.
- **Revogação possível?**: não se aplica.
- **Última revisão**: 2026-09-30

<a id="a006"></a>
## Atividade: A006 — Limite de tentativas

- **Finalidade**: impedir ataques de força bruta e abuso em entrar, cadastrar e recuperar senha.
- **Dados tratados**: IP + rota, contador, início da janela (`rateLimit`); contadores por HMAC do e-mail, por aparelho conhecido e por conta na troca de senha (`throttle`); cookie de aparelho `midas.device` (HMAC do e-mail + número aleatório, assinado).
- **Sensíveis?**: Não.
- **Base legal**: Art. 7º, IX — legítimo interesse, com Art. 10, II (proteção do titular) e regra de ouro 6 da skill (prevenção a fraude com dado comum).
- **Justificativa**: o IP é o sinal mínimo para limitar tentativas sem CAPTCHA e sem cadastro extra. Consentimento não serve, pois o atacante não consentiria. O cookie de aparelho protege a própria titular: sem ele, qualquer pessoa trancaria a entrada dela errando a senha de propósito. É estritamente necessário, não identifica ninguém fora do Midas e não serve para entrar, então dispensa consentimento.
- **LIA**: **pendente** — `.lgpd/lia/a006-limite-de-tentativas.md` (a criar com `assets/lia-template.md`; exige aprovação humana). Ver [gaps.md](./gaps.md).
- **Retenção**: janela de contagem de 15 min a 1 h; registros apagados 1 dia após a última requisição pela limpeza interna do app (em segundo plano após login e cadastro, no máximo 1 vez por hora por instância) ou pelo script `pnpm db:limpeza`.
- **Revogação possível?**: oposição (Art. 18, § 2º) avaliada caso a caso; na prática a janela expira antes.
- **Última revisão**: 2026-09-30

<a id="a007"></a>
## Atividade: A007 — Eventos de segurança da conta

- **Finalidade**: registrar ações de segurança (SIGNUP, LOGIN, PASSWORD_CHANGED, PASSWORD_RESET, SESSIONS_REVOKED) para investigar abuso e incidentes (Art. 6º, VII, VIII e X).
- **Dados tratados**: `securityEvent.userId`, `type`, `createdAt`. Sem IP e sem conteúdo.
- **Sensíveis?**: Não.
- **Base legal**: Art. 7º, IX — legítimo interesse, com Art. 10, II (proteção do titular).
- **Justificativa**: mínimo necessário para reconstruir uma linha do tempo em caso de invasão de conta e cumprir o dever de prevenção e responsabilização (Art. 6º, VIII e X; Art. 46).
- **LIA**: **pendente** — `.lgpd/lia/a007-eventos-de-seguranca.md`.
- **Retenção**: proposta de 6 meses, apagados com a conta. Ver [retention.md](./retention.md).
- **Revogação possível?**: oposição (Art. 18, § 2º) avaliada caso a caso.
- **Última revisão**: 2026-09-30

<a id="a008"></a>
## Atividade: A008 — Operação e logs técnicos

- **Finalidade**: servir o app, diagnosticar erros e detectar falhas.
- **Dados tratados**: logs do app com lista fechada de campos (`userId`, rota, status, código de erro, duração, contagem), sem e-mail, valores, IP ou tokens (`src/lib/log.ts`); logs de requisição da plataforma Vercel, que podem conter IP, user-agent e caminho (a verificar).
- **Sensíveis?**: Não (por construção do logger).
- **Base legal**: Art. 7º, IX — legítimo interesse (Art. 10, I e II).
- **Justificativa**: não há como operar e proteger o serviço sem registros técnicos; o logger reduz os campos ao mínimo (Art. 6º, III).
- **LIA**: **pendente** — `.lgpd/lia/a008-logs-tecnicos.md`.
- **Retenção**: definida pelo plano da Vercel (a verificar). Sem *log drains* para terceiros.
- **Revogação possível?**: oposição avaliada caso a caso.
- **Última revisão**: 2026-09-30

---

## Próxima etapa (previstas, ainda sem código)

<a id="a009"></a>
## Atividade: A009 — Direitos do titular ("Seus dados")

- **Finalidade**: permitir acessar, corrigir, baixar (JSON e CSV) e apagar os dados, e ver os aparelhos conectados.
- **Dados tratados**: todos os dados da conta, lidos para exportação ou apagados.
- **Sensíveis?**: Pode conter (via A010).
- **Base legal**: Art. 7º, II — cumprimento de obrigação legal (Art. 18 e Art. 19, II: resposta completa em 15 dias).
- **Justificativa**: atender os direitos do titular é dever do controlador.
- **Retenção**: o arquivo exportado é gerado na hora e não fica guardado.
- **Última revisão**: 2026-09-30

<a id="a010"></a>
## Atividade: A010 — Lançamentos, gráficos e projeção

- **Finalidade**: mostrar quanto entrou, saiu e sobrou, gráficos por mês e categoria e a estimativa dos próximos meses, só para a própria pessoa.
- **Dados tratados**: valor (centavos), tipo (renda ou gasto), categoria, data, descrição opcional (cifrada), vínculo com fixo.
- **Sensíveis?**: **Potencialmente sim.** A categoria Saúde e descrições livres ("farmácia", "consulta") podem revelar dado referente à saúde (Art. 5º, II).
- **Base legal**:
  - Parte comum: Art. 7º, V — execução de contrato.
  - Parte sensível: **Art. 11, II, "d"** — tratamento indispensável ao exercício regular de direitos, inclusive em contrato. Decisão do controlador em 2026-09-30, registrada na [RIPD](./RIPD/ripd-lancamentos.md#6-base-legal).
- **Justificativa**: o serviço contratado é registrar e mostrar os gastos da própria pessoa; se ela anota um gasto de saúde, guardá-lo e mostrá-lo a ela é a execução do contrato. A base não cobre nenhum outro uso: estatística, pesquisa, IA ou compartilhamento exigiriam nova avaliação (provavelmente Art. 11, I, ou anonimização).
- **Salvaguardas**: texto livre cifrado; nada em logs, e-mails ou URLs; nenhuma inferência de saúde nem perfil; acesso só pelo `userId` da sessão; exclusão e exportação em autosserviço.
- **Ponto jurídico em aberto**: a leitura do Art. 11, II, "d" como base para execução contratual com dado sensível não tem orientação específica da ANPD; revisão por especialista antes da abertura ao público (G21).
- **Projeção**: estimativa exibida ao próprio titular; não é decisão automatizada que afete seus interesses (Art. 20). Sempre apresentada como estimativa.
- **RIPD**: [ripd-lancamentos.md](./RIPD/ripd-lancamentos.md) (v1).
- **Retenção**: enquanto a conta existir ou até a pessoa excluir.
- **Última revisão**: 2026-09-30

<a id="a011"></a>
## Atividade: A011 — Calculadoras trabalhistas

- **Finalidade**: estimar férias, 13º, rescisão, salário líquido e seguro-desemprego e criar rendas previstas (ou o fixo "Salário") no planejamento.
- **Dados tratados**: salário, média de extras, datas (admissão, saída, férias), tipo de saída, aviso prévio, férias vencidas, número de dependentes, saldo do FGTS (opcional), saque-aniversário, pedidos anteriores de seguro-desemprego, resultado e rendas previstas geradas. Tudo cifrado num só campo; guardado só quando a pessoa adiciona ao planejamento.
- **Sensíveis?**: Não (Art. 5º, II), mas são dados financeiros e trabalhistas confidenciais.
- **Base legal**: Art. 7º, V — execução de contrato (funcionalidade pedida pelo titular).
- **Justificativa**: sem esses dados não há cálculo. Não pedir empregador, CPF, CTPS ou documentos (Art. 6º, III).
- **Retenção**: enquanto a conta existir, ou até a pessoa apagar a simulação.
- **Última revisão**: 2026-09-30

<a id="a012"></a>
## Atividade: A012 — Limites por categoria

- **Finalidade**: avisar a pessoa quando o gasto de uma categoria chega a 90% do limite que ela definiu.
- **Dados tratados**: categoria, valor do limite, mês.
- **Sensíveis?**: Pode revelar hábito (ex.: limite em Saúde); tratar como A010.
- **Base legal**: Art. 7º, V — execução de contrato; parte sensível: Art. 11, II, "d" (como A010).
- **Retenção**: enquanto a conta existir.
- **Última revisão**: 2026-09-30

<a id="a013"></a>
## Atividade: A013 — Categorias próprias e personalização

- **Finalidade**: deixar a pessoa criar categorias com nome e ícone, trocar nome e ícone das prontas e esconder as que não usa.
- **Dados tratados**: tipo, nome e ícone (cifrados juntos), categoria pronta ajustada, escondida.
- **Sensíveis?**: Potencialmente (nome ou ícone como "remédio", "psicólogo").
- **Base legal**: Art. 7º, V; parte sensível: Art. 11, II, "d" (como A010).
- **Justificativa**: funcionalidade pedida pela pessoa; sem cor e sem outros atributos.
- **Retenção**: enquanto a conta existir ou até a pessoa apagar a categoria.
- **Última revisão**: 2026-09-30

<a id="a014"></a>
## Atividade: A014 — Fixos, rendas previstas e preferências do planejamento

- **Finalidade**: anotar sozinho as rendas e gastos que se repetem, mostrar rendas previstas das calculadoras até "Recebi" e lembrar se o resumo do mês já foi visto.
- **Dados tratados**: valor, categoria, descrição cifrada, dia do mês, meses de início e fim, próxima ocorrência; renda prevista (categoria, rótulo, valor, data); último resumo aberto.
- **Sensíveis?**: Potencialmente (como A010).
- **Base legal**: Art. 7º, V; parte sensível: Art. 11, II, "d".
- **Retenção**: enquanto a conta existir ou até a pessoa parar o fixo ou apagar a prevista.
- **Última revisão**: 2026-09-30
