/**
 * Componente Botón Cambiar Tema
 * ==============================
 * Permite cambiar con un solo toque entre Modo Oscuro y Modo Claro.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaService } from '../../../core/servicios/tema.service';
import { IconoComponent } from '../icono/icono.component';

@Component({
  selector: 'app-toggle-tema',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  template: `
    <button
      (click)="temaService.alternarTema()"
      type="button"
      class="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 shadow-sm active:scale-95"
      [title]="temaService.temaActual() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      aria-label="Alternar modo de color"
    >
      @if (temaService.temaActual() === 'dark') {
        <app-icono nombre="sol" clase="w-5 h-5 text-amber-400 animate-spin-once" />
      } @else {
        <app-icono nombre="luna" clase="w-5 h-5 text-indigo-600" />
      }
    </button>
  `
})
export class ToggleTemaComponent {
  public readonly temaService = inject(TemaService);
}
