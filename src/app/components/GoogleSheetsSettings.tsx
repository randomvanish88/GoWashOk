import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { googleSheetsSync } from '../lib/googleSheetsSync';
import { Database, CheckCircle2, AlertCircle, Beaker, ShieldCheck, HelpCircle } from 'lucide-react';

export function GoogleSheetsSettings() {
  const [sheetId, setSheetId] = useState(googleSheetsSync.getSpreadsheetId() || '');
  const [testSheetId, setTestSheetId] = useState(googleSheetsSync.getTestSpreadsheetId() || '');
  const [driveFolderId, setDriveFolderId] = useState(googleSheetsSync.getDriveFolderId() || '');
  const [isTestMode, setIsTestMode] = useState(googleSheetsSync.isTestMode());
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setStatus('loading');
    setErrorMsg('');
    
    try {
      await googleSheetsSync.setSpreadsheetId(sheetId);
      await googleSheetsSync.setTestSpreadsheetId(testSheetId);
      googleSheetsSync.setDriveFolderId(driveFolderId);
      const result = await googleSheetsSync.setTestMode(isTestMode);
      
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'No se pudo conectar. Verifica el ID y las credenciales.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error desconocido');
    }
  };

  const toggleTestMode = async () => {
    const newMode = !isTestMode;
    setIsTestMode(newMode);
    // Auto-save when toggling mode for better UX
    setStatus('loading');
    const result = await googleSheetsSync.setTestMode(newMode);
    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Error al cambiar de modo');
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-green-600" />
          <h3 className="text-2xl font-bold text-slate-800">Configuración de Google Sheets</h3>
        </div>
        
        {/* Indicador de Modo */}
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
          isTestMode 
            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {isTestMode ? (
            <><Beaker className="w-3.5 h-3.5" /> MODO PRUEBA ACTIVO</>
          ) : (
            <><ShieldCheck className="w-3.5 h-3.5" /> MODO PRODUCCIÓN</>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Modo Prueba Toggle */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between group transition-all hover:bg-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-base font-bold text-slate-700 cursor-pointer" htmlFor="testMode">Modo Prueba</Label>
              <Beaker className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Desvía los registros a pestañas de prueba (ej: <b>PRUEBA-Ventas</b>) para no afectar tu base de datos real.
            </p>
          </div>
          <div 
            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isTestMode ? 'bg-amber-500' : 'bg-slate-300'}`}
            onClick={toggleTestMode}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isTestMode ? 'translate-x-7' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 flex gap-3">
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1">¿Cómo funciona?</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>En <b>Modo Producción</b>, se usa el ID principal.</li>
                <li>En <b>Modo Prueba</b>, se usa el ID de Pruebas (si existe) o el principal con prefijo <b>PRUEBA-</b> en las pestañas.</li>
                <li>Las pestañas se crean automáticamente si no existen.</li>
              </ul>
            </div>
          </div>

          <div className="grid gap-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="sheetId" className="text-slate-700 font-semibold">ID del Spreadsheet (Producción)</Label>
              <Input
                id="sheetId"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="ej: 1a2b3c4d5e6f7g8h9i0j..."
                className="bg-white border-slate-200 focus:ring-green-500"
              />
            </div>

            <div className={`space-y-2 transition-opacity ${isTestMode ? 'opacity-100' : 'opacity-60'}`}>
              <Label htmlFor="testSheetId" className="text-slate-700 font-semibold flex items-center gap-2">
                ID del Spreadsheet de Pruebas <span className="text-xs font-normal text-slate-400">(Opcional)</span>
              </Label>
              <Input
                id="testSheetId"
                value={testSheetId}
                onChange={(e) => setTestSheetId(e.target.value)}
                placeholder="Deja vacío para usar el mismo archivo en pestañas diferentes"
                className="bg-white border-slate-200 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driveFolderId" className="text-slate-700 font-semibold flex items-center gap-2">
                ID de la Carpeta de Google Drive (para fotos)
              </Label>
              <Input
                id="driveFolderId"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                placeholder="ej: 1F5a3wG36Dmg4rJm70F9kRswyC3XlHj9q"
                className="bg-white border-slate-200 focus:ring-green-500"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                ⚠️ Recordá compartir tu carpeta de Drive como <b>Editor</b> con la cuenta de servicio de Google: <br />
                <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded select-all font-bold text-slate-700">gowash-sync@gowash-db-496413.iam.gserviceaccount.com</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleSave} 
            disabled={status === 'loading'}
            className={`w-full font-bold h-12 transition-all ${
              isTestMode 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {status === 'loading' ? 'Guardando...' : 'Guardar Configuración'}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-slate-400 hover:text-slate-600 text-xs gap-2"
            onClick={async () => {
              const res = await googleSheetsSync.uploadCredentials();
              if (res.success) alert('Credenciales actualizadas.');
            }}
          >
            Actualizar archivo de credenciales (.json)
          </Button>
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Configuración guardada y conectada correctamente.</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

