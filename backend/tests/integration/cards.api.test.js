import request from "supertest";
import app from "../../testApp.js";

describe("Cards API Integration Tests", () => {
  describe("GET /api/cards/search", () => {
    it("debería buscar cartas por nombre", async () => {
      const response = await request(app)
        .get("/api/cards/search?q=pikachu")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("debería retornar 400 sin query", async () => {
      const response = await request(app).get("/api/cards/search").expect(400);

      expect(response.body.error).toBeDefined();
    });

    it("debería respetar el límite de resultados", async () => {
      const response = await request(app)
        .get("/api/cards/search?q=pokemon&limit=5")
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /api/cards/filter", () => {
    it("debería filtrar por precio", async () => {
      const response = await request(app)
        .get("/api/cards/filter?minPrice=1&maxPrice=10")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("debería rechazar minPrice > maxPrice", async () => {
      const response = await request(app)
        .get("/api/cards/filter?minPrice=100&maxPrice=10")
        .expect(400);
    });

    it("debería filtrar por rareza", async () => {
      const response = await request(app)
        .get("/api/cards/filter?rarity=Rare")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/cards/expensive", () => {
    it("debería retornar cartas caras", async () => {
      const response = await request(app)
        .get("/api/cards/expensive?limit=10")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("debería soportar USD", async () => {
      const response = await request(app)
        .get("/api/cards/expensive?currency=usd")
        .expect(200);
    });
  });

  describe("GET /api/cards/:id", () => {
    it("debería retornar detalles de carta válida", async () => {
      const response = await request(app).get("/api/cards/base1-4").expect(200);

      expect(response.body.id).toBe("base1-4");
    });

    it("debería retornar 400 con ID inválido", async () => {
      await request(app).get("/api/cards/invalid-id").expect(400);
    });
  });

  describe("GET /api/cards/trending/price-increase", () => {
    it("debería retornar tendencias 24h", async () => {
      const response = await request(app)
        .get("/api/cards/trending/price-increase?period=24h")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("debería retornar tendencias 7d", async () => {
      const response = await request(app)
        .get("/api/cards/trending/price-increase?period=7d")
        .expect(200);
    });

    it("debería rechazar período inválido", async () => {
      await request(app)
        .get("/api/cards/trending/price-increase?period=1y")
        .expect(400);
    });
  });

  describe("Cache behavior", () => {
    it("debería retornar datos cacheados en segunda request", async () => {
      // Primera request
      const response1 = await request(app)
        .get("/api/cards/expensive?limit=5")
        .expect(200);

      expect(response1.body._cached).toBeUndefined();

      // Segunda request (debe venir del cache)
      const response2 = await request(app)
        .get("/api/cards/expensive?limit=5")
        .expect(200);

      expect(response2.body._cached).toBe(true);
    });
  });
});
