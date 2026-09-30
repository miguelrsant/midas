# Operador — Neon

- **Identificação**: Neon, empresa dos EUA (razão social exata **a verificar** no contrato). CNPJ: N/A.
- **Finalidade**: banco PostgreSQL gerenciado do Midas, região aws-sa-east-1 (São Paulo), com histórico para restauração (PITR).
- **Dados compartilhados**: todo o banco: `user`, `account` (hash de senha), `session` (token em claro), `verification` (hash), `rateLimit` (IP), `securityEvent`; na próxima etapa, lançamentos (sensível potencial), calculadoras e limites.
- **Atividades**: A001 a A003, A006, A007, A009 a A012.
- **Tier**: Crítico.
- **DPA assinado**: **a verificar** (conferir os 12 itens da skill `lgpd-dpa`, em especial aviso de incidente, eliminação ao fim do contrato e eliminação dentro dos backups).
- **Cláusulas-padrão (intl.)**: **a verificar** — ver [transfers/neon.md](../transfers/neon.md).
- **Certificações**: **a verificar**.
- **Suboperadores**: AWS (infraestrutura em sa-east-1); lista completa **a verificar**.
- **Criptografia em repouso**: **a verificar** na documentação do operador (decisão de criptografia de coluna na F7, `lgpd-encryption-keys`). Em trânsito: `sslmode=verify-full` (na `DATABASE_URL` configurada na Vercel).
- **Pontos de atenção**:
  - Janela de PITR e branches: ver [retention.md](../retention.md).
  - Confirmar se o painel ou o suporte do operador acessam dados a partir de fora do Brasil.
- **Última revisão**: 2026-09-30
- **Próxima revisão**: 2026-12-30 (trimestral)
- **Owner interno**: Miguel
