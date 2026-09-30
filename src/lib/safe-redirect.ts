/**
 * Aceita só caminhos internos ("/lancamentos?mes=2026-09") para o "voltar para onde
 * estava" depois de entrar. Bloqueia redirecionamento aberto ("//site.com",
 * "https://…", "/\\site.com").
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  try {
    const url = new URL(value, "http://midas.invalid");
    if (url.origin !== "http://midas.invalid") return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
