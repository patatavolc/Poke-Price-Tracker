// frontend/src/lib/api/sets.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function getSets() {
    const res = await fetch(`${API_URL}/api/sets?orderBy=release_date`);
    if (!res.ok) throw new Error("Error al cargar los sets");
    const data = await res.json();
    return data.data || [];
}

export async function getLatestSet() {
    const sets = await getSets();
    if (!sets.length) throw new Error("No hay sets disponibles");
    return sets[0];
}
