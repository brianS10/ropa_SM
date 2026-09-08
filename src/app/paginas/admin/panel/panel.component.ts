/**
 * Diseño Base del Panel Administrativo (Layout)
 * ==============================================
 * Envuelve todas las pantallas internas del administrador con la barra superior
 * (logo, modo oscuro, cerrar sesión) y la barra inferior de navegación rápida.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../../core/servicios/autenticacion.service';
import { BarraNavegacionComponent } from '../../../compartido/componentes/barra-navegacion/barra-navegacion.component';
import { ToggleTemaComponent } from '../../../compartido/componentes/toggle-tema/toggle-tema.component';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, BarraNavegacionComponent, ToggleTemaComponent, IconoComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col pb-24 selection:bg-primary-500 selection:text-white transition-colors">
      <!-- Encabezado Superior del Panel -->
      <header class="sticky top-0 z-30 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/tablero" class="flex items-center gap-2">
              <img src="logo.png" alt="Logo" class="w-8 h-8 rounded-xl object-cover" (error)="alFallarLogo($event)" />
              <div>
                <span class="font-bold text-sm tracking-tight block leading-tight">Panel de Control</span>
                <span class="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 leading-none">Administrador</span>
              </div>
            </a>
          </div>

          <!-- Acciones de Cabecera -->
          <div class="flex items-center gap-2">
            <a
              routerLink="/catalogo"
              target="_blank"
              class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Abrir catálogo público"
            >
              <app-icono nombre="tienda" clase="w-4 h-4" />
              <span>Ver Catálogo</span>
            </a>

            <app-toggle-tema />

            <button
              (click)="cerrarSesion()"
              type="button"
              class="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition active:scale-95"
              title="Cerrar sesión"
            >
              <app-icono nombre="cerrar" clase="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Vistas Hijas del Panel -->
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <router-outlet></router-outlet>
      </main>

      <!-- Barra de Navegación Inferior -->
      <app-barra-navegacion />
    </div>
  `
})
export class PanelAdminComponent {
  private readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);

  public cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/admin']);
  }

  public alFallarLogo(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
