"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const FlipCard = ({ cards = [], interval = 3000, className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const cardRef = useRef(null);

    // URL del dorso oficial de cartas Pokémon TCG (dorso azul)
    const cardBack = "/images/card-back.png"; // Asegúrate de tener esta imagen en tu carpeta pública

    useEffect(() => {
        if (cards.length === 0) return;

        const timer = setInterval(() => {
            // Rotar 360 grados a la izquierda
            setRotation((prev) => prev - 360);

            // Cambiar la carta cuando esté en el dorso (mitad de la rotación)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % cards.length);
            }, 300);

            // Después de completar la animación, resetear a 0 sin transición
            setTimeout(() => {
                if (cardRef.current) {
                    cardRef.current.style.transition = "none";
                    setRotation(0);
                    // Forzar un reflow para que el cambio sin transición se aplique
                    requestAnimationFrame(() => {
                        if (cardRef.current) {
                            cardRef.current.style.transition =
                                "transform 600ms ease-in-out";
                        }
                    });
                }
            }, 600);
        }, interval);

        return () => clearInterval(timer);
    }, [cards.length, interval]);

    if (cards.length === 0) {
        return null;
    }

    const currentCard = cards[currentIndex];

    return (
        <div
            className={`w-full h-full ${className}`}
            style={{ perspective: "1000px" }}
        >
            <div
                ref={cardRef}
                className="relative w-full h-full transition-transform duration-[600ms] ease-in-out"
                style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${rotation}deg)`,
                }}
            >
                {/* Frente de la carta */}
                <div
                    className="absolute w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                    }}
                >
                    <div className="relative w-full h-full">
                        <Image
                            src={currentCard.image || currentCard}
                            alt={currentCard.name || "Carta Pokémon"}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 30vw"
                            onError={(e) => {
                                console.error(
                                    "Error loading image:",
                                    currentCard,
                                );
                                // Next/Image onError handling is different, it doesn't support e.target.src replacement directly like img
                                // For now we keep it simple or implement state based fallback if critical
                            }}
                        />
                    </div>
                </div>

                {/* Dorso de la carta */}
                <div
                    className="absolute w-full h-full rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    <div className="relative w-full h-full">
                        <Image
                            src={cardBack}
                            alt="Dorso de carta Pokémon"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 30vw"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlipCard;
