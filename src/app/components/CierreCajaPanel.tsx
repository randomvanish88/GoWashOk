import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Banknote, ChevronDown, CloudUpload, Pencil, Plus, Trash2 } from 'lucide-react';
import { EditableNumberInput } from './EditableNumberInput';
import { useGastos } from './useGastos';
import { desglosePagosGasto, formatMetodoPagoGastoDisplay } from './pagoMixto';

import { googleSheetsSync } from '../lib/googleSheetsSync';

export const DEFAULT_DENOMINACIONES_ARS = [50, 100, 200, 500, 1000, 2000, 10000, 20000];

export interface ResumenMetodoPago {
  metodo: string;
  total: number;
  cantidad: number;
}

export interface DetalleSector {
  nombre: string;
  totalVentas: number;
  cantidadVentas: number;
  metodosPago: { metodo: string; total: number; cantidad: number }[];
}

interface CierreCajaPanelProps {
  fechaCierre: string;
  onFechaCierreChange: (fecha: string) => void;
  ventasDelDiaCount: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalBilletera: number;
  totalGeneral: number;
  montoCajaInicio: number;
  clientesLavadero: number;
  clientesBar: number;
  clientesCosmetica: number;
  ventasLavadero: number;
  ventasBar: number;
  ventasCosmetica: number;
  detallesPorSector: DetalleSector[];
  conteoBilletes: Record<string, number>;
  onConteoChange: (valor: number, cantidad: number) => void;
  onLimpiarConteo: () => void;
  totalContadoBilletes: number;
  diferenciaArqueo: number;
  resumenMetodosPago: ResumenMetodoPago[];
  cantidadPromos?: number;
  cierreYaEnviado: boolean;
  cierreEnProceso: boolean;
  onCerrarCaja: () => void;
  formatMoney: (amount: number) => string;
  denominacionesBilletes: number[];
  onAgregarDenominacion: (valor: number) => void;
  onEliminarDenominacion: (valor: number) => void;
  onEditarDenominacion: (valorAnterior: number, valorNuevo: number) => void;
  isAdmin?: boolean;
}

export function CierreCajaPanel({
  fechaCierre,
  onFechaCierreChange,
  ventasDelDiaCount,
  totalEfectivo,
  totalTransferencia,
  totalBilletera,
  totalGeneral,
  montoCajaInicio,
  clientesLavadero,
  clientesBar,
  clientesCosmetica,
  ventasLavadero,
  ventasBar,
  ventasCosmetica,
  detallesPorSector,
  conteoBilletes,
  onConteoChange,
  onLimpiarConteo,
  totalContadoBilletes,
  diferenciaArqueo,
  resumenMetodosPago,
  cantidadPromos: cantidadPromosProp,
  cierreYaEnviado,
  cierreEnProceso,
  onCerrarCaja,
  formatMoney,
  denominacionesBilletes,
  onAgregarDenominacion,
  onEliminarDenominacion,
  onEditarDenominacion,
  isAdmin = false,
}: CierreCajaPanelProps) {



  const [arqueoAbierto, setArqueoAbierto] = useState(false);
  const [composicionAbierto, setComposicionAbierto] = useState(false);
  const [gastosAbierto, setGastosAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [editorDenomsAbierto, setEditorDenomsAbierto] = useState(false);
  const [nuevaDenominacion, setNuevaDenominacion] = useState('');
  const [denomEditando, setDenomEditando] = useState<number | null>(null);
  const [denomEditandoValor, setDenomEditandoValor] = useState('');

  // Columnas editables del Desglose General
  const [metodosDesgloseGeneral, setMetodosDesgloseGeneral] = useState<string[]>(() => {
    const saved = localStorage.getItem('gowash-desglose-metodos');
    return saved ? JSON.parse(saved) : ['Digital', 'Efectivo', 'Tarjeta'];
  });
  const [editorDesgloseAbierto, setEditorDesgloseAbierto] = useState(false);
  const [nuevoMetodoDesglose, setNuevoMetodoDesglose] = useState('');
  const [desgloseEditando, setDesgloseEditando] = useState<string | null>(null);
  const [desgloseEditandoValor, setDesgloseEditandoValor] = useState('');

  useEffect(() => {
    localStorage.setItem('gowash-desglose-metodos', JSON.stringify(metodosDesgloseGeneral));
  }, [metodosDesgloseGeneral]);

  const { gastos, sectores, categorias, proveedores, metodosPago, eliminarGasto } = useGastos();
  const [filtroSector, setFiltroSector] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroProveedor, setFiltroProveedor] = useState('Todos');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('Todos');
  const [filtroOrden, setFiltroOrden] = useState('Más reciente');
  const [incluirGastosEnCierre, setIncluirGastosEnCierre] = useState(true);

  let gastosDelDia = gastos.filter(g => {
    const deHoy = g.fecha === fechaCierre;
    const sectorMatch = filtroSector === 'Todos' || g.sector === filtroSector;
    const categoriaMatch = filtroCategoria === 'Todas' || g.categoria === filtroCategoria;
    const proveedorMatch = filtroProveedor === 'Todos' || g.proveedor === filtroProveedor;
    const metodoMatch = filtroMetodoPago === 'Todos' || g.metodoPago === filtroMetodoPago;
    return deHoy && sectorMatch && categoriaMatch && proveedorMatch && metodoMatch;
  });

  if (filtroOrden === 'Mayor gasto') {
    gastosDelDia.sort((a, b) => b.monto - a.monto);
  } else if (filtroOrden === 'Menor gasto') {
    gastosDelDia.sort((a, b) => a.monto - b.monto);
  } else {
    // Más reciente (por defecto, asumiendo que los últimos están al final)
    gastosDelDia.reverse();
  }

  // Todos los gastos del día (sin filtros) para el cierre
  const todosLosGastosDelDia = gastos.filter(g => g.fecha === fechaCierre);
  const totalGastosDia = todosLosGastosDelDia.reduce((sum, g) => sum + g.monto, 0);

  const denomsOrdenadas = [...denominacionesBilletes].sort((a, b) => a - b);

  // Lógica central: total esperado = inicio de caja + TODAS las ventas del día
  const totalEsperado = montoCajaInicio + totalGeneral;
  // Total neto considerando gastos (opcional)
  const totalEsperadoNeto = incluirGastosEnCierre ? totalEsperado - totalGastosDia : totalEsperado;

  const metodosUnicos = metodosDesgloseGeneral;
  const cantidadPromos = cantidadPromosProp !== undefined ? cantidadPromosProp : (resumenMetodosPago.find(r => r.metodo.toLowerCase() === 'promo')?.cantidad || 0);
  
  // Combine Promo into Efectivo for the table
  const resumenParaTabla = resumenMetodosPago.reduce((acc, curr) => {
    const isPromo = curr.metodo.toLowerCase() === 'promo';
    const isEfectivo = curr.metodo.toLowerCase() === 'efectivo';
    
    if (isPromo || isEfectivo) {
      const existing = acc.find(item => item.metodo.toLowerCase() === 'efectivo');
      if (existing) {
        existing.total += curr.total;
        existing.cantidad += curr.cantidad;
      } else {
        acc.push({ metodo: 'Efectivo', total: curr.total, cantidad: curr.cantidad });
      }
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as ResumenMetodoPago[]);

  const metodosGlobalesFiltrados = resumenParaTabla.filter(m => m.total > 0);

  // Desglose de ventas por los 3 métodos fijos
  const ventasPorMetodo = metodosUnicos.map(m => ({
    metodo: m,
    total: resumenMetodosPago
      .filter(r => {
        const met = r.metodo.toLowerCase();
        return met === m.toLowerCase();
      })
      .reduce((sum, r) => sum + r.total, 0)
  }));

  // Desglose de gastos por método de pago
  const gastosPorMetodo = metodosUnicos.map(m => {
    const total = todosLosGastosDelDia.reduce((sum, g) => {
      const pagos = desglosePagosGasto(g as any); // Cast to any to avoid strict type error if Gasto is not fully compatible, though it should be since it has metodoPago, monto, pagosMixtos
      const pagoCorrespondiente = pagos.find(p => p.metodo.toLowerCase() === m.toLowerCase());
      return sum + (pagoCorrespondiente ? pagoCorrespondiente.monto : 0);
    }, 0);
    return { metodo: m, total };
  });

  // Calculate gastos totals by method directly from the day's expenses (case-insensitive)
  let gastosEfectivoDia = 0;
  let gastosTarjetaDia = 0;
  let gastosDigitalDia = 0;

  todosLosGastosDelDia.forEach(g => {
    const pagos = desglosePagosGasto(g as any);
    pagos.forEach(p => {
      const met = p.metodo.toLowerCase().trim();
      if (met === 'efectivo') {
        gastosEfectivoDia += p.monto;
      } else if (met === 'tarjeta' || met === 'debito' || met === 'crédito' || met === 'credito') {
        gastosTarjetaDia += p.monto;
      } else {
        // Any other method (Digital, Transferencia, Mercado Pago, etc.) goes to Digital
        gastosDigitalDia += p.monto;
      }
    });
  });

  const ventasEfectivoDia = ventasPorMetodo.find(v => v.metodo.toLowerCase() === 'efectivo')?.total || 0;
  const efectivoEsperadoCalculado = montoCajaInicio + ventasEfectivoDia - gastosEfectivoDia;
  const diferenciaEfectivoCalculada = totalContadoBilletes - efectivoEsperadoCalculado;

  return (
    <div className="mt-4 space-y-3">

      {/* Header con fecha */}
      <div className="flex flex-wrap items-end justify-between gap-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4 shadow-md">
        <div>
          <h3 className="font-bold text-white text-sm uppercase tracking-tight flex items-center gap-2">
            <Banknote className="w-4 h-4 text-yellow-300" />
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md border border-emerald-600">
              Cierre de caja del día
            </span>
          </h3>
          <p className="text-[10px] text-slate-200 mt-1 font-medium">
            {ventasDelDiaCount} venta{ventasDelDiaCount !== 1 ? 's' : ''} en la fecha seleccionada
            {cierreYaEnviado && (
              <span className="ml-2 text-yellow-200 font-bold bg-yellow-600/40 px-1.5 py-0.5 rounded">
                · Cierre ya enviado
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="fechaCierre" className="text-xs font-bold uppercase text-white shrink-0">
            Fecha
          </Label>
          <Input
            id="fechaCierre"
            type="date"
            value={fechaCierre}
            onChange={(e) => onFechaCierreChange(e.target.value)}
            className="h-8 w-36 text-xs bg-white border-2 border-slate-300 text-slate-900 font-semibold focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Composición del Cierre - Dashboard mejorado */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-bold text-white text-2xl flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
              Composición del Cierre
            </h4>
            <p className="text-slate-400 text-sm mt-1">Estadísticas operativas del día</p>
          </div>
          <button
            onClick={() => setComposicionAbierto(!composicionAbierto)}
            className="flex items-center gap-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-left hover:bg-slate-600 transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-300">
              {composicionAbierto ? 'Ocultar' : 'Mostrar'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${composicionAbierto ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {composicionAbierto && (
          <div className="space-y-6">

            {/* DESGLOSE POR SECTOR CON MÉTODOS DE PAGO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {detallesPorSector.map((sector) => {
                const colores: Record<string, { border: string; bg: string; badge: string; title: string; bar: string; icon: string }> = {
                  'Lavadero':  { border: 'border-blue-500/30',  bg: 'bg-blue-500/10',  badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',  title: 'text-blue-300',  bar: 'bg-blue-500',  icon: '🚗' },
                  'Bar':       { border: 'border-amber-500/30', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', title: 'text-amber-300', bar: 'bg-amber-500', icon: '☕' },
                  'Cosmética': { border: 'border-teal-500/30',  bg: 'bg-teal-500/10',  badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',   title: 'text-teal-300',  bar: 'bg-teal-500',  icon: '✨' },
                };
                const c = colores[sector.nombre] ?? colores['Lavadero'];
                return (
                  <div key={sector.nombre} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                    {/* Header del sector */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                          <h3 className={`font-bold text-base ${c.title}`}>{sector.nombre}</h3>
                          <p className="text-slate-400 text-xs">{sector.cantidadVentas} venta{sector.cantidadVentas !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-black ${c.title}`}>{formatMoney(sector.totalVentas)}</div>
                        <div className="text-slate-500 text-[10px] font-medium uppercase tracking-wide">Total</div>
                      </div>
                    </div>

                    {/* Barra de progreso relativa al total */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4">
                      <div
                        className={`${c.bar} h-full rounded-full transition-all`}
                        style={{ width: totalGeneral > 0 ? `${Math.min((sector.totalVentas / totalGeneral) * 100, 100)}%` : '0%' }}
                      />
                    </div>

                    {/* Métodos de pago del sector */}
                    {sector.metodosPago.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Por método de pago</p>
                        {sector.metodosPago.map(mp => (
                          <div key={mp.metodo} className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.badge}`}>
                                {mp.cantidad}
                              </span>
                              <span className="text-xs text-slate-300 font-medium">{mp.metodo}</span>
                            </div>
                            <span className="text-xs font-black text-slate-200">{formatMoney(mp.total)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-600 text-xs py-2">Sin ventas en este sector</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid secundario: Métodos de pago globales + Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MÉTODOS DE PAGO GLOBAL */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">💳</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Métodos de pago — Total día</h3>
                    <p className="text-slate-400 text-xs">Desglose global de pagos</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {metodosGlobalesFiltrados.map((metodo) => (
                    <div key={metodo.metodo}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-300">{metodo.metodo}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-medium">{metodo.cantidad} vta{metodo.cantidad !== 1 ? 's' : ''}</span>
                          <span className="font-bold text-slate-200">{formatMoney(metodo.total)}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all"
                          style={{ width: totalGeneral > 0 ? `${Math.min((metodo.total / totalGeneral) * 100, 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                  {metodosGlobalesFiltrados.length === 0 && (
                    <p className="text-slate-600 text-sm text-center py-4">Sin ventas registradas</p>
                  )}
                </div>
              </div>

              {/* RESUMEN FINAL */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">✓</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Resumen del día</h3>
                    <p className="text-slate-400 text-xs">Totales operativos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {/* Inicio de caja */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Inicio de caja</span>
                    <span className="font-bold text-amber-300">{formatMoney(montoCajaInicio)}</span>
                  </div>

                  {/* Ventas desglosadas */}
                  <div className="py-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">Ventas</span>
                      <span className="font-bold text-white">{formatMoney(totalGeneral)}</span>
                    </div>
                    {ventasPorMetodo.filter(v => v.total > 0).map(v => (
                      <div key={v.metodo} className="flex justify-between items-center pl-4 py-0.5">
                        <span className="text-xs text-slate-500">- {v.metodo}</span>
                        <span className="text-xs font-medium text-slate-300">{formatMoney(v.total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Gastos desglosados */}
                  {incluirGastosEnCierre && (
                    <div className="py-1 border-t border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-red-400">Gastos</span>
                        <span className="font-bold text-red-400">− {formatMoney(totalGastosDia)}</span>
                      </div>
                      {gastosPorMetodo.filter(g => g.total > 0).map(g => (
                        <div key={g.metodo} className="flex justify-between items-center pl-4 py-0.5">
                          <span className="text-xs text-slate-500">- {g.metodo}</span>
                          <span className="text-xs font-medium text-red-400">− {formatMoney(g.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total esperado */}
                  <div className="flex justify-between items-center bg-emerald-600/20 border border-emerald-500/30 rounded-lg px-3 py-3 mt-2">
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">TOTAL ESPERADO</span>
                    <span className="text-xl font-black text-emerald-300">{formatMoney(totalEsperadoNeto)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Resumen Matricial (Sectores vs Medios de Pago) */}
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm uppercase">Desglose General</h4>
            <p className="text-xs text-slate-400 mt-0.5">Ventas discriminadas por sector y método</p>
          </div>
          <button
            onClick={() => setEditorDesgloseAbierto(!editorDesgloseAbierto)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-700 border border-slate-600 px-3 py-1.5 text-left hover:bg-slate-600 transition-colors"
          >
            <Pencil className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">Editar columnas</span>
          </button>
        </div>

        {/* Editor de columnas del desglose */}
        {editorDesgloseAbierto && (
          <div className="mb-4 p-3 bg-slate-800/80 rounded-lg border border-dashed border-slate-600 space-y-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Métodos de pago (columnas)</p>
            {metodosDesgloseGeneral.map((metodo) =>
              desgloseEditando === metodo ? (
                <div key={metodo} className="flex gap-1 items-center">
                  <Input
                    value={desgloseEditandoValor}
                    onChange={(e) => setDesgloseEditandoValor(e.target.value)}
                    className="h-7 text-xs flex-1 bg-slate-700 border-slate-600 text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const nuevo = desgloseEditandoValor.trim();
                        if (!nuevo) return;
                        setMetodosDesgloseGeneral(prev => prev.map(m => m === metodo ? nuevo : m));
                        setDesgloseEditando(null);
                      }
                    }}
                  />
                  <Button type="button" size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      const nuevo = desgloseEditandoValor.trim();
                      if (!nuevo) return;
                      setMetodosDesgloseGeneral(prev => prev.map(m => m === metodo ? nuevo : m));
                      setDesgloseEditando(null);
                    }}>✓</Button>
                  <Button type="button" size="sm" variant="outline" className="h-7 px-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setDesgloseEditando(null)}>✕</Button>
                </div>
              ) : (
                <div key={metodo} className="flex items-center justify-between gap-1 bg-slate-700 rounded border border-slate-600 px-2 py-1">
                  <span className="text-xs font-bold text-slate-300">{metodo}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
                      onClick={() => { setDesgloseEditando(metodo); setDesgloseEditandoValor(metodo); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      onClick={() => setMetodosDesgloseGeneral(prev => prev.filter(m => m !== metodo))}
                      disabled={metodosDesgloseGeneral.length <= 1}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            )}
            <div className="flex gap-1 items-end">
              <div className="flex-1">
                <Label className="text-[9px] text-slate-400">Nuevo método de pago</Label>
                <Input
                  value={nuevoMetodoDesglose}
                  onChange={(e) => setNuevoMetodoDesglose(e.target.value)}
                  placeholder="Ej: Tarjeta de crédito"
                  className="h-7 text-xs mt-0.5 bg-slate-700 border-slate-600 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = nuevoMetodoDesglose.trim();
                      if (!v) return;
                      if (metodosDesgloseGeneral.some(m => m.toLowerCase() === v.toLowerCase())) return;
                      setMetodosDesgloseGeneral(prev => [...prev, v]);
                      setNuevoMetodoDesglose('');
                    }
                  }}
                />
              </div>
              <Button type="button" size="sm" className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  const v = nuevoMetodoDesglose.trim();
                  if (!v) return;
                  if (metodosDesgloseGeneral.some(m => m.toLowerCase() === v.toLowerCase())) return;
                  setMetodosDesgloseGeneral(prev => [...prev, v]);
                  setNuevoMetodoDesglose('');
                }}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-slate-300">
                <th className="p-2.5 text-left font-bold border-b border-slate-600">Cierre de Caja</th>
                {metodosUnicos.map(metodo => (
                  <th key={metodo} className="p-2.5 text-right font-bold border-b border-slate-600">{metodo}</th>
                ))}
                <th className="p-2.5 text-right font-bold border-b border-slate-600 text-emerald-300">Total dia</th>
              </tr>
            </thead>
            <tbody>
              {detallesPorSector.map(sector => (
                <tr key={sector.nombre} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-2.5 font-bold text-slate-200 capitalize">{sector.nombre}</td>
                  {metodosUnicos.map(metodo => {
                    const mp = sector.metodosPago.find(m => m.metodo.toLowerCase() === metodo.toLowerCase());
                    const monto = mp ? mp.total : 0;
                    return (
                      <td key={metodo} className="p-2.5 text-right text-slate-300">
                        {formatMoney(monto)}
                      </td>
                    );
                  })}
                  <td className="p-2.5 text-right font-bold text-emerald-300 bg-emerald-900/10">
                    {formatMoney(sector.totalVentas)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800 font-bold">
                <td className="p-2.5 text-white">Total</td>
                {metodosUnicos.map(metodo => {
                  const totalMetodo = detallesPorSector.reduce((sum, sec) => {
                    const mp = sec.metodosPago.find(m => m.metodo.toLowerCase() === metodo.toLowerCase());
                    return sum + (mp ? mp.total : 0);
                  }, 0);
                  return (
                    <td key={metodo} className="p-2.5 text-right text-white">
                      {formatMoney(totalMetodo)}
                    </td>
                  );
                })}
                <td className="p-2.5 text-right text-emerald-300 bg-emerald-900/20">
                  {formatMoney(totalGeneral)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Contador de Vehículos */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-2xl">🚗</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Contador de vehículos</p>
              <p className="text-lg font-bold text-white">Lavados del día</p>
            </div>
          </div>
          <div className="text-4xl font-black text-blue-400 drop-shadow-md">
            {clientesLavadero}
          </div>
        </div>

        {/* Contador de Promos (incluye Promos de método de pago + descuentos 100% por sector) */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Contador de promociones</p>
              <p className="text-lg font-bold text-white">Promos por día</p>
              <p className="text-[9px] text-slate-500">Incluye promos directas + descuentos 100% por sector</p>
            </div>
          </div>
          <div className="text-4xl font-black text-purple-400 drop-shadow-md">
            {cantidadPromos}
          </div>
        </div>
      </Card>

      {/* Gastos Diarios */}
      <div className="mt-6 mb-6 space-y-4">
        {/* FILTROS */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-lg border border-slate-700 p-5">
          <details open>
            <summary className="cursor-pointer font-semibold text-sm text-slate-300 outline-none select-none">
              Filtros y Configuración
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Fecha</label>
                <input type="date" className="w-full border border-slate-600 bg-slate-700 text-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" defaultValue={fechaCierre} disabled />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Sector</label>
                <select 
                  className="w-full border border-slate-600 bg-slate-700 text-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={filtroSector}
                  onChange={(e) => setFiltroSector(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {sectores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Categoría</label>
                <select 
                  className="w-full border border-slate-600 bg-slate-700 text-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="Todas">Todas</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Proveedor</label>
                <select 
                  className="w-full border border-slate-600 bg-slate-700 text-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Método de pago</label>
                <select 
                  className="w-full border border-slate-600 bg-slate-700 text-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={filtroMetodoPago}
                  onChange={(e) => setFiltroMetodoPago(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Pago mixto">Pago mixto</option>
                  {metodosPago.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Ordenar</label>
                <select 
                  className="w-full border border-slate-600 bg-slate-700 text-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={filtroOrden}
                  onChange={(e) => setFiltroOrden(e.target.value)}
                >
                  <option value="Más reciente">Más reciente</option>
                  <option value="Mayor gasto">Mayor gasto</option>
                  <option value="Menor gasto">Menor gasto</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 p-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm border border-slate-600"
                  onClick={() => {
                    setFiltroSector('Todos');
                    setFiltroCategoria('Todas');
                    setFiltroProveedor('Todos');
                    setFiltroMetodoPago('Todos');
                    setFiltroOrden('Más reciente');
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* TABLA */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-300">Gastos del Día</h2>
              <button
                onClick={() => setGastosAbierto(!gastosAbierto)}
                className="flex items-center gap-1 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1 text-left hover:bg-slate-600 transition-colors"
              >
                <span className="text-[10px] font-bold text-slate-300">
                  {gastosAbierto ? 'Ocultar' : 'Mostrar'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${gastosAbierto ? 'rotate-180' : ''}`} />
              </button>
              {/* Badges resumen gastos por método */}
              <div className="flex items-center gap-1.5 ml-1">
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-green-900/40 text-green-300 border-green-700/50">
                  <span className="opacity-70">Efectivo:</span>
                  <span>{formatMoney(gastosEfectivoDia)}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-purple-900/40 text-purple-300 border-purple-700/50">
                  <span className="opacity-70">Digital:</span>
                  <span>{formatMoney(gastosDigitalDia)}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-amber-900/40 text-amber-300 border-amber-700/50">
                  <span className="opacity-70">Tarjeta:</span>
                  <span>{formatMoney(gastosTarjetaDia)}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-red-900/40 text-red-300 border-red-700/50">
                  <span className="opacity-70">Total:</span>
                  <span>{formatMoney(totalGastosDia)}</span>
                </span>
              </div>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navegar-a', { detail: 'gastos' }))}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Agregar Gasto
            </button>
          </div>

          {gastosAbierto && (
            <>
              <div className="overflow-x-auto">
                {gastosDelDia.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No hay gastos registrados para esta fecha.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 text-sm">
                      <tr>
                        <th className="p-4 font-semibold whitespace-nowrap">Hora</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Sector</th>
                        <th className="p-4 font-semibold">Detalle</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Método</th>
                        <th className="p-4 font-semibold text-right whitespace-nowrap">Monto</th>
                        <th className="p-4 font-semibold text-center whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-300 divide-y divide-slate-700">
                      {gastosDelDia.map(gasto => {
                        let horaStr = '--:--';
                        if (gasto.fecha && gasto.fecha.includes('T')) {
                          const d = new Date(gasto.fecha);
                          horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }

                        return (
                          <tr key={gasto.id} className="hover:bg-slate-800/50 transition-colors group">
                            <td className="p-4 text-slate-500 font-medium whitespace-nowrap">{horaStr}</td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30">
                                {gasto.sector}
                              </span>
                            </td>
                            <td className="p-4 min-w-[200px]">
                              <p className="font-semibold text-slate-300">{gasto.categoria}</p>
                              {gasto.descripcion && <p className="text-xs text-slate-500 mt-0.5">{gasto.descripcion}</p>}
                            </td>
                            <td className="p-4 whitespace-nowrap text-slate-400 font-medium">
                              {formatMetodoPagoGastoDisplay(gasto as any, formatMoney)}
                            </td>
                            <td className="p-4 text-right font-bold text-red-300 whitespace-nowrap">{formatMoney(gasto.monto)}</td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => {
                                    window.dispatchEvent(new CustomEvent('editar-gasto', { detail: gasto }));
                                    window.dispatchEvent(new CustomEvent('navegar-a', { detail: 'gastos' }));
                                  }}
                                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => {
                                    if (window.confirm('¿Estás seguro de que querés eliminar este gasto?')) {
                                      eliminarGasto(gasto.id);
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t border-slate-700 bg-slate-800 p-5">
                <div className="flex justify-end">
                  <div className="w-full md:w-72 space-y-3">
                    <div className="flex justify-between text-slate-400 text-sm font-medium">
                      <span>Cantidad de gastos</span>
                      <span className="font-bold text-slate-300">{gastosDelDia.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl font-black pt-2">
                      <span className="text-slate-400">Total Gastos</span>
                      <span className="text-red-400">{formatMoney(totalGastosDia)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Arqueo físico de billetes */}
      <Card className="p-3 mb-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-lg">
        <Collapsible open={arqueoAbierto} onOpenChange={setArqueoAbierto}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-white text-xs uppercase">Total contado físico de billetes</h4>
            </div>
            <CollapsibleTrigger className="flex items-center gap-1 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1 text-left hover:bg-slate-600">
              <span className="text-[10px] font-bold text-slate-300">
                {arqueoAbierto ? 'Ocultar' : 'Mostrar'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${arqueoAbierto ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800 mb-2">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-slate-700 text-slate-300">
                    <th className="p-1.5 text-left font-bold">Billete</th>
                    <th className="p-1.5 text-center font-bold w-16">Cant.</th>
                    <th className="p-1.5 text-right font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {denomsOrdenadas.map((valor) => {
                    const cant = conteoBilletes[String(valor)] || 0;
                    return (
                      <tr key={valor} className="border-t border-slate-700">
                        <td className="p-1.5 font-bold text-slate-300">{formatMoney(valor)}</td>
                        <td className="p-1">
                          <EditableNumberInput
                            value={cant}
                            onChange={(n) => onConteoChange(valor, n)}
                            className="h-7 text-xs text-center px-1 bg-slate-700 border-slate-600 text-white"
                          />
                        </td>
                        <td className="p-1.5 text-right font-bold text-emerald-300">
                          {formatMoney(cant * valor)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-7 text-[10px] mb-2 border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600"
              onClick={onLimpiarConteo}
            >
              Limpiar conteo
            </Button>

            {/* Editor de denominaciones */}
            <Collapsible open={editorDenomsAbierto} onOpenChange={setEditorDenomsAbierto}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-dashed border-slate-600 bg-slate-700/50 px-2 py-1.5 text-left mb-1">
                <span className="text-[9px] font-bold text-slate-300 uppercase">Editar denominaciones</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${editorDenomsAbierto ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-1">
                {denomsOrdenadas.map((valor) =>
                  denomEditando === valor ? (
                    <div key={valor} className="flex gap-1 items-center">
                      <EditableNumberInput
                        value={parseInt(denomEditandoValor, 10) || valor}
                        onChange={(n) => setDenomEditandoValor(String(n))}
                        className="h-7 text-xs flex-1 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button type="button" size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          const nuevo = parseInt(denomEditandoValor, 10);
                          if (!nuevo || nuevo <= 0) { toast.warning('Valor inválido'); return; }
                          onEditarDenominacion(valor, nuevo);
                          setDenomEditando(null);
                        }}>✓</Button>
                      <Button type="button" size="sm" variant="outline" className="h-7 px-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => setDenomEditando(null)}>✕</Button>
                    </div>
                  ) : (
                    <div key={valor} className="flex items-center justify-between gap-1 bg-slate-700 rounded border border-slate-600 px-2 py-1">
                      <span className="text-xs font-bold text-slate-300">{formatMoney(valor)}</span>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-300"
                          onClick={() => { setDenomEditando(valor); setDenomEditandoValor(String(valor)); }}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          onClick={() => onEliminarDenominacion(valor)} disabled={denomsOrdenadas.length <= 1}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                )}
                <div className="flex gap-1 items-end">
                  <div className="flex-1">
                    <Label className="text-[9px] text-slate-400">Nueva denominación ($)</Label>
                    <Input type="text" inputMode="numeric" value={nuevaDenominacion}
                      onChange={(e) => setNuevaDenominacion(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 5000" className="h-7 text-xs mt-0.5 bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <Button type="button" size="sm" className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      const v = parseInt(nuevaDenominacion, 10);
                      if (!v || v <= 0) { toast.warning('Ingresá un valor válido'); return; }
                      onAgregarDenominacion(v);
                      setNuevaDenominacion('');
                    }}>
                      <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>

        {/* Resultado del arqueo */}
        <div className="space-y-1.5 pt-2 border-t border-slate-700 mt-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Total contado físico</span>
            <span className="font-black text-emerald-300">{formatMoney(totalContadoBilletes)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Efectivo esperado <span className="text-[9px] text-slate-500 font-normal">(Inicio de Caja + Ventas Efectivo - Gastos Efectivo)</span></span>
            <span className="font-black text-slate-300">{formatMoney(efectivoEsperadoCalculado)}</span>
          </div>
          <div className={`flex justify-between text-sm font-black rounded-lg px-2 py-1.5 ${
            Math.abs(diferenciaEfectivoCalculada) < 0.01
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : diferenciaEfectivoCalculada > 0
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'bg-red-600/20 text-red-300 border border-red-500/30'
          }`}>
            <span>Diferencia en Caja (Efectivo)</span>
            <span>{diferenciaEfectivoCalculada > 0 ? '+' : ''}{formatMoney(diferenciaEfectivoCalculada)}</span>
          </div>
        </div>
      </Card>

      {/* Tabla detalle + botón cierre */}
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wide">
            Detalle de ventas por método de pago — {fechaCierre}
          </h4>
          <button
            onClick={() => setDetalleAbierto(!detalleAbierto)}
            className="flex items-center gap-1 rounded-lg bg-slate-700 border border-slate-600 px-2 py-1 text-left hover:bg-slate-600 transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-300">
              {detalleAbierto ? 'Ocultar' : 'Mostrar'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${detalleAbierto ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {detalleAbierto && (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-700 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800 text-slate-400">
                    <th className="p-2 text-left font-bold">Método de pago</th>
                    <th className="p-2 text-center font-bold">Ventas</th>
                    <th className="p-2 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenParaTabla.map((row) => (
                    <tr key={row.metodo} className={`border-t border-slate-700 ${row.cantidad === 0 ? 'opacity-50' : ''}`}>
                      <td className="p-2 font-semibold text-slate-300">{row.metodo}</td>
                      <td className="p-2 text-center text-slate-400">{row.cantidad}</td>
                      <td className="p-2 text-right font-black text-slate-200">{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 border-t-2 border-slate-700">
                    <td className="p-2 font-bold text-slate-300">Total ventas del día</td>
                    <td className="p-2 text-center font-bold text-slate-400">{ventasDelDiaCount}</td>
                    <td className="p-2 text-right font-black text-lg text-slate-200">{formatMoney(totalGeneral)}</td>
                  </tr>
                  <tr className="bg-slate-800 border-t border-slate-700">
                    <td className="p-2 font-semibold text-slate-300" colSpan={2}>Inicio de caja (Efectivo inicial)</td>
                    <td className="p-2 text-right font-black text-slate-200">{formatMoney(montoCajaInicio)}</td>
                  </tr>
                  {incluirGastosEnCierre && (
                    <tr className="bg-red-600/20 border-t border-red-500/30">
                      <td className="p-2 font-semibold text-red-300" colSpan={2}>Gastos del día (descontado)</td>
                      <td className="p-2 text-right font-black text-red-300">− {formatMoney(totalGastosDia)}</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-600/20 border-t-2 border-emerald-500/30">
                    <td className="p-2 font-black text-emerald-300" colSpan={2}>Neto final en caja</td>
                    <td className="p-2 text-right font-black text-xl text-emerald-300">{formatMoney(totalEsperadoNeto)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-2 border-t border-slate-700">
              {/* Toggle incluir gastos */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setIncluirGastosEnCierre(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    incluirGastosEnCierre ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-slate-800 rounded-full shadow transition-transform ${
                    incluirGastosEnCierre ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Descontar gastos del día ({formatMoney(totalGastosDia)}) del neto final
                </span>
              </label>
              <p className="text-[10px] text-slate-500 max-w-md">
                El cierre registra totales, arqueo de billetes y detalle por método en la pestaña{' '}
                <strong>Cierres Caja</strong> de Google Sheets.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
                    disabled={cierreEnProceso || ventasDelDiaCount === 0}
                  >
                    <CloudUpload className="w-4 h-4 mr-2" />
                    {cierreEnProceso ? 'Enviando...' : 'Cerrar caja y enviar a la nube'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar cierre de caja?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-2 text-sm text-left">
                        <p>Fecha: <strong>{fechaCierre}</strong> — {ventasDelDiaCount} ventas</p>
                        <div className="bg-slate-800 rounded-lg p-3 space-y-1.5 text-xs border border-slate-700">
                          <div className="flex justify-between text-slate-300">
                            <span className="font-bold">Inicio de caja</span>
                            <span className="font-bold">{formatMoney(montoCajaInicio)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span className="font-bold">Total ventas</span>
                            <span className="font-bold">{formatMoney(totalGeneral)}</span>
                          </div>
                          {incluirGastosEnCierre && (
                            <div className="flex justify-between text-red-400">
                              <span className="font-bold">Gastos del día</span>
                              <span className="font-bold">− {formatMoney(totalGastosDia)}</span>
                            </div>
                          )}
                        </div>
                          <div className="flex justify-between border-t border-slate-700 pt-1.5 text-sm text-emerald-300">
                            <span className="font-black">Neto final en caja</span>
                            <span className="font-black">{formatMoney(totalEsperadoNeto)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span className="font-semibold">Contado físico</span>
                            <span className="font-bold">{formatMoney(totalContadoBilletes)}</span>
                          </div>
                          <div className={`flex justify-between border-t border-slate-700 pt-1.5 ${
                            Math.abs(diferenciaArqueo) < 0.01 ? 'text-emerald-400' : diferenciaArqueo > 0 ? 'text-blue-400' : 'text-red-400'
                          }`}>
                            <span className="font-black">Diferencia</span>
                            <span className="font-black">{diferenciaArqueo > 0 ? '+' : ''}{formatMoney(diferenciaArqueo)}</span>
                          </div>
                        </div>
                        {cierreYaEnviado && (
                          <p className="text-amber-400 font-medium">
                            Ya se envió un cierre este día. Podés enviar otro si necesitás actualizar.
                          </p>
                        )}
                      
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onCerrarCaja} className="bg-emerald-600 hover:bg-emerald-700">
                      Confirmar y enviar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
