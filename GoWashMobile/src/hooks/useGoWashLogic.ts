import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Venta,
  OrdenEnProgreso,
  ProductoVenta,
  PagoParcial,
  AuditLog,
  ServicioLavado,
  ProductoBar,
  Cosmetico,
} from '../types';

// Datos por defecto
const DEFAULT_SERVICIOS_LAVADO: ServicioLavado[] = [
  { nombre: 'Lavado Básico', precio: 15000 },
  { nombre: 'Lavado Premium', precio: 25000 },
  { nombre: 'Lavado Premium + Encerado', precio: 35000 },
  { nombre: 'Lavado Completo', precio: 45000 },
  { nombre: 'Detailing Completo', precio: 80000 },
];

const DEFAULT_PRODUCTOS_BAR: ProductoBar[] = [
  { group: 'Cafetería', name: 'Café', value: 2000 },
  { group: 'Cafetería', name: 'Té', value: 1500 },
  { group: 'Bebidas', name: 'Coca-Cola', value: 3000 },
  { group: 'Bebidas', name: 'Sprite', value: 3000 },
  { group: 'Comidas', name: 'Pancho', value: 5000 },
  { group: 'Comidas', name: 'Tostado', value: 4000 },
  { group: 'Cervezas', name: 'Heineken', value: 6000 },
  { group: 'Cervezas', name: 'BlueMoon', value: 7000 },
];

const DEFAULT_COSMETICOS: Cosmetico[] = [
  { nombre: 'Aromatizante', contenido: '100ml', pvp: 3000 },
  { nombre: 'Silicona Perfumada', contenido: '250ml', pvp: 5000 },
  { nombre: 'Cera Protectora', contenido: '500ml', pvp: 8000 },
  { nombre: 'Desengrasante', contenido: '1L', pvp: 4000 },
  { nombre: 'Limpiacristales', contenido: '500ml', pvp: 3500 },
];

const DEFAULT_EMPLEADOS = ['Recepción', 'Lavador 1', 'Lavador 2'];
const DEFAULT_METODOS_PAGO = ['Efectivo', 'Transferencia', 'Billetera Virtual'];

export function useGoWashLogic() {
  // Estados de Ventas
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ordenesAbiertas, setOrdenesAbiertas] = useState<OrdenEnProgreso[]>([]);
  const [ordenesCobradas, setOrdenesCobradas] = useState<string[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);

  // Estados de Formulario
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaEntrada, setHoraEntrada] = useState(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
  const [horaSalida, setHoraSalida] = useState(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
  const [empleado, setEmpleado] = useState('');
  const [patente, setPatente] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [lavado, setLavado] = useState(0);
  const [servicio, setServicio] = useState('');
  const [bar, setBar] = useState(0);
  const [cosmeticos, setCosmeticos] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [recargo, setRecargo] = useState(0);
  const [recargoPorcentaje, setRecargoPorcentaje] = useState(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [pagosMixtos, setPagosMixtos] = useState<PagoParcial[]>([]);

  // Estados de Descuentos y Recargos por Sector
  const [descLavadero, setDescLavadero] = useState(false);
  const [descBar, setDescBar] = useState(false);
  const [descCosmetica, setDescCosmetica] = useState(false);
  const [recargoLavadero, setRecargoLavadero] = useState(false);
  const [recargoBar, setRecargoBar] = useState(false);
  const [recargoCosmetica, setRecargoCosmetica] = useState(false);

  // Estados de Productos
  const [productosBar, setProductosBar] = useState<ProductoVenta[]>([]);
  const [productosCosmeticos, setProductosCosmeticos] = useState<ProductoVenta[]>([]);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<ProductoVenta[]>([]);

  // Estados de Datos
  const [serviciosLavado, setServiciosLavado] = useState<ServicioLavado[]>(DEFAULT_SERVICIOS_LAVADO);
  const [productosBarData, setProductosBarData] = useState<ProductoBar[]>(DEFAULT_PRODUCTOS_BAR);
  const [cosmeticosData, setCosmeticosData] = useState<Cosmetico[]>(DEFAULT_COSMETICOS);
  const [empleados, setEmpleados] = useState<string[]>(DEFAULT_EMPLEADOS);
  const [metodosPago, setMetodosPago] = useState<string[]>(DEFAULT_METODOS_PAGO);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [washCounts, setWashCounts] = useState<Record<string, number>>({});

  // Cargar datos desde AsyncStorage
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const ventasGuardadas = await AsyncStorage.getItem('gowash-ventas');
        if (ventasGuardadas) setVentas(JSON.parse(ventasGuardadas));

        const ordenesGuardadas = await AsyncStorage.getItem('gowash-ordenes-abiertas');
        if (ordenesGuardadas) setOrdenesAbiertas(JSON.parse(ordenesGuardadas));

        const ordenesCobradasGuardadas = await AsyncStorage.getItem('gowash-ordenes-cobradas');
        if (ordenesCobradasGuardadas) setOrdenesCobradas(JSON.parse(ordenesCobradasGuardadas));

        const empleadosGuardados = await AsyncStorage.getItem('gowash-lista-empleados');
        if (empleadosGuardados) setEmpleados(JSON.parse(empleadosGuardados));

        const metodosPagoGuardados = await AsyncStorage.getItem('gowash-metodos-pago-ventas');
        if (metodosPagoGuardados) setMetodosPago(JSON.parse(metodosPagoGuardados));

        const auditLogsGuardados = await AsyncStorage.getItem('gowash-audit-logs');
        if (auditLogsGuardados) setAuditLogs(JSON.parse(auditLogsGuardados));

        const washCountsGuardados = await AsyncStorage.getItem('gowash-wash-counts');
        if (washCountsGuardados) setWashCounts(JSON.parse(washCountsGuardados));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);

  // Guardar datos en AsyncStorage
  const guardarDatos = useCallback(async () => {
    try {
      await AsyncStorage.setItem('gowash-ventas', JSON.stringify(ventas));
      await AsyncStorage.setItem('gowash-ordenes-abiertas', JSON.stringify(ordenesAbiertas));
      await AsyncStorage.setItem('gowash-ordenes-cobradas', JSON.stringify(ordenesCobradas));
      await AsyncStorage.setItem('gowash-lista-empleados', JSON.stringify(empleados));
      await AsyncStorage.setItem('gowash-metodos-pago-ventas', JSON.stringify(metodosPago));
      await AsyncStorage.setItem('gowash-audit-logs', JSON.stringify(auditLogs));
      await AsyncStorage.setItem('gowash-wash-counts', JSON.stringify(washCounts));
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  }, [ventas, ordenesAbiertas, ordenesCobradas, empleados, metodosPago, auditLogs, washCounts]);

  // Guardar datos cuando cambien
  useEffect(() => {
    guardarDatos();
  }, [ventas, ordenesAbiertas, ordenesCobradas, empleados, metodosPago, auditLogs, washCounts, guardarDatos]);

  // Funciones de Cálculo
  const calcularTotalBar = useCallback(() => {
    return productosBar.reduce((sum, p) => sum + p.precio, 0);
  }, [productosBar]);

  const calcularTotalCosmeticos = useCallback(() => {
    return productosCosmeticos.reduce((sum, p) => sum + p.precio, 0);
  }, [productosCosmeticos]);

  const calcularTotalExtras = useCallback(() => {
    return extrasSeleccionados.reduce((sum, p) => sum + p.precio, 0);
  }, [extrasSeleccionados]);

  const calcularSubtotal = useCallback(() => {
    return lavado + calcularTotalBar() + calcularTotalCosmeticos() + calcularTotalExtras();
  }, [lavado, calcularTotalBar, calcularTotalCosmeticos, calcularTotalExtras]);

  const calcularTotal = useCallback(() => {
    const subtotal = calcularSubtotal();
    return subtotal - descuento + recargo;
  }, [calcularSubtotal, descuento, recargo]);

  // Funciones de Venta
  const registrarVenta = useCallback(async () => {
    if (!patente && !cliente) {
      alert('Ingresa Patente o Cliente');
      return;
    }

    const nuevaVenta: Venta = {
      id: editingVentaId || Date.now().toString(),
      fecha,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      horaEntrada,
      horaSalida,
      empleado,
      patente,
      cliente,
      lavado,
      bar: calcularTotalBar(),
      cosmeticos: calcularTotalCosmeticos(),
      total: calcularTotal(),
      metodoPago,
      pagosMixtos,
      numeroCliente,
      descuento,
      recargo,
      productosBar,
      productosCosmeticos,
      servicio,
      extrasLavado: extrasSeleccionados,
      descLavadero,
      descBar,
      descCosmetica,
      recargoLavadero,
      recargoBar,
      recargoCosmetica,
    };

    if (editingVentaId) {
      setVentas(ventas.map(v => v.id === editingVentaId ? nuevaVenta : v));
      setEditingVentaId(null);
    } else {
      setVentas([...ventas, nuevaVenta]);
      
      // Actualizar conteo de lavados
      if (numeroCliente) {
        const newCounts = { ...washCounts };
        newCounts[numeroCliente] = (newCounts[numeroCliente] || 0) + 1;
        setWashCounts(newCounts);
      }
    }

    limpiarFormulario();
  }, [
    patente, cliente, fecha, horaEntrada, horaSalida, empleado, lavado, bar, cosmeticos,
    descuento, recargo, metodoPago, pagosMixtos, numeroCliente, productosBar, productosCosmeticos,
    servicio, extrasSeleccionados, descLavadero, descBar, descCosmetica, recargoLavadero,
    recargoBar, recargoCosmetica, editingVentaId, ventas, washCounts,
    calcularTotalBar, calcularTotalCosmeticos, calcularTotal
  ]);

  const limpiarFormulario = useCallback(() => {
    setFecha(new Date().toISOString().split('T')[0]);
    setHoraEntrada(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    setHoraSalida(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    setEmpleado('');
    setPatente('');
    setCliente('');
    setNumeroCliente('');
    setLavado(0);
    setServicio('');
    setBar(0);
    setCosmeticos(0);
    setDescuento(0);
    setDescuentoPorcentaje(0);
    setRecargo(0);
    setRecargoPorcentaje(0);
    setMetodoPago('Efectivo');
    setPagosMixtos([]);
    setProductosBar([]);
    setProductosCosmeticos([]);
    setExtrasSeleccionados([]);
    setDescLavadero(false);
    setDescBar(false);
    setDescCosmetica(false);
    setRecargoLavadero(false);
    setRecargoBar(false);
    setRecargoCosmetica(false);
  }, []);

  const guardarOrdenEnProgreso = useCallback(() => {
    if (!patente && !cliente) {
      alert('Ingresa Patente o Cliente');
      return;
    }

    const orden: OrdenEnProgreso = {
      id: Date.now().toString(),
      fecha,
      horaEntrada,
      patente,
      cliente,
      empleado,
      datos: {
        lavado,
        bar: calcularTotalBar(),
        cosmeticos: calcularTotalCosmeticos(),
        productosBar,
        productosCosmeticos,
        servicio,
        extrasLavado: extrasSeleccionados,
        descuento,
        recargo,
        descLavadero,
        descBar,
        descCosmetica,
        recargoLavadero,
        recargoBar,
        recargoCosmetica,
      },
    };

    setOrdenesAbiertas([...ordenesAbiertas, orden]);
    limpiarFormulario();
  }, [
    patente, cliente, fecha, horaEntrada, empleado, lavado, productosBar, productosCosmeticos,
    servicio, extrasSeleccionados, descuento, recargo, descLavadero, descBar, descCosmetica,
    recargoLavadero, recargoBar, recargoCosmetica, ordenesAbiertas, limpiarFormulario,
    calcularTotalBar, calcularTotalCosmeticos
  ]);

  const cargarOrden = useCallback((orden: OrdenEnProgreso) => {
    setFecha(orden.fecha);
    setHoraEntrada(orden.horaEntrada);
    setPatente(orden.patente);
    setCliente(orden.cliente);
    setEmpleado(orden.empleado);
    setLavado(orden.datos.lavado || 0);
    setServicio(orden.datos.servicio || '');
    setProductosBar(orden.datos.productosBar || []);
    setProductosCosmeticos(orden.datos.productosCosmeticos || []);
    setExtrasSeleccionados(orden.datos.extrasLavado || []);
    setDescuento(orden.datos.descuento || 0);
    setRecargo(orden.datos.recargo || 0);
    setDescLavadero(orden.datos.descLavadero || false);
    setDescBar(orden.datos.descBar || false);
    setDescCosmetica(orden.datos.descCosmetica || false);
    setRecargoLavadero(orden.datos.recargoLavadero || false);
    setRecargoBar(orden.datos.recargoBar || false);
    setRecargoCosmetica(orden.datos.recargoCosmetica || false);
    setActiveOrderId(orden.id);
  }, []);

  const cobrarOrden = useCallback((ordenId: string) => {
    const orden = ordenesAbiertas.find(o => o.id === ordenId);
    if (!orden) return;

    registrarVenta();
    setOrdenesAbiertas(ordenesAbiertas.filter(o => o.id !== ordenId));
    setOrdenesCobradas([...ordenesCobradas, ordenId]);
    setActiveOrderId(null);
  }, [ordenesAbiertas, ordenesCobradas, registrarVenta]);

  // Funciones de Productos
  const agregarProductoBar = useCallback((nombre: string, precio: number) => {
    setProductosBar([...productosBar, { nombre, precio }]);
  }, [productosBar]);

  const eliminarProductoBar = useCallback((index: number) => {
    setProductosBar(productosBar.filter((_, i) => i !== index));
  }, [productosBar]);

  const agregarCosmetico = useCallback((nombre: string, precio: number) => {
    setProductosCosmeticos([...productosCosmeticos, { nombre, precio }]);
  }, [productosCosmeticos]);

  const eliminarCosmetico = useCallback((index: number) => {
    setProductosCosmeticos(productosCosmeticos.filter((_, i) => i !== index));
  }, [productosCosmeticos]);

  const toggleExtraLavado = useCallback((nombre: string, precio: number) => {
    const existe = extrasSeleccionados.find(e => e.nombre === nombre);
    if (existe) {
      setExtrasSeleccionados(extrasSeleccionados.filter(e => e.nombre !== nombre));
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, { nombre, precio }]);
    }
  }, [extrasSeleccionados]);

  // Funciones de Descuentos y Recargos
  const actualizarDescuentoPorcentaje = useCallback((porcentaje: number) => {
    setDescuentoPorcentaje(porcentaje);
    const desc = (calcularSubtotal() * porcentaje) / 100;
    setDescuento(desc);
  }, [calcularSubtotal]);

  const actualizarRecargoPorcentaje = useCallback((porcentaje: number) => {
    setRecargoPorcentaje(porcentaje);
    const rec = (calcularSubtotal() * porcentaje) / 100;
    setRecargo(rec);
  }, [calcularSubtotal]);

  // Funciones de Empleados
  const agregarEmpleado = useCallback((nombre: string) => {
    if (!empleados.includes(nombre)) {
      setEmpleados([...empleados, nombre]);
    }
  }, [empleados]);

  const eliminarEmpleado = useCallback((nombre: string) => {
    setEmpleados(empleados.filter(e => e !== nombre));
  }, [empleados]);

  // Funciones de Métodos de Pago
  const agregarMetodoPago = useCallback((nombre: string) => {
    if (!metodosPago.includes(nombre)) {
      setMetodosPago([...metodosPago, nombre]);
    }
  }, [metodosPago]);

  const eliminarMetodoPago = useCallback((nombre: string) => {
    setMetodosPago(metodosPago.filter(m => m !== nombre));
  }, [metodosPago]);

  // Funciones de Auditoría
  const agregarAuditLog = useCallback((accion: 'EDICION' | 'ELIMINACION', tipo: 'VENTA_LAVADO' | 'CONSUMO_EMPLEADO', detalles: string, registroId: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      accion,
      tipo,
      detalles,
      registroId,
    };
    setAuditLogs([...auditLogs, log]);
  }, [auditLogs]);

  // Funciones de Utilidad
  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const ventasDelDia = useCallback((fechaSeleccionada: string) => {
    return ventas.filter(v => v.fecha === fechaSeleccionada);
  }, [ventas]);

  return {
    // Estados
    ventas,
    ordenesAbiertas,
    ordenesCobradas,
    activeOrderId,
    editingVentaId,
    fecha,
    horaEntrada,
    horaSalida,
    empleado,
    patente,
    cliente,
    numeroCliente,
    lavado,
    servicio,
    bar,
    cosmeticos,
    descuento,
    descuentoPorcentaje,
    recargo,
    recargoPorcentaje,
    metodoPago,
    pagosMixtos,
    descLavadero,
    descBar,
    descCosmetica,
    recargoLavadero,
    recargoBar,
    recargoCosmetica,
    productosBar,
    productosCosmeticos,
    extrasSeleccionados,
    serviciosLavado,
    productosBarData,
    cosmeticosData,
    empleados,
    metodosPago,
    auditLogs,
    washCounts,

    // Setters
    setFecha,
    setHoraEntrada,
    setHoraSalida,
    setEmpleado,
    setPatente,
    setCliente,
    setNumeroCliente,
    setLavado,
    setServicio,
    setDescuento,
    setDescuentoPorcentaje,
    setRecargo,
    setRecargoPorcentaje,
    setMetodoPago,
    setPagosMixtos,
    setDescLavadero,
    setDescBar,
    setDescCosmetica,
    setRecargoLavadero,
    setRecargoBar,
    setRecargoCosmetica,
    setProductosBar,
    setProductosCosmeticos,
    setExtrasSeleccionados,
    setEditingVentaId,
    setActiveOrderId,

    // Funciones
    registrarVenta,
    limpiarFormulario,
    guardarOrdenEnProgreso,
    cargarOrden,
    cobrarOrden,
    agregarProductoBar,
    eliminarProductoBar,
    agregarCosmetico,
    eliminarCosmetico,
    toggleExtraLavado,
    actualizarDescuentoPorcentaje,
    actualizarRecargoPorcentaje,
    agregarEmpleado,
    eliminarEmpleado,
    agregarMetodoPago,
    eliminarMetodoPago,
    agregarAuditLog,
    formatMoney,
    calcularTotalBar,
    calcularTotalCosmeticos,
    calcularTotalExtras,
    calcularSubtotal,
    calcularTotal,
    ventasDelDia,
  };
}
