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
import { Wallet, ChevronDown, CloudUpload, CheckCircle2 } from 'lucide-react';
import { EditableNumberInput } from './EditableNumberInput';
import { DEFAULT_DENOMINACIONES_ARS } from './CierreCajaPanel';
import { googleSheetsSync } from '../lib/googleSheetsSync';
import { toast } from 'sonner';

interface InicioCajaPanelProps {
  fechaInicio: string;
  onFechaInicioChange: (fecha: string) => void;
  formatMoney: (amount: number) => string;
  denominacionesBilletes: number[];
}

export function InicioCajaPanel({
  fechaInicio,
  onFechaInicioChange,
  formatMoney,
  denominacionesBilletes,
}: InicioCajaPanelProps) {
  const inicioYaEnviado = !!localStorage.getItem(`gowash-inicio-caja-${fechaInicio}`);

  const crearConteoVacio = () =>
    Object.fromEntries(denominacionesBilletes.map((d) => [String(d), 0]));

  const [conteo, setConteo] = useState<Record<string, number>>(crearConteoVacio);
  const [enviando, setEnviando] = useState(false);
  const [arqueoAbierto, setArqueoAbierto] = useState(true);

  const denomsOrdenadas = [...denominacionesBilletes].sort((a, b) => a - b);

  const totalContado = denomsOrdenadas.reduce(
    (sum, v) => sum + (conteo[String(v)] || 0) * v,
    0
  );

  const actualizarConteo = (valor: number, cantidad: number) => {
    setConteo((prev) => ({ ...prev, [String(valor)]: Math.max(0, cantidad) }));
  };

  const limpiarConteo = () => setConteo(crearConteoVacio);

  const detalleBilletes = denomsOrdenadas
    .map((v) => ({ valor: v, cantidad: conteo[String(v)] || 0, subtotal: (conteo[String(v)] || 0) * v }))
    .filter((b) => b.cantidad > 0);

  const enviarInicioCaja = async () => {
    if (totalContado === 0) {
      toast.warning('El monto inicial es $0', { description: 'Ingresá al menos un billete antes de enviar.' });
      return;
    }

    setEnviando(true);
    try {
      const detalleBilletesTexto = detalleBilletes
        .map((b) => `$${b.valor}×${b.cantidad}=${b.subtotal}`)
        .join(' | ');

      const data = {
        Fecha: fechaInicio,
        Hora_Inicio: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        Monto_Inicial: totalContado,
        Detalle_Billetes: detalleBilletesTexto,
        ID: `inicio-${fechaInicio}-${Date.now()}`,
      };

      // @ts-ignore
      const result = await window.electronAPI?.googleSheets?.addRow('Inicio Caja', data);

      if (result?.success === false) throw new Error(result.error);

      localStorage.setItem(`gowash-inicio-caja-${fechaInicio}`, data.ID);
      localStorage.setItem(`gowash-inicio-monto-${fechaInicio}`, String(totalContado));
      toast.success('Inicio de caja registrado', {
        description: `${fechaInicio} — ${formatMoney(totalContado)} en caja`,
      });
    } catch (err: any) {
      toast.error('Error al registrar inicio', { description: err?.message || 'Revisá la conexión.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-600" />
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
              Inicio de caja del día
            </span>
          </h3>
          <p className="text-[10px] text-slate-700 mt-1 font-medium">
            Registrá el efectivo disponible al comenzar el día
            {inicioYaEnviado && (
              <span className="ml-2 text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded flex-inline items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline mr-0.5" />
                Inicio ya registrado
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="fechaInicio" className="text-xs font-bold uppercase text-slate-800 shrink-0">
            Fecha
          </Label>
          <Input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              onFechaInicioChange(e.target.value);
              setConteo(crearConteoVacio);
            }}
            className="h-8 w-36 text-xs bg-white border-2 border-slate-400 text-slate-900 font-semibold focus:border-amber-500"
          />
        </div>
      </div>

      {/* Card principal de carga de efectivo */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
        <Collapsible open={arqueoAbierto} onOpenChange={setArqueoAbierto}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-amber-900 text-sm uppercase tracking-tight">
                Efectivo en caja
              </h4>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{formatMoney(totalContado)}</p>
            </div>
            <CollapsibleTrigger className="flex items-center gap-1.5 rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50 transition-colors">
              {arqueoAbierto ? 'Ocultar' : 'Cargar billetes'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${arqueoAbierto ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-amber-100/80 text-amber-900">
                    <th className="p-2 text-left font-bold">Billete</th>
                    <th className="p-2 text-center font-bold w-20">Cantidad</th>
                    <th className="p-2 text-right font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {denomsOrdenadas.map((valor) => {
                    const cant = conteo[String(valor)] || 0;
                    return (
                      <tr key={valor} className="border-t border-amber-50 hover:bg-amber-50/40 transition-colors">
                        <td className="p-2 font-bold text-amber-900">{formatMoney(valor)}</td>
                        <td className="p-1.5">
                          <EditableNumberInput
                            value={cant}
                            onChange={(n) => actualizarConteo(valor, n)}
                            className="h-8 text-sm text-center px-1 border-amber-200 focus:border-amber-500"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-amber-800">
                          {cant > 0 ? formatMoney(cant * valor) : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-100/60 border-t-2 border-amber-200">
                    <td className="p-2 font-black text-amber-900" colSpan={2}>Total en caja</td>
                    <td className="p-2 text-right font-black text-base text-amber-900">
                      {formatMoney(totalContado)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-7 text-[10px] border-amber-300 text-amber-800 hover:bg-amber-50"
              onClick={limpiarConteo}
            >
              Limpiar conteo
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resumen y botón de envío */}
      {detalleBilletes.length > 0 && (
        <Card className="p-3 bg-white border border-amber-200 shadow-sm">
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-2">
            Resumen de billetes cargados
          </h4>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {detalleBilletes.map((b) => (
              <span
                key={b.valor}
                className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full"
              >
                {formatMoney(b.valor)} × {b.cantidad} = {formatMoney(b.subtotal)}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-amber-100">
            <p className="text-[10px] text-slate-500">
              Se registrará en la pestaña <strong>Inicio Caja</strong> de Google Sheets.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0"
                  disabled={enviando || totalContado === 0}
                >
                  <CloudUpload className="w-4 h-4 mr-2" />
                  {enviando ? 'Enviando...' : 'Registrar inicio de caja'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Confirmar inicio de caja?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2 text-sm text-left">
                      <p>
                        Fecha: <strong>{fechaInicio}</strong>
                      </p>
                      <p>
                        Monto inicial en efectivo:{' '}
                        <strong className="text-amber-700">{formatMoney(totalContado)}</strong>
                      </p>
                      {inicioYaEnviado && (
                        <p className="text-amber-600 font-medium">
                          Ya se registró un inicio este día. Podés registrar otro si necesitás corregirlo.
                        </p>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={enviarInicioCaja}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Confirmar y registrar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      )}

      {detalleBilletes.length === 0 && (
        <Card className="p-4 bg-white border border-dashed border-amber-300 text-center">
          <Wallet className="w-8 h-8 text-amber-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">
            Ingresá la cantidad de billetes para calcular el monto inicial
          </p>
        </Card>
      )}
    </div>
  );
}
