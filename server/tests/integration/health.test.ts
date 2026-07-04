import request from "supertest";
import { createApp } from "../../src/app";

describe("GET /api/v1/health", () => {
  it("returns 200 and an OK payload", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
  });

  it("returns 404 for unknown routes", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
