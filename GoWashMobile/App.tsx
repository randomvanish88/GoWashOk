import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import VentasScreen from './src/screens/VentasScreen';
import CierreScreen from './src/screens/CierreScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import SplashScreen from './src/screens/SplashScreen';
import { IngresoVehiculoScreen } from './src/screens/IngresoVehiculoScreen';
import { GeneracionQRScreen } from './src/screens/GeneracionQRScreen';
import { RetiroVehiculoScreen } from './src/screens/RetiroVehiculoScreen';

// Context
import { SyncProvider } from './src/context/SyncContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function VentasNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="VentasMain" 
        component={VentasScreen}
        options={{ title: 'Registrar Venta' }}
      />
    </Stack.Navigator>
  );
}

function VehicleFlowNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="IngresoVehiculo" 
        component={IngresoVehiculoScreen}
        options={{ title: 'Ingreso de Vehículo' }}
      />
      <Stack.Screen 
        name="GeneracionQR" 
        component={GeneracionQRScreen}
        options={{ title: 'Generación de QR' }}
      />
      <Stack.Screen 
        name="RetiroVehiculo" 
        component={RetiroVehiculoScreen}
        options={{ title: 'Retiro de Vehículo' }}
      />
    </Stack.Navigator>
  );
}

function CierreNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="CierreMain" 
        component={CierreScreen}
        options={{ title: 'Cierre de Caja' }}
      />
    </Stack.Navigator>
  );
}

function ReportesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ReportesMain" 
        component={ReportesScreen}
        options={{ title: 'Reportes' }}
      />
    </Stack.Navigator>
  );
}

function ConfigNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ConfigMain" 
        component={ConfigScreen}
        options={{ title: 'Configuración' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Ventas') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Vehiculos') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Cierre') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Reportes') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Config') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
        },
      })}
    >
      <Tab.Screen 
        name="Ventas" 
        component={VentasNavigator}
        options={{ title: 'Ventas' }}
      />
      <Tab.Screen 
        name="Vehiculos" 
        component={VehicleFlowNavigator}
        options={{ title: 'Vehículos' }}
      />
      <Tab.Screen 
        name="Cierre" 
        component={CierreNavigator}
        options={{ title: 'Cierre' }}
      />
      <Tab.Screen 
        name="Reportes" 
        component={ReportesNavigator}
        options={{ title: 'Reportes' }}
      />
      <Tab.Screen 
        name="Config" 
        component={ConfigNavigator}
        options={{ title: 'Config' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (e) {
      console.error('Failed to restore token', e);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SyncProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animationEnabled: false,
              }}
            />
          ) : (
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{
                animationEnabled: false,
              }}
            />
          )}
        </Stack.Navigator>
      </SyncProvider>
    </NavigationContainer>
  );
}
