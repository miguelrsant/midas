# Operador — Vercel

- **Identificação**: Vercel Inc., EUA. CNPJ: N/A (empresa estrangeira).
- **Finalidade**: hospedar o app Next.js, executar funções (região gru1, São Paulo), servir pela rede de borda, registrar logs técnicos.
- **Dados compartilhados**: todo o tráfego do app passa pela Vercel (requisições com cookie de sessão, e-mail e senha no login; na próxima etapa, lançamentos). Logs de requisição da plataforma podem conter IP, user-agent e caminho (a verificar). Logs do app sem dados pessoais além de `userId` (`src/lib/log.ts`). Variáveis de ambiente com segredos.
- **Atividades**: A001 a A012 (ver [data-map.md](../data-map.md)).
- **Tier**: Crítico (acesso técnico a todos os dados em trânsito, inclusive sensíveis potenciais na próxima etapa).
- **DPA assinado**: **a verificar** — localizar o DPA aplicável ao plano contratado e conferir os 12 itens da skill `lgpd-dpa` (instruções, confidencialidade, segurança, suboperadores, auxílio a direitos, aviso de incidente, eliminação ao fim, auditoria, responsabilidade, transferência internacional).
- **Cláusulas-padrão (intl.)**: **a verificar** — ver [transfers/vercel.md](../transfers/vercel.md).
- **Certificações**: **a verificar** na documentação oficial de segurança do operador.
- **Suboperadores**: **a verificar** na lista oficial do operador.
- **Retenção de logs**: **a verificar** conforme o plano.
- **Pontos de atenção**:
  - Não habilitar *log drains*, Web Analytics, Speed Insights ou qualquer coleta no navegador sem revisão (CLAUDE.md: sem analytics de terceiros).
  - Conferir onde ficam logs e artefatos de build (fora de gru1?).
- **Última revisão**: 2026-09-30
- **Próxima revisão**: 2026-12-30 (trimestral)
- **Owner interno**: Miguel
