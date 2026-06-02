import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Share, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const PRECIO: Record<string, string> = {
  basico: '$ 4.000', premium: '$ 6.000',
  completo: '$ 8.000', detailing: '$ 12.000',
};

export function GeneracionQRScreen({ navigation, route }: any) {
  const { vehicle } = route.params || {};

  const qrValue = vehicle?.qrCode || 'GW000000000';
  const vehicleNum = vehicle?.id?.slice(-4) || '0000';
  const now = new Date().toLocaleDateString('es-AR') + ' - ' +
    new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

  const handleWhatsApp = async () => {
    try {
      await Share.share({
        message:
          `🚗 *GoWash - Vehículo Ingresado*\n\n` +
          `Placa: ${vehicle?.placa}\n` +
          `Cliente: ${vehicle?.cliente?.nombre}\n` +
          `Servicio: ${vehicle?.servicio} - ${PRECIO[vehicle?.servicio] || ''}\n` +
          `Ingreso: ${now}\n\n` +
          `Código QR: ${qrValue}`,
      });
    } catch { }
  };

  const handlePrintTicket = () => {
    Alert.alert('Imprimir', 'Función de impresión próximamente');
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

        {/* ── CONFIRMACIÓN ── */}
        <View style={s.confirmCard}>
          <View style={s.checkCircle}>
            <Ionicons name="checkmark" size={28} color="#fff" />
          </View>
          <Text style={s.confirmTitle}>¡Vehículo Ingresado!</Text>
          <Text style={s.confirmSub}>Código generado correctamente</Text>
        </View>

        {/* ── DATOS DEL VEHÍCULO ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.vehicleNum}>Vehículo #{vehicleNum}</Text>
            <View style={s.badge}><Text style={s.badgeText}>EN LAVADO</Text></View>
          </View>

          <InfoRow icon="car-outline"          label="Placa"    value={vehicle?.placa || 'AB123CD'} />
          <InfoRow icon="person-outline"       label="Cliente"  value={vehicle?.cliente?.nombre || 'Juan Pérez'} />
          <InfoRow icon="construct-outline"    label="Servicio" value={`${vehicle?.servicio || 'Premium'} - ${PRECIO[vehicle?.servicio] || '$ 6.000'}`} />
          <InfoRow icon="time-outline"         label="Ingreso"  value={now} />
          <InfoRow icon="person-circle-outline" label="Empleado" value="Martín López" />
        </View>

        {/* ── QR CODE ── */}
        <View style={s.qrCard}>
          <Text style={s.qrHint}>Escanea este código para el retiro del vehículo</Text>
          <View style={s.qrBox}>
            <QRCode
              value={qrValue}
              size={180}
              color="#000"
              backgroundColor="#fff"
            />
          </View>
          <Text style={s.qrLabel}>{qrValue}</Text>
        </View>

        {/* ── BOTONES ── */}
        <TouchableOpacity style={s.btnWhatsapp} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={s.btnWhatsappText}>ENVIAR POR WHATSAPP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btnPrint} onPress={handlePrintTicket}>
          <Ionicons name="print-outline" size={20} color="#374151" />
          <Text style={s.btnPrintText}>IMPRIMIR TICKET</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Componente auxiliar ── */
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

  /* Confirmación */
  confirmCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  checkCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
  confirmSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },

  /* Card datos */
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  vehicleNum: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  badge: { backgroundColor: '#DBEAFE', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#6B7280', width: 70 },
  infoValue: { fontSize: 12, color: '#1F2937', flex: 1, fontWeight: '500' },

  /* QR */
  qrCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  qrHint: { fontSize: 12, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  qrBox: {
    padding: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
  },
  qrLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, letterSpacing: 1 },

  /* Botones */
  btnWhatsapp: {
    flexDirection: 'row', backgroundColor: '#25D366',
    marginHorizontal: 16, borderRadius: 10, paddingVertical: 13,
    justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  btnWhatsappText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  btnPrint: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, borderRadius: 10, paddingVertical: 13,
    justifyContent: 'center', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10,
  },
  btnPrintText: { color: '#374151', fontSize: 14, fontWeight: 'bold' },
});
