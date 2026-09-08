/**
 * Servicio del Carrito para Punto de Venta (POS)
 * =============================================
 * Controla los productos seleccionados para cobro en mostrador / venta rápida.
 */

import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito, MetodoPagoId } from '../modelos/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  /**
   * Lista reactiva de productos agregados a la venta
   */
  public readonly items = signal<ItemCarrito[]>([]);

  /**
   * Método de pago seleccionado (por defecto: efectivo)
   */
  public readonly metodoPago = signal<MetodoPagoId>('efectivo');

  /**
   * Monto entregado por el cliente en efectivo
   */
  public readonly montoRecibido = signal<number>(0);

  /**
   * Descuento global aplicado a la venta en pesos
   */
  public readonly descuento = signal<number>(0);

  /**
   * Subtotal de la venta sin descuentos
   */
  public readonly subtotal = computed(() => {
    return this.items().reduce((suma, item) => suma + (item.precio_venta * item.cantidad), 0);
  });

  /**
   * Total a pagar considerando descuentos
   */
  public readonly total = computed(() => {
    const totalCalculado = this.subtotal() - this.descuento();
    return totalCalculado > 0 ? totalCalculado : 0;
  });

  /**
   * Cantidad total de prendas o artículos en el carrito
   */
  public readonly totalArticulos = computed(() => {
    return this.items().reduce((suma, item) => suma + item.cantidad, 0);
  });

  /**
   * Cambio a devolver al cliente (solo para pago en efectivo)
   */
  public readonly cambio = computed(() => {
    if (this.metodoPago() !== 'efectivo') return 0;
    const recibido = this.montoRecibido();
    const totalVenta = this.total();
    return recibido >= totalVenta ? recibido - totalVenta : 0;
  });

  /**
   * Agrega un producto o incrementa su cantidad si ya estaba en el carrito
   */
  public agregarItem(item: ItemCarrito, cantidad: number = 1): void {
    const actuales = this.items();
    const existenteIndex = actuales.findIndex(i => i.variante_id === item.variante_id);

    if (existenteIndex >= 0) {
      const actualizados = [...actuales];
      const maximoStock = item.stock_disponible ?? 999;
      const nuevaCantidad = Math.min(actualizados[existenteIndex].cantidad + cantidad, maximoStock);

      actualizados[existenteIndex] = {
        ...actualizados[existenteIndex],
        cantidad: nuevaCantidad
      };
      this.items.set(actualizados);
    } else {
      this.items.set([...actuales, { ...item, cantidad }]);
    }
  }

  /**
   * Actualiza la cantidad de una variante específica
   */
  public actualizarCantidad(varianteId: string, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.quitarItem(varianteId);
      return;
    }

    const actualizados = this.items().map(item => {
      if (item.variante_id === varianteId) {
        const maximo = item.stock_disponible ?? 999;
        return { ...item, cantidad: Math.min(nuevaCantidad, maximo) };
      }
      return item;
    });

    this.items.set(actualizados);
  }

  /**
   * Quita un producto del carrito
   */
  public quitarItem(varianteId: string): void {
    this.items.set(this.items().filter(item => item.variante_id !== varianteId));
  }

  /**
   * Limpia todo el carrito y resetea los montos
   */
  public limpiarCarrito(): void {
    this.items.set([]);
    this.descuento.set(0);
    this.montoRecibido.set(0);
    this.metodoPago.set('efectivo');
  }
}
