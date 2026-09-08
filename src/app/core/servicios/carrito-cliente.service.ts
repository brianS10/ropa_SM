/**
 * Servicio del Carrito de Compras para Clientes
 * =============================================
 * Gestiona la cesta de compras del catálogo público con persistencia local
 * y animación al añadir productos.
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { ItemCarrito } from '../modelos/producto.model';
import { LLAVE_STORAGE_CARRITO_CLIENTE } from '../constantes/constantes';

@Injectable({
  providedIn: 'root'
})
export class CarritoClienteService {
  /**
   * Artículos en la cesta del cliente
   */
  public readonly items = signal<ItemCarrito[]>([]);

  /**
   * Evento para disparar la animación de añadir al carrito
   */
  public readonly ultimoElementoAnimado = signal<{ x: number; y: number; urlImagen?: string } | null>(null);

  /**
   * Conteo total de prendas
   */
  public readonly totalPrendas = computed(() => {
    return this.items().reduce((acum, item) => acum + item.cantidad, 0);
  });

  /**
   * Total a pagar en pesos
   */
  public readonly totalPagar = computed(() => {
    return this.items().reduce((acum, item) => acum + (item.precio_venta * item.cantidad), 0);
  });

  constructor() {
    this.cargarCarritoGuardado();

    // Guardar en localStorage cuando cambie el carrito
    effect(() => {
      const lista = this.items();
      if (typeof window !== 'undefined') {
        localStorage.setItem(LLAVE_STORAGE_CARRITO_CLIENTE, JSON.stringify(lista));
      }
    });
  }

  private cargarCarritoGuardado(): void {
    if (typeof window === 'undefined') return;
    try {
      const guardado = localStorage.getItem(LLAVE_STORAGE_CARRITO_CLIENTE);
      if (guardado) {
        this.items.set(JSON.parse(guardado));
      }
    } catch {
      this.items.set([]);
    }
  }

  /**
   * Agrega un producto a la bolsa y dispara la animación si se pasa la posición
   */
  public agregar(item: ItemCarrito, origenAnimacion?: { x: number; y: number }): void {
    const actuales = this.items();
    const index = actuales.findIndex(i => i.variante_id === item.variante_id);

    if (index >= 0) {
      const actualizados = [...actuales];
      const maximo = item.stock_disponible ?? 99;
      actualizados[index] = {
        ...actualizados[index],
        cantidad: Math.min(actualizados[index].cantidad + item.cantidad, maximo)
      };
      this.items.set(actualizados);
    } else {
      this.items.set([...actuales, item]);
    }

    if (origenAnimacion) {
      this.ultimoElementoAnimado.set({
        x: origenAnimacion.x,
        y: origenAnimacion.y,
        urlImagen: item.imagen_url
      });
    }
  }

  public actualizarCantidad(varianteId: string, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.remover(varianteId);
      return;
    }

    this.items.set(
      this.items().map(item =>
        item.variante_id === varianteId ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  }

  public remover(varianteId: string): void {
    this.items.set(this.items().filter(i => i.variante_id !== varianteId));
  }

  public vaciar(): void {
    this.items.set([]);
  }
}
