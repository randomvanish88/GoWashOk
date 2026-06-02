import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Screens
import VentasScreen from './src/screens/VentasScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import { IngresoVehiculoScreen } from './src/screens/IngresoVehiculoScreen';
import { GeneracionQRScreen } from './src/screens/GeneracionQRScreen';
import { RetiroVehiculoScreen } from './src/screens/RetiroVehiculoScreen';

// Navegación simple sin React Navigation (compatible con web)
type Screen =
  | 'ventas'
  | 'vehiculos'
  | 'reportes'
  | 'config'
  | 'ingresoVehiculo'
  | 'generacionQR'
  | 'retiroVehiculo';

export default function App() {
  const [screen, setScreen] = useState<Screen>('vehiculos');
  const [routeParams, setRouteParams] = useState<any>({});

  // Objeto de navegación compatible con las pantallas
  const navigation = {
    navigate: (name: string, params?: any) => {
      setRouteParams(params || {});
      setScreen(name as Screen);
    },
    goBack: () => setScreen('vehiculos'),
    popToTop: () => setScreen('vehiculos'),
  };

  const route = { params: routeParams };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── CONTENIDO ── */}
      <View style={s.content}>
        {screen === 'ventas'          && <VentasScreen navigation={navigation} />}
        {screen === 'vehiculos'       && <IngresoVehiculoScreen navigation={navigation} />}
        {screen === 'ingresoVehiculo' && <IngresoVehiculoScreen navigation={navigation} />}
        {screen === 'generacionQR'    && <GeneracionQRScreen navigation={navigation} route={route} />}
        {screen === 'retiroVehiculo'  && <RetiroVehiculoScreen navigation={navigation} route={route} />}
        {screen === 'reportes'        && <ReportesScreen navigation={navigation} />}
        {screen === 'config'          && <ConfigScreen navigation={navigation} />}
        {screen === 'GeneracionQR'    && <GeneracionQRScreen navigation={navigation} route={route} />}
        {screen === 'RetiroVehiculo'  && <RetiroVehiculoScreen navigation={navigation} route={route} />}
      </View>

      {/* ── BOTTOM TABS ── */}
      <View style={s.tabBar}>
        <Tab icon="🏠" label="Inicio"     active={screen === 'ventas'}    onPress={() => setScreen('ventas')} />
        <Tab icon="🚗" label="Vehículos"  active={screen === 'vehiculos' || screen === 'ingresoVehiculo' || screen === 'generacionQR' || screen === 'retiroVehiculo' || screen === 'GeneracionQR' || screen === 'RetiroVehiculo'}
             onPress={() => { setScreen('vehiculos'); setRouteParams({}); }} />
        <Tab icon="➕" label=""           active={false}                  onPress={() => setScreen('ingresoVehiculo')} center />
        <Tab icon="👤" label="Clientes"   active={false}                  onPress={() => {}} />
        <Tab icon="📊" label="Reportes"   active={screen === 'reportes'}  onPress={() => setScreen('reportes')} />
      </View>
    </View>
  );
}

function Tab({
  icon, label, active, onPress, center,
}: {
  icon: string; label: string; active: boolean; onPress: () => void; center?: boolean;
}) {
  if (center) {
    return (
      <TouchableOpacity style={s.tabCenter} onPress={onPress}>
        <View style={s.tabCenterCircle}>
          <Text style={s.tabCenterIcon}>{icon}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={s.tab} onPress={onPress}>
      <Text style={s.tabIcon}>{icon}</Text>
      <Text style={[s.tabLabel, active && s.tabLabelActive]}>{label}</Text>
      {active && <View style={s.tabIndicator} />}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 4,
    paddingTop: 6,
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1, alignItems: 'center', paddingTop: 4,
  },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  tabLabelActive: { color: '#1E40AF', fontWeight: '600' },
  tabIndicator: {
    position: 'absolute', bottom: -6, width: 4, height: 4,
    borderRadius: 2, backgroundColor: '#1E40AF',
  },
  tabCenter: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  tabCenterCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1E40AF', justifyContent: 'center', alignItems: 'center',
    marginBottom: -12,
    shadowColor: '#1E40AF', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  tabCenterIcon: { fontSize: 24, color: '#fff' },
});
