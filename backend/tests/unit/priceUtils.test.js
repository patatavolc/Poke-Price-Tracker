/**
 * Tests unitarios para utilidades de precios
 */

import { sleep, getTCGPlayerIdFromDB } from "../../src/services/price/utils.js";
import { query } from "../../src/config/db.js";

jest.mock("../../src/config/db.js");

describe("Price Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sleep", () => {
    it("debería esperar el tiempo especificado", async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();

      const elapsed = end - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(150);
    });

    it("debería manejar tiempos muy cortos", async () => {
      const start = Date.now();
      await sleep(1);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(0);
    });

    it("debería retornar una promesa", () => {
      const result = sleep(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("getTCGPlayerIdFromDB", () => {
    it("debería retornar tcgplayer_url si existe", async () => {
      query.mockResolvedValue({
        rows: [
          {
            tcgplayer_url:
              "https://prices.tcgplayer.com/pokemon/base-set/charizard-4",
          },
        ],
      });

      const result = await getTCGPlayerIdFromDB("base1-4");

      expect(result).toBe(
        "https://prices.tcgplayer.com/pokemon/base-set/charizard-4",
      );
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT tcgplayer_url"),
        ["base1-4"],
      );
    });

    it("debería retornar null si no hay URL", async () => {
      query.mockResolvedValue({
        rows: [{ tcgplayer_url: null }],
      });

      const result = await getTCGPlayerIdFromDB("base1-999");

      expect(result).toBeNull();
    });

    it("debería retornar null si la carta no existe", async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await getTCGPlayerIdFromDB("nonexistent-1");

      expect(result).toBeNull();
    });

    it("debería manejar errores de base de datos", async () => {
      query.mockRejectedValue(new Error("Database error"));

      const result = await getTCGPlayerIdFromDB("base1-4");

      expect(result).toBeNull();
    });
  });
});
