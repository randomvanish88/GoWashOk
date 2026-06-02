import { Search, Plus } from 'lucide-react';

export default function Clientes() {
  const clientes = [
    { id: '1', nombre: 'Juan Pérez', telefono: '11 2345 6789', visitas: 12, ultimoLavado: '24/05/2024' },
    { id: '2', nombre: 'María López', telefono: '11 9876 5432', visitas: 5, ultimoLavado: '18/05/2024' },
    { id: '3', nombre: 'Carlos Ruiz', telefono: '11 4455 6677', visitas: 8, ultimoLavado: '20/05/2024' },
    { id: '4', nombre: 'Ana Soto', telefono: '11 2233 4455', visitas: 15, ultimoLavado: '28/05/2024' },
  ];

  return (
    <div className="p-4 animate-fade-in max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-secondary)]">Clientes</h1>
        <button className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-md">
          <Plus size={20} />
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input 
          type="text" 
          className="input-premium pl-10" 
          placeholder="Buscar por nombre o teléfono..." 
        />
      </div>

      <div className="space-y-4">
        {clientes.map(c => (
          <div key={c.id} className="glass-panel p-4 rounded-xl flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800">{c.nombre}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{c.telefono}</p>
              <p className="text-[10px] text-slate-400 mt-2">Último: {c.ultimoLavado}</p>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-[var(--color-primary)] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-100">
                {c.visitas} visitas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
