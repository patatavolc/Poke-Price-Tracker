"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getCard } from "../../../lib/api/cards";

function calcTrend(history, hoursAgo) {
    if (!history || history.length < 2) return null;
    const now = new Date();
    const cutoff = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const latest = parseFloat(history[history.length - 1].price_eur);
    const old = history
        .slice()
        .reverse()
        .find((h) => new Date(h.created_at) <= cutoff);
    if (!old || !parseFloat(old.price_eur)) return null;
    const oldPrice = parseFloat(old.price_eur);
    return (((latest - oldPrice) / oldPrice) * 100).toFixed(2);
}

export default function CardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!params.id) return;
        setLoading(true);
        getCard(params.id)
            .then(setCard)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [params.id]);

    const chartData = useMemo(() => {
        if (!card?.history) return [];
        return card.history.map((h) => ({
            date: new Date(h.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
            }),
            price: parseFloat(h.price_eur) || 0,
        }));
    }, [card]);

    const trend24h = useMemo(() => calcTrend(card?.history, 24), [card]);
    const trend7d = useMemo(() => calcTrend(card?.history, 168), [card]);

    if (loading) {
        return (
            <div className="min-h-screen bg-card-bg flex items-center justify-center text-white">
                <p>Cargando carta...</p>
            </div>
        );
    }

    if (error || !card) {
        return (
            <div className="min-h-screen bg-card-bg flex items-center justify-center text-white">
                <p>{error || "Carta no encontrada"}</p>
            </div>
        );
    }

    const currentPrice = parseFloat(card.last_price_eur ?? card.last_price_usd ?? 0);

    return (
        <div className="min-h-screen bg-card-bg text-gray-200 py-8 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-screen-2xl relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-brand-primary hover:text-white transition-colors mb-6 group"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al Mercado</span>
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Card Image */}
                    <aside className="w-full lg:w-[30%] flex flex-col items-center">
                        <div className="sticky top-24 w-full">
                            <div className="bg-[#002855] rounded-xl border border-ui-border p-2 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(255,195,0,0.3)] transition-shadow duration-500 relative aspect-[3/4]">
                                <Image
                                    src={card.image_large || card.image_small}
                                    alt={card.name}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    sizes="(max-width: 1024px) 100vw, 30vw"
                                    priority
                                />
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-card-bg border border-ui-border rounded-full text-sm font-medium">
                                    {card.set_name || card.set_id}
                                </span>
                                <span className="px-3 py-1 bg-card-bg border border-ui-border rounded-full text-sm font-medium text-brand-primary">
                                    {card.rarity}
                                </span>
                                {card.types && card.types[0] && (
                                    <span className="px-3 py-1 bg-card-bg border border-ui-border rounded-full text-sm font-medium">
                                        {card.types[0]}
                                    </span>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Right: Main Content */}
                    <main className="w-full lg:w-[70%] flex flex-col gap-10">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-2">
                            <h1 className="text-5xl md:text-7xl font-bold text-white font-display leading-tight flex-1">
                                {card.name}
                            </h1>
                            <div className="flex flex-col md:items-end pt-2">
                                <div className="text-5xl md:text-6xl font-bold text-brand-primary flex items-center">
                                    {currentPrice.toFixed(2)}
                                    <span className="text-4xl md:text-5xl ml-1">€</span>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    {trend24h !== null && (
                                        <div className={`flex items-center px-3 py-1.5 rounded-md text-sm font-bold ${Number(trend24h) >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                            {Number(trend24h) >= 0 ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <TrendingDown className="w-4 h-4 mr-1.5" />}
                                            24h: {Number(trend24h) >= 0 ? "+" : ""}{trend24h}%
                                        </div>
                                    )}
                                    {trend7d !== null && (
                                        <div className={`flex items-center px-3 py-1.5 rounded-md text-sm font-bold ${Number(trend7d) >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                            {Number(trend7d) >= 0 ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <TrendingDown className="w-4 h-4 mr-1.5" />}
                                            7d: {Number(trend7d) >= 0 ? "+" : ""}{trend7d}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chart: Price History */}
                        <div className="bg-ui-panel border border-ui-border p-6 rounded-xl shadow-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-6 border-b border-ui-border pb-4">
                                Historial de Precios
                            </h2>
                            {chartData.length > 0 ? (
                                <div className="h-[450px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                                            <XAxis dataKey="date" stroke="#A0AEC0" tick={{ fill: "#A0AEC0" }} tickMargin={10} />
                                            <YAxis stroke="#A0AEC0" tick={{ fill: "#A0AEC0" }} domain={["auto", "auto"]} tickFormatter={(v) => `€${v}`} tickMargin={10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#001B3A", border: "1px solid #2D3748", borderRadius: "8px" }}
                                                itemStyle={{ color: "#FFC300", fontWeight: "bold" }}
                                            />
                                            <Line type="monotone" dataKey="price" stroke="#FFC300" strokeWidth={3} dot={{ fill: "#FFC300", r: 5 }} activeDot={{ r: 8, fill: "#FFFFFF" }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No hay historial de precios disponible.</p>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
