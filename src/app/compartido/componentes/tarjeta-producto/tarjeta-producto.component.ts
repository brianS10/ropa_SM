/**
 * Tarjeta de Producto
 * ===================
 * Muestra el producto con su imagen principal, precio, variantes disponibles,
 * insignia de stock y botón para agregar o ver detalles.
 */

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto, VarianteProducto } from '../../../core/modelos/producto.model';
import { formatearMoneda, obtenerEstadoStock } from '../../../core/utilidades/utilidades';
import { IconoComponent } from '../icono/icono.component';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  template: `
    <div
      class="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <!-- Contenedor de Imagen con Insignias -->
      <div
        class="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
        (click)="clickImagen.emit(producto())"
      >
        <img
          [src]="producto().imagen_url || 'icono-512.svg'"
          [alt]="producto().nombre"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          (error)="alFallarImagen($event)"
        />

        <!-- Insignia de Descuento si aplica -->
        @if (producto().descuento && (producto().descuento ?? 0) > 0) {
          <div class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[11px] font-bold tracking-wide shadow-md">
            -{{ producto().descuento }}%
          </div>
        }

        <!-- Insignia de Stock -->
        <div class="absolute top-2 right-2">
          <span [class]="estadoStock().claseBadge" class="text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {{ estadoStock().etiqueta }}
          </span>
        </div>
      </div>

      <!-- Información del Producto -->
      <div class="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <span class="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {{ producto().categoria }}
          </span>
          <h3 class="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1 mt-0.5" [title]="producto().nombre">
            {{ producto().nombre }}
          </h3>
        </div>

        <div class="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
          <div>
            <span class="text-xs text-neutral-400 dark:text-neutral-500 block leading-none">Precio</span>
            <span class="text-base font-bold text-neutral-900 dark:text-white">
              {{ formatearMoneda(precioMinimo()) }}
            </span>
          </div>

          @if (mostrarBotonAgregar()) {
            <button
              (click)="alClickAgregar($event)"
              [disabled]="estadoStock().agotado"
              type="button"
              class="p-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition active:scale-95 flex items-center justify-center"
              aria-label="Agregar al carrito"
            >
              <app-icono nombre="mas" clase="w-4 h-4" />
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class TarjetaProductoComponent {
  public readonly producto = input.required<Producto>();
  public readonly mostrarBotonAgregar = input<boolean>(true);

  public readonly clickImagen = output<Producto>();
  public readonly agregar = output<{ producto: Producto; variante?: VarianteProducto; evento: MouseEvent }>();

  public readonly formatearMoneda = formatearMoneda;

  public readonly stockTotal = computed(() => {
    const vars = this.producto().variantes_producto || [];
    return vars.reduce((acum, v) => acum + (v.stock_actual || 0), 0);
  });

  public readonly estadoStock = computed(() => {
    return obtenerEstadoStock(this.stockTotal());
  });

  public readonly precioMinimo = computed(() => {
    const vars = this.producto().variantes_producto || [];
    if (vars.length === 0) return 0;
    return Math.min(...vars.map(v => v.precio_venta));
  });

  public alClickAgregar(evento: MouseEvent): void {
    const vars = this.producto().variantes_producto || [];
    const primeraDisponible = vars.find(v => v.stock_actual > 0) || vars[0];
    this.agregar.emit({
      producto: this.producto(),
      variante: primeraDisponible,
      evento
    });
  }

  public alFallarImagen(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
