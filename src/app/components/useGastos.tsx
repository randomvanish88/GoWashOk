import { useState, useEffect } from 'react';
import { Gasto } from './Gastos';

const DEFAULT_SECTORES = ['Lavadero', 'Bar', 'Cosmética'];
const DEFAULT_CATEGORIAS = [
  'Servicios (luz, agua, gas)',
  'Compra de insumos',
  'Mantenimiento',
  'Salarios',
  'Alquiler',
  'Marketing',
  'Impuestos',
  'Otros',
];
const DEFAULT_PROVEEDORES = ['Particular', 'Distribuidora Central'];
const DEFAULT_METODOS_PAGO = ['Efectivo', 'Digital'];

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [sectores, setSectores] = useState<string[]>(DEFAULT_SECTORES);
  const [categorias, setCategorias] = useState<string[]>(DEFAULT_CATEGORIAS);
  const [proveedores, setProveedores] = useState<string[]>(DEFAULT_PROVEEDORES);
  const [metodosPago, setMetodosPago] = useState<string[]>(DEFAULT_METODOS_PAGO);

  const loadGastosData = () => {
    const savedGastos = localStorage.getItem('gowash-gastos');
    if (savedGastos) setGastos(JSON.parse(savedGastos));
    else setGastos([]);

    const savedSectores = localStorage.getItem('gowash-sectores-gastos');
    if (savedSectores) setSectores(JSON.parse(savedSectores));
    else localStorage.setItem('gowash-sectores-gastos', JSON.stringify(DEFAULT_SECTORES));

    const savedCategorias = localStorage.getItem('gowash-categorias-gastos');
    if (savedCategorias) setCategorias(JSON.parse(savedCategorias));
    else localStorage.setItem('gowash-categorias-gastos', JSON.stringify(DEFAULT_CATEGORIAS));

    const savedProveedores = localStorage.getItem('gowash-proveedores-gastos');
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));
    else localStorage.setItem('gowash-proveedores-gastos', JSON.stringify(DEFAULT_PROVEEDORES));

    const savedMetodos = localStorage.getItem('gowash-metodos-pago-gastos');
    if (savedMetodos) setMetodosPago(JSON.parse(savedMetodos));
    else localStorage.setItem('gowash-metodos-pago-gastos', JSON.stringify(DEFAULT_METODOS_PAGO));
  };

  useEffect(() => {
    loadGastosData();

    const handleGastosUpdated = () => {
      loadGastosData();
    };

    window.addEventListener('gastos-updated', handleGastosUpdated);
    return () => window.removeEventListener('gastos-updated', handleGastosUpdated);
  }, []);

  const eliminarGasto = (id: string) => {
    const nuevosGastos = gastos.filter(g => g.id !== id);
    setGastos(nuevosGastos);
    localStorage.setItem('gowash-gastos', JSON.stringify(nuevosGastos));
    window.dispatchEvent(new Event('gastos-updated'));
  };

  return { gastos, sectores, categorias, proveedores, metodosPago, setSectores, setCategorias, setProveedores, setMetodosPago, setGastos, eliminarGasto };
}
