/**
 * Configuración del servidor de sincronización.
 * 
 * Cuando la PWA corre desde el sync-server (http://192.168.0.86:3001),
 * el origen ya ES el sync-server, entonces usamos window.location.origin.
 * 
 * Cuando corre en dev (localhost:4001), apuntamos a localhost:3001.
 */

const getServerUrl = () => {
  // Si hay una URL configurada en .env, usarla
  const envUrl = import.meta.env.VITE_SYNC_URL;
  if (envUrl) return envUrl;

  // Si la PWA está siendo servida por el sync-server (puerto 3001),
  // el sync-server ES el mismo origen
  if (window.location.port === '3001') {
    return window.location.origin;
  }

  // En desarrollo local
  return 'http://localhost:3001';
};

export const SYNC_SERVER_URL = getServerUrl();
export const SYNC_WS_URL = SYNC_SERVER_URL
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');
