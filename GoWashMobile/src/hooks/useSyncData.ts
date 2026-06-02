import { useEffect, useRef, useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import googleSheetsService, {
  SyncConfig,
  SyncResult,
  SyncHistory,
  SHEET_NAMES,
} from '../services/googleSheetsService';

export interface UseSyncDataReturn {
  isSyncing: boolean;
  lastSync: string | null;
  syncError: string | null;
  syncData: Record<string, any[]>;
  manualSync: () => Promise<void>;
  updateSyncConfig: (config: Partial<SyncConfig>) => Promise<void>;
  getSyncStatus: () => Promise<SyncConfig | null>;
}

/**
 * Hook para sincronización de datos con Google Sheets
 * Maneja sincronización periódica, manual y caché local
 */
export function useSyncData(): UseSyncDataReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncData, setSyncData] = useState<Record<string, any[]>>({});

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Realiza sincronización completa (lectura de todos los datos)
   */
  const performSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const config = await googleSheetsService.getSyncConfig();
      if (!config || !config.googleSheetsId) {
        setSyncError('Google Sheets ID no configurado');
        setIsSyncing(false);
        return;
      }

      // Inicializar conexión si no está conectada
      if (!googleSheetsService.isInitialized()) {
        const initResult = await googleSheetsService.initialize(config.googleSheetsId);
        if (!initResult.success) {
          setSyncError(initResult.error || 'Error al conectar con Google Sheets');
          setIsSyncing(false);
          return;
        }
      }

      // Leer todos los datos
      const data = await googleSheetsService.readAllData();
      setSyncData(data);

      // Guardar datos en caché local
      await AsyncStorage.setItem('syncedData', JSON.stringify(data));

      // Actualizar timestamp de última sincronización
      const now = new Date().toISOString();
      setLastSync(now);

      // Actualizar configuración
      const updatedConfig: SyncConfig = {
        ...config,
        lastSync: now,
      };
      await googleSheetsService.saveSyncConfig(updatedConfig);

      // Agregar al historial
      const historyEntry: SyncHistory = {
        id: `sync_${Date.now()}`,
        timestamp: now,
        type: 'full',
        status: 'success',
        message: 'Sincronización completada exitosamente',
        details: `Datos sincronizados: ${Object.keys(data).length} hojas`,
      };
      await googleSheetsService.addSyncHistoryEntry(historyEntry);

      console.log('[useSyncData] Sincronización completada');
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido en sincronización';
      setSyncError(errorMessage);

      // Agregar al historial
      const historyEntry: SyncHistory = {
        id: `sync_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'full',
        status: 'error',
        message: 'Error en sincronización',
        details: errorMessage,
      };
      await googleSheetsService.addSyncHistoryEntry(historyEntry);

      console.error('[useSyncData] Error en sincronización:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Carga datos del caché local
   */
  const loadCachedData = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem('syncedData');
      if (cached) {
        setSyncData(JSON.parse(cached));
      }

      const config = await googleSheetsService.getSyncConfig();
      if (config?.lastSync) {
        setLastSync(config.lastSync);
      }
    } catch (error) {
      console.error('[useSyncData] Error al cargar caché:', error);
    }
  }, []);

  /**
   * Inicializa la sincronización periódica
   */
  useEffect(() => {
    const initializeSync = async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      try {
        // Cargar configuración
        let config = await googleSheetsService.getSyncConfig();

        // Si no existe configuración, crear una por defecto
        if (!config) {
          config = {
            googleSheetsId: '',
            lastSync: '',
            autoSync: true,
            syncInterval: 5, // 5 minutos por defecto
          };
          await googleSheetsService.saveSyncConfig(config);
        }

        // Cargar datos del caché
        await loadCachedData();

        // Si hay Google Sheets ID configurado, hacer sincronización inicial
        if (config.googleSheetsId) {
          await performSync();
        }

        // Configurar sincronización periódica si está habilitada
        if (config.autoSync && config.googleSheetsId) {
          const intervalMs = config.syncInterval * 60 * 1000;
          syncIntervalRef.current = setInterval(() => {
            performSync();
          }, intervalMs);

          console.log(
            `[useSyncData] Sincronización periódica configurada cada ${config.syncInterval} minutos`
          );
        }
      } catch (error) {
        console.error('[useSyncData] Error en inicialización:', error);
      }
    };

    initializeSync();

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [performSync, loadCachedData]);

  /**
   * Sincronización manual
   */
  const manualSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  /**
   * Actualiza la configuración de sincronización
   */
  const updateSyncConfig = useCallback(
    async (newConfig: Partial<SyncConfig>) => {
      try {
        const currentConfig = await googleSheetsService.getSyncConfig();
        if (!currentConfig) return;

        const updatedConfig: SyncConfig = {
          ...currentConfig,
          ...newConfig,
        };

        await googleSheetsService.saveSyncConfig(updatedConfig);

        // Si cambió el Google Sheets ID, reinicializar
        if (newConfig.googleSheetsId && newConfig.googleSheetsId !== currentConfig.googleSheetsId) {
          googleSheetsService.disconnect();
          await performSync();
        }

        // Si cambió el intervalo o autoSync, reconfigurar el intervalo
        if (
          newConfig.syncInterval !== currentConfig.syncInterval ||
          newConfig.autoSync !== currentConfig.autoSync
        ) {
          if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
          }

          if (updatedConfig.autoSync && updatedConfig.googleSheetsId) {
            const intervalMs = updatedConfig.syncInterval * 60 * 1000;
            syncIntervalRef.current = setInterval(() => {
              performSync();
            }, intervalMs);

            console.log(
              `[useSyncData] Intervalo de sincronización actualizado a ${updatedConfig.syncInterval} minutos`
            );
          }
        }

        console.log('[useSyncData] Configuración actualizada');
      } catch (error) {
        console.error('[useSyncData] Error al actualizar configuración:', error);
        throw error;
      }
    },
    [performSync]
  );

  /**
   * Obtiene el estado actual de sincronización
   */
  const getSyncStatus = useCallback(async () => {
    return await googleSheetsService.getSyncConfig();
  }, []);

  return {
    isSyncing,
    lastSync,
    syncError,
    syncData,
    manualSync,
    updateSyncConfig,
    getSyncStatus,
  };
}

/**
 * Hook para escribir datos a Google Sheets
 */
export function useSyncWrite() {
  const [isWriting, setIsWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  /**
   * Escribe una venta
   */
  const writeVenta = useCallback(async (ventaData: any): Promise<boolean> => {
    try {
      setIsWriting(true);
      setWriteError(null);

      const config = await googleSheetsService.getSyncConfig();
      if (!config?.googleSheetsId) {
        setWriteError('Google Sheets no configurado');
        return false;
      }

      if (!googleSheetsService.isInitialized()) {
        const initResult = await googleSheetsService.initialize(config.googleSheetsId);
        if (!initResult.success) {
          setWriteError('Error al conectar con Google Sheets');
          return false;
        }
      }

      const result = await googleSheetsService.writeVenta(ventaData);

      if (!result.success) {
        setWriteError(result.error || 'Error al escribir venta');
        return false;
      }

      // Agregar al historial
      const historyEntry: SyncHistory = {
        id: `write_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'write',
        status: 'success',
        message: 'Venta sincronizada',
      };
      await googleSheetsService.addSyncHistoryEntry(historyEntry);

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      setWriteError(errorMessage);
      return false;
    } finally {
      setIsWriting(false);
    }
  }, []);

  /**
   * Escribe un cierre de caja
   */
  const writeCierre = useCallback(async (cierreData: any): Promise<boolean> => {
    try {
      setIsWriting(true);
      setWriteError(null);

      const config = await googleSheetsService.getSyncConfig();
      if (!config?.googleSheetsId) {
        setWriteError('Google Sheets no configurado');
        return false;
      }

      if (!googleSheetsService.isInitialized()) {
        const initResult = await googleSheetsService.initialize(config.googleSheetsId);
        if (!initResult.success) {
          setWriteError('Error al conectar con Google Sheets');
          return false;
        }
      }

      const result = await googleSheetsService.writeCierre(cierreData);

      if (!result.success) {
        setWriteError(result.error || 'Error al escribir cierre');
        return false;
      }

      // Agregar al historial
      const historyEntry: SyncHistory = {
        id: `write_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'write',
        status: 'success',
        message: 'Cierre sincronizado',
      };
      await googleSheetsService.addSyncHistoryEntry(historyEntry);

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      setWriteError(errorMessage);
      return false;
    } finally {
      setIsWriting(false);
    }
  }, []);

  /**
   * Actualiza el estado del lavadero
   */
  const updateLavadero = useCallback(async (lavaderoData: any): Promise<boolean> => {
    try {
      setIsWriting(true);
      setWriteError(null);

      const config = await googleSheetsService.getSyncConfig();
      if (!config?.googleSheetsId) {
        setWriteError('Google Sheets no configurado');
        return false;
      }

      if (!googleSheetsService.isInitialized()) {
        const initResult = await googleSheetsService.initialize(config.googleSheetsId);
        if (!initResult.success) {
          setWriteError('Error al conectar con Google Sheets');
          return false;
        }
      }

      const result = await googleSheetsService.updateLavadero(lavaderoData);

      if (!result.success) {
        setWriteError(result.error || 'Error al actualizar lavadero');
        return false;
      }

      // Agregar al historial
      const historyEntry: SyncHistory = {
        id: `write_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'write',
        status: 'success',
        message: 'Lavadero actualizado',
      };
      await googleSheetsService.addSyncHistoryEntry(historyEntry);

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      setWriteError(errorMessage);
      return false;
    } finally {
      setIsWriting(false);
    }
  }, []);

  return {
    isWriting,
    writeError,
    writeVenta,
    writeCierre,
    updateLavadero,
  };
}
