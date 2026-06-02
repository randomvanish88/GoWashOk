export const PAGO_MIXTO = 'Pago mixto';

export interface PagoParcial {
  metodo: string;
  monto: number;
}

export interface VentaConPagos {
  metodoPago: string;
  total: number;
  pagosMixtos?: PagoParcial[];
}

export function desglosePagosVenta(venta: VentaConPagos): PagoParcial[] {
  if (venta.metodoPago === PAGO_MIXTO && venta.pagosMixtos?.length) {
    const validPagos = venta.pagosMixtos.filter((p) => p.monto > 0);
    if (validPagos.length > 0) return validPagos;
  }
  return [{ metodo: venta.metodoPago, monto: venta.total }];
}

export interface GastoConPagos {
  metodoPago: string;
  monto: number;
  pagosMixtos?: PagoParcial[];
}

export function desglosePagosGasto(gasto: GastoConPagos): PagoParcial[] {
  if (gasto.metodoPago === PAGO_MIXTO && gasto.pagosMixtos?.length) {
    const validPagos = gasto.pagosMixtos.filter((p) => p.monto > 0);
    if (validPagos.length > 0) return validPagos;
  }
  return [{ metodo: gasto.metodoPago, monto: gasto.monto }];
}

export function formatMetodoPagoDisplay(
  venta: VentaConPagos,
  formatMoney: (n: number) => string
): string {
  if (venta.metodoPago === PAGO_MIXTO && venta.pagosMixtos?.length) {
    return venta.pagosMixtos
      .filter((p) => p.monto > 0)
      .map((p) => `${p.metodo} ${formatMoney(p.monto)}`)
      .join(' + ');
  }
  return venta.metodoPago;
}

export function formatMetodoPagoGastoDisplay(
  gasto: GastoConPagos,
  formatMoney: (n: number) => string
): string {
  if (gasto.metodoPago === PAGO_MIXTO && gasto.pagosMixtos?.length) {
    return gasto.pagosMixtos
      .filter((p) => p.monto > 0)
      .map((p) => `${p.metodo} ${formatMoney(p.monto)}`)
      .join(' + ');
  }
  return gasto.metodoPago;
}

export const metodosParaPagoMixto = (metodosPago: string[]) =>
  metodosPago.filter((m) => m !== PAGO_MIXTO);
