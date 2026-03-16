// frontend/src/app/market/_components/MarketCard.jsx

export default function MarketCard({ card }) {
    return (
        <div className="bg-[#002855] rounded-xl border border-ui-border overflow-hidden hover:border-brand-primary hover:shadow-[0_0_15px_rgba(255,195,0,0.2)] transition-all group flex flex-col shadow-md shadow-black/20">
            <div className="relative aspect-[3/4] bg-card-bg p-4 flex items-center justify-center">
                <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="p-4 flex flex-col flex-1 border-t border-ui-border">
                <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {card.name}
                </h3>
                <div className="text-sm text-gray-300 mb-3">
                    {card.set} • {card.rarity}
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="inline-block px-2 py-1 bg-card-bg border border-ui-border text-xs rounded-md text-gray-200 font-medium">
                        {card.type}
                    </span>
                    <span className="font-bold text-lg text-brand-primary">
                        {card.price.toFixed(2)} €
                    </span>
                </div>
            </div>
        </div>
    );
}
