import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, Trash2, FileText, History } from 'lucide-react';
import { googleSheetsSync } from '../lib/googleSheetsSync';


interface Gasto {
  id: string;
  fecha: string;
  hora: string;
  categoria: string;
  descripcion: string;
  monto: number;
  metodoPago: 'efectivo' | 'digital';
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

const CATEGORIAS_GASTOS = [
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
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'digital'>('efectivo');
  const [empleado, setEmpleado] = useState('');
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

  const registrarGasto = () => {
    if (!fecha || !hora || !categoria || !descripcion || monto <= 0) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (editingGasto) {
      const gastosActualizados = gastos.map(g => 
        g.id === editingGasto.id 
          ? { ...g, fecha, hora, categoria, descripcion, monto, metodoPago, empleado } 
          : g
      );
      setGastos(gastosActualizados);
      setEditingGasto(null);
    } else {
      const nuevoGasto: Gasto = {
        id: Date.now().toString(),
        fecha,
        hora,
        categoria,
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
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setHora(`${hours}:${minutes}`);
    setCategoria('');
    setDescripcion('');
    setMonto(0);
    setMetodoPago('efectivo');
    setEmpleado('');
    setEditingGasto(null);
  };

  const prepararEdicion = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setFecha(gasto.fecha);
    setHora(gasto.hora);
    setCategoria(gasto.categoria);
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
    const categoriaMatch = filtroCategoria === 'todas' || gasto.categoria === filtroCategoria;
    const fechaInicioMatch = !filtroFechaInicio || gasto.fecha >= filtroFechaInicio;
    const fechaFinMatch = !filtroFechaFin || gasto.fecha <= filtroFechaFin;
    return categoriaMatch && fechaInicioMatch && fechaFinMatch;
  });

  // Calcular totales
  const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.monto, 0);
  const totalEfectivo = gastosFiltrados.filter(g => g.metodoPago === 'efectivo').reduce((sum, g) => sum + g.monto, 0);
  const totalDigital = gastosFiltrados.filter(g => g.metodoPago === 'digital').reduce((sum, g) => sum + g.monto, 0);

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

      <TabsContent value="gastos" className="space-y-6">
      {/* Formulario de registro de gastos */}
      <Card id="formulario-gasto" className={`p-6 border-2 transition-all duration-300 ${
        editingGasto 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-blue-100' 
          : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
      }`}>
        <h3 className={`font-bold text-xl mb-4 ${editingGasto ? 'text-blue-900' : 'text-red-900'}`}>
          {editingGasto ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="gastoFecha">Fecha</Label>
            <Input
              id="gastoFecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="gastoHora">Hora</Label>
            <Input
              id="gastoHora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="gastoEmpleado">Registrado por</Label>
            <Input
              id="gastoEmpleado"
              value={empleado}
              onChange={(e) => setEmpleado(e.target.value)}
              placeholder="Nombre del empleado"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="gastoCategoria">Categoría</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_GASTOS.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gastoMonto">Monto</Label>
            <Input
              id="gastoMonto"
              type="number"
              value={monto || ''}
              onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="gastoMetodoPago">Método de Pago</Label>
            <Select value={metodoPago} onValueChange={(val) => setMetodoPago(val as 'efectivo' | 'digital')}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <Label htmlFor="gastoDescripcion">Descripción</Label>
            <Input
              id="gastoDescripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el gasto..."
              className="bg-white"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={registrarGasto}
            className={`flex-1 text-white ${
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
            className="flex-1"
          >
            {editingGasto ? 'Cancelar' : 'Limpiar'}
          </Button>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200">
        <h3 className="font-bold text-lg mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filtroCategoria">Categoría</Label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {CATEGORIAS_GASTOS.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filtroFechaInicio">Fecha Inicio</Label>
            <Input
              id="filtroFechaInicio"
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="filtroFechaFin">Fecha Fin</Label>
            <Input
              id="filtroFechaFin"
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Resumen de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
          <h3 className="font-bold text-red-900 mb-2">Total Gastos</h3>
          <p className="text-3xl font-bold text-red-700">{formatMoney(totalGastos)}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <h3 className="font-bold text-green-900 mb-2">Efectivo</h3>
          <p className="text-3xl font-bold text-green-700">{formatMoney(totalEfectivo)}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
          <h3 className="font-bold text-blue-900 mb-2">Digital</h3>
          <p className="text-3xl font-bold text-blue-700">{formatMoney(totalDigital)}</p>
        </Card>
      </div>

      {/* Gastos por categoría */}
      {Object.keys(totalesPorCategoria).length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-xl mb-4">Gastos por Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(totalesPorCategoria).map(([cat, total]) => (
              <div key={cat} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-1">{cat}</p>
                <p className="text-xl font-bold text-purple-700">{formatMoney(total)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabla de gastos */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-4">Registro de Gastos</h3>

        {gastosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay gastos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="border p-2">Fecha</th>
                  <th className="border p-2">Hora</th>
                  <th className="border p-2">Categoría</th>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Monto</th>
                  <th className="border p-2">Método</th>
                  <th className="border p-2">Registrado por</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{gasto.fecha}</td>
                    <td className="border p-2 text-center">{gasto.hora}</td>
                    <td className="border p-2">{gasto.categoria}</td>
                    <td className="border p-2">{gasto.descripcion}</td>
                    <td className="border p-2 text-right font-bold text-red-600">{formatMoney(gasto.monto)}</td>
                    <td className="border p-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        gasto.metodoPago === 'efectivo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {gasto.metodoPago === 'efectivo' ? 'Efectivo' : 'Digital'}
                      </span>
                    </td>
                    <td className="border p-2">{gasto.empleado}</td>
                    <td className="border p-2 text-center">
                      {isAdmin && (
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => prepararEdicion(gasto)}
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
                                <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el gasto de {formatMoney(gasto.monto)}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => eliminarGasto(gasto.id)}>
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
              <History className="w-6 h-6" />
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
    </Tabs>
  );
}
