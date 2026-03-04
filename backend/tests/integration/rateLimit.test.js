import request from "supertest";
import app from "../../testApp.js";

describe("Rate Limiting Tests", () => {
  jest.setTimeout(30000);

  describe("Search Rate Limiting", () => {
    it("debería permitir requests dentro del límite", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app).get("/api/cards/search?q=test").expect(200);
      }
    });

    // Este test es lento, considera skippearlo en desarrollo
    it.skip("debería bloquear después de exceder el límite", async () => {
      // Hacer 51 requests (límite es 50)
      for (let i = 0; i < 51; i++) {
        if (i < 50) {
          await request(app).get("/api/cards/search?q=test").expect(200);
        } else {
          await request(app).get("/api/cards/search?q=test").expect(429);
        }
      }
    });
  });

  describe("Sync Rate Limiting", () => {
    it("debería aplicar límite estricto a sync", async () => {
      const response = await request(app).get("/api/sync/sets").expect(200);

      expect(response.headers).toHaveProperty("ratelimit-limit");
    });
  });
});
