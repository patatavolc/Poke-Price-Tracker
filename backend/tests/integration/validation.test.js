import request from "supertest";
import app from "../../testApp.js";

describe("Validation Middleware Tests", () => {
  describe("Card ID Validation", () => {
    it("debería rechazar ID sin guión", async () => {
      await request(app).get("/api/cards/base1").expect(400);
    });

    it("debería rechazar ID con formato incorrecto", async () => {
      await request(app).get("/api/cards/123-abc-456").expect(400);
    });

    it("debería aceptar ID válido", async () => {
      await request(app).get("/api/cards/base1-1").expect(200);
    });
  });

  describe("Price Parameters Validation", () => {
    it("debería rechazar minPrice negativo", async () => {
      await request(app).get("/api/cards/filter?minPrice=-10").expect(400);
    });

    it("debería rechazar currency inválida", async () => {
      await request(app).get("/api/cards/expensive?currency=gbp").expect(400);
    });

    it("debería aceptar parámetros válidos", async () => {
      await request(app)
        .get("/api/cards/filter?minPrice=1&maxPrice=10&currency=eur")
        .expect(200);
    });
  });

  describe("Search Query Validation", () => {
    it("debería rechazar búsqueda muy corta", async () => {
      await request(app).get("/api/cards/search?q=a").expect(400);
    });

    it("debería rechazar búsqueda muy larga", async () => {
      const longQuery = "a".repeat(101);
      await request(app).get(`/api/cards/search?q=${longQuery}`).expect(400);
    });
  });
});
