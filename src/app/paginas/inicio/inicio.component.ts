/**
 * Página Principal / Inicio
 * =========================
 * Portada de bienvenida con accesos rápidos al catálogo público,
 * a la tienda en línea y al acceso administrativo.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconoComponent } from '../../compartido/componentes/icono/icono.component';
import { ToggleTemaComponent } from '../../compartido/componentes/toggle-tema/toggle-tema.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, IconoComponent, ToggleTemaComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-primary-500 selection:text-white transition-colors duration-200">
      <!-- Barra Superior -->
      <header class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="logo.png" alt="Logotipo" class="w-10 h-10 rounded-xl object-cover shadow-sm" (error)="alFallarLogo($event)" />
          <span class="font-bold text-lg tracking-tight">Sistema de Ropa</span>
        </div>

        <div class="flex items-center gap-2">
          <app-toggle-tema />
          <a
            routerLink="/admin"
            class="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Panel de Administración"
          >
            <app-icono nombre="candado" clase="w-5 h-5" />
          </a>
        </div>
      </header>

      <!-- Contenido Principal / Hero -->
      <main class="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center text-center animate-fade-in">
        <div class="relative w-28 h-28 mb-6 rounded-3xl p-1 bg-gradient-to-tr from-primary-600 to-rose-500 shadow-2xl animate-scale-up">
          <img
            src="logo.png"
            alt="Logo"
            class="w-full h-full object-cover rounded-[22px] bg-white dark:bg-neutral-900"
            (error)="alFallarLogo($event)"
          />
        </div>

        <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          Catálogo & Punto de Venta
        </h1>
        <p class="mt-3 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-lg">
          Explora nuestra colección de prendas, perfumes y novedades con disponibilidad en tiempo real.
        </p>

        <!-- Accesos Rápidos Principales -->
        <div class="mt-8 w-full max-w-md flex flex-col gap-3">
          <a
            routerLink="/catalogo"
            class="w-full flex items-center justify-between p-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-600/20 active:scale-98 transition group"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/20 rounded-xl">
                <app-icono nombre="tienda" clase="w-6 h-6" />
              </div>
              <div class="text-left">
                <p class="font-bold">Ver Catálogo Digital</p>
                <p class="text-xs text-primary-100 font-normal">Explora productos y realiza pedidos</p>
              </div>
            </div>
            <app-icono nombre="flecha-derecha" clase="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            routerLink="/tienda"
            class="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold shadow-sm hover:shadow-md active:scale-98 transition group"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-400 rounded-xl">
                <app-icono nombre="carrito" clase="w-6 h-6" />
              </div>
              <div class="text-left">
                <p class="font-bold">Tienda en Línea</p>
                <p class="text-xs text-neutral-400 font-normal">Con carrito de compras y WhatsApp</p>
              </div>
            </div>
            <app-icono nombre="flecha-derecha" clase="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            routerLink="/venta-rapida"
            class="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 font-semibold active:scale-98 transition group"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-500 text-white rounded-xl">
                <app-icono nombre="billete" clase="w-6 h-6" />
              </div>
              <div class="text-left">
                <p class="font-bold">Punto de Venta (POS)</p>
                <p class="text-xs text-emerald-600 dark:text-emerald-400 font-normal">Cobro rápido en mostrador</p>
              </div>
            </div>
            <app-icono nombre="flecha-derecha" clase="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </main>

      <!-- Pie de Página con Enlace Flotante a WhatsApp -->
      <footer class="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <p>© {{ anioActual }} Catálogo de Ropa. Todos los derechos reservados.</p>
        <div class="flex items-center gap-4">
          <a routerLink="/admin" class="hover:text-primary-600 transition">Acceso Admin</a>
          <span>•</span>
          <a routerLink="/catalogo" class="hover:text-primary-600 transition">Catálogo</a>
        </div>
      </footer>

      <!-- Botón Flotante de WhatsApp -->
      <a
        [href]="enlaceWhatsApp"
        target="_blank"
        rel="noopener noreferrer"
        class="fixed bottom-6 right-6 z-30 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 font-medium active:scale-95 transition"
        title="Contáctanos por WhatsApp"
      >
        <app-icono nombre="whatsapp" clase="w-6 h-6" />
        <span class="hidden sm:inline">¿Dudas? Escríbenos</span>
      </a>
    </div>
  `
})
export class InicioComponent {
  public readonly anioActual = new Date().getFullYear();
  public readonly enlaceWhatsApp = `https://wa.me/${environment.whatsappVendedor.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola! Me gustaría pedir información sobre los productos.')}`;

  public alFallarLogo(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
