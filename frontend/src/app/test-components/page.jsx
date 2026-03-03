import Navbar from "@/components/common/Navbar";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">Prueba de Componentes</h1>
      </main>
    </div>
  );
}
