/* eslint-disable @next/next/no-img-element -- SVG da marca, servido do próprio app. */

/** Logo do Midas nos dois temas (docs/design-system/03-logo.md). */
export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <>
      <img src="/marca/midas-logo.svg" alt="Midas" className={`${className} dark:hidden`} />
      <img
        src="/marca/midas-logo-noite.svg"
        alt="Midas"
        className={`${className} hidden dark:block`}
      />
    </>
  );
}
