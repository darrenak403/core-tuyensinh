import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

/**
 * Simple in-memory rate limiter
 * For production, use Redis or external rate limiting service
 */
class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

const rateLimiter = new InMemoryRateLimiter();

// Cleanup expired entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Rate limiting middleware
 */
export const rateLimit = (
  limit: number,
  windowMs: number,
  keyGenerator?: (c: any) => string
) => {
  return createMiddleware(async (c, next) => {
    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown";

    if (!rateLimiter.isAllowed(key, limit, windowMs)) {
      throw new HTTPException(429, {
        message: "Too many requests. Please try again later.",
      });
    }

    await next();
  });
};

/**
 * Auth-specific rate limiters
 */
export const authRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes (testing)
export const loginRateLimit = rateLimit(50, 15 * 60 * 1000); // 50 login attempts per 15 minutes (testing)
export const registerRateLimit = rateLimit(20, 60 * 60 * 1000); // 20 registrations per hour (testing)
