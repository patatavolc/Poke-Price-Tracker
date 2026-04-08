# Market Bug Fixes — Diseño

**Fecha:** 2026-04-08  
**Branch:** feature/pack-simullator (se aplica antes de la página de mercado)

---

## Contexto

Tres bugs en la página de mercado (`/market`) del Poke Price Tracker que impiden filtrar y buscar cartas correctamente.

---

## Bug 1: Filtro por tipo no devuelve cartas

### Causa raíz
El frontend define tipos usando nombres del videojuego Pokémon en español ("Hielo", "Veneno", "Bicho"…). La base de datos almacena los tipos tal como los devuelve la API del Pokemon TCG, en inglés y con la nomenclatura propia del TCG físico (Fire, Water, Grass, Lightning…). Tipos como "Ice", "Poison", "Bug" no existen en el TCG físico, por lo que ninguna carta los tiene.

### Fix
**Fichero:** `frontend/src/app/market/page.jsx`

- Reemplazar la constante `TYPES` con los 11 tipos reales del Pokemon TCG físico, en español.
- Añadir la constante `TYPE_API_MAP` que mapea cada nombre en español al nombre en inglés que usa la API/DB.
- Al pasar `selectedTypes` al hook, aplicar el mapa antes de enviarlo.

**Tipos TCG reales:**
```
Incoloro → Colorless
Fuego    → Fire
Agua     → Water
Planta   → Grass
Eléctrico→ Lightning
Psíquico → Psychic
Lucha    → Fighting
Oscuridad→ Darkness
Metal    → Metal
Hada     → Fairy
Dragón   → Dragon
```

**Fichero:** `frontend/src/app/market/_components/FilterSidebar.jsx`

- Actualizar `TYPE_ICONS` para reflejar solo los 11 tipos TCG (eliminar entradas inexistentes, renombrar "Siniestro" → "Oscuridad").

---

## Bug 2: Sets "Ascended Heroes" y "Perfect Order" no muestran cartas

### Causa raíz
`useMarketCards.js` siempre pasa `hasPrice: true` al endpoint `/api/cards/filter`. Estos sets tienen cartas sincronizadas pero sin precio aún (pendientes de sync de precios), por lo que el filtro las excluye todas. El backend ya soporta `hasPrice: false` — el problema está solo en el frontend.

### Fix
**Ficheros:** `frontend/src/lib/api/cards.js` y `frontend/src/hooks/useMarketCards.js`

- Añadir `hasPrice` como parámetro a la función `filterCards` en `cards.js` y enviarlo al backend cuando sea `false`.
- En `useMarketCards.js`: cuando `selectedSet` está activo, pasar `hasPrice: false`.

---

## Bug 3: Búsqueda por nombre no muestra cartas sin precio (ej. Lucario)

### Causa raíz
Igual que Bug 2: `hasPrice: true` forzado en todas las llamadas a `filterCards`. Además, la función `filterCards` en `cards.js` no aceptaba ni reenviaba el parámetro `hasPrice`.

### Fix
**Fichero:** `frontend/src/hooks/useMarketCards.js`

- Cuando `debouncedSearch` está activo, pasar `hasPrice: false`.

**Regla:** `hasPrice: false` se activa cuando hay búsqueda por nombre OR set seleccionado. Con solo filtros de precio/rareza/tipo, se mantiene `hasPrice: true`.

**Fichero:** `frontend/src/app/market/_components/MarketCard.jsx`

- Mostrar "Precio desconocido" en lugar de "— €" para cartas sin precio.
- La carta sigue siendo clickable (el Link envuelve todo el componente).

---

## Ficheros afectados

| Fichero | Cambio |
|---|---|
| `frontend/src/app/market/page.jsx` | Nueva `TYPES` (11 tipos TCG) + `TYPE_API_MAP` |
| `frontend/src/app/market/_components/FilterSidebar.jsx` | Actualizar `TYPE_ICONS` |
| `frontend/src/lib/api/cards.js` | Añadir `hasPrice` a `filterCards` |
| `frontend/src/hooks/useMarketCards.js` | `hasPrice` condicional + mapeo de tipos |
| `frontend/src/app/market/_components/MarketCard.jsx` | "Precio desconocido" |

**Backend:** Sin cambios. Ya soporta `hasPrice` vía `req.query.hasPrice !== "false"`.

---

## Criterios de éxito

1. Seleccionar "Fuego" en el filtro de tipos devuelve cartas con `types: ["Fire"]`.
2. Seleccionar "Ascended Heroes" o "Perfect Order" muestra sus cartas (con "Precio desconocido" si no tienen precio).
3. Buscar "Lucario" muestra todas las cartas de Lucario, con o sin precio.
4. Las cartas sin precio son clickables y llevan a `/market/[id]`.
5. La vista por defecto (sin filtros) sigue mostrando solo cartas con precio.
