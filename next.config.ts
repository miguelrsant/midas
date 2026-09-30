import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança que valem para todas as respostas.
 * A Content-Security-Policy tem um nonce por requisição, então ela fica em src/proxy.ts.
 */
const securityHeaders = [
  // Só HTTPS por 2 anos, inclusive subdomínios (https://hstspreload.org).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Redundante com frame-ancestors 'none' da CSP, para navegadores antigos.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), " +
      "magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  // Pacotes com binário nativo ficam fora do bundle do servidor.
  serverExternalPackages: ["@node-rs/argon2"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Fontes da Midas Display: o nome do arquivo muda quando a fonte muda.
        source: "/fontes/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
