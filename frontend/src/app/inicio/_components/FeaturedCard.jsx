export default function FeaturedCard({ cardData }) {
  return (
    <div className="bg-card-bg rounded-lg shadow-lg p-6 flex flex-col items-center">
      <img
        src={`https://images.pokemontcg.io/${cardData.name.toLowerCase().replace(/ /g, "")}/hires.png`}
        alt={cardData.name}
        className="w-full h-auto mb-4 rounded-md"
      />
      <h3 className="text-xl font-semibold mb-2">
        {cardData.name}
      </h3>
      <p className="text-lg font-bold mb-1">
        ${cardData.price.toFixed(2)}
      </p>
      <p
        className={`text-sm ${
          cardData.priceChange >= 0
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {cardData.priceChange >= 0 ? "+" : ""}
        {cardData.priceChange.toFixed(1)}%
      </p>
    </div>
  );
};
