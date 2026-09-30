# Operador — GitHub

- **Identificação**: GitHub, Inc. (Microsoft), EUA.
- **Finalidade**: hospedar o código-fonte aberto do Midas, issues e pull requests.
- **Dados de titulares**: **nenhum**, desde que mantidas as regras abaixo. Não é operador de dados das pessoas usuárias.
- **Tier**: Baixo.
- **DPA / cláusulas-padrão**: N/A enquanto não houver dados de titulares.
- **Regras para continuar assim**:
  - Nenhum dado real de pessoa usuária em fixtures, seeds, testes, issues ou prints.
  - Segredos só em variáveis de ambiente; `.env.development` e `.env.test` só com valores falsos de localhost; habilitar varredura de segredos do repositório (**a verificar**).
  - CI sem acesso ao banco de produção.
  - Pedido de suporte com dado pessoal chega pelo canal do encarregado, não por issue pública; orientar isso no README/CONTRIBUTING.
- **Última revisão**: 2026-09-30
- **Próxima revisão**: 2027-09-30 (anual)
- **Owner interno**: Miguel
