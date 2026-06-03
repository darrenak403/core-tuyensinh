import { getLogger } from "@middleware/request-logger.middleware";
import type { Context } from "hono";

/**
 * Audit log events
 */
export const AUDIT_EVENTS = {
  USER_REGISTERED: "user_registered",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  TOKEN_REFRESH: "token_refresh",
  AUTH_FAILED: "auth_failed",
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
} as const;

export type AuditEvent = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  event: AuditEvent;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Log audit event
 */
export function logAuditEvent(
  c: Context,
  event: AuditEvent,
  data: Partial<AuditLogEntry>
) {
  const logger = getLogger(c);

  const auditEntry: AuditLogEntry = {
    event,
    ip:
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
    userAgent: c.req.header("user-agent") || "unknown",
    timestamp: new Date().toISOString(),
    success: true,
    ...data,
  };

  logger.info(auditEntry, `Audit: ${event}`);
}

/**
 * Log successful authentication events
 */
export function logAuthSuccess(
  c: Context,
  event: AuditEvent,
  userId: string,
  email: string,
  details?: Record<string, any>
) {
  logAuditEvent(c, event, {
    userId,
    email,
    success: true,
    details,
  });
}

/**
 * Log failed authentication events
 */
export function logAuthFailure(
  c: Context,
  event: AuditEvent,
  email?: string,
  details?: Record<string, any>
) {
  logAuditEvent(c, event, {
    email,
    success: false,
    details,
  });
}
