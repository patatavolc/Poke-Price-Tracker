/**
 * Tests unitarios para middleware de validación
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
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("validateCardId", () => {
    it("debería aceptar ID válido con formato correcto", () => {
      req.params.id = "base1-4";

      validateCardId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("debería aceptar diferentes formatos válidos", () => {
      const validIds = ["base1-1", "xy1-10", "swsh1-100", "sm1-1"];

      validIds.forEach((id) => {
        req.params.id = id;
        validateCardId(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      });
    });

    it("debería rechazar ID sin guión", () => {
      req.params.id = "base14";

      validateCardId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Formato de ID"),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("debería rechazar ID vacío", () => {
      req.params.id = "";

      validateCardId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar ID con caracteres especiales", () => {
      req.params.id = "base1-4@#$";

      validateCardId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería manejar cardId en params", () => {
      req.params.cardId = "base1-5";

      validateCardId(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("validateSetId", () => {
    it("debería aceptar setId válido", () => {
      req.params.setId = "base1";

      validateSetId(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("debería aceptar diferentes formatos de set", () => {
      const validSets = ["base1", "xy1", "swsh1", "sm1"];

      validSets.forEach((setId) => {
        req.params.setId = setId;
        validateSetId(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      });
    });

    it("debería rechazar setId con caracteres especiales", () => {
      req.params.setId = "base1@#$";

      validateSetId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar setId vacío", () => {
      req.params.setId = "";

      validateSetId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería manejar set_id en params", () => {
      req.params.set_id = "base1";

      validateSetId(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("validatePriceParams", () => {
    it("debería aceptar parámetros de precio válidos", () => {
      req.query = {
        minPrice: "1.0",
        maxPrice: "100.0",
        currency: "eur",
      };

      validatePriceParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.minPrice).toBe(1.0);
      expect(req.query.maxPrice).toBe(100.0);
    });

    it("debería rechazar minPrice negativo", () => {
      req.query.minPrice = "-10";

      validatePriceParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar maxPrice negativo", () => {
      req.query.maxPrice = "-5";

      validatePriceParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar minPrice > maxPrice", () => {
      req.query.minPrice = "100";
      req.query.maxPrice = "10";

      validatePriceParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("minPrice"),
        }),
      );
    });

    it("debería rechazar currency inválida", () => {
      req.query.currency = "gbp";

      validatePriceParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería aceptar solo minPrice", () => {
      req.query.minPrice = "5";

      validatePriceParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.minPrice).toBe(5);
    });

    it("debería aceptar solo maxPrice", () => {
      req.query.maxPrice = "50";

      validatePriceParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.maxPrice).toBe(50);
    });
  });

  describe("validateSearchQuery", () => {
    it("debería aceptar término de búsqueda válido", () => {
      req.query.q = "pikachu";

      validateSearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.searchTerm).toBe("pikachu");
    });

    it("debería aceptar parámetro 'name'", () => {
      req.query.name = "charizard";

      validateSearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.searchTerm).toBe("charizard");
    });

    it("debería aceptar parámetro 'search'", () => {
      req.query.search = "blastoise";

      validateSearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.searchTerm).toBe("blastoise");
    });

    it("debería rechazar búsqueda muy corta", () => {
      req.query.q = "a";

      validateSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar búsqueda muy larga", () => {
      req.query.q = "a".repeat(101);

      validateSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar búsqueda vacía", () => {
      req.query.q = "";

      validateSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería trimear espacios", () => {
      req.query.q = "  pikachu  ";

      validateSearchQuery(req, res, next);

      expect(req.query.searchTerm).toBe("pikachu");
    });
  });

  describe("validatePagination", () => {
    it("debería aceptar limit y offset válidos", () => {
      req.query.limit = "20";
      req.query.offset = "10";

      validatePagination(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.limit).toBe(20);
      expect(req.query.offset).toBe(10);
    });

    it("debería rechazar limit mayor a 100", () => {
      req.query.limit = "150";

      validatePagination(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar limit menor a 1", () => {
      req.query.limit = "0";

      validatePagination(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar offset negativo", () => {
      req.query.offset = "-5";

      validatePagination(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería continuar si no hay parámetros", () => {
      validatePagination(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("validatePeriod", () => {
    it("debería aceptar períodos válidos", () => {
      const validPeriods = ["24h", "7d", "30d", "1y"];

      validPeriods.forEach((period) => {
        req.query.period = period;
        validatePeriod(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      });
    });

    it("debería rechazar período inválido", () => {
      req.query.period = "5h";

      validatePeriod(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería continuar si no hay período", () => {
      validatePeriod(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("sanitizeInput", () => {
    it("debería trimear params", () => {
      req.params.id = "  base1-4  ";

      sanitizeInput(req, res, next);

      expect(req.params.id).toBe("base1-4");
      expect(next).toHaveBeenCalled();
    });

    it("debería trimear query", () => {
      req.query.name = "  pikachu  ";
      req.query.limit = "  20  ";

      sanitizeInput(req, res, next);

      expect(req.query.name).toBe("pikachu");
      expect(req.query.limit).toBe("20");
    });

    it("debería manejar objetos vacíos", () => {
      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
