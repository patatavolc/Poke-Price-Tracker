/**
 * Tests unitarios para sincronización de precios
 */

import {
  syncAggregatedPrice,
  syncMissingPrices,
  syncAllPrices,
} from "../../src/services/price/sync.js";
import { getAggregatedPrice } from "../../src/services/price/aggregator.js";
import {
  isCardWithoutPrice,
  markCardWithoutPrice,
  removeCardWithoutPrice,
} from "../../src/services/price/cardsWithoutPrice.service.js";
import { query } from "../../src/config/db.js";

jest.mock("../../src/services/price/aggregator.js");
jest.mock("../../src/services/price/cardsWithoutPrice.service.js");
jest.mock("../../src/config/db.js");

describe("Price Sync Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncAggregatedPrice", () => {
    it("debería sincronizar precio de una carta exitosamente", async () => {
      const mockPrice = {
        averagePriceEur: 10.0,
        averagePriceUsd: 11.0,
        sources: [{ source: "tcgplayer", priceUsd: 11.0, priceEur: 10.0 }],
        sourceCount: 1,
        hasPrice: true,
        sourcesStatus: { tcgplayer: { success: true } },
      };

      query
        .mockResolvedValueOnce({
          rows: [{ name: "Charizard", set_id: "base1" }],
        })
        .mockResolvedValueOnce({ rows: [{ name: "Base Set" }] })
        .mockResolvedValue({ rows: [] });

      getAggregatedPrice.mockResolvedValue(mockPrice);
      isCardWithoutPrice.mockResolvedValue(null);

      const result = await syncAggregatedPrice("base1-4");

      expect(result).toEqual(mockPrice);
      expect(getAggregatedPrice).toHaveBeenCalledWith(
        "base1-4",
        "Charizard",
        "Base Set",
      );
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO price_history"),
        expect.any(Array),
      );
    });

    it("debería manejar carta sin precio y marcarla", async () => {
      query.mockResolvedValueOnce({
        rows: [{ name: "Test Card", set_id: "base1" }],
      });
      query.mockResolvedValueOnce({ rows: [{ name: "Base Set" }] });

      getAggregatedPrice.mockResolvedValue({
        hasPrice: false,
        sourcesStatus: {},
      });

      const result = await syncAggregatedPrice("base1-999");

      expect(result).toBeNull();
      expect(markCardWithoutPrice).toHaveBeenCalledWith(
        "base1-999",
        expect.any(String),
        expect.any(Object),
      );
    });

    it("debería remover carta de lista sin precio si ahora tiene precio", async () => {
      const mockPrice = {
        averagePriceEur: 5.0,
        averagePriceUsd: 5.5,
        sources: [{ source: "tcgplayer", priceUsd: 5.5, priceEur: 5.0 }],
        hasPrice: true,
      };

      query
        .mockResolvedValueOnce({ rows: [{ name: "Test", set_id: "base1" }] })
        .mockResolvedValueOnce({ rows: [{ name: "Set" }] })
        .mockResolvedValue({ rows: [] });

      getAggregatedPrice.mockResolvedValue(mockPrice);
      isCardWithoutPrice.mockResolvedValue({ card_id: "base1-4" });

      await syncAggregatedPrice("base1-4");

      expect(removeCardWithoutPrice).toHaveBeenCalledWith("base1-4");
    });

    it("debería lanzar error si carta no existe en DB", async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(syncAggregatedPrice("nonexistent-1")).rejects.toThrow(
        "Carta no encontrada en la DB",
      );
    });
  });

  describe("syncMissingPrices", () => {
    it("debería sincronizar cartas sin precio", async () => {
      const mockCards = [
        { id: "base1-1", name: "Card 1" },
        { id: "base1-2", name: "Card 2" },
      ];

      query
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: mockCards })
        .mockResolvedValue({ rows: [] });

      getAggregatedPrice.mockResolvedValue({
        averagePriceEur: 5.0,
        hasPrice: true,
      });

      const result = await syncMissingPrices(null);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.successCount).toBeGreaterThan(0);
    });

    it("debería respetar el límite diario", async () => {
      const mockCards = Array(100)
        .fill()
        .map((_, i) => ({ id: `card-${i}`, name: `Card ${i}` }));

      query
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: mockCards.slice(0, 50) })
        .mockResolvedValue({ rows: [] });

      getAggregatedPrice.mockResolvedValue({
        averagePriceEur: 5.0,
        hasPrice: true,
      });

      const result = await syncMissingPrices(50);

      expect(result.total).toBeLessThanOrEqual(50);
    });

    it("debería skipear cartas marcadas como sin precio", async () => {
      query.mockResolvedValueOnce({ rows: [{ count: "10" }] });
      query.mockResolvedValueOnce({ rows: [] });

      const result = await syncMissingPrices();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("cards_without_price"),
        expect.any(Array),
      );
    });

    it("debería retornar early si no hay cartas", async () => {
      query.mockResolvedValueOnce({ rows: [{ count: "0" }] });
      query.mockResolvedValueOnce({ rows: [] });

      const result = await syncMissingPrices();

      expect(result.success).toBe(true);
      expect(result.total).toBe(0);
    });

    it("debería contar skips y errores correctamente", async () => {
      const mockCards = [
        { id: "base1-1", name: "Card 1" },
        { id: "base1-2", name: "Card 2" },
      ];

      query
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: mockCards })
        .mockResolvedValue({ rows: [] });

      getAggregatedPrice
        .mockResolvedValueOnce({ hasPrice: true, averagePriceEur: 5.0 })
        .mockResolvedValueOnce({ hasPrice: false });

      const result = await syncMissingPrices();

      expect(result.successCount).toBe(1);
      expect(result.skippedCount).toBe(1);
    });
  });

  describe("syncAllPrices", () => {
    it("debería sincronizar todas las cartas", async () => {
      const mockCards = [
        { id: "base1-1", name: "Card 1" },
        { id: "base1-2", name: "Card 2" },
      ];

      query.mockResolvedValue({ rows: mockCards });

      getAggregatedPrice.mockResolvedValue({
        averagePriceEur: 5.0,
        hasPrice: true,
      });

      const result = await syncAllPrices();

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
    });

    it("debería manejar errores sin detener el proceso", async () => {
      const mockCards = [
        { id: "base1-1", name: "Card 1" },
        { id: "base1-2", name: "Card 2" },
        { id: "base1-3", name: "Card 3" },
      ];

      query.mockResolvedValue({ rows: mockCards });

      getAggregatedPrice
        .mockResolvedValueOnce({ hasPrice: true, averagePriceEur: 5.0 })
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({ hasPrice: true, averagePriceEur: 3.0 });

      const result = await syncAllPrices();

      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(1);
    });
  });
});
