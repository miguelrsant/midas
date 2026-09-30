# Transferência Internacional — Have I Been Pwned

- **Operador**: Have I Been Pwned (Troy Hunt), API servida pela Cloudflare
- **País**: **a verificar** (Austrália/EUA; rede global)
- **Finalidade**: verificar se a senha escolhida aparece em vazamentos.
- **Dados transferidos**: prefixo de 5 caracteres hexadecimais do SHA-1 da senha, com `Add-Padding`. Sem e-mail, sem senha, sem IP do titular (a chamada parte do servidor).
- **Hipótese do Art. 33**: N/A provável — na nossa avaliação o prefixo, isolado e com padding, não é dado pessoal (Art. 5º, I), então não há transferência de dado pessoal. **A confirmar na revisão jurídica.**
- **Cláusulas-Padrão (Res. 19/2024)**: N/A se a avaliação acima for confirmada.
- **Salvaguardas adicionais**: k-anonimato; padding; nada guardado; desligável por `PASSWORD_BREACH_CHECK`; nada logado.
- **Avaliação de adequação**: 2026-09-30 — risco residual **baixo**.
- **Próxima revisão**: 2027-09-30
