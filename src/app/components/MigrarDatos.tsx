import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, Database, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';

// Claves a migrar con su nombre de hoja en Google Sheets
const CLAVES_MIGRACION = [
  { key: 'gowash-lavado-precios',           hoja: 'Servicios',        label: 'Servicios de Lavado' },
  { key: 'gowash-extras-lavado',            hoja: 'PWA_Extras',       label: 'Extras de Lavado' },
  { key: 'gowash-bar-precios',              hoja: 'Bar',              label: 'Productos Bar' },
  { key: 'gowash-cosmeticos-precios',       hoja: 'Cosmetica',        label: 'Cosmética/Accesorios' },
  { key: 'gowash-lista-empleados',          hoja: 'PWA_Empleados',    label: 'Empleados' },
  { key: 'gowash-metodos-pago-ventas',      hoja: 'PWA_MetodosPago',  label: 'Métodos de Pago' },
  { key: 'carwash-prices',                  hoja: 'PWA_Vehiculos',    label: 'Precios por Vehículo' },
  { key: 'gowash-users',                    hoja: 'PWA_Usuarios',     label: 'Usuarios del Sistema' },
  { key: 'gowash-ordenes-abiertas',         hoja: 'PWA_Lavadero',     label: 'Vehículos en Lavadero' },
  { key: 'gowash-ventas',                   hoja: 'PWA_Ventas',       label: 'Ventas del Día' },
];

type EstadoClave = 'pendiente' | 'migrando' | 'ok' | 'error' | 'vacio';

interface ResultadoClave {
  estado: EstadoClave;
  mensaje?: string;
  filas?: number;
}

export function MigrarDatos() {
  const [resultados, setResultados] = useState<Record<string, ResultadoClave>>({});
  const [migrando, setMigrando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const setResultado = (key: string, resultado: ResultadoClave) => {
    setResultados(prev => ({ ...prev, [key]: resultado }));
  };

  // Migra una clave del localStorage a una hoja de Google Sheets
  const migrarClave = async (key: string, hoja: string): Promise<boolean> => {
    setResultado(key, { estado: 'migrando' });

    const raw = localStorage.getItem(key);
    if (!raw) {
      setResultado(key, { estado: 'vacio', mensaje: 'Sin datos en localStorage' });
      return true;
    }

    let datos: any;
    try {
      datos = JSON.parse(raw);
    } catch {
      setResultado(key, { estado: 'error', mensaje: 'JSON inválido' });
      return false;
    }

    // Convertir a array si no lo es
    const arr = Array.isArray(datos) ? datos : [datos];
    if (arr.length === 0) {
      setResultado(key, { estado: 'vacio', mensaje: 'Array vacío' });
      return true;
    }

    try {
      // Usar la API de Electron para escribir en Google Sheets
      // @ts-ignore
      const api = window.electronAPI?.googleSheets;
      if (!api) {
        setResultado(key, { estado: 'error', mensaje: 'API de Google Sheets no disponible' });
        return false;
      }

      // Obtener headers del primer elemento
      const headers = Object.keys(arr[0]);

      // Crear la hoja si no existe y escribir los datos
      // Primero limpiar la hoja existente
      try {
        // @ts-ignore
        await api.clearSheet(hoja);
      } catch {
        // La hoja puede no existir aún, ignorar
      }

      // Escribir header + filas
      const filas = [
        headers,
        ...arr.map(item => headers.map(h => {
          const val = item[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        }))
      ];

      // @ts-ignore
      await api.writeSheet(hoja, filas);

      setResultado(key, { estado: 'ok', filas: arr.length });
      return true;
    } catch (e: any) {
      setResultado(key, { estado: 'error', mensaje: e?.message || 'Error desconocido' });
      return false;
    }
  };

  const handleMigrar = async () => {
    setMigrando(true);
    setCompletado(false);
    setResultados({});

    let exitosos = 0;
    let errores = 0;

    for (const { key, hoja } of CLAVES_MIGRACION) {
      const ok = await migrarClave(key, hoja);
      if (ok) exitosos++;
      else errores++;
      // Pequeña pausa para no saturar la API
      await new Promise(r => setTimeout(r, 300));
    }

    setMigrando(false);
    setCompletado(true);

    if (errores === 0) {
      toast.success('Migración completada', {
        description: `${exitosos} conjuntos de datos migrados a Google Sheets correctamente.`
      });
    } else {
      toast.warning('Migración con errores', {
        description: `${exitosos} exitosos, ${errores} con errores. Revisá los detalles.`
      });
    }
  };

  const getIcono = (estado: EstadoClave) => {
    switch (estado) {
      case 'migrando': return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'ok':       return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'error':    return <XCircle className="w-4 h-4 text-red-400" />;
      case 'vacio':    return <Database className="w-4 h-4 text-slate-500" />;
      default:         return <Database className="w-4 h-4 text-slate-600" />;
    }
  };

  const getColor = (estado: EstadoClave) => {
    switch (estado) {
      case 'migrando': return 'border-blue-500/30 bg-blue-500/5';
      case 'ok':       return 'border-emerald-500/30 bg-emerald-500/5';
      case 'error':    return 'border-red-500/30 bg-red-500/5';
      case 'vacio':    return 'border-slate-600/30 bg-slate-800/20';
      default:         return 'border-slate-700/30 bg-slate-800/10';
    }
  };

  // Contar datos en localStorage para mostrar preview
  const contarDatos = (key: string): number => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const datos = JSON.parse(raw);
      return Array.isArray(datos) ? datos.length : 1;
    } catch { return 0; }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Migrar Datos a Google Sheets
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Exporta todos los datos del sistema (precios, empleados, vehículos, ventas) a Google Sheets.
            La aplicación móvil leerá los datos desde ahí, manteniéndose sincronizada automáticamente.
          </p>
        </div>
      </div>

      {/* Lista de datos a migrar */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
          Datos a migrar ({CLAVES_MIGRACION.length} conjuntos)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CLAVES_MIGRACION.map(({ key, hoja, label }) => {
            const resultado = resultados[key];
            const cantidad = contarDatos(key);
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                  resultado ? getColor(resultado.estado) : 'border-slate-700/30 bg-slate-800/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getIcono(resultado?.estado || 'pendiente')}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{label}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {resultado?.mensaje
                        ? resultado.mensaje
                        : resultado?.filas !== undefined
                          ? `${resultado.filas} registros migrados`
                          : cantidad > 0
                            ? `${cantidad} registros en local`
                            : 'Sin datos'
                      }
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-500 shrink-0 ml-2 bg-slate-900/50 px-2 py-0.5 rounded">
                  {hoja}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de migración */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
        <Button
          onClick={handleMigrar}
          disabled={migrando}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {migrando ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Migrando...</>
          ) : completado ? (
            <><RefreshCw className="w-4 h-4 mr-2" /> Migrar de nuevo</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Iniciar Migración</>
          )}
        </Button>

        {completado && (
          <p className="text-xs text-slate-400">
            ✅ Los datos están disponibles en Google Sheets para la app móvil.
          </p>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
        <p className="text-xs text-amber-300 font-semibold">
          ⚠️ Esta operación sobreescribe los datos en Google Sheets con los datos actuales del sistema.
          Ejecutala cada vez que actualices precios, empleados u otros datos para que la app móvil los reciba.
        </p>
      </div>
    </Card>
  );
}
