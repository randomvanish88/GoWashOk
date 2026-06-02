/**
 * Componente SyncIndicator - Indicador de estado de sincronización
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import vehicleSyncService from '../services/vehicleSyncService';

interface SyncStatus {
  lastSync: string | null;
  successCount: number;
  errorCount: number;
  isOnline: boolean;
}

interface SyncIndicatorProps {
  onRefresh?: () => void;
  showDetails?: boolean;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  onRefresh,
  showDetails = false,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSyncStatus();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await vehicleSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await loadSyncStatus();
      onRefresh?.();
    } finally {
      setIsLoading(false);
    }
  };

  if (!syncStatus) {
    return null;
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return '❌';
    }
    if (syncStatus.errorCount > 0) {
      return '⚠️';
    }
    return '✅';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) {
      return '#EF4444';
    }
    if (syncStatus.errorCount > 0) {
      return '#F59E0B';
    }
    return '#10B981';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Sin conexión';
    }
    if (syncStatus.errorCount > 0) {
      return `${syncStatus.errorCount} error(es)`;
    }
    return 'Sincronizado';
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSync) {
      return 'Nunca';
    }

    const lastSyncDate = new Date(syncStatus.lastSync);
    const now = new Date();
    const diffMs = now.getTime() - lastSyncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Hace unos segundos';
    }
    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    }

    return lastSyncDate.toLocaleDateString();
  };

  return (\n    <TouchableOpacity\n      style={[styles.container, { borderLeftColor: getStatusColor() }]}\n      onPress={handleRefresh}\n      disabled={isLoading}\n    >\n      <View style={styles.content}>\n        <View style={styles.statusRow}>\n          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>\n          <View style={styles.statusInfo}>\n            <Text style={[styles.statusText, { color: getStatusColor() }]}>\n              {getStatusText()}\n            </Text>\n            {showDetails && (\n              <Text style={styles.detailsText}>\n                Última: {formatLastSync()}\n              </Text>\n            )}\n          </View>\n          {isLoading && <ActivityIndicator size=\"small\" color={getStatusColor()} />}\n        </View>\n\n        {showDetails && (\n          <View style={styles.statsRow}>\n            <View style={styles.statItem}>\n              <Text style={styles.statLabel}>Éxitos:</Text>\n              <Text style={styles.statValue}>{syncStatus.successCount}</Text>\n            </View>\n            <View style={styles.statItem}>\n              <Text style={styles.statLabel}>Errores:</Text>\n              <Text style={[styles.statValue, { color: '#EF4444' }]}>\n                {syncStatus.errorCount}\n              </Text>\n            </View>\n          </View>\n        )}\n      </View>\n    </TouchableOpacity>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    backgroundColor: '#FFFFFF',\n    borderRadius: 8,\n    padding: 12,\n    marginBottom: 16,\n    borderLeftWidth: 4,\n    shadowColor: '#000',\n    shadowOffset: { width: 0, height: 1 },\n    shadowOpacity: 0.1,\n    shadowRadius: 2,\n    elevation: 2,\n  },\n  content: {\n    flex: 1,\n  },\n  statusRow: {\n    flexDirection: 'row',\n    alignItems: 'center',\n  },\n  statusIcon: {\n    fontSize: 20,\n    marginRight: 12,\n  },\n  statusInfo: {\n    flex: 1,\n  },\n  statusText: {\n    fontSize: 14,\n    fontWeight: '600',\n  },\n  detailsText: {\n    fontSize: 12,\n    color: '#6B7280',\n    marginTop: 2,\n  },\n  statsRow: {\n    flexDirection: 'row',\n    marginTop: 12,\n    paddingTop: 12,\n    borderTopWidth: 1,\n    borderTopColor: '#E5E7EB',\n  },\n  statItem: {\n    flex: 1,\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n  statLabel: {\n    fontSize: 12,\n    color: '#6B7280',\n  },\n  statValue: {\n    fontSize: 14,\n    fontWeight: '600',\n    color: '#10B981',\n  },\n});\n