# LoginScreen (Tela de entrada)

> A tela de entrada do Midas (`/entrar`): um cartão sobre o mármore, com o selo ao fundo, cujo aro assenta ao abrir a tela; o mesmo layout serve ao cadastro (`/criar-conta`) e à recuperação de senha (`/recuperar-senha`).

Grupo: Marca · Classe base: `md-entrada` (fundo) e `md-entrada-cartao` (cartão) · Componentes React sugeridos: `<AuthLayout />`, `<LoginForm />`, `<SignUpForm />`, `<RecoverPasswordForm />`, `<PasswordField />`

## Quando usar

| Rota | Tela | Título |
| --- | --- | --- |
| `/entrar` | Entrada | Que bom te ver *de novo*. |
| `/criar-conta` | Cadastro | Suas finanças *em ordem*. |
| `/recuperar-senha` | Recuperação de senha | Esqueceu a senha? *Acontece*. |

Use o `AuthLayout` em toda tela de pessoa ainda não identificada. A tela de nova senha (aberta pelo link do e-mail) usa o mesmo layout e as regras de senha do cadastro.

## Quando não usar

- Dentro do app logado: lá valem o [AppHeader](app-header.md) e o fundo `marmore` liso.
- Para confirmar uma ação sensível já logado (por exemplo, apagar a conta): use um diálogo, não esta tela.
- Não coloque nada além do formulário e do aviso de privacidade no cartão: sem propaganda, sem lista de recursos.

## Anatomia

1. **Fundo (`md-entrada md-marmore-pleno`):** textura Calacatta (claro) ou Portoro (escuro) em `cover` sobre `marmore`. Altura mínima da tela toda. Nenhum texto fica direto sobre a textura.
2. **Selo contorno:** `md-selo md-selo-contorno` inline, 380px, cortado no canto inferior direito (120px para fora), opacidade 0,55 (faixa aceita: 0,50 a 0,55). Decorativo, `aria-hidden="true"`. Ao abrir a tela, o aro gira de −20° até 0° em `duracao-selo` (5s), com `cubic-bezier(.2,.7,.2,1)`, uma única vez, e para; o centro fica parado. Ajuste em relação ao protótipo, que girava uma volta a cada 90s, sem parar (veja Acessibilidade e [Seal](seal.md)).
3. **Cartão (`md-entrada-cartao`):** `superficie`, `radius-lg`, `sombra-cartao`, até 400px de largura, padding 32px/24px, itens em coluna com 16px de espaço.
4. **Logo:** `<MidasLogo />` inline, 40px de altura, centralizado.
5. **Título (`h1`):** `display` em 30px/36px (o `display-lg` reduzido para caber no cartão de 400px, como em [Tipografia](../05-tipografia.md)), centralizado, `tinta`, com um acento em `ouro-texto`.
6. **Campos (`md-field`):** rótulo `label` (15px/20px, 600, `tinta`) acima; campo `md-input md-input-text` (52px de altura mínima, `superficie-funda`, borda 1px `borda`, `radius-md`, texto `body` em `tinta`); ajuda em `caption` `tinta-suave`.
7. **Botão Mostrar/Ocultar** (só no campo de senha): `md-btn-ghost` dentro do campo, 44px, ícone `eye`/`eye-off` e texto `ouro-texto`.
8. **Caixa de aceite** (só no cadastro): checkbox nativo de 24px, desmarcado, com o rótulo e o link para a política.
9. **Botão principal:** `md-btn-primary md-btn-lg` (56px, 17px), largura total: "Entrar", "Criar conta" ou "Enviar link".
10. **Link secundário:** `md-link` centralizado ("Esqueci minha senha").
11. **Veio (`md-veio`):** divisória em `ouro`, o único da tela.
12. **Troca de tela:** `caption` em `tinta-suave` com link ("Ainda não tem conta? Criar conta").
13. **Aviso de privacidade (`md-notice`, `role="note"`):** ícone `shield-check` em `ouro-texto`, 14px/20px, sempre visível.

## Variantes

| Variante | Campos | Botão | Link abaixo do botão | Troca de tela |
| --- | --- | --- | --- | --- |
| Entrada (`/entrar`) | E-mail (`autocomplete="email"`), Senha (`current-password`) | Entrar | Esqueci minha senha | Ainda não tem conta? Criar conta |
| Cadastro (`/criar-conta`) | Nome (`nickname`), E-mail (`email`), Senha (`new-password`), aceite da política | Criar conta | nenhum | Já tem conta? Entrar |
| Recuperação (`/recuperar-senha`) | E-mail (`email`) | Enviar link | nenhum | Lembrou a senha? Entrar |
| Recuperação enviada | nenhum; o formulário dá lugar à confirmação | nenhum | Voltar para a entrada | nenhum |

Todas usam os mesmos tokens: `marmore`, `superficie`, `superficie-funda`, `borda`, `tinta`, `tinta-suave`, `ouro-texto`, `ouro`, `primario`, `sobre-primario`, `alerta`, `foco`.

## Estados

| Estado | Aparência | Tokens | Observação |
| --- | --- | --- | --- |
| Padrão | Campos vazios (o navegador pode preencher). | `superficie-funda`, `borda` | Sem foco automático: a pessoa ouve o título primeiro. |
| Foco no campo | Anel 2px `foco` em volta do campo inteiro (`md-input:focus-within`). | `foco` | |
| Senha visível | Texto em claro; botão "Ocultar" com `eye-off`; o leitor de tela ouve "Senha visível". | `ouro-texto` | |
| Erro de campo | Borda 2px `gasto`, mensagem abaixo com `triangle-alert`, `aria-invalid="true"`. | `gasto` | Só para campo vazio ou mal formado, e para as regras de senha do cadastro. |
| Erro de credenciais | [Notice](notice.md) `is-alerta` acima do botão: "E-mail ou senha incorretos." | `alerta` | Nenhum campo marcado: não diga qual está errado. |
| Muitas tentativas | Notice `is-alerta`: "Muitas tentativas. Espere 1 hora e tente de novo." | `alerta` | Mesma resposta exista ou não a conta. |
| Enviando | Botão com "Entrando…" (ou "Criando conta…", "Enviando…"), `aria-disabled="true"`, sem novo envio. | `primario` | O foco fica no botão. |
| Erro de rede | Notice `is-alerta`: "Não foi possível conectar. Confira a internet e tente de novo." | `alerta` | Os campos mantêm o que foi digitado. |
| Recuperação enviada | O formulário dá lugar a um Notice com a resposta única. | `ouro-texto` | Veja Conteúdo. |

## Medidas

| Propriedade | Valor | Token |
| --- | --- | --- |
| Altura mínima do fundo | 100dvh no app (640px no protótipo) | |
| Padding do fundo | 32px vertical, 16px lateral | `space-8`, `space-4` |
| Largura do cartão | 100%, até 400px | |
| Padding do cartão | 32px vertical, 24px lateral | `space-8`, `space-6` |
| Espaço entre itens do cartão | 16px | `space-4` |
| Logo | 40px de altura | |
| Título | 30px/36px | `display` reduzido |
| Campo | 52px de altura mínima, padding 12px/16px | `space-3`, `space-4` |
| Rótulo → campo | 8px | `space-2` |
| Botão Mostrar/Ocultar | 44px de altura (o protótipo usa 36px; corrigido) | |
| Botão principal | 56px, largura total | `md-btn-lg` |
| Selo | 380px, deslocado −120px à direita e embaixo; 280px e −100px abaixo de 480px de largura (sugestão) | |
| Opacidade do selo | 0,50 a 0,55 | |

## Tokens usados

| Token | Onde |
| --- | --- |
| `marmore` + textura | Fundo (`md-marmore-pleno`). |
| `superficie`, `sombra-cartao`, `radius-lg` | Cartão. |
| `superficie-funda`, `borda`, `radius-md` | Campos. |
| `tinta` | Título, rótulos, texto digitado, aviso. |
| `tinta-suave` | Ajudas, "Ainda não tem conta?". |
| `ouro-texto` | Acento, links, botão Mostrar, ícone do aviso. |
| `ouro` | Veio; moeda do logo; moeda do selo contorno. |
| `mogno` / `ouro-texto` | Linhas do selo contorno (claro / escuro). |
| `primario`, `primario-hover`, `sobre-primario` | Botão principal. |
| `gasto` | Erro de campo. |
| `alerta` | Ícone do Notice de erro. |
| `foco` | Anéis de foco. |
| `duracao-selo` (5s), `duracao-rapida` | Aro do selo assentando; hover e estados. |

## Conteúdo

**Títulos:** um acento por título. Entrada: "Que bom te ver *de novo*." Cadastro: "Suas finanças *em ordem*." Recuperação: "Esqueceu a senha? *Acontece*."

**Rótulos:** "Nome", "E-mail", "Senha". Ajuda do nome: "Como o Midas vai te chamar. Pode ser um apelido." Ajuda do e-mail: "Para entrar e recuperar a senha."

**Senha no cadastro:** no mínimo 8 caracteres, sem exigir maiúscula, número ou símbolo. Ajuda: "Use 8 caracteres ou mais." As regras completas (senhas comuns e vazadas, limite máximo, colar) estão em [Privacidade na interface](../16-privacidade-na-interface.md).

**Mensagens de segurança (textos fixos):**

| Situação | Mensagem |
| --- | --- |
| E-mail ou senha errados, ou conta inexistente | E-mail ou senha incorretos. |
| Muitas tentativas | Muitas tentativas. Espere 1 hora e tente de novo. |
| Recuperação enviada (sempre, exista ou não a conta) | Se esse e-mail tiver conta no Midas, você vai receber um link em alguns minutos. |
| Senha curta | A senha precisa ter pelo menos 8 caracteres. Faltam 3. |
| Senha comum | Essa senha é muito usada e fácil de adivinhar. Tente uma frase só sua. |
| Senha vazada | Essa senha já apareceu em vazamentos de outros sites. Escolha outra, de preferência uma frase. |
| Campo de e-mail vazio | Digite seu e-mail. |
| E-mail sem @ ou domínio | Confira o e-mail. Ele precisa ter @ e o endereço, como nome@exemplo.com.br. |
| Política não aceita | Para criar a conta, marque que aceita a Política de privacidade. |

No cadastro, um e-mail já cadastrado não gera mensagem na tela: a pessoa vê "Enviamos um link para confirmar a conta" e o e-mail explica que a conta já existe. Assim a tela não revela quem tem conta.

**Aceite:** "Li e aceito a Política de privacidade." com a caixa desmarcada e o link em "Política de privacidade" (abre em nova aba, com o aviso escondido " (abre em nova aba)").

**Aviso de privacidade:** "Sem CPF e sem acesso ao seu banco. Seus dados são só seus."

| Faça | Evite |
| --- | --- |
| E-mail ou senha incorretos. | Não encontramos uma conta com esse e-mail. |
| Se esse e-mail tiver conta no Midas, você vai receber um link em alguns minutos. | E-mail enviado para miguel@exemplo.com.br! |
| Use 8 caracteres ou mais. | A senha deve conter maiúscula, número e caractere especial. |
| Muitas tentativas. Espere 1 hora e tente de novo. | Conta bloqueada. |

## Acessibilidade

- **Estrutura:** `<main>` com o cartão; o cartão é um `<form noValidate>` com o `h1` dentro. Título da página: "Entrar · Midas", "Criar conta · Midas", "Recuperar senha · Midas".
- **Rótulos:** `<label for>` visível em cada campo. O botão Mostrar/Ocultar fica **fora** do `<label>` (o protótipo o põe dentro, e aí o nome do campo vira "Senha Mostrar").
- **Mostrar/Ocultar:** `<button type="button" aria-controls="senha">`, sem `aria-pressed` (o próprio rótulo já muda, e os dois juntos se contradizem). O texto visível alterna entre "Mostrar" e "Ocultar", com `<span class="md-sr"> senha</span>` para o nome completo, e uma região `aria-live="polite"` escondida anuncia "Senha visível" ou "Senha oculta"; o ícone alterna entre `eye` e `eye-off`, com `aria-hidden`. Ao ativar, o `type` do campo alterna entre `password` e `text` e o foco fica no botão. Antes de enviar, volte o campo a `password` (evita que o navegador salve o texto no histórico de formulário).
- **Autocomplete:** `email` no e-mail (com `inputmode="email"` e `autocapitalize="none"`), `current-password` na entrada, `new-password` no cadastro e na nova senha, `nickname` no apelido. Nunca bloqueie colar nem gerenciadores de senha.
- **Erros de campo:** `aria-invalid="true"` e `aria-describedby` apontando para a mensagem. No envio com erros, o foco vai para o primeiro campo com erro.
- **Erros gerais:** o Notice de erro fica numa região `role="alert"` que já existe (vazia) no cartão; é anunciado sem mover o foco.
- **Recuperação enviada:** o texto aparece numa região `role="status"`, e o foco vai para o título da confirmação (`tabindex="-1"`).
- **Autenticação acessível (WCAG 3.3.8):** sem CAPTCHA visual de imagens, sem quebra-cabeça, sem transcrever caracteres. Proteção contra robôs fica no servidor (limite de tentativas, atraso progressivo).
- **Selo:** contêiner com `aria-hidden="true"` e o `<svg>` sem `role` nem `aria-label` (o protótipo tem `role="img" aria-label=""`, que é contraditório).
- **Movimento:** o aro do selo assenta uma única vez ao abrir a tela (−20° até 0° em 5s) e para. Assim a tela cumpre a WCAG 2.2.2 (nível A), que exige pausa para movimento automático de mais de 5 segundos ao lado de outro conteúdo; o giro infinito do protótipo (uma volta a cada 90s) falharia. Com `prefers-reduced-motion: reduce`, nada gira: o selo aparece já parado na posição final.
- **Contraste (Calacatta / Portoro, sobre `superficie`):** `tinta` 15,51 / 14,59; `tinta-suave` 6,81 / 8,44; `ouro-texto` 5,98 / 10,06; texto do botão 9,47 / 8,99; `borda` dos campos 3,31 / 3,66 sobre `superficie-funda` (mínimo de 3:1 para controles); `gasto` 6,11 / 7,53.
- **Toque:** campos com 52px, botões com 44px ou mais, caixa de aceite com o rótulo inteiro clicável (alvo de pelo menos 44px de altura).

## Comportamento responsivo

- **Celular:** o cartão ocupa a largura toda menos 16px de cada lado; o fundo mantém 32px em cima e embaixo. O selo diminui para 280px para não competir com o cartão.
- **Desktop:** cartão de 400px centralizado vertical e horizontalmente.
- **Altura curta ou zoom alto:** o fundo cresce com o conteúdo (`min-height`, nunca `height` fixa) e a página rola. Nada fica escondido sob o selo, que está atrás do cartão (`position: relative` no cartão).
- **Teclado virtual:** com `100dvh`, a página rola até o campo ativo.
- **Tema:** sempre Calacatta (claro), qualquer que seja o aparelho. O Portoro com mármore ficou pesado atrás do cartão (decisão de 30/09/2026).
- **Sem rolagem:** o cartão cabe inteiro a partir de 390×844 (celular) e 1366×768 (notebook), com ajudas de uma linha. Em telas menores a página rola; nunca esconda conteúdo para caber.

## Casos-limite

- **E-mail muito longo:** o campo rola o texto por dentro; o rótulo e a ajuda quebram.
- **Senha colada com espaço no fim:** não remova espaços da senha. Remova só do e-mail.
- **Senha muito longa** (frases): aceite até 128 caracteres ou mais; não corte em silêncio.
- **Preenchimento automático:** estilize `:autofill` para manter `superficie-funda` e `tinta` (o padrão do navegador pinta de amarelo ou azul).
- **Link de recuperação vencido:** a tela de nova senha mostra "Esse link venceu. Peça um novo." com o botão "Pedir novo link" (para `/recuperar-senha`).
- **Sessão expirada no meio do uso:** leva a `/entrar` com um Notice informativo "Sua sessão terminou. Entre de novo para continuar." e volta à página de antes depois de entrar.
- **Sem JavaScript:** o formulário envia normalmente (o botão Mostrar some; o campo continua como senha).
- **Erro de rede:** veja Estados.

## Referência HTML

Entrada, com a ARIA corrigida (o selo foi resumido; veja [Seal](seal.md)):

```html
<main class="md-entrada md-marmore-pleno" style="position:relative;overflow:hidden">
  <div class="md-entrada-selo" aria-hidden="true">
    <svg class="md-selo md-selo-contorno" viewBox="-101 -101 202 202" focusable="false">…</svg>
  </div>
  <form class="md-entrada-cartao" style="position:relative" action="/entrar" method="post" novalidate>
    <div style="display:flex;justify-content:center;padding-bottom:4px">
      <svg class="md-logo" style="height:40px" viewBox="0.83 -82.26 283.77 86.07" role="img" aria-label="Midas">
        <path class="tinta" d="…"/><circle class="moeda" cx="116.84" cy="-68.88" r="11.38"/>
      </svg>
    </div>
    <h1 class="md-display" style="text-align:center;font-size:30px;line-height:36px">Que bom te ver <em class="md-acento">de novo</em>.</h1>

    <div class="md-field">
      <label class="md-label" for="email">E-mail</label>
      <span class="md-input md-input-text">
        <input id="email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required>
      </span>
    </div>

    <div class="md-field">
      <label class="md-label" for="senha">Senha</label>
      <span class="md-input md-input-text">
        <input id="senha" name="senha" type="password" autocomplete="current-password" required>
        <button type="button" class="md-btn md-btn-ghost" aria-controls="senha" style="min-height:44px;flex:none">
          <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>Mostrar<span class="md-sr"> senha</span>
        </button>
      </span>
    </div>

    <div role="alert"></div><!-- recebe o Notice "E-mail ou senha incorretos." -->
    <button class="md-btn md-btn-primary md-btn-lg" type="submit">Entrar</button>
    <a class="md-link" href="/recuperar-senha" style="align-self:center">Esqueci minha senha</a>
    <span class="md-veio" aria-hidden="true"></span>
    <p class="md-help" style="margin:0;text-align:center">Ainda não tem conta? <a class="md-link" href="/criar-conta">Criar conta</a></p>
    <div class="md-notice" role="note" style="font-size:14px;line-height:20px">
      <svg class="md-icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>
      <div>Sem CPF e sem acesso ao seu banco. Seus dados são só seus.</div>
    </div>
  </form>
</main>
```

Aceite no cadastro:

```html
<div class="md-row" style="align-items:flex-start;flex-wrap:nowrap">
  <input id="aceite" name="aceite" type="checkbox" required style="width:24px;height:24px;margin:10px 0">
  <label for="aceite" style="padding:10px 0">Li e aceito a <a class="md-link" href="/privacidade" target="_blank">Política de privacidade<span class="md-sr"> (abre em nova aba)</span></a>.</label>
</div>
```

## Referência CSS

```css
.md-entrada { min-height: 640px; display: grid; place-items: center; padding: var(--space-8) var(--space-4); border-radius: var(--radius-lg); }
.md-entrada-cartao { width: 100%; max-width: 400px; background: var(--superficie); border-radius: var(--radius-lg); box-shadow: var(--sombra-cartao); padding: var(--space-8) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.md-entrada-cartao .md-field { max-width: none; }
.md-entrada-cartao > .md-btn { width: 100%; }
.md-marmore-pleno { background: var(--textura) center / cover no-repeat, var(--marmore); }

/* Ajustes para o app */
.md-entrada { min-height: 100dvh; border-radius: 0; }                       /* tela inteira */
.md-input[aria-invalid="true"], .md-input:has(input[aria-invalid="true"]) { border: 2px solid var(--gasto); }
.md-input input:autofill { -webkit-text-fill-color: var(--tinta); box-shadow: inset 0 0 0 100px var(--superficie-funda); }
/* Sugerida: posição do selo (no protótipo, estilo inline) */
.md-entrada-selo { position: absolute; right: -120px; bottom: -120px; opacity: .55; }
.md-entrada-selo svg { display: block; width: 380px; height: 380px; }
@media (max-width: 480px) {
  .md-entrada-selo { right: -100px; bottom: -100px; }
  .md-entrada-selo svg { width: 280px; height: 280px; }
}
```

A animação do aro (`md-assentar`, 5s, uma vez) está em [Seal](seal.md). O selo, o logo, o veio, o Notice e o botão usam as regras dos respectivos documentos ([Seal](seal.md), [AppHeader](app-header.md), [Ornamentos](../08-ornamentos.md), [Notice](notice.md), [Button](button.md)).

## Implementação no app

Bases shadcn/ui: `Input`, `Label`, `Button` e `Checkbox` (ou um `<input type="checkbox">` nativo estilizado). As três rotas ficam num grupo com o layout compartilhado: `src/app/(entrada)/layout.tsx` renderiza o `AuthLayout`; `entrar/page.tsx`, `criar-conta/page.tsx` e `recuperar-senha/page.tsx` renderizam só o formulário.

```tsx
export interface AuthLayoutProps { children: React.ReactNode }

export interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;                               // "Senha"
  autoComplete: 'current-password' | 'new-password';
  help?: string;                               // ajuda do cadastro
  error?: string;                              // mensagem de campo
}
```

```tsx
// src/components/midas/auth-layout.tsx
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="md-marmore-pleno relative grid min-h-dvh place-items-center overflow-hidden px-4 py-8">
      <div aria-hidden="true" className="absolute -right-[100px] -bottom-[100px] size-[280px] opacity-[.55] sm:-right-[120px] sm:-bottom-[120px] sm:size-[380px]">
        <Seal variant="outline" decorative className="size-full" />
      </div>
      <div className="relative flex w-full max-w-[400px] flex-col gap-4 rounded-lg bg-superficie px-6 py-8 shadow-cartao">
        <MidasLogo className="mx-auto h-10 w-auto" />
        {children}
      </div>
    </main>
  );
}
```

```tsx
// src/components/midas/password-field.tsx (trecho)
const [visible, setVisible] = useState(false);
<div className="flex flex-col gap-2">
  <Label htmlFor={id} className="text-label font-semibold text-tinta">{label}</Label>
  <div className="flex min-h-[52px] items-center gap-2 rounded-md border border-borda bg-superficie-funda px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foco">
    <input id={id} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete}
      aria-invalid={error ? true : undefined} aria-describedby={describedBy}
      className="min-w-0 flex-1 bg-transparent text-body text-tinta outline-none" />
    <Button type="button" variant="ghost" aria-controls={id}
      onClick={() => setVisible((v) => !v)} className="min-h-11 shrink-0 px-3 text-ouro-texto">
      {visible ? <EyeOff aria-hidden="true" strokeWidth={1.75} className="size-5" /> : <Eye aria-hidden="true" strokeWidth={1.75} className="size-5" />}
      {visible ? 'Ocultar' : 'Mostrar'}<span className="sr-only"> senha</span>
    </Button>
  </div>
  {help && <p id={`${id}-ajuda`} className="text-caption text-tinta-suave">{help}</p>}
  <span className="sr-only" aria-live="polite">{visible ? 'Senha visível' : 'Senha oculta'}</span>
  {error && (
    <p id={`${id}-erro`} className="flex items-center gap-2 text-caption text-tinta">
      <TriangleAlert aria-hidden="true" strokeWidth={1.75} className="size-5 text-alerta" />{error}
    </p>
  )}
</div>
```

Notas:

- A mensagem "E-mail ou senha incorretos." vem do servidor para qualquer falha de credencial; o cliente não tenta adivinhar a causa.
- O limite de tentativas e a checagem de senhas comuns ou vazadas ficam no servidor. O cliente só mostra o texto que recebe.
- Guarde o nome como obrigatório (até 40 caracteres); ele alimenta a saudação e as iniciais do [AppHeader](app-header.md).
- Envie o formulário por POST (ação de servidor ou rota de API); nunca coloque e-mail ou senha na URL.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Uma mensagem genérica para qualquer falha de login. | Dizer se o e-mail existe. |
| Senha de 8 caracteres ou mais, sem regras de composição. | Exigir maiúscula, número e símbolo. |
| Permitir colar e gerenciadores de senha. | `onPaste` bloqueado ou `autocomplete="off"`. |
| Limite de tentativas no servidor. | CAPTCHA de imagens. |
| Caixa de aceite desmarcada. | Aceite já marcado ou escondido no botão. |
| Aviso de privacidade sempre visível. | Aviso só num link ou rodapé. |
| Botão Mostrar fora do `<label>`. | Botão dentro do rótulo do campo. |

## Relacionados

- [Seal](seal.md), [AppHeader](app-header.md), [Button](button.md), [Notice](notice.md), [MoneyInput](money-input.md) (mesmo campo `md-input`)
- [Logo](../03-logo.md), [Mármore e texturas](../07-marmore-e-texturas.md), [Ornamentos](../08-ornamentos.md), [Movimento](../10-movimento.md), [Conteúdo e tom](../11-conteudo-e-tom.md), [Acessibilidade](../12-acessibilidade.md), [Privacidade na interface](../16-privacidade-na-interface.md), [Padrões de tela](../17-padroes-de-tela.md)
