/**
 * Tablero de Resumen y Estadísticas (Dashboard)
 * ==============================================
 * Muestra las métricas del día: total de ventas, corte de caja por método de pago,
 * alertas de stock bajo y accesos directos al flujo operativo.
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VentasService } from '../../../core/servicios/ventas.service';
import { InventarioService } from '../../../core/servicios/inventario.service';
import { PedidosService } from '../../../core/servicios/pedidos.service';
import { ResumenCorteCaja, Producto, VarianteProducto } from '../../../core/modelos/producto.model';
import { formatearMoneda } from '../../../core/utilidades/utilidades';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';
import dayjs from 'dayjs';

@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule, RouterLink, IconoComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Encabezado con Fecha y Saludo -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Resumen General
          </h1>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
            {{ fechaHoy }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            routerLink="/venta-rapida"
            class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md shadow-primary-600/20 active:scale-95 transition"
          >
            <app-icono nombre="carrito" clase="w-4 h-4" />
            <span>Nueva Venta (POS)</span>
          </a>
        </div>
      </div>

      <!-- Tarjetas de Métricas de Ventas de Hoy -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Ventas Hoy -->
        <div class="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total de Hoy</span>
            <div class="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <app-icono nombre="billete" clase="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {{ formatearMoneda(resumen().totalGeneral) }}
            </span>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {{ resumen().cantidadVentas }} {{ resumen().cantidadVentas === 1 ? 'ticket cobrado' : 'tickets cobrados' }}
            </p>
          </div>
        </div>

        <!-- Efectivo -->
        <div class="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Efectivo</span>
            <div class="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <app-icono nombre="billete" clase="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-2xl font-black text-neutral-900 dark:text-white">
              {{ formatearMoneda(resumen().porMetodo.efectivo) }}
            </span>
            <p class="text-xs text-neutral-500 mt-1">En caja registradora</p>
          </div>
        </div>

        <!-- Transferencia -->
        <div class="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Transferencia</span>
            <div class="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <app-icono nombre="transferencia" clase="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-2xl font-black text-neutral-900 dark:text-white">
              {{ formatearMoneda(resumen().porMetodo.transferencia) }}
            </span>
            <p class="text-xs text-neutral-500 mt-1">Directo a cuenta bancaria</p>
          </div>
        </div>

        <!-- Tarjeta -->
        <div class="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tarjeta</span>
            <div class="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <app-icono nombre="tarjeta" clase="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-2xl font-black text-neutral-900 dark:text-white">
              {{ formatearMoneda(resumen().porMetodo.tarjeta) }}
            </span>
            <p class="text-xs text-neutral-500 mt-1">Cobro mediante terminal</p>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos Operativos -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          routerLink="/inventario/agregar"
          class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center gap-3 shadow-sm group"
        >
          <div class="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 group-hover:scale-110 transition-transform">
            <app-icono nombre="mas" clase="w-5 h-5" />
          </div>
          <div>
            <p class="text-xs font-bold text-neutral-900 dark:text-white">Nuevo Producto</p>
            <p class="text-[10px] text-neutral-400">Registrar prenda</p>
          </div>
        </a>

        <a
          routerLink="/inventario/reabastecer"
          class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center gap-3 shadow-sm group"
        >
          <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 group-hover:scale-110 transition-transform">
            <app-icono nombre="reabastecer" clase="w-5 h-5" />
          </div>
          <div>
            <p class="text-xs font-bold text-neutral-900 dark:text-white">Reabastecer</p>
            <p class="text-[10px] text-neutral-400">Sumar existencias</p>
          </div>
        </a>

        <a
          routerLink="/pedidos"
          class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center gap-3 shadow-sm group"
        >
          <div class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 group-hover:scale-110 transition-transform">
            <app-icono nombre="pedidos" clase="w-5 h-5" />
          </div>
          <div>
            <p class="text-xs font-bold text-neutral-900 dark:text-white">Pedidos Web</p>
            <p class="text-[10px] text-neutral-400">{{ pedidosService.pedidosPendientesCount() }} pendientes</p>
          </div>
        </a>

        <a
          routerLink="/ventas/historial"
          class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center gap-3 shadow-sm group"
        >
          <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 group-hover:scale-110 transition-transform">
            <app-icono nombre="billete" clase="w-5 h-5" />
          </div>
          <div>
            <p class="text-xs font-bold text-neutral-900 dark:text-white">Historial Ventas</p>
            <p class="text-[10px] text-neutral-400">Ver todos los tickets</p>
          </div>
        </a>
      </div>

      <!-- Alertas de Stock Bajo -->
      <div class="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div class="flex items-center gap-2">
            <app-icono nombre="alerta" clase="w-5 h-5 text-amber-500" />
            <h2 class="text-base font-bold text-neutral-900 dark:text-white">
              Productos con Stock Bajo
            </h2>
          </div>
          <a routerLink="/inventario/reabastecer" class="text-xs font-semibold text-primary-600 hover:text-primary-700 transition">
            Reabastecer todos
          </a>
        </div>

        @if (variantesStockBajo().length === 0) {
          <p class="text-xs text-neutral-400 py-6 text-center">
            ¡Excelente! Todos los productos cuentan con suficiente inventario.
          </p>
        } @else {
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800 mt-2">
            @for (item of variantesStockBajo(); track item.variante.id) {
              <div class="py-3 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-neutral-900 dark:text-white">
                    {{ item.nombreProducto }}
                  </h4>
                  <p class="text-xs text-neutral-400">
                    Talla: <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ item.variante.talla }}</span>
                    @if (item.variante.color) { <span> - Color: {{ item.variante.color }}</span> }
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    {{ item.variante.stock_actual }} en existencia
                  </span>

                  <a
                    routerLink="/inventario/reabastecer"
                    class="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition"
                    title="Reabastecer"
                  >
                    <app-icono nombre="mas" clase="w-4 h-4" />
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class TableroComponent implements OnInit {
  private readonly ventasService = inject(VentasService);
  private readonly inventarioService = inject(InventarioService);
  public readonly pedidosService = inject(PedidosService);

  public readonly formatearMoneda = formatearMoneda;
  public readonly fechaHoy = dayjs().format('dddd, D [de] MMMM [de] YYYY');

  public readonly resumen = signal<ResumenCorteCaja>({
    totalGeneral: 0,
    cantidadVentas: 0,
    porMetodo: { efectivo: 0, transferencia: 0, tarjeta: 0 }
  });

  public readonly variantesStockBajo = signal<{ nombreProducto: string; variante: VarianteProducto }[]>([]);

  public async ngOnInit(): Promise<void> {
    await Promise.all([
      this.cargarCorteHoy(),
      this.cargarAlertasStock(),
      this.pedidosService.actualizarConteoPendientes()
    ]);
  }

  private async cargarCorteHoy(): Promise<void> {
    try {
      const corte = await this.ventasService.obtenerCorteCaja();
      this.resumen.set(corte);
    } catch (err) {
      console.error('Error al cargar corte:', err);
    }
  }

  private async cargarAlertasStock(): Promise<void> {
    try {
      const productos = await this.inventarioService.obtenerProductos();
      const bajoStock: { nombreProducto: string; variante: VarianteProducto }[] = [];

      productos.forEach(p => {
        (p.variantes_producto || []).forEach(v => {
          if (v.stock_actual <= (v.stock_minimo ?? 2)) {
            bajoStock.push({
              nombreProducto: p.nombre,
              variante: v
            });
          }
        });
      });

      this.variantesStockBajo.set(bajoStock);
    } catch (err) {
      console.error('Error al cargar alertas de stock:', err);
    }
  }
}
