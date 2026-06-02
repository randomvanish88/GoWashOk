/**
 * syncBridge.ts
 * Puente de sincronización entre la App Web GoWash y el Sync Server (puerto 3001)
 * La App Web empuja sus datos al servidor cada vez que cambian,
 * y escucha cambios que vengan de la PWA (vehículos ingresados desde el patio).
 */

const SYNC_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

// Claves que la App Web publica para que la PWA las lea
const CLAVES_PUBLICAR = [
  'gowash-lavado-precios',
  'gowash-bar-precios',
  'gowash-cosmeticos-precios',
  'gowash-extras-lavado',
  'gowash-lista-empleados',
  'gowash-ventas',
  'gowash-washCounts',
  'carwash-prices',
  'carwash-sizes',
  'carwash-brands',
];

// Claves que la PWA escribe y la App Web necesita leer
const CLAVES_ESCUCHAR = [
  'gowash-ordenes-abiertas',
  'gowash-ordenes-cobradas',
];

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

// ── PUBLICAR datos al servidor ────────────────────────────────────────────────
export async function publicarDatos(clave: string, valor: any): Promise<void> {
  try {
    await fetch(`${SYNC_URL}/sync/${encodeURIComponent(clave)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: valor }),
    });
  } catch {
    // Servidor no disponible, ignorar silenciosamente
  }
}

// ── PUBLICAR todas las claves del localStorage al servidor ────────────────────
export async function publicarTodo(): Promise<void> {
  const updates: Record<string, any> = {};
  for (const clave of CLAVES_PUBLICAR) {
    const raw = localStorage.getItem(clave);
    if (raw) {
      try { updates[clave] = JSON.parse(raw); } catch { /* ignorar */ }
    }
  }
  if (Object.keys(updates).length === 0) return;
  try {
    await fetch(`${SYNC_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch { /* ignorar */ }
}

// ── ESCUCHAR cambios de la PWA via WebSocket ──────────────────────────────────
export function iniciarEscucha(
  onOrdenesActualizadas: (ordenes: any[]) => void
): () => void {
  const conectar = () => {
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[Sync] App Web conectada al servidor de sync');
        // Publicar datos actuales al conectarse
        publicarTodo();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Mensaje inicial: cargar órdenes abiertas de la PWA
          if (msg.type === 'init' && msg.data?.['gowash-ordenes-abiertas']) {
            const ordenesDelServidor = msg.data['gowash-ordenes-abiertas'];
            const ordenesLocales = JSON.parse(localStorage.getItem('gowash-ordenes-abiertas') || '[]');
            // Merge: combinar órdenes del servidor con las locales (sin duplicados)
            const merged = mergeOrdenes(ordenesLocales, ordenesDelServidor);
            if (merged.length !== ordenesLocales.length) {
              onOrdenesActualizadas(merged);
            }
          }

          // Actualización en tiempo real de órdenes abiertas (PWA ingresó un vehículo)
          if (msg.type === 'update' && msg.key === 'gowash-ordenes-abiertas') {
            const ordenesLocales = JSON.parse(localStorage.getItem('gowash-ordenes-abiertas') || '[]');
            const merged = mergeOrdenes(ordenesLocales, msg.value || []);
            onOrdenesActualizadas(merged);
          }
        } catch { /* ignorar */ }
      };

      ws.onclose = () => {
        console.log('[Sync] Desconectado del servidor de sync, reconectando...');
        reconnectTimer = setTimeout(conectar, 4000);
      };

      ws.onerror = () => ws?.close();
    } catch {
      reconnectTimer = setTimeout(conectar, 4000);
    }
  };

  conectar();

  // Retornar función de limpieza
  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  };
}

// ── MERGE de órdenes sin duplicados ──────────────────────────────────────────
function mergeOrdenes(locales: any[], remotas: any[]): any[] {
  const mapa = new Map<string, any>();
  // Primero las locales
  for (const o of locales) mapa.set(o.id, o);
  // Luego las remotas (la PWA tiene prioridad para órdenes nuevas)
  for (const o of remotas) {
    if (!mapa.has(o.id)) mapa.set(o.id, o);
  }
  return Array.from(mapa.values());
}

// ── HOOK para usar en React ───────────────────────────────────────────────────
// Llama a publicarDatos cada vez que cambia un valor en localStorage
export function watchLocalStorage(clave: string): void {
  if (!CLAVES_PUBLICAR.includes(clave)) return;
  const raw = localStorage.getItem(clave);
  if (raw) {
    try { publicarDatos(clave, JSON.parse(raw)); } catch { /* ignorar */ }
  }
}
