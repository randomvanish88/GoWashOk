/**
 * useSync - Hook de sincronización bidireccional con el servidor GoWash
 * Detecta automáticamente si está corriendo en localhost o en un dispositivo remoto
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SYNC_SERVER_URL, SYNC_WS_URL } from '../config/syncConfig';

const SYNC_URL = SYNC_SERVER_URL;
const WS_URL = SYNC_WS_URL;

// Cache local para no perder datos si el servidor no está disponible
const localCache: Record<string, any> = {};

export function useSyncData<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Cargar dato inicial desde el servidor
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${SYNC_URL}/sync/${encodeURIComponent(key)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.value !== null && json.value !== undefined) {
          setData(json.value);
          localCache[key] = json.value;
        }
      }
    } catch {
      // Servidor no disponible, usar cache local
      if (localCache[key] !== undefined) setData(localCache[key]);
    }
  }, [key]);

  // Guardar dato en el servidor
  const saveData = useCallback(async (value: T) => {
    setData(value);
    localCache[key] = value;
    try {
      await fetch(`${SYNC_URL}/sync/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      // También notificar por WebSocket si está conectado
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'update', key, value }));
      }
    } catch {
      console.warn('[Sync] Servidor no disponible, guardado solo local');
    }
  }, [key]);

  // Conectar WebSocket para recibir cambios en tiempo real
  useEffect(() => {
    fetchData();

    const connectWS = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          console.log('[Sync] WebSocket conectado');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            // Mensaje inicial con todos los datos
            if (msg.type === 'init' && msg.data?.[key] !== undefined) {
              setData(msg.data[key]);
              localCache[key] = msg.data[key];
            }
            // Actualización de una clave específica
            if (msg.type === 'update' && msg.key === key) {
              setData(msg.value);
              localCache[key] = msg.value;
            }
            // Sync masivo
            if (msg.type === 'sync' && msg.data?.[key] !== undefined) {
              setData(msg.data[key]);
              localCache[key] = msg.data[key];
            }
          } catch { /* ignorar */ }
        };

        ws.onclose = () => {
          setConnected(false);
          // Reconectar en 3 segundos
          setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      wsRef.current?.close();
    };
  }, [key, fetchData]);

  return { data, saveData, connected };
}

// Hook para leer todos los datos de una vez (útil al iniciar)
export async function fetchAllSync(): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${SYNC_URL}/sync`);
    if (res.ok) return await res.json();
  } catch { /* servidor no disponible */ }
  return {};
}

// Función para guardar múltiples claves a la vez
export async function pushSync(updates: Record<string, any>): Promise<void> {
  try {
    await fetch(`${SYNC_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch {
    console.warn('[Sync] No se pudo sincronizar con el servidor');
  }
}

// Verificar si el servidor está disponible
export async function checkSyncServer(): Promise<boolean> {
  try {
    const res = await fetch(`${SYNC_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
