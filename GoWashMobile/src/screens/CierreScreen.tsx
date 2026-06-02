import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Venta {
  id: string;
  fecha: string;
  hora: string;
  patente: string;
  cliente: string;
  lavado: number;
  bar: number;
  cosmeticos: number;
  descuento: number;
  recargo: number;
  total: number;
  metodoPago: string;
}

interface Cierre {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  montoCajaInicio: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalTarjeta: number;
  totalVentas: number;
  gastos: number;
  diferencia: number;
}

export default function CierreScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [montoCajaInicio, setMontoCajaInicio] = useState('0');
  const [totalEfectivo, setTotalEfectivo] = useState(0);
  const [totalTransferencia, setTotalTransferencia] = useState(0);
  const [totalTarjeta, setTotalTarjeta] = useState(0);
  const [gastos, setGastos] = useState('0');
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [composicionAbierto, setComposicionAbierto] = useState(true);
  const [arqueoAbierto, setArqueoAbierto] = useState(true);
  const [gastosAbierto, setGastosAbierto] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const ventasGuardadas = await AsyncStorage.getItem('ventas');
      const cierresGuardados = await AsyncStorage.getItem('cierres');
      
      if (ventasGuardadas) {
        const ventasArray = JSON.parse(ventasGuardadas);
        setVentas(ventasArray);
        calcularTotales(ventasArray);
      }
      
      if (cierresGuardados) {
        setCierres(JSON.parse(cierresGuardados));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const calcularTotales = (ventasArray: Venta[]) => {
    let efectivo = 0;
    let transferencia = 0;
    let tarjeta = 0;

    ventasArray.forEach((venta) => {
      if (venta.metodoPago === 'Efectivo') {
        efectivo += venta.total;
      } else if (venta.metodoPago === 'Transferencia') {
        transferencia += venta.total;
      } else if (venta.metodoPago === 'Tarjeta') {
        tarjeta += venta.total;
      }
    });

    setTotalEfectivo(efectivo);
    setTotalTransferencia(transferencia);
    setTotalTarjeta(tarjeta);
  };

  const realizarCierre = async () => {
    const totalVentas = totalEfectivo + totalTransferencia + totalTarjeta;
    const montoCaja = parseFloat(montoCajaInicio);
    const diferencia = montoCaja + totalEfectivo - parseFloat(gastos);

    const nuevoCierre: Cierre = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '00:00',
      horaFin: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      montoCajaInicio: montoCaja,
      totalEfectivo,
      totalTransferencia,
      totalTarjeta,
      totalVentas,
      gastos: parseFloat(gastos),
      diferencia,
    };

    try {
      const cierresActuales = [...cierres, nuevoCierre];
      setCierres(cierresActuales);
      await AsyncStorage.setItem('cierres', JSON.stringify(cierresActuales));
      
      // Limpiar ventas
      await AsyncStorage.setItem('ventas', JSON.stringify([]));
      setVentas([]);
      
      // Resetear valores
      setMontoCajaInicio('0');
      setGastos('0');
      setTotalEfectivo(0);
      setTotalTransferencia(0);
      setTotalTarjeta(0);

      Alert.alert('Éxito', `Cierre realizado. Diferencia: $${diferencia.toFixed(2)}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar el cierre');
    }
  };

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalVentas = totalEfectivo + totalTransferencia + totalTarjeta;
  const diferencia = parseFloat(montoCajaInicio) + totalEfectivo - parseFloat(gastos);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="close-circle" size={24} color="#f59e0b" />
        <Text style={styles.headerTitle}>Cierre de Caja</Text>
      </View>

      <View style={styles.form}>
        {/* Composición del Cierre */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setComposicionAbierto(!composicionAbierto)}
          >
            <Text style={styles.sectionTitle}>💰 Composición del Cierre</Text>
            <Ionicons
              name={composicionAbierto ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#10b981"
            />
          </TouchableOpacity>

          {composicionAbierto && (
            <View style={styles.composicionContent}>
              <View style={styles.composicionRow}>
                <Text style={styles.composicionLabel}>Ventas Lavadero</Text>
                <Text style={styles.composicionValue}>{formatMoney(totalEfectivo * 0.6)}</Text>
              </View>
              <View style={styles.composicionRow}>
                <Text style={styles.composicionLabel}>Ventas Bar</Text>
                <Text style={styles.composicionValue}>{formatMoney(totalEfectivo * 0.2)}</Text>
              </View>
              <View style={styles.composicionRow}>
                <Text style={styles.composicionLabel}>Ventas Cosmética</Text>
                <Text style={styles.composicionValue}>{formatMoney(totalEfectivo * 0.2)}</Text>
              </View>
              <View style={[styles.composicionRow, styles.composicionRowTotal]}>
                <Text style={styles.composicionLabel}>Total Ventas</Text>
                <Text style={styles.composicionValue}>{formatMoney(totalVentas)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Arqueo Físico */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setArqueoAbierto(!arqueoAbierto)}
          >
            <Text style={styles.sectionTitle}>💵 Arqueo Físico</Text>
            <Ionicons
              name={arqueoAbierto ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#10b981"
            />
          </TouchableOpacity>

          {arqueoAbierto && (
            <View style={styles.arqueoContent}>
              <View style={styles.arqueoRow}>
                <Text style={styles.arqueoLabel}>Monto Caja Inicio</Text>
                <TextInput
                  style={styles.arqueoInput}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={montoCajaInicio}
                  onChangeText={setMontoCajaInicio}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.arqueoRow}>
                <Text style={styles.arqueoLabel}>Efectivo Contado</Text>
                <Text style={styles.arqueoValue}>{formatMoney(totalEfectivo)}</Text>
              </View>
              <View style={styles.arqueoRow}>
                <Text style={styles.arqueoLabel}>Transferencias</Text>
                <Text style={styles.arqueoValue}>{formatMoney(totalTransferencia)}</Text>
              </View>
              <View style={styles.arqueoRow}>
                <Text style={styles.arqueoLabel}>Tarjetas</Text>
                <Text style={styles.arqueoValue}>{formatMoney(totalTarjeta)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Gastos Diarios */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setGastosAbierto(!gastosAbierto)}
          >
            <Text style={styles.sectionTitle}>📊 Gastos Diarios</Text>
            <Ionicons
              name={gastosAbierto ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#10b981"
            />
          </TouchableOpacity>

          {gastosAbierto && (
            <View style={styles.gastosContent}>
              <View style={styles.gastosRow}>
                <Text style={styles.gastosLabel}>Total Gastos</Text>
                <TextInput
                  style={styles.gastosInput}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={gastos}
                  onChangeText={setGastos}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}
        </View>

        {/* Resumen */}
        <View style={styles.resumenSection}>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Total Ventas</Text>
            <Text style={styles.resumenValue}>{formatMoney(totalVentas)}</Text>
          </View>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Gastos</Text>
            <Text style={styles.resumenValue}>{formatMoney(parseFloat(gastos))}</Text>
          </View>
          <View style={[styles.resumenRow, styles.resumenRowTotal]}>
            <Text style={styles.resumenLabel}>Diferencia</Text>
            <Text style={[styles.resumenValue, { color: diferencia >= 0 ? '#10b981' : '#ef4444' }]}>
              {formatMoney(diferencia)}
            </Text>
          </View>
        </View>

        {/* Botón Cierre */}
        <TouchableOpacity style={styles.cierreButton} onPress={realizarCierre}>
          <Ionicons name="checkmark-done" size={20} color="#fff" />
          <Text style={styles.cierreButtonText}>Realizar Cierre</Text>
        </TouchableOpacity>
      </View>

      {/* Últimos Cierres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimos Cierres</Text>
        <FlatList
          data={cierres.slice(-5).reverse()}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.cierreCard}>
              <View style={styles.cierreCardHeader}>
                <Text style={styles.cierreCardDate}>{item.fecha}</Text>
                <Text style={styles.cierreCardTime}>{item.horaFin}</Text>
              </View>
              <View style={styles.cierreCardBody}>
                <View style={styles.cierreCardRow}>
                  <Text style={styles.cierreCardLabel}>Total Ventas</Text>
                  <Text style={styles.cierreCardValue}>{formatMoney(item.totalVentas)}</Text>
                </View>
                <View style={styles.cierreCardRow}>
                  <Text style={styles.cierreCardLabel}>Diferencia</Text>
                  <Text style={[styles.cierreCardValue, { color: item.diferencia >= 0 ? '#10b981' : '#ef4444' }]}>
                    {formatMoney(item.diferencia)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
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
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  composicionContent: {
    marginTop: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  composicionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  composicionRowTotal: {
    borderBottomWidth: 0,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    marginTop: 8,
  },
  composicionLabel: {
    color: '#d1d5db',
    fontSize: 13,
  },
  composicionValue: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  arqueoContent: {
    marginTop: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  arqueoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  arqueoLabel: {
    color: '#d1d5db',
    fontSize: 13,
    flex: 1,
  },
  arqueoInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#fff',
    width: 100,
    textAlign: 'right',
    fontSize: 13,
  },
  arqueoValue: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
    width: 100,
    textAlign: 'right',
  },
  gastosContent: {
    marginTop: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gastosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  gastosLabel: {
    color: '#d1d5db',
    fontSize: 13,
    flex: 1,
  },
  gastosInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#fff',
    width: 100,
    textAlign: 'right',
    fontSize: 13,
  },
  resumenSection: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  resumenRowTotal: {
    borderBottomWidth: 0,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    marginTop: 8,
  },
  resumenLabel: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  resumenValue: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  cierreButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  cierreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cierreCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cierreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cierreCardDate: {
    color: '#fff',
    fontWeight: '600',
  },
  cierreCardTime: {
    color: '#9ca3af',
    fontSize: 12,
  },
  cierreCardBody: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  cierreCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cierreCardLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  cierreCardValue: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 12,
  },
});
