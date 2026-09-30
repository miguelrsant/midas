# Midas

**Suas finanças, seu controle.** O Midas é um app web de finanças pessoais, de código aberto, para quem quer saber "como está o meu dinheiro?" sem planilha e sem jargão.

> Em construção. Esta versão tem a base do app e a autenticação. Os lançamentos, o painel e as calculadoras vêm nas próximas.

- Guia para quem contribui (pessoas e agentes de IA): [CLAUDE.md](CLAUDE.md)
- Design system: [docs/design-system](docs/design-system/README.md)
- Registros de LGPD: [.lgpd/](.lgpd/STATUS.md)
- Como reportar uma falha de segurança: [SECURITY.md](SECURITY.md)

## Rodar na sua máquina

Precisa de **Node 24**, **pnpm** (via `corepack enable`) e **Docker**.

```bash
pnpm install
pnpm dev                      # sobe Postgres e Mailpit, aplica as migrações e abre http://localhost:3000
```

O `pnpm dev` e os testes sobem o Docker sozinhos (`docker compose up -d --wait`, só em 127.0.0.1). Para desligar: `pnpm services:stop`.

> **WSL com Docker Desktop:** se o Postgres não subir com `error mounting … 01-init.sql`, recrie o container (os dados ficam no volume): `docker compose up -d --force-recreate postgres`.

Não é preciso criar nenhum `.env`: o `.env.development` versionado já aponta para o Docker, só com valores falsos de localhost. Os e-mails (confirmação, recuperação de senha) aparecem no Mailpit, em <http://localhost:8025>.

Para usar serviços reais na sua máquina (um banco no Neon, o Gmail), crie um `.env.local`, que o git ignora, com as variáveis listadas em "Publicar na Vercel".

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe o Docker, aplica as migrações e abre o app em modo de desenvolvimento |
| `pnpm services:up`, `services:stop`, `services:down` | Liga, para ou remove o Postgres e o Mailpit (o `down` mantém os dados) |
| `pnpm lint`, `pnpm typecheck`, `pnpm format:check` | Qualidade do código |
| `pnpm test` | Sobe o Docker e roda os testes unitários e de integração (banco `midas_test`) |
| `pnpm build && pnpm test:e2e` | Testes de ponta a ponta com Playwright (rode `pnpm exec playwright install chromium` uma vez). Com o `pnpm dev` aberto na 3000, use `E2E_PORT=3100 pnpm test:e2e` |
| `pnpm db:migrate` | Cria uma migração nova a partir do `prisma/schema.prisma` |
| `pnpm db:limpeza` | Apaga dados vencidos (sessões, tokens, contadores, contas não confirmadas) |

## Publicar na Vercel

1. **Neon:** crie um projeto na região **AWS São Paulo (`aws-sa-east-1`)**. Instale a integração Neon ↔ Vercel, para cada preview ganhar uma branch própria do banco e nunca tocar no banco de produção.
2. **Vercel:** importe o repositório. O `vercel.json` já define a região `gru1` (São Paulo) e o comando de build, que roda `prisma migrate deploy` antes do `next build`.
3. **Variáveis de ambiente** (Settings → Environment Variables); a validação fica em `src/lib/env.ts`:
   - `DATABASE_URL` (com pooler) e `DATABASE_URL_UNPOOLED` (sem pooler): a integração Neon ↔ Vercel cria as duas sozinha. Sem a integração, use `DIRECT_URL` no lugar da segunda.
   - `BETTER_AUTH_URL`: o endereço público, com `https://`. Nos previews pode ficar vazio.
   - `BETTER_AUTH_SECRET`: gere com `openssl rand -base64 32`. Um valor diferente por ambiente.
   - `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER`, `SMTP_PASSWORD` e `EMAIL_FROM`.
   - `PASSWORD_BREACH_CHECK=true`.
4. **Gmail:** na conta Google que envia os e-mails, ative a verificação em 2 etapas e crie uma senha de app em <https://myaccount.google.com/apppasswords>. Uma conta pessoal envia cerca de 500 e-mails por dia. Antes de abrir ao público, veja a pendência G08 em [.lgpd/gaps.md](.lgpd/gaps.md): uma conta pessoal não tem contrato de operador de dados.

Sem Redis, fila, cache ou cron: a limpeza de dados vencidos roda dentro do próprio app, depois de entradas e cadastros, e pode ser rodada à mão com `pnpm db:limpeza`.

## Segurança e privacidade, em resumo

- Só e-mail e senha. Sem CPF, sem acesso a banco, sem rastreadores, sem analytics. O único cookie é o de sessão.
- Senhas com Argon2id, com no mínimo 15 caracteres, recusando senhas comuns e vazadas (Have I Been Pwned por k-anonimato).
- Confirmação de e-mail obrigatória. Login, cadastro e recuperação não revelam quem tem conta. Limite de tentativas no servidor.
- Sessões sem IP e sem User-Agent completo. "Sair de todos os aparelhos" em "Seus dados".
- CSP com nonce e sem domínios de terceiros, HSTS, `frame-ancestors 'none'` e os demais cabeçalhos de segurança.
- Dados no Brasil (Vercel `gru1`, Neon São Paulo). Logs sem dados pessoais.

## Licença

A definir.
