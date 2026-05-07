export const metadata = {
    title: "Términos de Servicio | NOIDEX",
    description: "Términos y condiciones de uso de NOIDEX",
};

const LAST_UPDATED = "7 de mayo de 2026";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-app">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
                        Términos de{" "}
                        <span className="text-brand-highlight">Servicio</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Última actualización: {LAST_UPDATED}
                    </p>
                </div>

                <div className="space-y-8">
                    <Section title="1. Aceptación de los Términos">
                        <p>
                            Al acceder y utilizar NOIDEX, aceptas quedar
                            vinculado por estos Términos de Servicio. Si no
                            estás de acuerdo con alguna parte de estos términos,
                            no podrás acceder al servicio.
                        </p>
                    </Section>

                    <Section title="2. Descripción del Servicio">
                        <p>
                            NOIDEX es una plataforma web que proporciona
                            información sobre precios de cartas Pokémon TCG,
                            herramientas de gestión de colecciones y un
                            simulador de apertura de sobres. El servicio se
                            ofrece "tal como está" y puede modificarse o
                            interrumpirse en cualquier momento.
                        </p>
                    </Section>

                    <Section title="3. Uso Aceptable">
                        <p className="mb-3">Al usar NOIDEX, te comprometes a:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>
                                No utilizar el servicio para actividades ilegales
                                o no autorizadas.
                            </li>
                            <li>
                                No intentar acceder a sistemas o datos no
                                destinados a ti.
                            </li>
                            <li>
                                No interferir con el funcionamiento normal de la
                                plataforma.
                            </li>
                            <li>
                                No reproducir ni redistribuir el contenido de la
                                plataforma sin autorización.
                            </li>
                        </ul>
                    </Section>

                    <Section title="4. Cuentas de Usuario">
                        <p>
                            Para acceder a ciertas funcionalidades necesitas
                            crear una cuenta. Eres responsable de mantener la
                            confidencialidad de tus credenciales y de todas las
                            actividades realizadas con tu cuenta. NOIDEX se
                            reserva el derecho de cancelar cuentas que infrinjan
                            estos términos.
                        </p>
                    </Section>

                    <Section title="5. Propiedad Intelectual">
                        <p>
                            El contenido original de NOIDEX (diseño, código,
                            textos propios) es propiedad de sus creadores.
                            Pokémon, sus personajes y logos son marcas
                            registradas de Nintendo / The Pokémon Company. Los
                            datos de precios provienen de fuentes de terceros y
                            se usan con fines informativos.
                        </p>
                    </Section>

                    <Section title="6. Limitación de Responsabilidad">
                        <p>
                            NOIDEX proporciona información de precios con fines
                            informativos únicamente. No garantizamos la
                            exactitud, integridad o actualidad de los datos. No
                            somos responsables de decisiones de compra o venta
                            tomadas basándose en la información de la
                            plataforma.
                        </p>
                    </Section>

                    <Section title="7. Modificaciones">
                        <p>
                            Nos reservamos el derecho de modificar estos
                            términos en cualquier momento. Los cambios entrarán
                            en vigor al publicarse en esta página. El uso
                            continuado del servicio tras las modificaciones
                            implica la aceptación de los nuevos términos.
                        </p>
                    </Section>

                    <Section title="8. Contacto">
                        <p>
                            Para cualquier consulta sobre estos términos, puedes
                            escribirnos a través de nuestras redes sociales o
                            canales oficiales.
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="bg-card-bg border border-ui-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-brand-highlight mb-4">
                {title}
            </h2>
            <div className="text-gray-300 leading-relaxed">{children}</div>
        </section>
    );
}
