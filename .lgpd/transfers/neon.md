# Transferência Internacional — Neon

- **Operador**: Neon (empresa dos EUA; razão social **a verificar**)
- **País**: EUA (sede); dados em aws-sa-east-1 (São Paulo).
- **Finalidade**: banco de dados PostgreSQL gerenciado e backups (PITR).
- **Dados potencialmente transferidos**: acesso remoto de operação e suporte a partir de fora do Brasil; metadados do projeto no plano de controle; local dos backups e do histórico PITR (**a verificar** se ficam na mesma região).
- **Hipótese do Art. 33**: proposta II, "b" — cláusulas-padrão (Res. 19/2024, Anexo II).
- **Cláusulas-Padrão (Res. 19/2024)**: **a verificar** no DPA do operador; se ausentes, solicitar adendo com o texto integral do Anexo II.
- **Documento**: pendente.
- **Suboperadores autorizados**: AWS (sa-east-1); demais **a verificar**.
- **Branches de preview**: criadas pela integração Neon ↔ Vercel a partir da branch `dev`, vazia; nunca a partir de produção, porque uma branch é uma cópia completa dos dados (G19).
- **Salvaguardas adicionais**: região no Brasil; TLS `verify-full`; senha em Argon2id; tokens de verificação com hash; decisão de criptografia de coluna para lançamentos pendente (F7).
- **Avaliação de adequação**: 2026-09-30 — risco residual **médio**; sobe para **alto** na próxima etapa (lançamentos com possível dado de saúde) se as cláusulas não forem confirmadas.
- **Próxima revisão**: 2026-12-30, e obrigatoriamente antes de guardar lançamentos.
