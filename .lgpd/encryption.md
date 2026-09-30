# Criptografia e gestão de chaves — Midas

**Versão**: v1 | **Data**: 2026-09-30
**Skill**: `lgpd-encryption-keys` (F7, Pipeline A)
**Normas**: LGPD Art. 46 (dever de segurança), Art. 6º, VII; Guia de Segurança da Informação para Agentes de Tratamento de Pequeno Porte (ANPD).
**Decide**: G17 (criptografia de coluna para o texto livre dos lançamentos).

> Registro técnico de apoio, não aconselhamento jurídico.

## Camadas

| Camada | Como | Protege contra | Situação |
|---|---|---|---|
| Em trânsito | HTTPS (HSTS 2 anos) no navegador; TLS `sslmode=verify-full` entre Vercel e Neon (`src/lib/db-url.ts`) | Escuta e interceptação | em uso |
| Em repouso (disco) | Criptografia do provedor no Neon (AES-256, **a confirmar no painel e no DPA** — G08) | Roubo de mídia no data center | a confirmar |
| Senhas | Argon2id (m=19456, t=2, p=1; `src/lib/auth/password.ts`) | Vazamento do banco | em uso |
| Chaves de contadores | HMAC-SHA256 com `BETTER_AUTH_SECRET` (`src/lib/throttle.ts`) | Descobrir e-mails pelo banco | em uso |
| **Texto livre do núcleo do produto** | **AES-256-GCM na aplicação** (abaixo) | Cópia do banco (backup, branch, credencial vazada, incidente no provedor, leitura via SQL) | a implementar (PR de fundações) |
| Sessão | Token em claro na tabela `session`; cookie assinado com HMAC (exceção G13) | — | exceção registrada |

## Criptografia de campo (G17)

**Decisão**: cifrar na aplicação todo texto livre ou revelador que a pessoa digita no núcleo do produto; manter em claro o que o banco precisa somar e filtrar.

| Tabela.coluna | Conteúdo | Cifrado? |
|---|---|---|
| `entry.description` | descrição opcional do lançamento | **Sim** |
| `recurring.description` | nome do fixo ("Aluguel", "Psicóloga") | **Sim** |
| `user_category.sealed` | nome **e** ícone da categoria própria, juntos (o ícone "remédio" também revela) | **Sim** |
| `calculation.sealed` | respostas, resultado, versão do motor e tabelas usadas | **Sim** |
| `entry.amountCents`, `date`, `categoryId`, `kind` | somas, meses, gráficos, limites | Não (risco residual aceito na [RIPD](./RIPD/ripd-lancamentos.md#10-risco-residual)) |
| `expected_income.*` | valor, data e chave de rótulo gerada pelo sistema | Não (sem texto livre) |

### Esquema

- **Algoritmo**: AES-256-GCM de `node:crypto`, IV aleatório de 96 bits por cifra, tag de 128 bits.
- **Formato**: `v1.<kid>.<iv>.<ct+tag>` em base64url, num `text` com `CHECK` de tamanho.
- **Dado associado (AAD)**: `midas|<tabela>.<coluna>|<userId>|<rowId>`. Uma cifra copiada para outra linha, outra coluna ou outra conta não abre. Por isso o id da linha é gerado na aplicação antes do insert.
- **Chaves**: `DATA_ENCRYPTION_KEYS` = lista `kid:base64(32 bytes)` separada por vírgulas; `DATA_ENCRYPTION_KEY_ID` = kid usado para cifrar. Todas as chaves da lista servem para abrir.
  - Uma chave diferente por ambiente (produção, preview, desenvolvimento, teste); nunca reutilizar `BETTER_AUTH_SECRET`.
  - `.env.development` e `.env.test` versionados só com chaves falsas de exemplo.
  - Produção: só nas variáveis de ambiente da Vercel (marcadas como sensíveis) e numa cópia offline (gerenciador de senhas do controlador). **Perder a chave torna as descrições ilegíveis para sempre.**
- **Rotação**: gerar nova chave, adicioná-la à lista e trocar o `DATA_ENCRYPTION_KEY_ID`; rodar `scripts/recifrar.mts` (reabre com qualquer chave e recifra com a atual, em lotes); remover a chave antiga depois da janela do PITR. Rotação anual ou imediata se houver suspeita de vazamento.
- **Falha ao abrir** (chave ausente, cifra adulterada): a tela mostra o nome da categoria no lugar da descrição e o log registra só o código do erro; nunca um erro 500 nem o conteúdo.
- **Busca**: a busca por descrição é feita no navegador sobre os lançamentos do mês já abertos pelo servidor; o termo nunca vai ao servidor nem à URL.

### O que isso protege e o que não protege

- Protege: descrições, nomes e contas de calculadora numa cópia só do banco (backup, branch, dump, credencial do banco vazada, leitura por SQL injection).
- Não protege: comprometimento da aplicação ou das variáveis de ambiente da Vercel (quem tem a chave e o banco lê tudo); nem categoria, valor e data, que ficam em claro.

## Pendências

- Confirmar a criptografia em repouso do Neon no painel e no DPA (G08).
- Rotação do `BETTER_AUTH_SECRET` (continua em G17).
