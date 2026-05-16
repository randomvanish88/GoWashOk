import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertCircle, Trash2, FileText, RotateCcw } from 'lucide-react';
import { googleSheetsSync } from '../lib/googleSheetsSync';


interface Gasto {
  id: string;
  fecha: string;
  sector: string;
  categoria: string;
  proveedor: string;
  descripcion: string;
  monto: number;
  metodoPago: string;
  empleado: string;
}

interface VentaAnulada {
  id: string;
  fecha: string;
  patente: string;
  cliente: string;
  total: number;
  motivoAnulacion: string;
  fechaAnulacion: string;
  empleado: string;
}

const SECTORES_INICIALES = ['Lavadero', 'Bar', 'Cosmética'];

const CATEGORIAS_INICIALES = [
  'Servicios (luz, agua, gas)',
  'Compra de insumos',
  'Mantenimiento',
  'Salarios',
  'Alquiler',
  'Marketing',
  'Impuestos',
  'Otros'
];

export function Gastos({ isAdmin = false }: { isAdmin?: boolean }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [sector, setSector] = useState('');
  const [sectores, setSectores] = useState<string[]>(SECTORES_INICIALES);
  const [showNewSectorDialog, setShowNewSectorDialog] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [proveedores, setProveedores] = useState<string[]>(['Particular', 'Distribuidora Central']);
  const [showNewProveedorDialog, setShowNewProveedorDialog] = useState(false);
  const [newProveedorName, setNewProveedorName] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<string[]>(CATEGORIAS_INICIALES);
  const [showNewCategoriaDialog, setShowNewCategoriaDialog] = useState(false);
  const [newCategoriaName, setNewCategoriaName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [metodosPago, setMetodosPago] = useState<string[]>(['Efectivo', 'Digital']);
  const [showNewMetodoPagoDialog, setShowNewMetodoPagoDialog] = useState(false);
  const [newMetodoPagoName, setNewMetodoPagoName] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [filtroSector, setFiltroSector] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [ventasAnuladas, setVentasAnuladas] = useState<VentaAnulada[]>([]);

  // Cargar gastos desde localStorage
  useEffect(() => {
    const savedGastos = localStorage.getItem('gowash-gastos');
    if (savedGastos) {
      setGastos(JSON.parse(savedGastos));
    }

    const savedAnuladas = localStorage.getItem('gowash-ventas-anuladas');
    if (savedAnuladas) {
      setVentasAnuladas(JSON.parse(savedAnuladas));
    }

    const savedSectores = localStorage.getItem('gowash-sectores-gastos');
    if (savedSectores) {
      setSectores(JSON.parse(savedSectores));
    }

    const savedProveedores = localStorage.getItem('gowash-proveedores-gastos');
    if (savedProveedores) {
      setProveedores(JSON.parse(savedProveedores));
    }

    const savedCategorias = localStorage.getItem('gowash-categorias-gastos');
    if (savedCategorias) {
      setCategorias(JSON.parse(savedCategorias));
    }

    const savedMetodosPago = localStorage.getItem('gowash-metodos-pago-gastos');
    if (savedMetodosPago) {
      setMetodosPago(JSON.parse(savedMetodosPago));
    }

    // Establecer fecha y hora actual
    const now = new Date();
    setFecha(now.toISOString().split('T')[0]);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setHora(`${hours}:${minutes}`);
  }, []);

  // Guardar gastos en localStorage
  useEffect(() => {
    if (gastos.length > 0 || localStorage.getItem('gowash-gastos')) {
      localStorage.setItem('gowash-gastos', JSON.stringify(gastos));
    }
  }, [gastos]);

  const formatMoney = (amount: number) => {
    return `$${parseFloat(amount.toString()).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const agregarSector = () => {
    if (!newSectorName.trim()) return;
    if (sectores.includes(newSectorName.trim())) {
      alert('Este sector ya existe');
      return;
    }
    const nuevosSectores = [...sectores, newSectorName.trim()];
    setSectores(nuevosSectores);
    localStorage.setItem('gowash-sectores-gastos', JSON.stringify(nuevosSectores));
    setSector(newSectorName.trim());
    setNewSectorName('');
    setShowNewSectorDialog(false);
  };

  const agregarProveedor = () => {
    if (!newProveedorName.trim()) return;
    if (proveedores.includes(newProveedorName.trim())) {
      alert('Este proveedor ya existe');
      return;
    }
    const nuevosProveedores = [...proveedores, newProveedorName.trim()];
    setProveedores(nuevosProveedores);
    localStorage.setItem('gowash-proveedores-gastos', JSON.stringify(nuevosProveedores));
    setProveedor(newProveedorName.trim());
    setNewProveedorName('');
    setShowNewProveedorDialog(false);
  };

  const agregarCategoria = () => {
    if (!newCategoriaName.trim()) return;
    if (categorias.includes(newCategoriaName.trim())) {
      alert('Esta categoría ya existe');
      return;
    }
    const nuevasCategorias = [...categorias, newCategoriaName.trim()];
    setCategorias(nuevasCategorias);
    localStorage.setItem('gowash-categorias-gastos', JSON.stringify(nuevasCategorias));
    setCategoria(newCategoriaName.trim());
    setNewCategoriaName('');
    setShowNewCategoriaDialog(false);
  };

  const agregarMetodoPago = () => {
    if (!newMetodoPagoName.trim()) return;
    if (metodosPago.includes(newMetodoPagoName.trim())) {
      alert('Este método de pago ya existe');
      return;
    }
    const nuevosMetodos = [...metodosPago, newMetodoPagoName.trim()];
    setMetodosPago(nuevosMetodos);
    localStorage.setItem('gowash-metodos-pago-gastos', JSON.stringify(nuevosMetodos));
    setMetodoPago(newMetodoPagoName.trim());
    setNewMetodoPagoName('');
    setShowNewMetodoPagoDialog(false);
  };

  const registrarGasto = () => {
    // Validar campos obligatorios
    const faltantes = [];
    if (!fecha) faltantes.push("Fecha");
    if (!sector) faltantes.push("Sector");
    if (!categoria) faltantes.push("Categoría");
    if (!proveedor) faltantes.push("Proveedor");
    if (monto <= 0) faltantes.push("Monto (debe ser mayor a 0)");

    if (faltantes.length > 0) {
      alert(`Por favor completa los siguientes campos:\n- ${faltantes.join('\n- ')}`);
      return;
    }

    if (editingGasto) {
      const gastosActualizados = gastos.map(g => 
        g.id === editingGasto.id 
          ? { ...g, fecha, sector, categoria, proveedor, descripcion, monto, metodoPago, empleado } 
          : g
      );
      setGastos(gastosActualizados);
      setEditingGasto(null);
    } else {
      const nuevoGasto: Gasto = {
        id: Date.now().toString(),
        fecha,
        sector,
        categoria,
        proveedor,
        descripcion,
        monto,
        metodoPago,
        empleado
      };
      setGastos([...gastos, nuevoGasto]);
      
      // Sincronizar con Google Sheets
      googleSheetsSync.syncGasto(nuevoGasto);
    }
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    const now = new Date();
    setFecha(now.toISOString().split('T')[0]);
    setSector('');
    setProveedor('');
    setCategoria('');
    setDescripcion('');
    setMonto(0);
    setMetodoPago('Efectivo');
    setEmpleado('');
    setEditingGasto(null);
  };

  const prepararEdicion = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setFecha(gasto.fecha);
    setSector(gasto.sector);
    setCategoria(gasto.categoria);
    setProveedor(gasto.proveedor || '');
    setDescripcion(gasto.descripcion);
    setMonto(gasto.monto);
    setMetodoPago(gasto.metodoPago);
    setEmpleado(gasto.empleado);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarGasto = (id: string) => {
    setGastos(gastos.filter(g => g.id !== id));
  };

  // Filtrar gastos
  const gastosFiltrados = gastos.filter(gasto => {
    const sectorMatch = filtroSector === 'todos' || gasto.sector === filtroSector;
    const categoriaMatch = filtroCategoria === 'todas' || gasto.categoria === filtroCategoria;
    const fechaInicioMatch = !filtroFechaInicio || gasto.fecha >= filtroFechaInicio;
    const fechaFinMatch = !filtroFechaFin || gasto.fecha <= filtroFechaFin;
    return sectorMatch && categoriaMatch && fechaInicioMatch && fechaFinMatch;
  });

  // Calcular totales
  const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.monto, 0);
  const totalEfectivo = gastosFiltrados.filter(g => g.metodoPago.toLowerCase() === 'efectivo').reduce((sum, g) => sum + g.monto, 0);
  const totalDigital = gastosFiltrados.filter(g => g.metodoPago.toLowerCase() !== 'efectivo').reduce((sum, g) => sum + g.monto, 0);

  // Calcular totales por categoría
  const totalesPorCategoria = gastosFiltrados.reduce((acc, gasto) => {
    if (!acc[gasto.categoria]) {
      acc[gasto.categoria] = 0;
    }
    acc[gasto.categoria] += gasto.monto;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Tabs defaultValue="gastos" className="space-y-6">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-lg">
        <TabsTrigger value="gastos" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Gastos
        </TabsTrigger>
        <TabsTrigger value="anuladas" className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Ventas Anuladas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gastos" className="space-y-3">
      {/* Formulario de registro de gastos */}
      <Card id="formulario-gasto" className={`p-3 border-2 transition-all duration-300 ${
        editingGasto 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300' 
          : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
      }`}>
        <h3 className={`font-bold text-sm mb-2 ${editingGasto ? 'text-blue-900' : 'text-red-900'}`}>
          {editingGasto ? 'Editar Gasto' : 'Registrar Gasto'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-1.5">
          {/* 1. Sector */}
          <div>
            <Label htmlFor="gastoSector" className="text-[10px] uppercase font-bold text-gray-500">Sector</Label>
            <Select 
              value={sector} 
              onValueChange={(val) => {
                if (val === 'NEW_SECTOR') {
                  setShowNewSectorDialog(true);
                } else {
                  setSector(val);
                }
              }}
            >
              <SelectTrigger className="bg-white h-7 text-xs">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectores.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                <SelectItem value="NEW_SECTOR" className="text-blue-600 font-bold border-t text-xs">
                  + Nuevo Sector
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Categoría */}
          <div>
            <Label htmlFor="gastoCategoria" className="text-[10px] uppercase font-bold text-gray-500">Categoría</Label>
            <Select 
              value={categoria} 
              onValueChange={(val) => {
                if (val === 'NEW_CATEGORIA') {
                  setShowNewCategoriaDialog(true);
                } else {
                  setCategoria(val);
                }
              }}
            >
              <SelectTrigger className="bg-white h-7 text-xs">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="NEW_CATEGORIA" className="text-blue-600 font-bold border-t text-xs">
                  + Nueva Categoría
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Proveedor */}
          <div>
            <Label htmlFor="gastoProveedor" className="text-[10px] uppercase font-bold text-gray-500">Proveedor</Label>
            <Select 
              value={proveedor} 
              onValueChange={(val) => {
                if (val === 'NEW_PROVEEDOR') {
                  setShowNewProveedorDialog(true);
                } else {
                  setProveedor(val);
                }
              }}
            >
              <SelectTrigger className="bg-white h-7 text-xs">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
                <SelectItem value="NEW_PROVEEDOR" className="text-blue-600 font-bold border-t text-xs">
                  + Nuevo Proveedor
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. Fecha */}
          <div>
            <Label htmlFor="gastoFecha" className="text-[10px] uppercase font-bold text-gray-500">Fecha</Label>
            <Input
              id="gastoFecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-white h-7 text-xs px-2"
            />
          </div>

          {/* 5. Empleado */}
          <div>
            <Label htmlFor="gastoEmpleado" className="text-[10px] uppercase font-bold text-gray-500">Registrado por</Label>
            <Input
              id="gastoEmpleado"
              value={empleado}
              onChange={(e) => setEmpleado(e.target.value)}
              placeholder="Nombre"
              className="bg-white h-7 text-xs px-2"
            />
          </div>

          {/* 6. Monto */}
          <div>
            <Label htmlFor="gastoMonto" className="text-[10px] uppercase font-bold text-gray-500">Monto</Label>
            <Input
              id="gastoMonto"
              type="number"
              value={monto || ''}
              onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="bg-white h-7 text-xs px-2"
            />
          </div>

          {/* 7. Pago */}
          <div>
            <Label htmlFor="gastoMetodoPago" className="text-[10px] uppercase font-bold text-gray-500">Pago</Label>
            <Select 
              value={metodoPago} 
              onValueChange={(val) => {
                if (val === 'NEW_METODO_PAGO') {
                  setShowNewMetodoPagoDialog(true);
                } else {
                  setMetodoPago(val);
                }
              }}
            >
              <SelectTrigger className="bg-white h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metodosPago.map(m => (
                  <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                ))}
                <SelectItem value="NEW_METODO_PAGO" className="text-blue-600 font-bold border-t text-xs">
                  + Nuevo Método
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 8. Descripción */}
          <div className="md:col-span-2 lg:col-span-1">
            <Label htmlFor="gastoDescripcion" className="text-[10px] uppercase font-bold text-gray-500">Descripción</Label>
            <Input
              id="gastoDescripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción..."
              className="bg-white h-7 text-xs px-2"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <Button
            onClick={registrarGasto}
            className={`flex-1 text-white h-9 ${
              editingGasto 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {editingGasto ? 'Actualizar Gasto' : 'Registrar Gasto'}
          </Button>
          <Button
            onClick={limpiarFormulario}
            variant="outline"
            className="flex-1 h-9"
          >
            {editingGasto ? 'Cancelar' : 'Limpiar'}
          </Button>
        </div>
      </Card>

      {/* Resumen de Gastos Compacto */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
          <p className="text-[10px] font-bold text-red-900 uppercase">Total</p>
          <p className="text-lg font-black text-red-700">{formatMoney(totalGastos)}</p>
        </Card>
        <Card className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <p className="text-[10px] font-bold text-green-900 uppercase">Efectivo</p>
          <p className="text-lg font-black text-green-700">{formatMoney(totalEfectivo)}</p>
        </Card>
        <Card className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <p className="text-[10px] font-bold text-blue-900 uppercase">Digital</p>
          <p className="text-lg font-black text-blue-700">{formatMoney(totalDigital)}</p>
        </Card>
      </div>

      {/* Gastos por categoría Ultra-Compacto */}
      {Object.keys(totalesPorCategoria).length > 0 && (
        <Card className="p-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(totalesPorCategoria).map(([cat, total]) => (
              <div key={cat} className="bg-slate-50 px-2 py-1 rounded border border-slate-200 flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase">{cat}:</span>
                <span className="text-xs font-bold text-slate-900">{formatMoney(total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabla de gastos */}
      <Card className="p-2">
        <h3 className="font-bold text-xs mb-2 uppercase tracking-tighter text-slate-500">Registro de Gastos</h3>

        {gastosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay gastos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-600 text-white text-xs">
                  <th className="border p-1.5">Fecha</th>
                  <th className="border p-1.5">Sector</th>
                  <th className="border p-1.5">Categoría</th>
                  <th className="border p-1.5">Descripción</th>
                  <th className="border p-1.5">Monto</th>
                  <th className="border p-1.5">Método</th>
                  <th className="border p-1.5">Registrado por</th>
                  <th className="border p-1.5">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="border p-1.5 text-center text-[10px]">{gasto.fecha}</td>
                    <td className="border p-1.5 text-center">
                      <span className="px-1.5 py-0 bg-gray-100 rounded text-[9px] font-bold text-gray-600 uppercase border">
                        {gasto.sector}
                      </span>
                    </td>
                    <td className="border p-1.5 text-xs">
                      <p className="font-bold">{gasto.categoria}</p>
                      <p className="text-[9px] text-gray-400">Prov: {gasto.proveedor}</p>
                    </td>
                    <td className="border p-1.5 text-[10px] italic">{gasto.descripcion}</td>
                    <td className="border p-1.5 text-right font-bold text-red-600 text-xs">{formatMoney(gasto.monto)}</td>
                    <td className="border p-1.5 text-center">
                      <span className={`px-1.5 py-0 rounded-full text-[9px] ${
                        gasto.metodoPago === 'efectivo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {gasto.metodoPago === 'efectivo' ? 'Efectivo' : 'Digital'}
                      </span>
                    </td>
                    <td className="border p-1.5 text-[10px]">{gasto.empleado}</td>
                    <td className="border p-2 text-center">
                      {isAdmin && (
                        <div className="flex gap-2 justify-center items-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 px-2"
                            onClick={() => prepararEdicion(gasto)}
                            title="Editar"
                          >
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el registro de {formatMoney(gasto.monto)}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => eliminarGasto(gasto.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </TabsContent>

      <TabsContent value="anuladas">
        <Card className="p-6 border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-red-900 flex items-center gap-2">
              <RotateCcw className="w-6 h-6" />
              Control de Ventas y Pedidos Anulados
            </h3>
            <div className="text-sm text-red-600 font-medium bg-red-100 px-3 py-1 rounded-full">
              {ventasAnuladas.length} registros
            </div>
          </div>

          {ventasAnuladas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-red-200">
              <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <p className="text-red-400 font-medium">No hay ventas anuladas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border-b p-3 text-left">Fecha Venta</th>
                    <th className="border-b p-3 text-left">Vehículo / Cliente</th>
                    <th className="border-b p-3 text-right">Monto</th>
                    <th className="border-b p-3 text-left">Motivo de Anulación</th>
                    <th className="border-b p-3 text-left">Fecha Anulación</th>
                    <th className="border-b p-3 text-left">Empleado</th>
                    <th className="border-b p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[...ventasAnuladas].reverse().map((venta) => (
                    <tr key={venta.id} className="hover:bg-red-50 transition-colors border-b border-red-100">
                      <td className="p-3 text-sm">{venta.fecha}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{venta.patente || 'S/P'}</div>
                        <div className="text-xs text-slate-500">{venta.cliente || '-'}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700">{formatMoney(venta.total)}</td>
                      <td className="p-3">
                        <div className="bg-red-100 text-red-800 p-2 rounded text-sm italic border border-red-200">
                          "{venta.motivoAnulacion}"
                        </div>
                      </td>
                      <td className="p-3 text-xs text-slate-600">{venta.fechaAnulacion}</td>
                      <td className="p-3 text-sm">{venta.empleado}</td>
                      <td className="p-3 text-center">
                        {isAdmin ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-100 p-2 h-8 w-8">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se borrará definitivamente el registro de esta anulación.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    const nuevas = ventasAnuladas.filter(v => v.id !== venta.id);
                                    setVentasAnuladas(nuevas);
                                    localStorage.setItem('gowash-ventas-anuladas', JSON.stringify(nuevas));
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </TabsContent>
      <Dialog open={showNewSectorDialog} onOpenChange={setShowNewSectorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Sector</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newSectorName">Nombre del Sector</Label>
            <Input 
              id="newSectorName" 
              value={newSectorName} 
              onChange={(e) => setNewSectorName(e.target.value)}
              placeholder="Ej: Mantenimiento, Administración..."
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewSectorDialog(false)}>Cancelar</Button>
            <Button onClick={agregarSector} className="bg-blue-600 text-white">Guardar Sector</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewProveedorDialog} onOpenChange={setShowNewProveedorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newProveedorName">Nombre del Proveedor</Label>
            <Input 
              id="newProveedorName" 
              value={newProveedorName} 
              onChange={(e) => setNewProveedorName(e.target.value)}
              placeholder="Ej: Coca-Cola, Distribuidora X..."
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewProveedorDialog(false)}>Cancelar</Button>
            <Button onClick={agregarProveedor} className="bg-blue-600 text-white">Guardar Proveedor</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewCategoriaDialog} onOpenChange={setShowNewCategoriaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Categoría</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newCategoriaName">Nombre de la Categoría</Label>
            <Input 
              id="newCategoriaName" 
              value={newCategoriaName} 
              onChange={(e) => setNewCategoriaName(e.target.value)}
              placeholder="Ej: Insumos de Limpieza, Repuestos..."
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewCategoriaDialog(false)}>Cancelar</Button>
            <Button onClick={agregarCategoria} className="bg-blue-600 text-white">Guardar Categoría</Button>
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
              placeholder="Ej: Transferencia Galicia, MercadoPago..."
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
