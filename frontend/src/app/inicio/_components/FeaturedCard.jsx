export default function FeaturedCard({ cardData }) {
    const isPositive = cardData.priceChange >= 0;

    return (
        <div className="group relative bg-ui-border/30 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-ui-border/50">
            {/* Brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-highlight/0 via-brand-highlight/0 to-brand-highlight/0 group-hover:from-brand-highlight/10 group-hover:via-brand-highlight/5 transition-all duration-300" />

            <div className="relative p-6 flex flex-col items-center">
                {/* Imagen de la carta */}
                {cardData.image && (
                    <div className="w-full mb-6 flex justify-center">
                        <img
                            src={cardData.image}
                            alt={cardData.name}
                            className="w-full h-auto rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                )}

                {/* Nombre de la carta */}
                <h3 className="text-lg font-bold text-white mb-3 text-center">
                    {cardData.name}
                </h3>

                {/* Sección de precio */}
                <div className="w-full space-y-3">
                    {/* Precio principal */}
                    <div className="bg-app/50 rounded-lg p-4 border border-ui-border/30">
                        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                            Precio Actual
                        </p>
                        <p className="text-3xl font-bold text-brand-highlight">
                            ${cardData.price.toFixed(2)}
                        </p>
                    </div>

                    {/* Cambio de precio */}
                    <div
                        className={`rounded-lg p-3 ${isPositive ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                                Cambio 24h
                            </span>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-2xl ${isPositive ? "text-green-400" : "text-red-400"}`}
                                >
                                    {isPositive ? "↑" : "↓"}
                                </span>
                                <span
                                    className={`text-xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
                                >
                                    {Math.abs(cardData.priceChange).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
