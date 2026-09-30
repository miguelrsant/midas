/**
 * Exige TLS com verificação do certificado na conexão com o banco.
 *
 * O Neon entrega a string com `sslmode=require`. Hoje o driver `pg` trata `prefer`,
 * `require` e `verify-ca` como `verify-full`, mas avisa que no pg 9 eles passam a
 * seguir o libpq, em que `require` não confere o certificado. Trocar por
 * `verify-full` mantém a garantia atual e não depende da versão do driver.
 * Conexões sem `sslmode` (o Postgres local do Docker) ficam como estão.
 */
const WEAK_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

export function withVerifiedTls(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }
  const mode = url.searchParams.get("sslmode");
  if (mode && WEAK_SSL_MODES.has(mode)) url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
