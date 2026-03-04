import {
  validateCardId,
  validatePriceParams,
  validateSearchQuery,
} from "../../../src/middleware/validation.js";

describe("Validation Middleware Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("validateCardId", () => {
    it("debería aceptar ID válido", () => {
      req.params.id = "base1-4";

      validateCardId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("debería rechazar ID inválido", () => {
      req.params.id = "invalid";

      validateCardId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validatePriceParams", () => {
    it("debería validar precios correctamente", () => {
      req.query.minPrice = "10";
      req.query.maxPrice = "100";

      validatePriceParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.minPrice).toBe(10);
      expect(req.query.maxPrice).toBe(100);
    });

    it("debería rechazar minPrice > maxPrice", () => {
      req.query.minPrice = "100";
      req.query.maxPrice = "10";

      validatePriceParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
