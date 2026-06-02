import React, { createContext, useContext, ReactNode } from 'react';
import { useSyncData } from '../hooks/useSyncData';
import { SyncConfig, SyncHistory } from '../services/googleSheetsService';

interface SyncContextType {
  // Estado de lectura
  isSyncing: boolean;
  lastSync: string | null;
  syncError: string | null;
  syncData: Record<string, any[]>;

  // Funciones de lectura
  manualSync: () => Promise<void>;
  updateSyncConfig: (config: Partial<SyncConfig>) => Promise<void>;
  getSyncStatus: () => Promise<SyncConfig | null>;

  // Estado de escritura
  isWriting: boolean;
  writeError: string | null;

  // Funciones de escritura
  writeVenta: (ventaData: any) => Promise<boolean>;
  writeCierre: (cierreData: any) => Promise<boolean>;
  updateLavadero: (lavaderoData: any) => Promise<boolean>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

/**
 * Provider para sincronización de datos
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const readSync = useSyncData();

  const value: SyncContextType = {
    // Estado de lectura
    isSyncing: readSync.isSyncing,
    lastSync: readSync.lastSync,
    syncError: readSync.syncError,
    syncData: readSync.syncData,

    // Funciones de lectura
    manualSync: readSync.manualSync,
    updateSyncConfig: readSync.updateSyncConfig,
    getSyncStatus: readSync.getSyncStatus,

    // Estado de escritura
    isWriting: false,
    writeError: null,

    // Funciones de escritura
    writeVenta: async () => false,
    writeCierre: async () => false,
    updateLavadero: async () => false,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

/**
 * Hook para usar el contexto de sincronización
 */
export function useSync(): SyncContextType {
  const context = useContext(SyncContext);
  if (context === undefined) {
    // Retornar un contexto por defecto en lugar de lanzar error
    return {
      isSyncing: false,
      lastSync: null,
      syncError: null,
      syncData: {},
      manualSync: async () => {},
      updateSyncConfig: async () => {},
      getSyncStatus: async () => null,
      isWriting: false,
      writeError: null,
      writeVenta: async () => false,
      writeCierre: async () => false,
      updateLavadero: async () => false,
    };
  }
  return context;
}

/**
 * Hook para acceder solo a datos de lectura
 */
export function useSyncRead() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSyncRead debe ser usado dentro de SyncProvider');
  }

  return {
    isSyncing: context.isSyncing,
    lastSync: context.lastSync,
    syncError: context.syncError,
    syncData: context.syncData,
    manualSync: context.manualSync,
    updateSyncConfig: context.updateSyncConfig,
    getSyncStatus: context.getSyncStatus,
  };
}

/**
 * Hook para acceder solo a funciones de escritura
 */
export function useSyncWriteContext() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSyncWriteContext debe ser usado dentro de SyncProvider');
  }

  return {
    isWriting: context.isWriting,
    writeError: context.writeError,
    writeVenta: context.writeVenta,
    writeCierre: context.writeCierre,
    updateLavadero: context.updateLavadero,
  };
}
