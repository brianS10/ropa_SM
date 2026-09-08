/**
 * Pantalla de Bienvenida / Splash Screen
 * =====================================
 * Muestra el logotipo de la tienda con animación suave mientras
 * la aplicación se inicializa.
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-950 transition-opacity duration-700 pointer-events-none"
        [class.opacity-0]="desvanecer()"
      >
        <div class="flex flex-col items-center gap-4 animate-scale-up">
          <div class="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl p-1 bg-gradient-to-tr from-primary-600 to-rose-500">
            <img
              src="logo.png"
              alt="Logotipo de la tienda"
              class="w-full h-full object-cover rounded-[22px] bg-white dark:bg-neutral-900"
              (error)="alFallarImagen($event)"
            />
          </div>

          <div class="text-center">
            <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Sistema de Ropa
            </h1>
            <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Catálogo & Punto de Venta
            </p>
          </div>

          <!-- Indicador de carga sutil -->
          <div class="w-28 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-2">
            <div class="w-full h-full bg-primary-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    }
  `
})
export class SplashScreenComponent {
  public readonly visible = signal<boolean>(true);
  public readonly desvanecer = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.desvanecer.set(true);
        setTimeout(() => {
          this.visible.set(false);
        }, 700);
      }, 900);
    }
  }

  public alFallarImagen(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
