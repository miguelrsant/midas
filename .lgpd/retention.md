# Retenção e Eliminação — Midas

**Versão**: v2 (proposta, aguarda aprovação do Miguel; v2 inclui as tabelas do núcleo do produto)
**Data**: 2026-09-30
**Skill**: `lgpd-retention-erasure` (F8, Pipeline A). A skill não fixa nome de arquivo; usamos `.lgpd/retention.md`.
**Normas**: LGPD Arts. 15 e 16 (término do tratamento e eliminação), Art. 18, VI (eliminação a pedido), Art. 6º, III (necessidade), Art. 46 (segurança); Res. CD/ANPD nº 15/2024, Art. 10 (registro de incidentes por 5 anos).

> Não é aconselhamento jurídico. Os prazos legais citados vêm da tabela da skill; a aplicabilidade de cada um ao Midas precisa de revisão jurídica.

## Princípio

O Midas não tem obrigação legal conhecida de guardar dados das pessoas usuárias depois que a conta é apagada: não emite nota fiscal, não tem relação de trabalho com elas e não é instituição financeira. Por isso a regra padrão é **hard delete** (eliminação definitiva, Art. 16), sem soft delete e sem bloqueio. A exceção possível é o Marco Civil (G10 em [gaps.md](./gaps.md)).

Hierarquia (skill): retenção legal obrigatória > retenção contratual > vontade do titular (Art. 18, VI). Hoje só a terceira se aplica.

## Como a limpeza roda

Não há agendador externo (sem Vercel Cron, Redis, fila ou cache). A limpeza dos dados vencidos roda **dentro do próprio app**:

- disparada em segundo plano depois das requisições de **login** e **cadastro**, no máximo **1 vez por hora por instância**;
- e pelo script manual **`pnpm db:limpeza`**.

**Efeito prático**: se não houver login nem cadastro por um tempo, a limpeza não roda e dados vencidos continuam no banco além do prazo nominal. Eles ficam inertes (sessão e token vencidos não autenticam), mas ainda são dado guardado. Proposta: rodar `pnpm db:limpeza` pelo menos uma vez por semana enquanto o tráfego for baixo, e dizer na política "apagados em até X" com folga (ver G15).

## Regras de retenção

| Dado (tabela) | Atividade | Prazo | Gatilho | Ação ao fim | Onde roda |
|---|---|---|---|---|---|
| `user`, `account` | A001 | Enquanto a conta existir | Pedido de exclusão (Art. 18, VI) | HARD_DELETE em cascata (account, session, securityEvent, entry, recurring, category_limit, user_category, calculation, expected_income, user_preference) numa transação; `verification` da pessoa apagada na mesma transação | Ação "Apagar minha conta" |
| `user` não confirmado | A001 | **7 dias** após o cadastro | `emailVerified = false` e `createdAt` + 7 dias | HARD_DELETE em cascata | Limpeza interna / `pnpm db:limpeza` |
| `session` | A002 | **30 dias** após o último uso (renova com o uso) | `expiresAt` vencido; sair; trocar senha; "Sair de todos os aparelhos" | HARD_DELETE | Na hora (sair/trocar senha) e limpeza interna (vencidas) |
| `verification` (confirmação) | A003 | **24 h**, uso único | `expiresAt` vencido ou uso | HARD_DELETE | Na hora (uso) e limpeza interna |
| `verification` (redefinição) | A003 | **30 min**, uso único | `expiresAt` vencido ou uso | HARD_DELETE | Na hora (uso) e limpeza interna |
| `rateLimit` (`rate_limit`) | A006 | Janela de contagem de **15 min a 1 h**; registro apagado **1 dia** após a última requisição (`lastRequest`, conforme `prisma/schema.prisma`) | `lastRequest` + 1 dia | HARD_DELETE | Limpeza interna |
| `throttle` | A006 | Janela de **1 h** (por e-mail ou aparelho, só HMAC; por conta na troca de senha) ou **24 h** (contador total de e-mails); os de entrada são zerados ao trocar a senha pelo link | `expiresAt` vencido | HARD_DELETE | Limpeza interna |
| Cookie `midas.device` | A006 | **1 ano** no navegador, renovado a cada entrada | `maxAge` vencido ou a pessoa limpa os cookies | Expira no navegador | Navegador |
| `securityEvent` | A007 | **Proposta: 6 meses** | `createdAt` + 6 meses; exclusão da conta | HARD_DELETE | Limpeza interna / cascata |
| Resposta do HIBP | A005 | Nenhum (memória) | Fim da requisição | Descartada | — |
| Logs do app e da plataforma | A008 | Conforme plano da Vercel (**a verificar**) | Automático no operador | Expiração no operador | Vercel |
| E-mails enviados (cópia no Gmail) | A004 | **Proposta: 30 dias** | Data de envio | Apagar da pasta "Enviados" (filtro ou rotina) | Conta Google (a configurar) |
| Backups do banco (PITR do Neon) | todas | **Proposta: janela de 7 dias** (limitada ao plano; **a verificar**) | Rotação automática | Sobrescrita pelo operador | Neon |
| Exportação "Seus dados" | A009 | Nenhum (gerada na hora) | Download | Não guardada | — |
| `entry` (lançamentos) | A010 | Enquanto a conta existir | Excluir lançamento; apagar a conta | HARD_DELETE (sem soft delete) | Ação da pessoa / cascata |
| `recurring` (fixos) | A014 | Enquanto a conta existir | "Parar" o fixo; apagar a conta | HARD_DELETE; lançamentos já criados ficam (vínculo vira nulo) | Ação da pessoa / cascata |
| `expected_income` | A014 | Até "Recebi" ou "Não recebi" | Confirmação da pessoa; apagar a conta de calculadora; apagar a conta | HARD_DELETE ("Recebi" cria o lançamento real) | Ação da pessoa / cascata |
| `calculation` | A011 | Enquanto a conta existir | Apagar a conta de calculadora; apagar a conta | HARD_DELETE (leva as previstas junto) | Ação da pessoa / cascata |
| `category_limit`, `user_category`, `user_preference` | A012, A013, A014 | Enquanto a conta existir | Remover o limite; apagar a categoria (lançamentos e fixos vão para "Outros"); apagar a conta | HARD_DELETE | Ação da pessoa / cascata |
| `deleted_account` | A009 | **Janela do PITR (7 dias) + 1 dia** | `deletedAt` + 8 dias | HARD_DELETE | Limpeza interna / `pnpm db:limpeza` |
| Registro de incidentes | — | **5 anos** | Registro do incidente | Eliminar após 5 anos | `.lgpd/incidents/log.md` (Res. 15/2024, Art. 10) |

## Propostas que precisam de decisão

### Eventos de segurança (`securityEvent`): 6 meses

- **Por quê**: a finalidade (A007) é investigar invasão de conta e abuso. Seis meses cobrem a demora típica para alguém perceber um acesso indevido e seguem, por analogia, o prazo mínimo do Marco Civil para registros de acesso a aplicações (Lei 12.965/2014, Art. 15), sem afirmar que ele se aplica ao Midas (ver G10).
- **Com a conta**: apagados junto com ela (minimização, Art. 6º, III; eliminação, Art. 16).
- **Exceção**: se um evento for evidência de incidente, o registro do incidente em `.lgpd/incidents/log.md` guarda o necessário **sem e-mail** (id aleatório e datas) por 5 anos (Res. 15/2024, Art. 10), e isso fica dito na política.
- **Alternativa**: 90 dias, se a revisão jurídica concluir que o Marco Civil não se aplica e se quiser coletar menos.

### Backups do Neon (PITR)

- **Fato**: o Neon mantém histórico para restauração a um ponto no tempo (PITR). A janela depende do plano e da configuração do projeto: **a verificar no painel**. Não afirmamos um número do operador aqui.
- **Proposta**:
  1. Configurar a menor janela que ainda permita recuperar de um erro (proposta: **7 dias**).
  2. Dizer na política: "Cópias de segurança são sobrescritas em até 7 dias. Depois disso, não sobra nada."
  3. **Eliminação após restauração**: a tabela `deleted_account` guarda só o id aleatório da conta e a data, pelo prazo da janela + 1 dia. Como ela mora no mesmo banco, um restore também a volta no tempo. **Runbook de restauração**:
     1. antes de restaurar, anotar o ponto de restauração e manter o app em manutenção;
     2. depois de restaurar, copiar para o banco restaurado as linhas de `deleted_account` da branch anterior ao restore (o Neon preserva a branch de origem);
     3. rodar a reaplicação (`DELETE FROM "user" WHERE id IN (SELECT id FROM deleted_account)`), que apaga tudo em cascata;
     4. só então reabrir o app.
  4. **Branches**: não criar branches do Neon a partir de produção para desenvolvimento, testes ou **previews da Vercel** (a integração Neon ↔ Vercel usa como origem a branch `dev`, vazia; README, "Publicar na Vercel"); dados de teste são fictícios (ou anonimizados com `lgpd-anonymization`). Branch temporária de produção, se inevitável, é apagada no mesmo dia.
- **Base**: Art. 16 (eliminação após o término), Art. 46 (segurança), Art. 18, VI.

### E-mails na conta Gmail

Ao enviar pelo SMTP do Gmail, cópias costumam ficar na pasta "Enviados" da conta (**a verificar**), guardando e-mails de destinatários e links. Proposta: filtro ou rotina que apague mensagens enviadas com mais de 30 dias, e o mesmo para devoluções (bounces) na caixa de entrada. Os links já terão expirado (24 h / 30 min).

## Exclusão da conta (Art. 18, VI)

1. A pessoa confirma com a senha ("Apagar minha conta e meus dados").
2. Numa só transação: registra o id em `deleted_account`, apaga as linhas de `verification` da pessoa e apaga o `user` (cascata para todas as tabelas com `userId`).
3. A sessão é encerrada e os cookies (`midas.session_token`, `midas.device`) removidos.
4. E-mail de confirmação enviado **depois** da exclusão confirmada, com o endereço só na memória da requisição, sem dado financeiro. Se a exclusão falhar, nada é enviado.
5. O que ainda resta por um tempo, e é dito na tela e na política: cópias de segurança (até a janela do PITR), a cópia do e-mail de confirmação no Gmail (até 30 dias, se aprovado) e logs técnicos da plataforma (prazo da Vercel, a verificar).
6. Não há retenção legal conhecida; se a revisão jurídica apontar alguma, aplicar bloqueio só dos campos necessários.

## Schema sugerido pela skill

A skill sugere um model `RetentionRule` (entidade, finalidade, prazo, base legal, ação). Com poucas regras e todas em código, a proposta é **manter as regras em código**, num módulo único e testado, com os prazos em constantes que citam este arquivo, e revisar se o número de regras crescer.

## Status

- Regras propostas: 19 (itens "a verificar" dependem dos operadores).
- Limpeza interna do app + `pnpm db:limpeza` (sem agendador externo).
- Pendente: aprovação dos prazos de `securityEvent`, PITR e Gmail; frequência do script manual.
- Cascata coberta por teste automático a partir do PR de lançamentos: toda chave estrangeira para `user` precisa de `ON DELETE CASCADE` (conferido em `pg_constraint`) e toda tabela com `userId` precisa estar na exportação.
