import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSync } from '../context/SyncContext';
import googleSheetsService, { SyncConfig, SyncHistory } from '../services/googleSheetsService';

interface AuditLog {
  id: string;
  fecha: string;
  accion: string;
  detalles: string;
}

export default function ConfigScreen({ navigation }: any) {
  const [notificaciones, setNotificaciones] = useState(true);
  const [sincronizacion, setSincronizacion] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [empleados, setEmpleados] = useState<string[]>(['Recepción', 'Lavador 1', 'Lavador 2']);
  const [nuevoEmpleado, setNuevoEmpleado] = useState('');
  const [mostrarAudit, setMostrarAudit] = useState(false);

  // Sync states
  const sync = useSync();
  const [googleSheetsId, setGoogleSheetsId] = useState('');
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [mostrarSyncHistory, setMostrarSyncHistory] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState('5');

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      const auditGuardado = await AsyncStorage.getItem('auditLogs');
      const empleadosGuardados = await AsyncStorage.getItem('empleados');

      if (auditGuardado) {
        setAuditLogs(JSON.parse(auditGuardado));
      }

      if (empleadosGuardados) {
        setEmpleados(JSON.parse(empleadosGuardados));
      }

      // Cargar configuración de sincronización
      const config = await googleSheetsService.getSyncConfig();
      if (config) {
        setSyncConfig(config);
        setGoogleSheetsId(config.googleSheetsId);
        setAutoSyncEnabled(config.autoSync);
        setSyncInterval(config.syncInterval.toString());
      }

      // Cargar historial de sincronización
      const history = await googleSheetsService.getSyncHistory();
      setSyncHistory(history);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const agregarEmpleado = async () => {
    if (!nuevoEmpleado.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del empleado');
      return;
    }

    const empleadosActualizados = [...empleados, nuevoEmpleado];
    setEmpleados(empleadosActualizados);
    await AsyncStorage.setItem('empleados', JSON.stringify(empleadosActualizados));
    setNuevoEmpleado('');
    Alert.alert('Éxito', 'Empleado agregado correctamente');
  };

  const eliminarEmpleado = async (index: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas eliminar este empleado?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            const empleadosActualizados = empleados.filter((_, i) => i !== index);
            setEmpleados(empleadosActualizados);
            await AsyncStorage.setItem('empleados', JSON.stringify(empleadosActualizados));
          },
        },
      ]
    );
  };

  const limpiarDatos = async () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas limpiar todos los datos? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Limpiar',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('ventas');
              await AsyncStorage.removeItem('cierres');
              await AsyncStorage.removeItem('auditLogs');
              setAuditLogs([]);
              Alert.alert('Éxito', 'Datos limpiados correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron limpiar los datos');
            }
          },
        },
      ]
    );
  };

  const exportarDatos = async () => {
    try {
      const ventas = await AsyncStorage.getItem('ventas');
      const cierres = await AsyncStorage.getItem('cierres');
      const datos = {
        ventas: ventas ? JSON.parse(ventas) : [],
        cierres: cierres ? JSON.parse(cierres) : [],
        fecha: new Date().toISOString(),
      };
      Alert.alert('Éxito', `Datos exportados: ${JSON.stringify(datos).length} caracteres`);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron exportar los datos');
    }
  };

  // Funciones de sincronización
  const guardarConfiguracionSync = async () => {
    if (!googleSheetsId.trim()) {
      Alert.alert('Error', 'Ingresa el ID de Google Sheets');
      return;
    }

    try {
      const interval = parseInt(syncInterval) || 5;
      await sync.updateSyncConfig({
        googleSheetsId,
        autoSync: autoSyncEnabled,
        syncInterval: interval,
      });

      Alert.alert('Éxito', 'Configuración de sincronización guardada');
      cargarConfig();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const realizarSincronizacion = async () => {
    if (!googleSheetsId.trim()) {
      Alert.alert('Error', 'Configura el ID de Google Sheets primero');
      return;
    }

    try {
      await sync.manualSync();
      Alert.alert('Éxito', 'Sincronización completada');
      cargarConfig();
    } catch (error) {
      Alert.alert('Error', 'Error en la sincronización');
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString('es-AR');
    } catch {
      return fecha;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings" size={24} color="#8b5cf6" />
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <View style={styles.content}>
        {/* Google Sheets Synchronization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☁️ Sincronización Google Sheets</Text>
          <View style={styles.syncCard}>
            {/* Google Sheets ID Input */}
            <View style={styles.syncInputGroup}>
              <Text style={styles.syncLabel}>Google Sheets ID</Text>
              <TextInput
                style={styles.syncInput}
                placeholder="Ingresa el ID del Google Sheets"
                placeholderTextColor="#9ca3af"
                value={googleSheetsId}
                onChangeText={setGoogleSheetsId}
                editable={!sync.isSyncing}
              />
              <Text style={styles.syncHint}>
                Obtén el ID de la URL: https://docs.google.com/spreadsheets/d/[ID]/edit
              </Text>
            </View>

            {/* Connection Status */}
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Estado de conexión</Text>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: sync.syncError ? '#ef4444' : '#10b981',
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {sync.syncError ? 'Desconectado' : 'Conectado'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Last Sync */}
            {sync.lastSync && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Última sincronización</Text>
                <Text style={styles.statusValue}>{formatearFecha(sync.lastSync)}</Text>
              </View>
            )}

            {/* Auto Sync Toggle */}
            <View style={styles.syncToggleRow}>
              <View>
                <Text style={styles.preferenceName}>Sincronización automática</Text>
                <Text style={styles.preferenceDesc}>Sincronizar cada {syncInterval} minutos</Text>
              </View>
              <Switch
                value={autoSyncEnabled}
                onValueChange={setAutoSyncEnabled}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={autoSyncEnabled ? '#fff' : '#9ca3af'}
              />
            </View>

            {/* Sync Interval */}
            {autoSyncEnabled && (
              <View style={styles.syncInputGroup}>
                <Text style={styles.syncLabel}>Intervalo de sincronización (minutos)</Text>
                <TextInput
                  style={styles.syncInput}
                  placeholder="5"
                  placeholderTextColor="#9ca3af"
                  value={syncInterval}
                  onChangeText={setSyncInterval}
                  keyboardType="numeric"
                  editable={!sync.isSyncing}
                />
              </View>
            )}

            {/* Sync Buttons */}
            <View style={styles.syncButtonsGroup}>
              <TouchableOpacity
                style={[styles.syncButton, sync.isSyncing && styles.syncButtonDisabled]}
                onPress={guardarConfiguracionSync}
                disabled={sync.isSyncing}
              >
                {sync.isSyncing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="save" size={18} color="#fff" />
                )}
                <Text style={styles.syncButtonText}>Guardar Configuración</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.syncButton, styles.syncButtonPrimary, sync.isSyncing && styles.syncButtonDisabled]}
                onPress={realizarSincronizacion}
                disabled={sync.isSyncing}
              >
                {sync.isSyncing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="refresh" size={18} color="#fff" />
                )}
                <Text style={styles.syncButtonText}>Sincronizar Ahora</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {sync.syncError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{sync.syncError}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sync History */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.auditHeader}
            onPress={() => setMostrarSyncHistory(!mostrarSyncHistory)}
          >
            <Text style={styles.sectionTitle}>📊 Historial de Sincronización</Text>
            <Ionicons
              name={mostrarSyncHistory ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8b5cf6"
            />
          </TouchableOpacity>

          {mostrarSyncHistory && (
            <View style={styles.auditCard}>
              {syncHistory.length === 0 ? (
                <Text style={styles.emptyText}>No hay sincronizaciones registradas</Text>
              ) : (
                <FlatList
                  data={syncHistory.slice(-10).reverse()}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.auditItem}>
                      <View style={styles.auditHeader2}>
                        <View style={styles.syncTypeRow}>
                          <View
                            style={[
                              styles.syncStatusDot,
                              {
                                backgroundColor: item.status === 'success' ? '#10b981' : '#ef4444',
                              },
                            ]}
                          />
                          <Text style={styles.auditAction}>{item.type.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.auditTime}>{formatearFecha(item.timestamp)}</Text>
                      </View>
                      <Text style={styles.auditDetails}>{item.message}</Text>
                      {item.details && <Text style={styles.auditDetails}>{item.details}</Text>}
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>
        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Preferencias</Text>
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.preferenceName}>Notificaciones</Text>
                <Text style={styles.preferenceDesc}>Recibir alertas de ventas</Text>
              </View>
              <Switch
                value={notificaciones}
                onValueChange={setNotificaciones}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={notificaciones ? '#fff' : '#9ca3af'}
              />
            </View>
            <View style={[styles.preferenceRow, styles.preferenceRowBorder]}>
              <View>
                <Text style={styles.preferenceName}>Sincronización</Text>
                <Text style={styles.preferenceDesc}>Sincronizar con Google Sheets</Text>
              </View>
              <Switch
                value={sincronizacion}
                onValueChange={setSincronizacion}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={sincronizacion ? '#fff' : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* Empleados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Empleados</Text>
          <View style={styles.employeeCard}>
            <View style={styles.employeeInput}>
              <TextInput
                style={styles.input}
                placeholder="Nombre del empleado"
                placeholderTextColor="#9ca3af"
                value={nuevoEmpleado}
                onChangeText={setNuevoEmpleado}
              />
              <TouchableOpacity style={styles.addButton} onPress={agregarEmpleado}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={empleados}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.employeeItem}>
                  <Text style={styles.employeeName}>{item}</Text>
                  <TouchableOpacity onPress={() => eliminarEmpleado(index)}>
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>

        {/* Auditoría */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.auditHeader}
            onPress={() => setMostrarAudit(!mostrarAudit)}
          >
            <Text style={styles.sectionTitle}>📋 Auditoría de Cambios</Text>
            <Ionicons
              name={mostrarAudit ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8b5cf6"
            />
          </TouchableOpacity>

          {mostrarAudit && (
            <View style={styles.auditCard}>
              {auditLogs.length === 0 ? (
                <Text style={styles.emptyText}>No hay cambios registrados</Text>
              ) : (
                <FlatList
                  data={auditLogs.slice(-10).reverse()}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.auditItem}>
                      <View style={styles.auditHeader2}>
                        <Text style={styles.auditAction}>{item.accion}</Text>
                        <Text style={styles.auditTime}>{item.fecha}</Text>
                      </View>
                      <Text style={styles.auditDetails}>{item.detalles}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>

        {/* Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Datos</Text>
          <View style={styles.dataCard}>
            <TouchableOpacity style={styles.dataButton} onPress={exportarDatos}>
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.dataButtonText}>Exportar Datos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dataButton, styles.dataButtonDanger]}
              onPress={limpiarDatos}
            >
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.dataButtonText}>Limpiar Datos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Desarrollador</Text>
              <Text style={styles.infoValue}>GoWash Team</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>{new Date().toLocaleDateString('es-AR')}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  preferenceCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  preferenceRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  preferenceName: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },
  employeeCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
  },
  employeeInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  employeeName: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  auditCard: {
    marginTop: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
  },
  auditItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  auditHeader2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  auditAction: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  auditTime: {
    color: '#9ca3af',
    fontSize: 11,
  },
  auditDetails: {
    color: '#d1d5db',
    fontSize: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  dataCard: {
    gap: 8,
  },
  dataButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  dataButtonDanger: {
    backgroundColor: '#ef4444',
  },
  dataButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    borderBottomWidth: 1,
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  infoValue: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  // Sync Styles
  syncCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  syncInputGroup: {
    gap: 6,
  },
  syncLabel: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  syncInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
  },
  syncHint: {
    color: '#9ca3af',
    fontSize: 11,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  statusValue: {
    color: '#e5e7eb',
    fontSize: 12,
  },
  syncToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  syncButtonsGroup: {
    gap: 8,
    marginTop: 4,
  },
  syncButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  syncButtonPrimary: {
    backgroundColor: '#10b981',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    flex: 1,
  },
  syncTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
