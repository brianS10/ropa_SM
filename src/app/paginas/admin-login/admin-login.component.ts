/**
 * Pantalla de Acceso de Administrador (PIN)
 * ==========================================
 * Teclado numérico táctil para ingresar el código PIN de 4 dígitos.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../core/servicios/autenticacion.service';
import { IconoComponent } from '../../compartido/componentes/icono/icono.component';
import { ToggleTemaComponent } from '../../compartido/componentes/toggle-tema/toggle-tema.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink, IconoComponent, ToggleTemaComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between p-4 selection:bg-primary-500 selection:text-white transition-colors">
      <!-- Encabezado con Botón Regresar -->
      <div class="w-full max-w-sm mx-auto flex items-center justify-between pt-2">
        <a
          routerLink="/"
          class="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <app-icono nombre="flecha-izquierda" clase="w-4 h-4" />
          <span>Volver al inicio</span>
        </a>

        <app-toggle-tema />
      </div>

      <!-- Tarjeta del Teclado Numérico -->
      <div class="w-full max-w-sm mx-auto flex flex-col items-center animate-scale-up">
        <div class="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 mb-4">
          <app-icono nombre="candado" clase="w-8 h-8" />
        </div>

        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white text-center">
          Acceso Administrador
        </h1>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
          Ingresa tu PIN de 4 dígitos para acceder al panel
        </p>

        <!-- Indicadores de PIN (Círculos) -->
        <div class="flex items-center justify-center gap-3 my-6" [class.animate-shake]="error()">
          @for (punto of [0, 1, 2, 3]; track $index) {
            <div
              class="w-4 h-4 rounded-full border-2 transition-all duration-200"
              [class.bg-primary-600]="pin().length > $index"
              [class.border-primary-600]="pin().length > $index"
              [class.border-neutral-300]="pin().length <= $index"
              [class.dark:border-neutral-700]="pin().length <= $index"
            ></div>
          }
        </div>

        @if (error()) {
          <p class="text-xs text-rose-500 font-semibold mb-4 text-center">
            PIN incorrecto. Por favor intenta de nuevo.
          </p>
        }

        <!-- Teclado Numérico 3x4 -->
        <div class="grid grid-cols-3 gap-3 w-full max-w-xs">
          @for (num of ['1', '2', '3', '4', '5', '6', '7', '8', '9']; track num) {
            <button
              (click)="presionarNumero(num)"
              type="button"
              class="h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-2xl font-bold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 shadow-sm transition-all"
            >
              {{ num }}
            </button>
          }

          <!-- Botón Borrar Todo -->
          <button
            (click)="limpiar()"
            type="button"
            class="h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900/40 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium text-xs active:scale-95 transition"
          >
            Limpiar
          </button>

          <!-- Número 0 -->
          <button
            (click)="presionarNumero('0')"
            type="button"
            class="h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-2xl font-bold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 shadow-sm transition-all"
          >
            0
          </button>

          <!-- Botón Retroceso -->
          <button
            (click)="borrarUltimo()"
            type="button"
            class="h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900/40 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition"
            aria-label="Borrar último dígito"
          >
            <app-icono nombre="flecha-izquierda" clase="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Pie informativo -->
      <div class="text-center text-xs text-neutral-400 py-4">
        <p>PIN predeterminado del sistema: 1234</p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }
  `]
})
export class AdminLoginComponent {
  private readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);

  public readonly pin = signal<string>('');
  public readonly error = signal<boolean>(false);

  public presionarNumero(numero: string): void {
    if (this.pin().length >= 4) return;

    this.error.set(false);
    const nuevoPin = this.pin() + numero;
    this.pin.set(nuevoPin);

    if (nuevoPin.length === 4) {
      setTimeout(() => this.validarPin(nuevoPin), 150);
    }
  }

  public borrarUltimo(): void {
    this.error.set(false);
    this.pin.update(p => p.slice(0, -1));
  }

  public limpiar(): void {
    this.pin.set('');
    this.error.set(false);
  }

  private validarPin(pinCompleto: string): void {
    const esValido = this.authService.iniciarSesionConPin(pinCompleto);
    if (esValido) {
      this.router.navigate(['/tablero']);
    } else {
      this.error.set(true);
      setTimeout(() => {
        this.pin.set('');
      }, 600);
    }
  }
}
