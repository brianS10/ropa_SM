/**
 * Administración de Pedidos Web
 * ==============================
 * Visualiza y gestiona las solicitudes de clientes originadas desde el catálogo
 * o la tienda web, con enlaces directos para contactar por WhatsApp y cambiar estados.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../../core/servicios/pedidos.service';
import { Pedido, EstadoPedido } from '../../../core/modelos/producto.model';
import { ESTADOS_PEDIDO } from '../../../core/constantes/constantes';
import { formatearMoneda, formatearFecha, crearEnlaceWhatsApp } from '../../../core/utilidades/utilidades';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Pedidos de Clientes
          </h1>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            Revisa solicitudes de apartado o compras en línea
          </p>
        </div>

        <button
          (click)="cargarPedidos()"
          type="button"
          class="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <app-icono nombre="reabastecer" clase="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      <!-- Filtros por Estado -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          (click)="filtroEstado.set('todos')"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
          [class.bg-primary-600]="filtroEstado() === 'todos'"
          [class.text-white]="filtroEstado() === 'todos'"
          [class.bg-neutral-100]="filtroEstado() !== 'todos'"
          [class.dark:bg-neutral-800]="filtroEstado() !== 'todos'"
          [class.text-neutral-600]="filtroEstado() !== 'todos'"
          [class.dark:text-neutral-300]="filtroEstado() !== 'todos'"
        >
          Todos ({{ pedidos().length }})
        </button>

        @for (est of estados; track est.id) {
          <button
            type="button"
            (click)="filtroEstado.set(est.id)"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
            [class.bg-primary-600]="filtroEstado() === est.id"
            [class.text-white]="filtroEstado() === est.id"
            [class.bg-neutral-100]="filtroEstado() !== est.id"
            [class.dark:bg-neutral-800]="filtroEstado() !== est.id"
            [class.text-neutral-600]="filtroEstado() !== est.id"
            [class.dark:text-neutral-300]="filtroEstado() !== est.id"
          >
            {{ est.nombre }} ({{ conteoPorEstado(est.id) }})
          </button>
        }
      </div>

      <!-- Listado de Pedidos -->
      @if (cargando()) {
        <div class="space-y-4">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-36 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
          }
        </div>
      } @else if (pedidosFiltrados().length === 0) {
        <div class="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
          <app-icono nombre="pedidos" clase="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <h3 class="font-bold text-sm text-neutral-700 dark:text-neutral-300">No hay pedidos en este estado</h3>
          <p class="text-xs text-neutral-400 mt-1">Cuando los clientes compren desde la tienda web aparecerán aquí</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (pedido of pedidosFiltrados(); track pedido.id) {
            <div class="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
              <!-- Encabezado del Pedido -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-base text-neutral-900 dark:text-white">
                      {{ pedido.nombre_cliente }}
                    </h3>
                    <span [class]="obtenerBadgeEstado(pedido.estado)" class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {{ pedido.estado }}
                    </span>
                  </div>
                  <p class="text-xs text-neutral-400 mt-0.5">
                    {{ formatearFecha(pedido.fecha_pedido || pedido.creado_en) }}
                  </p>
                </div>

                <!-- Botón Contactar por WhatsApp -->
                <a
                  [href]="obtenerEnlaceWhatsAppCliente(pedido)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition self-start sm:self-auto"
                >
                  <app-icono nombre="whatsapp" clase="w-4 h-4" />
                  <span>{{ pedido.telefono }}</span>
                </a>
              </div>

              <!-- Notas de Entrega si existen -->
              @if (pedido.notas) {
                <div class="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                  <span class="font-bold text-neutral-800 dark:text-neutral-200">Notas de entrega:</span> {{ pedido.notas }}
                </div>
              }

              <!-- Artículos Incluidos -->
              <div class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
                @for (det of pedido.detalle_pedido || []; track $index) {
                  <div class="py-2 flex items-center justify-between">
                    <div>
                      <span class="font-bold text-neutral-900 dark:text-white">
                        {{ det.variantes?.productos?.nombre || 'Producto' }}
                      </span>
                      <span class="text-neutral-400 ml-1.5">
                        (Talla: {{ det.variantes?.talla || '-' }}{{ det.variantes?.color ? ', ' + det.variantes?.color : '' }})
                      </span>
                      <span class="font-medium text-neutral-500 ml-1">x{{ det.cantidad }}</span>
                    </div>
                    <span class="font-bold text-neutral-900 dark:text-white">
                      {{ formatearMoneda(det.subtotal) }}
                    </span>
                  </div>
                }
              </div>

              <!-- Total y Botones de Cambio de Estado -->
              <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span class="text-xs text-neutral-400 block leading-none">Total</span>
                  <span class="text-xl font-black text-neutral-900 dark:text-white">
                    {{ formatearMoneda(pedido.total) }}
                  </span>
                </div>

                <div class="flex items-center gap-1.5 overflow-x-auto">
                  @if (pedido.estado !== 'confirmado') {
                    <button
                      (click)="cambiarEstado(pedido.id, 'confirmado')"
                      type="button"
                      class="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition"
                    >
                      Confirmar
                    </button>
                  }

                  @if (pedido.estado !== 'entregado') {
                    <button
                      (click)="cambiarEstado(pedido.id, 'entregado')"
                      type="button"
                      class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 transition"
                    >
                      Entregar
                    </button>
                  }

                  @if (pedido.estado !== 'cancelado') {
                    <button
                      (click)="cambiarEstado(pedido.id, 'cancelado')"
                      type="button"
                      class="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition"
                    >
                      Cancelar
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PedidosComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);

  public readonly estados = ESTADOS_PEDIDO;
  public readonly formatearMoneda = formatearMoneda;
  public readonly formatearFecha = formatearFecha;

  public readonly pedidos = signal<Pedido[]>([]);
  public readonly cargando = signal<boolean>(true);
  public readonly filtroEstado = signal<EstadoPedido | 'todos'>('todos');

  public readonly pedidosFiltrados = computed(() => {
    const list = this.pedidos();
    if (this.filtroEstado() === 'todos') return list;
    return list.filter(p => p.estado === this.filtroEstado());
  });

  public async ngOnInit(): Promise<void> {
    await this.cargarPedidos();
  }

  public async cargarPedidos(): Promise<void> {
    this.cargando.set(true);
    try {
      const data = await this.pedidosService.obtenerPedidos();
      this.pedidos.set(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public conteoPorEstado(estado: EstadoPedido): number {
    return this.pedidos().filter(p => p.estado === estado).length;
  }

  public obtenerBadgeEstado(estado: EstadoPedido): string {
    const est = ESTADOS_PEDIDO.find(e => e.id === estado);
    return est ? est.badgeClase : 'bg-neutral-100 text-neutral-700';
  }

  public obtenerEnlaceWhatsAppCliente(pedido: Pedido): string {
    const mensaje = `¡Hola ${pedido.nombre_cliente}! Me comunico de la tienda sobre tu pedido registrado por un total de ${formatearMoneda(pedido.total)}.`;
    return crearEnlaceWhatsApp(pedido.telefono, mensaje);
  }

  public async cambiarEstado(id: string, nuevoEstado: EstadoPedido): Promise<void> {
    try {
      await this.pedidosService.actualizarEstado(id, nuevoEstado);
      this.pedidos.update(lista =>
        lista.map(p => (p.id === id ? { ...p, estado: nuevoEstado } : p))
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al actualizar el estado del pedido.');
    }
  }
}
