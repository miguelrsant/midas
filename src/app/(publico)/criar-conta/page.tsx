import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { getOptionalSession } from "@/lib/auth/dal";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignUpPage() {
  if (await getOptionalSession()) redirect("/");
  return (
    <AuthShell>
      <SignUpForm />
    </AuthShell>
  );
}
