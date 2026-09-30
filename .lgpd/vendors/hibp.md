# Operador — Have I Been Pwned (Pwned Passwords)

- **Identificação**: Have I Been Pwned (Troy Hunt), API Pwned Passwords servida pela Cloudflare. País: **a verificar** (Austrália/EUA; rede global). CNPJ: N/A.
- **Finalidade**: saber se uma senha aparece em vazamentos, para recusá-la (A005).
- **Dados compartilhados**: só o prefixo de 5 caracteres hexadecimais do SHA-1 da senha, com `Add-Padding`. A consulta sai do servidor do Midas; não vai IP, e-mail nem senha do titular.
- **Avaliação**: com k-anonimato e padding, o prefixo não identifica a pessoa nem revela a senha; na nossa avaliação **não há dado pessoal** no envio (Art. 5º, I). A atividade é registrada por transparência (Art. 6º, VI) e deve constar na política.
- **Tier**: Baixo.
- **DPA assinado**: N/A provável (uso regido pelos termos da API) — **a verificar** a avaliação acima na revisão jurídica.
- **Cláusulas-padrão (intl.)**: N/A provável — ver [transfers/hibp.md](../transfers/hibp.md).
- **Controle**: desligável por `PASSWORD_BREACH_CHECK=false`; em falha da API, definir comportamento (aceitar com lista local de senhas comuns) sem logar a senha nem o prefixo.
- **Última revisão**: 2026-09-30
- **Próxima revisão**: 2027-09-30 (anual)
- **Owner interno**: Miguel
