# Direitos do titular — fluxo ("Seus dados")

**Versão**: v1 | **Data**: 2026-09-30 | **Skill**: `lgpd-dsar` (F5)
**Normas**: LGPD Art. 18 (direitos), Art. 19 (prazos: resposta simplificada imediata; completa em até 15 dias), Art. 9º (informação).
**Tela**: `/seus-dados` ([Privacidade na interface](../../docs/design-system/16-privacidade-na-interface.md)).

> O Midas atende os direitos por **autosserviço imediato**, sem pedido a ninguém. Pedidos por e-mail ao encarregado (G01) seguem o mesmo prazo de 15 dias e são atendidos com as mesmas funções.

## Mapa dos direitos

| Direito (Art. 18) | Como | Prazo |
|---|---|---|
| I — Confirmação | Seção "O que o Midas guarda", com as contagens da pessoa | Imediato |
| II — Acesso | "Baixar meus dados" (JSON completo) | Imediato |
| III — Correção | Tocar no item e editar; apelido e senha em Configurações | Imediato |
| IV — Anonimização, bloqueio ou eliminação | Excluir o item (lançamento, fixo, limite, categoria, conta de calculadora, renda prevista) | Imediato |
| V — Portabilidade | JSON (chaves em pt-BR) + CSV de lançamentos | Imediato |
| VI — Eliminação | "Apagar minha conta" | Imediato (cópias de restauração: até 7 dias) |
| VII — Compartilhamento | Política de privacidade (operadores e motivo de cada um) | Imediato |
| VIII e IX — Consentimento | N/A: nenhuma atividade usa consentimento | — |
| Art. 20 — Revisão de decisão automatizada | N/A | — |

## Baixar meus dados

1. A pessoa toca em "Baixar meus dados"; um diálogo pede a senha ("Por segurança, digite sua senha para continuar.").
2. Server Action `exportDataAction({ password })`: sessão válida → limite por conta (`consume("pwcheck:<userId>")`, 10 por hora) → confere a senha → monta o arquivo **na hora**, a partir do banco, com o texto livre decifrado → registra `DATA_EXPORTED` em `security_event` → devolve `{ fileBase, json, csv }`.
3. O navegador cria os arquivos (`midas-dados-AAAA-MM-DD.json` e `.csv`) com `Blob` e oferece o download. Nada é guardado no servidor, em cache ou em log.

**Conteúdo do JSON** (versão do formato `1`): `formato`, `geradoEm`, `conta` (apelido, e-mail, criada em, versão dos termos), `aparelhos` (rótulo, último uso), `eventosDeSeguranca` (tipo, data), `categoriasProprias`, `lancamentos` (data, tipo, categoria id e nome, descrição, valor em centavos e em reais), `fixos`, `limites`, `rendasPrevistas`, `contasDeCalculadora` (respostas e resultado), `preferencias`. Toda tabela com `userId` precisa aparecer (teste automático).

**CSV**: só os lançamentos — `data;tipo;categoria_id;categoria;descricao;valor` com BOM UTF-8, separador `;`, fim de linha CRLF, texto entre aspas, vírgula decimal e sinal `-` ASCII (para o Excel ler como número). Células de texto que começam com `=`, `+`, `-`, `@`, tabulação ou retorno (inclusive as formas de largura total) recebem um apóstrofo na frente (proteção contra injeção de fórmula).

## Apagar minha conta

1. No fim da tela, "Apagar minha conta" abre um bloco na própria página: "Isso apaga sua conta, seus 312 lançamentos e as respostas das calculadoras. Não dá para desfazer." + "Quer baixar seus dados antes?".
2. A pessoa digita a senha e toca em "Apagar minha conta e meus dados" (ou "Manter minha conta").
3. Server Action `deleteAccountAction({ password })`: sessão válida → limite `pwcheck` → confere a senha → **uma transação**: grava `deleted_account(id, deletedAt)`, apaga `verification` da pessoa, apaga `user` (cascata em todas as tabelas com `userId`) → encerra a sessão e remove os cookies → envia, **depois**, o e-mail "Sua conta foi apagada" (sem dado financeiro; o endereço fica só na memória da requisição) → redireciona para `/conta-apagada`.
4. Tela final: "Sua conta foi apagada. Obrigado por ter usado o Midas."
5. O que resta por um tempo (dito na tela e na política): cópias de restauração do Neon (até 7 dias; exclusões reaplicadas se houver restore — [retention.md](../retention.md)), cópia do e-mail no Gmail (proposta: 30 dias), logs da plataforma (prazo da Vercel).

## Erros e limites

- Senha errada: "Senha incorreta." e o foco volta ao campo; depois de 10 tentativas em 1 hora: "Muitas tentativas. Tente de novo mais tarde."
- Sessão vencida: a ação devolve `session_expired` e a tela leva à entrada, voltando depois para "Seus dados".
- Falha na exclusão: nada é apagado (transação) e nenhum e-mail sai.

## Testes obrigatórios

- Exportação contém todas as tabelas com `userId` e só os dados da própria pessoa.
- Toda chave estrangeira para `user` tem `ON DELETE CASCADE`.
- Depois de apagar: entrar falha; nenhuma linha com o `userId` sobra; `deleted_account` tem o id.
- CSV com descrição `=HYPERLINK(...)` sai neutralizado.
