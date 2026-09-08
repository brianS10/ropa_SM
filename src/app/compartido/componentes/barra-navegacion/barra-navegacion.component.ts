/**
 * Barra de Navegación Inferior (Admin & POS)
 * ==========================================
 * Permite alternar rápidamente entre Venta Rápida (POS), Tablero de Estadísticas,
 * Inventario de Productos, Pedidos en Línea e Historial de Ventas.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconoComponent } from '../icono/icono.component';
import { ModalCompartirComponent } from '../modal-compartir/modal-compartir.component';
import { PedidosService } from '../../../core/servicios/pedidos.service';

interface EnlaceNavegacion {
  ruta: string;
  etiqueta: string;
  icono: string;
  esBadge?: boolean;
}

@Component({
  selector: 'app-barra-navegacion',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconoComponent, ModalCompartirComponent],
  template: `
    <!-- Barra Flotante Inferior -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-800/80 safe-area-inset-bottom shadow-lg">
      <div class="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        @for (item of enlaces; track item.ruta) {
          <a
            [routerLink]="item.ruta"
            routerLinkActive="text-primary-600 dark:text-primary-400 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="relative flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all text-[11px] group"
          >
            <div class="relative p-1 rounded-xl group-hover:scale-110 transition-transform">
              <app-icono [nombre]="item.icono" clase="w-6 h-6" />

              <!-- Badge de Pedidos Pendientes -->
              @if (item.esBadge && pedidosService.pedidosPendientesCount() > 0) {
                <span class="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-bounce">
                  {{ pedidosService.pedidosPendientesCount() }}
                </span>
              }
            </div>
            <span class="mt-0.5 tracking-tight">{{ item.etiqueta }}</span>
          </a>
        }

        <!-- Botón rápido para compartir el catálogo -->
        <button
          (click)="mostrarModalCompartir.set(true)"
          type="button"
          class="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition text-[11px]"
          title="Compartir enlace o código QR"
        >
          <div class="p-1 rounded-xl">
            <app-icono nombre="qr" clase="w-6 h-6" />
          </div>
          <span class="mt-0.5 tracking-tight">Catálogo</span>
        </button>
      </div>
    </nav>

    <!-- Modal para Compartir Catálogo -->
    <app-modal-compartir
      [abierto]="mostrarModalCompartir()"
      (cerrar)="mostrarModalCompartir.set(false)"
    />
  `
})
export class BarraNavegacionComponent {
  public readonly pedidosService = inject(PedidosService);
  public readonly mostrarModalCompartir = signal<boolean>(false);

  public readonly enlaces: EnlaceNavegacion[] = [
    { ruta: '/venta-rapida', etiqueta: 'Cobrar', icono: 'carrito' },
    { ruta: '/tablero', etiqueta: 'Panel', icono: 'estadisticas' },
    { ruta: '/inventario', etiqueta: 'Inventario', icono: 'inventario' },
    { ruta: '/pedidos', etiqueta: 'Pedidos', icono: 'pedidos', esBadge: true },
    { ruta: '/ventas/historial', etiqueta: 'Historial', icono: 'billete' }
  ];
}
