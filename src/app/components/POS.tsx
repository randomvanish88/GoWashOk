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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Car, Check, Trash2, ShieldCheck, RotateCcw, ChevronDown, Plus, Pencil, Sparkles } from 'lucide-react';
import { CierreCajaPanel, DEFAULT_DENOMINACIONES_ARS } from './CierreCajaPanel';
import { InicioCajaPanel } from './InicioCajaPanel';
import { EditableNumberInput } from './EditableNumberInput';
import {
  PAGO_MIXTO,
  PagoParcial,
  desglosePagosVenta,
  formatMetodoPagoDisplay,
  metodosParaPagoMixto,
} from './pagoMixto';
import { googleSheetsSync } from '../lib/googleSheetsSync';
import { toast } from 'sonner';


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
  pagosMixtos?: PagoParcial[];
  numeroCliente?: string;
  estadia?: boolean;
  horasEstadia?: number;
  precioEstadia?: number;
  descuento: number;
  productosBar: ProductoVenta[];
  productosCosmeticos: ProductoVenta[];
  servicio?: string;
  extrasLavado?: ProductoVenta[];
  descLavadero?: boolean;
  descBar?: boolean;
  descCosmetica?: boolean;
  marca?: string;
  modelo?: string;
  tamano?: string;
  imageUrl?: string;
}

interface VentaEmpleado {
  id: string;
  fecha: string;
  hora: string;
  empleado: string;
  productos: ProductoVenta[];
  subtotal: number;
  descuentoPorcentaje: number;
  total: number;
}

interface AuditLog {
  id: string;
  fecha: string;
  accion: 'EDICION' | 'ELIMINACION';
  tipo: 'VENTA_LAVADO' | 'CONSUMO_EMPLEADO';
  detalles: string;
  registroId: string;
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

const DEFAULT_EXTRAS_LAVADO: ServicioLavado[] = [
  { nombre: "Embarrado", precio: 5000 },
];

const DEFAULT_EMPLEADOS = ['Recepción', 'Lavador 1', 'Lavador 2'];

const crearConteoBilletesVacio = (denoms: number[]) =>
  Object.fromEntries(denoms.map((d) => [String(d), 0])) as Record<string, number>;

const crearPagosMixtosInicial = (): PagoParcial[] => [
  { metodo: 'Efectivo', monto: 0 },
  { metodo: 'Transferencia', monto: 0 },
];

const getCurrentTimeString = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

interface EditorPreciosProps {
  serviciosLavado: ServicioLavado[];
  setServiciosLavado: (s: ServicioLavado[]) => void;
  barProductsData: ProductoBar[];
  setBarProductsData: (p: ProductoBar[]) => void;
  cosmeticosData: Cosmetico[];
  setCosmeticosData: (c: Cosmetico[]) => void;
}

function EditorPrecios({ serviciosLavado, setServiciosLavado, barProductsData, setBarProductsData, cosmeticosData, setCosmeticosData }: EditorPreciosProps) {
  const [adjLavadoPct, setAdjLavadoPct] = useState('');
  const [adjLavadoAmt, setAdjLavadoAmt] = useState('');
  const [adjBarPct, setAdjBarPct] = useState('');
  const [adjBarAmt, setAdjBarAmt] = useState('');
  const [adjCosPct, setAdjCosPct] = useState('');
  const [adjCosAmt, setAdjCosAmt] = useState('');
  const [adjBarStock, setAdjBarStock] = useState('');
  const [adjCosStock, setAdjCosStock] = useState('');

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

  const applyStockAdj = (type: 'bar' | 'cosmeticos', mode: 'add' | 'set') => {
    if (type === 'bar') {
      const val = parseInt(adjBarStock, 10);
      if (isNaN(val)) return;
      setBarProductsData(barProductsData.map(p => ({
        ...p,
        stock: mode === 'add' ? Math.max(0, (p.stock || 0) + val) : Math.max(0, val)
      })));
      setAdjBarStock('');
    } else {
      const val = parseInt(adjCosStock, 10);
      if (isNaN(val)) return;
      setCosmeticosData(cosmeticosData.map(c => ({
        ...c,
        stock: mode === 'add' ? Math.max(0, (c.stock || 0) + val) : Math.max(0, val)
      })));
      setAdjCosStock('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Servicios de Lavado */}
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
        <h3 className="font-bold text-xl text-cyan-900 mb-4">Servicios de Lavado</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-white rounded-lg border border-cyan-200 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-cyan-700 mb-2">Ajustar Precios</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="% +/-" className="w-20 h-8 bg-white text-xs" value={adjLavadoPct} onChange={(e) => setAdjLavadoPct(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-cyan-600 text-white hover:bg-cyan-700 flex-1" onClick={() => applyAdj('lavado', 'pct')}>Ajustar %</Button>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="$ +/-" className="w-20 h-8 bg-white text-xs" value={adjLavadoAmt} onChange={(e) => setAdjLavadoAmt(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-blue-600 text-white hover:bg-blue-700 flex-1" onClick={() => applyAdj('lavado', 'amt')}>Ajustar $</Button>
              </div>
            </div>
          </div>
          <div></div>
          <div className="flex items-end">
            <Button onClick={() => setServiciosLavado([...serviciosLavado, { nombre: '', precio: 0 }])} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm py-2">+ Agregar Servicio</Button>
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
                    newServicios[idx] = { ...newServicios[idx], nombre: e.target.value };
                    setServiciosLavado(newServicios);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Precio</Label>
                <EditableNumberInput
                  value={servicio.precio}
                  onChange={(precio) => {
                    const newServicios = [...serviciosLavado];
                    newServicios[idx] = { ...newServicios[idx], precio };
                    setServiciosLavado(newServicios);
                  }}
                />
              </div>
              <Button variant="destructive" onClick={() => setServiciosLavado(serviciosLavado.filter((_, i) => i !== idx))}>Eliminar</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Editor Productos Bar */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <h3 className="font-bold text-xl text-amber-900 mb-4">Productos del Bar</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2">Ajustar Precios</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="% +/-" className="w-20 h-8 bg-white text-xs" value={adjBarPct} onChange={(e) => setAdjBarPct(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-amber-600 text-white hover:bg-amber-700 flex-1" onClick={() => applyAdj('bar', 'pct')}>Ajustar %</Button>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="$ +/-" className="w-20 h-8 bg-white text-xs" value={adjBarAmt} onChange={(e) => setAdjBarAmt(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-orange-600 text-white hover:bg-orange-700 flex-1" onClick={() => applyAdj('bar', 'amt')}>Ajustar $</Button>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-green-200 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-2">Ajustar Stock</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Cantidad" className="w-20 h-8 bg-white text-xs" value={adjBarStock} onChange={(e) => setAdjBarStock(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-green-600 text-white hover:bg-green-700 flex-1" onClick={() => applyStockAdj('bar', 'add')}>+ Agregar</Button>
              </div>
              <Button size="sm" className="w-full h-8 text-xs bg-slate-600 text-white hover:bg-slate-700" onClick={() => applyStockAdj('bar', 'set')}>Establecer todos</Button>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={() => setBarProductsData([...barProductsData, { group: '', name: '', value: 0, stock: 0 }])} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2">+ Agregar Producto</Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {barProductsData.map((producto, idx) => (
            <div key={idx} className="flex gap-3 items-end bg-white p-3 rounded-lg">
              <div className="flex-1">
                <Label>Categoria</Label>
                <Input
                  value={producto.group}
                  onChange={(e) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx] = { ...newProductos[idx], group: e.target.value };
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
                    newProductos[idx] = { ...newProductos[idx], name: e.target.value };
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Precio</Label>
                <EditableNumberInput
                  value={producto.value}
                  onChange={(value) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx] = { ...newProductos[idx], value };
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Stock</Label>
                <EditableNumberInput
                  value={producto.stock ?? 0}
                  onChange={(stock) => {
                    const newProductos = [...barProductsData];
                    newProductos[idx] = { ...newProductos[idx], stock };
                    setBarProductsData(newProductos);
                  }}
                />
              </div>
              <Button variant="destructive" onClick={() => setBarProductsData(barProductsData.filter((_, i) => i !== idx))}>Eliminar</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Editor Cosmeticos */}
      <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
        <h3 className="font-bold text-xl text-teal-900 mb-4">Cosmeticos del Automotor</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-white rounded-lg border border-teal-200 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-teal-700 mb-2">Ajustar Precios</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="% +/-" className="w-20 h-8 bg-white text-xs" value={adjCosPct} onChange={(e) => setAdjCosPct(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-teal-600 text-white hover:bg-teal-700 flex-1" onClick={() => applyAdj('cosmeticos', 'pct')}>Ajustar %</Button>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="$ +/-" className="w-20 h-8 bg-white text-xs" value={adjCosAmt} onChange={(e) => setAdjCosAmt(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-cyan-600 text-white hover:bg-cyan-700 flex-1" onClick={() => applyAdj('cosmeticos', 'amt')}>Ajustar $</Button>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-green-200 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-2">Ajustar Stock</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Cantidad" className="w-20 h-8 bg-white text-xs" value={adjCosStock} onChange={(e) => setAdjCosStock(e.target.value)} />
                <Button size="sm" className="h-8 text-xs bg-green-600 text-white hover:bg-green-700 flex-1" onClick={() => applyStockAdj('cosmeticos', 'add')}>+ Agregar</Button>
              </div>
              <Button size="sm" className="w-full h-8 text-xs bg-slate-600 text-white hover:bg-slate-700" onClick={() => applyStockAdj('cosmeticos', 'set')}>Establecer todos</Button>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={() => setCosmeticosData([...cosmeticosData, { nombre: '', contenido: '', pvp: 0, stock: 0 }])} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2">+ Agregar Cosmetico</Button>
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
                    newCosmeticos[idx] = { ...newCosmeticos[idx], nombre: e.target.value };
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
                    newCosmeticos[idx] = { ...newCosmeticos[idx], contenido: e.target.value };
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Precio</Label>
                <EditableNumberInput
                  value={cosmetico.pvp}
                  onChange={(pvp) => {
                    const newCosmeticos = [...cosmeticosData];
                    newCosmeticos[idx] = { ...newCosmeticos[idx], pvp };
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Stock</Label>
                <EditableNumberInput
                  value={cosmetico.stock ?? 0}
                  onChange={(stock) => {
                    const newCosmeticos = [...cosmeticosData];
                    newCosmeticos[idx] = { ...newCosmeticos[idx], stock };
                    setCosmeticosData(newCosmeticos);
                  }}
                />
              </div>
              <Button variant="destructive" onClick={() => setCosmeticosData(cosmeticosData.filter((_, i) => i !== idx))}>Eliminar</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function POS({ prices = [], isAdmin = false, onNavigateToPrices }: { prices?: Price[], isAdmin?: boolean, onNavigateToPrices?: () => void }) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ordenesAbiertas, setOrdenesAbiertas] = useState<Venta[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [productosBar, setProductosBar] = useState<ProductoVenta[]>([]);
  const [productosCosmeticos, setProductosCosmeticos] = useState<ProductoVenta[]>([]);
  const [ventasAnuladas, setVentasAnuladas] = useState<VentaAnulada[]>([]);
  const [washCounts, setWashCounts] = useState<Record<string, number>>({});
  const [filtroSectorVentas, setFiltroSectorVentas] = useState<string>("Todos");
  const [filtroPagoVentas, setFiltroPagoVentas] = useState<string>("Todos");

  const ventasFiltradas = ventas.filter(venta => {
    // Filtro por sector
    const matchLavadero = venta.lavado > 0;
    const matchBar = venta.bar > 0;
    const matchCosmetica = venta.cosmeticos > 0;
    let sectorMatch = false;
    if (filtroSectorVentas === "Todos") sectorMatch = true;
    else if (filtroSectorVentas === "Lavadero" && matchLavadero) sectorMatch = true;
    else if (filtroSectorVentas === "Bar" && matchBar) sectorMatch = true;
    else if (filtroSectorVentas === "Cosmetica" && matchCosmetica) sectorMatch = true;

    // Filtro por método de pago
    let pagoMatch = false;
    if (filtroPagoVentas === "Todos") pagoMatch = true;
    else if (filtroPagoVentas === venta.metodoPago) pagoMatch = true;
    else if (filtroPagoVentas === "Otro" && !["Efectivo", "Transferencia", "Mercado Pago", "Tarjeta", "Cuenta Corriente"].includes(venta.metodoPago || "")) pagoMatch = true;

    return sectorMatch && pagoMatch;
  });

  // Estados nuevos para Consumo Empleados
  const [historialConsumosEmpleados, setHistorialConsumosEmpleados] = useState<VentaEmpleado[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [editingConsumoId, setEditingConsumoId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogText, setEditingLogText] = useState('');

  // Precios editables
  const [cosmeticosData, setCosmeticosData] = useState<Cosmetico[]>([]);
  const [barProductsData, setBarProductsData] = useState<ProductoBar[]>([]);
  const [serviciosLavado, setServiciosLavado] = useState<ServicioLavado[]>([]);

  // Form fields
  const [fecha, setFecha] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [precioServicioLavado, setPrecioServicioLavado] = useState(0);
  const [extrasLavadoOpciones, setExtrasLavadoOpciones] = useState<ServicioLavado[]>([]);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([]);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [nuevoExtraNombre, setNuevoExtraNombre] = useState('');
  const [nuevoExtraPrecio, setNuevoExtraPrecio] = useState('');
  const [empleadoVentaOpen, setEmpleadoVentaOpen] = useState(false);
  const [nuevoEmpleadoVentaNombre, setNuevoEmpleadoVentaNombre] = useState('');
  const [empleadoEditando, setEmpleadoEditando] = useState<string | null>(null);
  const [empleadoEditandoNombre, setEmpleadoEditandoNombre] = useState('');
  const [fechaCierre, setFechaCierre] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split('T')[0]);

  // Monto de inicio de caja del día del cierre (leído desde localStorage)
  const [inicioCajaVersion, setInicioCajaVersion] = useState(0);
  const montoCajaInicio = useMemo(() => {
    void inicioCajaVersion; // fuerza re-cálculo cuando se registra un inicio
    const key = `gowash-inicio-monto-${fechaCierre}`;
    return parseFloat(localStorage.getItem(key) || '0') || 0;
  }, [fechaCierre, inicioCajaVersion]);
  const [denominacionesBilletes, setDenominacionesBilletes] = useState<number[]>(DEFAULT_DENOMINACIONES_ARS);
  const [conteoBilletes, setConteoBilletes] = useState<Record<string, number>>(() =>
    crearConteoBilletesVacio(DEFAULT_DENOMINACIONES_ARS)
  );
  const [cierreEnProceso, setCierreEnProceso] = useState(false);
  const [empleado, setEmpleado] = useState('');
  const [patente, setPatente] = useState('');
  const [cliente, setCliente] = useState('');
  const [lavado, setLavado] = useState(0);
  const [servicio, setServicio] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [metodosPago, setMetodosPago] = useState<string[]>([
    'Efectivo',
    PAGO_MIXTO,
    'Transferencia',
    'Billetera Virtual',
    'Cupón de descuento',
  ]);
  const [pagosMixtos, setPagosMixtos] = useState<PagoParcial[]>(crearPagosMixtosInicial);
  const [showNewMetodoPagoDialog, setShowNewMetodoPagoDialog] = useState(false);
  const [newMetodoPagoName, setNewMetodoPagoName] = useState('');
  const [editingMetodoPago, setEditingMetodoPago] = useState<string | null>(null);
  const [editingMetodoPagoName, setEditingMetodoPagoName] = useState('');
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

  const horaEntradaCongelada = activeOrderId !== null || editingVentaId !== null;

  const getExtrasSeleccionadosItems = (): ProductoVenta[] =>
    extrasLavadoOpciones
      .filter((e) => extrasSeleccionados.includes(e.nombre))
      .map((e) => ({ nombre: e.nombre, precio: e.precio }));

  const toggleExtraLavado = (nombre: string) => {
    setExtrasSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((n) => n !== nombre) : [...prev, nombre]
    );
  };

  const agregarExtraLavadoOpcion = () => {
    const nombre = nuevoExtraNombre.trim();
    const precio = parseFloat(nuevoExtraPrecio) || 0;
    if (!nombre) {
      toast.warning('Ingresá el nombre del extra.');
      return;
    }
    if (extrasLavadoOpciones.some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())) {
      toast.warning('Ese extra ya existe.');
      return;
    }
    setExtrasLavadoOpciones([...extrasLavadoOpciones, { nombre, precio }]);
    setNuevoExtraNombre('');
    setNuevoExtraPrecio('');
    toast.success('Extra agregado.');
  };

  const aplicarExtrasYOrden = (orden: Venta) => {
    const extras = orden.extrasLavado || [];
    setExtrasSeleccionados(extras.map((e) => e.nombre));
    const extrasSum = extras.reduce((sum, e) => sum + e.precio, 0);
    setPrecioServicioLavado(Math.max(0, orden.lavado - extrasSum));
  };

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
    else setListaEmpleados(DEFAULT_EMPLEADOS);
    if (savedConsumosEmpleados) setConsumosEmpleados(JSON.parse(savedConsumosEmpleados));
    
    const savedHistorialConsumos = localStorage.getItem('gowash-historial-consumos-empleados');
    const savedAuditLogs = localStorage.getItem('gowash-audit-logs');
    const savedMetodosPago = localStorage.getItem('gowash-metodos-pago-ventas');

    if (savedHistorialConsumos) setHistorialConsumosEmpleados(JSON.parse(savedHistorialConsumos));
    if (savedAuditLogs) setAuditLogs(JSON.parse(savedAuditLogs));
    if (savedMetodosPago) {
      const parsed: string[] = JSON.parse(savedMetodosPago);
      if (!parsed.includes(PAGO_MIXTO)) {
        const idx = parsed.includes('Efectivo') ? 1 : 0;
        parsed.splice(idx, 0, PAGO_MIXTO);
      }
      setMetodosPago(parsed);
    }

    const savedDenoms = localStorage.getItem('gowash-denominaciones-billetes');
    if (savedDenoms) {
      try {
        const denoms = JSON.parse(savedDenoms) as number[];
        setDenominacionesBilletes(denoms);
        setConteoBilletes(crearConteoBilletesVacio(denoms));
      } catch {
        /* defaults */
      }
    }
    
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

    const savedExtrasLavado = localStorage.getItem('gowash-extras-lavado');
    if (savedExtrasLavado) setExtrasLavadoOpciones(JSON.parse(savedExtrasLavado));
    else setExtrasLavadoOpciones(DEFAULT_EXTRAS_LAVADO);

    const now = new Date();
    setFecha(now.toISOString().split('T')[0]);
    const timeString = getCurrentTimeString();
    setHoraEntrada(timeString);
    setHoraSalida(timeString);
  }, []);

  useEffect(() => {
    if (extrasLavadoOpciones.length > 0) {
      localStorage.setItem('gowash-extras-lavado', JSON.stringify(extrasLavadoOpciones));
    }
  }, [extrasLavadoOpciones]);

  useEffect(() => {
    const extrasTotal = extrasLavadoOpciones
      .filter((e) => extrasSeleccionados.includes(e.nombre))
      .reduce((sum, e) => sum + e.precio, 0);
    setLavado(precioServicioLavado + extrasTotal);
  }, [precioServicioLavado, extrasSeleccionados, extrasLavadoOpciones]);

  useEffect(() => {
    if (horaEntradaCongelada) return;
    const tick = () => setHoraEntrada(getCurrentTimeString());
    tick();
    const intervalId = setInterval(tick, 30000);
    return () => clearInterval(intervalId);
  }, [horaEntradaCongelada]);

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

  useEffect(() => {
    localStorage.setItem('gowash-historial-consumos-empleados', JSON.stringify(historialConsumosEmpleados));
  }, [historialConsumosEmpleados]);

  useEffect(() => {
    localStorage.setItem('gowash-audit-logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

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

  const agregarMetodoPago = () => {
    if (!newMetodoPagoName.trim()) return;
    if (newMetodoPagoName.trim() === PAGO_MIXTO) {
      toast.warning('Ese nombre está reservado para el sistema.');
      return;
    }
    if (metodosPago.includes(newMetodoPagoName.trim())) {
      toast.warning('El método de pago ya existe.');
      return;
    }
    const nuevosMetodos = [...metodosPago, newMetodoPagoName.trim()];
    setMetodosPago(nuevosMetodos);
    localStorage.setItem('gowash-metodos-pago-ventas', JSON.stringify(nuevosMetodos));
    setMetodoPago(newMetodoPagoName.trim());
    setNewMetodoPagoName('');
    setShowNewMetodoPagoDialog(false);
    toast.success('Método de pago agregado exitosamente.');
  };

  const editarMetodoPago = (original: string) => {
    const nuevo = editingMetodoPagoName.trim();
    if (!nuevo) return;
    if (nuevo === PAGO_MIXTO) {
      toast.warning('Ese nombre está reservado.');
      return;
    }
    if (nuevo !== original && metodosPago.includes(nuevo)) {
      toast.warning('Ese método de pago ya existe.');
      return;
    }
    const nuevosMetodos = metodosPago.map(m => m === original ? nuevo : m);
    setMetodosPago(nuevosMetodos);
    localStorage.setItem('gowash-metodos-pago-ventas', JSON.stringify(nuevosMetodos));
    if (metodoPago === original) setMetodoPago(nuevo);
    setEditingMetodoPago(null);
    setEditingMetodoPagoName('');
    toast.success('Método de pago actualizado.');
  };

  const eliminarMetodoPago = (nombre: string) => {
    if (nombre === 'Efectivo' || nombre === PAGO_MIXTO) {
      toast.warning('No se puede eliminar este método.');
      return;
    }
    const nuevosMetodos = metodosPago.filter(m => m !== nombre);
    setMetodosPago(nuevosMetodos);
    localStorage.setItem('gowash-metodos-pago-ventas', JSON.stringify(nuevosMetodos));
    if (metodoPago === nombre) setMetodoPago('Efectivo');
    toast.success('Método de pago eliminado.');
  };

  const validarPagoMixto = (totalVenta: number) => {
    const lineas = pagosMixtos.filter((p) => p.monto > 0);
    if (lineas.length < 2) {
      toast.warning('Pago mixto', { description: 'Agregá al menos 2 métodos con monto.' });
      return false;
    }
    const suma = lineas.reduce((s, p) => s + p.monto, 0);
    if (Math.abs(suma - totalVenta) > 0.01) {
      toast.error('Montos no coinciden', {
        description: `La suma (${formatMoney(suma)}) debe igualar el total (${formatMoney(totalVenta)}).`,
      });
      return false;
    }
    return true;
  };

  const registrarVenta = (ordenDirecta?: Venta) => {
    const totalVenta = ordenDirecta?.total ?? calcularTotal();
    if (!ordenDirecta && metodoPago === PAGO_MIXTO && !validarPagoMixto(totalVenta)) {
      return;
    }

    // Si viene una ordenDirecta, usamos sus datos. Si no, usamos el estado actual.
    const vBase = ordenDirecta || {
      id: editingVentaId || Date.now().toString(),
      fecha,
      hora: horaEntrada,
      horaEntrada,
      horaSalida,
      empleado,
      patente,
      cliente,
      numeroCliente,
      lavado,
      bar: calcularTotalBar(),
      cosmeticos: calcularTotalCosmeticos(),
      total: calcularTotal(),
      metodoPago,
      pagosMixtos:
        metodoPago === PAGO_MIXTO
          ? pagosMixtos.filter((p) => p.monto > 0)
          : undefined,
      estadia: puedeEstadia() ? estadia : false,
      horasEstadia: puedeEstadia() && estadia ? horasEstadia : undefined,
      precioEstadia: puedeEstadia() && estadia ? precioEstadia : undefined,
      descuento,
      productosBar: [...productosBar],
      productosCosmeticos: [...productosCosmeticos],
      servicio,
      extrasLavado: getExtrasSeleccionadosItems(),
      marca: vehiculoSeleccionado?.brand,
      modelo: vehiculoSeleccionado?.model,
      tamano: vehiculoSeleccionado?.size,
      imageUrl: vehiculoSeleccionado?.imageUrl
    };

    // Fallback de emergencia
    if (!vBase.empleado) {
      vBase.empleado = 'Sin Empleado';
    }

    const faltantes = [];
    if (!vBase.fecha) faltantes.push("Fecha");
    if (!vBase.horaEntrada) faltantes.push("Hora de entrada");

    if (faltantes.length > 0) {
      toast.error('Datos incompletos', { description: `Falta completar: ${faltantes.join(', ')}` });
      setTimeout(() => document.getElementById('patente')?.focus(), 100);
      return;
    }

    if (!vBase.patente && !vBase.cliente) {
      toast.warning('Identificación requerida', { description: 'Ingresa Patente o Cliente para registrar la venta.' });
      setTimeout(() => document.getElementById('patente')?.focus(), 100);
      return;
    }

    const currentCount = vBase.numeroCliente ? (washCounts[vBase.numeroCliente] || 0) : 0;
    const esGratis = vBase.numeroCliente && currentCount % 6 === 5;

    const nuevaVenta: Venta = {
      ...vBase,
      lavado: esGratis ? 0 : vBase.lavado,
      total: esGratis ? (vBase.bar + vBase.cosmeticos) : vBase.total,
      servicio: esGratis ? `GRATIS - ${vBase.servicio}` : vBase.servicio,
      descuento: esGratis ? 0 : vBase.descuento
    };

    // Actualizar stock
    const newBarData = [...barProductsData];
    nuevaVenta.productosBar.forEach(p => {
      const prod = newBarData.find(bp => bp.name === p.nombre);
      if (prod) prod.stock = (prod.stock || 0) - 1;
    });
    setBarProductsData(newBarData);

    const newCosmeticosData = [...cosmeticosData];
    nuevaVenta.productosCosmeticos.forEach(p => {
      const prod = newCosmeticosData.find(c => {
         const displayName = c.contenido ? `${c.nombre} (${c.contenido})` : c.nombre;
         return displayName === p.nombre;
      });
      if (prod) prod.stock = (prod.stock || 0) - 1;
    });
    setCosmeticosData(newCosmeticosData);

    // Si es una orden que estaba abierta, la quitamos
    const idABuscar = ordenDirecta ? ordenDirecta.id : (activeOrderId || editingVentaId);
    setOrdenesAbiertas(prev => prev.filter(o => o.id !== idABuscar));

    if (editingVentaId) {
      const log: AuditLog = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleString('es-AR'),
        accion: 'EDICION',
        tipo: 'VENTA_LAVADO',
        detalles: `Venta editada (Patente: ${nuevaVenta.patente || 'S/P'}). Nuevo total: ${formatMoney(nuevaVenta.total)}`,
        registroId: editingVentaId
      };
      setAuditLogs(prev => [log, ...prev]);
      
      const nuevasVentas = ventas.map(v => v.id === editingVentaId ? nuevaVenta : v);
      setVentas(nuevasVentas);
      googleSheetsSync.syncUpdateVenta(nuevaVenta);
    } else {
      const nuevasVentas = [nuevaVenta, ...ventas];
      setVentas(nuevasVentas);

      if (nuevaVenta.numeroCliente) {
        const newCounts = { ...washCounts, [nuevaVenta.numeroCliente]: currentCount + 1 };
        setWashCounts(newCounts);
      }

      googleSheetsSync.syncVenta(nuevaVenta);
    }

    limpiarFormulario();
  };

  const cobrarOrdenEnProgreso = (orden: Venta) => {
    const ordenCobrada = {
      ...orden,
      fecha: orden.fecha || fecha,
      hora: orden.horaEntrada || horaEntrada,
      empleado: orden.empleado || empleado || 'Sin Empleado',
      horaSalida: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      total: orden.total || (orden.lavado + orden.bar + orden.cosmeticos),
    };
    registrarVenta(ordenCobrada);
  };

  const guardarOrdenEnProgreso = () => {
    if (editingVentaId) return;
    const totalOrden = calcularTotal();
    if (metodoPago === PAGO_MIXTO && !validarPagoMixto(totalOrden)) return;
    if (!patente && !cliente) {
      toast.warning('Faltan datos', { description: 'Ingresa Patente o Cliente para guardar la orden.' });
      setTimeout(() => document.getElementById('patente')?.focus(), 100);
      return;
    }

    const totalBar = calcularTotalBar();
    const totalCosmeticos = calcularTotalCosmeticos();
    const total = calcularTotal();

    const orden: Venta = {
      id: activeOrderId || Date.now().toString(),
      fecha,
      hora: horaEntrada,
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
      pagosMixtos:
        metodoPago === PAGO_MIXTO
          ? pagosMixtos.filter((p) => p.monto > 0)
          : undefined,
      estadia,
      horasEstadia,
      precioEstadia,
      descuento,
      productosBar: [...productosBar],
      productosCosmeticos: [...productosCosmeticos],
      servicio,
      extrasLavado: getExtrasSeleccionadosItems(),
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
    setHoraEntrada(orden.horaEntrada);
    setHoraSalida(orden.horaSalida);
    setEmpleado(orden.empleado);
    setPatente(orden.patente);
    setCliente(orden.cliente);
    setNumeroCliente(orden.numeroCliente || '');
    aplicarExtrasYOrden(orden);
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
    setPagosMixtos(
      orden.pagosMixtos?.length ? orden.pagosMixtos : crearPagosMixtosInicial()
    );
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
    const timeString = getCurrentTimeString();
    setHoraEntrada(timeString);
    setHoraSalida(timeString);
    setActiveOrderId(null);
    setEditingVentaId(null);
    setPatente('');
    setCliente('');
    setPrecioServicioLavado(0);
    setExtrasSeleccionados([]);
    setServicio('');
    setDescuento(0);
    setDescuentoPorcentaje(0);
    setDescLavadero(true);
    setDescBar(true);
    setDescCosmetica(true);
    setMetodoPago('Efectivo');
    setPagosMixtos(crearPagosMixtosInicial());
    setNumeroCliente('');
    setEstadia(false);
    setHorasEstadia(1);
    setPrecioEstadia(0);
    setProductosBar([]);
    setProductosCosmeticos([]);
    setVehiculoSeleccionado(null);
    setSearchVehiculo('');
  };

  const seleccionarEmpleadoVenta = (nombre: string) => {
    setEmpleado(nombre);
    setEmpleadoVentaOpen(false);
  };

  const agregarEmpleadoVenta = () => {
    const nombre = nuevoEmpleadoVentaNombre.trim();
    if (!nombre) {
      toast.warning('Ingresá el nombre del empleado.');
      return;
    }
    if (listaEmpleados.some((e) => e.toLowerCase() === nombre.toLowerCase())) {
      toast.warning('Ese empleado ya existe.');
      return;
    }
    setListaEmpleados([...listaEmpleados, nombre]);
    setEmpleado(nombre);
    setNuevoEmpleadoVentaNombre('');
    toast.success('Empleado agregado.');
  };

  const iniciarEdicionEmpleadoLista = (nombre: string) => {
    setEmpleadoEditando(nombre);
    setEmpleadoEditandoNombre(nombre);
  };

  const cancelarEdicionEmpleadoLista = () => {
    setEmpleadoEditando(null);
    setEmpleadoEditandoNombre('');
  };

  const guardarEdicionEmpleadoLista = () => {
    const nuevo = empleadoEditandoNombre.trim();
    if (!empleadoEditando || !nuevo) return;
    if (
      nuevo.toLowerCase() !== empleadoEditando.toLowerCase() &&
      listaEmpleados.some((e) => e.toLowerCase() === nuevo.toLowerCase())
    ) {
      toast.warning('Ese nombre ya existe.');
      return;
    }
    setListaEmpleados(listaEmpleados.map((e) => (e === empleadoEditando ? nuevo : e)));
    if (empleado === empleadoEditando) setEmpleado(nuevo);
    if (consumosEmpleados[empleadoEditando]) {
      const nuevosConsumos = { ...consumosEmpleados };
      nuevosConsumos[nuevo] = nuevosConsumos[empleadoEditando];
      delete nuevosConsumos[empleadoEditando];
      setConsumosEmpleados(nuevosConsumos);
    }
    if (empleadoConsumoSeleccionado === empleadoEditando) {
      setEmpleadoConsumoSeleccionado(nuevo);
    }
    cancelarEdicionEmpleadoLista();
    toast.success('Empleado actualizado.');
  };

  const iniciarEdicionVenta = (venta: Venta) => {
    setActiveOrderId(null);
    setEditingVentaId(venta.id);
    setFecha(venta.fecha);
    setHoraEntrada(venta.horaEntrada);
    setHoraSalida(venta.horaSalida);
    setEmpleado(venta.empleado);
    setPatente(venta.patente);
    setCliente(venta.cliente);
    aplicarExtrasYOrden(venta);
    setServicio(venta.servicio || '');
    setDescuento(venta.descuento);
    setMetodoPago(venta.metodoPago);
    setPagosMixtos(
      venta.pagosMixtos?.length ? venta.pagosMixtos : crearPagosMixtosInicial()
    );
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
      toast.error('Motivo requerido', { description: 'Debe ingresar un motivo para la anulación' });
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
      
      const log: AuditLog = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleString('es-AR'),
        accion: 'ELIMINACION',
        tipo: 'VENTA_LAVADO',
        detalles: `Venta ANULADA (Patente: ${item.patente || 'S/P'}). Motivo: ${motivoAnulacion}`,
        registroId: item.id
      };
      setAuditLogs(prev => [log, ...prev]);
      
      setVentasAnuladas([...ventasAnuladas, anulada]);
      googleSheetsSync.syncAnulacion(anulada);
    }

    setShowAnulacionDialog(false);
    setMotivoAnulacion('');
    setItemAAnular(null);
  };

  // Funciones para Consumo de Empleados
  const agregarEmpleado = () => {
    if (!nuevoEmpleadoNombre) return;
    if (listaEmpleados.includes(nuevoEmpleadoNombre.trim())) {
      toast.error('Error', { description: 'El empleado ya existe' });
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
    const actuales = consumosEmpleados[nombre] || [];
    if (actuales.length === 0) return;

    const subtotal = actuales.reduce((sum, p) => sum + p.precio, 0);
    const total = subtotal * (1 - descuentoEmpleadoConsumo / 100);

    const nuevaLiquidacion: VentaEmpleado = {
      id: editingConsumoId || Date.now().toString(),
      fecha: new Date().toLocaleDateString('es-AR'),
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      empleado: nombre,
      productos: [...actuales],
      subtotal,
      descuentoPorcentaje: descuentoEmpleadoConsumo,
      total
    };

    if (editingConsumoId) {
      const log: AuditLog = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleString('es-AR'),
        accion: 'EDICION',
        tipo: 'CONSUMO_EMPLEADO',
        detalles: `Liquidación de ${nombre} editada. Nuevo total: ${formatMoney(total)}`,
        registroId: editingConsumoId
      };
      setAuditLogs([log, ...auditLogs]);
      setHistorialConsumosEmpleados(historialConsumosEmpleados.map(h => h.id === editingConsumoId ? nuevaLiquidacion : h));
      setEditingConsumoId(null);
    } else {
      setHistorialConsumosEmpleados([nuevaLiquidacion, ...historialConsumosEmpleados]);
    }

    setConsumosEmpleados({
      ...consumosEmpleados,
      [nombre]: []
    });
    setDescuentoEmpleadoConsumo(0);
  };

  const eliminarHistorialConsumo = (id: string) => {
    const item = historialConsumosEmpleados.find(h => h.id === id);
    if (!item) return;

    const log: AuditLog = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleString('es-AR'),
      accion: 'ELIMINACION',
      tipo: 'CONSUMO_EMPLEADO',
      detalles: `Liquidación de ${item.empleado} eliminada. Monto: ${formatMoney(item.total)}`,
      registroId: id
    };
    setAuditLogs([log, ...auditLogs]);
    setHistorialConsumosEmpleados(historialConsumosEmpleados.filter(h => h.id !== id));
  };

  const cargarConsumoParaEditar = (consumo: VentaEmpleado) => {
    // 1. Registrar el movimiento en la auditoría antes de quitarlo
    const log: AuditLog = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleString('es-AR'),
      accion: 'EDICION',
      tipo: 'CONSUMO_EMPLEADO',
      detalles: `Registro de ${consumo.empleado} retirado del historial para re-edición. Monto original: ${formatMoney(consumo.total)}`,
      registroId: consumo.id
    };
    setAuditLogs([log, ...auditLogs]);

    // 2. Cargar los datos al panel de edición
    setEmpleadoConsumoSeleccionado(consumo.empleado);
    setConsumosEmpleados({
      ...consumosEmpleados,
      [consumo.empleado]: [...consumo.productos]
    });
    setDescuentoEmpleadoConsumo(consumo.descuentoPorcentaje);
    setEditingConsumoId(consumo.id);

    // 3. Quitarlo del historial (para que no figure duplicado mientras se edita)
    setHistorialConsumosEmpleados(historialConsumosEmpleados.filter(h => h.id !== consumo.id));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarEdicionLog = (id: string) => {
    setAuditLogs(auditLogs.map(log => 
      log.id === id ? { ...log, detalles: editingLogText } : log
    ));
    setEditingLogId(null);
    setEditingLogText('');
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

  const ventasDelDia = useMemo(
    () => ventas.filter((v) => v.fecha === fechaCierre),
    [ventas, fechaCierre]
  );

  const sumaPorMetodoEnVentas = (metodoLower: string) =>
    ventasDelDia.reduce((sum, v) => {
      const parte = desglosePagosVenta(v)
        .filter((p) => p.metodo.toLowerCase() === metodoLower)
        .reduce((s, p) => s + p.monto, 0);
      return sum + parte;
    }, 0);

  const totalEfectivo = useMemo(() => sumaPorMetodoEnVentas('efectivo'), [ventasDelDia]);

  const totalTransferencia = useMemo(() => sumaPorMetodoEnVentas('transferencia'), [ventasDelDia]);

  const totalBilletera = useMemo(
    () =>
      ventasDelDia.reduce((sum, v) => {
        const parte = desglosePagosVenta(v)
          .filter((p) => {
            const m = p.metodo.toLowerCase();
            return m !== 'efectivo' && m !== 'transferencia';
          })
          .reduce((s, p) => s + p.monto, 0);
        return sum + parte;
      }, 0),
    [ventasDelDia]
  );

  const totalGeneral = useMemo(
    () => ventasDelDia.reduce((sum, v) => sum + v.total, 0),
    [ventasDelDia]
  );

  const resumenMetodosPago = useMemo(() => {
    const map = new Map<string, { total: number; cantidad: number }>();
    ventasDelDia.forEach((v) => {
      const desglose = desglosePagosVenta(v);
      const metodosEnEstaVenta = new Set<string>();
      desglose.forEach((p) => {
        const metodo = p.metodo?.trim() || 'Sin método';
        const cur = map.get(metodo) ?? { total: 0, cantidad: 0 };
        map.set(metodo, { total: cur.total + p.monto, cantidad: cur.cantidad });
        metodosEnEstaVenta.add(metodo);
      });
      metodosEnEstaVenta.forEach((metodo) => {
        const cur = map.get(metodo)!;
        map.set(metodo, { ...cur, cantidad: cur.cantidad + 1 });
      });
    });

    const vistos = new Set<string>();
    const filas: { metodo: string; total: number; cantidad: number }[] = [];

    metodosPago.forEach((m) => {
      if (m === PAGO_MIXTO) return;
      vistos.add(m);
      filas.push({ metodo: m, ...(map.get(m) ?? { total: 0, cantidad: 0 }) });
    });

    map.forEach((data, metodo) => {
      if (!vistos.has(metodo)) filas.push({ metodo, ...data });
    });

    return filas.sort((a, b) => b.total - a.total);
  }, [ventasDelDia, metodosPago]);

  const totalContadoBilletes = useMemo(
    () =>
      denominacionesBilletes.reduce(
        (sum, d) => sum + (conteoBilletes[String(d)] || 0) * d,
        0
      ),
    [conteoBilletes, denominacionesBilletes]
  );

  const diferenciaArqueo = totalContadoBilletes - (totalEfectivo + montoCajaInicio);

  const cierreYaEnviado =
    typeof window !== 'undefined' &&
    !!localStorage.getItem(`gowash-cierre-enviado-${fechaCierre}`);

  useEffect(() => {
    localStorage.setItem('gowash-denominaciones-billetes', JSON.stringify(denominacionesBilletes));
  }, [denominacionesBilletes]);

  useEffect(() => {
    const saved = localStorage.getItem(`gowash-arqueo-${fechaCierre}`);
    const base = crearConteoBilletesVacio(denominacionesBilletes);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, number>;
        setConteoBilletes({ ...base, ...parsed });
      } catch {
        setConteoBilletes(base);
      }
    } else {
      setConteoBilletes(base);
    }
  }, [fechaCierre, denominacionesBilletes]);

  useEffect(() => {
    localStorage.setItem(`gowash-arqueo-${fechaCierre}`, JSON.stringify(conteoBilletes));
  }, [conteoBilletes, fechaCierre]);

  const agregarDenominacionBillete = (valor: number) => {
    if (denominacionesBilletes.includes(valor)) {
      toast.warning('Esa denominación ya existe.');
      return;
    }
    setDenominacionesBilletes([...denominacionesBilletes, valor].sort((a, b) => a - b));
    setConteoBilletes((prev) => ({ ...prev, [String(valor)]: 0 }));
  };

  const eliminarDenominacionBillete = (valor: number) => {
    if (denominacionesBilletes.length <= 1) {
      toast.warning('Debe quedar al menos una denominación.');
      return;
    }
    setDenominacionesBilletes(denominacionesBilletes.filter((d) => d !== valor));
    setConteoBilletes((prev) => {
      const next = { ...prev };
      delete next[String(valor)];
      return next;
    });
  };

  const editarDenominacionBillete = (valorAnterior: number, valorNuevo: number) => {
    if (valorAnterior === valorNuevo) return;
    if (denominacionesBilletes.includes(valorNuevo)) {
      toast.warning('Esa denominación ya existe.');
      return;
    }
    setDenominacionesBilletes(
      denominacionesBilletes.map((d) => (d === valorAnterior ? valorNuevo : d)).sort((a, b) => a - b)
    );
    setConteoBilletes((prev) => {
      const next = { ...prev };
      next[String(valorNuevo)] = next[String(valorAnterior)] ?? 0;
      delete next[String(valorAnterior)];
      return next;
    });
  };

  const actualizarConteoBillete = (valor: number, cantidad: number) => {
    setConteoBilletes((prev) => ({
      ...prev,
      [String(valor)]: Math.max(0, cantidad),
    }));
  };

  const limpiarConteoBilletes = () => setConteoBilletes(crearConteoBilletesVacio(denominacionesBilletes));

  const realizarCierreCaja = async () => {
    if (ventasDelDia.length === 0) {
      toast.warning('Sin ventas del día', {
        description: `No hay ventas registradas para ${fechaCierre}.`,
      });
      return;
    }

    if (!googleSheetsSync.getSpreadsheetId()) {
      toast.error('Google Sheets no configurado', {
        description: 'Configurá la hoja en Ajustes antes de enviar el cierre.',
      });
      return;
    }

    if (typeof window === 'undefined' || !window.electronAPI?.googleSheets) {
      toast.error('Cierre solo disponible en la app de escritorio (Electron).');
      return;
    }

    setCierreEnProceso(true);
    const cierreId = `cierre-${fechaCierre}-${Date.now()}`;

    const cierre = {
      id: cierreId,
      fecha: fechaCierre,
      horaCierre: getCurrentTimeString(),
      totalEfectivoSistema: totalEfectivo,
      montoCajaInicio,
      totalEsperadoEfectivo: totalEfectivo + montoCajaInicio,
      totalContado: totalContadoBilletes,
      diferencia: diferenciaArqueo,
      totalGeneral,
      cantidadVentas: ventasDelDia.length,
      detalleMetodos: resumenMetodosPago,
      detalleBilletes: denominacionesBilletes.map((valor) => {
        const cantidad = conteoBilletes[String(valor)] || 0;
        return { valor, cantidad, subtotal: cantidad * valor };
      }),
      empleado: empleado || undefined,
    };

    try {
      const result = await googleSheetsSync.syncCierreCaja(cierre);
      if (!result.success) {
        throw new Error(result.error || 'No se pudo guardar el cierre');
      }

      const historial = JSON.parse(localStorage.getItem('gowash-cierres-caja') || '[]');
      localStorage.setItem('gowash-cierres-caja', JSON.stringify([cierre, ...historial]));
      localStorage.setItem(`gowash-cierre-enviado-${fechaCierre}`, cierreId);

      toast.success('Cierre de caja enviado', {
        description: `Día ${fechaCierre} sincronizado con la nube.`,
      });

      // Reiniciar ventas y caja para iniciar nuevo turno
      const ventasRestantes = ventas.filter((v) => v.fecha !== fechaCierre);
      setVentas(ventasRestantes);
      localStorage.setItem('gowash-ventas', JSON.stringify(ventasRestantes));

      limpiarConteoBilletes();
      localStorage.removeItem(`gowash-inicio-monto-${fechaCierre}`);
      setInicioCajaVersion(v => v + 1);
      localStorage.removeItem(`gowash-cierre-enviado-${fechaCierre}`);

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al cerrar caja', { description: msg });
    } finally {
      setCierreEnProceso(false);
    }
  };



  return (
    <Tabs defaultValue="ventas" className="space-y-6 scroll-smooth">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white shadow-lg sticky top-0 z-10">
        <TabsTrigger value="ventas">Ventas</TabsTrigger>
        <TabsTrigger value="consumo">Consumo Empleados</TabsTrigger>
        <TabsTrigger value="precios">Ajuste de Precios y Stock</TabsTrigger>
      </TabsList>

      <TabsContent value="ventas" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Datos de Venta */}
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="font-bold mb-3 text-sm text-blue-900">Datos de Venta</h3>
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
              <Label htmlFor="horaEntrada">Hora Entrada</Label>
              <Input
                id="horaEntrada"
                type="time"
                value={horaEntrada}
                readOnly={!horaEntradaCongelada}
                onChange={(e) => horaEntradaCongelada && setHoraEntrada(e.target.value)}
                className={`bg-white ${!horaEntradaCongelada ? 'bg-slate-100 cursor-default' : ''}`}
                title={horaEntradaCongelada ? 'Hora de ingreso del vehículo' : 'Se actualiza automáticamente con la hora del sistema'}
              />
              {!horaEntradaCongelada && (
                <p className="text-[10px] text-blue-600 mt-0.5">Hora del sistema (se actualiza sola)</p>
              )}
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
            </div>
            <div>
              <Label className="text-[10px] font-bold text-blue-800 uppercase">Empleado</Label>
              <Collapsible open={empleadoVentaOpen} onOpenChange={setEmpleadoVentaOpen} className="mt-1">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-white border border-blue-200 px-3 py-2 text-left hover:bg-blue-50 transition-colors">
                  <span className={`text-sm font-semibold truncate ${empleado ? 'text-blue-900' : 'text-slate-400'}`}>
                    {empleado || 'Seleccionar empleado...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-blue-600 shrink-0 transition-transform ${empleadoVentaOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
                    {listaEmpleados.map((emp) => (
                      empleadoEditando === emp ? (
                        <div key={emp} className="flex gap-1.5 items-center bg-white p-2 rounded-lg border border-blue-200">
                          <Input
                            value={empleadoEditandoNombre}
                            onChange={(e) => setEmpleadoEditandoNombre(e.target.value)}
                            className="h-7 text-xs flex-1"
                          />
                          <Button type="button" size="sm" className="h-7 px-2 bg-green-600" onClick={guardarEdicionEmpleadoLista}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={cancelarEdicionEmpleadoLista}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div
                          key={emp}
                          className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-colors ${
                            empleado === emp
                              ? 'bg-blue-100 border-blue-400'
                              : 'bg-white border-blue-100 hover:border-blue-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => seleccionarEmpleadoVenta(emp)}
                            className="flex-1 text-left text-xs font-bold text-blue-900 truncate"
                          >
                            {emp}
                          </button>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                              onClick={() => iniciarEdicionEmpleadoLista(emp)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="flex gap-2 items-end p-2 bg-blue-50/80 rounded-lg border border-blue-100">
                    <div className="flex-1">
                      <Label className="text-[9px] uppercase text-blue-700">Nuevo empleado</Label>
                      <Input
                        value={nuevoEmpleadoVentaNombre}
                        onChange={(e) => setNuevoEmpleadoVentaNombre(e.target.value)}
                        placeholder="Nombre..."
                        className="h-7 text-xs bg-white mt-0.5"
                        onKeyDown={(e) => e.key === 'Enter' && agregarEmpleadoVenta()}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-[10px] font-bold bg-blue-600 hover:bg-blue-700"
                      onClick={agregarEmpleadoVenta}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
              {numeroCliente && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (washCounts[numeroCliente] || 0) % 6 === 5 ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(((washCounts[numeroCliente] || 0) % 6) / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    (washCounts[numeroCliente] || 0) % 6 === 5 ? 'text-green-600 animate-bounce' : 'text-slate-500'
                  }`}>
                    {(washCounts[numeroCliente] || 0) % 6 === 5 
                      ? '¡Próximo Lavado Gratis!' 
                      : `Lavados: ${(washCounts[numeroCliente] || 0) % 6} / 5`}
                  </span>
                </div>
              )}
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

        {/* Vehículo y Lavadero Unificado */}
        <Card className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
          <h3 className="font-bold mb-3 text-indigo-900 text-xs uppercase tracking-tight flex items-center gap-1">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Lavadero
          </h3>
          
          <div className="space-y-3">
            {/* Buscador de Vehículo */}
            <div className="space-y-1.5">
              <Label htmlFor="searchVehiculo" className="text-[10px] font-bold text-indigo-800 uppercase block">Vehículo / Modelo</Label>
              <Input
                id="searchVehiculo"
                value={searchVehiculo}
                onChange={(e) => setSearchVehiculo(e.target.value)}
                placeholder="Buscar por marca o modelo..."
                className="bg-white h-7 text-xs"
              />

              {filteredPricesList.length > 0 && (
                <div className="max-h-32 overflow-y-auto border rounded bg-white p-1.5 space-y-1 shadow-inner custom-scrollbar">
                  {filteredPricesList.map((p) => (
                    <Button
                      key={p.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left hover:bg-indigo-50 h-auto py-1 px-2 border-b last:border-0 border-indigo-50"
                      onClick={() => {
                        setVehiculoSeleccionado(p);
                        setServicio(p.service);
                        setPrecioServicioLavado(p.price);
                        setSearchVehiculo('');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.brand} className="w-8 h-8 object-cover rounded border border-indigo-200" />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-400">
                            <Car className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-[10px] text-indigo-900 leading-none">{p.brand} {p.model}</span>
                          <span className="text-[9px] text-indigo-500 font-medium">{p.size} - {p.service} - <span className="font-black text-indigo-700">{formatMoney(p.price)}</span></span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {vehiculoSeleccionado && (
                <div className="p-2 bg-indigo-100/50 border border-indigo-200 rounded flex justify-between items-center animate-in fade-in mt-2">
                  <div className="flex items-center gap-3">
                    {vehiculoSeleccionado.imageUrl ? (
                      <img src={vehiculoSeleccionado.imageUrl} alt={vehiculoSeleccionado.brand} className="w-10 h-10 object-cover rounded shadow-sm border border-white" />
                    ) : (
                      <div className="w-10 h-10 bg-white/80 rounded flex items-center justify-center text-indigo-400 shadow-sm">
                        <Car className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-[10px] text-indigo-900 leading-none">{vehiculoSeleccionado.brand} {vehiculoSeleccionado.model}</p>
                      <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{vehiculoSeleccionado.service}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-700 hover:bg-indigo-200"
                    onClick={() => {
                      setVehiculoSeleccionado(null);
                      setServicio('');
                      setPrecioServicioLavado(0);
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              )}
            </div>

            {/* Selector de Servicio */}
            <div className="pt-2 border-t border-indigo-200/50">
              <Label htmlFor="servicioSelect" className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Tipo de Lavado / Servicio</Label>
              <Select
                value={servicio}
                onValueChange={(val) => {
                  setServicio(val);
                  const servicioEncontrado = serviciosLavado.find(s => s.nombre === val);
                  if (servicioEncontrado) {
                    setPrecioServicioLavado(servicioEncontrado.precio);
                  }
                }}
              >
                <SelectTrigger className="bg-white h-8 text-xs font-bold border-indigo-200">
                  <SelectValue placeholder="Seleccionar servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {serviciosLavado.map((s, idx) => (
                    <SelectItem key={idx} value={s.nombre} className="text-xs font-bold text-slate-800">
                      {s.nombre} <span className="font-black text-indigo-700 ml-1">({formatMoney(s.precio)})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen} className="pt-2 border-t border-indigo-200/50">
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-white/80 border border-indigo-200 px-3 py-2 text-left hover:bg-indigo-50 transition-colors">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">
                  Extras / Adicionales
                  {extrasSeleccionados.length > 0 && (
                    <span className="ml-2 text-indigo-600 normal-case">({extrasSeleccionados.length} seleccionado{extrasSeleccionados.length !== 1 ? 's' : ''})</span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${extrasOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="space-y-2">
                  {extrasLavadoOpciones.map((extra) => (
                    <label
                      key={extra.nombre}
                      className="flex items-center justify-between gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={extrasSeleccionados.includes(extra.nombre)}
                          onChange={() => toggleExtraLavado(extra.nombre)}
                          className="w-4 h-4 text-indigo-600 rounded border-indigo-300"
                        />
                        <span className="text-xs font-bold text-indigo-900">{extra.nombre}</span>
                      </div>
                      <span className="text-xs font-black text-indigo-700">{formatMoney(extra.precio)}</span>
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-end p-2 bg-indigo-50/60 rounded-lg border border-indigo-100">
                  <div className="flex-1 min-w-[120px]">
                    <Label className="text-[9px] uppercase text-indigo-700">Nuevo extra</Label>
                    <Input
                      value={nuevoExtraNombre}
                      onChange={(e) => setNuevoExtraNombre(e.target.value)}
                      placeholder="Nombre..."
                      className="h-7 text-xs bg-white mt-0.5"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-[9px] uppercase text-indigo-700">Precio</Label>
                    <Input
                      type="number"
                      min="0"
                      value={nuevoExtraPrecio}
                      onChange={(e) => setNuevoExtraPrecio(e.target.value)}
                      placeholder="0"
                      className="h-7 text-xs bg-white mt-0.5"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700"
                    onClick={agregarExtraLavadoOpcion}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Card>

        {/* Bar */}
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <h3 className="font-bold mb-2 text-amber-900 text-xs uppercase tracking-tight flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Bar / Cafetería
          </h3>
          <div className="mb-2">
            <Input
              id="searchBar"
              value={searchBar}
              onChange={(e) => setSearchBar(e.target.value)}
              placeholder="Buscar producto..."
              className="bg-white mb-2 h-7 text-xs"
            />

            <div className="max-h-32 overflow-y-auto space-y-1.5 bg-white p-2 rounded border custom-scrollbar">
              {Object.entries(productosBarPorGrupo).map(([grupo, productos]) => (
                <div key={grupo}>
                  <h4 className="font-bold text-[10px] text-amber-800 uppercase tracking-widest mb-1">{grupo}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-2">
                    {productos.map((p, idx) => (
                      <Button
                        key={`${p.name}-${idx}`}
                        variant="outline"
                        size="sm"
                        onClick={() => agregarProductoBar(p.name, p.value)}
                        className="justify-between text-left h-auto py-1.5 px-2 border-amber-100 hover:border-amber-300 hover:bg-amber-50"
                      >
                        <span className="text-xs whitespace-normal flex-1 font-bold text-gray-800">{p.name}</span>
                        <div className="flex flex-col items-end ml-2">
                          <span className="font-black text-xs text-amber-700">{formatMoney(p.value)}</span>
                          <span className={`text-[9px] font-bold ${(p.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <div className="mt-2 pt-2 border-t border-amber-200/50">
              <h4 className="font-bold text-[10px] mb-1.5 text-amber-800 uppercase">Seleccionados:</h4>
              <ul className="space-y-1.5">
                {productosBar.map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white/60 p-2 rounded border border-amber-100/50">
                    <span className="text-xs font-bold text-gray-800">{p.nombre} - <span className="text-amber-700">{formatMoney(p.precio)}</span></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] bg-red-100 text-red-600 hover:bg-red-200 uppercase font-black"
                      onClick={() => eliminarProductoBar(idx)}
                    >
                      X
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-1.5 text-right font-black text-sm text-amber-900">
                Total Bar: {formatMoney(calcularTotalBar())}
              </div>
            </div>
          )}
        </Card>

        {/* Cosméticos */}
        <Card className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
          <h3 className="font-bold mb-2 text-teal-900 text-xs uppercase tracking-tight flex items-center gap-1">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Cosméticos
          </h3>
          <div className="mb-2">
            <Input
              id="searchCosmeticos"
              value={searchCosmeticos}
              onChange={(e) => setSearchCosmeticos(e.target.value)}
              placeholder="Buscar cosmético..."
              className="bg-white mb-2 h-7 text-xs"
            />

            <div className="max-h-32 overflow-y-auto space-y-1 bg-white p-2 rounded border custom-scrollbar">
              {cosmeticosFiltrados.map((c, idx) => {
                const displayName = c.contenido ? `${c.nombre} (${c.contenido})` : c.nombre;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => agregarCosmetico(displayName, c.pvp)}
                    className="w-full justify-between text-left h-auto py-1.5 px-2 border-teal-100 hover:border-teal-300 hover:bg-teal-50"
                  >
                    <span className="text-xs whitespace-normal flex-1 font-bold text-gray-800">{displayName}</span>
                    <div className="flex flex-col items-end ml-2">
                      <span className="font-black text-xs text-teal-700">{formatMoney(c.pvp)}</span>
                      <span className={`text-[9px] font-bold ${(c.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Stock: {c.stock || 0}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {productosCosmeticos.length > 0 && (
            <div className="mt-2 pt-2 border-t border-teal-200/50">
              <h4 className="font-bold text-[10px] mb-1.5 text-teal-800 uppercase">Seleccionados:</h4>
              <ul className="space-y-1.5">
                {productosCosmeticos.map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white/60 p-2 rounded border border-teal-100/50">
                    <span className="text-xs font-bold text-gray-800">{p.nombre} - <span className="text-teal-700">{formatMoney(p.precio)}</span></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] bg-red-100 text-red-600 hover:bg-red-200 uppercase font-black"
                      onClick={() => eliminarCosmetico(idx)}
                    >
                      X
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-1.5 text-right font-black text-sm text-teal-900">
                Total Cosméticos: {formatMoney(calcularTotalCosmeticos())}
              </div>
            </div>
          )}
        </Card>

        {/* Liquidación y Pago */}
        <Card className="p-4 bg-slate-50 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sección Descuento */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-tight text-purple-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Descuento
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="descuentoPorcentaje" className="text-[10px]">Porcentaje (%)</Label>
                  <Select
                    value={descuentoPorcentaje.toString()}
                    onValueChange={(value) => actualizarDescuentoPorcentaje(parseFloat(value))}
                  >
                    <SelectTrigger className="bg-white h-8 text-xs">
                      <SelectValue placeholder="Seleccionar" />
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
                  <Label htmlFor="descuento" className="text-[10px]">Monto Fijo</Label>
                  <Input
                    id="descuento"
                    type="number"
                    value={descuento || ''}
                    onChange={(e) => {
                      setDescuento(parseFloat(e.target.value) || 0);
                      setDescuentoPorcentaje(0);
                    }}
                    className="bg-white h-8 text-xs"
                    placeholder="$0"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Label className="mb-2 block text-[10px] font-bold text-purple-800 uppercase">Aplicar a:</Label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1.5 rounded border border-purple-100 hover:bg-purple-50 transition-colors">
                    <input type="checkbox" checked={descLavadero} onChange={(e) => setDescLavadero(e.target.checked)} className="text-purple-600 rounded w-3.5 h-3.5" />
                    <span className="text-xs font-bold text-gray-800">Lavadero</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1.5 rounded border border-purple-100 hover:bg-purple-50 transition-colors">
                    <input type="checkbox" checked={descBar} onChange={(e) => setDescBar(e.target.checked)} className="text-purple-600 rounded w-3.5 h-3.5" />
                    <span className="text-xs font-bold text-gray-800">Bar</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1.5 rounded border border-purple-100 hover:bg-purple-50 transition-colors">
                    <input type="checkbox" checked={descCosmetica} onChange={(e) => setDescCosmetica(e.target.checked)} className="text-purple-600 rounded w-3.5 h-3.5" />
                    <span className="text-xs font-bold text-gray-800">Cosmética</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección Pago */}
            <div className="space-y-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
              <h3 className="font-bold text-xs uppercase tracking-tight text-green-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Método de Pago
              </h3>
              <div className="max-w-xs">
                <Label htmlFor="metodoPago" className="text-[10px] block mb-1">Seleccionar Método de Pago General</Label>
                <Select 
                  value={metodoPago} 
                  onValueChange={(val) => {
                    if (val === 'NEW_METODO_PAGO') {
                      setShowNewMetodoPagoDialog(true);
                    } else {
                      setMetodoPago(val);
                      if (val === PAGO_MIXTO) {
                        setPagosMixtos(crearPagosMixtosInicial());
                      }
                    }
                  }}
                >
                  <SelectTrigger className="bg-white h-8 text-xs font-bold text-green-800 border-green-200">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPago.map(m => (
                      <SelectItem key={m} value={m} className="font-bold">{m}</SelectItem>
                    ))}
                    <SelectItem value="NEW_METODO_PAGO" className="text-blue-600 font-bold border-t">
                      + Nuevo Método
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Lista de métodos de pago con opciones de editar/eliminar */}
                <Collapsible className="mt-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-green-50 border border-green-200 px-2 py-1.5 text-left hover:bg-green-100 transition-colors">
                    <span className="text-[10px] font-bold text-green-700 uppercase">Administrar métodos</span>
                    <Pencil className="w-3 h-3 text-green-600" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-1.5">
                    {metodosPago.filter(m => m !== PAGO_MIXTO).map(m => (
                      editingMetodoPago === m ? (
                        <div key={m} className="flex gap-1.5 items-center bg-white p-1.5 rounded-md border border-green-200">
                          <Input
                            value={editingMetodoPagoName}
                            onChange={(e) => setEditingMetodoPagoName(e.target.value)}
                            className="h-7 text-xs flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && editarMetodoPago(m)}
                          />
                          <Button type="button" size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700" onClick={() => editarMetodoPago(m)}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => { setEditingMetodoPago(null); setEditingMetodoPagoName(''); }}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div key={m} className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-white border border-green-100 hover:border-green-300 transition-colors">
                          <span className="text-xs font-semibold text-green-900 truncate flex-1">{m}</span>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                              onClick={() => { setEditingMetodoPago(m); setEditingMetodoPagoName(m); }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            {m !== 'Efectivo' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                onClick={() => eliminarMetodoPago(m)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {metodoPago === PAGO_MIXTO && (
                <div className="mt-3 space-y-2 p-3 bg-white rounded-lg border border-green-200 max-w-md">
                  <p className="text-[10px] font-bold text-green-800 uppercase">Dividir pago</p>
                  {pagosMixtos.map((linea, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select
                        value={linea.metodo}
                        onValueChange={(val) => {
                          const next = [...pagosMixtos];
                          next[idx] = { ...next[idx], metodo: val };
                          setPagosMixtos(next);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {metodosParaPagoMixto(metodosPago).map((m) => (
                            <SelectItem key={m} value={m} className="text-xs">
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <EditableNumberInput
                        value={linea.monto}
                        onChange={(monto) => {
                          const next = [...pagosMixtos];
                          next[idx] = { ...next[idx], monto };
                          setPagosMixtos(next);
                        }}
                        className="h-8 w-28 text-xs"
                        placeholder="Monto"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 shrink-0"
                        disabled={pagosMixtos.length <= 2}
                        onClick={() => setPagosMixtos(pagosMixtos.filter((_, i) => i !== idx))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() =>
                        setPagosMixtos([
                          ...pagosMixtos,
                          { metodo: metodosParaPagoMixto(metodosPago)[0] || 'Efectivo', monto: 0 },
                        ])
                      }
                    >
                      + Línea
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => {
                        const total = calcularTotal();
                        const n = pagosMixtos.length;
                        const base = Math.floor(total / n);
                        const resto = total - base * n;
                        setPagosMixtos(
                          pagosMixtos.map((p, i) => ({
                            ...p,
                            monto: i === 0 ? base + resto : base,
                          }))
                        );
                      }}
                    >
                      Repartir total
                    </Button>
                  </div>
                  <p
                    className={`text-[10px] font-bold ${
                      Math.abs(pagosMixtos.reduce((s, p) => s + p.monto, 0) - calcularTotal()) < 0.01
                        ? 'text-green-700'
                        : 'text-red-600'
                    }`}
                  >
                    Suma: {formatMoney(pagosMixtos.reduce((s, p) => s + p.monto, 0))} / Total:{' '}
                    {formatMoney(calcularTotal())}
                  </p>
                </div>
              )}
              
              {/* Total Informativo Rápido */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-1">Monto a Cobrar</p>
                <p className="text-2xl font-black text-green-600 leading-none">{formatMoney(calcularTotal())}</p>
              </div>
            </div>

          </div>
        </Card>

        {/* Total y Acciones */}
        <Card className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 shadow-sm">
          {editingVentaId && (
            <p className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-2 uppercase tracking-wide">
              Editando venta cerrada — confirmá con Guardar
            </p>
          )}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-black text-green-800 leading-none">
                TOTAL: {formatMoney(calcularTotal())}
              </div>
              {descuento > 0 && (
                <div className="text-[10px] font-bold text-green-700 mt-1 uppercase tracking-tight">
                  Sub: {formatMoney(calcularSubtotal())} | Desc: {formatMoney(descuento)}
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {editingVentaId ? (
                <Button
                  onClick={() => registrarVenta()}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white h-8 px-6 text-xs font-bold uppercase tracking-tight shadow-sm"
                  size="sm"
                >
                  Guardar
                </Button>
              ) : (
                <>
                  <Button
                    onClick={guardarOrdenEnProgreso}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs font-bold uppercase tracking-tight shadow-sm"
                    size="sm"
                  >
                    En Progreso
                  </Button>
                  <Button
                    onClick={limpiarFormulario}
                    variant="outline"
                    className="flex-none h-8 px-3 text-xs font-bold uppercase tracking-tight text-slate-600 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    size="sm"
                  >
                    Limpiar
                  </Button>
                </>
              )}
            </div>
            
          </div>
        </Card>
          </div>

          {/* Panel Lateral de Órdenes Abiertas */}
          <div className="lg:col-span-1 space-y-3">
            <div className="sticky top-4">
              <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2 uppercase tracking-tighter">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Vehículos en Lavadero
              </h3>
              {ordenesAbiertas.length === 0 ? (
                <Card className="p-4 text-center text-gray-500 border-dashed border-2 bg-gray-50/50">
                  <p className="text-[10px]">No hay vehículos en lavadero</p>
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
                          className={`flex-1 h-8 text-[10px] ${activeOrderId === orden.id ? 'border-blue-500 text-blue-700 hover:bg-blue-50' : 'bg-blue-600 hover:bg-blue-700'}`}
                          onClick={() => cargarOrden(orden)}
                        >
                          {activeOrderId === orden.id ? 'Editando...' : 'Retomar'}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => registrarVenta(orden)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Cobrar
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <h3 className="font-bold text-xl">Registro de Ventas del Día</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={filtroSectorVentas} onValueChange={setFiltroSectorVentas}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold border-blue-200">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los sectores</SelectItem>
                  <SelectItem value="Lavadero">Lavadero</SelectItem>
                  <SelectItem value="Bar">Bar</SelectItem>
                  <SelectItem value="Cosmetica">Cosmética</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroPagoVentas} onValueChange={setFiltroPagoVentas}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold border-green-200">
                  <SelectValue placeholder="Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los pagos</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Cuenta Corriente">Cta Corriente</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                onClick={() => onNavigateToPrices && onNavigateToPrices()}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Agregar o Editar
              </Button>
            </div>
          </div>

          {ventasFiltradas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay ventas registradas para estos filtros</p>
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
                  {ventasFiltradas.map((venta) => (
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
                      <td className="border p-2 text-center text-sm max-w-[200px]">
                        {formatMetodoPagoDisplay(venta, formatMoney)}
                      </td>
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
                                    <div className="bg-cyan-50 p-4 rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-bold text-cyan-900">Lavado</h4>
                                          <p className="text-sm">{ventaSeleccionada.servicio}</p>
                                        </div>
                                        <p className="font-bold">{formatMoney(ventaSeleccionada.lavado)}</p>
                                      </div>
                                      {ventaSeleccionada.extrasLavado && ventaSeleccionada.extrasLavado.length > 0 && (
                                        <ul className="mt-2 pt-2 border-t border-cyan-200 space-y-1">
                                          {ventaSeleccionada.extrasLavado.map((e, idx) => (
                                            <li key={idx} className="flex justify-between text-xs text-cyan-800">
                                              <span>+ {e.nombre}</span>
                                              <span>{formatMoney(e.precio)}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
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
                                        <p className="font-bold text-green-900 text-sm">
                                          {formatMetodoPagoDisplay(ventaSeleccionada, formatMoney)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Acciones
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Desea editar o eliminar esta venta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Puede editar los datos de esta venta, o eliminarla de forma permanente (requiere motivo para auditoría).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="sm:justify-between">
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <div className="flex gap-2">
                                  <AlertDialogAction 
                                    onClick={() => eliminarVenta(venta.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                  <AlertDialogAction 
                                    onClick={() => iniciarEdicionVenta(venta)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Editar
                                  </AlertDialogAction>
                                </div>
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

        {/* Auditoría de Ventas (Solo Admin) Compacta */}
        {isAdmin && (
          <Card className="p-3 border border-indigo-200 bg-indigo-50/20 mt-3">
            <h3 className="font-bold text-xs mb-2 text-indigo-900 flex items-center gap-2 uppercase tracking-tighter">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Cambios y Registro
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {auditLogs.filter(l => l.tipo === 'VENTA_LAVADO').length === 0 ? (
                <p className="text-slate-400 text-center py-2 italic text-[10px]">Sin modificaciones hoy</p>
              ) : (
                auditLogs.filter(l => l.tipo === 'VENTA_LAVADO').map((log) => (
                  <div key={log.id} className="bg-white p-2 rounded border border-indigo-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`px-1.5 py-0 rounded text-[8px] font-black ${log.accion === 'ELIMINACION' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {log.accion}
                      </span>
                      <div className="flex-1">
                        {editingLogId === log.id ? (
                          <div className="flex gap-1">
                            <Input 
                              value={editingLogText} 
                              onChange={(e) => setEditingLogText(e.target.value)}
                              className="h-6 text-[10px] py-0"
                            />
                            <Button size="sm" className="h-6 px-1.5 bg-green-600" onClick={() => guardarEdicionLog(log.id)}>✓</Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] font-bold text-slate-800">{log.detalles}</p>
                            <p className="text-[9px] text-slate-400">{log.fecha}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        <Tabs defaultValue="cierre" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 rounded-xl h-10">
            <TabsTrigger
              value="inicio"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                🟡 Inicio de Caja
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="cierre"
              className="rounded-lg text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                🟢 Cierre de Caja
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inicio">
            <InicioCajaPanel
              fechaInicio={fechaInicio}
              onFechaInicioChange={setFechaInicio}
              formatMoney={formatMoney}
              denominacionesBilletes={denominacionesBilletes}
              onInicioCajaRegistrado={() => setInicioCajaVersion(v => v + 1)}
            />
          </TabsContent>

          <TabsContent value="cierre">
            <CierreCajaPanel
              fechaCierre={fechaCierre}
              onFechaCierreChange={setFechaCierre}
              ventasDelDiaCount={ventasDelDia.length}
              totalEfectivo={totalEfectivo}
              totalTransferencia={totalTransferencia}
              totalBilletera={totalBilletera}
              totalGeneral={totalGeneral}
              montoCajaInicio={montoCajaInicio}
              ventasEfectivoCount={
                ventasDelDia.filter((v) =>
                  desglosePagosVenta(v).some((p) => p.metodo.toLowerCase() === 'efectivo' && p.monto > 0)
                ).length
              }
              ventasTransferenciaCount={
                ventasDelDia.filter((v) =>
                  desglosePagosVenta(v).some((p) => p.metodo.toLowerCase() === 'transferencia' && p.monto > 0)
                ).length
              }
              ventasOtrosCount={
                ventasDelDia.filter((v) =>
                  desglosePagosVenta(v).some((p) => {
                    const m = p.metodo.toLowerCase();
                    return m !== 'efectivo' && m !== 'transferencia' && p.monto > 0;
                  })
                ).length
              }
              conteoBilletes={conteoBilletes}
              onConteoChange={actualizarConteoBillete}
              onLimpiarConteo={limpiarConteoBilletes}
              totalContadoBilletes={totalContadoBilletes}
              diferenciaArqueo={diferenciaArqueo}
              resumenMetodosPago={resumenMetodosPago}
              cierreYaEnviado={cierreYaEnviado}
              cierreEnProceso={cierreEnProceso}
              onCerrarCaja={realizarCierreCaja}
              formatMoney={formatMoney}
              denominacionesBilletes={denominacionesBilletes}
              onAgregarDenominacion={agregarDenominacionBillete}
              onEliminarDenominacion={eliminarDenominacionBillete}
              onEditarDenominacion={editarDenominacionBillete}
            />
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="consumo">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Empleados Compacta */}
          <Card className="lg:col-span-1 p-3 bg-slate-50 h-fit">
            <h3 className="font-bold text-sm mb-3 text-slate-800 uppercase tracking-tight">Equipo GoWash</h3>
            <div className="space-y-1.5 mb-3">
              {listaEmpleados.map((emp) => (
                <div 
                  key={emp}
                  className={`flex justify-between items-center p-1.5 rounded transition-all ${
                    empleadoConsumoSeleccionado === emp 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
                  }`}
                  onClick={() => setEmpleadoConsumoSeleccionado(emp)}
                >
                  <span className="text-xs font-bold">{emp}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); eliminarEmpleado(emp); }}
                      className="text-[8px] bg-red-100 text-red-600 px-1 py-0.5 rounded hover:bg-red-200 font-black uppercase"
                    >
                      X
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

        {/* Historial de Consumos Liquidados */}
        <div className="mt-8 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-slate-800">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Historial de Consumos Liquidados
            </h3>
            {historialConsumosEmpleados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay consumos liquidados recientemente</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                      <th className="border p-3">Fecha/Hora</th>
                      <th className="border p-3">Empleado</th>
                      <th className="border p-3">Productos</th>
                      <th className="border p-3">Subtotal</th>
                      <th className="border p-3">Desc.</th>
                      <th className="border p-3">Total</th>
                      <th className="border p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialConsumosEmpleados.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 border-b">
                        <td className="p-3 text-center text-xs">
                          <span className="block font-bold">{h.fecha}</span>
                          <span className="text-slate-400">{h.hora}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{h.empleado}</td>
                        <td className="p-3 text-xs">
                          <ul className="list-disc list-inside">
                            {h.productos.map((p, i) => (
                              <li key={i} className="truncate max-w-[200px]">{p.nombre}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-3 text-right text-slate-400 italic line-through">{formatMoney(h.subtotal)}</td>
                        <td className="p-3 text-center text-xs font-bold text-green-600">{h.descuentoPorcentaje}%</td>
                        <td className="p-3 text-right font-black text-red-600">{formatMoney(h.total)}</td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-[10px]"
                              onClick={() => cargarConsumoParaEditar(h)}
                            >
                              Editar
                            </Button>
                            {isAdmin && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="h-8 text-[10px]">Eliminar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                    <AlertDialogDescription>Esta acción quedará registrada en el log de auditoría.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => eliminarHistorialConsumo(h.id)} className="bg-red-600">Confirmar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Cambios y Registro (Solo Admin) */}
          {isAdmin && (
            <Card className="p-6 border-2 border-amber-200 bg-amber-50/30">
              <h3 className="font-bold text-xl mb-4 text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                Cambios y Registro (Empleados)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {auditLogs.filter(l => l.tipo === 'CONSUMO_EMPLEADO').length === 0 ? (
                  <p className="text-slate-400 text-center py-4 italic text-sm">No hay actividad sospechosa registrada</p>
                ) : (
                  auditLogs.filter(l => l.tipo === 'CONSUMO_EMPLEADO').map((log) => (
                    <div key={log.id} className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.accion === 'ELIMINACION' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {log.accion}
                        </span>
                        <div className="flex-1">
                          {editingLogId === log.id ? (
                            <div className="flex gap-2">
                              <Input 
                                value={editingLogText} 
                                onChange={(e) => setEditingLogText(e.target.value)}
                                className="h-7 text-xs"
                              />
                              <Button size="sm" className="h-7 px-2 bg-green-600 text-white" onClick={() => guardarEdicionLog(log.id)}>✓</Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-slate-800">{log.detalles}</p>
                              <p className="text-[10px] text-slate-400">{log.fecha}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-slate-400 hover:text-amber-600"
                          onClick={() => { setEditingLogId(log.id); setEditingLogText(log.detalles); }}
                        >
                          ✎
                        </Button>
                        <span className="text-[9px] font-mono text-slate-300">ID: {log.registroId}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="precios">
        <EditorPrecios
          serviciosLavado={serviciosLavado}
          setServiciosLavado={setServiciosLavado}
          barProductsData={barProductsData}
          setBarProductsData={setBarProductsData}
          cosmeticosData={cosmeticosData}
          setCosmeticosData={setCosmeticosData}
        />
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

      <Dialog open={showNewMetodoPagoDialog} onOpenChange={setShowNewMetodoPagoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Método de Pago</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newMetodoPagoName">Nombre del Método de Pago</Label>
            <Input 
              id="newMetodoPagoName" 
              value={newMetodoPagoName} 
              onChange={(e) => setNewMetodoPagoName(e.target.value)}
              placeholder="Ej: BNA+, MercadoPago..."
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewMetodoPagoDialog(false)}>Cancelar</Button>
            <Button onClick={agregarMetodoPago} className="bg-blue-600 text-white">Guardar Método</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
