/**
 * Test environment setup
 * Ensures proper environment configuration for tests
 */

// Set test environment variables before any imports
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:1111/starter_test";
process.env.PORT = process.env.PORT || "3001";
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "error"; // Reduce log noise in tests
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-at-least-32-characters-long";

export {};
