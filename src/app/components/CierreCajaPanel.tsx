import { useState } from 'react';
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
import { toast } from 'sonner';

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
}: CierreCajaPanelProps) {
  const [arqueoAbierto, setArqueoAbierto] = useState(true);
  const [editorDenomsAbierto, setEditorDenomsAbierto] = useState(false);
  const [nuevaDenominacion, setNuevaDenominacion] = useState('');
  const [denomEditando, setDenomEditando] = useState<number | null>(null);
  const [denomEditandoValor, setDenomEditandoValor] = useState('');

  const denomsOrdenadas = [...denominacionesBilletes].sort((a, b) => a - b);

  // Lógica central: total esperado = inicio de caja + TODAS las ventas del día
  const totalEsperado = montoCajaInicio + totalGeneral;

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
                <td className="p-2 font-bold text-slate-800">Total del día</td>
                <td className="p-2 text-center font-bold text-slate-700">{ventasDelDiaCount}</td>
                <td className="p-2 text-right font-black text-lg text-slate-900">{formatMoney(totalGeneral)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-2 border-t border-slate-100">
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
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm text-left">
                    <p>Fecha: <strong>{fechaCierre}</strong> — {ventasDelDiaCount} ventas</p>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs border border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-amber-700 font-bold">🟡 Inicio de caja</span>
                        <span className="font-bold">{formatMoney(montoCajaInicio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-bold">📊 Total ventas</span>
                        <span className="font-bold">{formatMoney(totalGeneral)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm">
                        <span className="font-black text-emerald-800">Total esperado</span>
                        <span className="font-black text-emerald-800">{formatMoney(totalEsperado)}</span>
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
                  </div>
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
