# Transferência Internacional — Vercel

- **Operador**: Vercel Inc.
- **País**: EUA (sede); funções do Midas em gru1 (São Paulo); rede de borda global.
- **Finalidade**: hospedagem, execução de funções, entrega pela borda e logs técnicos.
- **Dados potencialmente transferidos**: metadados de requisição em pontos de borda fora do Brasil (IP, user-agent, caminho), logs da plataforma, acesso de suporte e operação. Conteúdo das requisições processado nas funções em gru1 (**a verificar** se algum processamento ou armazenamento de log ocorre fora do Brasil).
- **Hipótese do Art. 33**: proposta II, "b" — cláusulas-padrão (Res. 19/2024, Anexo II).
- **Cláusulas-Padrão (Res. 19/2024)**: **a verificar** se o DPA do operador as inclui ou se aceita adendo com o texto integral do Anexo II. Não assumir que cláusulas de outras jurisdições (ex.: europeias) equivalem.
- **Documento**: pendente.
- **Suboperadores autorizados**: **a verificar** na lista oficial.
- **Salvaguardas adicionais**: TLS; logger sem dados pessoais além de `userId`; nenhum analytics da plataforma habilitado; segredos em variáveis de ambiente.
- **Avaliação de adequação**: 2026-09-30 — risco residual **médio** até confirmar cláusulas e local dos logs.
- **Próxima revisão**: 2026-12-30
