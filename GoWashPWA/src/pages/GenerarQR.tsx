import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Car, User, Tag, Clock, UserCheck, MessageCircle, Printer, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function GenerarQR() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // High-fidelity fallback to match the screenshot if accessed directly
  const ticketData = location.state || {
    id: 'GW1548AB123CD',
    patente: 'AB123CD',
    marcaModelo: 'Toyota Corolla',
    color: 'Blanco',
    cliente: 'Juan Pérez',
    telefono: '11 2345 6789',
    servicio: 'Premium',
    precio: 6000,
    observaciones: 'No mojar interior. Cuidado con el espejo derecho.',
    formaPago: 'Efectivo',
    ingreso: '24/05/2024 - 10:30 hs',
    empleado: 'Martín López'
  };

  const formattedPrecio = typeof ticketData.precio === 'number' 
    ? ticketData.precio.toLocaleString('es-AR') 
    : ticketData.precio;

  const handleVolver = () => {
    navigate('/ingreso');
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto bg-slate-50 min-h-screen pb-12">
      {/* Top Navigation Arrow (for easy flow) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center sticky top-[53px] z-40">
        <button onClick={handleVolver} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <span className="text-sm font-bold text-slate-500 ml-2">Volver</span>
      </div>

      {/* ¡Vehículo Ingresado! Header Success Area */}
      <div className="bg-emerald-50 border-b border-emerald-100 py-6 px-4 flex flex-col items-center text-center">
        <div className="bg-emerald-500 text-white p-2.5 rounded-full shadow-md shadow-emerald-500/20 mb-3">
          <Check size={28} strokeWidth={3} />
        </div>
        <h2 className="text-lg font-bold text-emerald-700">¡Vehículo Ingresado!</h2>
        <p className="text-xs font-semibold text-emerald-600 mt-0.5">Código generado correctamente</p>
      </div>

      {/* Ticket Container */}
      <div className="p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 relative overflow-hidden">
          {/* Top Row: Ticket Number & Badge */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Vehículo #{ticketData.id.match(/\d+/) ? ticketData.id.match(/\d+/)[0] : '1548'}
              </h3>
            </div>
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm tracking-wider uppercase">
              EN LAVADO
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-3.5">
            {/* Patente */}
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Car size={18} />
              </div>
              <div className="grid grid-cols-[80px_1fr] flex-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Patente</span>
                <span className="text-slate-800 font-extrabold font-mono text-sm tracking-wider">{ticketData.patente}</span>
              </div>
            </div>

            {/* Cliente */}
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <User size={18} />
              </div>
              <div className="grid grid-cols-[80px_1fr] flex-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Cliente</span>
                <span className="text-slate-700 font-semibold">{ticketData.cliente}</span>
              </div>
            </div>

            {/* Servicio */}
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Tag size={18} />
              </div>
              <div className="grid grid-cols-[80px_1fr] flex-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Servicio</span>
                <span className="text-slate-700 font-extrabold">{ticketData.servicio} - ${formattedPrecio}</span>
              </div>
            </div>

            {/* Ingreso */}
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <Clock size={18} />
              </div>
              <div className="grid grid-cols-[80px_1fr] flex-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Ingreso</span>
                <span className="text-slate-700 font-semibold">{ticketData.ingreso}</span>
              </div>
            </div>

            {/* Empleado */}
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                <UserCheck size={18} />
              </div>
              <div className="grid grid-cols-[80px_1fr] flex-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Empleado</span>
                <span className="text-slate-700 font-semibold">{ticketData.empleado}</span>
              </div>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="relative my-6 border-t border-dashed border-slate-200">
            <div className="absolute -left-7 -top-2 w-4 h-4 bg-slate-50 border-r border-slate-200 rounded-full"></div>
            <div className="absolute -right-7 -top-2 w-4 h-4 bg-slate-50 border-l border-slate-200 rounded-full"></div>
          </div>

          {/* Scanner QR Area */}
          <div className="text-center space-y-4">
            <p className="text-xs font-bold text-slate-500">Escaneá este código para el retiro del vehículo</p>
            
            <div className="inline-block bg-white p-3.5 rounded-xl border border-slate-200 shadow-inner">
              <QRCode 
                value={ticketData.id} 
                size={160}
                level="M"
                className="w-[160px] h-[160px]"
              />
            </div>
            
            <p className="font-mono text-xs font-extrabold text-slate-400 tracking-widest uppercase">{ticketData.id}</p>
          </div>
        </div>

        {/* Buttons List */}
        <div className="mt-5 space-y-3">
          <a
            href={`https://wa.me/${ticketData.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(ticketData.cliente)},%20tu%20veh%C3%ADculo%20${encodeURIComponent(ticketData.patente)}%20ya%20ingres%C3%B3%20a%20GoWash.%20Tu%20ticket%20digital%20es%20${encodeURIComponent(ticketData.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white hover:bg-emerald-50 text-emerald-600 font-extrabold py-3.5 px-6 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <MessageCircle size={18} className="fill-emerald-50" /> ENVIAR POR WHATSAPP
          </a>
          
          <button 
            onClick={() => alert(`Imprimiendo ticket: ${ticketData.id}`)}
            className="w-full bg-white hover:bg-slate-100 text-slate-700 font-extrabold py-3.5 px-6 rounded-xl border-2 border-slate-200 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Printer size={18} /> IMPRIMIR TICKET
          </button>
        </div>
      </div>
    </div>
  );
}
