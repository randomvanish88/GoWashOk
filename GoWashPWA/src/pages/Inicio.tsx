import { useNavigate } from 'react-router-dom';
import { Car, ScanLine, PlusCircle, Clock } from 'lucide-react';

export default function Inicio() {
  const navigate = useNavigate();

  const kpis = [
    { label: 'En Lavado', val: 4, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Secado', val: 2, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Listos', val: 1, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Total Hoy', val: 8, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  ];

  const recentActivity = [
    { patente: 'AB 123 CD', servicio: 'Premium', hora: '10:30 hs', estado: 'En Lavado' },
    { patente: 'AA 123 BB', servicio: 'Básico', hora: '09:15 hs', estado: 'Listo' },
    { patente: 'AC 789 EF', servicio: 'Completo', hora: '08:30 hs', estado: 'Secado' },
  ];

  return (
    <div className="p-4 animate-fade-in max-w-md mx-auto bg-slate-50 min-h-screen pb-12">
      {/* Operator Greeting Card */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-5 text-white shadow-md relative overflow-hidden mb-5">
        <div className="absolute -right-6 -bottom-6 text-white/10">
          <Car size={120} />
        </div>
        
        <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200">Operario Activo</p>
        <h2 className="text-xl font-extrabold mt-1">Hola, Martín López</h2>
        <p className="text-xs text-blue-100 mt-1">Patio de Lavado • Sincronizado</p>
      </div>

      {/* KPI Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-b border-slate-100 pb-2">
          Estado del Patio
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi, idx) => (
            <div key={idx} className={`border rounded-xl p-3 text-center ${kpi.color}`}>
              <p className="text-2xl font-black">{kpi.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="space-y-3 mb-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Ingreso Card */}
          <button 
            onClick={() => navigate('/ingreso')}
            className="bg-white border border-slate-200 hover:border-[var(--color-primary)] p-4 rounded-xl shadow-sm text-left transition-all active:scale-[0.97] group flex flex-col justify-between aspect-square"
          >
            <div className="bg-blue-50 text-[var(--color-primary)] p-3 rounded-xl w-fit group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
              <PlusCircle size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Nuevo Ingreso</h4>
              <p className="text-[10px] text-slate-400 mt-1">Registrar auto al patio</p>
            </div>
          </button>

          {/* Retiro Card */}
          <button 
            onClick={() => navigate('/retiro')}
            className="bg-white border border-slate-200 hover:border-emerald-500 p-4 rounded-xl shadow-sm text-left transition-all active:scale-[0.97] group flex flex-col justify-between aspect-square"
          >
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ScanLine size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Escanear / Salida</h4>
              <p className="text-[10px] text-slate-400 mt-1">Registrar cobro y retiro</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
          Actividad Reciente
        </h3>
        
        <div className="space-y-3.5 mt-2">
          {recentActivity.map((act, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-mono font-bold text-slate-700 tracking-wider">
                  {act.patente}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{act.servicio}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {act.hora}
                  </p>
                </div>
              </div>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                act.estado === 'Listo' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : act.estado === 'Secado'
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                {act.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
