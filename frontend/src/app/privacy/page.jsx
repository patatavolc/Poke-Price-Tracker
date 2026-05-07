export const metadata = {
    title: "Política de Privacidad | NOIDEX",
    description: "Política de privacidad y tratamiento de datos de NOIDEX",
};

const LAST_UPDATED = "7 de mayo de 2026";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-app">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
                        Política de{" "}
                        <span className="text-brand-highlight">Privacidad</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Última actualización: {LAST_UPDATED}
                    </p>
                </div>

                <div className="space-y-8">
                    <Section title="1. Información que Recopilamos">
                        <p className="mb-3">
                            Recopilamos la siguiente información cuando usas
                            NOIDEX:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>
                                <strong className="text-gray-300">
                                    Datos de cuenta:
                                </strong>{" "}
                                nombre de usuario y contraseña (almacenada de
                                forma cifrada).
                            </li>
                            <li>
                                <strong className="text-gray-300">
                                    Datos de uso:
                                </strong>{" "}
                                colección de cartas que registras en la
                                plataforma.
                            </li>
                            <li>
                                <strong className="text-gray-300">
                                    Datos técnicos:
                                </strong>{" "}
                                información básica del navegador para el
                                correcto funcionamiento del servicio.
                            </li>
                        </ul>
                    </Section>

                    <Section title="2. Cómo Usamos tu Información">
                        <p className="mb-3">
                            Utilizamos los datos recopilados para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>
                                Proporcionar y mantener el servicio de NOIDEX.
                            </li>
                            <li>
                                Gestionar tu cuenta y colección personal de
                                cartas.
                            </li>
                            <li>
                                Mejorar la plataforma basándonos en patrones de
                                uso agregados y anónimos.
                            </li>
                            <li>
                                Garantizar la seguridad e integridad del
                                servicio.
                            </li>
                        </ul>
                    </Section>

                    <Section title="3. Almacenamiento y Seguridad">
                        <p>
                            Los datos se almacenan en servidores seguros. Las
                            contraseñas se guardan cifradas mediante algoritmos
                            de hash estándar de la industria. Aplicamos medidas
                            técnicas y organizativas razonables para proteger tu
                            información, aunque ningún sistema es completamente
                            infalible.
                        </p>
                    </Section>

                    <Section title="4. Compartición de Datos">
                        <p>
                            No vendemos ni compartimos tu información personal
                            con terceros. Los datos de precios que mostramos
                            provienen de APIs públicas de terceros (como TCGdex)
                            y no incluyen información personal de los usuarios.
                        </p>
                    </Section>

                    <Section title="5. Cookies y Almacenamiento Local">
                        <p>
                            NOIDEX utiliza el almacenamiento local del
                            navegador (localStorage) para mantener tu sesión
                            iniciada. No utilizamos cookies de seguimiento ni
                            publicidad de terceros.
                        </p>
                    </Section>

                    <Section title="6. Tus Derechos">
                        <p className="mb-3">Tienes derecho a:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>
                                Acceder a los datos personales que tenemos sobre
                                ti.
                            </li>
                            <li>
                                Solicitar la corrección de datos inexactos.
                            </li>
                            <li>
                                Solicitar la eliminación de tu cuenta y datos
                                asociados.
                            </li>
                        </ul>
                        <p className="mt-3">
                            Para ejercer estos derechos, contáctanos a través de
                            nuestros canales oficiales.
                        </p>
                    </Section>

                    <Section title="7. Menores de Edad">
                        <p>
                            NOIDEX no está dirigido a menores de 14 años. No
                            recopilamos conscientemente información personal de
                            menores. Si crees que un menor ha creado una cuenta,
                            contáctanos para proceder a su eliminación.
                        </p>
                    </Section>

                    <Section title="8. Cambios en esta Política">
                        <p>
                            Podemos actualizar esta política ocasionalmente. La
                            fecha de última actualización siempre estará visible
                            al inicio de esta página. El uso continuado del
                            servicio tras los cambios implica la aceptación de
                            la nueva política.
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
