import type { UserRole } from "@config/auth";

/**
 * User entity from database
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User data without sensitive information
 */
export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  last_login_at?: Date;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: UserPublic;
  token: string;
}

/**
 * Auth context user (from JWT)
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Token verification result
 */
export interface TokenVerification {
  valid: boolean;
  payload?: AuthUser;
  error?: string;
}
