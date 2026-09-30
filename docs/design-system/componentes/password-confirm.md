# PasswordConfirm (Confirmar a senha)

> Diálogo curto que pede a senha antes de uma ação sensível: baixar os dados. (Apagar a conta pede a senha no próprio bloco da tela, sem diálogo.)

Grupo: Seus dados · Componente React: `<PasswordConfirm />` em `src/components/midas/password-confirm.tsx`, sobre o Dialog do shadcn/ui

## Anatomia

- Título (`title`): "Por segurança, digite sua senha para continuar."
- [PasswordField](../../../src/components/ui/password-field.tsx) com "Senha" e "Mostrar".
- Ações: primário com o verbo da ação ("Baixar meus dados") e secundário "Cancelar".
- Fundo `superficie`, `radius-lg`, `sombra-cartao`, véu `rgb(23 17 12 / 0.55)`, largura até 400px; no celular, 16px de margem.

## Comportamento

- Abre com o foco no campo de senha; Esc e "Cancelar" fecham e devolvem o foco ao botão que abriu.
- Enviar: botão em "Conferindo…" (`aria-busy`). Senha errada: "Senha incorreta." junto do campo, foco de volta nele. Muitas tentativas: "Muitas tentativas. Tente de novo mais tarde."
- Deu certo: o diálogo fecha e a tela mostra "Seu arquivo está pronto para baixar." com os botões de download.

## Implementação

- Dialog do shadcn/ui (Radix). Ele usa `react-remove-scroll`, que injeta uma tag `<style>`: o nonce da CSP é passado com `setNonce()` (pacote `get-nonce`) no provedor do layout raiz; sem isso a CSP bloqueia o estilo e a página rola por baixo do diálogo.
- A senha vai só no corpo da Server Action; nunca na URL, em log ou em estado global.
