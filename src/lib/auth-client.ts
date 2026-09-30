import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "./auth";

/** Cliente de autenticação para os formulários. Fala só com a própria origem (/api/auth). */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
