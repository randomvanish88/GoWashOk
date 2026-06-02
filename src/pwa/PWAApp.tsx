import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  QrCode, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  Smartphone, 
  Car, 
  Phone, 
  DollarSign, 
  FileCheck, 
  Camera, 
  LogOut, 
  Home, 
  MessageCircle, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  X,
  Send,
  Printer,
  Share2,
  CheckCircle2,
  History,
  BarChart3
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { googleSheetsSync } from '../lib/googleSheetsSync';
import { Venta } from '../components/POS';

interface PWAAppProps {
  prices: any[];
  sizes: string[];
  brands: string[];
  user: string | null;
  onLogout: () => void;
  onLogin: (username: string) => void;
}

// Default standard services matching mockup
const SERVICIOS_MOCKUP = [
  { nombre: 'Básico', precio: 4000, key: 'basico' },
  { nombre: 'Premium', precio: 6000, key: 'premium' },
  { nombre: 'Completo', precio: 8000, key: 'completo' },
  { nombre: 'Detailing', precio: 12000, key: 'detailing' },
];

export function PWAApp({ prices, sizes, brands, user, onLogout, onLogin }: PWAAppProps) {
  const [tab, setTab] = useState<'inicio' | 'vehiculos' | 'ingreso' | 'clientes' | 'reportes'>('inicio');
  const [ordenesAbiertas, setOrdenesAbiertas] = useState<Venta[]>([]);
  const [ventasCompletadas, setVentasCompletadas] = useState<Venta[]>([]);
  const [showQRConfirmation, setShowQRConfirmation] = useState<Venta | null>(null);
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Form State for new vehicle
  const [patente, setPatente] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  const [color, setColor] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(SERVICIOS_MOCKUP[1]); // Default to Premium
  const [observaciones, setObservaciones] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  
  // Checkout & QR scan state
  const [searchPatente, setSearchPatente] = useState('');
  const [selectedCheckoutVenta, setSelectedCheckoutVenta] = useState<Venta | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);

  // Load state and users
  useEffect(() => {
    // Load dynamic users
    const savedUsers = localStorage.getItem('gowash-users');
    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    } else {
      // Default users fallback
      setRegisteredUsers([
        { username: 'admin', role: 'admin', password: '123' },
        { username: 'empleado', role: 'empleado', password: '123' }
      ]);
    }

    // Load active orders in progress
    const loadData = () => {
      const savedOrders = localStorage.getItem('gowash-ordenes-abiertas');
      if (savedOrders) setOrdenesAbiertas(JSON.parse(savedOrders));

      const savedVentas = localStorage.getItem('gowash-ventas');
      if (savedVentas) setVentasCompletadas(JSON.parse(savedVentas));
    };

    loadData();

    // Listen to changes
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Format currency ARS
  const formatMoney = (amount: number) => {
    return `$${parseFloat(amount.toString()).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Perform mobile login
  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      toast.error('Campos requeridos', { description: 'Ingresa tu usuario y contraseña.' });
      return;
    }

    const matched = registeredUsers.find(
      u => u.username.toLowerCase() === loginUser.toLowerCase() && u.password === loginPass
    );

    if (matched) {
      if (matched.disabled) {
        toast.error('Acceso denegado', { description: 'Este usuario se encuentra inhabilitado.' });
        return;
      }
      onLogin(matched.username);
      toast.success('Bienvenido', { description: `Sesión iniciada como ${matched.username}.` });
    } else {
      toast.error('Error de login', { description: 'Credenciales inválidas.' });
    }
  };

  // Register vehicle and generate QR
  const handleRegistrarVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patente.trim()) {
      toast.warning('Datos faltantes', { description: 'Debes completar la patente.' });
      return;
    }

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateString = now.toISOString().split('T')[0];

    const nuevaOrden: any = {
      id: `GW-${Date.now()}`,
      fecha: dateString,
      hora: timeString,
      horaEntrada: timeString,
      horaSalida: '',
      empleado: user || 'Patio',
      patente: patente.toUpperCase(),
      cliente: clienteNombre || 'Particular',
      telefono: telefono || '',
      lavado: servicioSeleccionado.precio,
      bar: 0,
      cosmeticos: 0,
      total: servicioSeleccionado.precio,
      metodoPago: metodoPago,
      servicio: servicioSeleccionado.nombre,
      estado: 'Ingresado', // Default stepper node
      observaciones: observaciones,
      marca: marcaModelo || 'Genérico',
      modelo: '',
      tamano: 'Mediano',
      productosBar: [],
      productosCosmeticos: [],
      descuento: 0,
      recargo: 0
    };

    // Save locally
    const nuevasOrdenes = [...ordenesAbiertas, nuevaOrden];
    setOrdenesAbiertas(nuevasOrdenes);
    localStorage.setItem('gowash-ordenes-abiertas', JSON.stringify(nuevasOrdenes));
    window.dispatchEvent(new Event('storage'));

    // Trigger QR confirmation modal
    setShowQRConfirmation(nuevaOrden);

    // Reset Form
    setPatente('');
    setMarcaModelo('');
    setColor('');
    setClienteNombre('');
    setTelefono('');
    setObservaciones('');
    setMetodoPago('Efectivo');
  };

  // Stepper state update
  const handleUpdateEstado = (ordenId: string, nuevoEstado: 'Ingresado' | 'En Lavado' | 'Secado' | 'Listo') => {
    const ordenesActualizadas = ordenesAbiertas.map(o => {
      if (o.id === ordenId) {
        return { ...o, estado: nuevoEstado } as any;
      }
      return o;
    });
    setOrdenesAbiertas(ordenesActualizadas);
    localStorage.setItem('gowash-ordenes-abiertas', JSON.stringify(ordenesActualizadas));
    window.dispatchEvent(new Event('storage'));
    toast.success('Estado actualizado', { description: `El vehículo ahora está ${nuevoEstado}.` });
  };

  // Finalize delivery / checkout
  const handleEntregarVehiculo = (orden: Venta) => {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const ventaFinal: Venta = {
      ...orden,
      horaSalida: timeString,
      total: orden.total || orden.lavado
    };

    // Save in sales registry
    const nuevasVentas = [ventaFinal, ...ventasCompletadas];
    setVentasCompletadas(nuevasVentas);
    localStorage.setItem('gowash-ventas', JSON.stringify(nuevasVentas));

    // Remove from active orders
    const ordenesRestantes = ordenesAbiertas.filter(o => o.id !== orden.id);
    setOrdenesAbiertas(ordenesRestantes);
    localStorage.setItem('gowash-ordenes-abiertas', JSON.stringify(ordenesRestantes));
    
    window.dispatchEvent(new Event('storage'));

    // Synchronize to Google Sheets
    googleSheetsSync.syncVenta(ventaFinal);

    // Success notification
    toast.success('Vehículo entregado', { 
      description: `Patente ${orden.patente} retirada. ¡Venta registrada y sincronizada!`,
      duration: 4000
    });

    setSelectedCheckoutVenta(null);
    setTab('inicio');
  };

  // QR Camera scanner triggers
  const startCameraScan = async () => {
    setScannerActive(true);
    setSelectedCheckoutVenta(null);
    
    setTimeout(() => {
      const html5Qrcode = new Html5Qrcode("reader");
      qrReaderRef.current = html5Qrcode;
      
      html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Success callback
          toast.success("Código QR Escaneado");
          // Format could be: GW-17172026-AB123CD or similar
          const matchedOrder = ordenesAbiertas.find(o => o.id === decodedText || decodedText.includes(o.id));
          if (matchedOrder) {
            setSelectedCheckoutVenta(matchedOrder);
            stopCameraScan();
          } else {
            toast.error("Vehículo no encontrado", { description: "El código no pertenece a una orden abierta hoy." });
          }
        },
        (errorMessage) => {
          // Silent errors during scanning
        }
      ).catch(err => {
        console.error("Camera start error:", err);
        toast.error("Error de cámara", { description: "Asegúrate de otorgar permisos a la cámara." });
        setScannerActive(false);
      });
    }, 300);
  };

  const stopCameraScan = () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.stop().then(() => {
        setScannerActive(false);
        qrReaderRef.current = null;
      }).catch(err => {
        console.error("Camera stop error:", err);
        setScannerActive(false);
      });
    } else {
      setScannerActive(false);
    }
  };

  // WhatsApp ticket sender helper
  const sendWhatsAppTicket = (orden: Venta) => {
    const ticketUrl = `${window.location.origin}/ticket/${orden.id}`;
    const text = encodeURIComponent(
      `✨ *GOWASH Del Viso* ✨\n` +
      `¡Hola *${orden.cliente}*! Tu vehículo *${orden.marca}* (Patente: *${orden.patente}*) ha ingresado con éxito al lavadero.\n\n` +
      `📌 *Detalles del Servicio:*\n` +
      `• *Servicio:* ${orden.servicio || 'Lavado'}\n` +
      `• *Hora de Ingreso:* ${orden.horaEntrada} hs\n` +
      `• *Estado:* En Lavado 🚗💦\n` +
      `• *Total:* ${formatMoney(orden.lavado)}\n\n` +
      `🔗 *Tu Ticket Digital & Código de Retiro:* \n` +
      `Presenta este enlace al retirar tu auto:\n` +
      `${ticketUrl}\n\n` +
      `¡Muchas gracias por elegirnos!`
    );

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const api = isMobileDevice ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    
    const cleanPhone = orden.telefono ? orden.telefono.replace(/\s+/g, '').replace(/[+-]/g, '') : '';
    const phoneParam = cleanPhone ? `phone=${cleanPhone.length < 10 ? '549' + cleanPhone : cleanPhone}` : '';
    
    window.open(`${api}?${phoneParam}&text=${text}`, '_blank');
  };

  // Render Login view if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-between p-6 relative overflow-x-hidden select-none">
        {/* Glow Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="my-auto w-full max-w-sm mx-auto relative z-10 space-y-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-4 bg-slate-800/80 rounded-3xl border border-white/10 shadow-xl group">
              <Car className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-b from-white to-blue-400 bg-clip-text text-transparent mt-2">
              GOWASH PATIO
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Fase 2 - Aplicación Móvil</p>
          </div>

          <form onSubmit={handleMobileLogin} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Iniciar Sesión</h2>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nombre de Usuario</label>
              <input 
                type="text" 
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="ej: lavador1" 
                className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Contraseña</label>
              <input 
                type="password" 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••" 
                className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-widest mt-2 shadow-lg shadow-blue-600/10 active:scale-95 transition-all"
            >
              Ingresar al Patio
            </button>
          </form>
        </div>

        <footer className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest relative z-10 py-4 border-t border-white/5">
          © 2026 GoWash · Piloto Móvil PWA
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-between relative overflow-x-hidden select-none pb-20">
      {/* Top Header */}
      <header className="bg-slate-950/80 border-b border-white/5 backdrop-blur-xl px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-400" />
          <div className="flex flex-col -space-y-1">
            <h1 className="text-sm font-black tracking-tight text-white">GOWASH</h1>
            <span className="text-[7px] text-blue-500 font-bold uppercase tracking-widest">Patio Móvil</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{user}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Screen Content area */}
      <main className="flex-1 p-4 overflow-y-auto max-w-md mx-auto w-full">
        
        {/* Tab 1: Dashboard Principal (INICIO) */}
        {tab === 'inicio' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-blue-900/40 to-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-1">
                <p className="text-[10px] uppercase font-black text-blue-400 tracking-wider">Hola {user}, buen día</p>
                <h2 className="text-xl font-black text-white">Logística de Patio</h2>
                <p className="text-xs text-slate-400">Controla ingresos y egresos de autos con comodidad.</p>
              </div>
              <Sparkles className="w-16 h-16 text-blue-500/10 absolute right-4 bottom-2 pointer-events-none" />
            </div>

            {/* Quick stats counters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">En Lavado</p>
                  <p className="text-xl font-black text-white">{ordenesAbiertas.length}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hoy Listos</p>
                  <p className="text-xl font-black text-white">{ventasCompletadas.length}</p>
                </div>
              </div>
            </div>

            {/* Direct vehicle scan section */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Entregar / Retiro</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Lector QR</span>
              </div>

              {scannerActive ? (
                <div className="space-y-4">
                  <div id="reader" className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-inner"></div>
                  <button 
                    onClick={stopCameraScan}
                    className="w-full bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded-xl h-10 text-xs font-bold uppercase tracking-wider"
                  >
                    Detener Escaneo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={startCameraScan}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 transition-all duration-300 active:scale-95"
                  >
                    <Camera className="w-4 h-4" /> Escanear Código QR
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">o buscar por patente</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={searchPatente}
                      onChange={(e) => setSearchPatente(e.target.value.toUpperCase())}
                      placeholder="PATENTE (EJ: AB123CD)" 
                      className="flex-1 bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-xs uppercase text-white font-mono focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                    <button 
                      onClick={() => {
                        const matched = ordenesAbiertas.find(o => o.patente.toUpperCase() === searchPatente.trim().toUpperCase());
                        if (matched) {
                          setSelectedCheckoutVenta(matched);
                          setSearchPatente('');
                        } else {
                          toast.error('Vehículo no encontrado', { description: 'Revisa la patente ingresada.' });
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 border border-white/5 text-white font-bold text-xs uppercase tracking-wider px-4 rounded-xl active:scale-95 transition-all"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Display selected checkout card */}
            {selectedCheckoutVenta && (
              <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      En Lavado
                    </span>
                    <h4 className="text-base font-black text-white mt-1.5">Vehículo #{selectedCheckoutVenta.id.split('-')[1]?.substring(4) || '1548'}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total a Cobrar</p>
                    <p className="text-xl font-black text-emerald-400">{formatMoney(selectedCheckoutVenta.total || selectedCheckoutVenta.lavado)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Patente</p>
                    <p className="font-bold text-slate-200 font-mono text-sm uppercase">{selectedCheckoutVenta.patente}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Cliente</p>
                    <p className="font-bold text-slate-200">{selectedCheckoutVenta.cliente}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Servicio</p>
                    <p className="font-bold text-slate-200">{selectedCheckoutVenta.servicio}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Ingreso</p>
                    <p className="font-bold text-slate-200">{selectedCheckoutVenta.horaEntrada} hs</p>
                  </div>
                </div>

                {/* Progress Stepper node triggers */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-2">Estado de Lavado</p>
                  <div className="flex items-center justify-between gap-1 text-[9px] font-bold text-slate-400">
                    {(['Ingresado', 'En Lavado', 'Secado', 'Listo'] as const).map((est, idx) => {
                      const isActive = (selectedCheckoutVenta as any).estado === est || 
                        (est === 'Ingresado' && !(selectedCheckoutVenta as any).estado);
                      return (
                        <button
                          key={est}
                          onClick={() => handleUpdateEstado(selectedCheckoutVenta.id, est)}
                          className={`flex-1 py-1 px-1 text-center rounded border transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                              : 'bg-slate-950/60 border-white/5 hover:bg-slate-900'
                          }`}
                        >
                          {est}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setSelectedCheckoutVenta(null)}
                    className="flex-1 bg-slate-950 border border-white/10 hover:bg-slate-900 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl h-11 transition-all active:scale-95"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => handleEntregarVehiculo(selectedCheckoutVenta)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl h-11 shadow-lg shadow-emerald-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Marcar Entregado
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Lista de Vehículos Activos (VEHICULOS) */}
        {tab === 'vehiculos' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Patio de Lavado ({ordenesAbiertas.length})</h3>
              <button 
                onClick={() => setTab('ingreso')}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Ingreso
              </button>
            </div>

            {ordenesAbiertas.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-white/5 rounded-3xl p-10 text-center text-slate-500 space-y-2">
                <Car className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-xs font-medium">No hay vehículos en el patio en este momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordenesAbiertas.map((orden: any) => (
                  <div 
                    key={orden.id}
                    className="bg-slate-900/70 border border-white/5 rounded-2xl p-4 shadow-sm space-y-3 hover:border-blue-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-white/5">{orden.patente}</span>
                        <span className="text-[10px] text-slate-400 italic">👤 {orden.cliente}</span>
                      </div>
                      <span className="text-xs font-black text-blue-400">{formatMoney(orden.lavado)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>🚗 {orden.servicio}</span>
                      <span>⏱️ Ingreso: {orden.horaEntrada} hs</span>
                    </div>

                    {/* Dynamic state selector inside list card */}
                    <div className="flex items-center justify-between gap-1 text-[8px] font-bold text-slate-400">
                      {(['Ingresado', 'En Lavado', 'Secado', 'Listo'] as const).map((est) => {
                        const isActive = orden.estado === est || (est === 'Ingresado' && !orden.estado);
                        return (
                          <button
                            key={est}
                            onClick={() => handleUpdateEstado(orden.id, est)}
                            className={`flex-1 py-1 rounded text-center transition-all ${
                              isActive
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black'
                                : 'bg-slate-950/60 border border-white/5 hover:bg-slate-900'
                            }`}
                          >
                            {est}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button 
                        onClick={() => {
                          const cleanPhone = orden.telefono ? orden.telefono.replace(/\s+/g, '').replace(/[+-]/g, '') : '';
                          if (!cleanPhone) {
                            toast.error("Sin teléfono", { description: "Esta orden no tiene número de teléfono registrado." });
                            return;
                          }
                          sendWhatsAppTicket(orden);
                        }}
                        className="p-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors"
                        title="Enviar ticket WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCheckoutVenta(orden);
                          setTab('inicio');
                        }}
                        className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider px-3 py-1 rounded-lg shadow transition-all active:scale-95"
                      >
                        Retirar / Cobrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Formulario de Registro (INGRESO) */}
        {tab === 'ingreso' && (
          <form onSubmit={handleRegistrarVehiculo} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-2">1. Registrar Vehículo</h3>
            
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-md space-y-3">
              {/* License plate input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Patente *</label>
                <input 
                  type="text" 
                  required
                  value={patente}
                  onChange={(e) => setPatente(e.target.value.toUpperCase())}
                  placeholder="AB123CD" 
                  className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Marca / Modelo</label>
                  <input 
                    type="text" 
                    value={marcaModelo}
                    onChange={(e) => setMarcaModelo(e.target.value)}
                    placeholder="Toyota Corolla" 
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Color</label>
                  <input 
                    type="text" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Blanco" 
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">2. Datos del Cliente</h3>
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-md space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nombre del Cliente</label>
                <input 
                  type="text" 
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Juan Pérez" 
                  className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Teléfono (WhatsApp)</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="11 2345 6789" 
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl h-10 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">3. Selección del Servicio</h3>
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-4 shadow-md">
              <div className="grid grid-cols-2 gap-2">
                {SERVICIOS_MOCKUP.map((srv) => {
                  const isSel = servicioSeleccionado.key === srv.key;
                  return (
                    <button
                      key={srv.key}
                      type="button"
                      onClick={() => setServicioSeleccionado(srv)}
                      className={`p-3 rounded-2xl text-center border transition-all ${
                        isSel 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                          : 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider">{srv.nombre}</p>
                      <p className="text-sm font-black mt-1">{formatMoney(srv.precio)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">4. Observaciones</h3>
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-4 shadow-md">
              <textarea 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="No mojar el motor. Detallar cubiertas..." 
                className="w-full bg-slate-950/80 border border-white/5 rounded-2xl h-16 p-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
              />
            </div>

            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">5. Forma de Pago</h3>
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-3 shadow-md flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
              {['Efectivo', 'Tarjeta', 'Transferencia', 'Cuenta'].map((met) => {
                const isSel = metodoPago === met;
                return (
                  <button
                    key={met}
                    type="button"
                    onClick={() => setMetodoPago(met)}
                    className={`flex-1 py-2 rounded-xl text-center border transition-all ${
                      isSel 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                        : 'bg-slate-950/60 border-white/5 hover:bg-slate-900'
                    }`}
                  >
                    {met}
                  </button>
                );
              })}
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl h-12 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15 transition-all duration-300 active:scale-95"
            >
              <QrCode className="w-4 h-4" /> Generar QR e Ingresar
            </button>
          </form>
        )}

        {/* Tab 4: Base de Clientes (CLIENTES) */}
        {tab === 'clientes' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Base de Clientes</h3>
            
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 shadow-sm space-y-4">
              <p className="text-xs text-slate-400">Filtra y revisa los clientes del lavadero.</p>
              
              {/* Extract unique customers list */}
              {(() => {
                const uniqueClients: Record<string, Venta[]> = {};
                ordenesAbiertas.concat(ventasCompletadas).forEach(v => {
                  if (v.cliente && v.cliente !== 'Particular') {
                    if (!uniqueClients[v.cliente]) uniqueClients[v.cliente] = [];
                    uniqueClients[v.cliente].push(v);
                  }
                });

                const clientsList = Object.keys(uniqueClients);

                if (clientsList.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-600 text-xs">
                      No hay clientes registrados en el historial de hoy.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {clientsList.map(c => {
                      const clientSales = uniqueClients[c];
                      const totalSpent = clientSales.reduce((s, v) => s + (v.total || v.lavado), 0);
                      const latestSale = clientSales[0];
                      return (
                        <div key={c} className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-white">{c}</p>
                            {latestSale?.telefono && <p className="text-[10px] text-slate-500 font-mono mt-0.5">📞 {latestSale.telefono}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Gastado Hoy</p>
                            <p className="font-bold text-blue-400">{formatMoney(totalSpent)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 5: Reportes Diarios Móviles (REPORTES) */}
        {tab === 'reportes' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Reporte de Patio Móvil</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Vehículos Lavados</p>
                <p className="text-2xl font-black text-white">{ventasCompletadas.length}</p>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Facturado Patio</p>
                <p className="text-2xl font-black text-emerald-400">
                  {formatMoney(ventasCompletadas.reduce((s, v) => s + (v.total || v.lavado), 0))}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 shadow-md space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Últimos cobros del día</h4>
              
              {ventasCompletadas.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No hay cobros registrados en la fecha.</p>
              ) : (
                <div className="space-y-2">
                  {ventasCompletadas.slice(0, 5).map(v => (
                    <div key={v.id} className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white font-mono uppercase">{v.patente}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">⏱️ Salida: {v.horaSalida} hs · {v.servicio}</p>
                      </div>
                      <div className="font-bold text-slate-200">
                        {formatMoney(v.total || v.lavado)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* QR Confirmation Modal view */}
      {showQRConfirmation && (
        <div className="fixed inset-0 z-50 bg-[#070b15]/95 backdrop-blur-md flex flex-col justify-between p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="my-auto w-full max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">¡Vehículo Ingresado!</h2>
              <p className="text-xs text-slate-400">Ficha y código de retiro generado correctamente.</p>
            </div>

            {/* Ingress info card */}
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-2xl space-y-3.5 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Ficha del Vehículo</span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">En Lavado</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patente:</span>
                  <span className="font-bold text-slate-200 font-mono uppercase">{showQRConfirmation.patente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-bold text-slate-200">{showQRConfirmation.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Servicio:</span>
                  <span className="font-bold text-slate-200">{showQRConfirmation.servicio} · {formatMoney(showQRConfirmation.lavado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingreso:</span>
                  <span className="font-bold text-slate-200">{showQRConfirmation.horaEntrada} hs</span>
                </div>
              </div>

              {/* QR display block */}
              <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-inner border border-white/10 mt-3">
                <QRCode 
                  value={showQRConfirmation.id} 
                  size={140}
                  className="mx-auto"
                />
              </div>
              <p className="text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1.5">{showQRConfirmation.id}</p>
            </div>

            {/* Actions for ticket */}
            <div className="space-y-2">
              <button 
                onClick={() => sendWhatsAppTicket(showQRConfirmation)}
                className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl h-12 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-green-600/15 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
              </button>

              <button 
                onClick={() => {
                  toast.success("Impresión iniciada", { description: "Simulando ticket de patio en impresora central." });
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-2xl h-11 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                Imprimir Ticket Digital
              </button>

              <button 
                onClick={() => {
                  setShowQRConfirmation(null);
                  setTab('vehiculos');
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-12 text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Listo, Volver al Patio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mobile Tab Bar Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/5 backdrop-blur-xl px-4 py-2 flex justify-between items-center shadow-xl max-w-md mx-auto rounded-t-3xl">
        <button 
          onClick={() => { setTab('inicio'); stopCameraScan(); }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${tab === 'inicio' ? 'text-blue-400 scale-105' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <Home className="w-4.5 h-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Inicio</span>
        </button>

        <button 
          onClick={() => { setTab('vehiculos'); stopCameraScan(); }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${tab === 'vehiculos' ? 'text-blue-400 scale-105' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <Car className="w-4.5 h-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Vehículos</span>
        </button>

        {/* Custom round Action button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button 
            onClick={() => { setTab('ingreso'); stopCameraScan(); }}
            className={`w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-300 border-4 border-[#0a0f1d] ${tab === 'ingreso' ? 'rotate-45' : ''}`}
            title="Nuevo Registro"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={() => { setTab('clientes'); stopCameraScan(); }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${tab === 'clientes' ? 'text-blue-400 scale-105' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <Users className="w-4.5 h-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Clientes</span>
        </button>

        <button 
          onClick={() => { setTab('reportes'); stopCameraScan(); }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${tab === 'reportes' ? 'text-blue-400 scale-105' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <TrendingUp className="w-4.5 h-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Reportes</span>
        </button>
      </nav>
    </div>
  );
}
