import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, QrCode, Loader2 } from 'lucide-react';
import { leerServicios, leerEmpleados, registrarIngreso } from '../hooks/useGoogleSheets';

const PAGOS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cuenta'];
const COLORES = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Otro'];
const MODELOS = ['Toyota Corolla','Toyota Hilux','Ford Ranger','Volkswagen Gol','Fiat Cronos','Chevrolet Onix','Peugeot 208','Renault Sandero','Honda Civic','Otro'];

const SERVICIOS_DEFAULT = [
  { nombre: 'Lavado Básico', precio: 15000 },
  { nombre: 'Lavado Premium', precio: 25000 },
  { nombre: 'Lavado Completo', precio: 45000 },
  { nombre: 'Detailing', precio: 80000 },
];

export default function Ingreso() {
  const navigate = useNavigate();

  const [patente, setPatente] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('Toyota Corolla');
  const [color, setColor] = useState('Blanco');
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [formaPago, setFormaPago] = useState('Efectivo');
  const [empleado, setEmpleado] = useState('');

  const [servicios, setServicios] = useState(SERVICIOS_DEFAULT);
  const [empleados, setEmpleados] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Cargar servicios y empleados desde Google Sheets al iniciar
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const [svcs, emps] = await Promise.all([leerServicios(), leerEmpleados()]);
        if (svcs.length > 0) setServicios(svcs);
        if (emps.length > 0) setEmpleados(emps);
      } catch (e) {
        console.warn('No se pudo conectar a Google Sheets, usando datos locales');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handlePatenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 7) val = val.slice(0, 7);
    setPatente(val);
  };

  const handleIngresar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patente.trim()) { setError('Ingresá la patente'); return; }
    if (!servicioSeleccionado) { setError('Seleccioná un servicio'); return; }

    setGuardando(true);
    setError('');

    const cleanPatente = patente.trim().toUpperCase();
    const ticketId = `GW${Math.floor(1000 + Math.random() * 9000)}${cleanPatente}`;
    const selectedSrv = servicios.find(s => s.nombre === servicioSeleccionado) || servicios[0];
    const ahora = new Date();
    const ingresoStr = ahora.toLocaleDateString('es-AR') + ' - ' + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs';

    const datos = {
      id: ticketId,
      patente: cleanPatente,
      marcaModelo,
      color,
      cliente,
      telefono,
      servicio: selectedSrv.nombre,
      precio: selectedSrv.precio,
      observaciones,
      formaPago,
      empleado: empleado || 'Sin asignar',
      ingreso: ingresoStr,
    };

    try {
      // Guardar en Google Sheets
      await registrarIngreso(datos);
    } catch (e) {
      console.warn('No se pudo guardar en Sheets, continuando igual');
    }

    setGuardando(false);
    navigate('/generar-qr', { state: datos });
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto bg-slate-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-[53px] z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-[var(--color-primary)]" size={20} />
          <h2 className="text-base font-bold text-[var(--color-secondary)]">Ingreso de Vehículo</h2>
        </div>
        {cargando && <Loader2 size={16} className="animate-spin text-slate-400" />}
      </div>

      <form onSubmit={handleIngresar} className="p-4 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* 1. Datos del Vehículo */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Datos del Vehículo
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patente *</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-mono text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] uppercase"
              placeholder="AB123CD"
              value={patente}
              onChange={handlePatenteChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marca / Modelo</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-semibold"
                value={marcaModelo}
                onChange={e => setMarcaModelo(e.target.value)}
              >
                {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Color</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-semibold"
                value={color}
                onChange={e => setColor(e.target.value)}
              >
                {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Cliente */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Cliente
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-semibold"
              placeholder="Nombre del cliente (opcional)"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
            <input
              type="tel"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-semibold"
              placeholder="11 2345 6789"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Empleado */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Empleado
          </h3>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-semibold"
            value={empleado}
            onChange={e => setEmpleado(e.target.value)}
          >
            <option value="">Seleccionar empleado...</option>
            {empleados.map(emp => <option key={emp} value={emp}>{emp}</option>)}
            {empleados.length === 0 && (
              <>
                <option value="Recepción">Recepción</option>
                <option value="Lavador 1">Lavador 1</option>
                <option value="Lavador 2">Lavador 2</option>
              </>
            )}
          </select>
        </div>

        {/* 4. Servicio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            4. Servicio *
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {servicios.map(srv => (
              <button
                key={srv.nombre}
                type="button"
                onClick={() => setServicioSeleccionado(srv.nombre)}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${
                  servicioSeleccionado === srv.nombre
                    ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)] font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 font-semibold'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wide text-center leading-tight">{srv.nombre}</span>
                <span className="text-xs mt-1 font-bold">${srv.precio.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Observaciones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
            5. Observaciones
          </h3>
          <textarea
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-semibold"
            placeholder="Observaciones o requerimientos especiales..."
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
          />
        </div>

        {/* 6. Forma de Pago */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
            6. Forma de Pago
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {PAGOS.map(pago => (
              <button
                key={pago}
                type="button"
                onClick={() => setFormaPago(pago)}
                className={`py-2 px-1 rounded-lg border text-center text-xs transition-all duration-200 ${
                  formaPago === pago
                    ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)] font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 font-semibold'
                }`}
              >
                {pago}
              </button>
            ))}
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
        >
          {guardando
            ? <><Loader2 size={20} className="animate-spin" /> GUARDANDO...</>
            : <><QrCode size={20} /> GENERAR QR E INGRESAR</>
          }
        </button>
      </form>
    </div>
  );
}
