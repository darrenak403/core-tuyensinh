import { beforeAll, describe, expect, it } from "bun:test";
import { createApp } from "../src/app";

describe("API Integration", () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe("Health Endpoint", () => {
    it("should be accessible and return health status", async () => {
      const req = new Request("http://localhost:3000/health");
      const response = await app.fetch(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toMatch(/^(healthy|unhealthy)$/);
      expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(body.environment).toMatch(/^(development|test|production)$/);
      expect(typeof body.uptime).toBe("number");
      expect(typeof body.timestamp).toBe("string");
    });
  });

  describe("404 Handling", () => {
    it("should return 404 for non-existent routes", async () => {
      const req = new Request("http://localhost:3000/non-existent");
      const response = await app.fetch(req);
      const body = await response.json();

      expect(body.error.code).toBe("NOT_FOUND");
      expect(body.error.path).toBe("/non-existent");
    });
  });
});
