import { useState, useEffect, useMemo } from 'react';
import { Price } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Car } from 'lucide-react';
import { googleSheetsSync } from '../lib/googleSheetsSync';


declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string>;
      validateLicense: (key: string) => Promise<boolean>;
      selectImage: () => Promise<string | null>;
    };
  }
}

// Interfaces
interface Venta {
  id: string;
  fecha: string;
  hora: string;
  horaEntrada: string;
  horaSalida: string;
  empleado: string;
  patente: string;
  cliente: string;
  lavado: number;
  bar: number;
  cosmeticos: number;
  total: number;
  metodoPago: string;
  numeroCliente?: string;
  estadia?: boolean;
  horasEstadia?: number;
  precioEstadia?: number;
  descuento: number;
  productosBar: ProductoVenta[];
  productosCosmeticos: ProductoVenta[];
  servicio?: string;
  descLavadero?: boolean;
  descBar?: boolean;
  descCosmetica?: boolean;
  marca?: string;
  modelo?: string;
  tamano?: string;
  imageUrl?: string;
}

interface VentaAnulada extends Venta {
  motivoAnulacion: string;
  fechaAnulacion: string;
}

interface ProductoVenta {
  nombre: string;
  precio: number;
}

interface Cosmetico {
  nombre: string;
  contenido: string;
  pvp: number;
  stock?: number;
}

interface ProductoBar {
  group: string;
  name: string;
  value: number;
  stock?: number;
}

interface ServicioLavado {
  nombre: string;
  precio: number;
}

// Datos iniciales por defecto
const DEFAULT_COSMETICOS: Cosmetico[] = [
  { nombre: "Aromatizante Walker", contenido: "10 g", pvp: 2164 },
  { nombre: "Estrellas", contenido: "7g", pvp: 1623 },
  { nombre: "Bolitas", contenido: "", pvp: 1623 },
  { nombre: "Atomizadores", contenido: "60 cm3", pvp: 7303 },
  { nombre: "Atomizadores Linea Gold", contenido: "60 cm³", pvp: 7303 },
  { nombre: "Atomizadores", contenido: "120 cm3", pvp: 11360 },
  { nombre: "Fragancia Uso Profesional", contenido: "250 cm3", pvp: 13524 },
  { nombre: "Fragancia Uso Profesional", contenido: "500 cm3", pvp: 24344 },
  { nombre: "Fragancia Uso Profesional", contenido: "5L", pvp: 240463 },
  { nombre: "Perfumina para Ropa", contenido: "200 cm3", pvp: 5031 },
  { nombre: "Mini Latita Walker (Frag. Sólida Gel)", contenido: "40 g", pvp: 8652 },
  { nombre: "Latita Walker (Frag. Sólida Gel)", contenido: "80 g", pvp: 12977 },
  { nombre: "Latita Walker Camión (Frag. Sólida Gel)", contenido: "200 g", pvp: 30280 },
  { nombre: "Walker Electric", contenido: "3,2 cm3", pvp: 16229 },
  { nombre: "Walker Electric Repuesto", contenido: "3,2 cm3", pvp: 5151 },
  { nombre: "Fragancia Climatizador", contenido: "120 cm3", pvp: 5139 },
  { nombre: "Walker Cubo", contenido: "8 cm3", pvp: 7574 },
  { nombre: "Walker Cubo Repuesto", contenido: "8 cm3", pvp: 4598 },
  { nombre: "Walker Mini Cubo", contenido: "4 cm3", pvp: 4057 },
  { nombre: "Yony Walker", contenido: "10 g", pvp: 2543 },
  { nombre: "Walker Sport", contenido: "7 cm3", pvp: 8061 },
  { nombre: "Walker Sport Repuesto", contenido: "7 cm3", pvp: 4923 },
  { nombre: "Magic Walker", contenido: "5 cm3", pvp: 7574 },
  { nombre: "Aromatizante Rejilla Minigitorio", contenido: "", pvp: 3787 },
  { nombre: "Leblon Look - Difusor Bamboo", contenido: "60 cm3", pvp: 6492 },
  { nombre: "Leblon Look - Aceite Esencial", contenido: "30 cm3", pvp: 4113 },
  { nombre: "Bolsita Perfumada Walker", contenido: "", pvp: 3279 },
  { nombre: "Walker Jack", contenido: "", pvp: 8219 },
  { nombre: "Walker Perfume Amb. Aerosol", contenido: "150 cm³", pvp: 8219 },
  { nombre: "Aromatizante Stick", contenido: "", pvp: 1437 },
  { nombre: "Neutralizador de Olores", contenido: "360 cm³", pvp: 9314 },
  { nombre: "Aerosol Dispenser Para Difusor Automatico", contenido: "185 g", pvp: 8115 },
  { nombre: "Citronela Aerosol", contenido: "360 cm³", pvp: 8898 },
  { nombre: "Silicona Perfumada", contenido: "120 cm³", pvp: 6537 },
  { nombre: "Silicona Perfumada", contenido: "250 cm³", pvp: 11992 },
  { nombre: "Silicona Perfumada", contenido: "500 cm³", pvp: 20286 },
  { nombre: "Silicona Perfumada", contenido: "5 L", pvp: 167702 },
  { nombre: "Renovador Siliconado Perfumado", contenido: "5 L", pvp: 97024 },
  { nombre: "Silicona Perfumada Economica", contenido: "5 L", pvp: 138534 },
  { nombre: "Silicona Pura 100%", contenido: "120 cm³", pvp: 16680 },
  { nombre: "Silicona Pura 100%", contenido: "250 cm³", pvp: 33360 },
  { nombre: "Silicona Perfumada Aerosol", contenido: "400 cm³", pvp: 9016 },
  { nombre: "Renovador Multiproposito Aerosol", contenido: "400 cm³", pvp: 9467 },
  { nombre: "Emulsion Silicona Power en Spray", contenido: "110 cm³", pvp: 8115 },
  { nombre: "Emulsión Perfumada", contenido: "250 cm³", pvp: 9016 },
  { nombre: "Emulsión Perfumada", contenido: "500 cm³", pvp: 14426 },
  { nombre: "Emulsion Perfumada en Spray", contenido: "500 cm³", pvp: 17221 },
  { nombre: "Revividor de Negro", contenido: "250 cm3", pvp: 5840 },
  { nombre: "Revividor de Negro Brillante en Gel", contenido: "250 cm3", pvp: 6455 },
  { nombre: "Revividor de Negro", contenido: "500 cm3", pvp: 7254 },
  { nombre: "Revividor de Negro Brillante en Gel", contenido: "500 cm3", pvp: 8299 },
  { nombre: "Desengrasante en Spray", contenido: "500 cm3", pvp: 9738 },
  { nombre: "Desengrasante", contenido: "5 L", pvp: 34294 },
  { nombre: "Desengrasante en Balde c/Pico Vertedor", contenido: "20 L", pvp: 137948 },
  { nombre: "Quitainsectos en Spray", contenido: "500 cm3", pvp: 8115 },
  { nombre: "Shampoo Siliconado", contenido: "250 cm3", pvp: 5193 },
  { nombre: "Shampoo Siliconado", contenido: "500 cm3", pvp: 6600 },
  { nombre: "Antiempañante", contenido: "60 cm3", pvp: 10116 },
  { nombre: "Lavaparabrisas", contenido: "250 cm3", pvp: 6492 },
  { nombre: "Lavaparabrisas", contenido: "500 cm3", pvp: 8926 },
  { nombre: "Lavaparabrisas Concentrado", contenido: "50 cm3", pvp: 2975 },
  { nombre: "Lavaparabrisas Concentrado", contenido: "120 cm3", pvp: 4328 },
  { nombre: "Limpiacristales en Spray", contenido: "500 cm3", pvp: 12442 },
  { nombre: "Quitaescarcha en Spray", contenido: "500 cm3", pvp: 11360 },
  { nombre: "Cera", contenido: "250 cm3", pvp: 5410 },
  { nombre: "Cera", contenido: "500 cm3", pvp: 6492 },
  { nombre: "Cera", contenido: "5L", pvp: 47219 },
  { nombre: "Cera Polish Clásica Protectora (Etiqueta Roja)", contenido: "450 cm3", pvp: 7303 },
  { nombre: "Cera Polish Lustre Intenso (Etiqueta Azul)", contenido: "450 cm3", pvp: 7303 },
  { nombre: "Cera Polish con Abrasivo (Etiqueta Amarilla)", contenido: "450 cm3", pvp: 7303 },
  { nombre: "Lubricante Aerosol W-400", contenido: "400 cm3", pvp: 6762 },
  { nombre: "Lubricante Aerosol W-400", contenido: "240 cm3", pvp: 5680 },
  { nombre: "Estopa de Algodón para Lustre", contenido: "300 g", pvp: 1385 },
  { nombre: "Estopa de Algodón para Limpieza", contenido: "300 g", pvp: 1212 },
  { nombre: "Rejillas Triples", contenido: "", pvp: 3635 },
  { nombre: "Rejilla Profesional", contenido: "", pvp: 4328 },
  { nombre: "Gamuza Sintética", contenido: "", pvp: 3461 },
  { nombre: "Franelas", contenido: "", pvp: 2121 },
  { nombre: "Paño Lustre Siliconado", contenido: "", pvp: 3895 },
  { nombre: "Cepillo Lavaauto", contenido: "", pvp: 3246 },
  { nombre: "Cepillo Camiones", contenido: "", pvp: 5410 },
  { nombre: "Cepillo para Llanta", contenido: "", pvp: 4090 },
  { nombre: "Cepillo Barredendero Grandes Superficies", contenido: "", pvp: 17311 },
  { nombre: "Limpiacontactos Aerosol", contenido: "360 cm3", pvp: 7328 },
  { nombre: "Inflador - Sellador Aerosol SOS Auto", contenido: "400 cm3", pvp: 17311 },
  { nombre: "Inflador - Sellador Aerosol SOS Moto", contenido: "240 cm3", pvp: 14065 }
];

const DEFAULT_BAR_PRODUCTS: ProductoBar[] = [
  { group: "Cafetería", name: "Café Negro Posillo", value: 3000 },
  { group: "Cafetería", name: "Café Negro Jarrito", value: 3000 },
  { group: "Cafetería", name: "Café Negro Doble (Americano)", value: 3500 },
  { group: "Cafetería", name: "Café Cortado Jarrito", value: 3500 },
  { group: "Cafetería", name: "Café Lagrima Jarrito", value: 3500 },
  { group: "Cafetería", name: "Café con Leche", value: 4000 },
  { group: "Cafetería", name: "Té (en tetera)", value: 3000 },
  { group: "Cafetería", name: "Té con Leche", value: 3500 },
  { group: "Bebidas", name: "CocaCola 500 cc", value: 2300 },
  { group: "Bebidas", name: "CocaCola Light 500 cc", value: 2300 },
  { group: "Bebidas", name: "Sprite 500 cc", value: 2300 },
  { group: "Bebidas", name: "Sprite Zero 500 cc", value: 2300 },
  { group: "Bebidas", name: "Fanta 500 cc", value: 2300 },
  { group: "Bebidas", name: "SmartWater 500 cc", value: 2000 },
  { group: "Bebidas", name: "SmartW C/Gas 500 cc", value: 2000 },
  { group: "Bebidas", name: "Powerade 500 cc", value: 2000 },
  { group: "Bebidas", name: "Levite Manzana 500 cc", value: 2000 },
  { group: "Bebidas", name: "Levite Pomelo 500 cc", value: 2000 },
  { group: "Bebidas", name: "Aquarius Pera 500 cc", value: 2000 },
  { group: "Comidas", name: "Super Pancho Simple", value: 2000 },
  { group: "Comidas", name: "Super Pancho Completo", value: 2000 },
  { group: "Comidas", name: "Tostado doble de JyQ", value: 6500 },
  { group: "Comidas", name: "Tostado Árabe", value: 6500 },
  { group: "Comidas", name: "Medialuna de Manteca", value: 1200 },
  { group: "Comidas", name: "Alfajor Maicena", value: 2000 },
  { group: "Comidas", name: "Alfajor Chocolate", value: 2000 },
  { group: "Comidas", name: "Alfajor RASTA", value: 2000 },
  { group: "Comidas", name: "Donas rellenas", value: 2500 },
  { group: "Comidas", name: "Muffins", value: 3500 },
  { group: "Comidas", name: "Waffle de JyQ", value: 5500 },
  { group: "Promos", name: "Café con leche + 2 medialunas", value: 7600 },
  { group: "Promos", name: "Café con leche + Tostado árabe", value: 9450 },
  { group: "Promos", name: "Café con leche + Waffle JyQ", value: 8550 },
  { group: "Promos", name: "Café con leche + Muffin", value: 6750 },
  { group: "Promos", name: "Café con leche + Donas", value: 5850 },
  { group: "Cervezas", name: "BlueMoon 330 cc", value: 5500 },
  { group: "Cervezas", name: "Heineken 330 cc", value: 4000 },
  { group: "Cervezas", name: "STELLA 330 cc", value: 3000 },
  { group: "Cervezas", name: "SOL 330 cc", value: 3400 },
  { group: "Cervezas", name: "MILLER 330 cc", value: 3000 },
  { group: "Cervezas", name: "BRAHMA 473 cc", value: 3000 },
  { group: "Cervezas", name: "Heineken 473 cc", value: 3500 },
  { group: "Cervezas", name: "Imperial Gold 473 cc", value: 3200 },
  { group: "Cervezas", name: "AMSTEL 473 cc", value: 3200 },
  { group: "Cervezas", name: "Schneider 473 cc", value: 2600 },
  { group: "Cervezas", name: "CORONA 330 cc", value: 3000 }
];

const DEFAULT_SERVICIOS_LAVADO: ServicioLavado[] = [
  { nombre: "Lavado Básico", precio: 15000 },
  { nombre: "Lavado Premium", precio: 25000 },
  { nombre: "Lavado Premium + Encerado", precio: 35000 },
  { nombre: "Lavado Completo", precio: 45000 },
  { nombre: "Detailing Completo", precio: 80000 }
];

export function POS({ prices = [] }: { prices?: Price[] }) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ordenesAbiertas, setOrdenesAbiertas] = useState<Venta[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [productosBar, setProductosBar] = useState<ProductoVenta[]>([]);
  const [productosCosmeticos, setProductosCosmeticos] = useState<ProductoVenta[]>([]);
  const [ventasAnuladas, setVentasAnuladas] = useState<VentaAnulada[]>([]);
  const [washCounts, setWashCounts] = useState<Record<string, number>>({});

  // Precios editables
  const [cosmeticosData, setCosmeticosData] = useState<Cosmetico[]>([]);
  const [barProductsData, setBarProductsData] = useState<ProductoBar[]>([]);
  const [serviciosLavado, setServiciosLavado] = useState<ServicioLavado[]>([]);

  // Form fields
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [patente, setPatente] = useState('');
  const [cliente, setCliente] = useState('');
  const [lavado, setLavado] = useState(0);
  const [servicio, setServicio] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [estadia, setEstadia] = useState(false);
  const [horasEstadia, setHorasEstadia] = useState(1);
  const [precioEstadia, setPrecioEstadia] = useState(0);

  // Estados de Descuento
  const [descLavadero, setDescLavadero] = useState(true);
  const [descBar, setDescBar] = useState(true);
  const [descCosmetica, setDescCosmetica] = useState(true);

  // Calcula si debe habilitarse la estadía (> 1 hora)
  const puedeEstadia = () => {
    if (!horaEntrada || !horaSalida) return false;
    const [hE, mE] = horaEntrada.split(':').map(Number);
    const [hS, mS] = horaSalida.split(':').map(Number);
    const diffMins = (hS * 60 + mS) - (hE * 60 + mE);
    return diffMins > 60;
  };

  // Estado para búsqueda de productos
  const [searchBar, setSearchBar] = useState('');
  const [searchCosmeticos, setSearchCosmeticos] = useState('');

  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // Estados para búsqueda de vehículos
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Price | null>(null);

  // Estados para anulación
  const [showAnulacionDialog, setShowAnulacionDialog] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [itemAAnular, setItemAAnular] = useState<{ id: string, type: 'venta' | 'orden' } | null>(null);
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);

  // Estados para Consumo de Empleados
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);
  const [consumosEmpleados, setConsumosEmpleados] = useState<Record<string, ProductoVenta[]>>({});
  const [empleadoConsumoSeleccionado, setEmpleadoConsumoSeleccionado] = useState<string | null>(null);
  const [nuevoEmpleadoNombre, setNuevoEmpleadoNombre] = useState('');
  const [descuentoEmpleadoConsumo, setDescuentoEmpleadoConsumo] = useState(0);

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedVentas = localStorage.getItem('gowash-ventas');
    const savedWashCounts = localStorage.getItem('gowash-washCounts');
    const savedCosmeticos = localStorage.getItem('gowash-cosmeticos-precios');
    const savedBar = localStorage.getItem('gowash-bar-precios');
    const savedLavado = localStorage.getItem('gowash-lavado-precios');
    const savedOrdenesAbiertas = localStorage.getItem('gowash-ordenes-abiertas');

    const savedAnuladas = localStorage.getItem('gowash-ventas-anuladas');
    const savedListaEmpleados = localStorage.getItem('gowash-lista-empleados');
    const savedConsumosEmpleados = localStorage.getItem('gowash-consumos-empleados');

    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedAnuladas) setVentasAnuladas(JSON.parse(savedAnuladas));
    if (savedListaEmpleados) setListaEmpleados(JSON.parse(savedListaEmpleados));
    if (savedConsumosEmpleados) setConsumosEmpleados(JSON.parse(savedConsumosEmpleados));
    if (savedOrdenesAbiertas) setOrdenesAbiertas(JSON.parse(savedOrdenesAbiertas));
    if (savedWashCounts) setWashCounts(JSON.parse(savedWashCounts));
    if (savedCosmeticos) {
      const parsed = JSON.parse(savedCosmeticos);
      setCosmeticosData(parsed.map((c: any) => ({ ...c, stock: c.stock ?? 10 })));
    } else {
      setCosmeticosData(DEFAULT_COSMETICOS.map(c => ({ ...c, stock: 10 })));
    }
    
    if (savedBar) {
      const parsed = JSON.parse(savedBar);
      setBarProductsData(parsed.map((p: any) => ({ ...p, stock: p.stock ?? 10 })));
    } else {
      setBarProductsData(DEFAULT_BAR_PRODUCTS.map(p => ({ ...p, stock: 10 })));
    }
    
    if (savedLavado) setServiciosLavado(JSON.parse(savedLavado));
    else setServiciosLavado(DEFAULT_SERVICIOS_LAVADO);

    // Establecer fecha y hora actual
    const now = new Date();
    setFecha(now.toISOString().split('T')[0]);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    setHora(timeString);
    setHoraEntrada(timeString);
    setHoraSalida(timeString);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (ventas.length > 0 || localStorage.getItem('gowash-ventas')) {
      localStorage.setItem('gowash-ventas', JSON.stringify(ventas));
    }
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem('gowash-ordenes-abiertas', JSON.stringify(ordenesAbiertas));
  }, [ordenesAbiertas]);

  useEffect(() => {
    localStorage.setItem('gowash-ventas-anuladas', JSON.stringify(ventasAnuladas));
  }, [ventasAnuladas]);

  useEffect(() => {
    localStorage.setItem('gowash-washCounts', JSON.stringify(washCounts));
  }, [washCounts]);

  useEffect(() => {
    if (cosmeticosData.length > 0) {
      localStorage.setItem('gowash-cosmeticos-precios', JSON.stringify(cosmeticosData));
    }
  }, [cosmeticosData]);

  useEffect(() => {
    if (barProductsData.length > 0) {
      localStorage.setItem('gowash-bar-precios', JSON.stringify(barProductsData));
    }
  }, [barProductsData]);

  useEffect(() => {
    if (serviciosLavado.length > 0) {
      localStorage.setItem('gowash-lavado-precios', JSON.stringify(serviciosLavado));
    }
  }, [serviciosLavado]);

  useEffect(() => {
    localStorage.setItem('gowash-lista-empleados', JSON.stringify(listaEmpleados));
  }, [listaEmpleados]);

  useEffect(() => {
    localStorage.setItem('gowash-consumos-empleados', JSON.stringify(consumosEmpleados));
  }, [consumosEmpleados]);

  // Recalcular descuento dinámicamente si hay porcentaje y cambian los items o alcances
  useEffect(() => {
    if (descuentoPorcentaje > 0) {
      let base = 0;
      if (descLavadero) base += lavado;
      if (descBar) base += productosBar.reduce((sum, p) => sum + p.precio, 0);
      if (descCosmetica) base += productosCosmeticos.reduce((sum, p) => sum + p.precio, 0);
      setDescuento((base * descuentoPorcentaje) / 100);
    }
  }, [lavado, productosBar, productosCosmeticos, descLavadero, descBar, descCosmetica, descuentoPorcentaje]);

  const formatMoney = (amount: number) => {
    return `$${parseFloat(amount.toString()).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calcularTotalBar = () => {
    return productosBar.reduce((sum, p) => sum + p.precio, 0);
  };

  const calcularTotalCosmeticos = () => {
    return productosCosmeticos.reduce((sum, p) => sum + p.precio, 0);
  };

  const calcularSubtotal = () => {
    return lavado + calcularTotalBar() + calcularTotalCosmeticos() + (estadia ? precioEstadia : 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - descuento;
  };

  const agregarProductoBar = (nombre: string, precio: number) => {
    setProductosBar([...productosBar, { nombre, precio }]);
  };

  const eliminarProductoBar = (index: number) => {
    setProductosBar(productosBar.filter((_, i) => i !== index));
  };

  const agregarCosmetico = (nombre: string, precio: number) => {
    setProductosCosmeticos([...productosCosmeticos, { nombre, precio }]);
  };

  const eliminarCosmetico = (index: number) => {
    setProductosCosmeticos(productosCosmeticos.filter((_, i) => i !== index));
  };

  const actualizarDescuentoPorcentaje = (porcentaje: number) => {
    setDescuentoPorcentaje(porcentaje);
    if (porcentaje === 0) setDescuento(0);
  };

  const registrarVenta = () => {
    if (!fecha || !hora || !empleado) {
      alert('Por favor completa Fecha, Hora y Empleado');
      return;
    }

    const totalBar = calcularTotalBar();
    const totalCosmeticos = calcularTotalCosmeticos();
    const total = calcularTotal();

    let newWashCounts = { ...washCounts };
    const currentCount = washCounts[patente] || 0;
    const esGratis = patente && currentCount % 6 === 5;

    if (patente && (lavado > 0 || esGratis)) {
      newWashCounts[patente] = currentCount + 1;
    }

    const nuevaVenta: Venta = {
      id: Date.now().toString(),
      fecha,
      hora,
      horaEntrada,
      horaSalida,
      empleado,
      patente,
      cliente,
      numeroCliente,
      lavado: esGratis ? 0 : lavado,
      bar: totalBar,
      cosmeticos: totalCosmeticos,
      total: esGratis ? (totalBar + totalCosmeticos) : total,
      metodoPago,
      estadia: puedeEstadia() ? estadia : false,
      horasEstadia: puedeEstadia() && estadia ? horasEstadia : undefined,
      precioEstadia: puedeEstadia() && estadia ? precioEstadia : undefined,
      descuento: esGratis ? 0 : descuento,
      productosBar: [...productosBar],
      productosCosmeticos: [...productosCosmeticos],
      servicio: esGratis ? `GRATIS - ${servicio}` : servicio,
      marca: vehiculoSeleccionado?.brand,
      modelo: vehiculoSeleccionado?.model,
      tamano: vehiculoSeleccionado?.size,
      imageUrl: vehiculoSeleccionado?.imageUrl
    };

    // Actualizar stock
    const newBarData = [...barProductsData];
    productosBar.forEach(p => {
      const prod = newBarData.find(bp => bp.name === p.nombre);
      if (prod) prod.stock = (prod.stock || 0) - 1;
    });
    setBarProductsData(newBarData);

    const newCosmeticosData = [...cosmeticosData];
    productosCosmeticos.forEach(p => {
      const prod = newCosmeticosData.find(c => {
         const displayName = c.contenido ? `${c.nombre} (${c.contenido})` : c.nombre;
         return displayName === p.nombre;
      });
      if (prod) prod.stock = (prod.stock || 0) - 1;
    });
    setCosmeticosData(newCosmeticosData);

    if (activeOrderId) {
      setOrdenesAbiertas(ordenesAbiertas.filter(o => o.id !== activeOrderId));
    }

    if (editingVentaId) {
      // Es una actualización
      const nuevasVentas = ventas.map(v => v.id === editingVentaId ? nuevaVenta : v);
      setVentas(nuevasVentas);
      localStorage.setItem('gowash-ventas', JSON.stringify(nuevasVentas));
      
      // Sincronizar actualización con Google Sheets
      googleSheetsSync.syncUpdateVenta(nuevaVenta);
    } else {
      // Es una venta nueva
      const nuevasVentas = [nuevaVenta, ...ventas];
      setVentas(nuevasVentas);
      localStorage.setItem('gowash-ventas', JSON.stringify(nuevasVentas));

      // Actualizar contador de lavados (solo en ventas nuevas)
      if (patente) {
        const currentCount = washCounts[patente] || 0;
        const newCounts = { ...washCounts, [patente]: currentCount + 1 };
        setWashCounts(newCounts);
        localStorage.setItem('gowash-washCounts', JSON.stringify(newCounts));
      }

      // Sincronizar con Google Sheets
      googleSheetsSync.syncVenta(nuevaVenta);
    }

    limpiarFormulario();
  };

  const guardarOrdenEnProgreso = () => {
    if (!patente && !cliente) {
      alert('Por favor ingresa al menos la Patente o el nombre del Cliente para guardar la orden.');
      return;
    }

    const totalBar = calcularTotalBar();
    const totalCosmeticos = calcularTotalCosmeticos();
    const total = calcularTotal();

    const orden: Venta = {
      id: activeOrderId || Date.now().toString(),
      fecha,
      hora,
      horaEntrada,
      horaSalida,
      empleado,
      patente,
      cliente,
      numeroCliente,
      lavado,
      bar: totalBar,
      cosmeticos: totalCosmeticos,
      total,
      metodoPago,
      estadia,
      horasEstadia,
      precioEstadia,
      descuento,
      productosBar: [...productosBar],
      productosCosmeticos: [...productosCosmeticos],
      servicio,
      descLavadero,
      descBar,
      descCosmetica,
      marca: vehiculoSeleccionado?.brand,
      modelo: vehiculoSeleccionado?.model,
      tamano: vehiculoSeleccionado?.size,
      imageUrl: vehiculoSeleccionado?.imageUrl
    };

    if (activeOrderId) {
      setOrdenesAbiertas(ordenesAbiertas.map(o => o.id === activeOrderId ? orden : o));
    } else {
      setOrdenesAbiertas([...ordenesAbiertas, orden]);
    }

    limpiarFormulario();
  };

  const cargarOrden = (orden: Venta) => {
    setActiveOrderId(orden.id);
    setFecha(orden.fecha);
    setHora(orden.hora);
    setHoraEntrada(orden.horaEntrada);
    setHoraSalida(orden.horaSalida);
    setEmpleado(orden.empleado);
    setPatente(orden.patente);
    setCliente(orden.cliente);
    setNumeroCliente(orden.numeroCliente || '');
    setLavado(orden.lavado);
    setServicio(orden.servicio || '');
    
    // Buscar el vehículo en la lista de precios para restaurar la selección
    if (orden.marca && orden.modelo) {
      const v = prices.find(p => p.brand === orden.marca && p.model === orden.modelo && p.service === orden.servicio);
      if (v) setVehiculoSeleccionado(v);
      else setVehiculoSeleccionado(null);
    } else {
      setVehiculoSeleccionado(null);
    }

    setDescuento(orden.descuento);
    setMetodoPago(orden.metodoPago);
    setEstadia(orden.estadia || false);
    setHorasEstadia(orden.horasEstadia || 1);
    setPrecioEstadia(orden.precioEstadia || 0);
    setProductosBar(orden.productosBar);
    setProductosCosmeticos(orden.productosCosmeticos);
    setDescLavadero(orden.descLavadero ?? true);
    setDescBar(orden.descBar ?? true);
    setDescCosmetica(orden.descCosmetica ?? true);
  };

  const limpiarFormulario = () => {
    const now = new Date();
    setFecha(now.toISOString().split('T')[0]);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    setHora(timeString);
    setHoraEntrada(timeString);
    setHoraSalida(timeString);
    setActiveOrderId(null);
    setEditingVentaId(null);
    setPatente('');
    setCliente('');
    setLavado(0);
    setServicio('');
    setDescuento(0);
    setDescuentoPorcentaje(0);
    setDescLavadero(true);
    setDescBar(true);
    setDescCosmetica(true);
    setMetodoPago('Efectivo');
    setNumeroCliente('');
    setEstadia(false);
    setHorasEstadia(1);
    setPrecioEstadia(0);
    setProductosBar([]);
    setProductosCosmeticos([]);
    setVehiculoSeleccionado(null);
    setSearchVehiculo('');
  };

  const iniciarEdicionVenta = (venta: Venta) => {
    setEditingVentaId(venta.id);
    setFecha(venta.fecha);
    setHora(venta.hora);
    setHoraEntrada(venta.horaEntrada);
    setHoraSalida(venta.horaSalida);
    setEmpleado(venta.empleado);
    setPatente(venta.patente);
    setCliente(venta.cliente);
    setLavado(venta.lavado);
    setServicio(venta.servicio || '');
    setDescuento(venta.descuento);
    setMetodoPago(venta.metodoPago);
    setNumeroCliente(venta.numeroCliente || '');
    setEstadia(venta.estadia || false);
    setHorasEstadia(venta.horasEstadia || 1);
    setPrecioEstadia(venta.precioEstadia || 0);
    setProductosBar(venta.productosBar);
    setProductosCosmeticos(venta.productosCosmeticos);
    setDescLavadero(venta.descLavadero ?? true);
    setDescBar(venta.descBar ?? true);
    setDescCosmetica(venta.descCosmetica ?? true);
    
    // Buscar el vehículo en la lista si existe
    if (venta.marca && venta.modelo) {
      const v = prices.find(p => p.brand === venta.marca && p.model === venta.modelo);
      if (v) setVehiculoSeleccionado(v);
    }

    // Scroll al tope del formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarAnulacion = () => {
    if (!motivoAnulacion) {
      alert('Debe ingresar un motivo para la anulación');
      return;
    }

    if (!itemAAnular) return;

    let item: Venta | undefined;
    if (itemAAnular.type === 'venta') {
      item = ventas.find(v => v.id === itemAAnular.id);
      if (item) {
        setVentas(ventas.filter(v => v.id !== itemAAnular.id));
      }
    } else {
      item = ordenesAbiertas.find(o => o.id === itemAAnular.id);
      if (item) {
        setOrdenesAbiertas(ordenesAbiertas.filter(o => o.id !== itemAAnular.id));
        if (activeOrderId === itemAAnular.id) limpiarFormulario();
      }
    }

    if (item) {
      const anulada: VentaAnulada = {
        ...item,
        motivoAnulacion,
        fechaAnulacion: new Date().toLocaleString('es-AR')
      };
      setVentasAnuladas([...ventasAnuladas, anulada]);
      
      // Sincronizar anulación con Google Sheets
      googleSheetsSync.syncAnulacion(anulada);
    }

    setShowAnulacionDialog(false);
    setMotivoAnulacion('');
    setItemAAnular(null);
  };

  // Funciones para Consumo de Empleados
  const agregarEmpleado = () => {
    if (!nuevoEmpleadoNombre) return;
    if (listaEmpleados.includes(nuevoEmpleadoNombre)) {
      alert('El empleado ya existe');
      return;
    }
    setListaEmpleados([...listaEmpleados, nuevoEmpleadoNombre]);
    setNuevoEmpleadoNombre('');
  };

  const eliminarEmpleado = (nombre: string) => {
    setListaEmpleados(listaEmpleados.filter(e => e !== nombre));
    const nuevosConsumos = { ...consumosEmpleados };
    delete nuevosConsumos[nombre];
    setConsumosEmpleados(nuevosConsumos);
    if (empleadoConsumoSeleccionado === nombre) setEmpleadoConsumoSeleccionado(null);
  };

  const agregarConsumoAEmpleado = (producto: ProductoBar) => {
    if (!empleadoConsumoSeleccionado) return;
    const actuales = consumosEmpleados[empleadoConsumoSeleccionado] || [];
    setConsumosEmpleados({
      ...consumosEmpleados,
      [empleadoConsumoSeleccionado]: [...actuales, { nombre: producto.name, precio: producto.value }]
    });
  };

  const eliminarConsumoEmpleado = (index: number) => {
    if (!empleadoConsumoSeleccionado) return;
    const actuales = [...(consumosEmpleados[empleadoConsumoSeleccionado] || [])];
    actuales.splice(index, 1);
    setConsumosEmpleados({
      ...consumosEmpleados,
      [empleadoConsumoSeleccionado]: actuales
    });
  };

  const liquidarConsumoEmpleado = (nombre: string) => {
    setConsumosEmpleados({
      ...consumosEmpleados,
      [nombre]: []
    });
    setDescuentoEmpleadoConsumo(0);
  };

  const eliminarVenta = (id: string) => {
    setItemAAnular({ id, type: 'venta' });
    setShowAnulacionDialog(true);
  };

  const productosFiltradosBar = barProductsData.filter(p =>
    p.name.toLowerCase().includes(searchBar.toLowerCase())
  );

  const filteredPricesList = useMemo(() => {
    if (!searchVehiculo) return [];
    const searchLower = searchVehiculo.toLowerCase();
    return prices.filter(p => {
      const brandStr = p.brand || '';
      const modelStr = p.model || '';
      return brandStr.toLowerCase().includes(searchLower) || 
             modelStr.toLowerCase().includes(searchLower);
    }).slice(0, 10);
  }, [prices, searchVehiculo]);

  const productosBarPorGrupo = productosFiltradosBar.reduce((acc, p) => {
    if (!acc[p.group]) {
      acc[p.group] = [];
    }
    acc[p.group].push(p);
    return acc;
  }, {} as Record<string, ProductoBar[]>);

  const cosmeticosFiltrados = cosmeticosData.filter(c =>
    c.nombre.toLowerCase().includes(searchCosmeticos.toLowerCase()) ||
    c.contenido.toLowerCase().includes(searchCosmeticos.toLowerCase())
  );

  const totalEfectivo = ventas.filter(v => v.metodoPago === 'Efectivo').reduce((sum, v) => sum + v.total, 0);
  const totalTransferencia = ventas.filter(v => v.metodoPago === 'Transferencia').reduce((sum, v) => sum + v.total, 0);
  const totalBilletera = ventas.filter(v => v.metodoPago === 'Billetera Virtual').reduce((sum, v) => sum + v.total, 0);
  const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0);

  // Componente de edición de precios
  const EditorPrecios = () => {
    const [adjLavadoPct, setAdjLavadoPct] = useState('');
    const [adjLavadoAmt, setAdjLavadoAmt] = useState('');
    const [adjBarPct, setAdjBarPct] = useState('');
    const [adjBarAmt, setAdjBarAmt] = useState('');
    const [adjCosPct, setAdjCosPct] = useState('');
    const [adjCosAmt, setAdjCosAmt] = useState('');

    const applyAdj = (type: 'lavado' | 'bar' | 'cosmeticos', mode: 'pct' | 'amt') => {
      if (type === 'lavado') {
        const val = parseFloat(mode === 'pct' ? adjLavadoPct : adjLavadoAmt);
        if (isNaN(val)) return;
        setServiciosLavado(serviciosLavado.map(s => ({ 
          ...s, 
          precio: mode === 'pct' ? Math.round(s.precio * (1 + val / 100)) : s.precio + val 
        })));
        mode === 'pct' ? setAdjLavadoPct('') : setAdjLavadoAmt('');
      } else if (type === 'bar') {
        const val = parseFloat(mode === 'pct' ? adjBarPct : adjBarAmt);
        if (isNaN(val)) return;
        setBarProductsData(barProductsData.map(p => ({ 
          ...p, 
          value: mode === 'pct' ? Math.round(p.value * (1 + val / 100)) : p.value + val 
        })));
        mode === 'pct' ? setAdjBarPct('') : setAdjBarAmt('');
      } else if (type === 'cosmeticos') {
        const val = parseFloat(mode === 'pct' ? adjCosPct : adjCosAmt);
        if (isNaN(val)) return;
        setCosmeticosData(cosmeticosData.map(c => ({ 
          ...c, 
          pvp: mode === 'pct' ? Math.round(c.pvp * (1 + val / 100)) : c.pvp + val 
        })));
        mode === 'pct' ? setAdjCosPct('') : setAdjCosAmt('');
      }
    };

    return (
      <div className="space-y-6">
      {/* Editor Servicios de Lavado */}
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="font-bold text-xl text-cyan-900">Servicios de Lavado</h3>
          
          <div className="flex flex-wrap gap-2 p-3 bg-white/60 rounded-xl border border-cyan-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="% +/-" 
                className="w-20 h-8 bg-white text-xs" 
                value={adjLavadoPct}
                onChange={(e) => setAdjLavadoPct(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs bg-cyan-600 text-white border-0 hover:bg-cyan-700" onClick={() => applyAdj('lavado', 'pct')}>Ajustar %</Button>
            </div>
            <div className="w-px h-8 bg-cyan-200 mx-1 hidden md:block" />
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="$ +/-" 
                className="w-24 h-8 bg-white text-xs"
                value={adjLavadoAmt}
                onChange={(e) => setAdjLavadoAmt(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-600 text-white border-0 hover:bg-blue-700" onClick={() => applyAdj('lavado', 'amt')}>Ajustar $</Button>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {serviciosLavado.map((servicio, idx) => (
            <div key={idx} className="flex gap-3 items-end bg-white p-3 rounded-lg">
              <div className="flex-1">
                <Label>Nombre del Servicio</Label>
                <Input
                  value={servicio.nombre}
                  onChange={(e) => {
                    const newServicios = [...serviciosLavado];
                    newServicios[idx].nombre = e.target.value;
                    setServiciosLavado(newServicios);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={servicio.precio}
                  onChange={(e) => {
                    const newServicios = [...serviciosLavado];
                    newServicios[idx].precio = parseFloat(e.target.value) || 0;
                    setServiciosLavado(newServicios);
                  }}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setServiciosLavado(serviciosLavado.filter((_, i) => i !== idx));
                }}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              setServiciosLavado([...serviciosLavado, { nombre: '', precio: 0 }]);
            }}
            className="w-full"
          >
            + Agregar Servicio
          </Button>
        </div>
      </Card>

      {/* Editor Productos Bar */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="font-bold text-xl text-amber-900">Productos del Bar</h3>
          
          <div className="flex flex-wrap gap-2 p-3 bg-white/60 rounded-xl border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="% +/-" 
                className="w-20 h-8 bg-white text-xs" 
                value={adjBarPct}
                onChange={(e) => setAdjBarPct(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs bg-amber-600 text-white border-0 hover:bg-amber-700" onClick={() => applyAdj('bar', 'pct')}>Ajustar %</Button>
            </div>
            <div className="w-px h-8 bg-amber-200 mx-1 hidden md:block" />
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="$ +/-" 
                className="w-24 h-8 bg-white text-xs"
                value={adjBarAmt}
                onChange={(e) => setAdjBarAmt(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs bg-orange-600 text-white border-0 hover:bg-orange-700" onClick={() => applyAdj('bar', 'amt')}>Ajustar $</Button>
            </div>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {barProductsData.map((producto, idx) => (
            <div key={idx} className="flex gap-3 items-end bg-white p-3 rounded-lg">
              <div className="flex-1">
                <Label>Categoría</Label>
                <Input
                  value={producto.group}
                  onChange={(e) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx].group = e.target.value;
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Nombre</Label>
                <Input
                  value={producto.name}
                  onChange={(e) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx].name = e.target.value;
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={producto.value}
                  onChange={(e) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx].value = parseFloat(e.target.value) || 0;
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={producto.stock ?? 0}
                  onChange={(e) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx].stock = parseInt(e.target.value, 10) || 0;
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setBarProductsData(barProductsData.filter((_, i) => i !== idx));
                }}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              setBarProductsData([...barProductsData, { group: '', name: '', value: 0, stock: 0 }]);
            }}
            className="w-full"
          >
            + Agregar Producto
          </Button>
        </div>
      </Card>

      {/* Editor Cosméticos */}
      <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="font-bold text-xl text-teal-900">Cosméticos del Automotor</h3>
          
          <div className="flex flex-wrap gap-2 p-3 bg-white/60 rounded-xl border border-teal-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="% +/-" 
                className="w-20 h-8 bg-white text-xs" 
                value={adjCosPct}
                onChange={(e) => setAdjCosPct(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs bg-teal-600 text-white border-0 hover:bg-teal-700" onClick={() => applyAdj('cosmeticos', 'pct')}>Ajustar %</Button>
            </div>
            <div className="w-px h-8 bg-teal-200 mx-1 hidden md:block" />
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="$ +/-" 
                className="w-24 h-8 bg-white text-xs"
                value={adjCosAmt}
                onChange={(e) => setAdjCosAmt(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs bg-cyan-600 text-white border-0 hover:bg-cyan-700" onClick={() => applyAdj('cosmeticos', 'amt')}>Ajustar $</Button>
            </div>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cosmeticosData.map((cosmetico, idx) => (
            <div key={idx} className="flex gap-3 items-end bg-white p-3 rounded-lg">
              <div className="flex-1">
                <Label>Nombre</Label>
                <Input
                  value={cosmetico.nombre}
                  onChange={(e) => {
                    const newCosmeticos = [...cosmeticosData];
                    newCosmeticos[idx].nombre = e.target.value;
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Contenido</Label>
                <Input
                  value={cosmetico.contenido}
                  onChange={(e) => {
                    const newCosmeticos = [...cosmeticosData];
                    newCosmeticos[idx].contenido = e.target.value;
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={cosmetico.pvp}
                  onChange={(e) => {
                    const newCosmeticos = [...cosmeticosData];
                    newCosmeticos[idx].pvp = parseFloat(e.target.value) || 0;
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={cosmetico.stock ?? 0}
                  onChange={(e) => {
                    const newCosmeticos = [...cosmeticosData];
                    newCosmeticos[idx].stock = parseInt(e.target.value, 10) || 0;
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setCosmeticosData(cosmeticosData.filter((_, i) => i !== idx));
                }}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <Button
            onClick={() => {
              setCosmeticosData([...cosmeticosData, { nombre: '', contenido: '', pvp: 0, stock: 0 }]);
            }}
            className="w-full"
          >
            + Agregar Cosmético
          </Button>
        </div>
      </Card>
    </div>
    );
  };

  return (
    <Tabs defaultValue="ventas" className="space-y-6">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white shadow-lg">
        <TabsTrigger value="ventas">Ventas</TabsTrigger>
        <TabsTrigger value="consumo">Consumo Empleados</TabsTrigger>
        <TabsTrigger value="precios">Editar Precios</TabsTrigger>
      </TabsList>

      <TabsContent value="ventas" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Datos de Venta */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="font-bold mb-4 text-blue-900">Datos de Venta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="empleado">Empleado</Label>
              <Input
                id="empleado"
                value={empleado}
                onChange={(e) => setEmpleado(e.target.value)}
                placeholder="Nombre del empleado"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="horaEntrada">Hora Entrada</Label>
              <Input
                id="horaEntrada"
                type="time"
                value={horaEntrada}
                onChange={(e) => setHoraEntrada(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="horaSalida">Hora Salida</Label>
              <Input
                id="horaSalida"
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="patente" className="text-slate-700 font-bold">Patente</Label>
              <Input
                id="patente"
                value={patente}
                onChange={(e) => setPatente(e.target.value.toUpperCase())}
                placeholder="ABC-123"
                className="uppercase font-mono text-lg border-slate-300 focus:border-blue-500 bg-white"
              />
              {patente && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (washCounts[patente] || 0) % 6 === 5 ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(((washCounts[patente] || 0) % 6) / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    (washCounts[patente] || 0) % 6 === 5 ? 'text-green-600 animate-bounce' : 'text-slate-500'
                  }`}>
                    {(washCounts[patente] || 0) % 6 === 5 
                      ? '¡Próximo Lavado Gratis!' 
                      : `Lavados: ${(washCounts[patente] || 0) % 6} / 5`}
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente (opcional)"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="numeroCliente">Número de Cliente</Label>
              <Input
                id="numeroCliente"
                value={numeroCliente}
                onChange={(e) => setNumeroCliente(e.target.value)}
                placeholder="ID o Teléfono"
                className="bg-white"
              />
            </div>
            {puedeEstadia() && (
              <div className="flex flex-col space-y-4 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="estadia"
                    checked={estadia}
                    onChange={(e) => setEstadia(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="estadia" className="font-semibold text-blue-900 cursor-pointer">
                    Añadir Estadía / Estacionamiento
                  </Label>
                </div>
                
                {estadia && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <Label htmlFor="horasEstadia" className="text-sm text-blue-800">Horas a fraccionar</Label>
                      <Input
                        id="horasEstadia"
                        type="number"
                        min="1"
                        value={horasEstadia}
                        onChange={(e) => setHorasEstadia(parseFloat(e.target.value) || 0)}
                        className="bg-white border-blue-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="precioEstadia" className="text-sm text-blue-800">Precio Estadía</Label>
                      <Input
                        id="precioEstadia"
                        type="number"
                        min="0"
                        value={precioEstadia || ''}
                        onChange={(e) => setPrecioEstadia(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white border-blue-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Vehículo de Lista de Precios */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
          <h3 className="font-bold mb-4 text-indigo-900">Seleccionar Vehículo (Lista de Precios)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchVehiculo">Buscar en Lista de Precios</Label>
              <Input
                id="searchVehiculo"
                value={searchVehiculo}
                onChange={(e) => setSearchVehiculo(e.target.value)}
                placeholder="Buscar por marca o modelo..."
                className="bg-white"
              />
            </div>

            {filteredPricesList.length > 0 && (
              <div className="max-h-40 overflow-y-auto border rounded-md bg-white p-2 space-y-1 shadow-inner">
                {filteredPricesList.map((p) => (
                  <Button
                    key={p.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left hover:bg-indigo-50 h-auto py-2 border-b last:border-0 border-gray-100"
                    onClick={() => {
                      setVehiculoSeleccionado(p);
                      setServicio(p.service);
                      setLavado(p.price);
                      setSearchVehiculo('');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.brand} className="w-10 h-10 object-cover rounded shadow-sm border border-indigo-200" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center text-indigo-400">
                          <Car className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-900">{p.brand} {p.model}</span>
                        <span className="text-xs text-gray-500">{p.size} - {p.service} - {formatMoney(p.price)}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {vehiculoSeleccionado && (
              <div className="p-3 bg-indigo-100 border border-indigo-200 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-4">
                  {vehiculoSeleccionado.imageUrl ? (
                    <img src={vehiculoSeleccionado.imageUrl} alt={vehiculoSeleccionado.brand} className="w-16 h-16 object-cover rounded-lg shadow-md border-2 border-white" />
                  ) : (
                    <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center text-indigo-400">
                      <Car className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Vehículo Seleccionado</p>
                    <p className="font-bold text-indigo-900">{vehiculoSeleccionado.brand} {vehiculoSeleccionado.model}</p>
                    <p className="text-sm text-indigo-700">{vehiculoSeleccionado.size} - {vehiculoSeleccionado.service}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-indigo-400 hover:text-indigo-600"
                  onClick={() => {
                    setVehiculoSeleccionado(null);
                    setServicio('');
                    setLavado(0);
                  }}
                >
                  Cambiar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Lavado */}
        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
          <h3 className="font-bold mb-4 text-cyan-900">Lavado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servicioSelect">Servicio Predefinido</Label>
              <Select
                value={servicio}
                onValueChange={(val) => {
                  setServicio(val);
                  const servicioEncontrado = serviciosLavado.find(s => s.nombre === val);
                  if (servicioEncontrado) {
                    setLavado(servicioEncontrado.precio);
                  }
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviciosLavado.map((s, idx) => (
                    <SelectItem key={idx} value={s.nombre}>
                      {s.nombre} - {formatMoney(s.precio)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lavado">Precio Lavado (o personalizado)</Label>
              <Input
                id="lavado"
                type="number"
                value={lavado || ''}
                onChange={(e) => setLavado(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Bar */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <h3 className="font-bold mb-4 text-amber-900">Bar / Cafetería</h3>
          <div className="mb-4">
            <Label htmlFor="searchBar">Buscar Producto</Label>
            <Input
              id="searchBar"
              value={searchBar}
              onChange={(e) => setSearchBar(e.target.value)}
              placeholder="Buscar..."
              className="bg-white mb-4"
            />

            <div className="max-h-60 overflow-y-auto space-y-2 bg-white p-4 rounded-lg border">
              {Object.entries(productosBarPorGrupo).map(([grupo, productos]) => (
                <div key={grupo}>
                  <h4 className="font-semibold text-amber-800 mb-2">{grupo}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {productos.map((p, idx) => (
                      <Button
                        key={`${p.name}-${idx}`}
                        variant="outline"
                        size="sm"
                        onClick={() => agregarProductoBar(p.name, p.value)}
                        className="justify-between text-left h-auto py-2"
                      >
                        <span className="whitespace-normal flex-1">{p.name}</span>
                        <div className="flex flex-col items-end ml-2">
                          <span className="font-semibold">{formatMoney(p.value)}</span>
                          <span className={`text-xs font-bold ${(p.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Stock: {p.stock || 0}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {productosBar.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Productos Seleccionados:</h4>
              <ul className="space-y-2">
                {productosBar.map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-3 rounded border">
                    <span>{p.nombre} - {formatMoney(p.precio)}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarProductoBar(idx)}
                    >
                      Eliminar
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right font-bold text-lg text-amber-900">
                Total Bar: {formatMoney(calcularTotalBar())}
              </div>
            </div>
          )}
        </Card>

        {/* Cosméticos */}
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
          <h3 className="font-bold mb-4 text-teal-900">Cosméticos del Automotor</h3>
          <div className="mb-4">
            <Label htmlFor="searchCosmeticos">Buscar Cosmético</Label>
            <Input
              id="searchCosmeticos"
              value={searchCosmeticos}
              onChange={(e) => setSearchCosmeticos(e.target.value)}
              placeholder="Buscar..."
              className="bg-white mb-4"
            />

            <div className="max-h-60 overflow-y-auto space-y-1 bg-white p-4 rounded-lg border">
              {cosmeticosFiltrados.map((c, idx) => {
                const displayName = c.contenido ? `${c.nombre} (${c.contenido})` : c.nombre;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => agregarCosmetico(displayName, c.pvp)}
                    className="w-full justify-between text-left h-auto py-2"
                  >
                    <span className="text-sm whitespace-normal flex-1">{displayName}</span>
                    <div className="flex flex-col items-end ml-2">
                      <span className="font-semibold text-sm">{formatMoney(c.pvp)}</span>
                      <span className={`text-xs font-bold ${(c.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Stock: {c.stock || 0}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {productosCosmeticos.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Cosméticos Seleccionados:</h4>
              <ul className="space-y-2">
                {productosCosmeticos.map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-3 rounded border">
                    <span className="text-sm">{p.nombre} - {formatMoney(p.precio)}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarCosmetico(idx)}
                    >
                      Eliminar
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right font-bold text-lg text-teal-900">
                Total Cosméticos: {formatMoney(calcularTotalCosmeticos())}
              </div>
            </div>
          )}
        </Card>

        {/* Descuento */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="font-bold mb-4 text-purple-900">Descuento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="descuentoPorcentaje">Descuento (%)</Label>
              <Select
                value={descuentoPorcentaje.toString()}
                onValueChange={(value) => actualizarDescuentoPorcentaje(parseFloat(value))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccionar descuento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="descuento">Monto Descuento Manual</Label>
              <Input
                id="descuento"
                type="number"
                value={descuento || ''}
                onChange={(e) => {
                  setDescuento(parseFloat(e.target.value) || 0);
                  setDescuentoPorcentaje(0);
                }}
                className="bg-white"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-200">
            <Label className="mb-3 block text-sm font-semibold text-purple-800">Aplicar descuento a:</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-purple-100 shadow-sm hover:bg-purple-50 transition-colors">
                <input type="checkbox" checked={descLavadero} onChange={(e) => setDescLavadero(e.target.checked)} className="text-purple-600 rounded w-4 h-4 focus:ring-purple-500" />
                <span className="text-sm font-medium text-gray-700">Lavadero</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-purple-100 shadow-sm hover:bg-purple-50 transition-colors">
                <input type="checkbox" checked={descBar} onChange={(e) => setDescBar(e.target.checked)} className="text-purple-600 rounded w-4 h-4 focus:ring-purple-500" />
                <span className="text-sm font-medium text-gray-700">Bar</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-purple-100 shadow-sm hover:bg-purple-50 transition-colors">
                <input type="checkbox" checked={descCosmetica} onChange={(e) => setDescCosmetica(e.target.checked)} className="text-purple-600 rounded w-4 h-4 focus:ring-purple-500" />
                <span className="text-sm font-medium text-gray-700">Cosmética</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Pago */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <h3 className="font-bold mb-4 text-green-900">Método de Pago</h3>

          <div className="max-w-md">
            <Label htmlFor="metodoPago">Seleccionar Método de Pago General</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger className="bg-white mt-2">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Billetera Virtual">Billetera Virtual</SelectItem>
                <SelectItem value="Cupón de descuento">Cupón de descuento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Total y Acciones */}
        <Card className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
          <div className="text-right mb-6">
            <div className="text-3xl font-bold text-green-700">
              TOTAL: {formatMoney(calcularTotal())}
            </div>
            {descuento > 0 && (
              <div className="text-sm text-gray-600">
                Subtotal: {formatMoney(calcularSubtotal())} - Descuento: {formatMoney(descuento)}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={registrarVenta}
              className="flex-2 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Registrar Venta
            </Button>
            <Button
              onClick={guardarOrdenEnProgreso}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              En Progreso
            </Button>
            <Button
              onClick={limpiarFormulario}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Limpiar
            </Button>
          </div>
        </Card>
          </div>

          {/* Panel Lateral de Órdenes Abiertas */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-6">
              <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                Vehículos en Lavadero
              </h3>
              {ordenesAbiertas.length === 0 ? (
                <Card className="p-6 text-center text-gray-500 border-dashed border-2 bg-gray-50/50">
                  <p className="text-sm">No hay vehículos siendo atendidos</p>
                </Card>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {ordenesAbiertas.map((orden) => (
                    <Card key={orden.id} className={`p-4 hover:shadow-md transition-all border-l-4 ${activeOrderId === orden.id ? 'border-l-green-500 bg-green-50/30 ring-1 ring-green-200' : 'border-l-blue-500 bg-white'}`}>
                      <div className="flex gap-3 mb-3">
                        {orden.imageUrl ? (
                          <img src={orden.imageUrl} alt="Vehículo" className="w-16 h-16 object-cover rounded-lg shadow-sm border border-slate-200" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                            <Car className="w-8 h-8" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-bold text-lg text-slate-800 truncate">{orden.patente || 'S/P'}</div>
                            <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium shrink-0">{orden.horaEntrada}</div>
                          </div>
                          <div className="text-xs text-gray-600">
                            {orden.cliente && <p className="truncate italic">👤 {orden.cliente}</p>}
                            <p className="font-bold text-blue-800 mt-0.5">{formatMoney(orden.total)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={activeOrderId === orden.id ? "outline" : "default"}
                          size="sm"
                          className={`flex-1 h-8 text-xs ${activeOrderId === orden.id ? 'border-green-500 text-green-700 hover:bg-green-50' : 'bg-blue-600 hover:bg-blue-700'}`}
                          onClick={() => cargarOrden(orden)}
                        >
                          {activeOrderId === orden.id ? 'Editando...' : 'Retomar'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              ✕
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se perderán los datos cargados para el vehículo {orden.patente}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, mantener</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => {
                                  setItemAAnular({ id: orden.id, type: 'orden' });
                                  setShowAnulacionDialog(true);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sí, eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Ventas */}
        <Card className="p-6">
          <h3 className="font-bold text-xl mb-4">Registro de Ventas del Día</h3>

          {ventas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay ventas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border p-2">Foto</th>
                    <th className="border p-2">Fecha</th>
                    <th className="border p-2">Entrada</th>
                    <th className="border p-2">Salida</th>
                    <th className="border p-2">Patente</th>
                    <th className="border p-2">Vehículo</th>
                    <th className="border p-2">Cliente</th>
                    <th className="border p-2">Nº Cliente</th>
                    <th className="border p-2 bg-cyan-500">Lavado</th>
                    <th className="border p-2 bg-amber-500">Bar</th>
                    <th className="border p-2 bg-teal-500">Cosméticos</th>
                    <th className="border p-2 bg-green-600">Total</th>
                    <th className="border p-2 text-xs">Estadía</th>
                    <th className="border p-2">Pago</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-gray-50">
                      <td className="border p-2 text-center">
                        {venta.imageUrl ? (
                          <img src={venta.imageUrl} alt="Car" className="w-8 h-8 object-cover rounded shadow-sm mx-auto" />
                        ) : (
                          <Car className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="border p-2 text-center">{venta.fecha}</td>
                      <td className="border p-2 text-center text-blue-600 font-medium">{venta.horaEntrada}</td>
                      <td className="border p-2 text-center text-green-600 font-medium">{venta.horaSalida}</td>
                      <td className="border p-2 text-center font-bold">{venta.patente}</td>
                      <td className="border p-2">
                        {venta.marca ? (
                          <div className="text-xs">
                            <span className="font-bold">{venta.marca}</span>
                            <br />
                            <span>{venta.modelo}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="border p-2">{venta.cliente}</td>
                      <td className="border p-2">{venta.numeroCliente}</td>
                      <td className="border p-2 text-right bg-cyan-50">{formatMoney(venta.lavado)}</td>
                      <td className="border p-2 text-right bg-amber-50">{formatMoney(venta.bar)}</td>
                      <td className="border p-2 text-right bg-teal-50">{formatMoney(venta.cosmeticos)}</td>
                      <td className="border p-2 text-right bg-green-50 font-bold">{formatMoney(venta.total)}</td>
                      <td className="border p-2 text-center">{venta.estadia ? 'Sí' : '-'}</td>
                      <td className="border p-2 text-center text-sm">{venta.metodoPago}</td>
                      <td className="border p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVentaSeleccionada(venta)}
                              >
                                Ver Detalle
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Detalle de Venta</DialogTitle>
                                <DialogDescription>
                                  Información completa de la venta
                                </DialogDescription>
                              </DialogHeader>
                              {ventaSeleccionada && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-600">Fecha y Horarios</p>
                                      <p>{ventaSeleccionada.fecha}</p>
                                      <p className="text-xs text-blue-600">Entrada: {ventaSeleccionada.horaEntrada}</p>
                                      <p className="text-xs text-green-600">Salida: {ventaSeleccionada.horaSalida}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-600">Empleado</p>
                                      <p>{ventaSeleccionada.empleado}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-600">Patente</p>
                                      <p>{ventaSeleccionada.patente || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-600">Cliente</p>
                                      <p>{ventaSeleccionada.cliente || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-600">Nº Cliente</p>
                                      <p>{ventaSeleccionada.numeroCliente || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-600">Estadía</p>
                                      {ventaSeleccionada.estadia ? (
                                        <p>Sí ({ventaSeleccionada.horasEstadia} hs - {formatMoney(ventaSeleccionada.precioEstadia || 0)})</p>
                                      ) : (
                                        <p>No</p>
                                      )}
                                    </div>
                                  </div>

                                  {ventaSeleccionada.lavado > 0 && (
                                    <div className="bg-cyan-50 p-4 rounded-lg flex justify-between items-center">
                                      <div>
                                        <h4 className="font-bold text-cyan-900">Lavado</h4>
                                        <p className="text-sm">{ventaSeleccionada.servicio}</p>
                                      </div>
                                      <p className="font-bold">{formatMoney(ventaSeleccionada.lavado)}</p>
                                    </div>
                                  )}

                                  {ventaSeleccionada.productosBar.length > 0 && (
                                    <div className="bg-amber-50 p-4 rounded-lg">
                                      <h4 className="font-bold text-amber-900 mb-2">Productos del Bar</h4>
                                      <ul className="space-y-1 mb-2">
                                        {ventaSeleccionada.productosBar.map((p, idx) => (
                                          <li key={idx} className="flex justify-between text-sm">
                                            <span>{p.nombre}</span>
                                            <span>{formatMoney(p.precio)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="flex justify-between font-bold border-t border-amber-200 pt-2 text-sm">
                                        <span>Total Bar:</span>
                                        <span>{formatMoney(ventaSeleccionada.bar)}</span>
                                      </div>
                                    </div>
                                  )}

                                  {ventaSeleccionada.productosCosmeticos.length > 0 && (
                                    <div className="bg-teal-50 p-4 rounded-lg">
                                      <h4 className="font-bold text-teal-900 mb-2">Cosméticos</h4>
                                      <ul className="space-y-1 mb-2">
                                        {ventaSeleccionada.productosCosmeticos.map((p, idx) => (
                                          <li key={idx} className="flex justify-between text-sm">
                                            <span>{p.nombre}</span>
                                            <span>{formatMoney(p.precio)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="flex justify-between font-bold border-t border-teal-200 pt-2 text-sm">
                                        <span>Total Cosméticos:</span>
                                        <span>{formatMoney(ventaSeleccionada.cosmeticos)}</span>
                                      </div>
                                    </div>
                                  )}

                                  {ventaSeleccionada.descuento > 0 && (
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                      <h4 className="font-bold text-purple-900 mb-2">Descuento Aplicado</h4>
                                      <p>{formatMoney(ventaSeleccionada.descuento)}</p>
                                    </div>
                                  )}

                                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                                    <h4 className="font-bold text-green-900 mb-2">Total de la Venta</h4>
                                    <div className="flex justify-between items-end">
                                      <p className="text-2xl font-bold text-green-700">{formatMoney(ventaSeleccionada.total)}</p>
                                      <div className="text-right">
                                        <p className="text-sm text-green-800">Método de Pago</p>
                                        <p className="font-bold text-green-900">{ventaSeleccionada.metodoPago}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => iniciarEdicionVenta(venta)}
                          >
                            Editar
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar esta venta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => eliminarVenta(venta.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Resumen de Caja */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
            <h3 className="font-bold text-green-900 mb-1 text-sm">Total Efectivo</h3>
            <p className="text-2xl font-bold text-green-700">{formatMoney(totalEfectivo)}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
            <h3 className="font-bold text-blue-900 mb-1 text-sm">Total Transferencia</h3>
            <p className="text-2xl font-bold text-blue-700">{formatMoney(totalTransferencia)}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
            <h3 className="font-bold text-purple-900 mb-1 text-sm">Total Billetera Virtual</h3>
            <p className="text-2xl font-bold text-purple-700">{formatMoney(totalBilletera)}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-400">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Total General</h3>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(totalGeneral)}</p>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="consumo">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Empleados */}
          <Card className="lg:col-span-1 p-4 bg-slate-50 h-fit">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Equipo GoWash</h3>
            <div className="space-y-2 mb-4">
              {listaEmpleados.map((emp) => (
                <div 
                  key={emp}
                  className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                    empleadoConsumoSeleccionado === emp 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
                  }`}
                  onClick={() => setEmpleadoConsumoSeleccionado(emp)}
                >
                  <span className="font-medium">{emp}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); eliminarEmpleado(emp); }}
                      className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded hover:bg-red-200"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200">
              <Input 
                placeholder="Nombre empleado..." 
                value={nuevoEmpleadoNombre}
                onChange={(e) => setNuevoEmpleadoNombre(e.target.value)}
                className="bg-white text-sm"
              />
              <Button onClick={agregarEmpleado} className="w-full bg-slate-800 hover:bg-slate-900 text-xs">
                Añadir Empleado
              </Button>
            </div>
          </Card>

          {/* Panel de Consumo */}
          <Card className="lg:col-span-3 p-6 bg-white min-h-[500px]">
            {empleadoConsumoSeleccionado ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Cuenta de {empleadoConsumoSeleccionado}</h3>
                    <p className="text-slate-500 text-sm">Registro de consumos del bar</p>
                  </div>
                  <div className="flex gap-6 items-end">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Subtotal</p>
                      <p className="text-lg font-bold text-slate-400 line-through">
                        {formatMoney((consumosEmpleados[empleadoConsumoSeleccionado] || []).reduce((sum, p) => sum + p.precio, 0))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total con Descuento</p>
                      <p className="text-4xl font-black text-red-600">
                        {formatMoney(
                          ((consumosEmpleados[empleadoConsumoSeleccionado] || []).reduce((sum, p) => sum + p.precio, 0)) * 
                          (1 - descuentoEmpleadoConsumo / 100)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Buscador de Bar */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Añadir Producto
                    </h4>
                    <Input
                      placeholder="Buscar producto..."
                      value={searchBar}
                      onChange={(e) => setSearchBar(e.target.value)}
                      className="bg-slate-50"
                    />
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {barProductsData
                        .filter(p => p.name.toLowerCase().includes(searchBar.toLowerCase()))
                        .map(p => (
                          <Button
                            key={p.name}
                            variant="outline"
                            className="justify-between h-auto py-2 text-left hover:bg-amber-50 hover:border-amber-200"
                            onClick={() => agregarConsumoAEmpleado(p)}
                          >
                            <span className="text-xs font-medium">{p.name}</span>
                            <span className="text-xs font-bold text-amber-700">{formatMoney(p.value)}</span>
                          </Button>
                        ))
                      }
                    </div>
                  </div>

                  {/* Lista de Consumos */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-700">Detalle de Consumo</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Descuento:</span>
                        <Select 
                          value={descuentoEmpleadoConsumo.toString()} 
                          onValueChange={(val) => setDescuentoEmpleadoConsumo(parseInt(val))}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs bg-white">
                            <SelectValue placeholder="0%" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Sin Desc.</SelectItem>
                            {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map(pct => (
                              <SelectItem key={pct} value={pct.toString()}>{pct}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {(consumosEmpleados[empleadoConsumoSeleccionado] || []).length === 0 ? (
                        <p className="text-center text-slate-400 py-8 text-sm italic">Sin consumos pendientes</p>
                      ) : (
                        (consumosEmpleados[empleadoConsumoSeleccionado] || []).map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                            <span className="text-xs text-slate-700">{p.nombre}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold">{formatMoney(p.precio)}</span>
                              <button 
                                onClick={() => eliminarConsumoEmpleado(idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {(consumosEmpleados[empleadoConsumoSeleccionado] || []).length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-slate-500">Descuento aplicado ({descuentoEmpleadoConsumo}%):</span>
                          <span className="text-green-600 font-bold">
                            -{formatMoney(
                              ((consumosEmpleados[empleadoConsumoSeleccionado] || []).reduce((sum, p) => sum + p.precio, 0)) * 
                              (descuentoEmpleadoConsumo / 100)
                            )}
                          </span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                              Liquidar Cuenta Final
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar liquidación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se cobrarán {formatMoney(
                                  ((consumosEmpleados[empleadoConsumoSeleccionado] || []).reduce((sum, p) => sum + p.precio, 0)) * 
                                  (1 - descuentoEmpleadoConsumo / 100)
                                )} a {empleadoConsumoSeleccionado} (con {descuentoEmpleadoConsumo}% de descuento).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => liquidarConsumoEmpleado(empleadoConsumoSeleccionado!)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmar Pago
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  👤
                </div>
                <p className="text-center italic">Selecciona un empleado de la lista para ver o registrar su consumo.</p>
              </div>
            )}
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="precios">
        <EditorPrecios />
      </TabsContent>
      {/* Diálogo de Motivo de Anulación */}
      <Dialog open={showAnulacionDialog} onOpenChange={setShowAnulacionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Motivo de Anulación</DialogTitle>
            <DialogDescription>
              Por favor, indique el motivo por el cual se está dando de baja esta venta o pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="motivo" className="text-right">
                Motivo
              </Label>
              <Input
                id="motivo"
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                className="col-span-3"
                placeholder="Ej: Error en carga, pedido cancelado por cliente..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAnulacionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAnulacion} className="bg-red-600 hover:bg-red-700 text-white">
              Confirmar Anulación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
