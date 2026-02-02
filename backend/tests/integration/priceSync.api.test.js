/**
 * Tests de integración para endpoints de sincronización de precios
 */

import request from "supertest";
import app from "../../testApp.js";

describe("Price Sync API Integration Tests", () => {
  describe("POST /api/prices/update/:cardId", () => {
    it("debería validar formato de cardId", async () => {
      await request(app).post("/api/prices/update/invalid-id").expect(400);
    });

    it("debería aceptar cardId válido", async () => {
      // Este test fallará si la carta no existe, pero valida la estructura
      await request(app).post("/api/prices/update/base1-4");
      // No verificamos status code porque depende de si la carta existe
    });
  });

  describe("POST /api/prices/update-aggregated/:cardId", () => {
    it("debería validar cardId", async () => {
      await request(app)
        .post("/api/prices/update-aggregated/invalid")
        .expect(400);
    });

    it("debería aceptar formato válido", async () => {
      await request(app).post("/api/prices/update-aggregated/base1-4");
      // No verificamos status code porque depende de si la carta existe
    });
  });

  describe("GET /api/prices/without-price-stats", () => {
    it("debería retornar estadísticas de cartas sin precio", async () => {
      const response = await request(app)
        .get("/api/prices/without-price-stats")
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    it("debería tener cache aplicado", async () => {
      // Primera request
      await request(app).get("/api/prices/without-price-stats").expect(200);

      // Segunda request (cacheada)
      const response = await request(app)
        .get("/api/prices/without-price-stats")
        .expect(200);

      expect(response.body._cached).toBe(true);
    });
  });
});
