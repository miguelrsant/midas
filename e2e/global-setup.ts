import { resetRateLimits } from "./db";
import { clearMailbox } from "./mailpit";

/** Zera os contadores de tentativas e a caixa do Mailpit antes de cada rodada. */
export default async function globalSetup() {
  await resetRateLimits();
  await clearMailbox();
}
