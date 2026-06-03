/**
 * User types and interfaces
 */

// User roles enum
export const UserRole = {
  STUDENT: "student",
  ADMIN: "admin",
  STAFF: "staff",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Database entity (from users table)
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRoleType;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Public API response (omitting sensitive data)
export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: UserRoleType;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Request interfaces
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRoleType;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password_hash?: string; // Optional: for password change
  role?: UserRoleType;
  is_active?: boolean;
}

// Query parameters interfaces
export interface UserQueryParams {
  role?: UserRoleType;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}
