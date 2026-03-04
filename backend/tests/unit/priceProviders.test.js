/**
 * Tests unitarios para proveedores de precios
 */

import { getTCGPlayerPrice } from "../../src/services/price/tcgplayer.provider.js";
import { getCardmarketPrice } from "../../src/services/price/cardmarket.provider.js";

global.fetch = jest.fn();

describe("Price Providers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("TCGPlayer Provider", () => {
    beforeEach(() => {
      process.env.POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";
      process.env.POKEMON_TCG_API_KEY = "test-key";
    });

    it("debería retornar precio en USD de holofoil", async () => {
      const mockResponse = {
        data: {
          name: "Charizard",
          tcgplayer: {
            prices: {
              holofoil: {
                market: 150.0,
              },
            },
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getTCGPlayerPrice("base1-4");

      expect(result).toEqual({ priceUsd: 150.0, source: "tcgplayer" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("base1-4"),
        expect.objectContaining({
          headers: { "X-Api-Key": "test-key" },
        }),
      );
    });

    it("debería retornar precio normal si no hay holofoil", async () => {
      const mockResponse = {
        data: {
          tcgplayer: {
            prices: {
              normal: {
                market: 5.0,
              },
            },
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTCGPlayerPrice("base1-4");

      expect(result.priceUsd).toBe(5.0);
    });

    it("debería retornar null si no hay precio", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} }),
      });

      const result = await getTCGPlayerPrice("base1-999");

      expect(result).toBeNull();
    });

    it("debería retornar null en error 404", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not found",
      });

      const result = await getTCGPlayerPrice("nonexistent-1");

      expect(result).toBeNull();
    });

    it("debería manejar errores de red", async () => {
      fetch.mockRejectedValue(new Error("Network error"));

      const result = await getTCGPlayerPrice("base1-4");

      expect(result).toBeNull();
    });

    it("debería retornar null si falta API key", async () => {
      delete process.env.POKEMON_TCG_API_KEY;

      const result = await getTCGPlayerPrice("base1-4");

      expect(result).toBeNull();
    });

    it("debería priorizar 1stEditionHolofoil", async () => {
      const mockResponse = {
        data: {
          tcgplayer: {
            prices: {
              "1stEditionHolofoil": { market: 500.0 },
              holofoil: { market: 100.0 },
              normal: { market: 10.0 },
            },
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTCGPlayerPrice("base1-4");

      expect(result.priceUsd).toBe(500.0);
    });
  });

  describe("Cardmarket Provider", () => {
    beforeEach(() => {
      process.env.TCGDEX_API_URL = "https://api.tcgdex.net/v2/en";
    });

    it("debería retornar precio en EUR", async () => {
      const mockResponse = {
        name: "Charizard",
        pricing: {
          cardmarket: {
            avg: 120.0,
            trend: 125.0,
            low: 80.0,
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getCardmarketPrice("base1-4");

      expect(result).toEqual({ priceEur: 120.0, source: "cardmarket" });
    });

    it("debería usar trend si avg no está disponible", async () => {
      const mockResponse = {
        pricing: {
          cardmarket: {
            trend: 95.0,
            low: 70.0,
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCardmarketPrice("base1-4");

      expect(result.priceEur).toBe(95.0);
    });

    it("debería usar low como último recurso", async () => {
      const mockResponse = {
        pricing: {
          cardmarket: {
            low: 50.0,
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCardmarketPrice("base1-4");

      expect(result.priceEur).toBe(50.0);
    });

    it("debería retornar null si no hay pricing", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: "Card" }),
      });

      const result = await getCardmarketPrice("base1-4");

      expect(result).toBeNull();
    });

    it("debería retornar null en error 404", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not found",
      });

      const result = await getCardmarketPrice("nonexistent-1");

      expect(result).toBeNull();
    });

    it("debería manejar errores de API", async () => {
      fetch.mockRejectedValue(new Error("API timeout"));

      const result = await getCardmarketPrice("base1-4");

      expect(result).toBeNull();
    });
  });
});
