import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  horaFin: string;
  totalVentas: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalTarjeta: number;
  gastos: number;
  diferencia: number;
}

export default function ReportesScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalLavado: 0,
    totalBar: 0,
    totalCosmetica: 0,
    totalDescuentos: 0,
    totalRecargos: 0,
    cantidadVentas: 0,
    promedioVenta: 0,
  });

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
        calcularEstadisticas(ventasArray);
      }

      if (cierresGuardados) {
        setCierres(JSON.parse(cierresGuardados));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const calcularEstadisticas = (ventasArray: Venta[]) => {
    let totalVentas = 0;
    let totalLavado = 0;
    let totalBar = 0;
    let totalCosmetica = 0;
    let totalDescuentos = 0;
    let totalRecargos = 0;

    ventasArray.forEach((venta) => {
      totalVentas += venta.total;
      totalLavado += venta.lavado;
      totalBar += venta.bar;
      totalCosmetica += venta.cosmeticos;
      totalDescuentos += venta.descuento;
      totalRecargos += venta.recargo;
    });

    setEstadisticas({
      totalVentas,
      totalLavado,
      totalBar,
      totalCosmetica,
      totalDescuentos,
      totalRecargos,
      cantidadVentas: ventasArray.length,
      promedioVenta: ventasArray.length > 0 ? totalVentas / ventasArray.length : 0,
    });
  };

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calcularPorcentaje = (valor: number, total: number) => {
    if (total === 0) return '0%';
    return `${((valor / total) * 100).toFixed(1)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart" size={24} color="#8b5cf6" />
        <Text style={styles.headerTitle}>Reportes</Text>
      </View>

      <View style={styles.content}>
        {/* Resumen del Día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumen del Día</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Ventas</Text>
              <Text style={styles.statValue}>{formatMoney(estadisticas.totalVentas)}</Text>
              <Text style={styles.statSubtitle}>{estadisticas.cantidadVentas} ventas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Promedio Venta</Text>
              <Text style={styles.statValue}>{formatMoney(estadisticas.promedioVenta)}</Text>
              <Text style={styles.statSubtitle}>por transacción</Text>
            </View>
          </View>
        </View>

        {/* Ventas por Sector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Ventas por Sector</Text>
          <View style={styles.sectorCard}>
            <View style={styles.sectorRow}>
              <View style={styles.sectorInfo}>
                <Text style={styles.sectorName}>Lavadero</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(estadisticas.totalLavado / estadisticas.totalVentas) * 100 || 0}%`,
                        backgroundColor: '#3b82f6',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.sectorValue}>
                <Text style={styles.sectorAmount}>{formatMoney(estadisticas.totalLavado)}</Text>
                <Text style={styles.sectorPercent}>
                  {calcularPorcentaje(estadisticas.totalLavado, estadisticas.totalVentas)}
                </Text>
              </View>
            </View>

            <View style={styles.sectorRow}>
              <View style={styles.sectorInfo}>
                <Text style={styles.sectorName}>Bar</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(estadisticas.totalBar / estadisticas.totalVentas) * 100 || 0}%`,
                        backgroundColor: '#f59e0b',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.sectorValue}>
                <Text style={styles.sectorAmount}>{formatMoney(estadisticas.totalBar)}</Text>
                <Text style={styles.sectorPercent}>
                  {calcularPorcentaje(estadisticas.totalBar, estadisticas.totalVentas)}
                </Text>
              </View>
            </View>

            <View style={styles.sectorRow}>
              <View style={styles.sectorInfo}>
                <Text style={styles.sectorName}>Cosmética</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(estadisticas.totalCosmetica / estadisticas.totalVentas) * 100 || 0}%`,
                        backgroundColor: '#14b8a6',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.sectorValue}>
                <Text style={styles.sectorAmount}>{formatMoney(estadisticas.totalCosmetica)}</Text>
                <Text style={styles.sectorPercent}>
                  {calcularPorcentaje(estadisticas.totalCosmetica, estadisticas.totalVentas)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Descuentos y Recargos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Descuentos y Recargos</Text>
          <View style={styles.discountCard}>
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Total Descuentos</Text>
              <Text style={styles.discountValue}>{formatMoney(estadisticas.totalDescuentos)}</Text>
            </View>
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Total Recargos</Text>
              <Text style={styles.discountValue}>{formatMoney(estadisticas.totalRecargos)}</Text>
            </View>
            <View style={[styles.discountRow, styles.discountRowTotal]}>
              <Text style={styles.discountLabel}>Neto</Text>
              <Text style={styles.discountValue}>
                {formatMoney(estadisticas.totalRecargos - estadisticas.totalDescuentos)}
              </Text>
            </View>
          </View>
        </View>

        {/* Últimos Cierres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Últimos Cierres</Text>
          <FlatList
            data={cierres.slice(-5).reverse()}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.cierreItem}>
                <View style={styles.cierreHeader}>
                  <Text style={styles.cierreDate}>{item.fecha}</Text>
                  <Text style={styles.cierreTime}>{item.horaFin}</Text>
                </View>
                <View style={styles.cierreBody}>
                  <View style={styles.cierreRow}>
                    <Text style={styles.cierreLabel}>Total Ventas</Text>
                    <Text style={styles.cierreValue}>{formatMoney(item.totalVentas)}</Text>
                  </View>
                  <View style={styles.cierreRow}>
                    <Text style={styles.cierreLabel}>Gastos</Text>
                    <Text style={styles.cierreValue}>{formatMoney(item.gastos)}</Text>
                  </View>
                  <View style={[styles.cierreRow, styles.cierreRowTotal]}>
                    <Text style={styles.cierreLabel}>Diferencia</Text>
                    <Text
                      style={[
                        styles.cierreValue,
                        { color: item.diferencia >= 0 ? '#10b981' : '#ef4444' },
                      ]}
                    >
                      {formatMoney(item.diferencia)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    color: '#6b7280',
    fontSize: 11,
  },
  sectorCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
  },
  sectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  sectorInfo: {
    flex: 1,
    marginRight: 12,
  },
  sectorName: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectorValue: {
    alignItems: 'flex-end',
  },
  sectorAmount: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectorPercent: {
    color: '#9ca3af',
    fontSize: 11,
  },
  discountCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  discountRowTotal: {
    borderBottomWidth: 0,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    marginTop: 4,
  },
  discountLabel: {
    color: '#d1d5db',
    fontSize: 13,
  },
  discountValue: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  cierreItem: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cierreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cierreDate: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cierreTime: {
    color: '#9ca3af',
    fontSize: 11,
  },
  cierreBody: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  cierreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cierreRowTotal: {
    paddingVertical: 6,
    marginTop: 4,
  },
  cierreLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  cierreValue: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 12,
  },
});
