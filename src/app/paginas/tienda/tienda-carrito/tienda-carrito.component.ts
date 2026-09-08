/**
 * Cesta de Compras y Pedidos de la Tienda
 * =======================================
 * Permite al cliente revisar los productos seleccionados, modificar cantidades,
 * ingresar sus datos de entrega y confirmar el pedido enviándolo por WhatsApp y registrándolo.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoClienteService } from '../../../core/servicios/carrito-cliente.service';
import { PedidosService } from '../../../core/servicios/pedidos.service';
import { formatearMoneda, crearEnlaceWhatsApp } from '../../../core/utilidades/utilidades';
import { environment } from '../../../../environments/environment';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';
import { ToggleTemaComponent } from '../../../compartido/componentes/toggle-tema/toggle-tema.component';
import { ConfetiComponent } from '../../../compartido/componentes/confeti/confeti.component';

@Component({
  selector: 'app-tienda-carrito',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IconoComponent,
    ToggleTemaComponent,
    ConfetiComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col pb-20 selection:bg-primary-500 selection:text-white transition-colors">
      <!-- Efecto de Confeti al Enviar Pedido -->
      <app-confeti [activo]="mostrarCelebracion()" />

      <!-- Encabezado -->
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2">
            <a routerLink="/tienda" class="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              <app-icono nombre="flecha-izquierda" clase="w-5 h-5" />
            </a>
            <h1 class="font-bold text-base">Cesta de Compras</h1>
          </div>

          <div class="flex items-center gap-2">
            @if (carritoService.items().length > 0) {
              <button
                (click)="carritoService.vaciar()"
                type="button"
                class="text-xs font-semibold text-rose-500 hover:text-rose-600 transition px-2 py-1"
              >
                Vaciar cesta
              </button>
            }
            <app-toggle-tema />
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="max-w-2xl mx-auto px-4 pt-6 w-full flex-1">
        @if (pedidoEnviado()) {
          <!-- Pantalla de Éxito Tras el Pedido -->
          <div class="flex flex-col items-center justify-center text-center py-16 animate-scale-up">
            <div class="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <app-icono nombre="check" clase="w-10 h-10" />
            </div>

            <h2 class="text-2xl font-black text-neutral-900 dark:text-white">
              ¡Pedido Registrado con Éxito!
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
              Tu solicitud fue enviada por WhatsApp y registrada en nuestro sistema. En breve nos comunicaremos para confirmar la entrega.
            </p>

            <div class="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <a
                routerLink="/catalogo"
                class="w-full py-3 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-600/20 active:scale-95 transition text-center"
              >
                Seguir Explorando Catálogo
              </a>
              <a
                routerLink="/"
                class="w-full py-3 px-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold active:scale-95 transition text-center"
              >
                Ir al Inicio
              </a>
            </div>
          </div>
        } @else if (carritoService.items().length === 0) {
          <!-- Cesta Vacía -->
          <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div class="p-5 rounded-3xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-4">
              <app-icono nombre="carrito" clase="w-12 h-12" />
            </div>
            <h2 class="text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Tu bolsa de compras está vacía
            </h2>
            <p class="text-xs text-neutral-400 mt-1 max-w-xs">
              Agrega algunas prendas, perfumes o juguetes desde nuestro catálogo para continuar.
            </p>
            <a
              routerLink="/tienda"
              class="mt-6 px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md shadow-primary-600/20 active:scale-95 transition"
            >
              Explorar Tienda
            </a>
          </div>
        } @else {
          <!-- Lista de Artículos -->
          <div class="flex flex-col gap-3">
            @for (item of carritoService.items(); track item.variante_id) {
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <img
                  [src]="item.imagen_url || 'icono-512.svg'"
                  [alt]="item.nombre_producto"
                  class="w-16 h-16 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800"
                />

                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {{ item.nombre_producto }}
                  </h3>
                  <p class="text-xs text-neutral-400">
                    Talla: <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ item.talla }}</span>
                    @if (item.color) { <span> • Color: {{ item.color }}</span> }
                  </p>
                  <p class="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                    {{ formatearMoneda(item.precio_venta) }} c/u
                  </p>
                </div>

                <!-- Controles de Cantidad -->
                <div class="flex items-center gap-2">
                  <div class="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
                    <button
                      (click)="carritoService.actualizarCantidad(item.variante_id, item.cantidad - 1)"
                      type="button"
                      class="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                    >
                      <app-icono nombre="menos" clase="w-3.5 h-3.5" />
                    </button>
                    <span class="w-6 text-center text-xs font-bold text-neutral-900 dark:text-white">
                      {{ item.cantidad }}
                    </span>
                    <button
                      (click)="carritoService.actualizarCantidad(item.variante_id, item.cantidad + 1)"
                      type="button"
                      class="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                    >
                      <app-icono nombre="mas" clase="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    (click)="carritoService.remover(item.variante_id)"
                    type="button"
                    class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                    title="Eliminar producto"
                  >
                    <app-icono nombre="eliminar" clase="w-4 h-4" />
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Formulario de Datos del Cliente -->
          <div class="mt-6 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <h2 class="font-bold text-sm text-neutral-900 dark:text-white mb-3">
              Datos para la entrega o apartado
            </h2>

            <div class="flex flex-col gap-3">
              <div>
                <label class="block text-xs font-medium text-neutral-500 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  [(ngModel)]="nombreCliente"
                  placeholder="Ej. Juan Pérez"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-500 mb-1">Teléfono o WhatsApp *</label>
                <input
                  type="tel"
                  [(ngModel)]="telefonoCliente"
                  placeholder="Ej. 999 123 4567"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-500 mb-1">Dirección / Notas de entrega</label>
                <textarea
                  [(ngModel)]="notasCliente"
                  rows="2"
                  placeholder="Ej. Entregar en punto medio o indicar referencias de domicilio..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Resumen y Botón de Enviar Pedido -->
          <div class="mt-6 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div class="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-2">
              <span>Total de artículos</span>
              <span>{{ carritoService.totalPrendas() }} pzas</span>
            </div>
            <div class="flex justify-between text-lg font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Total a Pagar</span>
              <span class="text-primary-600 dark:text-primary-400">{{ formatearMoneda(carritoService.totalPagar()) }}</span>
            </div>

            @if (errorFormulario()) {
              <p class="mt-3 text-xs text-rose-500 font-semibold text-center">
                {{ errorFormulario() }}
              </p>
            }

            <button
              (click)="enviarPedido()"
              [disabled]="procesando()"
              type="button"
              class="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 active:scale-98 transition"
            >
              @if (procesando()) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando pedido...</span>
              } @else {
                <app-icono nombre="whatsapp" clase="w-5 h-5" />
                <span>Confirmar y Enviar por WhatsApp</span>
              }
            </button>
          </div>
        }
      </main>
    </div>
  `
})
export class TiendaCarritoComponent {
  public readonly carritoService = inject(CarritoClienteService);
  private readonly pedidosService = inject(PedidosService);

  public readonly formatearMoneda = formatearMoneda;

  public nombreCliente = '';
  public telefonoCliente = '';
  public notasCliente = '';

  public readonly procesando = signal<boolean>(false);
  public readonly pedidoEnviado = signal<boolean>(false);
  public readonly mostrarCelebracion = signal<boolean>(false);
  public readonly errorFormulario = signal<string | null>(null);

  public async enviarPedido(): Promise<void> {
    if (!this.nombreCliente.trim()) {
      this.errorFormulario.set('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!this.telefonoCliente.trim()) {
      this.errorFormulario.set('Por favor ingresa tu teléfono o WhatsApp.');
      return;
    }

    this.errorFormulario.set(null);
    this.procesando.set(true);

    try {
      const items = this.carritoService.items();
      const total = this.carritoService.totalPagar();

      // 1. Guardar en base de datos Supabase
      await this.pedidosService.crearPedido({
        nombre_cliente: this.nombreCliente.trim(),
        telefono: this.telefonoCliente.trim(),
        notas: this.notasCliente.trim() || undefined,
        total
      }, items);

      // 2. Construir mensaje ordenado para WhatsApp
      let resumenArticulos = '';
      items.forEach((it, idx) => {
        resumenArticulos += `${idx + 1}. *${it.nombre_producto}* (Talla: ${it.talla}${it.color ? ' - ' + it.color : ''}) x${it.cantidad} = ${formatearMoneda(it.precio_venta * it.cantidad)}\n`;
      });

      const mensaje = `🛍️ *¡NUEVO PEDIDO DE LA TIENDA WEB!* 🛍️\n\n` +
        `👤 *Cliente:* ${this.nombreCliente.trim()}\n` +
        `📞 *Teléfono:* ${this.telefonoCliente.trim()}\n` +
        (this.notasCliente.trim() ? `📝 *Notas:* ${this.notasCliente.trim()}\n` : '') +
        `\n📦 *Productos solicitados:*\n` +
        `${resumenArticulos}\n` +
        `💰 *TOTAL A PAGAR:* ${formatearMoneda(total)}\n\n` +
        `Por favor confirma mi pedido y las opciones de entrega. ¡Gracias!`;

      const enlaceWhatsApp = crearEnlaceWhatsApp(environment.whatsappVendedor, mensaje);

      // Abrir WhatsApp en nueva pestaña
      if (typeof window !== 'undefined') {
        window.open(enlaceWhatsApp, '_blank');
      }

      // Vaciar cesta y celebrar
      this.carritoService.vaciar();
      this.pedidoEnviado.set(true);
      this.mostrarCelebracion.set(true);
    } catch (err: unknown) {
      console.error('Error al enviar pedido:', err);
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado al registrar el pedido.';
      this.errorFormulario.set(`Error: ${msg}`);
    } finally {
      this.procesando.set(false);
    }
  }
}
