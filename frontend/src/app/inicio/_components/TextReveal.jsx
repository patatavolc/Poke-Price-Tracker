"use client";

import { useEffect, useRef, useState } from "react";

const TextReveal = () => {
    const [visibleSections, setVisibleSections] = useState([]);
    const [pokemonEvents, setPokemonEvents] = useState([]);
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observers = [];

        sectionRefs.current.forEach((ref, index) => {
            if (!ref) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setVisibleSections((prev) => [
                                ...new Set([...prev, index]),
                            ]);
                        }
                    });
                },
                { threshold: 0.3 },
            );

            observer.observe(ref);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, []);

    useEffect(() => {
        // Generar eventos visuales de Pokemon para cada sección
        const events = sections.map((_, index) => {
            return {
                id1: Math.floor(Math.random() * 1010) + 1,
                id2: Math.floor(Math.random() * 1010) + 1,
                // Alternamos entre 'aparición salvaje' y 'batalla'
                type: index % 2 === 0 ? "encounter" : "battle",
                // Si es encuentro, alternamos en qué lado aparece
                side: index % 4 === 0 ? "left" : "right",
                // Generamos adicionalmente unos pocos Pokémon ambientales/flotantes de fondo por sección
                ambient: Array.from({ length: 4 }).map(() => ({
                    id: Math.floor(Math.random() * 1010) + 1,
                    top: Math.random() * 80 + 10, // Entre 10% y 90% de altura
                    left: Math.random() * 90 + 5, // Entre 5% y 95% de ancho
                    scale: Math.random() * 0.8 + 0.6, // Escala entre 0.6x y 1.4x
                    delay: Math.random() * 1000,
                    drift: Math.random() > 0.5 ? 1 : -1,
                })),
            };
        });
        setPokemonEvents(events);
    }, []);

    const sections = [
        {
            title: "Tu Portal al Mercado Pokémon",
            description:
                "Bienvenido a la plataforma definitiva para coleccionistas y traders de cartas Pokémon. Accede a información actualizada de miles de cartas y toma decisiones informadas.",
            gradient: "from-blue-500/20 to-purple-500/20",
        },
        {
            title: "Datos en Tiempo Real",
            description:
                "Monitoreamos constantemente los principales mercados para ofrecerte los precios más actuales. Nunca más pierdas una oportunidad por falta de información.",
            gradient: "from-purple-500/20 to-pink-500/20",
        },
        {
            title: "Análisis Profundo",
            description:
                "Visualiza tendencias históricas, compara precios entre diferentes mercados y descubre patrones que te ayudarán a maximizar el valor de tu colección.",
            gradient: "from-pink-500/20 to-yellow-500/20",
        },
        {
            title: "Gestión Inteligente",
            description:
                "Organiza tu colección, calcula su valor total y recibe recomendaciones personalizadas. Tu portfolio de cartas Pokémon, optimizado y al alcance de tu mano.",
            gradient: "from-yellow-500/20 to-blue-500/20",
        },
    ];

    return (
        <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-card-bg to-app">
            <div className="container mx-auto max-w-4xl">
                <div className="relative space-y-32">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            ref={(el) => (sectionRefs.current[index] = el)}
                            className={`
                relative transition-all duration-1000 ease-out
                ${
                    visibleSections.includes(index)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-20"
                }
              `}
                            style={{
                                transitionDelay: `${index * 200}ms`,
                            }}
                        >
                            {/* Fondo con gradiente */}
                            <div
                                className={`
                  absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${section.gradient}
                  blur-3xl transition-opacity duration-1000
                  ${visibleSections.includes(index) ? "opacity-100" : "opacity-0"}
                `}
                                style={{
                                    transitionDelay: `${index * 200 + 400}ms`,
                                }}
                            />

                            {/* Contenido */}
                            <div className="relative z-10 text-center space-y-6 px-8 py-12">
                                <h2
                                    className={`
                    text-4xl md:text-5xl lg:text-6xl font-bold text-white
                    transition-all duration-1000 ease-out
                    ${
                        visibleSections.includes(index)
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                    }
                  `}
                                    style={{
                                        transitionDelay: `${index * 200 + 200}ms`,
                                    }}
                                >
                                    {section.title}
                                </h2>

                                <p
                                    className={`
                    text-xl md:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto
                    transition-all duration-1000 ease-out
                    ${
                        visibleSections.includes(index)
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-10"
                    }
                  `}
                                    style={{
                                        transitionDelay: `${index * 200 + 600}ms`,
                                    }}
                                >
                                    {section.description}
                                </p>

                                {/* Línea decorativa */}
                                <div
                                    className={`
                    mx-auto h-1 bg-gradient-to-r from-transparent via-brand-highlight to-transparent
                    transition-all duration-1000 ease-out
                    ${
                        visibleSections.includes(index)
                            ? "opacity-100 w-64"
                            : "opacity-0 w-0"
                    }
                  `}
                                    style={{
                                        transitionDelay: `${index * 200 + 800}ms`,
                                    }}
                                />
                            </div>

                            {/* Efecto de superposición con el siguiente */}
                            {index < sections.length - 1 && (
                                <div className="absolute -bottom-16 inset-x-0 h-32 bg-gradient-to-b from-transparent to-app/50 pointer-events-none" />
                            )}

                            {/* Animaciones de Pokémon laterales y ambientales */}
                            {pokemonEvents.length > 0 &&
                                pokemonEvents[index] && (
                                    <>
                                        {/* === POKÉMON AMBIENTALES/FLOTANTES DE FONDO === */}
                                        {pokemonEvents[index].ambient?.map(
                                            (ambientSprite, j) => (
                                                <img
                                                    key={`ambient-${index}-${j}`}
                                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ambientSprite.id}.png`}
                                                    alt="Ambient Pokemon"
                                                    className={`
                        absolute pointer-events-none z-0
                        transition-all duration-[3s] ease-in-out
                        ${
                            visibleSections.includes(index)
                                ? `opacity-30 translate-y-0`
                                : "opacity-0 translate-y-12"
                        }
                      `}
                                                    style={{
                                                        top: `${ambientSprite.top}%`,
                                                        left: `${ambientSprite.left}%`,
                                                        transform: `scale(${ambientSprite.scale}) translateX(${
                                                            visibleSections.includes(
                                                                index,
                                                            )
                                                                ? ambientSprite.drift *
                                                                  20
                                                                : 0
                                                        }px)`,
                                                        imageRendering:
                                                            "pixelated",
                                                        filter: "blur(2px)",
                                                        transitionDelay: `${ambientSprite.delay}ms`,
                                                    }}
                                                />
                                            ),
                                        )}

                                        {/* === ENCUENTROS LATERALES PRINCIPALES === */}
                                        {/* Aparición Salvaje */}
                                        {pokemonEvents[index].type ===
                                            "encounter" && (
                                            <div
                                                className={`
                        hidden md:flex absolute top-1/2 -translate-y-1/2 ${
                            pokemonEvents[index].side === "left"
                                ? "-left-4 lg:-left-20 xl:-left-32 direction-ltr"
                                : "-right-4 lg:-right-20 xl:-right-32 direction-rtl"
                        } 
                        flex-col items-center z-20 pointer-events-none transition-all duration-[1.5s] ease-out
                        ${
                            visibleSections.includes(index)
                                ? "opacity-100 translate-x-0 scale-110"
                                : `opacity-0 scale-50 ${
                                      pokemonEvents[index].side === "left"
                                          ? "-translate-x-24"
                                          : "translate-x-24"
                                  }`
                        }
                      `}
                                            >
                                                <span
                                                    className={`text-brand-highlight font-black text-4xl lg:text-5xl mb-2 transition-opacity duration-300 delay-700 ${
                                                        visibleSections.includes(
                                                            index,
                                                        )
                                                            ? "opacity-100 animate-bounce"
                                                            : "opacity-0"
                                                    }`}
                                                >
                                                    !
                                                </span>
                                                <img
                                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonEvents[index].id1}.png`}
                                                    alt="Wild Pokemon"
                                                    className="w-24 h-24 lg:w-36 lg:h-36 drop-shadow-[0_0_15px_rgba(255,214,10,0.6)]"
                                                    style={{
                                                        imageRendering:
                                                            "pixelated",
                                                        transform:
                                                            pokemonEvents[index]
                                                                .side ===
                                                            "right"
                                                                ? "scaleX(-1)"
                                                                : "none",
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Batalla Pokémon */}
                                        {pokemonEvents[index].type ===
                                            "battle" && (
                                            <>
                                                {/* Combatiente Izquierdo */}
                                                <div
                                                    className={`
                          hidden md:flex absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-20 xl:-left-32
                          flex-col items-center z-20 pointer-events-none transition-all duration-[1.2s] ease-out
                          ${
                              visibleSections.includes(index)
                                  ? "opacity-100 translate-x-0 scale-110"
                                  : "opacity-0 -translate-x-32 scale-50"
                          }
                        `}
                                                >
                                                    <img
                                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonEvents[index].id1}.png`}
                                                        alt="Battle Pokemon 1"
                                                        className="w-24 h-24 lg:w-36 lg:h-36 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse"
                                                        style={{
                                                            imageRendering:
                                                                "pixelated",
                                                        }}
                                                    />
                                                </div>

                                                {/* Combatiente Derecho */}
                                                <div
                                                    className={`
                          hidden md:flex absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-20 xl:-right-32
                          flex-col items-center z-20 pointer-events-none transition-all duration-[1.2s] ease-out
                          ${
                              visibleSections.includes(index)
                                  ? "opacity-100 translate-x-0 scale-110"
                                  : "opacity-0 translate-x-32 scale-50"
                          }
                        `}
                                                    style={{
                                                        transitionDelay:
                                                            "200ms",
                                                    }}
                                                >
                                                    <img
                                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonEvents[index].id2}.png`}
                                                        alt="Battle Pokemon 2"
                                                        className="w-24 h-24 lg:w-36 lg:h-36 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"
                                                        style={{
                                                            imageRendering:
                                                                "pixelated",
                                                            transform:
                                                                "scaleX(-1)",
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                        </div>
                    ))}
                </div>

                {/* CTA final */}
                <div
                    ref={(el) => (sectionRefs.current[sections.length] = el)}
                    className={`
            mt-32 text-center transition-all duration-1000 ease-out
            ${
                visibleSections.includes(sections.length)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
            }
          `}
                >
                    <div className="inline-block px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-highlight rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300">
                        <p className="text-2xl md:text-3xl font-bold text-app">
                            Comienza tu aventura ahora
                        </p>
                    </div>
                </div>
            </div>

            {/* Efectos de fondo */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-highlight/5 rounded-full blur-3xl pointer-events-none" />
        </section>
    );
};

export default TextReveal;
