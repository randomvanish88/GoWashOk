import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVehicles } from '../hooks/useVehicles';

const SERVICIOS = [
  { id: 'basico',    label: 'Básico',    precio: '$ 4.000' },
  { id: 'premium',   label: 'Premium',   precio: '$ 6.000' },
  { id: 'completo',  label: 'Completo',  precio: '$ 8.000' },
  { id: 'detailing', label: 'Detailing', precio: '$ 12.000' },
];

const FORMAS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cuenta'];

const MARCAS = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Mercedes'];
const COLORES = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Plateado'];

export function IngresoVehiculoScreen({ navigation }: any) {
  const { addVehicle } = useVehicles();

  const [placa, setPlaca]               = useState('');
  const [marca, setMarca]               = useState('Toyota');
  const [modelo, setModelo]             = useState('Corolla');
  const [color, setColor]               = useState('Blanco');
  const [cliente, setCliente]           = useState('');
  const [telefono, setTelefono]         = useState('');
  const [servicio, setServicio]         = useState('premium');
  const [observaciones, setObservaciones] = useState('');
  const [formaPago, setFormaPago]       = useState('Efectivo');
  const [loading, setLoading]           = useState(false);

  const handleGenerarQR = async () => {
    if (!placa.trim()) {
      Alert.alert('Error', 'Ingresa la placa del vehículo');
      return;
    }
    if (!cliente.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return;
    }
    setLoading(true);
    try {
      const vehicle = await addVehicle({
        placa: placa.toUpperCase().trim(),
        marca,
        modelo,
        color,
        cliente: { nombre: cliente, telefono },
        servicio: servicio as any,
        observaciones,
        formaPago: formaPago.toLowerCase() as any,
      });
      navigation.navigate('GeneracionQR', { vehicle });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity><Ionicons name="menu" size={24} color="#1E40AF" /></TouchableOpacity>
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
        {/* Título pantalla */}
        <View style={s.pageTitle}>
          <Ionicons name="car" size={20} color="#1E40AF" />
          <Text style={s.pageTitleText}>Ingreso de Vehículo</Text>
        </View>

        {/* ── SECCIÓN 1: Datos del Vehículo ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>1. Datos del Vehículo</Text>

          <Text style={s.fieldLabel}>Placa</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="AB123CD"
              placeholderTextColor="#9CA3AF"
              value={placa}
              onChangeText={t => setPlaca(t.toUpperCase())}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={s.inputIcon}>
              <Ionicons name="search" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={s.fieldLabel}>Marca / Modelo</Text>
          <View style={s.inputRow}>
            <View style={[s.select, { flex: 1, marginRight: 8 }]}>
              <Text style={s.selectText}>{marca} {modelo}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </View>
            <View style={[s.select, { flex: 1 }]}>
              <Text style={s.selectText}>{color}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </View>
          </View>
        </View>

        {/* ── SECCIÓN 2: Cliente ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>2. Cliente</Text>

          <Text style={s.fieldLabel}>Cliente</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Juan Pérez"
              placeholderTextColor="#9CA3AF"
              value={cliente}
              onChangeText={setCliente}
            />
            <TouchableOpacity style={s.inputIcon}>
              <Ionicons name="add" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={s.fieldLabel}>Teléfono</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="11 2345 6789"
              placeholderTextColor="#9CA3AF"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={s.inputIcon}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SECCIÓN 3: Servicio ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>3. Servicio</Text>
          <View style={s.serviceGrid}>
            {SERVICIOS.map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={[s.serviceBtn, servicio === svc.id && s.serviceBtnActive]}
                onPress={() => setServicio(svc.id)}
              >
                <Text style={[s.serviceName, servicio === svc.id && s.serviceNameActive]}>
                  {svc.label}
                </Text>
                <Text style={[s.servicePrice, servicio === svc.id && s.servicePriceActive]}>
                  {svc.precio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── SECCIÓN 4: Observaciones ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>4. Observaciones</Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="No mojar interior. Cuidado con el espejo derecho."
            placeholderTextColor="#9CA3AF"
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* ── SECCIÓN 5: Forma de Pago ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>5. Forma de Pago</Text>
          <View style={s.payGrid}>
            {FORMAS_PAGO.map(fp => (
              <TouchableOpacity
                key={fp}
                style={[s.payBtn, formaPago === fp && s.payBtnActive]}
                onPress={() => setFormaPago(fp)}
              >
                <Text style={[s.payText, formaPago === fp && s.payTextActive]}>{fp}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── BOTÓN PRINCIPAL ── */}
        <TouchableOpacity
          style={[s.mainBtn, loading && { opacity: 0.6 }]}
          onPress={handleGenerarQR}
          disabled={loading}
        >
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
          <Text style={s.mainBtnText}>{loading ? 'Generando...' : 'GENERAR QR E INGRESAR'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  /* Header */
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

  /* Page title */
  pageTitle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  pageTitleText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  scroll: { flex: 1 },

  /* Card */
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12 },

  /* Fields */
  fieldLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937',
    backgroundColor: '#fff',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputIcon: {
    width: 40, height: 40, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  select: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  selectText: { fontSize: 14, color: '#1F2937' },
  textarea: { minHeight: 72, textAlignVertical: 'top' },

  /* Servicios */
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceBtn: {
    width: '48%', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#fff',
  },
  serviceBtnActive: { backgroundColor: '#1E40AF', borderColor: '#1E40AF' },
  serviceName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  serviceNameActive: { color: '#fff' },
  servicePrice: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  servicePriceActive: { color: '#BFDBFE' },

  /* Pago */
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  payBtn: {
    flex: 1, minWidth: '48%', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff',
  },
  payBtnActive: { backgroundColor: '#1E40AF', borderColor: '#1E40AF' },
  payText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  payTextActive: { color: '#fff' },

  /* Botón principal */
  mainBtn: {
    flexDirection: 'row', backgroundColor: '#1E40AF', marginHorizontal: 16,
    borderRadius: 10, paddingVertical: 14, justifyContent: 'center',
    alignItems: 'center', gap: 8, marginTop: 4,
  },
  mainBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
