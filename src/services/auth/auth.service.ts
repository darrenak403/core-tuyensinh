import type {
  LoginResponse,
  RegisterRequest,
  TokenVerification,
  UserPublic,
} from "@app-types/auth";
import { JWT_CONFIG, USER_ROLES } from "@config/auth";
import { db } from "@config/database";
import {
  sanitizeLoginData,
  sanitizeRegistrationData,
} from "@utils/input.sanitizer";
import { PasswordUtils } from "@utils/password.utils";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";

/**
 * Authentication service handling user registration, login, and token management
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<UserPublic> {
    // Sanitize input data
    const sanitizedData = sanitizeRegistrationData(data);
    // Validate password strength
    const validation = PasswordUtils.validate(data.password);
    if (!validation.valid) {
      throw new HTTPException(400, {
        message: `Password validation failed: ${validation.errors.join(", ")}`,
      });
    }

    // Check if user already exists
    const [existingUser] = await db`
      SELECT id FROM users
      WHERE email = ${sanitizedData.email} OR username = ${sanitizedData.username}
    `;

    if (existingUser) {
      throw new HTTPException(409, {
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const passwordHash = await PasswordUtils.hash(data.password);

    // Set default role if not provided
    const role = sanitizedData.role || USER_ROLES.STUDENT;

    // Validate role
    if (!Object.values(USER_ROLES).includes(role as any)) {
      throw new HTTPException(400, {
        message: "Invalid role specified",
      });
    }

    try {
      // Insert new user
      const [user] = await db`
        INSERT INTO users (username, email, password_hash, role)
        VALUES (${sanitizedData.username}, ${sanitizedData.email}, ${passwordHash}, ${role})
        RETURNING id, username, email, role, created_at, updated_at
      `;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error: any) {
      // Handle database constraint violations
      if (error.code === "23505") {
        // Unique violation
        throw new HTTPException(409, {
          message: "User with this email or username already exists",
        });
      }
      // Log error for debugging but don't expose internal details
      console.error("User registration failed:", error);
      throw new HTTPException(500, {
        message: "Failed to create user",
      });
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse | null> {
    // Sanitize input
    const sanitizedData = sanitizeLoginData({ email });
    // Find user by email
    const [user] = await db`
      SELECT id, username, email, password_hash, role, last_login_at
      FROM users
      WHERE email = ${sanitizedData.email} AND is_active = true
    `;

    if (!user) {
      return null;
    }

    // Verify password
    const isValid = await PasswordUtils.verify(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    // Update last login time
    await db`
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    // Create JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Sign JWT token
    const token = await sign(payload, JWT_CONFIG.secret);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        last_login_at: user.last_login_at,
      },
      token,
    };
  }

  /**
   * Verify JWT token and return user data
   */
  async verifyToken(token: string): Promise<TokenVerification> {
    try {
      // Verify and decode token
      const payload = await verify(token, JWT_CONFIG.secret);

      // Type guard for payload
      if (!payload || typeof payload !== "object" || !payload.sub) {
        return {
          valid: false,
          error: "Invalid token payload",
        };
      }

      // Check if user still exists and is active
      const [user] = await db`
        SELECT id, email, role
        FROM users
        WHERE id = ${payload.sub} AND is_active = true
      `;

      if (!user) {
        return {
          valid: false,
          error: "User not found or inactive",
        };
      }

      return {
        valid: true,
        payload: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: "Invalid or expired token",
      };
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserPublic | null> {
    const [user] = await db`
      SELECT id, username, email, role, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ${userId} AND is_active = true
    `;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      last_login_at: user.last_login_at,
    };
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(oldToken: string): Promise<string | null> {
    const verification = await this.verifyToken(oldToken);

    if (!verification.valid || !verification.payload) {
      return null;
    }

    // Create new token with same payload
    const payload = {
      sub: verification.payload.id,
      email: verification.payload.email,
      role: verification.payload.role,
    };

    return await sign(payload, JWT_CONFIG.secret);
  }
}
