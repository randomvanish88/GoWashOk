import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, FlatList, Modal, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── TIPOS ───────────────────────────────────────────────────────────────────
interface ProductoVenta { nombre: string; precio: number; }
interface ServicioLavado { nombre: string; precio: number; }
interface ProductoBar { group: string; name: string; value: number; }
interface Cosmetico { nombre: string; pvp: number; }
interface DescSector { activo: boolean; tipo: 'porcentaje' | 'monto'; valor: number; }
interface Venta {
  id: string; fecha: string; hora: string;
  horaEntrada: string; horaSalida: string;
  empleado: string; patente: string; cliente: string; numeroCliente: string;
  lavado: number; bar: number; cosmeticos: number; total: number;
  metodoPago: string; descuento: number;
  productosBar: ProductoVenta[]; productosCosmeticos: ProductoVenta[];
  servicio: string; extrasLavado: ProductoVenta[];
  descSectorsDetails: { lavadero: DescSector; bar: DescSector; cosmetica: DescSector; };
  estado: 'abierta' | 'cobrada' | 'retirada';
}

// ─── DATOS POR DEFECTO ───────────────────────────────────────────────────────
const DEFAULT_SERVICIOS: ServicioLavado[] = [
  { nombre: 'Básico', precio: 500 },
  { nombre: 'Premium', precio: 800 },
  { nombre: 'Premium+Encerado', precio: 1200 },
  { nombre: 'Completo', precio: 1500 },
  { nombre: 'Detailing', precio: 2000 },
];
const DEFAULT_EXTRAS: ServicioLavado[] = [
  { nombre: 'Embarrado', precio: 300 },
  { nombre: 'Desodorización', precio: 200 },
  { nombre: 'Limpieza Interior', precio: 500 },
];
const DEFAULT_BAR: ProductoBar[] = [
  { group: 'Cafetería', name: 'Café Negro', value: 3000 },
  { group: 'Cafetería', name: 'Café con Leche', value: 4000 },
  { group: 'Cafetería', name: 'Té', value: 3000 },
  { group: 'Bebidas', name: 'CocaCola 500cc', value: 2300 },
  { group: 'Bebidas', name: 'Agua Mineral', value: 2000 },
  { group: 'Comidas', name: 'Medialuna', value: 1200 },
  { group: 'Comidas', name: 'Tostado JyQ', value: 6500 },
  { group: 'Promos', name: 'Café + 2 Medialunas', value: 7600 },
];
const DEFAULT_COSMETICA: Cosmetico[] = [
  { nombre: 'Aromatizante Walker', pvp: 2164 },
  { nombre: 'Silicona Perfumada 120cc', pvp: 6537 },
  { nombre: 'Cera 250cc', pvp: 5410 },
  { nombre: 'Revividor de Negro 250cc', pvp: 5840 },
  { nombre: 'Desengrasante Spray 500cc', pvp: 9738 },
  { nombre: 'Shampoo Siliconado 250cc', pvp: 5193 },
];
const DEFAULT_METODOS_PAGO = ['Efectivo', 'Transferencia', 'Mercado Pago', 'Tarjeta', 'Pago Mixto', 'Promo'];
const DESC_SECTOR_VACIO: DescSector = { activo: false, tipo: 'porcentaje', valor: 0 };

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function VentasScreen() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];

  // DATOS DE VENTA
  const [fecha, setFecha] = useState(dateStr);
  const [horaEntrada, setHoraEntrada] = useState(timeStr);
  const [horaSalida, setHoraSalida] = useState(timeStr);
  const [patente, setPatente] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState('');
  const [washCounts, setWashCounts] = useState<Record<string, number>>({});

  // LAVADERO
  const [servicio, setServicio] = useState('');
  const [precioServicio, setPrecioServicio] = useState(0);
  const [serviciosLavado, setServiciosLavado] = useState<ServicioLavado[]>(DEFAULT_SERVICIOS);
  const [extrasOpciones, setExtrasOpciones] = useState<ServicioLavado[]>(DEFAULT_EXTRAS);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([]);

  // BAR Y COSMÉTICA
  const [productosBar, setProductosBar] = useState<ProductoVenta[]>([]);
  const [productosCosmetica, setProductosCosmetica] = useState<ProductoVenta[]>([]);
  const [barData, setBarData] = useState<ProductoBar[]>(DEFAULT_BAR);
  const [cosmeticaData, setCosmeticaData] = useState<Cosmetico[]>(DEFAULT_COSMETICA);
  const [searchBar, setSearchBar] = useState('');
  const [searchCosmetica, setSearchCosmetica] = useState('');

  // DESCUENTOS POR SECTOR (igual que POS v15)
  const [descSectors, setDescSectors] = useState({
    lavadero: { ...DESC_SECTOR_VACIO },
    bar: { ...DESC_SECTOR_VACIO },
    cosmetica: { ...DESC_SECTOR_VACIO },
  });

  // PAGO
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [metodosPago, setMetodosPago] = useState<string[]>(DEFAULT_METODOS_PAGO);

  // ÓRDENES
  const [ordenesAbiertas, setOrdenesAbiertas] = useState<Venta[]>([]);
  const [ordenesCobradas, setOrdenesCobradas] = useState<string[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // MODALES
  const [modalEmpleados, setModalEmpleados] = useState(false);
  const [modalServicios, setModalServicios] = useState(false);
  const [modalExtras, setModalExtras] = useState(false);
  const [modalBar, setModalBar] = useState(false);
  const [modalCosmetica, setModalCosmetica] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [barAbierto, setBarAbierto] = useState(false);
  const [cosmeticaAbierta, setCosmeticaAbierta] = useState(false);

  // PAGO MIXTO
  const [pagosMixtos, setPagosMixtos] = useState<{metodo: string; monto: string}[]>([
    { metodo: 'Efectivo', monto: '' },
    { metodo: 'Transferencia', monto: '' },
  ]);

  // ─── CARGA INICIAL ─────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const emp = await AsyncStorage.getItem('gowash-lista-empleados');
        const ord = await AsyncStorage.getItem('gowash-ordenes-abiertas');
        const cob = await AsyncStorage.getItem('gowash-ordenes-cobradas');
        const wc  = await AsyncStorage.getItem('gowash-washCounts');
        const bar = await AsyncStorage.getItem('gowash-bar-precios');
        const cos = await AsyncStorage.getItem('gowash-cosmeticos-precios');
        const lav = await AsyncStorage.getItem('gowash-lavado-precios');
        const ext = await AsyncStorage.getItem('gowash-extras-lavado');
        if (emp) setListaEmpleados(JSON.parse(emp));
        if (ord) setOrdenesAbiertas(JSON.parse(ord));
        if (cob) setOrdenesCobradas(JSON.parse(cob));
        if (wc)  setWashCounts(JSON.parse(wc));
        if (bar) setBarData(JSON.parse(bar));
        if (cos) setCosmeticaData(JSON.parse(cos));
        if (lav) setServiciosLavado(JSON.parse(lav));
        if (ext) setExtrasOpciones(JSON.parse(ext));
      } catch (e) { console.error(e); }
    };
    cargar();
  }, []);

  const guardar = async (key: string, val: any) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error(e); }
  };

  // ─── CÁLCULOS (igual que POS v15) ──────────────────────────────────────────
  const calcDesc = (sector: 'lavadero' | 'bar' | 'cosmetica', base: number) => {
    const s = descSectors[sector];
    if (!s.activo || s.valor <= 0) return 0;
    return s.tipo === 'porcentaje' ? (base * Math.min(s.valor, 100)) / 100 : Math.min(s.valor, base);
  };

  const baseLavado = precioServicio + extrasOpciones
    .filter(e => extrasSeleccionados.includes(e.nombre))
    .reduce((s, e) => s + e.precio, 0);
  const baseBar = productosBar.reduce((s, p) => s + p.precio, 0);
  const baseCosmetica = productosCosmetica.reduce((s, p) => s + p.precio, 0);

  const descLavado = calcDesc('lavadero', baseLavado);
  const descBar    = calcDesc('bar', baseBar);
  const descCos    = calcDesc('cosmetica', baseCosmetica);

  const totalLavado    = baseLavado - descLavado;
  const totalBar       = baseBar - descBar;
  const totalCosmetica = baseCosmetica - descCos;
  const totalGeneral   = totalLavado + totalBar + totalCosmetica;

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

  // ─── FUNCIONES DE NEGOCIO ──────────────────────────────────────────────────
  const updateDesc = (sector: 'lavadero' | 'bar' | 'cosmetica', patch: Partial<DescSector>) => {
    setDescSectors(prev => ({ ...prev, [sector]: { ...prev[sector], ...patch } }));
  };

  const toggleExtra = (nombre: string) => {
    setExtrasSeleccionados(prev =>
      prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
    );
  };

  const agregarProductoBar = (p: ProductoBar) => {
    setProductosBar(prev => {
      const existe = prev.find(x => x.nombre === p.name);
      if (existe) return prev; // ya está
      return [...prev, { nombre: p.name, precio: p.value }];
    });
  };

  const agregarProductoCosmetica = (p: Cosmetico) => {
    setProductosCosmetica(prev => {
      const existe = prev.find(x => x.nombre === p.nombre);
      if (existe) return prev;
      return [...prev, { nombre: p.nombre, precio: p.pvp }];
    });
  };

  const limpiarFormulario = () => {
    const t = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    setFecha(new Date().toISOString().split('T')[0]);
    setHoraEntrada(t); setHoraSalida(t);
    setPatente(''); setCliente(''); setNumeroCliente(''); setEmpleado('');
    setServicio(''); setPrecioServicio(0);
    setExtrasSeleccionados([]);
    setProductosBar([]); setProductosCosmetica([]);
    setDescSectors({ lavadero: { ...DESC_SECTOR_VACIO }, bar: { ...DESC_SECTOR_VACIO }, cosmetica: { ...DESC_SECTOR_VACIO } });
    setMetodoPago('Efectivo');
    setActiveOrderId(null);
  };

  const guardarOrdenEnProgreso = () => {
    if (!patente.trim() && !cliente.trim()) {
      Alert.alert('Faltan datos', 'Ingresá Patente o Cliente para guardar la orden.');
      return;
    }
    const orden: Venta = {
      id: activeOrderId || Date.now().toString(),
      fecha, hora: horaEntrada, horaEntrada, horaSalida,
      empleado, patente, cliente, numeroCliente,
      lavado: totalLavado, bar: totalBar, cosmeticos: totalCosmetica, total: totalGeneral,
      metodoPago, descuento: descLavado + descBar + descCos,
      productosBar: [...productosBar], productosCosmeticos: [...productosCosmetica],
      servicio,
      extrasLavado: extrasOpciones.filter(e => extrasSeleccionados.includes(e.nombre)),
      descSectorsDetails: {
        lavadero: { ...descSectors.lavadero },
        bar: { ...descSectors.bar },
        cosmetica: { ...descSectors.cosmetica },
      },
      estado: 'abierta',
    };
    const nuevas = activeOrderId
      ? ordenesAbiertas.map(o => o.id === activeOrderId ? orden : o)
      : [...ordenesAbiertas, orden];
    setOrdenesAbiertas(nuevas);
    guardar('gowash-ordenes-abiertas', nuevas);
    limpiarFormulario();
    Alert.alert('✅ En Progreso', `Orden guardada: ${fmt(orden.total)}`);
  };

  const cargarOrden = (orden: Venta) => {
    setActiveOrderId(orden.id);
    setFecha(orden.fecha); setHoraEntrada(orden.horaEntrada); setHoraSalida(orden.horaSalida);
    setPatente(orden.patente); setCliente(orden.cliente); setNumeroCliente(orden.numeroCliente);
    setEmpleado(orden.empleado); setServicio(orden.servicio); setPrecioServicio(orden.lavado);
    setProductosBar(orden.productosBar); setProductosCosmetica(orden.productosCosmeticos);
    setMetodoPago(orden.metodoPago);
    if (orden.descSectorsDetails) setDescSectors({ ...orden.descSectorsDetails });
  };

  const cobrarOrden = (orden: Venta) => {
    Alert.alert('Cobrar', `¿Cobrar ${fmt(orden.total)} a ${orden.patente || orden.cliente}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cobrar', onPress: async () => {
          const nuevasCobradas = [...ordenesCobradas, orden.id];
          setOrdenesCobradas(nuevasCobradas);
          guardar('gowash-ordenes-cobradas', nuevasCobradas);
          // Guardar en ventas cerradas
          const raw = await AsyncStorage.getItem('gowash-ventas');
          const ventas = raw ? JSON.parse(raw) : [];
          ventas.push({ ...orden, estado: 'cobrada' });
          guardar('gowash-ventas', ventas);
          // Fidelización
          if (orden.numeroCliente) {
            const newWC = { ...washCounts, [orden.numeroCliente]: (washCounts[orden.numeroCliente] || 0) + 1 };
            setWashCounts(newWC);
            guardar('gowash-washCounts', newWC);
          }
          if (activeOrderId === orden.id) limpiarFormulario();
          Alert.alert('✅ Cobrado', `Venta registrada: ${fmt(orden.total)}`);
        }
      }
    ]);
  };

  const marcarRetirado = (orden: Venta) => {
    Alert.alert('Retirado', `¿Marcar ${orden.patente || orden.cliente} como retirado?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Retirado', onPress: () => {
          const nuevasAbiertas = ordenesAbiertas.filter(o => o.id !== orden.id);
          const nuevasCobradas = ordenesCobradas.filter(id => id !== orden.id);
          setOrdenesAbiertas(nuevasAbiertas);
          setOrdenesCobradas(nuevasCobradas);
          guardar('gowash-ordenes-abiertas', nuevasAbiertas);
          guardar('gowash-ordenes-cobradas', nuevasCobradas);
          if (activeOrderId === orden.id) setActiveOrderId(null);
          Alert.alert('✅ Retirado', `${orden.patente || orden.cliente} retirado del lavadero.`);
        }
      }
    ]);
  };

  const agregarEmpleado = () => {
    if (!nuevoEmpleado.trim()) return;
    const nuevos = [...listaEmpleados, nuevoEmpleado.trim()];
    setListaEmpleados(nuevos);
    guardar('gowash-lista-empleados', nuevos);
    setNuevoEmpleado('');
  };

  const lavadosCliente = numeroCliente ? (washCounts[numeroCliente] || 0) % 6 : 0;
  const proximoGratis = lavadosCliente === 5;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* HEADER */}
      <View style={s.header}>
        <Ionicons name="car-sport" size={26} color="#10b981" />
        <View style={{ marginLeft: 10 }}>
          <Text style={s.headerTitle}>GoWash App</Text>
          <Text style={s.headerSub}>v15.0.0 · Punto de Venta</Text>
        </View>
        {activeOrderId && (
          <View style={s.editingBadge}>
            <Text style={s.editingBadgeText}>Editando orden</Text>
          </View>
        )}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── DATOS DE VENTA ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📋 Datos de Venta</Text>
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.label}>Fecha</Text>
              <TextInput style={s.input} value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" placeholderTextColor="#64748b" />
            </View>
            <View style={s.col}>
              <Text style={s.label}>Hora Entrada</Text>
              <TextInput style={[s.input, !activeOrderId && s.inputReadonly]} value={horaEntrada}
                onChangeText={v => { if (activeOrderId) setHoraEntrada(v); }}
                placeholder="HH:MM" placeholderTextColor="#64748b" />
            </View>
            <View style={s.col}>
              <Text style={s.label}>Hora Salida</Text>
              <TextInput style={s.input} value={horaSalida} onChangeText={setHoraSalida} placeholder="HH:MM" placeholderTextColor="#64748b" />
            </View>
          </View>
          <Text style={s.label}>Patente</Text>
          <TextInput style={[s.input, s.patenteInput]} value={patente}
            onChangeText={v => setPatente(v.toUpperCase())} placeholder="ABC-123" placeholderTextColor="#64748b" autoCapitalize="characters" />
          <Text style={s.label}>Empleado</Text>
          <TouchableOpacity style={s.selector} onPress={() => setModalEmpleados(true)}>
            <Text style={empleado ? s.selectorText : s.selectorPlaceholder}>{empleado || 'Seleccionar empleado...'}</Text>
            <Ionicons name="chevron-down" size={16} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={s.label}>Cliente</Text>
          <TextInput style={s.input} value={cliente} onChangeText={setCliente} placeholder="Nombre del cliente (opcional)" placeholderTextColor="#64748b" />
          <Text style={s.label}>Número de Cliente</Text>
          <TextInput style={s.input} value={numeroCliente} onChangeText={setNumeroCliente} placeholder="ID o Teléfono" placeholderTextColor="#64748b" keyboardType="phone-pad" />
          {numeroCliente !== '' && (
            <View style={s.fidelidadRow}>
              <View style={s.fidelidadBar}>
                <View style={[s.fidelidadFill, { width: `${(lavadosCliente / 5) * 100}%` as any }, proximoGratis && s.fidelidadFillGratis]} />
              </View>
              <Text style={[s.fidelidadText, proximoGratis && s.fidelidadTextGratis]}>
                {proximoGratis ? '¡Próximo Lavado Gratis!' : `Lavados: ${lavadosCliente} / 5`}
              </Text>
            </View>
          )}
        </View>

        {/* ── LAVADERO ── */}
        <View style={[s.card, s.cardLavadero]}>
          <Text style={s.cardTitle}>🚗 Lavadero</Text>

          {/* Vehículo / Modelo */}
          <Text style={s.label}>Vehículo / Modelo</Text>
          <TextInput
            style={s.input}
            value={searchVehiculo}
            onChangeText={setSearchVehiculo}
            placeholder="Buscar por marca o modelo..."
            placeholderTextColor="#64748b"
          />
          {searchVehiculo.length > 0 && serviciosLavado.filter(sv =>
            sv.nombre.toLowerCase().includes(searchVehiculo.toLowerCase())
          ).length > 0 && (
            <View style={s.vehiculoDropdown}>
              {serviciosLavado.filter(sv =>
                sv.nombre.toLowerCase().includes(searchVehiculo.toLowerCase())
              ).map(sv => (
                <TouchableOpacity key={sv.nombre} style={s.vehiculoItem}
                  onPress={() => {
                    setServicio(sv.nombre);
                    setPrecioServicio(sv.precio);
                    setSearchVehiculo('');
                  }}>
                  <Ionicons name="car-outline" size={16} color="#6366f1" />
                  <Text style={s.vehiculoItemText}>{sv.nombre}</Text>
                  <Text style={s.vehiculoItemPrice}>{fmt(sv.precio)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {servicio !== '' && (
            <View style={s.vehiculoSeleccionado}>
              <Ionicons name="car" size={18} color="#818cf8" />
              <Text style={s.vehiculoSeleccionadoText}>{servicio}</Text>
              <TouchableOpacity onPress={() => { setServicio(''); setPrecioServicio(0); }}>
                <Text style={s.vehiculoQuitarText}>Quitar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tipo de Lavado / Servicio */}
          <Text style={s.label}>Tipo de Lavado / Servicio</Text>
          <TouchableOpacity style={s.selector} onPress={() => setModalServicios(true)}>
            <Text style={servicio ? s.selectorText : s.selectorPlaceholder}>{servicio || 'Seleccionar servicio...'}</Text>
            <Ionicons name="chevron-down" size={16} color="#6366f1" />
          </TouchableOpacity>
          {servicio !== '' && (
            <View style={s.precioBox}>
              <Text style={s.precioLabel}>Precio Servicio</Text>
              <Text style={s.precioValue}>{fmt(precioServicio)}</Text>
            </View>
          )}

          {/* Extras */}
          <Text style={s.label}>Extras / Adicionales</Text>
          <TouchableOpacity style={s.selector} onPress={() => setModalExtras(true)}>
            <Text style={s.selectorText}>
              {extrasSeleccionados.length > 0 ? `${extrasSeleccionados.length} extra(s) seleccionado(s)` : 'Agregar extras...'}
            </Text>
            <Ionicons name="add-circle-outline" size={16} color="#6366f1" />
          </TouchableOpacity>
          {extrasSeleccionados.length > 0 && (
            <View style={s.tagRow}>
              {extrasSeleccionados.map(e => {
                const ex = extrasOpciones.find(x => x.nombre === e);
                return (
                  <TouchableOpacity key={e} style={s.tag} onPress={() => toggleExtra(e)}>
                    <Text style={s.tagText}>{e} {ex ? fmt(ex.precio) : ''} ✕</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={s.subtotalRow}>
            <Text style={s.subtotalLabel}>Subtotal Lavadero</Text>
            <Text style={s.subtotalValue}>{fmt(totalLavado)}</Text>
          </View>
        </View>

        {/* ── BAR ── */}
        <View style={[s.card, s.cardBar]}>
          <TouchableOpacity style={s.colapsableHeader} onPress={() => setBarAbierto(!barAbierto)}>
            <View style={s.colapsableHeaderLeft}>
              <Text style={s.cardTitle}>☕ Bar / Cafetería</Text>
              {productosBar.length > 0 && (
                <View style={s.badgeCount}><Text style={s.badgeCountText}>{productosBar.length}</Text></View>
              )}
            </View>
            <Ionicons name={barAbierto ? 'chevron-up' : 'chevron-down'} size={20} color="#f59e0b" />
          </TouchableOpacity>

          {barAbierto && (
            <>
              <TextInput style={s.input} value={searchBar} onChangeText={setSearchBar} placeholder="Buscar producto..." placeholderTextColor="#64748b" />
              {barData.filter(p => p.name.toLowerCase().includes(searchBar.toLowerCase())).map(item => (
                <TouchableOpacity key={item.name} style={s.productRow} onPress={() => agregarProductoBar(item)}>
                  <View>
                    <Text style={s.productName}>{item.name}</Text>
                    <Text style={s.productGroup}>{item.group}</Text>
                  </View>
                  <Text style={s.productPrice}>{fmt(item.value)}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {productosBar.length > 0 && (
            <View style={s.carritoBox}>
              <Text style={s.carritoTitle}>Seleccionados:</Text>
              {productosBar.map((p, i) => (
                <View key={i} style={s.carritoItem}>
                  <Text style={s.carritoItemText}>{p.nombre}</Text>
                  <View style={s.carritoItemRight}>
                    <Text style={s.carritoItemPrice}>{fmt(p.precio)}</Text>
                    <TouchableOpacity onPress={() => setProductosBar(prev => prev.filter((_, j) => j !== i))}>
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={s.subtotalRow}>
                <Text style={s.subtotalLabel}>Subtotal Bar</Text>
                <Text style={s.subtotalValue}>{fmt(totalBar)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── COSMÉTICA ── */}
        <View style={[s.card, s.cardCosmetica]}>
          <TouchableOpacity style={s.colapsableHeader} onPress={() => setCosmeticaAbierta(!cosmeticaAbierta)}>
            <View style={s.colapsableHeaderLeft}>
              <Text style={s.cardTitle}>💄 Cosmética / Accesorios</Text>
              {productosCosmetica.length > 0 && (
                <View style={[s.badgeCount, { backgroundColor: '#14b8a6' }]}>
                  <Text style={s.badgeCountText}>{productosCosmetica.length}</Text>
                </View>
              )}
            </View>
            <Ionicons name={cosmeticaAbierta ? 'chevron-up' : 'chevron-down'} size={20} color="#14b8a6" />
          </TouchableOpacity>

          {cosmeticaAbierta && (
            <>
              <TextInput style={s.input} value={searchCosmetica} onChangeText={setSearchCosmetica} placeholder="Buscar producto..." placeholderTextColor="#64748b" />
              {cosmeticaData.filter(p => p.nombre.toLowerCase().includes(searchCosmetica.toLowerCase())).map(item => (
                <TouchableOpacity key={item.nombre} style={s.productRow} onPress={() => agregarProductoCosmetica(item)}>
                  <Text style={s.productName}>{item.nombre}</Text>
                  <Text style={s.productPrice}>{fmt(item.pvp)}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {productosCosmetica.length > 0 && (
            <View style={s.carritoBox}>
              <Text style={s.carritoTitle}>Seleccionados:</Text>
              {productosCosmetica.map((p, i) => (
                <View key={i} style={s.carritoItem}>
                  <Text style={s.carritoItemText}>{p.nombre}</Text>
                  <View style={s.carritoItemRight}>
                    <Text style={s.carritoItemPrice}>{fmt(p.precio)}</Text>
                    <TouchableOpacity onPress={() => setProductosCosmetica(prev => prev.filter((_, j) => j !== i))}>
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={s.subtotalRow}>
                <Text style={s.subtotalLabel}>Subtotal Cosmética</Text>
                <Text style={s.subtotalValue}>{fmt(totalCosmetica)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── MÉTODO DE PAGO + DESCUENTOS POR SECTOR ── */}
        <View style={s.rowCards}>
          {/* Método de Pago */}
          <View style={[s.card, s.cardHalf]}>
            <Text style={s.cardTitle}>💳 Método de Pago</Text>
            <TouchableOpacity style={s.selector} onPress={() => setModalPago(true)}>
              <Text style={s.selectorText}>{metodoPago}</Text>
              <Ionicons name="chevron-down" size={16} color="#10b981" />
            </TouchableOpacity>

            {/* PAGO MIXTO */}
            {metodoPago === 'Pago Mixto' && (
              <View style={s.pagoMixtoBox}>
                <Text style={s.pagoMixtoTitle}>Combinar métodos</Text>
                {pagosMixtos.map((pm, i) => (
                  <View key={i} style={s.pagoMixtoRow}>
                    <TouchableOpacity
                      style={s.pagoMixtoSelector}
                      onPress={() => {
                        // Ciclar entre métodos disponibles
                        const opts = metodosPago.filter(m => m !== 'Pago Mixto');
                        const idx = opts.indexOf(pm.metodo);
                        const next = opts[(idx + 1) % opts.length];
                        const nuevos = [...pagosMixtos];
                        nuevos[i] = { ...nuevos[i], metodo: next };
                        setPagosMixtos(nuevos);
                      }}
                    >
                      <Text style={s.pagoMixtoMetodoText}>{pm.metodo}</Text>
                      <Ionicons name="swap-horizontal" size={12} color="#10b981" />
                    </TouchableOpacity>
                    <TextInput
                      style={s.pagoMixtoInput}
                      value={pm.monto}
                      onChangeText={v => {
                        const nuevos = [...pagosMixtos];
                        nuevos[i] = { ...nuevos[i], monto: v };
                        setPagosMixtos(nuevos);
                      }}
                      placeholder="$0"
                      placeholderTextColor="#475569"
                      keyboardType="decimal-pad"
                    />
                    {pagosMixtos.length > 2 && (
                      <TouchableOpacity onPress={() => setPagosMixtos(prev => prev.filter((_, j) => j !== i))}>
                        <Ionicons name="close-circle" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Agregar método */}
                <TouchableOpacity
                  style={s.pagoMixtoAgregar}
                  onPress={() => setPagosMixtos(prev => [...prev, { metodo: 'Tarjeta', monto: '' }])}
                >
                  <Ionicons name="add-circle-outline" size={14} color="#10b981" />
                  <Text style={s.pagoMixtoAgregarText}>Agregar método</Text>
                </TouchableOpacity>

                {/* Resumen */}
                {(() => {
                  const sumado = pagosMixtos.reduce((acc, pm) => acc + (parseFloat(pm.monto) || 0), 0);
                  const diferencia = totalGeneral - sumado;
                  return (
                    <View style={s.pagoMixtoResumen}>
                      <View style={s.pagoMixtoResumenRow}>
                        <Text style={s.pagoMixtoResumenLabel}>Total ingresado</Text>
                        <Text style={s.pagoMixtoResumenValue}>{fmt(sumado)}</Text>
                      </View>
                      <View style={s.pagoMixtoResumenRow}>
                        <Text style={s.pagoMixtoResumenLabel}>Resta</Text>
                        <Text style={[s.pagoMixtoResumenValue, { color: diferencia === 0 ? '#10b981' : diferencia > 0 ? '#f59e0b' : '#ef4444' }]}>
                          {diferencia === 0 ? '✓ Completo' : fmt(diferencia)}
                        </Text>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}
          </View>

          {/* Descuentos por Sector */}
          <View style={[s.card, s.cardHalf, s.cardDescuentos]}>
            <Text style={s.cardTitle}>🏷️ Descuentos</Text>

            {/* Lavadero */}
            <Text style={s.descSectorLabel}>Lavadero</Text>
            <View style={s.descSectorRow}>
              <Switch
                value={descSectors.lavadero.activo}
                onValueChange={v => updateDesc('lavadero', { activo: v })}
                trackColor={{ false: '#334155', true: '#6366f1' }}
                thumbColor="#fff" style={s.descSwitch}
              />
              {descSectors.lavadero.activo && (
                <>
                  <TouchableOpacity
                    style={[s.descTipoBtn, descSectors.lavadero.tipo === 'porcentaje' && s.descTipoBtnActivo]}
                    onPress={() => updateDesc('lavadero', { tipo: 'porcentaje', valor: 0 })}>
                    <Text style={[s.descTipoBtnText, descSectors.lavadero.tipo === 'porcentaje' && s.descTipoBtnTextActivo]}>%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.descTipoBtn, descSectors.lavadero.tipo === 'monto' && s.descTipoBtnActivo]}
                    onPress={() => updateDesc('lavadero', { tipo: 'monto', valor: 0 })}>
                    <Text style={[s.descTipoBtnText, descSectors.lavadero.tipo === 'monto' && s.descTipoBtnTextActivo]}>$</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={s.descInput}
                    value={descSectors.lavadero.valor > 0 ? String(descSectors.lavadero.valor) : ''}
                    onChangeText={t => { let v = parseFloat(t) || 0; if (descSectors.lavadero.tipo === 'porcentaje' && v > 100) v = 100; updateDesc('lavadero', { valor: v }); }}
                    placeholder="0" placeholderTextColor="#475569" keyboardType="decimal-pad"
                  />
                </>
              )}
            </View>
            {descSectors.lavadero.activo && descLavado > 0 && (
              <Text style={[s.descMonto, { color: '#818cf8' }]}>-{fmt(descLavado)}</Text>
            )}

            {/* Bar */}
            <Text style={s.descSectorLabel}>Bar</Text>
            <View style={s.descSectorRow}>
              <Switch
                value={descSectors.bar.activo}
                onValueChange={v => updateDesc('bar', { activo: v })}
                trackColor={{ false: '#334155', true: '#f59e0b' }}
                thumbColor="#fff" style={s.descSwitch}
              />
              {descSectors.bar.activo && (
                <>
                  <TouchableOpacity
                    style={[s.descTipoBtn, descSectors.bar.tipo === 'porcentaje' && { backgroundColor: '#f59e0b' }]}
                    onPress={() => updateDesc('bar', { tipo: 'porcentaje', valor: 0 })}>
                    <Text style={[s.descTipoBtnText, descSectors.bar.tipo === 'porcentaje' && s.descTipoBtnTextActivo]}>%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.descTipoBtn, descSectors.bar.tipo === 'monto' && { backgroundColor: '#f59e0b' }]}
                    onPress={() => updateDesc('bar', { tipo: 'monto', valor: 0 })}>
                    <Text style={[s.descTipoBtnText, descSectors.bar.tipo === 'monto' && s.descTipoBtnTextActivo]}>$</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={s.descInput}
                    value={descSectors.bar.valor > 0 ? String(descSectors.bar.valor) : ''}
                    onChangeText={t => { let v = parseFloat(t) || 0; if (descSectors.bar.tipo === 'porcentaje' && v > 100) v = 100; updateDesc('bar', { valor: v }); }}
                    placeholder="0" placeholderTextColor="#475569" keyboardType="decimal-pad"
                  />
                </>
              )}
            </View>
            {descSectors.bar.activo && descBar > 0 && (
              <Text style={[s.descMonto, { color: '#fbbf24' }]}>-{fmt(descBar)}</Text>
            )}

            {/* Cosmética */}
            <Text style={s.descSectorLabel}>Cosmética</Text>
            <View style={s.descSectorRow}>
              <Switch
                value={descSectors.cosmetica.activo}
                onValueChange={v => updateDesc('cosmetica', { activo: v })}
                trackColor={{ false: '#334155', true: '#14b8a6' }}
                thumbColor="#fff" style={s.descSwitch}
              />
              {descSectors.cosmetica.activo && (
                <>
                  <TouchableOpacity
                    style={[s.descTipoBtn, descSectors.cosmetica.tipo === 'porcentaje' && { backgroundColor: '#14b8a6' }]}
                    onPress={() => updateDesc('cosmetica', { tipo: 'porcentaje', valor: 0 })}>
                    <Text style={[s.descTipoBtnText, descSectors.cosmetica.tipo === 'porcentaje' && s.descTipoBtnTextActivo]}>%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.descTipoBtn, descSectors.cosmetica.tipo === 'monto' && { backgroundColor: '#14b8a6' }]}
                    onPress={() => updateDesc('cosmetica', { tipo: 'monto', valor: 0 })}>
                    <Text style={[s.descTipoBtnText, descSectors.cosmetica.tipo === 'monto' && s.descTipoBtnTextActivo]}>$</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={s.descInput}
                    value={descSectors.cosmetica.valor > 0 ? String(descSectors.cosmetica.valor) : ''}
                    onChangeText={t => { let v = parseFloat(t) || 0; if (descSectors.cosmetica.tipo === 'porcentaje' && v > 100) v = 100; updateDesc('cosmetica', { valor: v }); }}
                    placeholder="0" placeholderTextColor="#475569" keyboardType="decimal-pad"
                  />
                </>
              )}
            </View>
            {descSectors.cosmetica.activo && descCos > 0 && (
              <Text style={[s.descMonto, { color: '#2dd4bf' }]}>-{fmt(descCos)}</Text>
            )}

            {(descLavado + descBar + descCos) > 0 && (
              <View style={s.descTotalRow}>
                <Text style={s.descTotalLabel}>Total descuento</Text>
                <Text style={s.descTotalValue}>-{fmt(descLavado + descBar + descCos)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── TOTAL ── */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>TOTAL A COBRAR</Text>
          <Text style={s.totalValue}>{fmt(totalGeneral)}</Text>
          {(descLavado + descBar + descCos) > 0 && (
            <Text style={s.totalDesc}>Descuento aplicado: -{fmt(descLavado + descBar + descCos)}</Text>
          )}
        </View>

        {/* ── BOTÓN EN PROGRESO ── */}
        <TouchableOpacity style={s.btnProgreso} onPress={guardarOrdenEnProgreso}>
          <Ionicons name="hourglass-outline" size={20} color="#fff" />
          <Text style={s.btnProgresoText}>{activeOrderId ? 'ACTUALIZAR ORDEN' : 'EN PROGRESO'}</Text>
        </TouchableOpacity>

        {activeOrderId && (
          <TouchableOpacity style={s.btnCancelarEdicion} onPress={limpiarFormulario}>
            <Text style={s.btnCancelarEdicionText}>Cancelar edición</Text>
          </TouchableOpacity>
        )}

        {/* ── VEHÍCULOS EN LAVADERO ── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.pulseDot} />
            <Text style={s.cardTitle}>Vehículos en Lavadero ({ordenesAbiertas.length})</Text>
          </View>
          {ordenesAbiertas.length === 0 ? (
            <Text style={s.emptyText}>No hay vehículos en lavadero</Text>
          ) : (
            ordenesAbiertas.map(orden => {
              const cobrada = ordenesCobradas.includes(orden.id);
              const activa  = activeOrderId === orden.id;
              return (
                <View key={orden.id} style={[s.ordenCard, activa && s.ordenCardActiva]}>
                  <View style={s.ordenHeader}>
                    <View>
                      <Text style={s.ordenPatente}>{orden.patente || '—'}</Text>
                      {orden.cliente ? <Text style={s.ordenCliente}>👤 {orden.cliente}</Text> : null}
                      <Text style={s.ordenHora}>⏰ {orden.horaEntrada}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.ordenTotal}>{fmt(orden.total)}</Text>
                      <Text style={s.ordenServicio}>{orden.servicio}</Text>
                    </View>
                  </View>
                  <View style={s.ordenBtns}>
                    {!cobrada ? (
                      <>
                        <TouchableOpacity style={[s.btnOrden, activa ? s.btnOrdenEditando : s.btnOrdenRetomar]} onPress={() => cargarOrden(orden)}>
                          <Text style={s.btnOrdenText}>{activa ? 'Editando...' : 'Retomar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.btnOrden, s.btnOrdenCobrar]} onPress={() => cobrarOrden(orden)}>
                          <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
                          <Text style={s.btnOrdenText}> Cobrar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity style={[s.btnOrden, s.btnOrdenRetirado]} onPress={() => marcarRetirado(orden)}>
                        <Ionicons name="checkmark-done-outline" size={14} color="#fff" />
                        <Text style={s.btnOrdenText}> Marcar como Retirado</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODALES ── */}
      <ModalLista visible={modalEmpleados} titulo="Empleados" onClose={() => setModalEmpleados(false)}>
        {listaEmpleados.map(e => (
          <TouchableOpacity key={e} style={[s.modalItem, empleado === e && s.modalItemActivo]} onPress={() => { setEmpleado(e); setModalEmpleados(false); }}>
            <Text style={s.modalItemText}>{e}</Text>
            {empleado === e && <Ionicons name="checkmark" size={16} color="#10b981" />}
          </TouchableOpacity>
        ))}
        <View style={s.modalAddRow}>
          <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={nuevoEmpleado} onChangeText={setNuevoEmpleado} placeholder="Nuevo empleado..." placeholderTextColor="#64748b" />
          <TouchableOpacity style={s.modalAddBtn} onPress={agregarEmpleado}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ModalLista>

      <ModalLista visible={modalServicios} titulo="Servicios de Lavado" onClose={() => setModalServicios(false)}>
        {serviciosLavado.map(sv => (
          <TouchableOpacity key={sv.nombre} style={[s.modalItem, servicio === sv.nombre && s.modalItemActivo]}
            onPress={() => { setServicio(sv.nombre); setPrecioServicio(sv.precio); setModalServicios(false); }}>
            <Text style={s.modalItemText}>{sv.nombre}</Text>
            <Text style={s.modalItemPrice}>{fmt(sv.precio)}</Text>
          </TouchableOpacity>
        ))}
      </ModalLista>

      <ModalLista visible={modalExtras} titulo="Extras / Adicionales" onClose={() => setModalExtras(false)}>
        {extrasOpciones.map(ex => (
          <TouchableOpacity key={ex.nombre} style={[s.modalItem, extrasSeleccionados.includes(ex.nombre) && s.modalItemActivo]}
            onPress={() => toggleExtra(ex.nombre)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={extrasSeleccionados.includes(ex.nombre) ? 'checkbox' : 'square-outline'} size={18} color="#6366f1" />
              <Text style={s.modalItemText}>{ex.nombre}</Text>
            </View>
            <Text style={s.modalItemPrice}>{fmt(ex.precio)}</Text>
          </TouchableOpacity>
        ))}
      </ModalLista>

      <ModalLista visible={modalPago} titulo="Método de Pago" onClose={() => setModalPago(false)}>
        {metodosPago.map(m => (
          <TouchableOpacity key={m} style={[s.modalItem, metodoPago === m && s.modalItemActivo]}
            onPress={() => { setMetodoPago(m); setModalPago(false); }}>
            <Text style={s.modalItemText}>{m}</Text>
            {metodoPago === m && <Ionicons name="checkmark" size={16} color="#10b981" />}
          </TouchableOpacity>
        ))}
      </ModalLista>
    </View>
  );
}

// ─── COMPONENTE DESCUENTO POR SECTOR (igual que POS v15) ─────────────────────
function DescuentoSectorComp({ label, sector, base, descMonto, color, onChange }: {
  label: string; sector: DescSector; base: number; descMonto: number;
  color: string; onChange: (p: Partial<DescSector>) => void;
}) {
  return (
    <View style={[ds.wrap, sector.activo && { borderColor: color, backgroundColor: color + '11' }]}>
      <View style={ds.row}>
        <Switch value={sector.activo} onValueChange={v => onChange({ activo: v })}
          trackColor={{ false: '#334155', true: color }} thumbColor="#fff" />
        <Text style={[ds.label, sector.activo && { color }]}>{label}</Text>
      </View>
      {sector.activo && (
        <View style={ds.controls}>
          <View style={ds.tipoBtns}>
            <TouchableOpacity style={[ds.tipoBtn, sector.tipo === 'porcentaje' && { backgroundColor: color }]}
              onPress={() => onChange({ tipo: 'porcentaje', valor: 0 })}>
              <Text style={[ds.tipoBtnText, sector.tipo === 'porcentaje' && { color: '#fff' }]}>%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ds.tipoBtn, sector.tipo === 'monto' && { backgroundColor: color }]}
              onPress={() => onChange({ tipo: 'monto', valor: 0 })}>
              <Text style={[ds.tipoBtnText, sector.tipo === 'monto' && { color: '#fff' }]}>$</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[ds.input, { borderColor: color }]}
            value={sector.valor > 0 ? String(sector.valor) : ''}
            onChangeText={t => {
              let v = parseFloat(t) || 0;
              if (sector.tipo === 'porcentaje' && v > 100) v = 100;
              onChange({ valor: v });
            }}
            placeholder={sector.tipo === 'porcentaje' ? '0%' : '$0'}
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
          />
          {descMonto > 0 && (
            <Text style={[ds.descMonto, { color }]}>-${descMonto.toLocaleString('es-AR')}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const ds = StyleSheet.create({
  wrap: { borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 10, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  tipoBtns: { flexDirection: 'row', gap: 4 },
  tipoBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b' },
  tipoBtnText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  input: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, color: '#fff', fontSize: 13 },
  descMonto: { fontSize: 12, fontWeight: '700' },
});

// ─── COMPONENTE MODAL LISTA ───────────────────────────────────────────────────
function ModalLista({ visible, titulo, onClose, children }: {
  visible: boolean; titulo: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ml.overlay}>
        <View style={ml.sheet}>
          <View style={ml.header}>
            <Text style={ml.titulo}>{titulo}</Text>
            <TouchableOpacity onPress={onClose} style={ml.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <ScrollView style={ml.body} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const ml = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '75%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  titulo: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  closeBtn: { padding: 4 },
  body: { padding: 8 },
});

// ─── ESTILOS PRINCIPALES ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  editingBadge: { marginLeft: 'auto' as any, backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  editingBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  card: { margin: 12, marginBottom: 0, backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  cardLavadero: { borderColor: '#6366f1', borderWidth: 1.5 },
  cardBar: { borderColor: '#f59e0b', borderWidth: 1.5 },
  cardCosmetica: { borderColor: '#14b8a6', borderWidth: 1.5 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  row: { flexDirection: 'row', gap: 8 },
  col: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f1f5f9', fontSize: 14, marginBottom: 4 },
  inputReadonly: { backgroundColor: '#0f172a', color: '#64748b' },
  patenteInput: { fontSize: 18, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  selector: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  selectorText: { color: '#f1f5f9', fontSize: 14 },
  selectorPlaceholder: { color: '#64748b', fontSize: 14 },
  precioBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#6366f1', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  precioLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' },
  precioValue: { fontSize: 22, fontWeight: '800', color: '#818cf8', marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: '#312e81', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: '#a5b4fc', fontWeight: '600' },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  subtotalLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  subtotalValue: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  productName: { fontSize: 13, color: '#e2e8f0', fontWeight: '500' },
  productGroup: { fontSize: 11, color: '#64748b', marginTop: 1 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  carritoBox: { marginTop: 10, backgroundColor: '#0f172a', borderRadius: 8, padding: 10 },
  carritoTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
  carritoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  carritoItemText: { fontSize: 13, color: '#e2e8f0', flex: 1 },
  carritoItemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  carritoItemPrice: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  fidelidadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  fidelidadBar: { flex: 1, height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  fidelidadFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 3 },
  fidelidadFillGratis: { backgroundColor: '#10b981' },
  fidelidadText: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  fidelidadTextGratis: { color: '#10b981' },
  totalCard: { margin: 12, marginBottom: 0, backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#8b5cf6', alignItems: 'center' },
  totalLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 36, fontWeight: '900', color: '#a78bfa', marginTop: 4 },
  totalDesc: { fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: '600' },
  btnProgreso: { margin: 12, marginBottom: 0, backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnProgresoText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  btnCancelarEdicion: { marginHorizontal: 12, marginTop: 8, paddingVertical: 10, alignItems: 'center' },
  btnCancelarEdicionText: { fontSize: 13, color: '#64748b', textDecorationLine: 'underline' },
  emptyText: { textAlign: 'center', color: '#475569', fontSize: 13, paddingVertical: 16 },
  ordenCard: { backgroundColor: '#0f172a', borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  ordenCardActiva: { borderLeftColor: '#10b981', backgroundColor: '#0a1f14' },
  ordenHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ordenPatente: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  ordenCliente: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  ordenHora: { fontSize: 11, color: '#475569', marginTop: 2 },
  ordenTotal: { fontSize: 16, fontWeight: '800', color: '#10b981' },
  ordenServicio: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'right' },
  ordenBtns: { flexDirection: 'row', gap: 8 },
  btnOrden: { flex: 1, paddingVertical: 9, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnOrdenText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  btnOrdenRetomar: { backgroundColor: '#3b82f6' },
  btnOrdenEditando: { backgroundColor: '#1e3a5f', borderWidth: 1, borderColor: '#3b82f6' },
  btnOrdenCobrar: { backgroundColor: '#10b981' },
  btnOrdenRetirado: { backgroundColor: '#8b5cf6' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
  modalItemActivo: { backgroundColor: '#0f172a' },
  modalItemText: { fontSize: 14, color: '#e2e8f0', fontWeight: '500' },
  modalItemPrice: { fontSize: 13, fontWeight: '700', color: '#8b5cf6' },
  modalAddRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  modalAddBtn: { backgroundColor: '#10b981', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  // Colapsable
  colapsableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  colapsableHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeCount: { backgroundColor: '#f59e0b', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeCountText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  // Vehículo
  vehiculoDropdown: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#6366f1', borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
  vehiculoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  vehiculoItemText: { flex: 1, fontSize: 13, color: '#e2e8f0', fontWeight: '500' },
  vehiculoItemPrice: { fontSize: 13, fontWeight: '700', color: '#818cf8' },
  vehiculoSeleccionado: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1e1b4b', borderWidth: 1, borderColor: '#6366f1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  vehiculoSeleccionadoText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#a5b4fc' },
  vehiculoQuitarText: { fontSize: 11, color: '#6366f1', fontWeight: '700' },
  // Cards lado a lado
  rowCards: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 0, gap: 8, alignItems: 'flex-start' },
  cardHalf: { flex: 1, margin: 0 },
  cardDescuentos: { borderColor: '#8b5cf6', borderWidth: 1.5 },
  // Descuentos por sector
  descSectorLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 4 },
  descSectorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  descSwitch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  descTipoBtn: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a' },
  descTipoBtnActivo: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  descTipoBtnText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  descTipoBtnTextActivo: { color: '#fff' },
  descInput: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, color: '#f1f5f9', fontSize: 12 },
  descMonto: { fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  descTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#334155' },
  descTotalLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  descTotalValue: { fontSize: 13, fontWeight: '800', color: '#a78bfa' },
  // Pago Mixto
  pagoMixtoBox: { marginTop: 10, backgroundColor: '#0f172a', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#10b981' },
  pagoMixtoTitle: { fontSize: 11, fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  pagoMixtoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  pagoMixtoSelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1e293b', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: '#334155' },
  pagoMixtoMetodoText: { fontSize: 11, fontWeight: '700', color: '#e2e8f0' },
  pagoMixtoInput: { flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, color: '#f1f5f9', fontSize: 13 },
  pagoMixtoAgregar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, justifyContent: 'center' },
  pagoMixtoAgregarText: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  pagoMixtoResumen: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1e293b' },
  pagoMixtoResumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  pagoMixtoResumenLabel: { fontSize: 11, color: '#64748b' },
  pagoMixtoResumenValue: { fontSize: 12, fontWeight: '700', color: '#f1f5f9' },
});
