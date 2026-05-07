export const metadata = {
    title: "Sobre Nosotros | NOIDEX",
    description: "Conoce el equipo y la misión detrás de NOIDEX",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-app">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
                        Sobre{" "}
                        <span className="text-brand-highlight">Nosotros</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Somos apasionados del Pokémon TCG construyendo la
                        herramienta que siempre quisimos tener.
                    </p>
                </div>

                {/* Misión */}
                <section className="bg-card-bg border border-ui-border rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-brand-highlight mb-4">
                        Nuestra Misión
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        NOIDEX nació con un objetivo claro: democratizar el
                        acceso a la información del mercado de cartas Pokémon
                        TCG. Queremos que cualquier coleccionista, desde el
                        principiante hasta el inversor experimentado, pueda
                        tomar decisiones informadas sobre su colección.
                    </p>
                    <p className="text-gray-300 leading-relaxed mt-4">
                        Rastreamos precios en tiempo real, analizamos tendencias
                        y ofrecemos herramientas como el simulador de apertura
                        de sobres para que la experiencia Pokémon sea completa
                        dentro de una sola plataforma.
                    </p>
                </section>

                {/* Qué ofrecemos */}
                <section className="bg-card-bg border border-ui-border rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-brand-highlight mb-6">
                        Qué Ofrecemos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Rastreo de Precios",
                                desc: "Seguimiento en tiempo real de los precios de miles de cartas Pokémon TCG.",
                            },
                            {
                                title: "Gestión de Colección",
                                desc: "Organiza y valora tu colección personal con datos actualizados del mercado.",
                            },
                            {
                                title: "Simulador de Sobres",
                                desc: "Abre sobres virtuales de cualquier expansión y descubre qué cartas podrías obtener.",
                            },
                            {
                                title: "Análisis de Mercado",
                                desc: "Gráficas y tendencias para entender el comportamiento del mercado TCG.",
                            },
                        ].map(({ title, desc }) => (
                            <div
                                key={title}
                                className="bg-app border border-ui-border rounded-xl p-5"
                            >
                                <h3 className="text-white font-semibold mb-2">
                                    {title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="bg-card-bg border border-ui-border rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-brand-highlight mb-4">
                        Aviso Legal
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        NOIDEX es un proyecto independiente sin afiliación
                        oficial con Nintendo, The Pokémon Company ni sus
                        subsidiarias. Pokémon y todos los nombres relacionados
                        son marcas registradas de sus respectivos propietarios.
                        Los datos de precios se obtienen de fuentes públicas de
                        terceros.
                    </p>
                </section>
            </div>
        </div>
    );
}