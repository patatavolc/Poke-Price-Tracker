/**
 * Tests unitarios para el servicio de cartas sin precio
 */

import {
  markCardWithoutPrice,
  isCardWithoutPrice,
  getCardsWithoutPrice,
  retryCardsWithoutPrice,
  removeCardWithoutPrice,
  getWithoutPriceStats,
} from "../../src/services/price/cardsWithoutPrice.service.js";
import { query } from "../../src/config/db.js";

jest.mock("../../src/config/db.js");

describe("Cards Without Price Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("markCardWithoutPrice", () => {
    it("debería marcar una carta como sin precio", async () => {
      const mockResult = {
        rows: [
          {
            card_id: "base1-1",
            attempt_count: 1,
            last_error: "No price available",
            source_failures: '{"tcgplayer":false,"cardmarket":false}',
          },
        ],
      };

      query.mockResolvedValue(mockResult);

      const result = await markCardWithoutPrice(
        "base1-1",
        "No price available",
        { tcgplayer: { success: false }, cardmarket: { success: false } },
      );

      expect(result.card_id).toBe("base1-1");
      expect(result.attempt_count).toBe(1);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO cards_without_price"),
        expect.arrayContaining([
          "base1-1",
          "No price available",
          expect.any(String),
        ]),
      );
    });

    it("debería incrementar attempt_count en conflicto", async () => {
      const mockResult = {
        rows: [{ card_id: "base1-1", attempt_count: 3, last_error: null }],
      };

      query.mockResolvedValue(mockResult);

      const result = await markCardWithoutPrice("base1-1", null, {});

      expect(result.attempt_count).toBe(3);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT"),
        expect.any(Array),
      );
    });

    it("debería manejar errores de base de datos", async () => {
      query.mockRejectedValue(new Error("Database error"));

      await expect(
        markCardWithoutPrice("base1-1", "error", {}),
      ).rejects.toThrow("Database error");
    });
  });

  describe("isCardWithoutPrice", () => {
    it("debería retornar datos si la carta existe", async () => {
      const mockCard = {
        card_id: "base1-1",
        attempt_count: 2,
        last_attempt: new Date(),
        last_error: "No price",
      };

      query.mockResolvedValue({ rows: [mockCard] });

      const result = await isCardWithoutPrice("base1-1");

      expect(result).toBeDefined();
      expect(result.card_id).toBe("base1-1");
      expect(result.attempt_count).toBe(2);
    });

    it("debería retornar null si la carta no existe", async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await isCardWithoutPrice("base1-99");

      expect(result).toBeNull();
    });

    it("debería manejar errores silenciosamente", async () => {
      query.mockRejectedValue(new Error("Query error"));

      const result = await isCardWithoutPrice("base1-1");

      expect(result).toBeNull();
    });
  });

  describe("getCardsWithoutPrice", () => {
    it("debería retornar cartas con mínimo de intentos", async () => {
      const mockCards = [
        {
          card_id: "base1-1",
          attempt_count: 3,
          last_attempt: new Date(),
          last_error: "No price",
        },
        {
          card_id: "base1-2",
          attempt_count: 5,
          last_attempt: new Date(),
          last_error: "API Error",
        },
      ];

      query.mockResolvedValue({ rows: mockCards });

      const result = await getCardsWithoutPrice(2);

      expect(result).toHaveLength(2);
      expect(result[0].card_id).toBe("base1-1");
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE attempt_count >= $1"),
        [2],
      );
    });

    it("debería usar valor por defecto para minAttempts", async () => {
      query.mockResolvedValue({ rows: [] });

      await getCardsWithoutPrice();

      expect(query).toHaveBeenCalledWith(expect.any(String), [2]);
    });

    it("debería retornar array vacío en error", async () => {
      query.mockRejectedValue(new Error("Database error"));

      const result = await getCardsWithoutPrice();

      expect(result).toEqual([]);
    });
  });

  describe("retryCardsWithoutPrice", () => {
    it("debería retornar cartas elegibles para reintentar", async () => {
      const mockCards = [{ card_id: "base1-1" }, { card_id: "base1-2" }];

      query.mockResolvedValue({ rows: mockCards });

      const result = await retryCardsWithoutPrice(30);

      expect(result).toEqual(["base1-1", "base1-2"]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE last_attempt < NOW()"),
        [30],
      );
    });

    it("debería limitar a 50 resultados", async () => {
      query.mockResolvedValue({ rows: [] });

      await retryCardsWithoutPrice(30);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT 50"),
        expect.any(Array),
      );
    });

    it("debería retornar array vacío en error", async () => {
      query.mockRejectedValue(new Error("Query error"));

      const result = await retryCardsWithoutPrice(30);

      expect(result).toEqual([]);
    });
  });

  describe("removeCardWithoutPrice", () => {
    it("debería eliminar carta de la lista", async () => {
      query.mockResolvedValue({ rows: [] });

      await removeCardWithoutPrice("base1-1");

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM cards_without_price"),
        ["base1-1"],
      );
    });

    it("debería manejar errores sin lanzar excepción", async () => {
      query.mockRejectedValue(new Error("Delete error"));

      await expect(removeCardWithoutPrice("base1-1")).resolves.not.toThrow();
    });
  });

  describe("getWithoutPriceStats", () => {
    it("debería retornar estadísticas correctas", async () => {
      const mockStats = {
        total_cards: "100",
        first_attempt: "20",
        few_attempts: "50",
        many_attempts: "30",
        avg_attempts: "3.50",
      };

      query.mockResolvedValue({ rows: [mockStats] });

      const result = await getWithoutPriceStats();

      expect(result.total_cards).toBe("100");
      expect(result.avg_attempts).toBe("3.50");
      expect(result.first_attempt).toBe("20");
    });

    it("debería retornar null en error", async () => {
      query.mockRejectedValue(new Error("Stats error"));

      const result = await getWithoutPriceStats();

      expect(result).toBeNull();
    });
  });
});
