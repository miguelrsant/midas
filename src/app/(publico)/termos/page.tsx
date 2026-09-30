import type { Metadata } from "next";

import { DraftNotice, LegalPage } from "@/components/legal/legal-page";
import { TERMS_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso" version={TERMS_VERSION}>
      <DraftNotice />
      <p>
        O Midas é um app gratuito e de código aberto para você anotar o que entra e o que sai e
        acompanhar o seu dinheiro.
      </p>
      <h2>O que o Midas é</h2>
      <p>
        Uma ferramenta de organização. Os números das projeções e das calculadoras são estimativas e
        não são recomendação financeira, jurídica ou contábil.
      </p>
      <h2>Sua conta</h2>
      <ul>
        <li>Use um e-mail seu e uma senha que você não usa em outros sites.</li>
        <li>Você é responsável pelo que anota na sua conta.</li>
        <li>Você pode apagar a conta quando quiser.</li>
      </ul>
      <h2>O código</h2>
      <p>Qualquer pessoa pode conferir o que o Midas faz no código-fonte público.</p>
    </LegalPage>
  );
}
