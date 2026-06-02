# Integración de VentasScreen

## Paso 1: Verificar Dependencias

Asegúrate de tener instaladas las siguientes dependencias en `package.json`:

```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-native": "^0.x.x",
    "@react-native-async-storage/async-storage": "^1.x.x",
    "@expo/vector-icons": "^13.x.x",
    "@react-navigation/native": "^6.x.x",
    "@react-navigation/native-stack": "^6.x.x"
  }
}
```

Si falta alguna, instálala:
```bash
npm install @react-native-async-storage/async-storage @expo/vector-icons
```

## Paso 2: Importar en App.tsx

Abre tu archivo `App.tsx` y agrega la importación:

```typescript
import VentasScreen from './src/screens/VentasScreen';
```

## Paso 3: Agregar a la Navegación

Si usas React Navigation con Stack Navigator:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0f172a' },
        }}
      >
        {/* Otras pantallas */}
        <Stack.Screen 
          name="Ventas" 
          component={VentasScreen}
          options={{
            title: 'Ventas',
          }}
        />
        {/* Más pantallas */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Paso 4: Agregar a Tab Navigator (Opcional)

Si usas Bottom Tab Navigator:

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Ventas') {
              iconName = focused ? 'cart' : 'cart-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#8b5cf6',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#1e293b',
            borderTopColor: '#334155',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Ventas" 
          component={VentasScreen}
          options={{
            title: 'Ventas',
          }}
        />
        {/* Más pantallas */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## Paso 5: Configurar Tipos de Navegación (TypeScript)

Crea un archivo `src/types/navigation.ts`:

```typescript
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Ventas: undefined;
  Reportes: undefined;
  Config: undefined;
  Cierre: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

## Paso 6: Usar en Componentes

Para navegar a VentasScreen desde otro componente:

```typescript
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Ventas')}
    >
      <Text>Ir a Ventas</Text>
    </TouchableOpacity>
  );
}
```

## Paso 7: Sincronización con Otras Pantallas

### Cargar empleados en VentasScreen desde ConfigScreen

En `ConfigScreen.tsx`, cuando agregues un empleado:

```typescript
const agregarEmpleado = async () => {
  // ... código existente ...
  await AsyncStorage.setItem('empleados', JSON.stringify(empleadosActualizados));
  // VentasScreen cargará automáticamente los empleados
};
```

### Mostrar ventas en ReportesScreen

En `ReportesScreen.tsx`:

```typescript
useEffect(() => {
  const cargarVentas = async () => {
    const ventasGuardadas = await AsyncStorage.getItem('ventas');
    if (ventasGuardadas) {
      setVentas(JSON.parse(ventasGuardadas));
    }
  };
  cargarVentas();
}, []);
```

### Usar total de ventas en CierreScreen

En `CierreScreen.tsx`:

```typescript
useEffect(() => {
  const calcularTotal = async () => {
    const ventasGuardadas = await AsyncStorage.getItem('ventas');
    if (ventasGuardadas) {
      const ventas = JSON.parse(ventasGuardadas);
      const total = ventas.reduce((sum, v) => sum + v.total, 0);
      setTotalVentas(total);
    }
  };
  calcularTotal();
}, []);
```

## Paso 8: Configurar Tema Global (Opcional)

Crea un archivo `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#8b5cf6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
  },
  
  text: {
    primary: '#e5e7eb',
    secondary: '#9ca3af',
    tertiary: '#d1d5db',
  },
};
```

Luego úsalo en VentasScreen:

```typescript
import { colors } from '../theme/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
  },
  // ... más estilos
});
```

## Paso 9: Agregar Persistencia Global

Crea un archivo `src/hooks/useAsyncStorage.ts`:

```typescript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const saveValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  return [value, saveValue, loading] as const;
}
```

Úsalo en VentasScreen:

```typescript
const [ventas, setVentas, loadingVentas] = useAsyncStorage<Venta[]>('ventas', []);
```

## Paso 10: Testing

Crea un archivo `src/screens/__tests__/VentasScreen.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import VentasScreen from '../VentasScreen';

describe('VentasScreen', () => {
  it('renders correctly', () => {
    render(<VentasScreen />);
    expect(screen.getByText('Ventas')).toBeTruthy();
  });

  it('calculates total correctly', () => {
    // Test del cálculo de total
  });

  it('validates required fields', () => {
    // Test de validaciones
  });
});
```

## Checklist de Integración

- [ ] Dependencias instaladas
- [ ] VentasScreen importado en App.tsx
- [ ] Agregado a la navegación
- [ ] Tipos de navegación configurados
- [ ] Sincronización con ConfigScreen
- [ ] Sincronización con ReportesScreen
- [ ] Sincronización con CierreScreen
- [ ] Tema global configurado (opcional)
- [ ] Hooks personalizados creados (opcional)
- [ ] Tests escritos (opcional)
- [ ] Probado en dispositivo/emulador

## Troubleshooting

### Error: "Cannot find module '@react-native-async-storage/async-storage'"
```bash
npm install @react-native-async-storage/async-storage
```

### Error: "Ionicons not found"
```bash
npm install @expo/vector-icons
```

### Error: "Navigation is undefined"
Asegúrate de que VentasScreen esté dentro de NavigationContainer

### Error: "AsyncStorage is not available"
En web, AsyncStorage puede no estar disponible. Usa un polyfill:
```bash
npm install @react-native-async-storage/async-storage-web
```

## Próximos Pasos

1. Integra VentasScreen en tu navegación
2. Sincroniza con las otras pantallas
3. Prueba el flujo completo
4. Ajusta estilos según tu marca
5. Agrega más productos según necesites
6. Implementa sincronización con backend
