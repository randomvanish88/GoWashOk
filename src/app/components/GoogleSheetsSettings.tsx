import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { googleSheetsSync } from '../lib/googleSheetsSync';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';

export function GoogleSheetsSettings() {
  const [sheetId, setSheetId] = useState(googleSheetsSync.getSpreadsheetId() || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const result = await googleSheetsSync.setSpreadsheetId(sheetId);
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

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-green-600" />
        <h3 className="text-2xl font-bold text-slate-800">Configuración de Google Sheets</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
          <p className="font-bold mb-1">Instrucciones:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Crea una Google Sheet.</li>
            <li>Copia el ID de la URL (el texto largo entre /d/ y /edit).</li>
            <li>Comparte el Excel con el correo de tu Cuenta de Servicio como <b>Editor</b>.</li>
            <li>Asegúrate de que el archivo <b>google-credentials.json</b> esté en la carpeta raíz de GoWash.</li>
          </ol>
        </div>

        <div className="space-y-2 pb-4 border-b border-gray-100">
          <Label>Archivo de Credenciales (.json)</Label>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="border-dashed border-2 hover:bg-slate-50"
              onClick={async () => {
                const res = await googleSheetsSync.uploadCredentials();
                if (res.success) {
                  alert('Credenciales guardadas correctamente.');
                  // Intentamos inicializar de nuevo si ya hay un ID
                  if (sheetId) handleSave();
                } else if (res.error) {
                  alert('Error: ' + res.error);
                }
              }}
            >
              Seleccionar archivo google-credentials.json
            </Button>
            <p className="text-[10px] text-gray-400 text-center">
              Selecciona el archivo que descargaste de Google Cloud para que la app lo guarde internamente.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sheetId">ID del Spreadsheet</Label>
          <Input
            id="sheetId"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="ej: 1a2b3c4d5e6f7g8h9i0j..."
            className="bg-white"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={status === 'loading'}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
        >
          {status === 'loading' ? 'Conectando...' : 'Guardar y Probar Conexión'}
        </Button>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">¡Conectado correctamente!</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
