/**
 * Application constants
 */

export const API_INFO = {
  NAME: "AI Chatbot Backend API",
  VERSION: "1.0.0",
  DESCRIPTION: "Backend API service for AI Chatbot application",
} as const;

export const ERROR_CODES = {
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  DATABASE_ERROR: "DATABASE_ERROR",
  HTTP_EXCEPTION: "HTTP_EXCEPTION",
  GENERIC_ERROR: "GENERIC_ERROR",
} as const;

export const OPENAPI_CONFIG = {
  VERSION: "3.0.0",
  PATHS: {
    DOCS: "/docs",
    OPENAPI_JSON: "/openapi.json",
    HEALTH: "/health",
  },
} as const;

export const HEALTH_STATUS = {
  HEALTHY: "healthy",
  UNHEALTHY: "unhealthy",
} as const;

export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
] as const;
