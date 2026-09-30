# LGPD Audit Status

**Projeto**: Midas (app web de finanças pessoais, código aberto)
**Cenário**: A — Greenfield (Pipeline A)
**Início**: 2026-09-30
**Última atualização**: 2026-09-30
**Encarregado**: pendente designação (G01)

**Etapa do produto**: fundação + autenticação em uso (Next.js 16 na Vercel gru1; Postgres no Neon aws-sa-east-1; Better Auth com e-mail e senha). Núcleo do produto (lançamentos, fixos, limites, categorias próprias, calculadoras e rendas previstas) planejado, com RIPD v1 aguardando aprovação.

> Registros técnicos de apoio, gerados com o plugin `lgpd-skills`. Não são aconselhamento jurídico.

## Pipeline atual
- [x] F0 — Setup
- [x] F1 — Legal basis (A001–A014; parte sensível no Art. 11, II, "d"; revisão jurídica — G21)
- [x] F2 — Data mapping (v2, com A013 e A014 e as tabelas planejadas)
- [ ] F3 — Consent schema — N/A (a RIPD escolheu Art. 11, II, "d"); reavaliar se a revisão jurídica (G21) pedir consentimento
- [ ] F4 — Política de privacidade v1 ⏸ CHECKPOINT (G03)
- [~] F5 — DSAR / "Seus dados": fluxo em `dsar/workflow.md`; implementação junto com os lançamentos (G14)
- [ ] F6 — Audit logging (parcial: `securityEvent` sem IP; encadeamento pendente — G16)
- [~] F7 — Encryption & keys: decisão em `encryption.md` (G17); pendências do Neon e do `BETTER_AUTH_SECRET`
- [x] F8 — Retention & erasure (v2 proposta, com as tabelas novas e o runbook de restauração; aprovação pendente — G15)
- [ ] F9 — Incident response (G05)
- [x] F10 — ROPA v1.0 ⏸ revisão pendente (G06)
- [ ] F11 — Encarregado (G01)
- [x] F12 — RIPD dos lançamentos v1 ⏸ aprovação do controlador pendente (G07)
- [ ] F13 — ECA Digital: decisão de idade mínima (G04; recomendação 18 anos)
- [x] F14 — Vendor audit + DPA + transferências (fichas criadas; DPAs e cláusulas "a verificar" — G08)
- [ ] F15 — Relatório final

## F1 — Legal basis ✓
- 12 atividades mapeadas (8 em uso, 4 previstas)
- 0 usam consentimento
- 3 usam legítimo interesse (LIA pendente: A006, A007, A008 — G09)
- 8 usam execução de contrato (A001–A005, A010–A012)
- 1 usa obrigação legal (A009)
- 1 depende de decisão do Art. 11 (A010)

## F2 — Data mapping ✓
- 12 atividades inventariadas
- 1 envolve dado sensível potencial (A010; A012 a avaliar)
- 0 envolvem menores (depende de G04)
- 1 marcada como alto risco → RIPD pendente: A010

## F8 — Retention ✓ (proposta)
- 14 regras em [retention.md](./retention.md)
- Limpeza interna do app (após login e cadastro, no máximo 1 vez por hora por instância) + script `pnpm db:limpeza`; sem agendador externo
- Pendente: aprovar prazos de `securityEvent`, PITR e Gmail

## F14 — Vendor audit / transferências ✓ (fichas)
- 5 operadores inventariados (Crítico: Vercel, Neon; Alto: Google; Baixo: HIBP, GitHub)
- 0 com DPA e cláusulas confirmados (todos "a verificar")
- 4 fichas de transferência (Vercel, Neon, Google, HIBP)
- Risco maior: Gmail pessoal sem DPA provável (G08)

## Artefatos gerados
- `.lgpd/STATUS.md` — v1, 2026-09-30
- `.lgpd/legal-basis.md` — v1, 2026-09-30
- `.lgpd/data-map.md` — v1, 2026-09-30
- `.lgpd/retention.md` — v1 (proposta), 2026-09-30
- `.lgpd/vendors/` — README, vercel, neon, google-gmail, hibp, github — 2026-09-30
- `.lgpd/transfers/` — README, vercel, neon, google-gmail, hibp — 2026-09-30
- `.lgpd/gaps.md` — v1, 2026-09-30

Não gerados (checkpoints com aprovação humana): `.lgpd/policies/privacy-policy-v1-draft.md`, `.lgpd/ROPA.md`, `.lgpd/RIPD/ripd-lancamentos.md`.

## Gaps abertos
Ver `.lgpd/gaps.md` (18 itens; P0: G01, G02, G03, G04, G05, G08-Google, G13).

## Próximo passo
Miguel revisa estes registros e decide G02 (quem é o controlador), G04 (idade mínima) e G08 (e-mail). Depois: F4 — política de privacidade v1 com `lgpd-privacy-policy` (⏸ checkpoint, revisão jurídica), e F12 — RIPD dos lançamentos antes de começar a próxima etapa.

## F12 — RIPD ✓ (v1, aguarda aprovação)
- 1 RIPD produzida: `RIPD/ripd-lancamentos.md` (A010–A014)
- 12 riscos identificados: 11 mitigados, 1 pendente (R12, transferência internacional — G08); risco residual aceito: categoria, valor e data em claro
- Base legal da parte sensível: Art. 11, II, "d" (revisão jurídica — G21)

## F10 — ROPA ✓ (v1.0)
- `ROPA.md` com 14 atividades como controlador, 0 como operador
- Revisão semestral: 2027-03-30

## F7 — Encryption (decisão)
- Texto livre do núcleo do produto cifrado na aplicação (AES-256-GCM, AAD por linha, chaves por ambiente com rotação) — `encryption.md`

## Próximo
- Aprovar a RIPD (merge do PR de docs) → PR de fundações e de lançamentos
- Política de privacidade v2 (rascunho) quando as telas estiverem prontas
- Artefatos novos: `RIPD/ripd-lancamentos.md`, `RIPD/INDEX.md`, `ROPA.md`, `encryption.md`, `dsar/workflow.md`
