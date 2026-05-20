/**
 * Sistema de backup automático de datos.
 * 
 * Guarda todos los datos de localStorage en un archivo JSON en disco
 * a través de Electron IPC. Si localStorage se pierde durante una
 * actualización, restaura automáticamente desde el backup.
 */

// Todas las claves de localStorage que usa la app
const BACKUP_KEYS = [
  'gowash-ventas',
  'gowash-washCounts',
  'gowash-cosmeticos-precios',
  'gowash-bar-precios',
  'gowash-lavado-precios',
  'gowash-ordenes-abiertas',
  'gowash-ventas-anuladas',
  'gowash-lista-empleados',
  'gowash-consumos-empleados',
  'gowash-historial-consumos-empleados',
  'gowash-audit-logs',
  'gowash-metodos-pago-ventas',
  'gowash-denominaciones-billetes',
  'gowash-extras-lavado',
  'gowash-license-active',
  'gowash-auth',
  'carwash-prices',
  'carwash-sizes',
  'carwash-brands',
  'gowash-gastos',
  'gowash-sheets-id',
];

declare global {
  interface Window {
    electronAPI?: {
      backup?: {
        save: (data: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
        load: () => Promise<{ success: boolean; data: Record<string, string> | null; error?: string }>;
      };
      [key: string]: any;
    };
  }
}

function getElectronBackup() {
  if (typeof window !== 'undefined' && window.electronAPI?.backup) {
    return window.electronAPI.backup;
  }
  return null;
}

/** Guarda un snapshot de todos los datos de localStorage en disco */
export async function saveDataBackup(): Promise<boolean> {
  const api = getElectronBackup();
  if (!api) return false;

  const data: Record<string, string> = {};
  BACKUP_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) data[key] = value;
  });

  // También guardar claves dinámicas (inicio-monto, arqueo, cierre-enviado)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('gowash-inicio-monto-') ||
      key.startsWith('gowash-arqueo-') ||
      key.startsWith('gowash-cierre-enviado-')
    )) {
      const value = localStorage.getItem(key);
      if (value) data[key] = value;
    }
  }

  const result = await api.save(data);
  return result.success;
}

/** 
 * Verifica si localStorage perdió datos y restaura desde backup.
 * Retorna true si se restauraron datos.
 */
export async function restoreFromBackupIfNeeded(): Promise<boolean> {
  const api = getElectronBackup();
  if (!api) return false;

  // Revisar si hay datos críticos en localStorage
  const hasVentas = !!localStorage.getItem('gowash-ventas');
  const hasPrices = !!localStorage.getItem('carwash-prices');
  const hasBar = !!localStorage.getItem('gowash-bar-precios');

  // Si ya hay datos, no necesita restaurar
  if (hasVentas || hasPrices || hasBar) return false;

  // localStorage vacío - intentar restaurar desde backup
  const result = await api.load();
  if (!result.success || !result.data) return false;

  const entries = Object.entries(result.data);
  if (entries.length === 0) return false;

  console.log(`[Backup] Restaurando ${entries.length} claves desde backup en disco...`);
  entries.forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });

  return true;
}

/** Timer para auto-backup cada 2 minutos */
let backupInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoBackup() {
  if (backupInterval) return;
  // Backup inmediato al iniciar
  saveDataBackup();
  // Luego cada 2 minutos
  backupInterval = setInterval(() => {
    saveDataBackup();
  }, 2 * 60 * 1000);
}

export function stopAutoBackup() {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
  }
}
