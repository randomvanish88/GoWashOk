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

import { googleSheetsSync } from '../lib/googleSheetsSync';

export const DEFAULT_DENOMINACIONES_ARS = [50, 100, 200, 500, 1000, 2000, 10000, 20000];

export interface ResumenMetodoPago {
  metodo: string;
  total: number;
  cantidad: number;
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
  ventasEfectivoCount: number;
  ventasTransferenciaCount: number;
  ventasOtrosCount: number;
  conteoBilletes: Record<string, number>;
  onConteoChange: (valor: number, cantidad: number) => void;
  onLimpiarConteo: () => void;
  totalContadoBilletes: number;
  diferenciaArqueo: number;
  resumenMetodosPago: ResumenMetodoPago[];
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
  ventasEfectivoCount,
  ventasTransferenciaCount,
  ventasOtrosCount,
  conteoBilletes,
  onConteoChange,
  onLimpiarConteo,
  totalContadoBilletes,
  diferenciaArqueo,
  resumenMetodosPago,
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



  const [arqueoAbierto, setArqueoAbierto] = useState(true);
  const [editorDenomsAbierto, setEditorDenomsAbierto] = useState(false);
  const [nuevaDenominacion, setNuevaDenominacion] = useState('');
  const [denomEditando, setDenomEditando] = useState<number | null>(null);
  const [denomEditandoValor, setDenomEditandoValor] = useState('');

  const { gastos, sectores, categorias, proveedores, eliminarGasto } = useGastos();
  const [filtroSector, setFiltroSector] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroProveedor, setFiltroProveedor] = useState('Todos');
  const [filtroOrden, setFiltroOrden] = useState('Más reciente');
  const [incluirGastosEnCierre, setIncluirGastosEnCierre] = useState(false);

  let gastosDelDia = gastos.filter(g => {
    if (g.fecha !== fechaCierre) return false;
    if (filtroSector !== 'Todos' && g.sector !== filtroSector) return false;
    if (filtroCategoria !== 'Todas' && g.categoria !== filtroCategoria) return false;
    if (filtroProveedor !== 'Todos' && g.proveedor !== filtroProveedor) return false;
    return true;
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

      {/* Resumen de caja: inicio + ventas = total esperado */}
      <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-3">
          Composición del cierre
        </h4>
        <div className="space-y-2">

          {/* Inicio de caja */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟡</span>
              <div>
                <p className="text-xs font-bold text-amber-900">Inicio de caja</p>
                <p className="text-[10px] text-amber-700">Efectivo al abrir el día</p>
              </div>
            </div>
            <span className="text-base font-black text-amber-800">{formatMoney(montoCajaInicio)}</span>
          </div>

          {/* Ventas del día por método */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200">
              <p className="text-[10px] font-bold text-slate-700 uppercase">Ventas del día — {ventasDelDiaCount} ventas</p>
            </div>
            <div className="divide-y divide-slate-50">
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💵</span>
                  <span className="text-xs font-semibold text-green-800">Efectivo</span>
                  <span className="text-[9px] text-slate-400">{ventasEfectivoCount} ventas</span>
                </div>
                <span className="text-xs font-bold text-green-800">{formatMoney(totalEfectivo)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏦</span>
                  <span className="text-xs font-semibold text-blue-800">Transferencia</span>
                  <span className="text-[9px] text-slate-400">{ventasTransferenciaCount} ventas</span>
                </div>
                <span className="text-xs font-bold text-blue-800">{formatMoney(totalTransferencia)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📱</span>
                  <span className="text-xs font-semibold text-purple-800">Digital / Otros</span>
                  <span className="text-[9px] text-slate-400">{ventasOtrosCount} ventas</span>
                </div>
                <span className="text-xs font-bold text-purple-800">{formatMoney(totalBilletera)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                <span className="text-xs font-black text-slate-800">Total ventas</span>
                <span className="text-sm font-black text-slate-900">{formatMoney(totalGeneral)}</span>
              </div>
            </div>
          </div>

          {/* Total esperado en caja */}
          <div className="flex items-center justify-between bg-emerald-600 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-black text-emerald-100 uppercase tracking-wide">Total esperado en caja</p>
              <p className="text-[10px] text-emerald-200">Inicio + todas las ventas</p>
            </div>
            <span className="text-2xl font-black text-white">{formatMoney(totalEsperado)}</span>
          </div>
        </div>
      </Card>

      {/* Arqueo físico de billetes */}
      <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <Collapsible open={arqueoAbierto} onOpenChange={setArqueoAbierto}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-green-900 text-xs uppercase">Arqueo físico de billetes</h4>
              <p className="text-[10px] text-green-700 mt-0.5">Contá el dinero físico en caja</p>
            </div>
            <CollapsibleTrigger className="flex items-center gap-1 rounded-lg bg-white/90 border border-green-200 px-2 py-1 text-left hover:bg-white">
              <span className="text-[10px] font-bold text-green-800">
                {arqueoAbierto ? 'Ocultar' : 'Mostrar'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-green-700 transition-transform ${arqueoAbierto ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="overflow-x-auto rounded-lg border border-green-200 bg-white mb-2">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-green-100/80 text-green-900">
                    <th className="p-1.5 text-left font-bold">Billete</th>
                    <th className="p-1.5 text-center font-bold w-16">Cant.</th>
                    <th className="p-1.5 text-right font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {denomsOrdenadas.map((valor) => {
                    const cant = conteoBilletes[String(valor)] || 0;
                    return (
                      <tr key={valor} className="border-t border-green-50">
                        <td className="p-1.5 font-bold text-green-900">{formatMoney(valor)}</td>
                        <td className="p-1">
                          <EditableNumberInput
                            value={cant}
                            onChange={(n) => onConteoChange(valor, n)}
                            className="h-7 text-xs text-center px-1"
                          />
                        </td>
                        <td className="p-1.5 text-right font-bold text-green-800">
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
              className="w-full h-7 text-[10px] mb-2 border-green-300 text-green-800"
              onClick={onLimpiarConteo}
            >
              Limpiar conteo
            </Button>

            {/* Editor de denominaciones */}
            <Collapsible open={editorDenomsAbierto} onOpenChange={setEditorDenomsAbierto}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-dashed border-green-300 bg-green-50/50 px-2 py-1.5 text-left mb-1">
                <span className="text-[9px] font-bold text-green-800 uppercase">Editar denominaciones</span>
                <ChevronDown className={`w-3 h-3 text-green-700 transition-transform ${editorDenomsAbierto ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-1">
                {denomsOrdenadas.map((valor) =>
                  denomEditando === valor ? (
                    <div key={valor} className="flex gap-1 items-center">
                      <EditableNumberInput
                        value={parseInt(denomEditandoValor, 10) || valor}
                        onChange={(n) => setDenomEditandoValor(String(n))}
                        className="h-7 text-xs flex-1"
                      />
                      <Button type="button" size="sm" className="h-7 px-2 bg-green-600"
                        onClick={() => {
                          const nuevo = parseInt(denomEditandoValor, 10);
                          if (!nuevo || nuevo <= 0) { toast.warning('Valor inválido'); return; }
                          onEditarDenominacion(valor, nuevo);
                          setDenomEditando(null);
                        }}>✓</Button>
                      <Button type="button" size="sm" variant="outline" className="h-7 px-2"
                        onClick={() => setDenomEditando(null)}>✕</Button>
                    </div>
                  ) : (
                    <div key={valor} className="flex items-center justify-between gap-1 bg-white rounded border border-green-100 px-2 py-1">
                      <span className="text-xs font-bold text-green-900">{formatMoney(valor)}</span>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0"
                          onClick={() => { setDenomEditando(valor); setDenomEditandoValor(String(valor)); }}>
                          <Pencil className="w-3 h-3 text-green-700" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500"
                          onClick={() => onEliminarDenominacion(valor)} disabled={denomsOrdenadas.length <= 1}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                )}
                <div className="flex gap-1 items-end">
                  <div className="flex-1">
                    <Label className="text-[9px] text-green-800">Nueva denominación ($)</Label>
                    <Input type="text" inputMode="numeric" value={nuevaDenominacion}
                      onChange={(e) => setNuevaDenominacion(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 5000" className="h-7 text-xs mt-0.5" />
                  </div>
                  <Button type="button" size="sm" className="h-7 text-[10px] bg-green-700"
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
        <div className="space-y-1.5 pt-2 border-t border-green-200 mt-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-green-800 font-medium">Total contado físico</span>
            <span className="font-black text-green-900">{formatMoney(totalContadoBilletes)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-green-800 font-medium">Total esperado</span>
            <span className="font-black text-green-900">{formatMoney(totalEsperado)}</span>
          </div>
          <div className={`flex justify-between text-sm font-black rounded-lg px-2 py-1.5 ${
            Math.abs(diferenciaArqueo) < 0.01
              ? 'bg-green-100 text-green-800'
              : diferenciaArqueo > 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-700'
          }`}>
            <span>Diferencia</span>
            <span>{diferenciaArqueo > 0 ? '+' : ''}{formatMoney(diferenciaArqueo)}</span>
          </div>
        </div>
      </Card>

      {/* Gastos Diarios */}
      <div className="mt-6 mb-6 space-y-4">
        {/* FILTROS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <details open>
            <summary className="cursor-pointer font-semibold text-sm text-gray-700 outline-none select-none">
              Filtros y Configuración
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Fecha</label>
                <input type="date" className="w-full border border-gray-200 bg-white text-slate-900 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={fechaCierre} disabled />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Sector</label>
                <select 
                  className="w-full border border-gray-200 bg-white text-slate-900 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filtroSector}
                  onChange={(e) => setFiltroSector(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {sectores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Categoría</label>
                <select 
                  className="w-full border border-gray-200 bg-white text-slate-900 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="Todas">Todas</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Proveedor</label>
                <select 
                  className="w-full border border-gray-200 bg-white text-slate-900 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Ordenar</label>
                <select 
                  className="w-full border border-gray-200 bg-white text-slate-900 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 p-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  onClick={() => {
                    setFiltroSector('Todos');
                    setFiltroCategoria('Todas');
                    setFiltroProveedor('Todos');
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Gastos del Día</h2>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navegar-a', { detail: 'gastos' }))}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Agregar Gasto
            </button>
          </div>

          <div className="overflow-x-auto">
            {gastosDelDia.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay gastos registrados para esta fecha.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 font-semibold whitespace-nowrap">Hora</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Sector</th>
                    <th className="p-4 font-semibold">Detalle</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Método</th>
                    <th className="p-4 font-semibold text-right whitespace-nowrap">Monto</th>
                    <th className="p-4 font-semibold text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                  {gastosDelDia.map(gasto => {
                    let horaStr = '--:--';
                    if (gasto.fecha && gasto.fecha.includes('T')) {
                      const d = new Date(gasto.fecha);
                      horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    return (
                      <tr key={gasto.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 text-gray-500 font-medium whitespace-nowrap">{horaStr}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {gasto.sector}
                          </span>
                        </td>
                        <td className="p-4 min-w-[200px]">
                          <p className="font-semibold text-gray-800">{gasto.categoria}</p>
                          {gasto.descripcion && <p className="text-xs text-gray-500 mt-0.5">{gasto.descripcion}</p>}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-600 font-medium">
                          {gasto.metodoPago}
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900 whitespace-nowrap">{formatMoney(gasto.monto)}</td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('editar-gasto', { detail: gasto }));
                                window.dispatchEvent(new CustomEvent('navegar-a', { detail: 'gastos' }));
                              }}
                              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('¿Estás seguro de que querés eliminar este gasto?')) {
                                  eliminarGasto(gasto.id);
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
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

          <div className="border-t border-gray-100 bg-gray-50 p-5">
            <div className="flex justify-end">
              <div className="w-full md:w-72 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm font-medium">
                  <span>Cantidad de gastos</span>
                  <span className="font-bold">{gastosDelDia.length}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black pt-2">
                  <span className="text-gray-800">Total Gastos</span>
                  <span className="text-red-500">{formatMoney(totalGastosDia)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla detalle + botón cierre */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-3">
          Detalle de ventas por método de pago — {fechaCierre}
        </h4>
        <div className="overflow-x-auto rounded-lg border border-slate-100 mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="p-2 text-left font-bold">Método de pago</th>
                <th className="p-2 text-center font-bold">Ventas</th>
                <th className="p-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {resumenMetodosPago.map((row) => (
                <tr key={row.metodo} className={`border-t border-slate-50 ${row.cantidad === 0 ? 'opacity-50' : ''}`}>
                  <td className="p-2 font-semibold text-slate-800">{row.metodo}</td>
                  <td className="p-2 text-center text-slate-600">{row.cantidad}</td>
                  <td className="p-2 text-right font-black text-slate-900">{formatMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="p-2 font-bold text-slate-800">Total ventas del día</td>
                <td className="p-2 text-center font-bold text-slate-700">{ventasDelDiaCount}</td>
                <td className="p-2 text-right font-black text-lg text-slate-900">{formatMoney(totalGeneral)}</td>
              </tr>
              {incluirGastosEnCierre && (
                <tr className="bg-red-50 border-t border-red-100">
                  <td className="p-2 font-semibold text-red-700" colSpan={2}>Gastos del día (descontado)</td>
                  <td className="p-2 text-right font-black text-red-600">− {formatMoney(totalGastosDia)}</td>
                </tr>
              )}
              <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                <td className="p-2 font-black text-emerald-900" colSpan={2}>Neto final en caja</td>
                <td className="p-2 text-right font-black text-xl text-emerald-800">{formatMoney(totalEsperadoNeto)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-2 border-t border-slate-100">
          {/* Toggle incluir gastos */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setIncluirGastosEnCierre(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                incluirGastosEnCierre ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                incluirGastosEnCierre ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-[11px] text-slate-600 font-medium">
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
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs border border-slate-200">
                      <div className="flex justify-between">
                        <span className="font-bold">Inicio de caja</span>
                        <span className="font-bold">{formatMoney(montoCajaInicio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Total ventas</span>
                        <span className="font-bold">{formatMoney(totalGeneral)}</span>
                      </div>
                      {incluirGastosEnCierre && (
                        <div className="flex justify-between text-red-600">
                          <span className="font-bold">Gastos del día</span>
                          <span className="font-bold">− {formatMoney(totalGastosDia)}</span>
                        </div>
                      )}
                    </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm">
                        <span className="font-black text-emerald-800">Neto final en caja</span>
                        <span className="font-black text-emerald-800">{formatMoney(totalEsperadoNeto)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Contado físico</span>
                        <span className="font-bold">{formatMoney(totalContadoBilletes)}</span>
                      </div>
                      <div className={`flex justify-between border-t border-slate-200 pt-1.5 ${
                        Math.abs(diferenciaArqueo) < 0.01 ? 'text-green-700' : diferenciaArqueo > 0 ? 'text-blue-700' : 'text-red-600'
                      }`}>
                        <span className="font-black">Diferencia</span>
                        <span className="font-black">{diferenciaArqueo > 0 ? '+' : ''}{formatMoney(diferenciaArqueo)}</span>
                      </div>
                    </div>
                    {cierreYaEnviado && (
                      <p className="text-amber-600 font-medium">
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
      </Card>
    </div>
  );
}
