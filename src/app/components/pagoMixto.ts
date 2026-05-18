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
    return venta.pagosMixtos.filter((p) => p.monto > 0);
  }
  if (venta.pagosMixtos?.length) {
    return venta.pagosMixtos.filter((p) => p.monto > 0);
  }
  return [{ metodo: venta.metodoPago, monto: venta.total }];
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

export const metodosParaPagoMixto = (metodosPago: string[]) =>
  metodosPago.filter((m) => m !== PAGO_MIXTO);
