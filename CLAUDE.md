# CLAUDE.md

Guia para quem trabalha no código do Midas, pessoas e agentes de IA. Leia antes de mudar qualquer coisa.

## O projeto

O **Midas** é um app web de finanças pessoais, **de código aberto**, feito para quem quer saber "como está o meu dinheiro?" sem planilha e sem jargão. A pessoa anota o que entrou e o que saiu, vê quanto sobrou no mês e quanto deve sobrar nos próximos.

O público inclui gente com pouca familiaridade com tecnologia, pouca visão ou pouca coordenação fina. Por isso a interface é minimalista, os números são grandes, os textos são curtos e em português simples.

O projeto faz parte do portfólio de Miguel Angelo ([@miguelrsant](https://github.com/miguelrsant)), então a régua é alta: **seguro, bem construído, acessível e bem documentado**.

### O que o Midas faz

- **Lançamento fácil:** valor, categoria e pronto. Dois toques no caminho mais curto.
- **Renda fixa e variável:** salário que cai todo mês e ganhos avulsos.
- **Gastos fixos e variáveis**, com **categorias prontas** ([lista oficial](docs/design-system/15-categorias.md)).
- **Gráficos de renda x gastos** por mês e por categoria.
- **Projeção dos próximos meses**, sempre marcada como estimativa.
- **Limites por categoria**, com aviso gentil ao chegar a 90%.
- **"Seus dados":** ver, baixar e apagar tudo, sem pedir a ninguém.

### O que diferencia o Midas

1. **Calculadoras trabalhistas que alimentam o orçamento.** As calculadoras de **rescisão**, **férias** e **13º salário** não param no resultado: elas criam rendas previstas no mês em que o dinheiro deve cair, e a projeção do ano já conta com elas. Quem vai receber o 13º em dezembro ou está saindo de um emprego vê o efeito no planejamento na hora.
2. **Privacidade como promessa de marca: "Seus dados são só seus."** Sem CPF, sem RG, sem acesso a banco, sem rastreadores. Só e-mail e senha.
3. **Acessível de verdade.** WCAG 2.2 AA como piso, fonte de corpo com 17px ou mais, fonte feita para baixa visão, cores de renda e gasto seguras para daltonismo, tudo com sinal, ícone e palavra.
4. **Identidade própria.** Mármore, ouro e mogno, com o mito de Midas ao contrário: o toque de ouro é o controle sobre o próprio dinheiro.
5. **Código aberto e auditável.** Qualquer pessoa pode conferir o que o app faz com os dados.

### Fora do escopo (agora)

- Integração com bancos, Open Finance ou leitura de extratos.
- CPF, RG, telefone, endereço, data de nascimento ou qualquer documento.
- Login social, SMS ou qualquer entrada que não seja e-mail e senha.
- Integração com WhatsApp: é uma ideia para o futuro e exige revisão de LGPD antes de começar (veja abaixo).
- Investimentos, cotações, criptomoedas ou recomendações financeiras.

## Onde buscar cada coisa

| Preciso de...                                          | Onde está                                                                                                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Visão geral do design system e regras de ouro          | [docs/design-system/README.md](docs/design-system/README.md)                                                                                    |
| Cores, fontes, espaços, sombras e tempos em código     | [docs/design-system/14-tokens.md](docs/design-system/14-tokens.md) (com o `globals.css` pronto) e [tokens.json](docs/design-system/tokens.json) |
| Como um componente se comporta                         | [docs/design-system/componentes/](docs/design-system/componentes/README.md)                                                                     |
| Rotas, navegação e desenho de cada tela                | [docs/design-system/17-padroes-de-tela.md](docs/design-system/17-padroes-de-tela.md)                                                            |
| Textos, mensagens de erro, formato de dinheiro e datas | [docs/design-system/11-conteudo-e-tom.md](docs/design-system/11-conteudo-e-tom.md)                                                              |
| Categorias prontas e modelo de dados delas             | [docs/design-system/15-categorias.md](docs/design-system/15-categorias.md)                                                                      |
| Gráficos e projeção                                    | [docs/design-system/13-graficos-e-dados.md](docs/design-system/13-graficos-e-dados.md)                                                          |
| Acessibilidade e checklist                             | [docs/design-system/12-acessibilidade.md](docs/design-system/12-acessibilidade.md)                                                              |
| Como a LGPD aparece nas telas                          | [docs/design-system/16-privacidade-na-interface.md](docs/design-system/16-privacidade-na-interface.md)                                          |
| Logo, símbolo, ícone, favicon e selo                   | [docs/design-system/03-logo.md](docs/design-system/03-logo.md) e os arquivos em `public/marca/`                                                 |
| Louros, coluna e texturas de mármore                   | `public/ornamentos/` e `public/texturas/`                                                                                                       |
| Decisões e registros de LGPD                           | `.lgpd/` (gerado pelo plugin `lgpd-skills`)                                                                                                     |
| Protótipo visual do design system                      | [Midas Design System](https://claude.ai/artifact/S92PKRq1pybfHpSttekfe4) (quando discordar dos docs, valem os docs)                             |

## Stack

| Camada       | Escolha                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| App          | Next.js (App Router) com TypeScript em modo `strict`                        |
| Estilo       | Tailwind CSS v4 com os tokens do design system; shadcn/ui onde não esbarra no design system (chips, rádios e o aviso "Anotado" são nativos) |
| Ícones       | lucide-react                                                                |
| Gráficos     | SVG próprio desenhado no servidor (meses), sem biblioteca; barras por categoria e progresso com o componente `Bar` |
| Tema         | next-themes com `attribute="data-theme"` (Claro, Escuro, Automático)        |
| Banco        | PostgreSQL com Prisma                                                       |
| Autenticação | Better Auth (e-mail e senha), hash com Argon2id, sessão em cookie `HttpOnly` |
| E-mail       | SMTP (Gmail com senha de app em produção, Mailpit no dev), atrás de `EmailSender` |
| Hospedagem   | Vercel (região `gru1`) e Neon (`aws-sa-east-1`); sem Redis, fila, cache ou cron |
| Fontes       | Servidas pelo próprio app (`next/font` e `public/fontes/`), nunca de CDN    |

Mudanças de stack são decididas com o Miguel.

## Convenções

- **Dinheiro em centavos inteiros** (`Int` no banco, `number` inteiro no código). Nunca `float` para dinheiro. Converter para reais só na hora de mostrar, com `formatMoney(cents, { sign })`; ler o que a pessoa digita com `parseMoney`.
- **Formato brasileiro sempre:** `R$ 1.234,56` com espaço não separável (U+00A0) depois do `R$`, e sinal de menos verdadeiro (U+2212) em gastos: `− R$ 8,50`. Datas como "30 de setembro" ou "30/09/2026". Fuso `America/Sao_Paulo`.
- **Código em inglês, interface em português do Brasil.** Nomes de variáveis, funções e tabelas em inglês; rotas, textos e mensagens em pt-BR (`/lancamentos`, `/calculadoras/ferias`, `/seus-dados`).
- **Textos da interface** seguem [Conteúdo e tom](docs/design-system/11-conteudo-e-tom.md): "Entrou", "Saiu", "Sobrou"; frases curtas; sem jargão financeiro.
- **Cálculos trabalhistas** (INSS, IRRF, FGTS, multa, avisos, prazos) ficam em módulos puros, com testes, e com as **tabelas versionadas por vigência** e a fonte oficial citada em comentário (lei, portaria ou tabela da Receita Federal e do INSS). Quando a tabela mudar, adicione a nova vigência; não sobrescreva a antiga. O resultado é sempre apresentado como estimativa.
- **Testes:** toda regra de dinheiro, projeção e calculadora tem teste unitário com casos de borda (centavos, arredondamento, meses de 28 a 31 dias, anos bissextos).
- **Datas sem hora** (data de lançamento, vencimentos) são texto `"AAAA-MM-DD"` (`DateOnly`) e meses são `"AAAA-MM"` (`MonthKey`). No banco, colunas `date`; a conversão acontece só na camada de dados (`toDbDate`/`fromDbDate`, sempre meia-noite UTC). "Hoje" vem de `todayInSaoPaulo()` e é passado como parâmetro às funções de domínio; nada de `new Date()` escondido nem `CURRENT_DATE` no SQL.
- **Server Actions** passam por `authedAction` (`src/lib/actions/`): sessão conferida sem redirecionar (devolve `session_expired`, para não perder o que foi digitado), Zod `.strict()`, limite de escrita por pessoa, acesso a dados em `src/lib/data/*` sempre com o `userId` da sessão, `refresh()` depois de mudar dados. Nunca `upsert` por id vindo do cliente.
- **Texto livre cifrado:** descrições, nomes de fixos, nome e ícone de categorias próprias e contas de calculadora são cifrados na aplicação (`src/lib/crypto/fields.ts`, AES-256-GCM com AAD por linha). Veja `.lgpd/encryption.md`.
- **Nada de dado financeiro na URL** (valores, salários, respostas de calculadora, termos de busca): a URL leva só mês, ano, passo e ids aleatórios.
- **Sem `style=""` vindo do servidor:** a CSP bloqueia. Larguras e alturas por classe pronta (`w-[37%]`, geradas no `globals.css`) ou atributo de SVG.
- **Fixos sem cron (exceção registrada):** os lançamentos dos fixos são criados como "reparo na leitura", no carregamento dos dados das páginas (`ensureRecurringUpToDate`), de forma idempotente. É uma exceção consciente à orientação do Next.js de não escrever durante a renderização: nunca em layout, nunca em prefetch, e só com compare-and-set e chave única.
- **Commits pequenos**, com mensagem que diz o porquê.

## Regras do design system

As regras completas estão nos docs. As que mais se quebram sem querer:

- **Use os tokens**, nunca hexadecimais soltos no componente. Cores por variável CSS, para trocarem com o tema.
- **Números nunca em Marcellus** (os algarismos parecem letras). Valores usam `font-classica` ou `font-display` (a Midas Display já troca os dígitos).
- **Renda e gasto nunca só pela cor:** sinal + ou −, ícone e palavra, sempre.
- **Ouro não é cor de texto:** use `ouro-texto`; sobre ouro, `sobre-ouro`.
- **Um mármore por tela** e **um acento itálico dourado por título**.
- **O toque de ouro (`md-toque`) só no botão que salva um lançamento novo.**
- **Nada de animação infinita.** Respeite `prefers-reduced-motion`.
- **Corpo com 17px ou mais**, alvos de 44px ou mais, foco sempre visível.
- Antes de entregar uma tela, passe pelo [checklist de tela nova](docs/design-system/17-padroes-de-tela.md#checklist-de-uma-tela-nova).

## Segurança

O Midas guarda a vida financeira das pessoas. Trate cada linha de código como se fosse auditada, porque é código aberto e vai ser.

- **Senhas:** Argon2id com parâmetros atuais recomendados pela OWASP; mínimo de 8 caracteres (piso do NIST SP 800-63B-4; decisão do projeto para facilitar a digitação, compensada pela recusa de senhas comuns e vazadas e pelo limite de tentativas), sem regras de composição. Nunca registrar, logar ou devolver a senha.
- **Sessão:** cookie `HttpOnly`, `Secure`, `SameSite=Lax`, token aleatório; renovar ao entrar e ao trocar a senha; "Sair de todos os aparelhos" invalida tudo. **Exceção registrada:** o Better Auth guarda o token da sessão em claro na tabela `session`; o cookie leva o token com assinatura HMAC (`BETTER_AUTH_SECRET`), então uma cópia só do banco não monta um cookie válido. Não habilite o plugin `bearer` sem rever isso (`.lgpd/gaps.md`, G13). Sessões não guardam IP nem User-Agent completo.
- **Ações sensíveis** (apagar conta, trocar senha ou e-mail, baixar dados) pedem a senha de novo.
- **Mensagens que não revelam contas:** login, cadastro e recuperação respondem igual exista ou não o e-mail.
- **Limite de tentativas** no servidor para entrar, cadastrar e recuperar senha.
- **Autorização em toda consulta:** todo acesso a dados filtra pelo `userId` da sessão, no servidor. Nunca confiar em id vindo do cliente.
- **Validação** de toda entrada no servidor (por exemplo, com Zod), inclusive em Server Actions.
- **Cabeçalhos:** Content Security Policy restrita (sem domínios de terceiros), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`.
- **Segredos** só em variáveis de ambiente; nunca no repositório, em logs ou em mensagens de erro. `.env.development` e `.env.test` versionados só com valores falsos de localhost.
- **Logs sem dados pessoais nem financeiros:** nada de e-mail, valores ou descrições de lançamentos em logs, erros ou ferramentas de monitoramento.
- **Dependências** mínimas e atualizadas; revisar antes de adicionar qualquer uma.

## LGPD e o plugin lgpd-skills

O Midas trata dados pessoais e precisa seguir a **LGPD (Lei 13.709/2018)** desde o primeiro commit: privacidade desde a concepção e por padrão. Isso não é opcional.

### Regras que valem sempre

- **Necessidade:** colete só o que a funcionalidade precisa. Hoje: e-mail, hash da senha, nome ou apelido (obrigatório, só para a saudação), lançamentos, respostas das calculadoras, limites. Qualquer dado novo exige motivo escrito e revisão com o plugin.
- **Finalidade:** os dados servem para mostrar as finanças da própria pessoa. Nunca para perfilar, pontuar, vender ou anunciar.
- **Dado sensível:** lançamentos podem revelar saúde (categoria Saúde, descrições como "farmácia"). Trate **todo lançamento como confidencial**: só a dona ou o dono vê, fora de logs e de e-mails.
- **Direitos do titular (art. 18)** na própria interface: acessar, corrigir, baixar (JSON e CSV) e apagar a conta. Veja [Privacidade na interface](docs/design-system/16-privacidade-na-interface.md).
- **Sem rastreadores:** só cookies estritamente necessários (o de sessão e o de aparelho, que protege a entrada contra bloqueio por terceiros); sem analytics de terceiros, pixels ou fontes de outros domínios. Se um dia entrar um cookie não essencial, só com consentimento.
- **Transparência:** política de privacidade em linguagem simples, com versão e data, e contato do encarregado.
- **Operadores** (hospedagem, envio de e-mail) listados em "Seus dados" e na política, com contrato adequado e atenção a transferência internacional.
- **Incidentes** seguem um plano escrito; a comunicação à ANPD e aos titulares tem prazo (Resolução CD/ANPD nº 15/2024).

### Use o plugin `lgpd-skills` para ajudar

O projeto habilita o plugin [lgpd-skills](https://github.com/goul4rt/lgpd-skills) (licença MIT) em [`.claude/settings.json`](.claude/settings.json):

```json
"enabledPlugins": { "lgpd-skills@lgpd-skills": true }
```

Ao abrir o projeto no Claude Code, aceite a instalação do marketplace. Se precisar instalar à mão:

```text
/plugin marketplace add goul4rt/lgpd-skills
/plugin install lgpd-skills@lgpd-skills
```

Para atualizar: `/plugin marketplace update lgpd-skills`.

O plugin tem um maestro, **`lgpd-audit`**, que escolhe o caminho (para o Midas, o **Pipeline A**, projeto novo com privacidade desde a concepção) e chama as outras skills. Elas geram registros versionados em **`.lgpd/`**, que fazem parte do repositório e devem ser revisados em PR como qualquer código.

| Quando você for...                                                     | Use a skill                     |
| ---------------------------------------------------------------------- | ------------------------------- |
| Começar o projeto ou revisar a conformidade geral                      | `lgpd-audit`                    |
| Definir a base legal de cada tratamento                                | `lgpd-legal-basis`              |
| Mapear quais dados existem e por onde passam                           | `lgpd-data-mapping`             |
| Manter o registro das operações de tratamento                          | `lgpd-ropa`                     |
| Avaliar risco de um tratamento novo (relatório de impacto)             | `lgpd-ripd`                     |
| Criar qualquer consentimento ou caixa opcional                         | `lgpd-consent-schema`           |
| Implementar acesso, correção, exportação e exclusão                    | `lgpd-dsar`                     |
| Escrever ou atualizar a política de privacidade                        | `lgpd-privacy-policy`           |
| Definir prazos de guarda e como apagar (inclusive cópias de segurança) | `lgpd-retention-erasure`        |
| Criar trilha de auditoria sem vazar dados                              | `lgpd-audit-logging`            |
| Decidir criptografia e gestão de chaves                                | `lgpd-encryption-keys`          |
| Anonimizar dados para estatística ou testes                            | `lgpd-anonymization`            |
| Contratar hospedagem, e-mail ou outro fornecedor                       | `lgpd-vendor-audit`, `lgpd-dpa` |
| Usar serviço com servidores fora do Brasil                             | `lgpd-international-transfer`   |
| Definir o encarregado e o canal com o titular                          | `lgpd-dpo-encarregado`          |
| Preparar ou responder a um incidente de segurança                      | `lgpd-incident-response`        |
| Decidir idade mínima ou atender menores (ECA Digital, Lei 15.211/2025) | `lgpd-eca-digital-minors`       |
| Adequar código antigo                                                  | `lgpd-legacy-retrofit`          |

**Quando rodar obrigatoriamente:** antes de criar qualquer tabela ou campo com dado pessoal, antes de adicionar um fornecedor ou dependência que receba dados, antes de mudar a política, e antes de começar a **integração com WhatsApp** (telefone é um dado novo e muda o mapa de dados, a base legal e a política).

> O plugin ajuda a organizar e documentar a conformidade, mas **não é aconselhamento jurídico**. Decisões importantes devem ser revisadas por uma pessoa especialista em proteção de dados.

## Como trabalhar neste repositório

1. Leia a página do design system e a seção de LGPD que tocam a tarefa antes de programar.
2. Siga as convenções e as regras de segurança acima; na dúvida, escolha a opção que coleta menos e expõe menos.
3. Rode lint, checagem de tipos e testes antes de abrir um PR.
   Se o PR toca autenticação, dados pessoais, e-mail, configuração ou dependências, rode também o agente de revisão de segurança ([.claude/agents/security-reviewer.md](.claude/agents/security-reviewer.md)): ele pensa como quem ataca e só relata achados confirmados.
4. Se uma decisão mudar o design system, atualize os docs no mesmo PR. Se mudar o tratamento de dados, atualize `.lgpd/` no mesmo PR.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
