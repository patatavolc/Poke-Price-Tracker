import {
  searchCardsByName,
  filterCards,
  getMostExpensiveCardsService,
} from "../../../src/services/card.service.js";

// Mock de la base de datos
jest.mock("../../../src/config/db.js", () => ({
  query: jest.fn(),
}));

import { query } from "../../../src/config/db.js";

describe("Card Service Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchCardsByName", () => {
    it("debería construir query correctamente", async () => {
      query.mockResolvedValue({ rows: [] });

      await searchCardsByName("pikachu", 10);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("ILIKE"),
        expect.arrayContaining(["%pikachu%", 10]),
      );
    });
  });

  describe("filterCards", () => {
    it("debería aplicar todos los filtros", async () => {
      query.mockResolvedValue({ rows: [] });

      const filters = {
        name: "charizard",
        rarity: "Rare",
        minPrice: 10,
        maxPrice: 100,
        currency: "eur",
        limit: 20,
      };

      await filterCards(filters);

      expect(query).toHaveBeenCalled();
      const queryString = query.mock.calls[0][0];
      expect(queryString).toContain("WHERE");
      expect(queryString).toContain("LIMIT");
    });
  });
});
