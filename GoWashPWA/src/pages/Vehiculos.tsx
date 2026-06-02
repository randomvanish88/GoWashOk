import { useState } from 'react';
import { Clock, CheckCircle2, Search, RefreshCw, Car } from 'lucide-react';

interface Vehiculo {
  id: string;
  patente: string;
  cliente: string;
  servicio: string;
  estado: 'Ingresado' | 'En Lavado' | 'Secado' | 'Listo';
  tiempo: string;
}

export default function Vehiculos() {
  const [filter, setFilter] = useState<'Todos' | 'Ingresado' | 'En Lavado' | 'Secado' | 'Listo'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    { id: '1', patente: 'AA123BB', cliente: 'Juan Pérez', servicio: 'Premium', estado: 'En Lavado', tiempo: '15 min' },
    { id: '2', patente: 'AB456CD', cliente: 'María López', servicio: 'Básico', estado: 'Ingresado', tiempo: '5 min' },
    { id: '3', patente: 'AC789EF', cliente: 'Carlos Ruiz', servicio: 'Completo', estado: 'Secado', tiempo: '30 min' },
    { id: '4', patente: 'AD012GH', cliente: 'Ana Soto', servicio: 'Detailing', estado: 'Listo', tiempo: '45 min' },
  ]);

  const cycleEstado = (id: string) => {
    setVehiculos(prev => prev.map(v => {
      if (v.id !== id) return v;
      let nuevoEstado: 'Ingresado' | 'En Lavado' | 'Secado' | 'Listo' = 'Ingresado';
      if (v.estado === 'Ingresado') nuevoEstado = 'En Lavado';
      else if (v.estado === 'En Lavado') nuevoEstado = 'Secado';
      else if (v.estado === 'Secado') nuevoEstado = 'Listo';
      else if (v.estado === 'Listo') nuevoEstado = 'Ingresado';
      
      return { ...v, estado: nuevoEstado };
    }));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Ingresado': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'En Lavado': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Secado': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Listo': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter and search
  const filteredVehiculos = vehiculos.filter(v => {
    const matchesFilter = filter === 'Todos' || v.estado === filter;
    const matchesSearch = v.patente.toUpperCase().includes(searchQuery.toUpperCase()) || 
                          v.cliente.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-fade-in max-w-md mx-auto bg-slate-50 min-h-screen pb-12">
      {/* Subheader Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-[53px] z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <Car className="text-[var(--color-primary)]" size={20} />
          <h2 className="text-base font-bold text-[var(--color-secondary)]">Patio de Lavado</h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-full">
            {vehiculos.length} Total
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input 
            type="text" 
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] transition-all font-semibold"
            placeholder="Buscar por patente o cliente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Badges Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4">
          {(['Todos', 'Ingresado', 'En Lavado', 'Secado', 'Listo'] as const).map(tipo => {
            const count = tipo === 'Todos' 
              ? vehiculos.length 
              : vehiculos.filter(v => v.estado === tipo).length;
            
            const isSelected = filter === tipo;
            
            return (
              <button
                key={tipo}
                onClick={() => setFilter(tipo)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-300 whitespace-nowrap shadow-sm active:scale-95 ${
                  isSelected 
                    ? 'bg-slate-800 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {tipo} ({count})
              </button>
            );
          })}
        </div>

        {/* Info Banner on how to cycle */}
        <div className="bg-slate-100 border border-slate-200/50 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
          <RefreshCw size={12} className="text-slate-400 flex-shrink-0 animate-spin-slow" />
          <span>Toca el estado de un auto para avanzar su progreso de lavado.</span>
        </div>

        {/* Vehicles list */}
        <div className="space-y-3.5">
          {filteredVehiculos.length > 0 ? (
            filteredVehiculos.map(v => (
              <div 
                key={v.id} 
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-md animate-slide-up"
              >
                {/* Visual border stripe indicating state */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  v.estado === 'Listo' ? 'bg-emerald-500' :
                  v.estado === 'Secado' ? 'bg-amber-500' :
                  v.estado === 'En Lavado' ? 'bg-blue-500' : 'bg-slate-300'
                }`}></div>

                {/* Card Top */}
                <div className="flex justify-between items-start mb-2.5">
                  <h3 className="font-mono text-lg font-extrabold tracking-widest text-slate-800 pl-1">{v.patente}</h3>
                  
                  {/* Tap to cycle button badge */}
                  <button 
                    onClick={() => cycleEstado(v.id)}
                    title="Haga click para avanzar el estado"
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${getEstadoColor(v.estado)}`}
                  >
                    <span>{v.estado}</span>
                    <RefreshCw size={10} className="opacity-60" />
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs mt-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cliente</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{v.cliente}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Servicio</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{v.servicio}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-300" />
                    <span>Hace {v.tiempo}</span>
                  </div>
                  {v.estado === 'Listo' && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={12} className="fill-emerald-50" />
                      <span>Esperando retiro</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6 text-slate-400">
              <Car className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="font-bold text-sm text-slate-500">No hay vehículos en esta sección</p>
              <p className="text-xs text-slate-400 mt-1">Busque otro término o cambie de filtro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
