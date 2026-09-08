/**
 * Historial de Ventas y Tickets Cobrados
 * =====================================
 * Registro cronológico de todos los cobros efectuados en punto de venta
 * con consulta detallada de cada ticket.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/servicios/ventas.service';
import { Venta, MetodoPagoId } from '../../../../core/modelos/producto.model';
import { METODOS_PAGO } from '../../../../core/constantes/constantes';
import { formatearMoneda, formatearFecha } from '../../../../core/utilidades/utilidades';
import { IconoComponent } from '../../../../compartido/componentes/icono/icono.component';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Historial de Ventas
          </h1>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            Tickets de cobro registrados en el sistema
          </p>
        </div>

        <button
          (click)="cargarVentas()"
          type="button"
          class="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <app-icono nombre="reabastecer" clase="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      <!-- Buscador -->
      <div class="relative max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <app-icono nombre="buscar" clase="w-4 h-4" />
        </span>
        <input
          type="text"
          [(ngModel)]="busqueda"
          placeholder="Buscar por método de pago, fecha o ticket..."
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Listado de Tickets -->
      @if (cargando()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
          }
        </div>
      } @else if (ventasFiltradas().length === 0) {
        <div class="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
          <app-icono nombre="billete" clase="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <h3 class="font-bold text-sm text-neutral-700 dark:text-neutral-300">No hay ventas registradas</h3>
          <p class="text-xs text-neutral-400 mt-1">Los cobros efectuados en Punto de Venta se mostrarán aquí</p>
        </div>
      } @else {
        <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-sm">
          @for (venta of ventasFiltradas(); track venta.id) {
            <div
              (click)="abrirDetalleVenta(venta)"
              class="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 cursor-pointer transition"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <app-icono [nombre]="obtenerIconoMetodo(venta.metodo_pago)" clase="w-5 h-5" />
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-neutral-900 dark:text-white">
                      Ticket #{{ venta.id.substring(0, 8) }}
                    </span>
                    <span [class]="obtenerClaseMetodo(venta.metodo_pago)" class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {{ venta.metodo_pago }}
                    </span>
                  </div>
                  <p class="text-xs text-neutral-400 mt-0.5">
                    {{ formatearFecha(venta.fecha_venta || venta.creado_en) }}
                  </p>
                </div>
              </div>

              <div class="text-right">
                <span class="text-base font-black text-neutral-900 dark:text-white block">
                  {{ formatearMoneda(venta.total_venta) }}
                </span>
                <span class="text-[10px] text-neutral-400">
                  {{ venta.detalle_venta?.length || 0 }} {{ (venta.detalle_venta?.length || 0) === 1 ? 'artículo' : 'artículos' }}
                </span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal con Detalle del Ticket -->
      @if (ventaSeleccionada()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 animate-scale-up">
            <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 class="font-bold text-sm text-neutral-900 dark:text-white">
                  Ticket #{{ ventaSeleccionada()?.id?.substring(0, 8) }}
                </h3>
                <p class="text-[10px] text-neutral-400">
                  {{ formatearFecha(ventaSeleccionada()?.fecha_venta) }}
                </p>
              </div>
              <button (click)="ventaSeleccionada.set(null)" class="p-1 text-neutral-400 hover:text-neutral-600">
                <app-icono nombre="cerrar" clase="w-4 h-4" />
              </button>
            </div>

            <!-- Desglose de Artículos -->
            <div class="py-4 space-y-2 max-h-60 overflow-y-auto">
              @for (det of ventaSeleccionada()?.detalle_venta || []; track $index) {
                <div class="flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-neutral-900 dark:text-white">
                      {{ det.variantes_producto?.productos?.nombre || 'Producto' }}
                    </span>
                    <span class="text-neutral-400 ml-1">
                      ({{ det.variantes_producto?.talla || '-' }}) x{{ det.cantidad }}
                    </span>
                  </div>
                  <span class="font-semibold text-neutral-700 dark:text-neutral-300">
                    {{ formatearMoneda(det.subtotal) }}
                  </span>
                </div>
              }
            </div>

            <!-- Total y Método de Pago -->
            <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <div>
                <span class="text-xs text-neutral-400 block leading-none">Método de Pago</span>
                <span class="text-xs font-bold capitalize text-primary-600">
                  {{ ventaSeleccionada()?.metodo_pago }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs text-neutral-400 block leading-none">Total Pagado</span>
                <span class="text-xl font-black text-neutral-900 dark:text-white">
                  {{ formatearMoneda(ventaSeleccionada()?.total_venta || 0) }}
                </span>
              </div>
            </div>

            <button
              (click)="ventaSeleccionada.set(null)"
              type="button"
              class="w-full mt-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-200 transition"
            >
              Cerrar Ticket
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class HistorialVentasComponent implements OnInit {
  private readonly ventasService = inject(VentasService);

  public readonly formatearMoneda = formatearMoneda;
  public readonly formatearFecha = formatearFecha;

  public readonly ventas = signal<Venta[]>([]);
  public readonly cargando = signal<boolean>(true);
  public readonly ventaSeleccionada = signal<Venta | null>(null);
  public busqueda = '';

  public readonly ventasFiltradas = computed(() => {
    const list = this.ventas();
    if (!this.busqueda.trim()) return list;
    const term = this.busqueda.toLowerCase().trim();
    return list.filter(v =>
      v.metodo_pago.toLowerCase().includes(term) ||
      v.id.toLowerCase().includes(term) ||
      (v.fecha_venta && v.fecha_venta.includes(term))
    );
  });

  public async ngOnInit(): Promise<void> {
    await this.cargarVentas();
  }

  public async cargarVentas(): Promise<void> {
    this.cargando.set(true);
    try {
      const data = await this.ventasService.obtenerVentas();
      this.ventas.set(data);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public abrirDetalleVenta(v: Venta): void {
    this.ventaSeleccionada.set(v);
  }

  public obtenerIconoMetodo(metodo: MetodoPagoId): string {
    const met = METODOS_PAGO.find(m => m.id === metodo);
    return met ? met.icono : 'billete';
  }

  public obtenerClaseMetodo(metodo: MetodoPagoId): string {
    if (metodo === 'efectivo') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
    if (metodo === 'transferencia') return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
    return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';
  }
}
