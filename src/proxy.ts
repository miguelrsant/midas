import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Roda antes de cada página:
 * 1. Gera um nonce e aplica a Content-Security-Policy (sem domínios de terceiros).
 * 2. Redireciona para /entrar quem não tem cookie de sessão. É só uma checagem
 *    otimista: a conferência de verdade é o requireUser() no servidor (src/lib/auth/dal.ts).
 */

/** Páginas abertas sem sessão. */
const PUBLIC_PATHS = [
  "/entrar",
  "/criar-conta",
  "/confirmar-email",
  "/recuperar-senha",
  "/redefinir-senha",
  "/privacidade",
  "/termos",
  "/sobre",
  "/conta-apagada",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function buildCsp(nonce: string, { isDev, isHttps }: { isDev: boolean; isHttps: boolean }) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "media-src 'none'",
    "worker-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Server Actions sem sessão não são redirecionadas: o 307 faria o navegador reenviar
  // o POST para /entrar, onde a action não existe. A action confere a sessão e devolve
  // "session_expired", e a tela leva à entrada sem perder o que foi digitado.
  const isServerAction = request.method === "POST" && request.headers.has("next-action");
  if (
    !isServerAction &&
    !isPublic(pathname) &&
    !getSessionCookie(request, { cookiePrefix: "midas" })
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = pathname === "/" ? "" : `?de=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const csp = buildCsp(nonce, {
    isDev: process.env.NODE_ENV === "development",
    isHttps: request.nextUrl.protocol === "https:",
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Tudo, menos a API de autenticação, arquivos do Next e arquivos públicos.
    {
      source:
        "/((?!api/auth|_next/static|_next/image|marca/|fontes/|texturas/|ornamentos/|favicon.ico|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
