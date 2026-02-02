/**
 * Tests unitarios para middleware de validación - Corregido para ESM
 */

import {
  validateCardId,
  validateSetId,
  validatePriceParams,
  validateSearchQuery,
  validatePagination,
  validatePeriod,
  sanitizeInput,
} from "../../src/middleware/validation.js";

describe("Validation Middleware", () => {
  let req, res, nextCalled;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    nextCalled = false;
    res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };
  });

  const next = () => { nextCalled = true; };

  describe("validateCardId", () => {
    it("debería aceptar ID válido con formato correcto", () => {
      req.params.id = "base1-4";
      validateCardId(req, res, next);
      expect(nextCalled).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it("debería rechazar ID sin guión", () => {
      req.params.id = "base14";
      validateCardId(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain("Formato de ID");
    });
  });

  describe("validateSetId", () => {
    it("debería aceptar setId válido", () => {
      req.params.setId = "base1";
      validateSetId(req, res, next);
      expect(nextCalled).toBe(true);
    });
  });

  describe("validatePriceParams", () => {
    it("debería aceptar parámetros de precio válidos", () => {
      req.query = { minPrice: "1.0", maxPrice: "100.0", currency: "eur" };
      validatePriceParams(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.query.minPrice).toBe(1.0);
    });
  });

  describe("validateSearchQuery", () => {
    it("debería aceptar término de búsqueda válido", () => {
      req.query.q = "pikachu";
      validateSearchQuery(req, res, next);
      expect(nextCalled).toBe(true);
      expect(req.query.searchTerm).toBe("pikachu");
    });
  });

  describe("validatePagination", () => {
    it("debería aceptar limit y offset válidos", () => {
      req.query.limit = "20";
      req.query.offset = "10";
      validatePagination(req, res, next);
      expect(nextCalled).toBe(true);
    });
  });

  describe("validatePeriod", () => {
    it("debería aceptar períodos válidos", () => {
      req.query.period = "7d";
      validatePeriod(req, res, next);
      expect(nextCalled).toBe(true);
    });
  });

  describe("sanitizeInput", () => {
    it("debería trimear params", () => {
      req.params.id = "  base1-4  ";
      sanitizeInput(req, res, next);
      expect(req.params.id).toBe("base1-4");
    });
  });
});
