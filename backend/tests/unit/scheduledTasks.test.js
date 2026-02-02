/**
 * Tests unitarios para tareas programadas
 */

import { syncSetsTask } from "../../src/jobs/task/syncSets.task.js";
import { syncCardsTask } from "../../src/jobs/task/syncCards.task.js";
import {
  updateHotPricesTask,
  updateNormalPricesTask,
} from "../../src/jobs/task/updatePrices.task.js";
import { retryWithoutPriceTask } from "../../src/jobs/task/retryWithoutPrice.task.js";
import {
  syncSetsFromAPI,
  syncAllCards,
} from "../../src/services/pokemon.service.js";
import { syncAggregatedPrice } from "../../src/services/price/sync.js";
import {
  retryCardsWithoutPrice,
  getWithoutPriceStats,
} from "../../src/services/price/cardsWithoutPrice.service.js";
import { query } from "../../src/config/db.js";

jest.mock("../../src/services/pokemon.service.js");
jest.mock("../../src/services/price/sync.js");
jest.mock("../../src/services/price/cardsWithoutPrice.service.js");
jest.mock("../../src/config/db.js");

describe("Scheduled Tasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncSetsTask", () => {
    it("debería sincronizar sets exitosamente", async () => {
      syncSetsFromAPI.mockResolvedValue({ count: 50, success: true });

      const result = await syncSetsTask();

      expect(result.taskName).toBe("SYNC_SETS");
      expect(result.metrics.success).toBe(50);
      expect(syncSetsFromAPI).toHaveBeenCalled();
    });

    it("debería manejar errores y completar con fallo", async () => {
      syncSetsFromAPI.mockRejectedValue(new Error("API Error"));

      await expect(syncSetsTask()).rejects.toThrow("API Error");
      expect(syncSetsFromAPI).toHaveBeenCalled();
    });
  });

  describe("syncCardsTask", () => {
    it("debería sincronizar todas las cartas", async () => {
      syncAllCards.mockResolvedValue({
        success: true,
        total: 1000,
        successCount: 950,
        failCount: 50,
        skippedCount: 0,
      });

      const result = await syncCardsTask();

      expect(result.taskName).toBe("SYNC_CARDS");
      expect(result.metrics.success).toBe(950);
      expect(result.metrics.failed).toBe(50);
    });

    it("debería manejar errores durante sincronización", async () => {
      syncAllCards.mockRejectedValue(new Error("Sync failed"));

      await expect(syncCardsTask()).rejects.toThrow("Sync failed");
    });
  });

  describe("updateHotPricesTask", () => {
    it("debería actualizar precios de cartas populares", async () => {
      const mockHotCards = [
        { id: "base1-4", name: "Charizard" },
        { id: "base1-7", name: "Blastoise" },
      ];

      query.mockResolvedValue({ rows: mockHotCards });
      syncAggregatedPrice.mockResolvedValue({ averagePriceEur: 100.0 });

      const result = await updateHotPricesTask(50);

      expect(result.taskName).toBe("UPDATE_HOT_PRICES");
      expect(result.metrics.success).toBe(2);
      expect(syncAggregatedPrice).toHaveBeenCalledTimes(2);
    });

    it("debería continuar si una carta falla", async () => {
      const mockCards = [
        { id: "base1-4", name: "Card 1" },
        { id: "base1-5", name: "Card 2" },
      ];

      query.mockResolvedValue({ rows: mockCards });
      syncAggregatedPrice
        .mockResolvedValueOnce({ averagePriceEur: 50.0 })
        .mockRejectedValueOnce(new Error("Price error"));

      const result = await updateHotPricesTask(50);

      expect(result.metrics.success).toBe(1);
      expect(result.metrics.failed).toBe(1);
    });

    it("debería respetar el límite de batch", async () => {
      query.mockResolvedValue({ rows: [] });

      await updateHotPricesTask(25);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT $1"),
        [25],
      );
    });
  });

  describe("updateNormalPricesTask", () => {
    it("debería actualizar cartas normales", async () => {
      const mockCards = [
        { id: "base1-10", name: "Card 1" },
        { id: "base1-11", name: "Card 2" },
      ];

      query.mockResolvedValue({ rows: mockCards });
      syncAggregatedPrice.mockResolvedValue({ averagePriceEur: 10.0 });

      const result = await updateNormalPricesTask(100);

      expect(result.taskName).toBe("UPDATE_NORMAL_PRICES");
      expect(result.metrics.success).toBe(2);
    });

    it("debería excluir cartas sin precio confirmado", async () => {
      query.mockResolvedValue({ rows: [] });

      await updateNormalPricesTask(100);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("cards_without_price"),
        expect.any(Array),
      );
    });
  });

  describe("retryWithoutPriceTask", () => {
    it("debería reintentar cartas sin precio", async () => {
      getWithoutPriceStats.mockResolvedValueOnce({
        total_cards: "50",
      });

      retryCardsWithoutPrice.mockResolvedValue(["base1-1", "base1-2"]);
      syncAggregatedPrice
        .mockResolvedValueOnce({ averagePriceEur: 5.0 })
        .mockResolvedValueOnce(null);

      getWithoutPriceStats.mockResolvedValueOnce({
        total_cards: "49",
      });

      const result = await retryWithoutPriceTask(30);

      expect(result.taskName).toBe("RETRY_WITHOUT_PRICE");
      expect(result.metrics.success).toBe(1);
      expect(result.metrics.skipped).toBe(1);
    });

    it("debería manejar cuando no hay cartas para reintentar", async () => {
      getWithoutPriceStats.mockResolvedValue({ total_cards: "0" });
      retryCardsWithoutPrice.mockResolvedValue([]);

      const result = await retryWithoutPriceTask(30);

      expect(result.metrics.total).toBe(0);
    });

    it("debería continuar en errores individuales", async () => {
      retryCardsWithoutPrice.mockResolvedValue([
        "base1-1",
        "base1-2",
        "base1-3",
      ]);
      syncAggregatedPrice
        .mockResolvedValueOnce({ averagePriceEur: 5.0 })
        .mockRejectedValueOnce(new Error("Sync error"))
        .mockResolvedValueOnce({ averagePriceEur: 3.0 });

      getWithoutPriceStats.mockResolvedValue({ total_cards: "1" });

      const result = await retryWithoutPriceTask(30);

      expect(result.metrics.success).toBe(2);
      expect(result.metrics.failed).toBe(1);
    });
  });
});
