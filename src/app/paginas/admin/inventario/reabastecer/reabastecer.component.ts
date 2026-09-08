/**
 * Reabastecimiento Rápido de Stock
 * =================================
 * Permite incrementar las existencias de múltiples variantes en segundos
 * con botones de suma rápida (+1, +5, +10) o entrada numérica directa.
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../../core/servicios/inventario.service';
import { Producto, VarianteProducto } from '../../../../core/modelos/producto.model';
import { IconoComponent } from '../../../../compartido/componentes/icono/icono.component';

interface ItemReabastecimiento {
  varianteId: string;
  nombreProducto: string;
  talla: string;
  color?: string;
  stockActual: number;
  cantidadASumar: number;
}

@Component({
  selector: 'app-reabastecer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, IconoComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/inventario" class="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <app-icono nombre="flecha-izquierda" clase="w-5 h-5" />
          </a>
          <div>
            <h1 class="text-xl font-black text-neutral-900 dark:text-white">
              Reabastecer Inventario
            </h1>
            <p class="text-xs text-neutral-500">
              Incrementa existencias de prendas y productos rápidamente
            </p>
          </div>
        </div>

        <button
          (click)="guardarCambios()"
          [disabled]="guardando() || totalASumar() === 0"
          type="button"
          class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
        >
          @if (guardando()) {
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Guardando...</span>
          } @else {
            <app-icono nombre="check" clase="w-4 h-4" />
            <span>Aplicar (+{{ totalASumar() }} pzas)</span>
          }
        </button>
      </div>

      <!-- Buscador para filtrar variantes -->
      <div class="relative max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <app-icono nombre="buscar" clase="w-4 h-4" />
        </span>
        <input
          type="text"
          [(ngModel)]="busqueda"
          placeholder="Filtrar por nombre o talla..."
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      @if (cargando()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-sm">
          @for (item of itemsFiltrados(); track item.varianteId) {
            <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition">
              <div>
                <h3 class="font-bold text-sm text-neutral-900 dark:text-white">
                  {{ item.nombreProducto }}
                </h3>
                <p class="text-xs text-neutral-400">
                  Talla: <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ item.talla }}</span>
                  @if (item.color) { <span> • Color: {{ item.color }}</span> }
                  • Stock actual: <span class="font-bold text-primary-600">{{ item.stockActual }}</span>
                </p>
              </div>

              <!-- Controles de Suma Rápida -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="sumar(item, 1)"
                  class="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition"
                >
                  +1
                </button>
                <button
                  type="button"
                  (click)="sumar(item, 5)"
                  class="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition"
                >
                  +5
                </button>
                <button
                  type="button"
                  (click)="sumar(item, 10)"
                  class="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition"
                >
                  +10
                </button>

                <!-- Input Cantidad a Sumar -->
                <div class="flex items-center gap-1 ml-2">
                  <span class="text-xs font-medium text-neutral-400">+</span>
                  <input
                    type="number"
                    min="0"
                    [(ngModel)]="item.cantidadASumar"
                    class="w-16 px-2.5 py-1.5 text-center text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReabastecerComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);

  public readonly cargando = signal<boolean>(true);
  public readonly guardando = signal<boolean>(false);
  public readonly items = signal<ItemReabastecimiento[]>([]);
  public busqueda = '';

  public async ngOnInit(): Promise<void> {
    await this.cargarItems();
  }

  public async cargarItems(): Promise<void> {
    this.cargando.set(true);
    try {
      const productos = await this.inventarioService.obtenerProductos();
      const lista: ItemReabastecimiento[] = [];

      productos.forEach(p => {
        (p.variantes_producto || []).forEach(v => {
          lista.push({
            varianteId: v.id,
            nombreProducto: p.nombre,
            talla: v.talla,
            color: v.color,
            stockActual: v.stock_actual,
            cantidadASumar: 0
          });
        });
      });

      this.items.set(lista);
    } catch (err) {
      console.error('Error al cargar items para reabastecer:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public itemsFiltrados(): ItemReabastecimiento[] {
    const list = this.items();
    if (!this.busqueda.trim()) return list;
    const term = this.busqueda.toLowerCase().trim();
    return list.filter(i =>
      i.nombreProducto.toLowerCase().includes(term) ||
      i.talla.toLowerCase().includes(term)
    );
  }

  public sumar(item: ItemReabastecimiento, cantidad: number): void {
    item.cantidadASumar = (Number(item.cantidadASumar) || 0) + cantidad;
  }

  public totalASumar(): number {
    return this.items().reduce((acum, i) => acum + (Number(i.cantidadASumar) || 0), 0);
  }

  public async guardarCambios(): Promise<void> {
    const aReabastecer = this.items().filter(i => (Number(i.cantidadASumar) || 0) > 0);
    if (aReabastecer.length === 0) return;

    this.guardando.set(true);
    try {
      for (const item of aReabastecer) {
        await this.inventarioService.reabastecerVariante(item.varianteId, Number(item.cantidadASumar));
      }
      alert('¡Inventario reabastecido exitosamente!');
      await this.cargarItems();
    } catch (err) {
      console.error('Error al reabastecer:', err);
      alert('Ocurrió un error al actualizar existencias.');
    } finally {
      this.guardando.set(false);
    }
  }
}
