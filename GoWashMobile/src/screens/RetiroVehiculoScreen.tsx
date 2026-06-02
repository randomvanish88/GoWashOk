import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useVehicles } from '../hooks/useVehicles';

const ESTADOS = [
  { id: 'ingresado', label: 'Ingresado' },
  { id: 'en_lavado', label: 'En lavado' },
  { id: 'secado',    label: 'Secado'    },
  { id: 'listo',     label: 'Listo'     },
];

const PRECIO: Record<string, string> = {
  basico: '$ 4.000', premium: '$ 6.000',
  completo: '$ 8.000', detailing: '$ 12.000',
};

export function RetiroVehiculoScreen({ navigation, route }: any) {
  const { vehicle: vehicleParam } = route.params || {};
  const { getVehicleByQR, updateVehicle } = useVehicles();

  const [tab, setTab]             = useState<'scan' | 'manual'>('scan');
  const [manualCode, setManualCode] = useState('');
  const [vehicle, setVehicle]     = useState<any>(vehicleParam || null);
  const [loading, setLoading]     = useState(false);

  const estadoActual = vehicle?.estado || 'ingresado';
  const estadoIdx    = ESTADOS.findIndex(e => e.id === estadoActual);

  const handleBuscarManual = async () => {
    if (!manualCode.trim()) return;
    setLoading(true);
    try {
      const found = await getVehicleByQR(manualCode.trim().toUpperCase());
      if (found) setVehicle(found);
      else Alert.alert('No encontrado', 'No se encontró un vehículo con ese código');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEntregado = async () => {
    if (!vehicle) return;
    setLoading(true);
    try {
      await updateVehicle(vehicle.id, { estado: 'entregado', fechaEntrega: new Date() });
      Alert.alert('¡Listo!', 'Vehículo marcado como entregado', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    Alert.alert('Cancelar', '¿Cancelar el retiro?', [
      { text: 'No' },
      { text: 'Sí', style: 'destructive', onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <View style={s.root}>
      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="menu" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <View style={s.headerBrand}>
          <View style={s.logoCircle}><Text style={s.logoText}>G</Text></View>
          <View>
            <Text style={s.brandTitle}>GoWash</Text>
            <Text style={s.brandSub}>Sistema de Lavadero</Text>
          </View>
        </View>
        <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="#1E40AF" /></TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TÍTULO ── */}
        <View style={s.pageTitle}>
          <Ionicons name="car-outline" size={20} color="#1E40AF" />
          <Text style={s.pageTitleText}>Retiro de Vehículo</Text>
        </View>

        {/* ── TABS ESCANEAR / INGRESAR PATENTE ── */}
        <View style={s.card}>
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, tab === 'scan' && s.tabActive]}
              onPress={() => setTab('scan')}
            >
              <Ionicons name="qr-code-outline" size={14} color={tab === 'scan' ? '#fff' : '#6B7280'} />
              <Text style={[s.tabText, tab === 'scan' && s.tabTextActive]}>ESCANEAR QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, tab === 'manual' && s.tabActive]}
              onPress={() => setTab('manual')}
            >
              <Ionicons name="create-outline" size={14} color={tab === 'manual' ? '#fff' : '#6B7280'} />
              <Text style={[s.tabText, tab === 'manual' && s.tabTextActive]}>INGRESAR PATENTE</Text>
            </TouchableOpacity>
          </View>

          {tab === 'scan' ? (
            /* Vista de cámara simulada */
            <View style={s.cameraBox}>
              <View style={s.cameraInner}>
                <Ionicons name="qr-code" size={64} color="#9CA3AF" />
                <Text style={s.cameraText}>Cámara no disponible en web</Text>
                <Text style={s.cameraSubText}>Usa la pestaña "Ingresar Patente"</Text>
              </View>
            </View>
          ) : (
            <View style={s.manualBox}>
              <Text style={s.fieldLabel}>Código QR o Patente</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="GW1548AB123CD"
                  placeholderTextColor="#9CA3AF"
                  value={manualCode}
                  onChangeText={t => setManualCode(t.toUpperCase())}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={s.searchBtn} onPress={handleBuscarManual}>
                  <Ionicons name="search" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── DATOS DEL VEHÍCULO (si ya fue escaneado) ── */}
        {vehicle && (
          <>
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.vehicleNum}>Vehículo #{vehicle.id?.slice(-4) || '0000'}</Text>
                <View style={s.badge}><Text style={s.badgeText}>EN LAVADO</Text></View>
              </View>

              <InfoRow icon="car-outline"           label="Placa"    value={vehicle.placa} />
              <InfoRow icon="person-outline"        label="Cliente"  value={vehicle.cliente?.nombre || vehicle.cliente} />
              <InfoRow icon="construct-outline"     label="Servicio" value={`${vehicle.servicio} - ${PRECIO[vehicle.servicio] || ''}`} />
              <InfoRow icon="time-outline"          label="Ingreso"  value={new Date(vehicle.fechaIngreso).toLocaleString('es-AR')} />
              <InfoRow icon="person-circle-outline" label="Empleado" value="Martín López" />
            </View>

            {/* ── ESTADO DEL LAVADO ── */}
            <View style={s.card}>
              <Text style={s.sectionLabel}>Estado del lavado</Text>
              <View style={s.stateRow}>
                {ESTADOS.map((est, idx) => {
                  const done    = idx <= estadoIdx;
                  const current = idx === estadoIdx;
                  return (
                    <React.Fragment key={est.id}>
                      <View style={s.stateItem}>
                        <View style={[s.stateCircle, done && s.stateCircleDone, current && s.stateCircleCurrent]}>
                          {done
                            ? <Ionicons name="checkmark" size={14} color="#fff" />
                            : <View style={s.stateDot} />
                          }
                        </View>
                        <Text style={[s.stateLabel, done && s.stateLabelDone]}>{est.label}</Text>
                      </View>
                      {idx < ESTADOS.length - 1 && (
                        <View style={[s.stateLine, done && idx < estadoIdx && s.stateLineDone]} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </View>

            {/* ── TOTAL ── */}
            <View style={s.totalCard}>
              <Text style={s.totalLabel}>Total a cobrar</Text>
              <Text style={s.totalValue}>{PRECIO[vehicle.servicio] || '$ 0'}</Text>
            </View>

            {/* ── BOTONES ── */}
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancelar}>
              <Text style={s.cancelBtnText}>CANCELAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.mainBtn, loading && { opacity: 0.6 }]}
              onPress={handleMarcarEntregado}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={s.mainBtnText}>
                {loading ? 'Procesando...' : 'MARCAR COMO ENTREGADO'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={16} color="#1E40AF" />
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E40AF', justifyContent: 'center', alignItems: 'center',
  },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E40AF' },
  brandSub: { fontSize: 10, color: '#6B7280' },

  scroll: { flex: 1 },

  pageTitle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  pageTitleText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  vehicleNum: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  badge: { backgroundColor: '#DBEAFE', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#6B7280', width: 70 },
  infoValue: { fontSize: 12, color: '#1F2937', flex: 1, fontWeight: '500' },

  /* Tabs */
  tabs: { flexDirection: 'row', marginBottom: 16, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, backgroundColor: '#F9FAFB' },
  tabActive: { backgroundColor: '#1E40AF' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  /* Cámara */
  cameraBox: {
    height: 200, backgroundColor: '#1F2937', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  cameraInner: { alignItems: 'center', gap: 8 },
  cameraText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  cameraSubText: { color: '#6B7280', fontSize: 12 },

  /* Manual */
  manualBox: { paddingTop: 4 },
  fieldLabel: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937',
  },
  searchBtn: {
    width: 44, backgroundColor: '#1E40AF', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Estado */
  stateRow: { flexDirection: 'row', alignItems: 'center' },
  stateItem: { alignItems: 'center', flex: 1 },
  stateCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  stateCircleDone: { backgroundColor: '#10B981' },
  stateCircleCurrent: { backgroundColor: '#1E40AF' },
  stateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },
  stateLabel: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
  stateLabelDone: { color: '#10B981', fontWeight: '600' },
  stateLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginBottom: 20 },
  stateLineDone: { backgroundColor: '#10B981' },

  /* Total */
  totalCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  totalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },

  /* Botones */
  cancelBtn: {
    backgroundColor: '#EF4444', marginHorizontal: 16, borderRadius: 10,
    paddingVertical: 13, justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  cancelBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  mainBtn: {
    flexDirection: 'row', backgroundColor: '#10B981', marginHorizontal: 16,
    borderRadius: 10, paddingVertical: 13, justifyContent: 'center',
    alignItems: 'center', gap: 8, marginBottom: 10,
  },
  mainBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
