# Operador — Google (Gmail via SMTP)

- **Identificação**: Google (entidade contratante **a verificar**: depende de ser conta Google pessoal ou Google Workspace). CNPJ: **a verificar**.
- **Finalidade**: enviar e-mails transacionais (confirmação, "você já tem conta", redefinição de senha, "senha trocada"), via `smtp.gmail.com:465` com senha de app.
- **Dados compartilhados**: e-mail do destinatário, apelido (se houver), link com token, texto fixo. Nunca dado financeiro. Sem marketing.
- **Atividades**: A004 (e A009 na próxima etapa: e-mail de confirmação de exclusão).
- **Tier**: Alto (e-mail de todos os titulares, com servidores globais).
- **DPA assinado**: **a verificar — risco alto**. Uma conta Gmail pessoal usa os termos de consumidor, que em regra não colocam o Google como operador sob instruções do controlador (Art. 39). Se não houver DPA, pelo critério eliminatório da skill `lgpd-vendor-audit` o serviço **não deveria ser usado** para dados de titulares.
- **Cláusulas-padrão (intl.)**: **a verificar** — ver [transfers/google-gmail.md](../transfers/google-gmail.md).
- **Certificações**: **a verificar**.
- **Suboperadores**: **a verificar**.
- **Retenção no operador**: cópias na pasta "Enviados" e devoluções na caixa de entrada — **a verificar**; proposta de 30 dias em [retention.md](../retention.md).
- **Opções de remediação** (decisão do Miguel, G08):
  1. Migrar para Google Workspace e aceitar o adendo de tratamento de dados disponível para clientes empresariais (**a verificar** conteúdo e cláusulas BR); ou
  2. Trocar por provedor de e-mail transacional com DPA e, se possível, cláusulas-padrão da Res. 19/2024 (exige nova rodada de `lgpd-vendor-audit`).
- **Segurança**: senha de app só em variável de ambiente; conta com verificação em 2 etapas; conta dedicada ao Midas (não misturar com e-mail pessoal).
- **Última revisão**: 2026-09-30
- **Próxima revisão**: 2027-03-30 (semestral) ou antes, ao decidir G08
- **Owner interno**: Miguel
