import request from "supertest";
import app from "../../testApp.js";

describe("Sets API Integration Tests", () => {
  describe("GET /api/sets", () => {
    it("debería retornar todos los sets", async () => {
      const response = await request(app).get("/api/sets").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("debería soportar ordenamiento", async () => {
      const response = await request(app)
        .get("/api/sets?orderBy=name")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/sets/:setId", () => {
    it("debería retornar detalles de un set", async () => {
      const response = await request(app).get("/api/sets/base1").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("base1");
    });

    it("debería retornar 404 para set inexistente", async () => {
      await request(app).get("/api/sets/nonexistent").expect(404);
    });
  });

  describe("GET /api/sets/:setId/stats", () => {
    it("debería retornar estadísticas del set", async () => {
      const response = await request(app)
        .get("/api/sets/base1/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("total_cards");
      expect(response.body.data).toHaveProperty("synced_cards");
      expect(response.body.data).toHaveProperty("avg_price_eur");
    });
  });

  describe("GET /api/sets/series", () => {
    it("debería retornar todas las series", async () => {
      const response = await request(app).get("/api/sets/series").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
