# Registro de Operações de Tratamento de Dados Pessoais (ROPA)

**Controlador**: Miguel Angelo (pessoa natural; enquadramento como agente de tratamento de pequeno porte a confirmar — G02) | **Contato**: a publicar com o encarregado (G01)
**Encarregado**: pendente de designação (G01)
**Versão**: v1.0 | **Data**: 2026-09-30 | **Próxima revisão**: 2027-03-30
**Skill**: `lgpd-ropa` (F10). Modelo simplificado da ANPD para ATPP (8 campos) + campos recomendados.

> Consolida [data-map.md](./data-map.md) (v2) e [legal-basis.md](./legal-basis.md). ⏸ Checkpoint: revisão do encarregado e jurídica antes de considerar final.

## Changelog

- v1.0 (2026-09-30): publicação inicial, com as atividades em uso (A001–A008) e as do núcleo do produto (A009–A014).

## I. Atividades como Controlador

Campos comuns a todas: **titulares** = pessoas usuárias adultas (idade mínima pendente — G04); **fonte** = coletado do titular, salvo indicação; **compartilhamento interno** = nenhum; **decisão automatizada** = não; **medidas de segurança gerais** = TLS (HTTPS com HSTS; banco com `verify-full`), autorização pelo `userId` da sessão em toda consulta, validação no servidor, CSP restrita sem terceiros, logs sem dado pessoal além de `userId`, exclusão física.

| ID | Operação e finalidade | Base legal | Dados (sensíveis em negrito) | Operadores | Transf. intl. | Armazenamento | Segurança específica | Alto risco / RIPD |
|---|---|---|---|---|---|---|---|---|
| A001 | Cadastro e conta | 7º, V | e-mail, nome ou apelido, hash da senha, versão e data do aceite dos termos | Neon, Vercel | Potencial ([transfers](./transfers/)) | Enquanto a conta existir; não confirmada: 7 dias | Argon2id | Não |
| A002 | Autenticação e sessões | 7º, V | token de sessão, rótulo do navegador, datas (sem IP) | Neon, Vercel | Potencial | 30 dias após o último uso | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, assinado (G13) | Não |
| A003 | Confirmação de e-mail e redefinição de senha | 7º, V | e-mail (identificador com hash), token | Neon, Vercel, Google | Potencial | 24 h / 30 min, uso único | Tokens de uso único | Não |
| A004 | E-mails transacionais | 7º, V | e-mail, nome, links | Google (Gmail SMTP) | Sim ([google-gmail](./transfers/google-gmail.md)) | Cópia no Gmail: proposta de 30 dias | Sem dado financeiro; limite de envio | Não |
| A005 | Verificação de senha vazada | 7º, V | prefixo de 5 caracteres do SHA-1 da senha (k-anonimato) | HIBP | Sim ([hibp](./transfers/hibp.md)) | Nenhum | k-anonimato | Não |
| A006 | Limite de tentativas | 7º, IX (LIA pendente — G09) | IP + rota; HMAC do e-mail; cookie de aparelho | Neon, Vercel | Potencial | 15 min a 24 h | HMAC; IP a pseudonimizar (G12) | Não |
| A007 | Eventos de segurança | 7º, IX (LIA pendente) | tipo e data do evento (inclui `DATA_EXPORTED`) | Neon, Vercel | Potencial | Proposta: 6 meses | Sem IP nem conteúdo | Não |
| A008 | Operação e logs técnicos | 7º, IX (LIA pendente) | `userId`, rota, status, código; logs da plataforma | Vercel | Potencial | Conforme Vercel (a verificar) | Logger de campos fechados | Não |
| A009 | Direitos do titular ("Seus dados") | 7º, II | todos os dados da conta; id de conta apagada | Neon, Vercel, Google | Potencial | Exportação não guardada; `deleted_account`: 8 dias | Reautenticação com senha e limite por conta | Não |
| A010 | Lançamentos, gráficos e projeção | 7º, V + **11, II, "d"** | valor, tipo, categoria, data, **descrição (pode revelar saúde), cifrada** | Neon, Vercel | Potencial | Enquanto a conta existir ou até a exclusão | AES-256-GCM no texto livre ([encryption.md](./encryption.md)); nada em logs, e-mails ou URLs | **Sim** — [RIPD](./RIPD/ripd-lancamentos.md) |
| A011 | Calculadoras trabalhistas | 7º, V | salário, datas, tipo de saída, dependentes (número), saldo do FGTS; tudo cifrado | Neon, Vercel | Potencial | Enquanto a conta existir ou até apagar a conta de calculadora | Cálculo no aparelho; guarda só ao adicionar ao planejamento | Coberto pela RIPD |
| A012 | Limites por categoria | 7º, V + **11, II, "d"** | categoria, valor mensal | Neon, Vercel | Potencial | Enquanto a conta existir | Como A010 | Coberto pela RIPD |
| A013 | Categorias próprias | 7º, V + **11, II, "d"** | **nome e ícone, cifrados** | Neon, Vercel | Potencial | Enquanto a conta existir | Como A010; até 30 por pessoa | Coberto pela RIPD |
| A014 | Fixos, rendas previstas e preferências | 7º, V + **11, II, "d"** | valor, dia, meses, **descrição cifrada**; renda prevista; último resumo aberto | Neon, Vercel | Potencial | Enquanto a conta existir | Como A010; sem agendador externo | Coberto pela RIPD |

### Observações

- Nenhuma atividade usa consentimento; nenhuma envolve menores (sujeito a G04), decisão automatizada ou IA.
- As atividades A006–A008 usam legítimo interesse e precisam das LIAs (G09) — destaque exigido pelo Art. 37.
- Operadores e fichas: [vendors/](./vendors/). DPAs e cláusulas de transferência "a verificar" (G08).

## II. Atividades como Operador

Nenhuma. O Midas não trata dados em nome de terceiros.

## III. Resumo executivo

- **Atividades como controlador**: 14 (8 em uso, 6 a implementar)
- **Como operador**: 0
- **Com dado sensível potencial**: 4 (A010, A012, A013, A014), todas no Art. 11, II, "d" com RIPD
- **Com legítimo interesse**: 3 (A006–A008), LIA pendente
- **Revisão semestral**: 2027-03-30
