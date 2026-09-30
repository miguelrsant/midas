"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      busy={busy}
      icon={<LogOut aria-hidden="true" className="size-5" strokeWidth={1.75} />}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.replace("/entrar");
        router.refresh();
      }}
    >
      Sair
    </Button>
  );
}
