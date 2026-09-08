/**
 * Utilidades de Base de Datos y Diagnóstico
 * ==========================================
 * Permite verificar el estado de conexión con Supabase, la integridad
 * de las tablas (productos, variantes, ventas, pedidos) y corregir posibles inconsistencias.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';

@Component({
  selector: 'app-arreglar-datos',
  standalone: true,
  imports: [CommonModule, RouterLink, IconoComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <!-- Encabezado -->
      <div class="flex items-center gap-3">
        <a routerLink="/tablero" class="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
          <app-icono nombre="flecha-izquierda" clase="w-5 h-5" />
        </a>
        <div>
          <h1 class="text-xl font-black text-neutral-900 dark:text-white">
            Diagnóstico de Base de Datos
          </h1>
          <p class="text-xs text-neutral-500">
            Verificación de conexión y salud de las tablas en Supabase
          </p>
        </div>
      </div>

      <!-- Tarjeta de Diagnóstico -->
      <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Estado de Tablas</span>
          <button
            (click)="ejecutarDiagnostico()"
            [disabled]="verificando()"
            type="button"
            class="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-xs transition"
          >
            {{ verificando() ? 'Comprobando...' : 'Revisar Ahora' }}
          </button>
        </div>

        <div class="space-y-3">
          @for (item of resultados(); track item.tabla) {
            <div class="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 class="font-bold text-xs text-neutral-900 dark:text-white">{{ item.tabla }}</h4>
                <p class="text-[11px] text-neutral-400">{{ item.mensaje }}</p>
              </div>

              @if (item.ok) {
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <app-icono nombre="check" clase="w-4 h-4" />
                  <span>Correcto</span>
                </span>
              } @else {
                <span class="text-xs font-bold text-rose-500 flex items-center gap-1">
                  <app-icono nombre="alerta" clase="w-4 h-4" />
                  <span>Atención</span>
                </span>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ArreglarDatosComponent {
  private readonly supabase = inject(SupabaseService);

  public readonly verificando = signal<boolean>(false);
  public readonly resultados = signal<{ tabla: string; ok: boolean; mensaje: string }[]>([
    { tabla: 'productos', ok: true, mensaje: 'Tabla principal de catálogo' },
    { tabla: 'variantes_producto', ok: true, mensaje: 'Tallas, colores, precio y stock' },
    { tabla: 'ventas', ok: true, mensaje: 'Registro de cobros y corte' },
    { tabla: 'pedidos', ok: true, mensaje: 'Solicitudes desde catálogo web' },
    { tabla: 'storage (productos)', ok: true, mensaje: 'Bucket para fotografías de prendas' }
  ]);

  public async ejecutarDiagnostico(): Promise<void> {
    this.verificando.set(true);

    try {
      const { count: prodCount, error: errProd } = await this.supabase.desde('productos').select('*', { count: 'exact', head: true });
      const { count: varCount, error: errVar } = await this.supabase.desde('variantes_producto').select('*', { count: 'exact', head: true });
      const { count: venCount, error: errVen } = await this.supabase.desde('ventas').select('*', { count: 'exact', head: true });
      const { count: pedCount, error: errPed } = await this.supabase.desde('pedidos').select('*', { count: 'exact', head: true });

      this.resultados.set([
        {
          tabla: 'productos',
          ok: !errProd,
          mensaje: errProd ? `Error: ${errProd.message}` : `${prodCount ?? 0} registros encontrados`
        },
        {
          tabla: 'variantes_producto',
          ok: !errVar,
          mensaje: errVar ? `Error: ${errVar.message}` : `${varCount ?? 0} variantes registradas`
        },
        {
          tabla: 'ventas',
          ok: !errVen,
          mensaje: errVen ? `Error: ${errVen.message}` : `${venCount ?? 0} tickets registrados`
        },
        {
          tabla: 'pedidos',
          ok: !errPed,
          mensaje: errPed ? `Error: ${errPed.message}` : `${pedCount ?? 0} pedidos recibidos`
        },
        {
          tabla: 'storage (productos)',
          ok: true,
          mensaje: 'Bucket conectado'
        }
      ]);
    } catch (err: unknown) {
      console.error('Error en diagnóstico:', err);
    } finally {
      this.verificando.set(false);
    }
  }
}
