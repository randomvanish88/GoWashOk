import { Outlet, NavLink } from 'react-router-dom';
import { Menu, Bell, Home, Car, Plus, Users, BarChart3 } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] pb-20">
      {/* Header Premium (Mockup Style) */}
      <header className="bg-[#0f172a] text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Hamburguesa */}
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          
          {/* Logo y Nombre del Sistema */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5">
              <Car className="text-[var(--color-primary)] fill-[var(--color-primary)]/20" size={18} />
              <span className="font-extrabold text-lg tracking-wider">GoWash</span>
            </div>
            <span className="text-[9px] font-medium tracking-widest uppercase text-slate-400 -mt-0.5">Sistema de Lavadero</span>
          </div>
          
          {/* Notificaciones */}
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors relative">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation (5 Tabs with Floating Plus Button) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2 relative">
          {/* Inicio */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive ? 'text-[var(--color-primary)] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Home size={22} />
            <span className="text-[10px] mt-1">Inicio</span>
          </NavLink>
          
          {/* Vehículos (Patio) */}
          <NavLink
            to="/vehiculos"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive ? 'text-[var(--color-primary)] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Car size={22} />
            <span className="text-[10px] mt-1">Vehículos</span>
          </NavLink>

          {/* Floating Central Plus Button */}
          <div className="relative flex justify-center items-center w-16 h-full -mt-6">
            <NavLink
              to="/ingreso"
              className={({ isActive }) =>
                `w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${
                  isActive 
                    ? 'bg-[var(--color-primary-dark)] text-white ring-4 ring-[var(--color-primary)]/20' 
                    : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                }`
              }
            >
              <Plus size={28} strokeWidth={3} />
            </NavLink>
          </div>

          {/* Clientes */}
          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive ? 'text-[var(--color-primary)] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Users size={22} />
            <span className="text-[10px] mt-1">Clientes</span>
          </NavLink>

          {/* Reportes */}
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive ? 'text-[var(--color-primary)] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <BarChart3 size={22} />
            <span className="text-[10px] mt-1">Reportes</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
