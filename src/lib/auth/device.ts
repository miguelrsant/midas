/**
 * Transforma o User-Agent num rótulo curto ("Chrome no Android"), para a lista de
 * aparelhos conectados. O User-Agent completo não é guardado: ele ajuda a
 * identificar a pessoa (fingerprinting) e não é necessário (LGPD, art. 6º, III).
 */
export function deviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent) return "Aparelho desconhecido";
  const ua = userAgent;

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser\//.test(ua)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Navegador";

  const system = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPod/.test(ua)
      ? "iPhone"
      : /iPad/.test(ua)
        ? "iPad"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "Mac"
            : /CrOS/.test(ua)
              ? "Chromebook"
              : /Linux/.test(ua)
                ? "Linux"
                : null;

  return system ? `${browser} no ${system}` : browser;
}
