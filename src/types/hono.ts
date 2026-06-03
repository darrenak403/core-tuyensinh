import type { AuthUser } from "@app-types/auth";

/**
 * Extend Hono's context variable map to include auth user
 */
declare module "hono" {
  interface ContextVariableMap {
    user?: AuthUser;
  }
}
