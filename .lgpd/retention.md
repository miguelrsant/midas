# Retenção e Eliminação — Midas

**Versão**: v1 (proposta, aguarda aprovação do Miguel)
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
| `user`, `account` | A001 | Enquanto a conta existir | Pedido de exclusão (Art. 18, VI) | HARD_DELETE em cascata (account, session, securityEvent, e na próxima etapa lançamentos, calculadoras e limites) | Ação "Apagar minha conta" |
| `user` não confirmado | A001 | **7 dias** após o cadastro | `emailVerified = false` e `createdAt` + 7 dias | HARD_DELETE em cascata | Limpeza interna / `pnpm db:limpeza` |
| `session` | A002 | **30 dias** após o último uso (renova com o uso) | `expiresAt` vencido; sair; trocar senha; "Sair de todos os aparelhos" | HARD_DELETE | Na hora (sair/trocar senha) e limpeza interna (vencidas) |
| `verification` (confirmação) | A003 | **24 h**, uso único | `expiresAt` vencido ou uso | HARD_DELETE | Na hora (uso) e limpeza interna |
| `verification` (redefinição) | A003 | **30 min**, uso único | `expiresAt` vencido ou uso | HARD_DELETE | Na hora (uso) e limpeza interna |
| `rateLimit` (`rate_limit`) | A006 | Janela de contagem de **15 min a 1 h**; registro apagado **1 dia** após a última requisição (`lastRequest`, conforme `prisma/schema.prisma`) | `lastRequest` + 1 dia | HARD_DELETE | Limpeza interna |
| `securityEvent` | A007 | **Proposta: 6 meses** | `createdAt` + 6 meses; exclusão da conta | HARD_DELETE | Limpeza interna / cascata |
| Resposta do HIBP | A005 | Nenhum (memória) | Fim da requisição | Descartada | — |
| Logs do app e da plataforma | A008 | Conforme plano da Vercel (**a verificar**) | Automático no operador | Expiração no operador | Vercel |
| E-mails enviados (cópia no Gmail) | A004 | **Proposta: 30 dias** | Data de envio | Apagar da pasta "Enviados" (filtro ou rotina) | Conta Google (a configurar) |
| Backups do banco (PITR do Neon) | todas | **Proposta: janela de 7 dias** (limitada ao plano; **a verificar**) | Rotação automática | Sobrescrita pelo operador | Neon |
| Exportação "Seus dados" | A009 | Nenhum (gerada na hora) | Download | Não guardada | — |
| Lançamentos, calculadoras, limites | A010 a A012 | Enquanto a conta existir | Exclusão pela pessoa ou da conta | HARD_DELETE | Próxima etapa |
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
  3. **Eliminação após restauração**: guardar uma lista de ids apagados (id aleatório, sem e-mail, sem outro dado) pelo mesmo prazo da janela. Se o banco for restaurado a um ponto anterior, reaplicar as exclusões antes de reabrir o app. Apagar a lista quando a janela vencer.
  4. **Branches**: não criar branches do Neon a partir de produção para desenvolvimento ou testes; dados de teste são fictícios (ou anonimizados com `lgpd-anonymization`). Branch temporária de produção, se inevitável, é apagada no mesmo dia.
- **Base**: Art. 16 (eliminação após o término), Art. 46 (segurança), Art. 18, VI.

### E-mails na conta Gmail

Ao enviar pelo SMTP do Gmail, cópias costumam ficar na pasta "Enviados" da conta (**a verificar**), guardando e-mails de destinatários e links. Proposta: filtro ou rotina que apague mensagens enviadas com mais de 30 dias, e o mesmo para devoluções (bounces) na caixa de entrada. Os links já terão expirado (24 h / 30 min).

## Exclusão da conta (Art. 18, VI)

1. A pessoa confirma com a senha ("Apagar minha conta e meus dados").
2. HARD_DELETE imediato em cascata no banco.
3. E-mail de confirmação enviado **antes** de apagar o endereço, sem dado financeiro.
4. O que ainda resta por um tempo, e é dito na tela e na política: cópias de segurança (até a janela do PITR), a cópia do e-mail de confirmação no Gmail (até 30 dias, se aprovado) e logs técnicos da plataforma (prazo da Vercel, a verificar).
5. Não há retenção legal conhecida; se a revisão jurídica apontar alguma, aplicar bloqueio só dos campos necessários.

## Schema sugerido pela skill

A skill sugere um model `RetentionRule` (entidade, finalidade, prazo, base legal, ação). Com poucas regras e todas em código, a proposta é **manter as regras em código**, num módulo único e testado, com os prazos em constantes que citam este arquivo, e revisar se o número de regras crescer.

## Status

- Regras propostas: 14 (itens "a verificar" dependem dos operadores).
- Limpeza interna do app + `pnpm db:limpeza` (sem agendador externo).
- Pendente: aprovação dos prazos de `securityEvent`, PITR e Gmail; teste da cascata de exclusão; frequência do script manual.
