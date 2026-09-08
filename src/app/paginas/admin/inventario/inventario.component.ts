/**
 * Administración de Inventario
 * =============================
 * Lista completa de artículos con filtros, stock total acumulado,
 * accesos para editar, reabastecer o eliminar productos.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../core/servicios/inventario.service';
import { Producto, TipoProducto } from '../../../core/modelos/producto.model';
import { TIPOS_PRODUCTO } from '../../../core/constantes/constantes';
import { formatearMoneda, obtenerEstadoStock } from '../../../core/utilidades/utilidades';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, IconoComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Encabezado con Botones de Acción -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Inventario de Productos
          </h1>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ productos().length }} productos registrados en catálogo
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            routerLink="/inventario/reabastecer"
            class="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <app-icono nombre="reabastecer" clase="w-4 h-4" />
            <span>Reabastecer</span>
          </a>

          <a
            routerLink="/inventario/agregar"
            class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md shadow-primary-600/20 active:scale-95 transition"
          >
            <app-icono nombre="mas" clase="w-4 h-4" />
            <span>Nuevo Producto</span>
          </a>
        </div>
      </div>

      <!-- Buscador y Filtros Rápidos -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <app-icono nombre="buscar" clase="w-4 h-4" />
          </span>
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="Buscar por nombre, categoría o variante..."
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div class="flex gap-1.5 overflow-x-auto">
          <button
            type="button"
            (click)="tipoFiltro.set('todos')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition"
            [class.bg-primary-600]="tipoFiltro() === 'todos'"
            [class.text-white]="tipoFiltro() === 'todos'"
            [class.bg-white]="tipoFiltro() !== 'todos'"
            [class.dark:bg-neutral-900]="tipoFiltro() !== 'todos'"
            [class.border]="tipoFiltro() !== 'todos'"
            [class.border-neutral-200]="tipoFiltro() !== 'todos'"
            [class.dark:border-neutral-800]="tipoFiltro() !== 'todos'"
          >
            Todos
          </button>
          @for (t of tipos; track t.id) {
            <button
              type="button"
              (click)="tipoFiltro.set(t.id)"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition"
              [class.bg-primary-600]="tipoFiltro() === t.id"
              [class.text-white]="tipoFiltro() === t.id"
              [class.bg-white]="tipoFiltro() !== t.id"
              [class.dark:bg-neutral-900]="tipoFiltro() !== t.id"
              [class.border]="tipoFiltro() !== t.id"
              [class.border-neutral-200]="tipoFiltro() !== t.id"
              [class.dark:border-neutral-800]="tipoFiltro() !== t.id"
            >
              {{ t.nombre }}
            </button>
          }
        </div>
      </div>

      <!-- Listado de Productos -->
      @if (cargando()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
          }
        </div>
      } @else if (productosFiltrados().length === 0) {
        <div class="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
          <app-icono nombre="inventario" clase="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <h3 class="font-bold text-sm text-neutral-700 dark:text-neutral-300">No hay productos que coincidan</h3>
          <p class="text-xs text-neutral-400 mt-1">Intenta con otro término o agrega un nuevo producto</p>
        </div>
      } @else {
        <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800">
          @for (prod of productosFiltrados(); track prod.id) {
            <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition">
              <!-- Datos Básicos e Imagen -->
              <div class="flex items-center gap-3 min-w-0">
                <img
                  [src]="prod.imagen_url || 'icono-512.svg'"
                  [alt]="prod.nombre"
                  class="w-14 h-14 rounded-2xl object-cover bg-neutral-100 dark:bg-neutral-800 flex-shrink-0"
                  (error)="alFallarLogo($event)"
                />

                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-sm text-neutral-900 dark:text-white truncate">
                      {{ prod.nombre }}
                    </h3>
                    @if (prod.descuento && prod.descuento > 0) {
                      <span class="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md">
                        -{{ prod.descuento }}%
                      </span>
                    }
                  </div>

                  <p class="text-xs text-neutral-400">
                    <span class="capitalize">{{ prod.tipo_producto || 'ropa' }}</span> • {{ prod.categoria }}
                  </p>

                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs font-black text-neutral-900 dark:text-white">
                      {{ formatearMoneda(obtenerPrecio(prod)) }}
                    </span>
                    <span class="text-neutral-300 dark:text-neutral-700">•</span>
                    <span [class]="obtenerEstadoStock(calcularStock(prod)).claseBadge" class="text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {{ calcularStock(prod) }} pzas en total
                    </span>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center gap-2 self-end sm:self-center">
                <a
                  [routerLink]="['/inventario', prod.id]"
                  class="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition"
                  title="Editar producto"
                >
                  <app-icono nombre="editar" clase="w-4 h-4" />
                </a>

                <button
                  (click)="confirmarEliminar(prod)"
                  type="button"
                  class="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition"
                  title="Eliminar producto"
                >
                  <app-icono nombre="eliminar" clase="w-4 h-4" />
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal de Confirmación de Eliminación -->
      @if (productoAEliminar()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 text-center animate-scale-up">
            <div class="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <app-icono nombre="eliminar" clase="w-7 h-7" />
            </div>

            <h3 class="font-bold text-base text-neutral-900 dark:text-white">
              ¿Eliminar producto?
            </h3>
            <p class="text-xs text-neutral-500 mt-1">
              Esta acción borrará "{{ productoAEliminar()?.nombre }}" y todas sus variantes de inventario.
            </p>

            <div class="mt-5 flex gap-2">
              <button
                (click)="productoAEliminar.set(null)"
                type="button"
                class="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
              >
                Cancelar
              </button>
              <button
                (click)="ejecutarEliminacion()"
                type="button"
                class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md active:scale-95 transition"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class InventarioComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);

  public readonly tipos = TIPOS_PRODUCTO;
  public readonly formatearMoneda = formatearMoneda;
  public readonly obtenerEstadoStock = obtenerEstadoStock;

  public readonly productos = signal<Producto[]>([]);
  public readonly cargando = signal<boolean>(true);
  public readonly tipoFiltro = signal<TipoProducto | 'todos'>('todos');
  public busqueda = '';

  public readonly productoAEliminar = signal<Producto | null>(null);

  public readonly productosFiltrados = computed(() => {
    let list = this.productos();

    if (this.tipoFiltro() !== 'todos') {
      list = list.filter(p => p.tipo_producto === this.tipoFiltro());
    }

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase().trim();
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term)
      );
    }

    return list;
  });

  public async ngOnInit(): Promise<void> {
    await this.cargarInventario();
  }

  public async cargarInventario(): Promise<void> {
    this.cargando.set(true);
    try {
      const data = await this.inventarioService.obtenerProductos();
      this.productos.set(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public calcularStock(prod: Producto): number {
    return (prod.variantes_producto || []).reduce((acum, v) => acum + (v.stock_actual || 0), 0);
  }

  public obtenerPrecio(prod: Producto): number {
    const vars = prod.variantes_producto || [];
    if (vars.length === 0) return 0;
    return vars[0].precio_venta;
  }

  public confirmarEliminar(prod: Producto): void {
    this.productoAEliminar.set(prod);
  }

  public async ejecutarEliminacion(): Promise<void> {
    const prod = this.productoAEliminar();
    if (!prod) return;

    try {
      await this.inventarioService.eliminarProducto(prod.id);
      this.productoAEliminar.set(null);
      await this.cargarInventario();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto.');
    }
  }

  public alFallarLogo(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
