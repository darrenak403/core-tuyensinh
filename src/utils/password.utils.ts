import type { PasswordValidation } from "@app-types/auth";
import { AUTH_CONSTANTS } from "@config/auth";

/**
 * Password utilities using Bun's built-in password hashing
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Utility class pattern is appropriate here
export class PasswordUtils {
  /**
   * Hash a password using Bun's bcrypt implementation
   */
  static async hash(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 12, // Good balance between security and performance
    });
  }

  /**
   * Verify a password against its hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }

  /**
   * Validate password strength
   */
  static validate(password: string): PasswordValidation {
    const errors: string[] = [];

    // Length check
    if (password.length < AUTH_CONSTANTS.PASSWORD_MIN_LENGTH) {
      errors.push(
        `Password must be at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`
      );
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    // Special character check (optional but recommended)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password should contain at least one special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a random password (for testing or temporary passwords)
   */
  static generate(length = 12): string {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one character from each required category
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}
