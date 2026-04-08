# Market Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir tres bugs en la página de mercado: filtro de tipos incorrecto, sets sin cartas visibles cuando no tienen precio, y búsqueda por nombre que omite cartas sin precio.

**Architecture:** Todos los cambios son en frontend (5 ficheros). El backend ya soporta `hasPrice` como parámetro — solo faltaba que el frontend lo enviara correctamente. Se reemplaza la lista de tipos por los 11 tipos reales del Pokemon TCG con un mapa español→inglés aplicado antes de llamar a la API.

**Tech Stack:** Next.js 14, React hooks, fetch nativo

---

## File Map

| Fichero | Rol |
|---|---|
| `frontend/src/app/market/page.jsx` | Define constantes `TYPES` y `TYPE_API_MAP`, pasa el mapa al hook |
| `frontend/src/app/market/_components/FilterSidebar.jsx` | `TYPE_ICONS` actualizado a los 11 tipos TCG |
| `frontend/src/lib/api/cards.js` | `filterCards` acepta y reenvía `hasPrice` al backend |
| `frontend/src/hooks/useMarketCards.js` | `hasPrice` condicional según si hay búsqueda/set; mapeo de tipos |
| `frontend/src/app/market/_components/MarketCard.jsx` | Muestra "Precio desconocido" para cartas sin precio |

---

### Task 1: Reemplazar la lista de tipos con tipos TCG reales

**Files:**
- Modify: `frontend/src/app/market/page.jsx`

- [ ] **Step 1: Reemplazar `TYPES` y añadir `TYPE_API_MAP`**

Sustituir el bloque de constantes al inicio del fichero (líneas 11-38):

```jsx
const TYPES = [
    "Incoloro",
    "Fuego",
    "Agua",
    "Planta",
    "Eléctrico",
    "Psíquico",
    "Lucha",
    "Oscuridad",
    "Metal",
    "Hada",
    "Dragón",
];

const TYPE_API_MAP = {
    Incoloro: "Colorless",
    Fuego: "Fire",
    Agua: "Water",
    Planta: "Grass",
    Eléctrico: "Lightning",
    Psíquico: "Psychic",
    Lucha: "Fighting",
    Oscuridad: "Darkness",
    Metal: "Metal",
    Hada: "Fairy",
    Dragón: "Dragon",
};

const RARITIES = [
    "Común",
    "Infrecuente",
    "Rara",
    "Rara Holo",
    "Ultra Rara",
    "Secreta",
];
const PAGE_SIZE = 20;
```

- [ ] **Step 2: Pasar `TYPE_API_MAP` al hook `useMarketCards`**

En la llamada al hook (líneas 52-59), añadir `typeApiMap`:

```jsx
const { cards, totalCount, loading, error } = useMarketCards({
    debouncedSearch,
    selectedTypes,
    typeApiMap: TYPE_API_MAP,
    priceRange,
    selectedSet,
    selectedRarity,
    page,
});
```

---

### Task 2: Actualizar `TYPE_ICONS` en FilterSidebar

**Files:**
- Modify: `frontend/src/app/market/_components/FilterSidebar.jsx`

- [ ] **Step 1: Reemplazar el mapa `TYPE_ICONS`**

Sustituir el objeto `TYPE_ICONS` (líneas 6-25) con los 11 tipos TCG:

```jsx
const TYPE_ICONS = {
    Incoloro: "normal",
    Fuego: "fire",
    Agua: "water",
    Planta: "grass",
    Eléctrico: "electric",
    Psíquico: "psychic",
    Lucha: "fighting",
    Oscuridad: "dark",
    Metal: "steel",
    Hada: "fairy",
    Dragón: "dragon",
};
```

---

### Task 3: Añadir `hasPrice` a la función `filterCards` de la API

**Files:**
- Modify: `frontend/src/lib/api/cards.js`

- [ ] **Step 1: Actualizar la firma y el body de `filterCards`**

Reemplazar la función completa `filterCards` (líneas 19-43):

```js
export async function filterCards({
    name,
    types,
    rarity,
    set,
    minPrice,
    maxPrice,
    hasPrice,
    limit = 20,
    offset = 0,
} = {}) {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (types && types.length > 0) params.append("types", types.join(","));
    if (rarity) params.append("rarity", rarity);
    if (set) params.append("set", set);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (hasPrice === false) params.append("hasPrice", "false");
    params.append("limit", limit);
    params.append("offset", offset);

    const res = await fetch(`${API_URL}/api/cards/filter?${params.toString()}`);
    if (!res.ok) throw new Error("Error al filtrar cartas");
    const data = await res.json();
    return { cards: data.data || [], count: data.count || 0 };
}
```

---

### Task 4: `hasPrice` condicional y mapeo de tipos en el hook

**Files:**
- Modify: `frontend/src/hooks/useMarketCards.js`

- [ ] **Step 1: Actualizar la firma del hook para recibir `typeApiMap`**

Reemplazar la firma de la función `useMarketCards` (líneas 9-16):

```js
export function useMarketCards({
    debouncedSearch,
    selectedTypes,
    typeApiMap,
    priceRange,
    selectedSet,
    selectedRarity,
    page,
}) {
```

- [ ] **Step 2: Aplicar mapeo de tipos y `hasPrice` condicional en `fetchCards`**

Reemplazar el bloque de llamada a `filterCards` dentro del `if (hasFilters)` (líneas 49-59):

```js
const mappedTypes =
    selectedTypes.length > 0
        ? selectedTypes.map((t) => typeApiMap[t] || t)
        : undefined;

const showWithoutPrice = !!(debouncedSearch || selectedSet);

const { cards: data, count } = await filterCards({
    name: debouncedSearch || undefined,
    types: mappedTypes,
    rarity: selectedRarity || undefined,
    set: selectedSet || undefined,
    minPrice: priceRange.min || undefined,
    maxPrice: priceRange.max || undefined,
    hasPrice: showWithoutPrice ? false : undefined,
    limit: PAGE_SIZE,
    offset,
});
```

Nota: `hasPrice: undefined` equivale a no enviar el parámetro, dejando al backend usar su default (`true`). `hasPrice: false` lo envía explícitamente como `"false"` al query string.

---

### Task 5: Mostrar "Precio desconocido" en MarketCard

**Files:**
- Modify: `frontend/src/app/market/_components/MarketCard.jsx`

- [ ] **Step 1: Actualizar la línea del precio**

Reemplazar línea 39:

```jsx
<span className="font-bold text-lg text-brand-primary">
    {price !== null ? `${price.toFixed(2)} €` : "Precio desconocido"}
</span>
```

El componente ya tiene `Link` envolviendo todo, así que las cartas sin precio siguen siendo clickables y llevan a `/market/[id]`.

---

## Self-Review

**Spec coverage:**
- ✅ Bug 1 (tipos): Tasks 1 y 2 — nueva lista TCG + mapa + TYPE_ICONS actualizados
- ✅ Bug 2 (sets sin cartas): Tasks 3 y 4 — `hasPrice: false` cuando `selectedSet` activo
- ✅ Bug 3 (búsqueda sin precio): Tasks 3 y 4 — `hasPrice: false` cuando `debouncedSearch` activo
- ✅ MarketCard muestra "Precio desconocido": Task 5
- ✅ Vista por defecto sigue sin cartas sin precio (solo `hasPrice: false` cuando hay búsqueda o set)
- ✅ Backend sin cambios

**Placeholder scan:** Sin TBD ni TODO. Código completo en cada step.

**Type consistency:** `typeApiMap` se define en `page.jsx` Task 1 Step 2, se recibe en `useMarketCards` Task 4 Step 1, y se usa en Task 4 Step 2. Nombres consistentes.
