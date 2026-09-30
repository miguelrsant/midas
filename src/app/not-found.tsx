import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-120 flex-col justify-center gap-4 px-4"
    >
      <h1 className="font-display text-display-lg text-tinta">Não achamos esta página.</h1>
      <p>O endereço pode ter mudado.</p>
      <div>
        <Link href="/" className={buttonClasses({ size: "lg" })}>
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
