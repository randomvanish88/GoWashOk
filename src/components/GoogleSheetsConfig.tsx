import React, { useState, useEffect } from 'react';
import { Database, Check, X, RefreshCw, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { googleSheetsSync } from '../services/googleSheetsSync';

interface GoogleSheetsConfigProps {
  onClose: () => void;
  onSyncComplete?: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function GoogleSheetsConfig({ onClose, onSyncComplete, onConnectionChange }: GoogleSheetsConfigProps) {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Cargar ID guardado
    const saved = localStorage.getItem('gowash-spreadsheet-id');
    if (saved) {
      setSpreadsheetId(saved);
    }
  }, []);

  const handleConnect = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Por favor ingresa el ID del Spreadsheet');
      return;
    }

    setIsConnecting(true);
    
    // Guardar el ID en localStorage para que el servicio lo use
    localStorage.setItem('gowash-spreadsheet-id', spreadsheetId.trim());
    
    const result = await googleSheetsSync.initialize();
    
    setIsConnecting(false);

    if (result.success) {
      setIsConnected(true);
      toast.success('✅ Conectado exitosamente a Google Sheets');
      if (onConnectionChange) onConnectionChange(true);
    } else {
      toast.error(`Error al conectar: ${result.error}`);
    }
  };

  const handleSyncUpload = async () => {
    if (!isConnected) {
      toast.error('Primero debes conectarte a Google Sheets');
      return;
    }

    setIsSyncing(true);

    try {
      // Obtener datos locales
      const vehiculosPatioStr = localStorage.getItem('gowash-mobile-patio');
      const vehiculosEntregadosStr = localStorage.getItem('gowash-mobile-entregados');

      const vehiculosPatio = vehiculosPatioStr ? JSON.parse(vehiculosPatioStr) : [];
      const vehiculosEntregados = vehiculosEntregadosStr ? JSON.parse(vehiculosEntregadosStr) : [];

      // Subir a Google Sheets
      const result = await googleSheetsSync.syncUploadAll(vehiculosPatio, vehiculosEntregados);

      if (result.success) {
        toast.success(`✅ ${vehiculosPatio.length + vehiculosEntregados.length} vehículos sincronizados`);
        if (onSyncComplete) onSyncComplete();
      } else {
        toast.error(`Error al sincronizar: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }

    setIsSyncing(false);
  };

  const handleSyncDownload = async () => {
    if (!isConnected) {
      toast.error('Primero debes conectarte a Google Sheets');
      return;
    }

    setIsSyncing(true);

    try {
      // Descargar desde Google Sheets
      const resultPatio = await googleSheetsSync.getVehiculosPatio();
      const resultEntregados = await googleSheetsSync.getVehiculosEntregados();

      if (resultPatio.success && resultEntregados.success) {
        // Guardar en localStorage
        localStorage.setItem('gowash-mobile-patio', JSON.stringify(resultPatio.data || []));
        localStorage.setItem('gowash-mobile-entregados', JSON.stringify(resultEntregados.data || []));

        toast.success(`✅ ${(resultPatio.data?.length || 0) + (resultEntregados.data?.length || 0)} vehículos descargados`);
        if (onSyncComplete) onSyncComplete();
      } else {
        toast.error('Error al descargar datos');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }

    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Google Sheets</h3>
              <p className="text-xs text-slate-400">Sincronización de Datos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Estado de conexión */}
        {isConnected && (
          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-emerald-300">Conectado</p>
              <p className="text-xs text-slate-400">La sincronización está activa</p>
            </div>
          </div>
        )}

        {/* Formulario de configuración */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Spreadsheet ID
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="1ABC...XYZ"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
              disabled={isConnected}
            />
            <p className="text-xs text-slate-500 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                Copia el ID de tu hoja de Google Sheets desde la URL:
                <br />
                <code className="text-blue-400">docs.google.com/spreadsheets/d/<strong>ESTE_ES_EL_ID</strong>/edit</code>
              </span>
            </p>
          </div>

          {!isConnected && (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Conectar
                </>
              )}
            </button>
          )}
        </div>

        {/* Acciones de sincronización */}
        {isConnected && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronización</p>
            
            <button
              onClick={handleSyncUpload}
              disabled={isSyncing}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Subir Datos a Google Sheets
                </>
              )}
            </button>

            <button
              onClick={handleSyncDownload}
              disabled={isSyncing}
              className="w-full bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Descargar Datos desde Google Sheets
                </>
              )}
            </button>
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Instrucciones
          </p>
          <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
            <li>Crea una hoja de Google Sheets nueva o usa una existente</li>
            <li>Copia el ID de la URL del spreadsheet</li>
            <li>Pégalo arriba y haz clic en "Conectar"</li>
            <li>Usa "Subir Datos" para guardar tus vehículos en la nube</li>
            <li>Usa "Descargar Datos" para recuperar desde la nube</li>
          </ol>
          <p className="text-xs text-amber-400 pt-2">
            ⚠️ La cuenta de servicio ya tiene acceso compartido a tu hoja
          </p>
        </div>
      </div>
    </div>
  );
}
