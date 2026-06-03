/**
 * Input sanitization utilities
 */

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize username input
 */
export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

/**
 * Remove potentially dangerous characters from string
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes that could break SQL
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize user registration data
 */
export function sanitizeRegistrationData(data: any) {
  return {
    ...data,
    email: sanitizeEmail(data.email),
    username: sanitizeUsername(data.username),
  };
}

/**
 * Validate and sanitize login data
 */
export function sanitizeLoginData(data: any) {
  return {
    ...data,
    email: sanitizeEmail(data.email),
  };
}
