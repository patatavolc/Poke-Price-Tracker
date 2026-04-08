# Price Sync Fix — Design Spec

**Date:** 2026-04-08  
**Branch:** fix/backend/price  
**Status:** Approved

---

## Problem

Many cards on the market page show no price (`0.00 €`). The root causes are:

1. **Backend — weak Cardmarket source.** The current `cardmarket.provider.js` uses TCGdex, which has partial coverage. Many cards return 404 or `pricing.cardmarket = null`. Meanwhile, `pokemontcg.io` (already used for TCGPlayer) returns Cardmarket EUR prices in the same API response under `card.cardmarket.prices` — this field is currently ignored.

2. **Backend — over-aggressive blacklist.** Cards get added to `cards_without_price` and skipped after just 2 failed attempts. Cards that failed before the fix will never be retried promptly.

3. **Frontend — no price filter.** `filterCards()` returns cards with `NULL` prices, which the market renders as `0.00 €`.

---

## Goals

- Maximize price coverage using existing free/public APIs (no new accounts required).
- Average prices across multiple independent sources (EUR + USD converted).
- Stop showing cards without prices in the market UI.
- Make the system easy to extend with new price sources in the future.

---

## Architecture

### Price Sources (after fix)

| # | Source | Currency | API | Provider file |
|---|---|---|---|---|
| 1 | TCGPlayer | USD | pokemontcg.io | `tcgplayer.provider.js` (unchanged) |
| 2 | Cardmarket | EUR | pokemontcg.io | `cardmarket.provider.js` (rewritten) |
| 3 | Cardmarket | EUR | TCGdex | `tcgdex.provider.js` (renamed from current cardmarket.provider.js) |

A single HTTP call to `pokemontcg.io` now provides sources 1 and 2. TCGdex (source 3) is called only when pokemontcg.io does not return Cardmarket data, avoiding redundant requests.

### Data Flow

```
aggregator.js
  └── pokemontcgProvider(cardId)
        ├── → tcgplayer.provider.js  → { priceUsd }
        └── → cardmarket.provider.js → { priceEur }
  └── tcgdexProvider(cardId)        → { priceEur }  [only if source 2 is null]
  └── validPrices = [non-null results]
  └── avgEur = sum(priceEur) / count
  └── avgUsd = sum(priceUsd) / count
  └── save to price_history + update cards.last_price_eur / last_price_usd
```

---

## Backend Changes

### 1. `cardmarket.provider.js` — rewrite

Read `card.cardmarket.prices` from `pokemontcg.io` instead of TCGdex.

EUR price priority (first non-null value):
1. `averageSellPrice`
2. `trendPrice`
3. `avg30`
4. `avg7`
5. `lowPrice`

Returns `{ priceEur, source: "cardmarket" }` or `null`.

### 2. `tcgdex.provider.js` — rename from current `cardmarket.provider.js`

No functional changes. Reads `card.pricing.cardmarket` from TCGdex.  
Returns `{ priceEur, source: "tcgdex" }` or `null`.

### 3. `aggregator.js` — add 3rd source

- `Promise.all` extended to include TCGdex provider.
- TCGdex is only called if pokemontcg.io Cardmarket returns null (to reduce unnecessary HTTP calls).
- Average calculation unchanged: sum all valid prices / count of valid sources.
- `sourcesStatus` tracking extended to include `tcgdex`.

### 4. Blacklist thresholds — raise

| File | Current threshold | New threshold |
|---|---|---|
| `sync.js` → `syncMissingPrices` | `attempt_count >= 2` | `attempt_count >= 5` |
| `updatePrices.task.js` → `updateNormalPricesTask` | `attempt_count >= 3` | `attempt_count >= 5` |

### 5. `schedules.config.js` — reduce retry window

`RETRY_WITHOUT_PRICE.olderThanDays`: 30 → 7  
Cards that failed before the fix will be retried within 7 days instead of 30.

### 6. Reset-blacklist endpoint — new

`POST /api/sync/reset-blacklist`  
Truncates `cards_without_price` table so all previously blacklisted cards are retried on the next sync cycle. Admin use only (no auth required beyond existing middleware).

Added to:
- `sync.routes.js` — new route
- `sync.controller.js` — new controller function

---

## Frontend Changes

### 7. `card.service.js` — `filterCards()` and `getCardsFromSet()`

Add optional `hasPrice` boolean parameter (default: `true`).  
When `true`, appends to WHERE clause:
```sql
(c.last_price_eur IS NOT NULL OR c.last_price_usd IS NOT NULL)
```

### 8. `useMarketCards.js` — pass `hasPrice: true`

Both the filtered call and the fallback `filterCards` call pass `hasPrice: true`.

### 9. `MarketCard.jsx` — null price guard

If both `last_price_eur` and `last_price_usd` are null/0, display `— €` instead of `0.00 €`.

---

## Out of Scope

- Schema changes (no new tables or columns needed).
- Changes to Redis workers, job scheduler structure, or card/set routes.
- Authentication on the reset-blacklist endpoint (admin-only by convention for now).
- Adding paid or OAuth-based APIs (eBay, PriceCharting).

---

## Files Changed

| File | Change type |
|---|---|
| `backend/src/services/price/cardmarket.provider.js` | Rewrite |
| `backend/src/services/price/tcgdex.provider.js` | New (renamed from cardmarket.provider.js) |
| `backend/src/services/price/aggregator.js` | Modify — add 3rd source |
| `backend/src/services/price/cardsWithoutPrice.service.js` | No change (thresholds are in callers) |
| `backend/src/services/price/sync.js` | Modify — raise blacklist threshold |
| `backend/src/jobs/task/updatePrices.task.js` | Modify — raise blacklist threshold |
| `backend/src/jobs/config/schedules.config.js` | Modify — olderThanDays 30→7 |
| `backend/src/routes/sync.routes.js` | Modify — add reset-blacklist route |
| `backend/src/controllers/sync.controller.js` | Modify — add reset-blacklist handler |
| `backend/src/services/card.service.js` | Modify — hasPrice filter |
| `frontend/src/hooks/useMarketCards.js` | Modify — pass hasPrice: true |
| `frontend/src/app/market/_components/MarketCard.jsx` | Modify — null price guard |
