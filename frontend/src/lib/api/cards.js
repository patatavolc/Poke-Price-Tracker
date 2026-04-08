// frontend/src/lib/api/cards.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function getCard(id) {
    const res = await fetch(`${API_URL}/api/cards/${id}`);
    if (!res.ok) throw new Error("Error al cargar la carta");
    return res.json();
}

export async function getCardsFromSet(setId, { limit = 20, offset = 0 } = {}) {
    const res = await fetch(
        `${API_URL}/api/cards/set/${setId}?limit=${limit}&offset=${offset}`
    );
    if (!res.ok) throw new Error("Error al cargar cartas del set");
    const data = await res.json();
    return data.data || data || [];
}

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

export async function getTrendingCards() {
    const res = await fetch(
        `${API_URL}/api/cards/trending/price-increase?period=24h`
    );
    if (!res.ok) throw new Error("Error al cargar trending cards");
    return res.json();
}

export async function getExpensiveCards() {
    const res = await fetch(
        `${API_URL}/api/cards/expensive?limit=8&currency=eur`
    );
    if (!res.ok) throw new Error("Error al cargar cartas caras");
    return res.json();
}
