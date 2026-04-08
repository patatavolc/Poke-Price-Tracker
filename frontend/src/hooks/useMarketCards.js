// frontend/src/hooks/useMarketCards.js
import { useState, useEffect } from "react";
import { getCard, getCardsFromSet, filterCards } from "../lib/api/cards";
import { getLatestSet } from "../lib/api/sets";

const ID_REGEX = /^[a-z0-9]+-\d+$/i;
const PAGE_SIZE = 20;

export function useMarketCards({
    debouncedSearch,
    selectedTypes,
    priceRange,
    selectedSet,
    selectedRarity,
    page,
}) {
    const [cards, setCards] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchCards() {
            setLoading(true);
            setError(null);
            try {
                const offset = (page - 1) * PAGE_SIZE;
                const hasFilters =
                    debouncedSearch ||
                    selectedTypes.length > 0 ||
                    priceRange.min ||
                    priceRange.max ||
                    selectedSet ||
                    selectedRarity;

                if (hasFilters) {
                    // Búsqueda por ID directo
                    if (debouncedSearch && ID_REGEX.test(debouncedSearch)) {
                        const card = await getCard(debouncedSearch);
                        if (!cancelled) {
                            setCards(card ? [card] : []);
                            setTotalCount(card ? 1 : 0);
                        }
                        return;
                    }
                    // Filtro avanzado (nombre + filtros)
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
                    if (!cancelled) {
                        setCards(data);
                        setTotalCount(count);
                    }
                } else {
                    // Default: cartas del set más reciente con precio
                    let data = [];
                    try {
                        const latestSet = await getLatestSet();
                        data = await getCardsFromSet(latestSet.id, { limit: PAGE_SIZE, offset });
                    } catch (_) {
                        // ignorar error del set, usar fallback
                    }

                    if (data.length === 0) {
                        // El set más reciente no tiene cartas con precio → mostrar generales
                        const { cards: fallback, count } = await filterCards({ hasPrice: true, limit: PAGE_SIZE, offset });
                        if (!cancelled) {
                            setCards(fallback);
                            setTotalCount(count);
                        }
                    } else {
                        if (!cancelled) {
                            setCards(data);
                            setTotalCount(
                                data.length < PAGE_SIZE
                                    ? offset + data.length
                                    : offset + PAGE_SIZE + 1
                            );
                        }
                    }
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchCards();
        return () => {
            cancelled = true;
        };
    }, [debouncedSearch, selectedTypes, priceRange, selectedSet, selectedRarity, page]);

    return { cards, totalCount, loading, error };
}
