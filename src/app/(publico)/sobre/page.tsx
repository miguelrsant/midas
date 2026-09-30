import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = { title: "Sobre" };

export default function AboutPage() {
  return (
    <LegalPage title="Sobre o Midas">
      <p className="font-display text-heading">Suas finanças, seu controle.</p>
      <p>
        O Midas é um app de finanças pessoais de código aberto. Qualquer pessoa pode conferir o que
        ele faz.
      </p>
      <Notice tone="privacidade" role="note">
        <strong>Seus dados são só seus.</strong> O Midas não pede CPF nem acessa seu banco. O código
        é aberto: qualquer pessoa pode conferir o que ele faz.
      </Notice>
      <h2>Créditos</h2>
      <ul>
        <li>
          Fontes: Marcellus, Cormorant Garamond, Atkinson Hyperlegible Next e Atkinson Hyperlegible
          Mono, todas sob a SIL Open Font License.
        </li>
        <li>Ícones: Lucide, licença ISC.</li>
      </ul>
    </LegalPage>
  );
}
