import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Camera, Check, X, Send, QrCode, Phone, User, 
  Clock, DollarSign, LogOut, Plus, ChevronRight, Home,
  List, FileText, BarChart3, Sparkles, CheckCircle2,
  AlertCircle, MessageCircle, Share2, Printer, Edit2, Trash2,
  Search, Filter, Coffee, ShoppingBag, TrendingUp, Package,
  Timer, Image as ImageIcon, Download, Eye, EyeOff, Percent, Database
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { GoogleSheetsConfig } from '../components/GoogleSheetsConfig';
import { googleSheetsSync } from '../services/googleSheetsSync';
import { sincronizarDesdeGoogleSheets, agregarAlCatalogo } from '../services/vehiculosSync';
import { agregarVehiculoAlPatio, actualizarVehiculoEnPatio, obtenerVehiculosDelPatio, obtenerProductosDelSheets } from '../services/patioSync';
import type { Price } from '../app/App';

interface MobileAppProps {
  user: string | null;
  onLogout: () => void;
  onLogin: (username: string) => void;
}

interface Vehiculo {
  id: string;
  patente: string;
  marcaModelo: string;
  color: string;
  cliente: string;
  telefono: string;
  servicio: string;
  precio: number;
  metodoPago: string;
  empleado: string;
  observaciones: string;
  fecha: string;
  horaIngreso: string;
  horaSalida?: string;
  estado: 'Ingresado' | 'Listo';
  productosBar?: { nombre: string; precio: number }[];
  productosCosmeticos?: { nombre: string; precio: number }[];
  descuento?: number;
  fotos?: string[];
  tiempoEstimado?: number; // minutos
}

const SERVICIOS_DEFAULT = [
  { nombre: 'M', precio: 25000, descripcion: 'Lavado M', tiempoEstimado: 30 },
  { nombre: 'L', precio: 28000, descripcion: 'Lavado L', tiempoEstimado: 35 },
  { nombre: 'XL', precio: 30000, descripcion: 'Lavado XL', tiempoEstimado: 40 },
  { nombre: 'XXL', precio: 35000, descripcion: 'Lavado XXL', tiempoEstimado: 45 },
  { nombre: 'XXXL', precio: 40000, descripcion: 'Lavado XXXL', tiempoEstimado: 50 },
  { nombre: 'CXL', precio: 40000, descripcion: 'Lavado CXL', tiempoEstimado: 50 },
  { nombre: 'CXXL', precio: 45000, descripcion: 'Lavado CXXL', tiempoEstimado: 60 },
  { nombre: 'Moto (250cc)', precio: 22000, descripcion: 'Lavado Moto', tiempoEstimado: 25 },
  { nombre: 'Moto Grande', precio: 28000, descripcion: 'Lavado Moto Grande', tiempoEstimado: 30 },
];

// Los productos Bar y Cosméticos se cargan dinámicamente desde Google Sheets
// (ver useEffect de carga de productos más abajo)

const COLORES = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Otro'];
const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cuenta', 'Mixto'];

export function MobileApp({ user, onLogout, onLogin }: MobileAppProps) {
  // Navegación
  const [pantalla, setPantalla] = useState<'inicio' | 'ingreso' | 'vehiculos' | 'retiro' | 'reportes'>('inicio');

  // Estados de datos
  const [vehiculosEnPatio, setVehiculosEnPatio] = useState<Vehiculo[]>(() => {
    const savedEnPatio = localStorage.getItem('gowash-mobile-patio');
    return savedEnPatio ? JSON.parse(savedEnPatio) : [];
  });
  const [vehiculosEntregados, setVehiculosEntregados] = useState<Vehiculo[]>(() => {
    const savedEntregados = localStorage.getItem('gowash-mobile-entregados');
    return savedEntregados ? JSON.parse(savedEntregados) : [];
  });
  
  // Registro de ediciones (para Reportes del Día)
  const [edicionesDelDia, setEdicionesDelDia] = useState<any[]>(() => {
    const savedEdiciones = localStorage.getItem('gowash-mobile-ediciones');
    return savedEdiciones ? JSON.parse(savedEdiciones) : [];
  });

  // Catálogo de vehículos (desde Google Sheets / JSON)
  const [catalogoVehiculos, setCatalogoVehiculos] = useState<Price[]>([]);
  const [sugerencias, setSugerencias] = useState<Price[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Productos Bar y Cosméticos dinámicos desde Google Sheets
  const [serviciosList, setServiciosList] = useState(SERVICIOS_DEFAULT);
  const [productosBar, setProductosBar] = useState<{ group: string; nombre: string; precio: number }[]>([]);
  const [productosCosmeticos, setProductosCosmeticos] = useState<{ nombre: string; contenido: string; precio: number }[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  
  // Estado de conexión Google Sheets
  const [googleSheetsConectado, setGoogleSheetsConectado] = useState(false);
  
  // Login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const isAdmin = user === 'admin' || user === 'Usuario' || user === 'Admin';
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Formulario de ingreso
  const [patente, setPatente] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  const [color, setColor] = useState('Blanco');
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [metodoPagoCustom, setMetodoPagoCustom] = useState('');
  const [empleadoRecibe, setEmpleadoRecibe] = useState('');
  
  // Fechas y horas
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [horaIngreso, setHoraIngreso] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  
  // Nuevos estados para productos adicionales
  const [productosBarSeleccionados, setProductosBarSeleccionados] = useState<{ nombre: string; precio: number }[]>([]);
  const [productosCosmeticosSeleccionados, setProductosCosmeticosSeleccionados] = useState<{ nombre: string; precio: number }[]>([]);
  const [descuento, setDescuento] = useState<number>(0);
  const [descuentoTipo, setDescuentoTipo] = useState<string>('%');
  
  // Guardar catálogo
  const [guardandoCatalogo, setGuardandoCatalogo] = useState(false);
  const handleGuardarCatalogo = async () => {
    if (!marcaModelo || marcaModelo.length < 2) return;
    setGuardandoCatalogo(true);
    
    // Promt user for size (default Mediano) and price (default 0)
    const partes = marcaModelo.trim().split(' ');
    const brand = partes[0];
    const model = partes.slice(1).join(' ') || 'General';
    
    const size = window.prompt('¿Qué tamaño es? (Ej: Pequeño, Mediano, Grande, SUV, PickUp)', 'Mediano');
    if (size === null) { setGuardandoCatalogo(false); return; }
    
    const price = parseInt(window.prompt('Precio base recomendado para lavado artesanal', '0') || '0', 10);
    
    const exito = await agregarAlCatalogo({
      Marca: brand,
      Modelo: model,
      Tamaño: size,
      Precio: price
    });
    
    if (exito) {
      toast.success('Vehículo añadido al catálogo');
      setCatalogoVehiculos([...catalogoVehiculos, {
        id: `nuevo-${Date.now()}`,
        brand, model, size, price, service: 'Lavado Artesanal'
      }]);
    } else {
      toast.error('Error al guardar en catálogo');
    }
    setGuardandoCatalogo(false);
    setMostrarSugerencias(false);
  };
  
  // Estados para fotos
  const [fotos, setFotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | Vehiculo['estado']>('Todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para edición
  const [vehiculoEditando, setVehiculoEditando] = useState<Vehiculo | null>(null);
  
  // Modal QR
  const [mostrarQR, setMostrarQR] = useState(false);
  const [vehiculoQR, setVehiculoQR] = useState<Vehiculo | null>(null);
  
  // Modal Google Sheets
  const [mostrarGoogleSheets, setMostrarGoogleSheets] = useState(false);
  
  // Scanner QR para retiro
  const [escanerActivo, setEscanerActivo] = useState(false);
  const [busquedaPatente, setBusquedaPatente] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);

  // Estados para checkout en retiro (cobro móvil)
  const [checkoutMetodoPago, setCheckoutMetodoPago] = useState('Efectivo');
  const [checkoutMetodoPagoCustom, setCheckoutMetodoPagoCustom] = useState('');
  const [checkoutDescuento, setCheckoutDescuento] = useState<number>(0);
  const [checkoutDescuentoTipo, setCheckoutDescuentoTipo] = useState<string>('$');

  useEffect(() => {
    if (vehiculoSeleccionado) {
      const isStandard = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cuenta'].includes(vehiculoSeleccionado.metodoPago);
      setCheckoutMetodoPago(isStandard ? vehiculoSeleccionado.metodoPago : (vehiculoSeleccionado.metodoPago ? 'Mixto' : 'Efectivo'));
      setCheckoutMetodoPagoCustom(isStandard ? '' : (vehiculoSeleccionado.metodoPago || ''));
      setCheckoutDescuento(vehiculoSeleccionado.descuento || 0);
      setCheckoutDescuentoTipo('$');
    }
  }, [vehiculoSeleccionado]);

  const calcularCheckoutTotal = () => {
    if (!vehiculoSeleccionado) return 0;
    const subtotal = vehiculoSeleccionado.precio + (vehiculoSeleccionado.descuento || 0);
    const montoDescuento = checkoutDescuentoTipo === '%'
      ? (subtotal * checkoutDescuento) / 100
      : checkoutDescuento;
    return Math.max(0, subtotal - montoDescuento);
  };

  const calcularCheckoutMontoDescuento = () => {
    if (!vehiculoSeleccionado) return 0;
    const subtotal = vehiculoSeleccionado.precio + (vehiculoSeleccionado.descuento || 0);
    return checkoutDescuentoTipo === '%'
      ? (subtotal * checkoutDescuento) / 100
      : checkoutDescuento;
  };

  // Cargar datos al iniciar
  useEffect(() => {
    const savedUsers = localStorage.getItem('gowash-users');
    if (savedUsers) {
      setUsuarios(JSON.parse(savedUsers));
    } else {
      setUsuarios([
        { username: 'admin', role: 'admin', password: 'tomadmin' },
        { username: 'supervisor', role: 'supervisor', password: 'admin1' },
        { username: 'empleado', role: 'empleado', password: 'admin2' }
      ]);
    }

    // Cargar catálogo de vehículos para autocompletado
    sincronizarDesdeGoogleSheets().then(lista => {
      if (lista.length > 0) {
        setCatalogoVehiculos(lista);
        console.log(`[MobileApp] Catálogo cargado: ${lista.length} vehículos`);
      }
    }).catch(err => console.error('[MobileApp] Error cargando catálogo:', err));

    // Verificar si hay conexión con Google Sheets
    const spreadsheetId = localStorage.getItem('gowash-spreadsheet-id');
    if (spreadsheetId && googleSheetsSync.isAvailable()) {
      setGoogleSheetsConectado(true);
      // Intentar inicializar automáticamente
      googleSheetsSync.initialize().then(result => {
        if (result.success) {
          console.log('✅ Google Sheets inicializado automáticamente');
        }
      });
    }
  }, []);

  // Cargar productos Bar y Cosméticos desde Google Sheets al iniciar
  useEffect(() => {
    setCargandoProductos(true);
    obtenerProductosDelSheets()
      .then(({ bar, cosmetica }) => {
        if (bar.length > 0) {
          setProductosBar(bar.map(p => ({ group: p.group, nombre: p.name, precio: p.value })));
          console.log(`[MobileApp] Productos Bar cargados: ${bar.length}`);
        }
        if (cosmetica.length > 0) {
          setProductosCosmeticos(cosmetica.map(p => ({ nombre: p.nombre, contenido: p.contenido, precio: p.pvp })));
          console.log(`[MobileApp] Productos Cosméticos cargados: ${cosmetica.length}`);
        }
      })
      .catch(err => console.error('[MobileApp] Error cargando productos:', err))
      .finally(() => setCargandoProductos(false));
      
    // Cargar Servicios desde Google Sheets
    fetch('/api/servicios')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data && data.data.length > 0) {
          setServiciosList(data.data);
          setServicioSeleccionado(data.data[0]);
          console.log(`[MobileApp] Servicios cargados: ${data.data.length}`);
        }
      })
      .catch(err => console.error('[MobileApp] Error cargando servicios:', err));
  }, []);

  // Polling de vehículos en patio desde Google Sheets (cada 10 segundos)
  useEffect(() => {
    const refrescarPatio = () => {
      obtenerVehiculosDelPatio()
        .then(vehiculosSheet => {
          if (Array.isArray(vehiculosSheet)) {
            const activos = vehiculosSheet.filter(v => !v.horaSalida);
            setVehiculosEnPatio(activos);
            localStorage.setItem('gowash-mobile-patio', JSON.stringify(activos));
            
            // Si la hoja está vacía (por ej. tras el cierre de caja), reiniciar también los entregados
            if (vehiculosSheet.length === 0) {
              setVehiculosEntregados([]);
              localStorage.removeItem('gowash-mobile-entregados');
              setEdicionesDelDia([]);
              localStorage.removeItem('gowash-mobile-ediciones');
            }

            console.log(`[MobileApp] Polling: Patio actualizado con ${activos.length} vehículos`);
          }
        })
        .catch(err => console.error('[MobileApp] Error en polling de patio:', err));
    };

    // Refrescar de inmediato al montar
    refrescarPatio();

    // Polling cada 10 segundos (reducido de 20s para respuesta más rápida)
    const intervalId = setInterval(refrescarPatio, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Actualizar fecha y hora cuando se abre el formulario de ingreso
  useEffect(() => {
    if (pantalla === 'ingreso') {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setFechaIngreso(fecha);
      setHoraIngreso(hora);
      if (!empleadoRecibe) {
        setEmpleadoRecibe(user || '');
      }
    }
  }, [pantalla, user]);

  // Guardar automáticamente
  useEffect(() => {
    localStorage.setItem('gowash-mobile-patio', JSON.stringify(vehiculosEnPatio));
  }, [vehiculosEnPatio]);

  useEffect(() => {
    localStorage.setItem('gowash-mobile-entregados', JSON.stringify(vehiculosEntregados));
  }, [vehiculosEntregados]);

  useEffect(() => {
    localStorage.setItem('gowash-mobile-ediciones', JSON.stringify(edicionesDelDia));
  }, [edicionesDelDia]);

  // Formatear moneda
  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString('es-AR')}`;
  };

  // Calcular total con productos adicionales
  const calcularTotal = () => {
    const totalBar = productosBarSeleccionados.reduce((sum, p) => sum + p.precio, 0);
    const totalCosmeticos = productosCosmeticosSeleccionados.reduce((sum, p) => sum + p.precio, 0);
    const subtotal = (servicioSeleccionado ? servicioSeleccionado.precio : 0) + totalBar + totalCosmeticos;
    const montoDescuento = descuentoTipo === '%'
      ? (subtotal * descuento) / 100
      : descuento;
    return Math.max(0, subtotal - montoDescuento);
  };

  // Calcular monto de descuento para mostrar en resumen
  const calcularMontoDescuento = () => {
    const totalBar = productosBarSeleccionados.reduce((sum, p) => sum + p.precio, 0);
    const totalCosmeticos = productosCosmeticosSeleccionados.reduce((sum, p) => sum + p.precio, 0);
    const subtotal = (servicioSeleccionado ? servicioSeleccionado.precio : 0) + totalBar + totalCosmeticos;
    return descuentoTipo === '%' ? (subtotal * descuento) / 100 : descuento;
  };

  // Calcular tiempo en patio
  const calcularTiempoEnPatio = (horaIngreso: string) => {
    const [horas, minutos] = horaIngreso.split(':').map(Number);
    const ingreso = new Date();
    ingreso.setHours(horas, minutos, 0);
    
    const ahora = new Date();
    const diffMs = ahora.getTime() - ingreso.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      toast.error('Campos requeridos');
      return;
    }

    const matched = usuarios.find(
      u => u.username.toLowerCase() === loginUser.toLowerCase() && u.password === loginPass
    );

    if (matched) {
      if (matched.disabled) {
        toast.error('Usuario inhabilitado');
        return;
      }
      onLogin(matched.username);
      toast.success(`Bienvenido ${matched.username}`);
    } else {
      toast.error('Credenciales inválidas');
    }
  };

  // Buscar sugerencias del catálogo al escribir marca/modelo
  const handleMarcaModeloChange = (valor: string) => {
    setMarcaModelo(valor);
    if (valor.length >= 2) {
      const term = valor.toLowerCase();
      const encontrados = catalogoVehiculos
        .filter(v =>
          v.brand.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term) ||
          `${v.brand} ${v.model}`.toLowerCase().includes(term)
        )
        .slice(0, 6);
      setSugerencias(encontrados);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarSugerencia = (v: Price) => {
    setMarcaModelo(`${v.brand} ${v.model}`);
    setSugerencias([]);
    setMostrarSugerencias(false);
    // Autocompletar precio si el servicio no tiene uno definido
    if (v.price > 0) {
      const servicioMatchIndex = serviciosList.findIndex(s => s.precio === v.price);
      if (servicioMatchIndex >= 0) {
        setServicioSeleccionado(serviciosList[servicioMatchIndex]);
      }
    }
  };

  // Registrar nuevo vehículo
  const handleRegistrarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si está editando, guardar cambios
    if (vehiculoEditando) {
      guardarEdicion();
      return;
    }
    
    let patenteFinal = patente.trim().toUpperCase();
    if (!patenteFinal) {
      const tieneConsumos = productosBarSeleccionados.length > 0 || productosCosmeticosSeleccionados.length > 0;
      if (tieneConsumos) {
        patenteFinal = 'CONSUMO';
      } else {
        toast.error('La patente es obligatoria para registrar un vehículo.');
        return;
      }
    }

    const totalFinal = calcularTotal();
    const metodoPagoFinal = metodoPago === 'Mixto' && metodoPagoCustom ? metodoPagoCustom : metodoPago;
    
    const nuevoVehiculo: Vehiculo = {
      id: `GW${Date.now()}${patenteFinal.replace(/\s/g, '')}`,
      patente: patenteFinal,
      marcaModelo: marcaModelo || 'No especificado',
      color: color,
      cliente: clienteNombre || 'Particular',
      telefono: telefono || '',
      servicio: servicioSeleccionado ? servicioSeleccionado.nombre : 'Ninguno',
      precio: totalFinal,
      metodoPago: metodoPagoFinal,
      empleado: empleadoRecibe || user || 'Sistema',
      observaciones: observaciones,
      fecha: fechaIngreso,
      horaIngreso: horaIngreso,
      estado: 'Ingresado',
      productosBar: productosBarSeleccionados,
      productosCosmeticos: productosCosmeticosSeleccionados,
      descuento: calcularMontoDescuento(),
      fotos: fotos,
      tiempoEstimado: servicioSeleccionado ? servicioSeleccionado.tiempoEstimado : 0
    };

    setVehiculosEnPatio([...vehiculosEnPatio, nuevoVehiculo]);
    
    // Sincronizar con Google Sheets via patioSync (funciona en web y mobile)
    agregarVehiculoAlPatio({
      id: nuevoVehiculo.id,
      patente: nuevoVehiculo.patente,
      marcaModelo: nuevoVehiculo.marcaModelo,
      color: nuevoVehiculo.color,
      cliente: nuevoVehiculo.cliente,
      telefono: nuevoVehiculo.telefono,
      servicio: nuevoVehiculo.servicio,
      precio: nuevoVehiculo.precio,
      metodoPago: nuevoVehiculo.metodoPago,
      empleado: nuevoVehiculo.empleado,
      fecha: nuevoVehiculo.fecha,
      horaIngreso: nuevoVehiculo.horaIngreso,
      estado: nuevoVehiculo.estado,
      observaciones: nuevoVehiculo.observaciones,
      productosBar: nuevoVehiculo.productosBar,
      productosCosmeticos: nuevoVehiculo.productosCosmeticos,
      descuento: nuevoVehiculo.descuento,
      tiempoEstimado: nuevoVehiculo.tiempoEstimado,
    }).then(r => {
      if (r.success) toast.success('✅ Ingreso sincronizado con Google Sheets');
      else console.warn('[MobileApp] No se pudo sincronizar con Sheets:', r.error);
    }).catch(err => console.error('[MobileApp] Error sync patio:', err));
    
    setVehiculoQR(nuevoVehiculo);
    setMostrarQR(true);
    
    // Limpiar formulario
    setPatente('');
    setMarcaModelo('');
    setClienteNombre('');
    setTelefono('');
    setObservaciones('');
    setMetodoPago('Efectivo');
    setMetodoPagoCustom('');
    setProductosBarSeleccionados([]);
    setProductosCosmeticosSeleccionados([]);
    setDescuento(0);
    setDescuentoTipo('$');
    setFotos([]);
    setServicioSeleccionado(null);
    // No limpiar empleadoRecibe para que se mantenga
    
    toast.success('¡Vehículo ingresado correctamente!');
  };

  // Actualizar estado del vehículo
  const actualizarEstado = (id: string, nuevoEstado: Vehiculo['estado']) => {
    setVehiculosEnPatio(vehiculosEnPatio.map(v => 
      v.id === id ? { ...v, estado: nuevoEstado } : v
    ));
    // Sincronizar estado en Sheets
    actualizarVehiculoEnPatio(id, { estado: nuevoEstado })
      .catch(err => console.error('[MobileApp] Error actualizando estado en Sheets:', err));
    toast.success(`Estado actualizado a: ${nuevoEstado}`);
  };

  // Eliminar vehículo del patio
  const eliminarVehiculo = (id: string) => {
    const vehiculo = vehiculosEnPatio.find(v => v.id === id);
    if (!vehiculo) return;

    if (confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.patente} del patio?`)) {
      setVehiculosEnPatio(vehiculosEnPatio.filter(v => v.id !== id));
      
      // Guardar en el registro de ediciones
      const nuevaEdicion = {
        id: Date.now().toString(),
        vehiculoId: id,
        patente: vehiculo.patente,
        usuario: user,
        tipo: 'eliminar',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setEdicionesDelDia([nuevaEdicion, ...edicionesDelDia]);

      // Sincronizar eliminación con Google Sheets (marcarlo como retirado/eliminado)
      actualizarVehiculoEnPatio(id, {
        horaSalida: 'ELIMINADO',
        estado: 'Eliminado'
      }).catch(err => console.error('[MobileApp] Error eliminando vehículo en Sheets:', err));

      toast.success('Vehículo eliminado del patio');
    }
  };

  // Editar vehículo
  const iniciarEdicion = (vehiculo: Vehiculo) => {
    setVehiculoEditando(vehiculo);
    setPatente(vehiculo.patente);
    setMarcaModelo(vehiculo.marcaModelo);
    setColor(vehiculo.color);
    setClienteNombre(vehiculo.cliente);
    setTelefono(vehiculo.telefono);
    setObservaciones(vehiculo.observaciones);
    setMetodoPago(vehiculo.metodoPago.includes('+') || vehiculo.metodoPago.includes('y') ? 'Mixto' : vehiculo.metodoPago);
    setMetodoPagoCustom(vehiculo.metodoPago.includes('+') || vehiculo.metodoPago.includes('y') ? vehiculo.metodoPago : '');
    setEmpleadoRecibe(vehiculo.empleado);
    setFechaIngreso(vehiculo.fecha);
    setHoraIngreso(vehiculo.horaIngreso);
    setHoraSalida(vehiculo.horaSalida || '');
    setProductosBarSeleccionados(vehiculo.productosBar || []);
    setProductosCosmeticosSeleccionados(vehiculo.productosCosmeticos || []);
    setDescuento(vehiculo.descuento || 0);
    setFotos(vehiculo.fotos || []);
    const servicio = serviciosList.find(s => s.nombre === vehiculo.servicio);
    setServicioSeleccionado(servicio || null);
    setPantalla('ingreso');
  };

  const guardarEdicion = () => {
    if (!vehiculoEditando) return;
    
    let patenteFinal = patente.trim().toUpperCase();
    if (!patenteFinal) {
      const tieneConsumos = productosBarSeleccionados.length > 0 || productosCosmeticosSeleccionados.length > 0;
      if (tieneConsumos) {
        patenteFinal = 'CONSUMO';
      } else {
        toast.error('La patente es obligatoria para registrar un vehículo.');
        return;
      }
    }
    
    const totalFinal = calcularTotal();
    const metodoPagoFinal = metodoPago === 'Mixto' && metodoPagoCustom ? metodoPagoCustom : metodoPago;
    
    const vehiculoActualizado: Vehiculo = {
      ...vehiculoEditando,
      patente: patenteFinal,
      marcaModelo: marcaModelo || 'No especificado',
      color: color,
      cliente: clienteNombre || 'Particular',
      telefono: telefono || '',
      servicio: servicioSeleccionado ? servicioSeleccionado.nombre : 'Ninguno',
      precio: totalFinal,
      metodoPago: metodoPagoFinal,
      empleado: empleadoRecibe,
      observaciones: observaciones,
      fecha: fechaIngreso,
      horaIngreso: horaIngreso,
      horaSalida: horaSalida,
      productosBar: productosBarSeleccionados,
      productosCosmeticos: productosCosmeticosSeleccionados,
      descuento: calcularMontoDescuento(),
      fotos: fotos,
      tiempoEstimado: servicioSeleccionado ? servicioSeleccionado.tiempoEstimado : 0
    };

    setVehiculosEnPatio(vehiculosEnPatio.map(v => 
      v.id === vehiculoEditando.id ? vehiculoActualizado : v
    ));
    
    // Guardar en el registro de ediciones
    const nuevaEdicion = {
      id: Date.now().toString(),
      vehiculoId: vehiculoEditando.id,
      patente: vehiculoActualizado.patente,
      usuario: user,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setEdicionesDelDia([nuevaEdicion, ...edicionesDelDia]);
    
    // Sincronizar edición con Google Sheets
    actualizarVehiculoEnPatio(vehiculoEditando.id, {
      patente: vehiculoActualizado.patente,
      marcaModelo: vehiculoActualizado.marcaModelo,
      color: vehiculoActualizado.color,
      cliente: vehiculoActualizado.cliente,
      telefono: vehiculoActualizado.telefono,
      servicio: vehiculoActualizado.servicio,
      precio: vehiculoActualizado.precio,
      metodoPago: vehiculoActualizado.metodoPago,
      empleado: vehiculoActualizado.empleado,
      observaciones: vehiculoActualizado.observaciones,
      productosBar: vehiculoActualizado.productosBar,
      productosCosmeticos: vehiculoActualizado.productosCosmeticos,
      descuento: vehiculoActualizado.descuento,
      tiempoEstimado: vehiculoActualizado.tiempoEstimado,
    }).catch(err => console.error('[MobileApp] Error actualizando edición en Sheets:', err));
    
    // Limpiar
    cancelarEdicion();
    setPantalla('vehiculos');
    toast.success('Vehículo actualizado correctamente');
  };

  const cancelarEdicion = () => {
    setVehiculoEditando(null);
    setPatente('');
    setMarcaModelo('');
    setColor('Blanco');
    setClienteNombre('');
    setTelefono('');
    setObservaciones('');
    setMetodoPago('Efectivo');
    setMetodoPagoCustom('');
    setEmpleadoRecibe('');
    setFechaIngreso('');
    setHoraIngreso('');
    setHoraSalida('');
    setProductosBarSeleccionados([]);
    setProductosCosmeticosSeleccionados([]);
    setDescuento(0);
    setDescuentoTipo('$');
    setFotos([]);
  };

  // Manejar captura de fotos
  const handleCapturarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos(prev => {
          if (prev.length >= 5) {
            toast.error('Límite de fotos', { description: 'Solo puedes subir hasta 5 fotos por vehículo.' });
            return prev;
          }
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const eliminarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  // Entregar vehículo
  const entregarVehiculo = async (vehiculo: Vehiculo) => {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const finalPrice = calcularCheckoutTotal();
    const finalDescuento = calcularCheckoutMontoDescuento();
    const finalMetodoPago = checkoutMetodoPago === 'Mixto' && checkoutMetodoPagoCustom 
      ? checkoutMetodoPagoCustom 
      : checkoutMetodoPago;

    const vehiculoEntregado = {
      ...vehiculo,
      precio: finalPrice,
      descuento: finalDescuento,
      metodoPago: finalMetodoPago,
      horaSalida: hora,
      estado: 'Entregado' as const
    };

    setVehiculosEntregados([vehiculoEntregado, ...vehiculosEntregados]);
    setVehiculosEnPatio(vehiculosEnPatio.filter(v => v.id !== vehiculo.id));
    
    // Sincronizar hora de salida y estado en Sheets via patioSync
    actualizarVehiculoEnPatio(vehiculo.id, {
      precio: finalPrice,
      descuento: finalDescuento,
      metodoPago: finalMetodoPago,
      horaSalida: hora,
      estado: 'Entregado',
    }).then(r => {
      if (r.success) console.log('[MobileApp] ✅ Entrega registrada en Sheets');
      else console.warn('[MobileApp] No se pudo actualizar Sheets:', r.error);
    }).catch(err => console.error('[MobileApp] Error actualizando Sheets:', err));
    
    setVehiculoSeleccionado(null);
    setPantalla('inicio');
    
    toast.success(`Vehículo ${vehiculo.patente} cobrado y entregado exitosamente`);
  };

  // Escanear QR
  const iniciarEscaneoQR = () => {
    setEscanerActivo(true);
    setVehiculoSeleccionado(null);
    
    setTimeout(() => {
      const html5Qrcode = new Html5Qrcode("qr-reader");
      qrReaderRef.current = html5Qrcode;
      
      html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const vehiculo = vehiculosEnPatio.find(v => v.id === decodedText);
          if (vehiculo) {
            setVehiculoSeleccionado(vehiculo);
            detenerEscaneoQR();
            toast.success('¡Código QR escaneado!');
          } else {
            toast.error('Vehículo no encontrado en el patio');
          }
        },
        () => {}
      ).catch(err => {
        console.error("Error al iniciar cámara:", err);
        toast.error('Error al acceder a la cámara');
        setEscanerActivo(false);
      });
    }, 300);
  };

  const detenerEscaneoQR = () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.stop().then(() => {
        setEscanerActivo(false);
        qrReaderRef.current = null;
      }).catch(() => setEscanerActivo(false));
    } else {
      setEscanerActivo(false);
    }
  };

  // Buscar por patente
  const buscarPorPatente = () => {
    const vehiculo = vehiculosEnPatio.find(v => 
      v.patente.toUpperCase() === busquedaPatente.trim().toUpperCase()
    );
    
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);
      setBusquedaPatente('');
    } else {
      toast.error('Vehículo no encontrado');
    }
  };

  // Agregar producto bar
  const agregarProductoBar = (producto: { nombre: string; precio: number }) => {
    setProductosBarSeleccionados([...productosBarSeleccionados, producto]);
    toast.success(`${producto.nombre} agregado`);
  };

  // Eliminar producto bar
  const eliminarProductoBar = (index: number) => {
    setProductosBarSeleccionados(productosBarSeleccionados.filter((_, i) => i !== index));
  };

  // Agregar producto cosmético
  const agregarProductoCosmetico = (producto: { nombre: string; precio: number }) => {
    setProductosCosmeticosSeleccionados([...productosCosmeticosSeleccionados, producto]);
    toast.success(`${producto.nombre} agregado`);
  };

  // Eliminar producto cosmético
  const eliminarProductoCosmetico = (index: number) => {
    setProductosCosmeticosSeleccionados(productosCosmeticosSeleccionados.filter((_, i) => i !== index));
  };

  // Filtrar vehículos
  const vehiculosFiltrados = vehiculosEnPatio.filter(v => {
    const coincideFiltro = filtroEstado === 'Todos' || v.estado === filtroEstado;
    const coincideBusqueda = busqueda === '' || 
      v.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.marcaModelo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  // Enviar por WhatsApp
  const enviarWhatsApp = async (vehiculo: Vehiculo) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vehiculo.id)}`;
    const textoMensaje = `✨ *GOWASH - Lavadero Artesanal* ✨\n\n` +
      `¡Hola ${vehiculo.cliente}!\n\n` +
      `Tu vehículo ha ingresado exitosamente:\n\n` +
      `🚗 *Patente:* ${vehiculo.patente}\n` +
      `🚘 *Vehículo:* ${vehiculo.marcaModelo}\n` +
      `📝 *Servicio:* ${vehiculo.servicio}\n` +
      `💰 *Precio:* ${formatMoney(vehiculo.precio)}\n` +
      `💳 *Pago:* ${vehiculo.metodoPago}\n` +
      `⏰ *Hora Ingreso:* ${vehiculo.horaIngreso} hs\n` +
      `👤 *Recibió:* ${vehiculo.empleado}\n\n` +
      `🔑 *Código de Retiro:* \`${vehiculo.id}\`\n\n` +
      `📲 *Tu QR de retiro:*\n${qrUrl}\n\n` +
      `_Presenta este mensaje o el QR al retirar tu vehículo._\n` +
      `¡Gracias por confiar en GoWash! 🏆`;

    const mensaje = encodeURIComponent(textoMensaje);

    // Intentar compartir como archivo (imagen QR) + texto si es compatible
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const file = new File([blob], `gowash-${vehiculo.patente}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Ticket GoWash ${vehiculo.patente}`,
          text: textoMensaje
        });
        toast.success('Ticket con QR compartido exitosamente');
        return;
      }
    } catch (e) {
      console.warn('[WhatsApp] navigator.share falló o no es compatible:', e);
    }

    // Fallback: abrir enlace de WhatsApp directo (solo texto con el link al QR)
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isMobile 
      ? `https://api.whatsapp.com/send?text=${mensaje}`
      : `https://web.whatsapp.com/send?text=${mensaje}`;
    
    if (vehiculo.telefono) {
      const telefono = vehiculo.telefono.replace(/\D/g, '');
      window.open(`https://api.whatsapp.com/send?phone=549${telefono}&text=${mensaje}`, '_blank');
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  // PANTALLA DE LOGIN
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#1a1f2e] to-[#0a0f1d] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-blue-500/10 rounded-full border border-blue-500/20 backdrop-blur-sm">
              <Car className="w-16 h-16 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">GOWASH</h1>
              <p className="text-sm text-slate-400 font-medium">Sistema de Lavadero</p>
            </div>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Iniciar Sesión</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Usuario</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Nombre de usuario"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Ingresar
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">© 2026 GoWash · Versión Móvil</p>
        </div>
      </div>
    );
  }

  // APLICACIÓN PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#1a1f2e] to-[#0a0f1d] text-white pb-24">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-30"></div>
              <div className="relative p-2 bg-slate-900 rounded-full border border-blue-500/30">
                <Car className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black text-white bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">GOWASH</h1>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Sistema de Lavadero</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">{user}</span>
            </div>
            {googleSheetsConectado && googleSheetsSync.isAvailable() && (
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1" title="Conectado a Google Sheets">
                <Database className="w-3 h-3 text-emerald-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="p-4 max-w-2xl mx-auto">
        {/* PANTALLA INICIO */}
        {pantalla === 'inicio' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">En Patio</p>
                    <p className="text-3xl font-black text-white">{vehiculosEnPatio.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Entregados Hoy</p>
                    <p className="text-3xl font-black text-white">{vehiculosEntregados.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Acciones Rápidas</h3>
              
              <button
                onClick={() => setPantalla('ingreso')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-between group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-black">Ingreso de Vehículo</p>
                    <p className="text-xs text-blue-100 font-normal">Registrar nuevo ingreso</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setPantalla('retiro')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-between group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-black">Retiro de Vehículo</p>
                    <p className="text-xs text-emerald-100 font-normal">Escanear código QR</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setPantalla('vehiculos')}
                className="w-full bg-slate-900/70 border border-slate-700 hover:border-slate-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <List className="w-6 h-6 text-slate-300" />
                  <div className="text-left">
                    <p className="font-black">Vehículos en Patio</p>
                    <p className="text-xs text-slate-400 font-normal">Ver lista completa</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setPantalla('reportes')}
                className="w-full bg-slate-900/70 border border-slate-700 hover:border-slate-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-slate-300" />
                  <div className="text-left">
                    <p className="font-black">Reportes del Día</p>
                    <p className="text-xs text-slate-400 font-normal">Ver estadísticas</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA INGRESO DE VEHÍCULO */}
        {pantalla === 'ingreso' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">
                {vehiculoEditando ? 'Editar Vehículo' : 'Ingreso de Vehículo'}
              </h2>
              <button
                onClick={() => setPantalla('inicio')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRegistrarVehiculo} className="space-y-5">
              {/* Datos del Vehículo */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  1. Datos del Vehículo
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Patente</label>
                  <input
                    type="text"
                    value={patente}
                    onChange={(e) => setPatente(e.target.value.toUpperCase())}
                    placeholder="AB123CD"
                    maxLength={7}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono font-bold placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Vehículo / Modelo</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={marcaModelo}
                      onChange={(e) => handleMarcaModeloChange(e.target.value)}
                      onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                      onFocus={() => marcaModelo.length >= 2 && setMostrarSugerencias(true)}
                      placeholder="Ej: COROLLA, GOL, HILUX..."
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {/* Sugerencias del catálogo */}
                    {mostrarSugerencias && sugerencias.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden">
                        {sugerencias.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={() => seleccionarSugerencia(v)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-0"
                          >
                            {v.imageUrl ? (
                              <img src={v.imageUrl} alt={v.brand} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Car className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm truncate">{v.brand} {v.model}</p>
                              <p className="text-slate-400 text-xs">{v.size} · ${v.price.toLocaleString('es-AR')}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {mostrarSugerencias && sugerencias.length === 0 && marcaModelo.length > 2 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-3">
                        <p className="text-sm text-slate-300 mb-2">Vehículo no encontrado en el catálogo.</p>
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleGuardarCatalogo(); }}
                          disabled={guardandoCatalogo}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
                        >
                          {guardandoCatalogo ? 'Guardando...' : (
                            <>
                              <Plus size={16} />
                              Añadir al Catálogo
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fecha</label>
                    <input
                      type="date"
                      value={fechaIngreso}
                      onChange={(e) => setFechaIngreso(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">H. Entrada</label>
                    <input
                      type="time"
                      value={horaIngreso}
                      onChange={(e) => setHoraIngreso(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">H. Salida</label>
                    <input
                      type="time"
                      value={horaSalida}
                      onChange={(e) => setHoraSalida(e.target.value)}
                      placeholder="Auto"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Empleado que Recibe</label>
                  <input
                    type="text"
                    value={empleadoRecibe}
                    onChange={(e) => setEmpleadoRecibe(e.target.value)}
                    placeholder={user || 'Nombre del empleado'}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  2. Cliente
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nombre</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+54 11 2345 6789"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Servicio */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  3. Servicio
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tipo de Servicio</label>
                  <select
                    value={servicioSeleccionado ? servicioSeleccionado.nombre : ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setServicioSeleccionado(null);
                      } else {
                        const servicio = serviciosList.find(s => s.nombre === e.target.value);
                        if (servicio) setServicioSeleccionado(servicio);
                      }
                    }}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">-- Sin lavado (Solo consumos) --</option>
                    {serviciosList.map(servicio => (
                      <option key={servicio.nombre} value={servicio.nombre}>
                        {servicio.nombre} - {formatMoney(servicio.precio)} ({servicio.tiempoEstimado} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info del servicio seleccionado */}
                {servicioSeleccionado ? (
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-purple-300">{servicioSeleccionado.nombre}</p>
                        <p className="text-xs text-slate-400 mt-1">{servicioSeleccionado.descripcion}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Tiempo estimado: {servicioSeleccionado.tiempoEstimado} minutos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-purple-400">{formatMoney(servicioSeleccionado.precio)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/20 border border-slate-800 rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-400">Sin lavado contratado</p>
                    <p className="text-xs text-slate-500 mt-1">El vehículo ingresará al patio únicamente para registrar consumos de bar o cosmética.</p>
                  </div>
                )}
              </div>

              {/* Captura de Fotos (MOVIDO AQUÍ - después de Servicio) */}
              <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Fotos del Vehículo
                </h3>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleCapturarFoto}
                  className="hidden"
                />
                
                {fotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Tomar/Seleccionar Fotos (Max 5)
                  </button>
                )}

                {fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {fotos.map((foto, idx) => (
                      <div key={idx} className="relative group">
                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => eliminarFoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Productos del Bar (DESPLEGABLE) */}
              <div className="bg-gradient-to-br from-green-900/30 to-slate-900/50 border border-green-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  Productos del Bar
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Seleccionar Producto</label>
                  {cargandoProductos ? (
                    <p className="text-xs text-green-400 animate-pulse">Cargando productos desde Sheets...</p>
                  ) : (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const [nombre, precioStr] = val.split('|');
                      const precio = parseFloat(precioStr) || 0;
                      if (nombre) {
                        agregarProductoBar({ nombre, precio });
                        e.target.value = '';
                      }
                    }}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="">-- Agregar producto --</option>
                    {productosBar.length > 0
                      ? (() => {
                          const grupos = [...new Set(productosBar.map(p => p.group))];
                          return grupos.map(grupo => (
                            <optgroup key={grupo} label={grupo}>
                              {productosBar.filter(p => p.group === grupo).map(producto => (
                                <option key={producto.nombre} value={`${producto.nombre}|${producto.precio}`}>
                                  {producto.nombre} - {formatMoney(producto.precio)}
                                </option>
                              ))}
                            </optgroup>
                          ));
                        })()
                      : <option disabled>No hay productos cargados desde Sheets</option>
                    }
                  </select>
                  )}
                </div>

                {productosBarSeleccionados.length > 0 && (
                  <div className="bg-slate-950/50 border border-green-500/20 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-green-400 font-bold uppercase">Productos agregados:</p>
                    {productosBarSeleccionados.map((producto, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{producto.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold">{formatMoney(producto.precio)}</span>
                          <button
                            type="button"
                            onClick={() => eliminarProductoBar(idx)}
                            className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-green-500/20">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-green-300">Subtotal Bar:</span>
                        <span className="text-green-400">{formatMoney(productosBarSeleccionados.reduce((sum, p) => sum + p.precio, 0))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Productos Cosméticos (DESPLEGABLE) */}
              <div className="bg-gradient-to-br from-pink-900/30 to-slate-900/50 border border-pink-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-pink-300 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Productos Cosméticos
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Seleccionar Producto</label>
                  {cargandoProductos ? (
                    <p className="text-xs text-pink-400 animate-pulse">Cargando productos desde Sheets...</p>
                  ) : (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const [nombre, precioStr] = val.split('|');
                      const precio = parseFloat(precioStr) || 0;
                      if (nombre) {
                        agregarProductoCosmetico({ nombre, precio });
                        e.target.value = '';
                      }
                    }}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                  >
                    <option value="">-- Agregar producto --</option>
                    {productosCosmeticos.length > 0
                      ? productosCosmeticos.map(producto => (
                          <option key={`${producto.nombre}-${producto.contenido}`} value={`${producto.nombre}${producto.contenido ? ' (' + producto.contenido + ')' : ''}|${producto.precio}`}>
                            {producto.nombre}{producto.contenido ? ` (${producto.contenido})` : ''} - {formatMoney(producto.precio)}
                          </option>
                        ))
                      : <option disabled>No hay productos cargados desde Sheets</option>
                    }
                  </select>
                  )}
                </div>

                {productosCosmeticosSeleccionados.length > 0 && (
                  <div className="bg-slate-950/50 border border-pink-500/20 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-pink-400 font-bold uppercase">Productos agregados:</p>
                    {productosCosmeticosSeleccionados.map((producto, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{producto.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-pink-400 font-bold">{formatMoney(producto.precio)}</span>
                          <button
                            type="button"
                            onClick={() => eliminarProductoCosmetico(idx)}
                            className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-pink-500/20">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-pink-300">Subtotal Cosméticos:</span>
                        <span className="text-pink-400">{formatMoney(productosCosmeticosSeleccionados.reduce((sum, p) => sum + p.precio, 0))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Forma de Pago */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Forma de Pago
                </h3>

                <div className="grid grid-cols-5 gap-2">
                  {METODOS_PAGO.map(metodo => (
                    <button
                      key={metodo}
                      type="button"
                      onClick={() => setMetodoPago(metodo)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                        metodoPago === metodo
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'bg-slate-950/50 border border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>

                {/* Campo editable para pago mixto */}
                {metodoPago === 'Mixto' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Detalle del Pago Mixto
                    </label>
                    <input
                      type="text"
                      value={metodoPagoCustom}
                      onChange={(e) => setMetodoPagoCustom(e.target.value)}
                      placeholder="Ej: Efectivo $3000 + Tarjeta $3000"
                      className="w-full bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <p className="text-xs text-slate-500 italic">
                      Especifica cómo se divide el pago entre métodos
                    </p>
                  </div>
                )}
              </div>

              {/* Descuento */}
              <div className="bg-gradient-to-br from-orange-900/30 to-slate-900/50 border border-orange-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-orange-300 uppercase tracking-wider flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Descuento
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Monto del Descuento</label>
                  <div className="flex gap-2">
                    {/* Toggle $ / % */}
                    <div className="flex rounded-xl overflow-hidden border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setDescuentoTipo('$')}
                        className={`px-4 py-3 text-sm font-black transition-all ${
                          descuentoTipo === '$'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-950/50 text-slate-400 hover:text-white'
                        }`}
                      >
                        $
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescuentoTipo('%')}
                        className={`px-4 py-3 text-sm font-black transition-all ${
                          descuentoTipo === '%'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-950/50 text-slate-400 hover:text-white'
                        }`}
                      >
                        %
                      </button>
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 font-bold">
                        {descuentoTipo}
                      </span>
                      <input
                        type="number"
                        value={descuento === 0 ? '' : descuento}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          if (rawVal === '') {
                            setDescuento(0);
                            return;
                          }
                          const val = Math.max(0, parseFloat(rawVal) || 0);
                          setDescuento(descuentoTipo === '%' ? Math.min(100, val) : val);
                        }}
                        placeholder="0"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                  {descuento > 0 && (
                    <p className="text-xs text-orange-300 font-bold">
                      {descuentoTipo === '%'
                        ? `= ${formatMoney(calcularMontoDescuento())} de descuento`
                        : `${descuento}% del subtotal`}
                    </p>
                  )}
                </div>
              </div>

              {/* Resumen de Total */}
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Total a Cobrar</p>
                    <p className="text-3xl font-black text-white mt-1">{formatMoney(calcularTotal())}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-500/20" />
                </div>
                {(productosBarSeleccionados.length > 0 || productosCosmeticosSeleccionados.length > 0 || descuento > 0) && (
                  <div className="mt-3 pt-3 border-t border-blue-500/20 text-xs space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Servicio base:</span>
                      <span className="text-white font-bold">{formatMoney(servicioSeleccionado ? servicioSeleccionado.precio : 0)}</span>
                    </div>
                    {productosBarSeleccionados.length > 0 && (
                      <div className="flex justify-between">
                        <span>Bar ({productosBarSeleccionados.length}):</span>
                        <span className="text-green-400 font-bold">{formatMoney(productosBarSeleccionados.reduce((sum, p) => sum + p.precio, 0))}</span>
                      </div>
                    )}
                    {productosCosmeticosSeleccionados.length > 0 && (
                      <div className="flex justify-between">
                        <span>Cosméticos ({productosCosmeticosSeleccionados.length}):</span>
                        <span className="text-pink-400 font-bold">{formatMoney(productosCosmeticosSeleccionados.reduce((sum, p) => sum + p.precio, 0))}</span>
                      </div>
                    )}
                    {descuento > 0 && (
                      <div className="flex justify-between">
                        <span>Descuento{descuentoTipo === '%' ? ` (${descuento}%)` : ''}:</span>
                        <span className="text-red-400 font-bold">-{formatMoney(calcularMontoDescuento())}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Generar QR */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <QrCode className="w-5 h-5" />
                {vehiculoEditando ? 'GUARDAR CAMBIOS' : 'GENERAR QR E INGRESAR'}
              </button>
              {vehiculoEditando && (
                <button
                  type="button"
                  onClick={() => {
                    cancelarEdicion();
                    setPantalla('vehiculos');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>
        )}

        {/* PANTALLA VEHÍCULOS EN PATIO */}
        {pantalla === 'vehiculos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Patio de Lavado</h2>
                <p className="text-sm text-slate-400">{vehiculosFiltrados.length} de {vehiculosEnPatio.length} vehículos</p>
              </div>
              <button
                onClick={() => setPantalla('inicio')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por patente, cliente o modelo..."
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              {/* Filtros por estado */}
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {(['Todos', 'Ingresado', 'Listo'] as const).map(estado => (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filtroEstado === estado
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-950/50 border border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>

            {vehiculosFiltrados.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-700 rounded-3xl p-10 text-center">
                <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  {busqueda || filtroEstado !== 'Todos' 
                    ? 'No se encontraron vehículos con estos filtros'
                    : 'No hay vehículos en el patio'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehiculosFiltrados.map(vehiculo => (
                  <div key={vehiculo.id} className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5 space-y-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl font-black text-white font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-700">
                            {vehiculo.patente}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vehiculo.estado === 'Ingresado' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {vehiculo.estado}
                          </span>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {calcularTiempoEnPatio(vehiculo.horaIngreso)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">{vehiculo.marcaModelo} · {vehiculo.color}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {vehiculo.cliente}
                          {vehiculo.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {vehiculo.telefono}
                            </span>
                          )}
                        </p>
                        {vehiculo.fotos && vehiculo.fotos.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            <ImageIcon className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-slate-500">{vehiculo.fotos.length} foto(s)</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-blue-300">{formatMoney(vehiculo.precio)}</p>
                        <p className="text-xs text-slate-500 mt-1">⏰ {vehiculo.horaIngreso}</p>
                        <p className="text-xs text-slate-600 mt-1">{vehiculo.empleado}</p>
                      </div>
                    </div>

                    {/* Estados */}
                    <div className="flex flex-wrap gap-2">
                      {(['Ingresado', 'Listo'] as const).map(estado => (
                        <button
                          key={estado}
                          onClick={() => actualizarEstado(vehiculo.id, estado)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            vehiculo.estado === estado
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-950/50 border border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {estado}
                        </button>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      {user !== 'empleado' && (
                        <button
                          onClick={() => iniciarEdicion(vehiculo)}
                          className="flex-1 min-w-[100px] p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Editar</span>
                        </button>
                      )}
                      {vehiculo.telefono && (
                        <button
                          onClick={() => enviarWhatsApp(vehiculo)}
                          className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setVehiculoQR(vehiculo);
                          setMostrarQR(true);
                        }}
                        className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors"
                        title="Ver QR"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      {user !== 'empleado' && (
                        <button
                          onClick={() => eliminarVehiculo(vehiculo.id)}
                          className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANTALLA RETIRO DE VEHÍCULO */}
        {pantalla === 'retiro' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Retiro de Vehículo</h2>
              <button
                onClick={() => setPantalla('inicio')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Escaner QR */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Escanear Código QR</h3>
              
              {escanerActivo ? (
                <div className="space-y-4">
                  <div id="qr-reader" className="rounded-2xl overflow-hidden border border-slate-700 shadow-inner"></div>
                  <button
                    onClick={detenerEscaneoQR}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-colors"
                  >
                    Detener Escaneo
                  </button>
                </div>
              ) : (
                <button
                  onClick={iniciarEscaneoQR}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Camera className="w-5 h-5" />
                  ESCANEAR QR
                </button>
              )}
            </div>

            {/* Búsqueda por patente */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="px-4 text-xs text-slate-500 font-bold uppercase">o buscar por patente</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">Búsqueda Manual</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busquedaPatente}
                  onChange={(e) => setBusquedaPatente(e.target.value.toUpperCase())}
                  placeholder="PATENTE"
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={buscarPorPatente}
                  className="px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Vehículo seleccionado para entrega */}
            {vehiculoSeleccionado && (
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-2 border-emerald-500/30 rounded-3xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between pb-4 border-b border-emerald-500/20">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      Listo para entrega
                    </span>
                    <h4 className="text-2xl font-black text-white mt-2">
                      Vehículo #{vehiculoSeleccionado.id.slice(-6)}
                    </h4>
                  </div>
                  <button
                    onClick={() => setVehiculoSeleccionado(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Patente</p>
                    <p className="text-lg font-black text-white font-mono">{vehiculoSeleccionado.patente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Cliente</p>
                    <p className="text-lg font-bold text-white">{vehiculoSeleccionado.cliente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Servicio</p>
                    <p className="text-sm font-bold text-slate-200">{vehiculoSeleccionado.servicio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Ingreso</p>
                    <p className="text-sm font-bold text-slate-200">{vehiculoSeleccionado.horaIngreso} hs</p>
                  </div>
                </div>

                {/* Consumos adicionales del bar y cosmética si los tiene */}
                {((vehiculoSeleccionado.productosBar && vehiculoSeleccionado.productosBar.length > 0) || 
                  (vehiculoSeleccionado.productosCosmeticos && vehiculoSeleccionado.productosCosmeticos.length > 0)) && (
                  <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
                    <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Consumos adicionales</p>
                    {vehiculoSeleccionado.productosBar?.map((p, idx) => (
                      <div key={`checkout-bar-${idx}`} className="flex justify-between text-slate-400">
                        <span>☕ {p.nombre}</span>
                        <span>{formatMoney(p.precio)}</span>
                      </div>
                    ))}
                    {vehiculoSeleccionado.productosCosmeticos?.map((p, idx) => (
                      <div key={`checkout-cos-${idx}`} className="flex justify-between text-slate-400">
                        <span>✨ {p.nombre}</span>
                        <span>{formatMoney(p.precio)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Forma de Pago */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 uppercase font-black tracking-wider">Forma de Pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Efectivo', 'Tarjeta', 'Transferencia', 'Mixto'].map((met) => {
                      const isSel = checkoutMetodoPago === met;
                      return (
                        <button
                          key={met}
                          type="button"
                          onClick={() => setCheckoutMetodoPago(met)}
                          className={`py-3 px-2 rounded-xl text-center border font-bold text-xs uppercase transition-all duration-200 ${
                            isSel 
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' 
                              : 'bg-slate-900/50 border-white/10 text-slate-300 hover:bg-slate-900'
                          }`}
                        >
                          {met}
                        </button>
                      );
                    })}
                  </div>
                  {checkoutMetodoPago === 'Mixto' && (
                    <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Detalle de pago mixto / Otro</label>
                      <input 
                        type="text"
                        value={checkoutMetodoPagoCustom}
                        onChange={(e) => setCheckoutMetodoPagoCustom(e.target.value)}
                        placeholder="Ej: Efectivo + Transferencia"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  )}
                </div>

                {/* Descuento */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 uppercase font-black tracking-wider">Descuento</p>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCheckoutDescuentoTipo('$')}
                        className={`px-3 py-2 font-bold text-xs ${checkoutDescuentoTipo === '$' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        $
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutDescuentoTipo('%')}
                        className={`px-3 py-2 font-bold text-xs ${checkoutDescuentoTipo === '%' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        %
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={checkoutDescuento || ''}
                      onChange={(e) => setCheckoutDescuento(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="Monto de descuento"
                      className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Resumen Final */}
                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatMoney(vehiculoSeleccionado.precio + (vehiculoSeleccionado.descuento || 0))}</span>
                  </div>
                  {calcularCheckoutMontoDescuento() > 0 && (
                    <div className="flex justify-between text-xs text-red-400">
                      <span>Descuento aplicado:</span>
                      <span>-{formatMoney(calcularCheckoutMontoDescuento())}</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total a Cobrar:</span>
                    <span className="text-2xl font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">{formatMoney(calcularCheckoutTotal())}</span>
                  </div>
                </div>

                <button
                  onClick={() => entregarVehiculo(vehiculoSeleccionado)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  COBRAR Y ENTREGAR VEHÍCULO
                </button>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA REPORTES */}
        {pantalla === 'reportes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Reportes del Día</h2>
              <button
                onClick={() => setPantalla('inicio')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Google Sheets Modal Trigger en Reportes */}
            {isAdmin && (
              <button
                onClick={() => setMostrarGoogleSheets(true)}
                className="w-full bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/40 text-white font-bold py-4 px-6 rounded-3xl flex items-center justify-between group transition-all active:scale-[0.98] mb-4"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-purple-300" />
                  <div className="text-left">
                    <p className="font-black text-purple-100">Google Sheets</p>
                    <p className="text-xs text-purple-300/70 font-normal">Sincronización en la nube y configuración</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Estadísticas del día */}
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">Resumen de Ventas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Total Entregados</p>
                  <p className="text-3xl font-black text-white">{vehiculosEntregados.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Recaudado</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {formatMoney(vehiculosEntregados.reduce((sum, v) => sum + v.precio, 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de entregados */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Vehículos Entregados Hoy</h3>
              
              {vehiculosEntregados.length === 0 ? (
                <div className="bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Aún no hay vehículos entregados</p>
                </div>
              ) : (
                vehiculosEntregados.map(vehiculo => (
                  <div key={vehiculo.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black text-white font-mono">{vehiculo.patente}</p>
                        <p className="text-sm text-slate-400">{vehiculo.cliente}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {vehiculo.horaIngreso} → {vehiculo.horaSalida}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-400">{formatMoney(vehiculo.precio)}</p>
                        <p className="text-xs text-slate-500">{vehiculo.metodoPago}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Registro de Ediciones */}
            <div className="space-y-3 pb-8">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Registro de Edición</h3>
              {edicionesDelDia.length === 0 ? (
                <div className="bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                  <Edit2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No hay ediciones registradas hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {edicionesDelDia.map(edicion => (
                    <div key={edicion.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-sm">
                          {edicion.patente} {edicion.tipo === 'eliminar' && <span className="text-red-400 font-normal text-xs ml-1">(Eliminado)</span>}
                        </p>
                        <p className="text-xs text-slate-400">
                          {edicion.tipo === 'eliminar' ? 'Eliminado por: ' : 'Editado por: '}
                          <span className="font-semibold text-slate-300">{edicion.usuario}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{edicion.hora} hs</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIRMACIÓN QR */}
      {mostrarQR && vehiculoQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">¡Vehículo Ingresado!</span>
                </div>
                <h3 className="text-xl font-black text-white">Código de Retiro</h3>
              </div>
              <button
                onClick={() => {
                  setMostrarQR(false);
                  setPantalla('inicio');
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Código QR */}
            <div className="bg-white p-6 rounded-2xl flex items-center justify-center">
              <QRCode value={vehiculoQR.id} size={200} />
            </div>

            {/* Detalles del vehículo */}
            <div className="bg-slate-950/50 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Patente</p>
                  <p className="text-lg font-black text-white font-mono">{vehiculoQR.patente}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Cliente</p>
                  <p className="text-lg font-bold text-slate-200">{vehiculoQR.cliente}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Servicio</p>
                  <p className="font-bold text-slate-200">{vehiculoQR.servicio}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Precio</p>
                  <p className="text-lg font-black text-blue-400">{formatMoney(vehiculoQR.precio)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Hora Ingreso</p>
                  <p className="font-bold text-slate-200">{vehiculoQR.horaIngreso}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Empleado</p>
                  <p className="font-bold text-slate-200">{vehiculoQR.empleado}</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              {vehiculoQR.telefono && (
                <button
                  onClick={() => enviarWhatsApp(vehiculoQR)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Send className="w-5 h-5" />
                  ENVIAR POR WHATSAPP
                </button>
              )}

              <button
                onClick={() => {
                  setMostrarQR(false);
                  setPantalla('inicio');
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Check className="w-5 h-5" />
                ACEPTAR
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              Escanea este código QR al momento de retirar el vehículo
            </p>
          </div>
        </div>
      )}

      {/* MODAL GOOGLE SHEETS */}
      {mostrarGoogleSheets && (
        <GoogleSheetsConfig
          onClose={() => setMostrarGoogleSheets(false)}
          onConnectionChange={(connected) => setGoogleSheetsConectado(connected)}
          onSyncComplete={() => {
            // Recargar datos después de sincronizar
            const savedEnPatio = localStorage.getItem('gowash-mobile-patio');
            if (savedEnPatio) setVehiculosEnPatio(JSON.parse(savedEnPatio));

            const savedEntregados = localStorage.getItem('gowash-mobile-entregados');
            if (savedEntregados) setVehiculosEntregados(JSON.parse(savedEntregados));
          }}
        />
      )}

      {/* NAVEGACIÓN INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-700/50 px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setPantalla('inicio')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              pantalla === 'inicio'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
          </button>

          <button
            onClick={() => setPantalla('ingreso')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              pantalla === 'ingreso'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ingreso</span>
          </button>

          <button
            onClick={() => setPantalla('vehiculos')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              pantalla === 'vehiculos'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Patio</span>
          </button>

          <button
            onClick={() => setPantalla('retiro')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              pantalla === 'retiro'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Retiro</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setPantalla('reportes')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                pantalla === 'reportes'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Reportes</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
