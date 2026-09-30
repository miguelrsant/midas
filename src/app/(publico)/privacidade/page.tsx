import type { Metadata } from "next";

import { DraftNotice, LegalPage } from "@/components/legal/legal-page";
import { PRIVACY_POLICY_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidade" };

// Rascunho alinhado a .lgpd/data-map.md e .lgpd/legal-basis.md. A versão final
// sai da skill lgpd-privacy-policy, com revisão jurídica (.lgpd/gaps.md).
export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidade" version={PRIVACY_POLICY_VERSION}>
      <DraftNotice />
      <p>
        <strong className="font-semibold">Seus dados são só seus.</strong> O Midas guarda só o
        necessário para mostrar as suas finanças para você, e nada mais.
      </p>
      <h2>O que guardamos</h2>
      <ul>
        <li>E-mail: para você entrar, recuperar a senha e receber avisos de segurança.</li>
        <li>Um resumo criptográfico da senha (nunca a senha).</li>
        <li>Nome ou apelido: só para a saudação.</li>
        <li>
          Aparelhos conectados: o tipo de navegador e a data do último uso. Sem IP e sem
          localização.
        </li>
        <li>
          Registros de segurança: quando a conta foi criada, quando houve entrada e troca de senha.
        </li>
      </ul>
      <h2>O que nunca pedimos</h2>
      <p>CPF, RG, telefone, endereço, data de nascimento, dados de banco ou cartão, localização.</p>
      <h2>Cookies</h2>
      <p>
        Só dois, e os dois são necessários. O de sessão, para você continuar conectado. O de
        aparelho, que lembra que você já entrou por este navegador: assim, se alguém errar sua senha
        muitas vezes, quem fica bloqueado é essa pessoa, não você. Sem analytics, sem anúncios e sem
        rastreadores.
      </p>
      <h2>Com quem compartilhamos</h2>
      <p>
        Com ninguém. Usamos serviços que operam em nosso nome: Vercel (hospedagem), Neon (banco de
        dados) e Google (envio de e-mails). Ao escolher uma senha, conferimos se ela aparece em
        vazamentos conhecidos no serviço Have I Been Pwned, enviando só os 5 primeiros caracteres de
        um resumo criptográfico dela; a senha nunca sai do Midas.
      </p>
      <h2>Por quanto tempo</h2>
      <p>
        Enquanto a conta existir. Contas não confirmadas são apagadas em 7 dias. Sessões vencem em
        30 dias sem uso.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode ver, corrigir, baixar e apagar seus dados na tela “Seus dados”, como garante a Lei
        Geral de Proteção de Dados (Lei 13.709/2018, art. 18).
      </p>
      <h2>Contato</h2>
      <p>O contato da pessoa encarregada pelo tratamento de dados será publicado aqui.</p>
    </LegalPage>
  );
}
