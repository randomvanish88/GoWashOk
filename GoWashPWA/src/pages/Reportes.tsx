import { TrendingUp, Calendar, DollarSign, Award } from 'lucide-react';

export default function Reportes() {
  return (
    <div className="p-4 animate-fade-in max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-secondary)]">Reportes</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
          <Calendar size={14} /> Hoy
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-xl">
          <div className="bg-blue-50 text-[var(--color-primary)] p-2 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
            <DollarSign size={18} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recaudación</p>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">$38.000</p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="bg-emerald-50 text-emerald-600 p-2 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp size={18} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Servicios</p>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">8 autos</p>
        </div>
      </div>

      {/* Breakdown Card */}
      <div className="glass-panel p-5 rounded-2xl mb-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Servicios por Tipo</h2>
        <div className="space-y-3">
          {[
            { tipo: 'Premium', cant: 4, recaudado: '$24.000', pct: '50%' },
            { tipo: 'Básico', cant: 2, recaudado: '$10.000', pct: '25%' },
            { tipo: 'Completo', cant: 1, recaudado: '$8.000', pct: '12.5%' },
            { tipo: 'Detailing', cant: 1, recaudado: '$25.000', pct: '12.5%' }
          ].map((srv, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{srv.tipo} ({srv.cant})</span>
                <span className="font-bold text-slate-800">{srv.recaudado}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[var(--color-primary)] h-full rounded-full" 
                  style={{ width: srv.pct }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best employee */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
        <div className="bg-amber-50 text-amber-500 p-2.5 rounded-lg">
          <Award size={20} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lavador del Día</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">Martín López (5 Lavados)</p>
        </div>
      </div>
    </div>
  );
}
