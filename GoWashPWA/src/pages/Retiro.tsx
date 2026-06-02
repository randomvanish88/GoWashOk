import { useState, useEffect } from 'react';
import { ScanLine, QrCode, Search, Check, Car, User, Tag, Clock, Camera, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { leerVehiculosEnLavadero, marcarEntregado } from '../hooks/useGoogleSheets';

interface Vehiculo {
  id: string; patente: string; cliente: string; servicio: string;
  precio: number; ingreso: string; estado: string; empleado: string;
  marcaModelo?: string; color?: string;
}

export default function Retiro() {
  const [modo, setModo] = useState<'qr' | 'patente'>('qr');
  const [patenteInput, setPatenteInput] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [vehiculosEnLavadero, setVehiculosEnLavadero] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [entregando, setEntregando] = useState(false);

  // Cargar vehículos en lavadero desde Google Sheets
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const rows = await leerVehiculosEnLavadero();
        const vehiculos = rows.map((r: any) => ({
          id: r['ID'] || r['id'] || '',
          patente: r['Patente'] || r['patente'] || '',
          cliente: r['Cliente'] || r['cliente'] || '',
          servicio: r['Servicio'] || r['servicio'] || '',
          precio: parseFloat(r['Precio'] || r['precio'] || '0'),
          ingreso: r['Fecha_Ingreso'] ? `${r['Fecha_Ingreso']} - ${r['Hora_Ingreso']}` : '',
          estado: r['Estado'] || 'En Lavado',
          empleado: r['Empleado'] || r['empleado'] || '',
          marcaModelo: r['Marca_Modelo'] || '',
          color: r['Color'] || '',
        }));
        setVehiculosEnLavadero(vehiculos);
      } catch (e) {
        console.warn('No se pudo cargar desde Sheets');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const startCamera = () => {
    setCameraActive(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true }, false);
        scanner.render(
          (decodedText) => { scanner.clear(); setCameraActive(false); processScannedCode(decodedText); },
          () => {}
        );
      } catch (err) { console.error("Camera init error:", err); }
    }, 300);
  };

  const processScannedCode = (code: string) => {
    const cleanCode = code.toUpperCase();
    const found = vehiculosEnLavadero.find(v => cleanCode.includes(v.id) || cleanCode.includes(v.patente));
    if (found) setVehiculoSeleccionado(found);
    else alert('Vehículo no encontrado en el lavadero');
  };

  const handleBuscarPatente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patenteInput.trim()) return;
    const busqueda = patenteInput.toUpperCase().replace(/\s+/g, '');
    const found = vehiculosEnLavadero.find(v => v.patente.replace(/\s+/g, '') === busqueda);
    if (found) setVehiculoSeleccionado(found);
    else alert(`No se encontró el vehículo con patente ${busqueda}`);
  };

  const handleEntregar = async () => {
    if (!vehiculoSeleccionado) return;
    setEntregando(true);
    try {
      await marcarEntregado(vehiculoSeleccionado.id);
      setVehiculosEnLavadero(prev => prev.filter(v => v.id !== vehiculoSeleccionado.id));
      alert(`✅ Vehículo ${vehiculoSeleccionado.patente} entregado. Total: $${vehiculoSeleccionado.precio?.toLocaleString('es-AR')}`);
      setVehiculoSeleccionado(null);
      setPatenteInput('');
    } catch (e) {
      alert('Error al marcar como entregado');
    } finally {
      setEntregando(false);
    }
  };

  const getEstadoStepIndex = (estado: string) => {
    switch (estado) {
      case 'Ingresado': return 0;
      case 'En Lavado': return 1;
      case 'Secado': return 2;
      case 'Listo': return 3;
      default: return 1;
    }
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto bg-slate-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-[53px] z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <ScanLine className="text-[var(--color-primary)]" size={20} />
          <h2 className="text-base font-bold text-[var(--color-secondary)]">Retiro de Vehículo</h2>
        </div>
        {cargando
          ? <Loader2 size={16} className="animate-spin text-slate-400" />
          : <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{vehiculosEnLavadero.length} en lavadero</span>
        }
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2.5 mx-4 mt-4 shadow-sm">
        <QrCode size={18} className="text-[var(--color-primary)] flex-shrink-0" />
        <p className="text-xs text-blue-700 font-semibold">Escaneá el código QR o ingresá la patente</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-4 mx-4">
        {(['qr', 'patente'] as const).map(tab => (
          <button key={tab} onClick={() => { setModo(tab); setVehiculoSeleccionado(null); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center ${modo === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-slate-400'}`}>
            {tab === 'qr' ? 'ESCANEAR QR' : 'INGRESAR PATENTE'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {!vehiculoSeleccionado ? (
          <>
            {modo === 'qr' ? (
              <div className="space-y-4">
                {/* Cámara */}
                <div className="relative aspect-square max-w-[320px] mx-auto w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col items-center justify-center p-4">
                  {cameraActive ? (
                    <div id="reader" className="w-full h-full overflow-hidden rounded-xl"></div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-md"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-md"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-md"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-md"></div>
                      <div className="bg-slate-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-slate-400">
                        <Camera size={32} />
                      </div>
                      <h4 className="text-sm font-bold text-white">Lector de Códigos QR</h4>
                      <button onClick={startCamera} className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95">
                        ENCENDER CÁMARA
                      </button>
                    </div>
                  )}
                </div>

                {/* Vehículos en lavadero */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Vehículos en lavadero ({vehiculosEnLavadero.length})
                  </h4>
                  {vehiculosEnLavadero.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">No hay vehículos en lavadero</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {vehiculosEnLavadero.slice(0, 6).map(v => (
                        <button key={v.id} onClick={() => setVehiculoSeleccionado(v)}
                          className="text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 p-2.5 rounded-lg text-xs transition-all">
                          <p className="font-bold text-slate-700">{v.patente}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{v.servicio} · {v.estado}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <form onSubmit={handleBuscarPatente} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Buscar por Patente</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 font-mono text-base font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                        placeholder="AB123CD" value={patenteInput}
                        onChange={e => setPatenteInput(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2">
                    <Search size={18} /> BUSCAR VEHÍCULO
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-5 animate-slide-up">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-extrabold text-slate-800 text-base">Vehículo #{vehiculoSeleccionado.id.slice(-4)}</h3>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                  vehiculoSeleccionado.estado === 'Listo' ? 'bg-emerald-500 text-white' :
                  vehiculoSeleccionado.estado === 'Secado' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                }`}>{vehiculoSeleccionado.estado}</span>
              </div>

              {/* Detalles */}
              <div className="space-y-3">
                {[
                  { icon: <Car size={16} />, label: 'Patente', value: vehiculoSeleccionado.patente },
                  { icon: <User size={16} />, label: 'Cliente', value: vehiculoSeleccionado.cliente || '—' },
                  { icon: <Tag size={16} />, label: 'Servicio', value: `${vehiculoSeleccionado.servicio} - $${vehiculoSeleccionado.precio?.toLocaleString('es-AR')}` },
                  { icon: <Clock size={16} />, label: 'Ingreso', value: vehiculoSeleccionado.ingreso },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="text-slate-400">{icon}</div>
                    <div className="grid grid-cols-[80px_1fr] flex-1 text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                      <span className="text-slate-700 font-semibold">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stepper */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-4">Estado del lavado</p>
                <div className="flex items-center justify-between relative px-2 mb-2">
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-4 h-0.5 bg-emerald-500 -z-10 -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${(getEstadoStepIndex(vehiculoSeleccionado.estado) / 3) * 88}%` }}></div>
                  {['Ingresado', 'En lavado', 'Secado', 'Listo'].map((step, idx) => {
                    const isActive = idx <= getEstadoStepIndex(vehiculoSeleccionado.estado);
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>
                          {isActive ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  {['Ingresado', 'En lavado', 'Secado', 'Listo'].map((s, i) => (
                    <span key={s} className={i <= getEstadoStepIndex(vehiculoSeleccionado.estado) ? 'text-emerald-600' : ''}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center mt-6">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total a cobrar</span>
                <span className="text-xl font-black text-emerald-600">${vehiculoSeleccionado.precio?.toLocaleString('es-AR')}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-[110px_1fr] gap-3">
              <button onClick={() => setVehiculoSeleccionado(null)}
                className="w-full bg-white hover:bg-rose-50 text-rose-600 font-bold py-3.5 px-2 rounded-xl border border-rose-200 text-xs text-center">
                CANCELAR
              </button>
              <button onClick={handleEntregar} disabled={entregando}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs">
                {entregando
                  ? <><Loader2 size={14} className="animate-spin" /> PROCESANDO...</>
                  : <><Check size={16} strokeWidth={3} /> MARCAR COMO ENTREGADO</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
