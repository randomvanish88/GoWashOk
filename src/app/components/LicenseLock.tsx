import { useState, useEffect } from 'react';
import { ShieldAlert, Key, Copy, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    electronAPI?: {
      getMachineId: () => Promise<string>;
      validateLicense: (key: string) => Promise<boolean>;
    };
  }
}

export function LicenseLock({ onActivated }: { onActivated: () => void }) {
  const [machineId, setMachineId] = useState('Obteniendo ID...');
  const [licenseKey, setLicenseKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const isElectron = typeof window.electronAPI?.getMachineId === 'function';

  useEffect(() => {
    const fetchId = async () => {
      if (!isElectron) {
        setMachineId('Usá la app de escritorio (npm run electron:dev)');
        return;
      }
      try {
        const id = await window.electronAPI!.getMachineId();
        setMachineId(id || 'UNKNOWN-ID');
      } catch {
        setMachineId('Error al leer el ID de hardware');
      }
    };
    fetchId();
  }, [isElectron]);

  const handleCopy = () => {
    navigator.clipboard.writeText(machineId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleValidate = async () => {
    if (!isElectron) {
      alert('La activación solo funciona en la aplicación de escritorio (Electron), no en el navegador.');
      return;
    }
    const isValid = await window.electronAPI!.validateLicense(licenseKey);
    if (isValid) {
      localStorage.setItem('gowash-license-active', 'true');
      onActivated();
    } else {
      alert('Clave de activación incorrecta. Por favor, verifique el ID.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f1d] flex items-center justify-center p-4">
      {/* Fondo con brillo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl z-10 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-blue-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Activación de Software</h1>
          <p className="text-slate-400 text-sm">
            Esta copia de <span className="text-blue-400 font-bold">GoWash</span> requiere activación.
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID de Hardware</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-cyan-400 font-mono text-xs overflow-hidden text-ellipsis">
                {machineId}
              </div>
              <button 
                onClick={handleCopy}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Clave de Activación</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-white font-mono text-sm"
              />
            </div>
          </div>

          <button 
            onClick={handleValidate}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            Activar Ahora
          </button>
        </div>

        <div className="pt-4 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          copyright 2026 <span className="text-blue-400/80">Gauna Agustin - Developer - Randomvanish88@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
