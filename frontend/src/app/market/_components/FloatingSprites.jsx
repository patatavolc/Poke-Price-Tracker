"use client";

import { useEffect, useState } from "react";
import { animate } from "animejs";

export default function FloatingSprites() {
    const [sprites, setSprites] = useState([]);

    useEffect(() => {
        // Para evitar el warning de "cascading renders", movemos la inicialización
        // fuera del flujo síncrono del efecto usando setTimeout
        const timer = setTimeout(() => {
            // Inicializamos 10 sprites para que floten por el fondo
            const initialSprites = Array.from({ length: 10 }).map((_, i) => ({
                id: i,
                pokemonId: Math.floor(Math.random() * 1010) + 1, // IDs de Pokemon funcionales
                scale: Math.random() * 1 + 1, // Escala aleatoria entre 1x y 2x
                delay: Math.random() * 3000, // Retraso de inicio aleatorio
            }));

            setSprites(initialSprites);
        }, 10);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (sprites.length === 0) return;

        // Para cada sprite, iniciamos un bucle de animación con anime.js
        sprites.forEach((sprite) => {
            const el = document.getElementById(`floating-sprite-${sprite.id}`);
            if (!el) return;

            const loopAnimation = () => {
                // Calcular posiciones aleatorias en los bordes o áreas libres (pantalla completa)
                const newTop = Math.random() * 90; // 0% a 90%
                const newLeft = Math.random() * 90; // 0% a 90%

                // Nuevo pokemon para variar
                const newPokemonId = Math.floor(Math.random() * 1010) + 1;

                // Actualizamos posición e imagen por DOM para mejor rendimiento fluido sin re-renders de React
                el.style.top = `${newTop}%`;
                el.style.left = `${newLeft}%`;
                el.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${newPokemonId}.png`;

                animate(el, {
                    opacity: [0, 0.45, 0], // Aparece más visible (45%) y desaparece
                    translateY: [30, -30], // Flota suavemente de abajo hacia arriba
                    translateX: [0, (Math.random() - 0.5) * 40], // Pequeña deriva lateral
                    duration: 7000 + Math.random() * 5000, // Entre 7 y 12 segundos
                    ease: "linear",
                    onComplete: () => {
                        // Al terminar se programa para reaparecer
                        setTimeout(loopAnimation, Math.random() * 4000); // Esperar hasta 4s antes del siguiente
                    },
                });
            };

            // Iniciar animación inicial
            setTimeout(loopAnimation, sprite.delay);
        });
    }, [sprites]);

    if (sprites.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {sprites.map((sprite) => (
                <img
                    key={sprite.id}
                    id={`floating-sprite-${sprite.id}`}
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${sprite.pokemonId}.png`}
                    alt="Floating Pokemon Sprite"
                    className="absolute opacity-0"
                    style={{
                        transform: `scale(${sprite.scale})`,
                        filter: "blur(1px) drop-shadow(0 0 10px rgba(255, 255, 255, 0.1))", // Difumina un poco para fondo
                        width: "96px",
                        height: "96px",
                        imageRendering: "pixelated", // Para que los sprites no se vean borrosos al escalar
                    }}
                />
            ))}
        </div>
    );
}
