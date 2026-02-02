/**
 * Tests unitarios para el agregador de precios
 */

import {
  getAggregatedPrice,
  syncPriceByCardId,
} from "../../src/services/price/aggregator.js";
import { getTCGPlayerPrice } from "../../src/services/price/tcgplayer.provider.js";
import { getCardmarketPrice } from "../../src/services/price/cardmarket.provider.js";
import { getExchangeRate } from "../../src/services/currency.service.js";
import { query } from "../../src/config/db.js";

jest.mock("../../src/services/price/tcgplayer.provider.js");
jest.mock("../../src/services/price/cardmarket.provider.js");
jest.mock("../../src/services/currency.service.js");
jest.mock("../../src/config/db.js");

describe("Price Aggregator Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getExchangeRate.mockResolvedValue(1.1);
  });

  describe("getAggregatedPrice", () => {
    it("debería agregar precios de múltiples fuentes", async () => {
      getTCGPlayerPrice.mockResolvedValue({
        priceUsd: 10.0,
        source: "tcgplayer",
      });
      getCardmarketPrice.mockResolvedValue({
        priceEur: 9.0,
        source: "cardmarket",
      });

      const result = await getAggregatedPrice(
        "base1-4",
        "Charizard",
        "Base Set",
      );

      expect(result).toBeDefined();
      expect(result.averagePriceEur).toBeDefined();
      expect(result.averagePriceUsd).toBeDefined();
      expect(result.sources).toHaveLength(2);
      expect(result.hasPrice).toBe(true);
    });

    it("debería calcular conversión de moneda correctamente", async () => {
      getTCGPlayerPrice.mockResolvedValue({
        priceUsd: 11.0,
        source: "tcgplayer",
      });
      getCardmarketPrice.mockResolvedValue(null);
      getExchangeRate.mockResolvedValue(1.1);

      const result = await getAggregatedPrice("base1-4", "Charizard");

      const expectedEur = 11.0 / 1.1;
      expect(result.averagePriceEur).toBeCloseTo(expectedEur, 2);
    });

    it("debería manejar cuando solo TCGPlayer tiene precio", async () => {
      getTCGPlayerPrice.mockResolvedValue({
        priceUsd: 15.0,
        source: "tcgplayer",
      });
      getCardmarketPrice.mockResolvedValue(null);

      const result = await getAggregatedPrice("base1-4", "Pikachu");

      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].source).toBe("tcgplayer");
      expect(result.sourceCount).toBe(1);
    });

    it("debería manejar cuando solo Cardmarket tiene precio", async () => {
      getTCGPlayerPrice.mockResolvedValue(null);
      getCardmarketPrice.mockResolvedValue({
        priceEur: 8.5,
        source: "cardmarket",
      });

      const result = await getAggregatedPrice("base1-4", "Blastoise");

      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].source).toBe("cardmarket");
    });

    it("debería retornar objeto con hasPrice=false cuando ninguna fuente tiene precio", async () => {
      getTCGPlayerPrice.mockResolvedValue(null);
      getCardmarketPrice.mockResolvedValue(null);

      const result = await getAggregatedPrice("base1-999", "Nonexistent");

      expect(result.hasPrice).toBe(false);
      expect(result.sourcesStatus).toBeDefined();
      expect(result.sourcesStatus.tcgplayer.success).toBe(false);
      expect(result.sourcesStatus.cardmarket.success).toBe(false);
    });

    it("debería incluir estado de fuentes en resultado", async () => {
      getTCGPlayerPrice.mockResolvedValue({
        priceUsd: 10.0,
        source: "tcgplayer",
      });
      getCardmarketPrice.mockResolvedValue(null);

      const result = await getAggregatedPrice("base1-4", "Test");

      expect(result.sourcesStatus).toBeDefined();
      expect(result.sourcesStatus.tcgplayer.success).toBe(true);
      expect(result.sourcesStatus.cardmarket.success).toBe(false);
    });

    it("debería manejar errores de providers", async () => {
      getTCGPlayerPrice.mockRejectedValue(new Error("API Error"));
      getCardmarketPrice.mockResolvedValue({
        priceEur: 9.0,
        source: "cardmarket",
      });

      await expect(getAggregatedPrice("base1-4", "Test")).rejects.toThrow();
    });
  });

  describe("syncPriceByCardId", () => {
    it("debería sincronizar precio de TCGPlayer", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            tcgplayer: {
              prices: {
                holofoil: { market: 25.0 },
              },
            },
          },
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);
      getExchangeRate.mockResolvedValue(1.1);
      query.mockResolvedValue({ rows: [] });

      const result = await syncPriceByCardId("base1-4");

      expect(result).toBeDefined();
      expect(result.priceUsd).toBe(25.0);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO price_history"),
        expect.any(Array),
      );
    });

    it("debería reintentar en caso de timeout (504)", async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 504 })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              tcgplayer: {
                prices: {
                  normal: { market: 5.0 },
                },
              },
            },
          }),
        });

      getExchangeRate.mockResolvedValue(1.1);
      query.mockResolvedValue({ rows: [] });

      const result = await syncPriceByCardId("base1-4", 3);

      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("debería retornar null si no hay precios", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} }),
      });

      const result = await syncPriceByCardId("base1-999");

      expect(result).toBeNull();
    });

    it("debería priorizar holofoil sobre normal", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            tcgplayer: {
              prices: {
                holofoil: { market: 50.0 },
                normal: { market: 10.0 },
              },
            },
          },
        }),
      });

      getExchangeRate.mockResolvedValue(1.1);
      query.mockResolvedValue({ rows: [] });

      const result = await syncPriceByCardId("base1-4");

      expect(result.priceUsd).toBe(50.0);
    });
  });
});
