# Price Sync Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix price coverage in the market by replacing the incomplete TCGdex Cardmarket source with pokemontcg.io's Cardmarket field, adding TCGdex as a 3rd source, and filtering priceless cards from the market UI.

**Architecture:** Three price providers feed into the aggregator: TCGPlayer (USD) and Cardmarket (EUR) both read from a single pokemontcg.io call, plus TCGdex (EUR) as a supplementary 3rd source. The aggregator averages all valid prices. The market page query filters to cards with at least one non-null price.

**Tech Stack:** Node.js (ES modules), Express, PostgreSQL, Next.js/React

---

## File Map

| File | Action |
|---|---|
| `backend/src/services/price/tcgdex.provider.js` | CREATE — copy of current cardmarket.provider.js with source renamed to `"tcgdex"` |
| `backend/src/services/price/cardmarket.provider.js` | REWRITE — read `card.cardmarket.prices` from pokemontcg.io |
| `backend/src/services/price/aggregator.js` | MODIFY — add 3rd TCGdex source, call it conditionally |
| `backend/src/services/price/sync.js` | MODIFY — raise blacklist threshold from 2 to 5 |
| `backend/src/jobs/task/updatePrices.task.js` | MODIFY — raise blacklist threshold from 3 to 5 |
| `backend/src/jobs/config/schedules.config.js` | MODIFY — `olderThanDays` 30 → 7 |
| `backend/src/controllers/sync.controller.js` | MODIFY — add `resetBlacklist` handler |
| `backend/src/routes/sync.routes.js` | MODIFY — add `POST /reset-blacklist` route |
| `backend/src/services/card.service.js` | MODIFY — add `hasPrice` filter to `filterCards` and `getCardsFromSet` |
| `frontend/src/hooks/useMarketCards.js` | MODIFY — pass `hasPrice: true` in all `filterCards` calls |
| `frontend/src/app/market/_components/MarketCard.jsx` | MODIFY — null price guard |
| `backend/src/__tests__/price-providers.test.js` | CREATE — unit tests for cardmarket and tcgdex providers |

---

## Task 1: Set up Jest for backend (ES modules)

**Files:**
- Modify: `backend/package.json`
- Create: `backend/jest.config.js`
- Create: `backend/src/__tests__/price-providers.test.js` (empty placeholder to verify setup)

- [ ] **Step 1: Install Jest**

```bash
cd backend && npm install --save-dev jest
```

- [ ] **Step 2: Create `backend/jest.config.js`**

```js
export default {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [],
};
```

- [ ] **Step 3: Add test script to `backend/package.json`**

In the `"scripts"` section, add:

```json
"test": "node --experimental-vm-modules node_modules/.bin/jest"
```

The scripts block should look like:

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "node --experimental-vm-modules node_modules/.bin/jest"
}
```

- [ ] **Step 4: Create `backend/src/__tests__/price-providers.test.js` with a smoke test**

```js
describe("price providers setup", () => {
  it("jest is working", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run test to verify setup works**

```bash
cd backend && npm test
```

Expected output:
```
PASS src/__tests__/price-providers.test.js
  price providers setup
    ✓ jest is working
```

- [ ] **Step 6: Commit**

```bash
cd backend && git add package.json jest.config.js src/__tests__/price-providers.test.js
git commit -m "chore: add jest setup for backend unit tests"
```

---

## Task 2: Create `tcgdex.provider.js`

This is a copy of the current `cardmarket.provider.js` with the source identifier changed to `"tcgdex"`. The current file is then rewritten in Task 3.

**Files:**
- Create: `backend/src/services/price/tcgdex.provider.js`

- [ ] **Step 1: Write the failing test**

In `backend/src/__tests__/price-providers.test.js`, replace the smoke test with:

```js
import { jest } from "@jest/globals";

describe("getTCGdexPrice", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns null when card has no pricing.cardmarket data", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: "Pikachu", pricing: {} }),
    });
    process.env.TCGDEX_API_URL = "https://fake-tcgdex.test";
    const { getTCGdexPrice } = await import("../services/price/tcgdex.provider.js");
    const result = await getTCGdexPrice("base1-58");
    expect(result).toBeNull();
  });

  it("returns priceEur with source 'tcgdex' when avg is available", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        name: "Pikachu",
        pricing: { cardmarket: { avg: 1.5, low: 0.5 } },
      }),
    });
    process.env.TCGDEX_API_URL = "https://fake-tcgdex.test";
    const { getTCGdexPrice } = await import("../services/price/tcgdex.provider.js");
    const result = await getTCGdexPrice("base1-58");
    expect(result).toEqual({ priceEur: 1.5, source: "tcgdex" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=price-providers
```

Expected: FAIL — `Cannot find module '../services/price/tcgdex.provider.js'`

- [ ] **Step 3: Create `backend/src/services/price/tcgdex.provider.js`**

```js
const TCGDEX_API_URL = process.env.TCGDEX_API_URL;

export async function getTCGdexPrice(cardId) {
  try {
    console.log(`[TCGdex] Consultando con ID: ${cardId}...`);
    const url = `${TCGDEX_API_URL}/cards/${cardId}`;
    const response = await fetch(url);

    console.log(`[TCGdex] Status HTTP: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[TCGdex] Carta no encontrada (ID: ${cardId})`);
      } else {
        const errorText = await response.text();
        console.log(`[TCGdex] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      return null;
    }

    const card = await response.json();
    const cardMarketPrices = card.pricing?.cardmarket;

    if (!cardMarketPrices) {
      console.log(`[TCGdex] Sin datos de precio (pricing.cardmarket no existe)`);
      return null;
    }

    const priceEur =
      cardMarketPrices.avg ||
      cardMarketPrices.trend ||
      cardMarketPrices.avg7 ||
      cardMarketPrices.avg30 ||
      cardMarketPrices.avg1 ||
      cardMarketPrices.low ||
      null;

    if (!priceEur) {
      console.log(`[TCGdex] Sin precio válido (todos los campos null)`);
      return null;
    }

    console.log(`✅ [TCGdex] Precio encontrado: €${priceEur}`);
    return { priceEur, source: "tcgdex" };
  } catch (error) {
    console.error(`❌ [TCGdex] Error:`, error.message);
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend && npm test -- --testPathPattern=price-providers
```

Expected: PASS — both `getTCGdexPrice` tests green.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/price/tcgdex.provider.js backend/src/__tests__/price-providers.test.js
git commit -m "feat: add tcgdex.provider.js as 3rd price source"
```

---

## Task 3: Rewrite `cardmarket.provider.js` to use pokemontcg.io

The pokemontcg.io API includes `card.cardmarket.prices` in EUR in the same endpoint already used for TCGPlayer. This replaces the TCGdex call as the primary Cardmarket source.

**Files:**
- Modify: `backend/src/services/price/cardmarket.provider.js`
- Modify: `backend/src/__tests__/price-providers.test.js`

- [ ] **Step 1: Add failing tests for the new cardmarket provider**

Append to `backend/src/__tests__/price-providers.test.js`:

```js
describe("getCardmarketPrice", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.POKEMON_TCG_API_URL = "https://fake-pokemontcg.test";
    process.env.POKEMON_TCG_API_KEY = "test-key";
  });

  it("returns null when card has no cardmarket.prices data", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { name: "Pikachu", tcgplayer: {} } }),
    });
    const { getCardmarketPrice } = await import("../services/price/cardmarket.provider.js");
    const result = await getCardmarketPrice("base1-58");
    expect(result).toBeNull();
  });

  it("returns priceEur using averageSellPrice first", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          name: "Pikachu",
          cardmarket: {
            prices: {
              averageSellPrice: 2.5,
              trendPrice: 2.0,
              lowPrice: 1.0,
            },
          },
        },
      }),
    });
    const { getCardmarketPrice } = await import("../services/price/cardmarket.provider.js");
    const result = await getCardmarketPrice("base1-58");
    expect(result).toEqual({ priceEur: 2.5, source: "cardmarket" });
  });

  it("falls back to trendPrice when averageSellPrice is null", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          name: "Pikachu",
          cardmarket: {
            prices: {
              averageSellPrice: null,
              trendPrice: 1.8,
              lowPrice: 1.0,
            },
          },
        },
      }),
    });
    const { getCardmarketPrice } = await import("../services/price/cardmarket.provider.js");
    const result = await getCardmarketPrice("base1-58");
    expect(result).toEqual({ priceEur: 1.8, source: "cardmarket" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && npm test -- --testPathPattern=price-providers
```

Expected: the 3 new `getCardmarketPrice` tests FAIL (old implementation doesn't match new behavior).

- [ ] **Step 3: Rewrite `backend/src/services/price/cardmarket.provider.js`**

```js
const POKEMON_TCG_API_URL = process.env.POKEMON_TCG_API_URL;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

/**
 * Obtiene el precio de Cardmarket para una carta usando pokemontcg.io
 *
 * pokemontcg.io devuelve precios de Cardmarket (EUR) en card.cardmarket.prices
 * en el mismo endpoint que TCGPlayer. Esto nos da mejor cobertura que TCGdex.
 *
 * Prioridad de campos EUR:
 * 1. averageSellPrice — precio promedio de ventas recientes
 * 2. trendPrice       — tendencia del mercado
 * 3. avg30            — promedio 30 días
 * 4. avg7             — promedio 7 días
 * 5. lowPrice         — precio mínimo (último fallback)
 */
export async function getCardmarketPrice(cardId) {
  try {
    console.log(`[Cardmarket] Consultando pokemontcg.io con ID: ${cardId}...`);

    if (!POKEMON_TCG_API_KEY) {
      console.error("[Cardmarket] ERROR: POKEMON_TCG_API_KEY no configurada");
      return null;
    }

    const url = `${POKEMON_TCG_API_URL}/cards/${cardId}`;
    const headers = { "X-Api-Key": POKEMON_TCG_API_KEY };
    const response = await fetch(url, { headers });

    console.log(`[Cardmarket] Status HTTP: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[Cardmarket] Carta no encontrada (ID: ${cardId})`);
      } else {
        const errorText = await response.text();
        console.error(`[Cardmarket] Error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      return null;
    }

    const result = await response.json();
    const card = result.data;

    if (!card) {
      console.log("[Cardmarket] Carta no encontrada en respuesta");
      return null;
    }

    const prices = card.cardmarket?.prices;

    if (!prices) {
      console.log(`[Cardmarket] Sin datos de precio (card.cardmarket.prices no existe)`);
      return null;
    }

    console.log(`[Cardmarket] Precios disponibles:`, {
      averageSellPrice: prices.averageSellPrice,
      trendPrice: prices.trendPrice,
      avg30: prices.avg30,
      avg7: prices.avg7,
      lowPrice: prices.lowPrice,
    });

    const priceEur =
      prices.averageSellPrice ||
      prices.trendPrice ||
      prices.avg30 ||
      prices.avg7 ||
      prices.lowPrice ||
      null;

    if (!priceEur) {
      console.log(`[Cardmarket] Sin precio válido (todos los campos null)`);
      return null;
    }

    console.log(`✅ [Cardmarket] Precio encontrado: €${priceEur}`);
    return { priceEur, source: "cardmarket" };
  } catch (error) {
    console.error(`❌ [Cardmarket] Error:`, error.message);
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=price-providers
```

Expected: All 5 tests (2 TCGdex + 3 Cardmarket) PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/price/cardmarket.provider.js backend/src/__tests__/price-providers.test.js
git commit -m "feat: rewrite cardmarket provider to use pokemontcg.io"
```

---

## Task 4: Update `aggregator.js` to use 3 sources

Add TCGdex as a 3rd source. Call TCGdex only when pokemontcg.io doesn't return Cardmarket data (to avoid redundant HTTP calls).

**Files:**
- Modify: `backend/src/services/price/aggregator.js`

- [ ] **Step 1: Update the import at the top of `backend/src/services/price/aggregator.js`**

Change:
```js
import { getCardmarketPrice } from "./cardmarket.provider.js";
```
To:
```js
import { getCardmarketPrice } from "./cardmarket.provider.js";
import { getTCGdexPrice } from "./tcgdex.provider.js";
```

- [ ] **Step 2: Update `sourcesStatus` in `getAggregatedPrice` to track 3 sources**

Find the `sourcesStatus` object (around line 128) and replace it:

```js
const sourcesStatus = {
  tcgplayer: { attempted: true, success: false, price: null, error: null },
  cardmarket: { attempted: true, success: false, price: null, error: null },
  tcgdex: { attempted: false, success: false, price: null, error: null },
};
```

- [ ] **Step 3: Update the `Promise.all` block to conditionally call TCGdex**

Find the `Promise.all` block (around line 136) and replace from there through the end of the results processing section. The new logic should be:

```js
// Paso 1: Consultar TCGPlayer y Cardmarket (ambos en pokemontcg.io) en paralelo
const [tcgplayerPrice, cardmarketPrice] = await Promise.all([
  getTCGPlayerPrice(cardId),
  getCardmarketPrice(cardId),
]);

// Paso 2: Si Cardmarket de pokemontcg.io no tiene precio, intentar TCGdex como fallback
let tcgdexPrice = null;
if (!cardmarketPrice) {
  sourcesStatus.tcgdex.attempted = true;
  console.log(`\nPASO 1b: Cardmarket sin precio en pokemontcg.io, consultando TCGdex...`);
  tcgdexPrice = await getTCGdexPrice(cardId);
}

console.log(`\nPASO 2: Procesar resultados...`);
const validPrices = [];

if (tcgplayerPrice) {
  const priceData = {
    source: tcgplayerPrice.source,
    priceUsd: tcgplayerPrice.priceUsd,
    priceEur: tcgplayerPrice.priceUsd * usdToEurRate,
  };
  validPrices.push(priceData);
  sourcesStatus.tcgplayer.success = true;
  sourcesStatus.tcgplayer.price = priceData;
  console.log(`✅ TCGPlayer: $${priceData.priceUsd} / €${priceData.priceEur.toFixed(2)}`);
} else {
  sourcesStatus.tcgplayer.error = "Sin datos de precio disponibles";
  console.log(`❌ TCGPlayer: No disponible`);
}

if (cardmarketPrice) {
  const priceData = {
    source: cardmarketPrice.source,
    priceEur: cardmarketPrice.priceEur,
    priceUsd: cardmarketPrice.priceEur * eurToUsdRate,
  };
  validPrices.push(priceData);
  sourcesStatus.cardmarket.success = true;
  sourcesStatus.cardmarket.price = priceData;
  console.log(`✅ Cardmarket: €${priceData.priceEur} / $${priceData.priceUsd.toFixed(2)}`);
} else {
  sourcesStatus.cardmarket.error = "Sin datos de precio disponibles";
  console.log(`❌ Cardmarket (pokemontcg.io): No disponible`);
}

if (tcgdexPrice) {
  const priceData = {
    source: tcgdexPrice.source,
    priceEur: tcgdexPrice.priceEur,
    priceUsd: tcgdexPrice.priceEur * eurToUsdRate,
  };
  validPrices.push(priceData);
  sourcesStatus.tcgdex.success = true;
  sourcesStatus.tcgdex.price = priceData;
  console.log(`✅ TCGdex: €${priceData.priceEur} / $${priceData.priceUsd.toFixed(2)}`);
} else if (sourcesStatus.tcgdex.attempted) {
  sourcesStatus.tcgdex.error = "Sin datos de precio disponibles";
  console.log(`❌ TCGdex: No disponible`);
}
```

- [ ] **Step 4: Update the summary log (around line 183) to count 3 sources**

Find:
```js
const successCount = Object.values(sourcesStatus).filter(
  (s) => s.success,
).length;
const failedCount = Object.values(sourcesStatus).filter(
  (s) => !s.success,
).length;
```

Replace with:
```js
const successCount = Object.values(sourcesStatus).filter((s) => s.success).length;
const attemptedCount = Object.values(sourcesStatus).filter((s) => s.attempted).length;
const failedCount = Object.values(sourcesStatus).filter((s) => s.attempted && !s.success).length;
```

And update the log lines below it:
```js
console.log(`  ✅ Exitosas: ${successCount}/${attemptedCount}`);
console.log(`  ❌ Fallidas: ${failedCount}/${attemptedCount}`);
```

And in the final return, update the `sourceCount` log:
```js
console.log(`  Fuentes exitosas: ${validPrices.length}/${attemptedCount}`);
```

- [ ] **Step 5: Verify manually by starting the backend and checking logs**

```bash
cd backend && npm run dev
```

Then in another terminal call the sync endpoint for a known card:
```bash
curl -X POST http://localhost:3000/api/sync/prices
```

Check the terminal logs for lines like:
```
✅ TCGPlayer: $X.XX / €X.XX
✅ Cardmarket: €X.XX / $X.XX
```
or (if pokemontcg.io has no Cardmarket data):
```
❌ Cardmarket (pokemontcg.io): No disponible
✅ TCGdex: €X.XX / $X.XX
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/price/aggregator.js
git commit -m "feat: add tcgdex as 3rd price source in aggregator"
```

---

## Task 5: Raise blacklist thresholds and update retry schedule

Cards were being permanently skipped after just 2-3 failed attempts. With the improved providers, we raise the threshold so cards get more chances.

**Files:**
- Modify: `backend/src/services/price/sync.js`
- Modify: `backend/src/jobs/task/updatePrices.task.js`
- Modify: `backend/src/jobs/config/schedules.config.js`

- [ ] **Step 1: Update `sync.js` — raise threshold from 2 to 5**

In `backend/src/services/price/sync.js`, find (around line 163):
```js
        AND id NOT IN (
          SELECT card_id 
          FROM cards_without_price 
          WHERE attempt_count >= 2
        )
```

Replace with:
```js
        AND id NOT IN (
          SELECT card_id 
          FROM cards_without_price 
          WHERE attempt_count >= 5
        )
```

- [ ] **Step 2: Update `updatePrices.task.js` — raise threshold from 3 to 5**

In `backend/src/jobs/task/updatePrices.task.js`, find (around line 67):
```js
        AND c.id NOT IN (
          SELECT card_id 
          FROM cards_without_price 
          WHERE attempt_count >= 3
        )
```

Replace with:
```js
        AND c.id NOT IN (
          SELECT card_id 
          FROM cards_without_price 
          WHERE attempt_count >= 5
        )
```

- [ ] **Step 3: Update `schedules.config.js` — reduce retry window from 30 to 7 days**

In `backend/src/jobs/config/schedules.config.js`, find:
```js
  RETRY_WITHOUT_PRICE: {
    cron: "0 4 * * 0",
    enabled: true,
    description: "Reintentar cartas sin precio disponible",
    olderThanDays: 30,
  },
```

Replace with:
```js
  RETRY_WITHOUT_PRICE: {
    cron: "0 4 * * 0",
    enabled: true,
    description: "Reintentar cartas sin precio disponible",
    olderThanDays: 7,
  },
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/services/price/sync.js backend/src/jobs/task/updatePrices.task.js backend/src/jobs/config/schedules.config.js
git commit -m "fix: raise blacklist threshold to 5 and reduce retry window to 7 days"
```

---

## Task 6: Add reset-blacklist endpoint

This endpoint clears the `cards_without_price` table so all previously blacklisted cards are retried on the next sync. Use it once after deploying Tasks 2–5.

**Files:**
- Modify: `backend/src/controllers/sync.controller.js`
- Modify: `backend/src/routes/sync.routes.js`

- [ ] **Step 1: Add `resetBlacklist` handler to `sync.controller.js`**

Add this function at the end of `backend/src/controllers/sync.controller.js`:

```js
import { query } from "../config/db.js";

export const resetBlacklist = async (req, res) => {
  try {
    const result = await query("DELETE FROM cards_without_price");
    res.status(200).json({
      message: "Blacklist limpiado correctamente",
      deleted: result.rowCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

Note: `query` is already imported at the top of the file via the services. If it is not, add the import:
```js
import { query } from "../config/db.js";
```

- [ ] **Step 2: Add the route to `sync.routes.js`**

Add the import and route. The file should include:

```js
import {
    syncSets,
    syncCards,
    syncAll,
    syncMissing,
    syncPrices,
    syncMissingPricesCtrl,
    updateAllPrices,
    getQueueStatus,
    resetBlacklist,
} from "../controllers/sync.controller.js";
```

And add this line with the other routes:
```js
router.post("/reset-blacklist", resetBlacklist);
```

- [ ] **Step 3: Verify the endpoint manually**

Start the backend and call:
```bash
curl -X POST http://localhost:3000/api/sync/reset-blacklist
```

Expected response:
```json
{ "message": "Blacklist limpiado correctamente", "deleted": <number> }
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/sync.controller.js backend/src/routes/sync.routes.js
git commit -m "feat: add POST /api/sync/reset-blacklist endpoint"
```

---

## Task 7: Add `hasPrice` filter to `card.service.js`

Prevents cards without any price from appearing in the market.

**Files:**
- Modify: `backend/src/services/card.service.js`

- [ ] **Step 1: Update `filterCards` to accept `hasPrice` parameter**

In `backend/src/services/card.service.js`, find the `filterCards` function. In the destructuring at the top of the function (around line 339), add `hasPrice = true`:

```js
export const filterCards = async (filters) => {
    const {
        name,
        setId,
        rarity,
        supertype,
        types,
        artist,
        minPrice,
        maxPrice,
        currency = "eur",
        limit = 50,
        offset = 0,
        hasPrice = true,
    } = filters;
```

Then, after `const conditions = [];` and before the `if (name)` block, add:

```js
    if (hasPrice) {
        conditions.push(`(c.last_price_eur IS NOT NULL OR c.last_price_usd IS NOT NULL)`);
    }
```

- [ ] **Step 2: Update `getCardsFromSet` to filter by price**

Find `getCardsFromSetService` (around line 67). Change its query to filter out cards without any price:

```js
export const getCardsFromSetService = async (
    set_id,
    limit = 100,
    offset = 0,
) => {
    const queryText = `
    SELECT c.id, c.name, c.image_small, c.rarity, c.last_price_eur, c.last_price_usd, s.name AS set_name
    FROM cards c
    JOIN sets s ON c.set_id = s.id
    WHERE c.set_id = $1
      AND (c.last_price_eur IS NOT NULL OR c.last_price_usd IS NOT NULL)
    ORDER BY c.last_price_eur DESC NULLS LAST
    LIMIT $2 OFFSET $3
  `;
    const res = await query(queryText, [set_id, limit, offset]);
    return res.rows;
};
```

- [ ] **Step 3: Also add a `count` field to `filterCards` return for pagination**

The frontend uses `count` from the `filterCards` response. Verify the controller returns it. In `card.controller.js`, `filterCardsController` currently returns `count: cards.length` — this is the count of the current page, not the total. Update `filterCards` in `card.service.js` to also return total count:

Change the query at the end of `filterCards` to run a COUNT query alongside the data query:

```js
    const countQuery = `
    SELECT COUNT(*) as total
    FROM cards c
    LEFT JOIN sets s ON c.set_id = s.id
    ${whereClause}
  `;

    // Run data and count queries in parallel
    const [res, countRes] = await Promise.all([
        query(queryText, params),
        query(countQuery, params.slice(0, -2)), // exclude LIMIT and OFFSET params
    ]);

    return { rows: res.rows, total: parseInt(countRes.rows[0].total) };
```

Then in `card.controller.js`, update `filterCardsController`:

```js
export const filterCardsController = async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            setId: req.query.setId || req.query.set,
            rarity: req.query.rarity,
            supertype: req.query.supertype,
            types: req.query.types ? req.query.types.split(",") : undefined,
            artist: req.query.artist,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            currency: req.query.currency || "eur",
            hasPrice: req.query.hasPrice !== "false",
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0,
        };

        const { rows: cards, total } = await filterCards(filters);

        res.json({
            success: true,
            count: total,
            filters: filters,
            data: cards,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/services/card.service.js backend/src/controllers/card.controller.js
git commit -m "feat: add hasPrice filter to filterCards and getCardsFromSet"
```

---

## Task 8: Update frontend to use `hasPrice` and fix price display

**Files:**
- Modify: `frontend/src/hooks/useMarketCards.js`
- Modify: `frontend/src/app/market/_components/MarketCard.jsx`

- [ ] **Step 1: Update `useMarketCards.js` to pass `hasPrice: true`**

In `frontend/src/hooks/useMarketCards.js`, there are two `filterCards` calls. Both need `hasPrice: true`.

First call (with filters, around line 49):
```js
const { cards: data, count } = await filterCards({
    name: debouncedSearch || undefined,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    rarity: selectedRarity || undefined,
    set: selectedSet || undefined,
    minPrice: priceRange.min || undefined,
    maxPrice: priceRange.max || undefined,
    hasPrice: true,
    limit: PAGE_SIZE,
    offset,
});
```

Second call (fallback, around line 75):
```js
const { cards: fallback, count } = await filterCards({ hasPrice: true, limit: PAGE_SIZE, offset });
```

- [ ] **Step 2: Update `MarketCard.jsx` — null price guard**

In `frontend/src/app/market/_components/MarketCard.jsx`, find:

```js
const price = Number(card.last_price_eur ?? card.last_price_usd ?? 0);
```

Replace with:

```js
const priceRaw = card.last_price_eur ?? card.last_price_usd ?? null;
const price = priceRaw !== null ? Number(priceRaw) : null;
```

And find the price display:
```jsx
<span className="font-bold text-lg text-brand-primary">
    {price.toFixed(2)} €
</span>
```

Replace with:
```jsx
<span className="font-bold text-lg text-brand-primary">
    {price !== null ? `${price.toFixed(2)} €` : "— €"}
</span>
```

- [ ] **Step 3: Verify in the browser**

Start the frontend:
```bash
cd frontend && npm run dev
```

Navigate to `http://localhost:3001/market` (or whatever port). Verify:
- Cards without prices do not appear in the grid
- No card shows `0.00 €`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/useMarketCards.js frontend/src/app/market/_components/MarketCard.jsx
git commit -m "fix: hide cards without prices in market and add null price guard"
```

---

## Task 9: Deploy — reset blacklist and trigger sync

After all code changes are deployed, run these steps to re-populate prices.

**Files:** None (operational steps only)

- [ ] **Step 1: Start the backend**

```bash
cd backend && npm run dev
```

- [ ] **Step 2: Reset the blacklist**

```bash
curl -X POST http://localhost:3000/api/sync/reset-blacklist
```

Expected: `{ "message": "Blacklist limpiado correctamente", "deleted": <number> }`

- [ ] **Step 3: Trigger missing prices sync**

```bash
curl -X POST http://localhost:3000/api/sync/missing-prices
```

The sync runs in the background. Watch the terminal for logs like:
```
✅ TCGPlayer: $X.XX / €X.XX
✅ Cardmarket: €X.XX / $X.XX
```

- [ ] **Step 4: Check market page**

Open `http://localhost:3001/market` in the browser. Cards should now show prices. Verify the percentage of priced cards is significantly higher than before.

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Rewrite cardmarket.provider.js → pokemontcg.io | Task 3 |
| Create tcgdex.provider.js (renamed) | Task 2 |
| Aggregator: add 3rd TCGdex source, conditional call | Task 4 |
| Raise blacklist threshold 2→5 in sync.js | Task 5 |
| Raise blacklist threshold 3→5 in updatePrices.task.js | Task 5 |
| olderThanDays 30→7 in schedules.config.js | Task 5 |
| POST /api/sync/reset-blacklist endpoint | Task 6 |
| hasPrice filter in filterCards + getCardsFromSet | Task 7 |
| useMarketCards.js pass hasPrice: true | Task 8 |
| MarketCard.jsx null price guard | Task 8 |

All spec requirements covered. ✓

**Type/naming consistency:**

- `getTCGdexPrice` — defined in Task 2, imported in Task 4. ✓
- `getCardmarketPrice` — same export name as before, imported in aggregator unchanged. ✓
- `sourcesStatus.tcgdex` — added in Task 4 aggregator, consistent in both summary and return. ✓
- `filterCards` return shape changes in Task 7 from `Array` to `{ rows, total }` — Task 8 already destructures `{ cards: data, count }` via the API layer. The controller maps `rows → data` and `total → count`. ✓
