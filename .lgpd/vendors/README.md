# Operadores — Midas

**Data**: 2026-09-30
**Skills**: `lgpd-vendor-audit` + `lgpd-dpa` (F14). Art. 39 (operador segue instruções do controlador); Art. 42 (responsabilidade solidária do controlador).

> Tudo marcado "a verificar" depende do contrato real. Nenhuma cláusula foi afirmada sem ser lida.

| Operador | Papel | Dados de titulares | Tier | DPA | Cláusulas-padrão (Res. 19/2024) | Ficha |
|---|---|---|---|---|---|---|
| Vercel | Hospedagem, funções (gru1), borda, logs | Todo o tráfego do app; logs | **Crítico** | a verificar | a verificar | [vercel.md](./vercel.md) |
| Neon | Postgres (aws-sa-east-1), backups | Todo o banco; lançamentos na próxima etapa | **Crítico** | a verificar | a verificar | [neon.md](./neon.md) |
| Google (Gmail SMTP) | Envio de e-mails transacionais | E-mail, apelido, links | **Alto** | **provavelmente inexistente em conta pessoal — a verificar** | a verificar | [google-gmail.md](./google-gmail.md) |
| Have I Been Pwned | Consulta de senha vazada | Prefixo de hash (k-anonimato) | **Baixo** | N/A provável (termos de uso da API) | N/A provável | [hibp.md](./hibp.md) |
| GitHub | Código-fonte | Nenhum (se mantidas as regras) | **Baixo** | N/A | N/A | [github.md](./github.md) |

Periodicidade de revisão (skill): Crítico trimestral, Alto semestral, Baixo anual.

Critérios eliminatórios da skill: operador que **não assina DPA não pode ser usado**; operador em país sem cláusulas-padrão e sem outra hipótese do Art. 33 **não pode ser usado**. Isso afeta diretamente o Gmail pessoal (G08).

Não são operadores: Better Auth, Prisma e Argon2 (bibliotecas rodando no servidor do Midas).
