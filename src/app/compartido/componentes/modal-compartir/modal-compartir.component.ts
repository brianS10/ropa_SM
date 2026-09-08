/**
 * Modal para Compartir Catálogo y Código QR
 * ==========================================
 * Permite copiar el enlace público de la tienda, compartirlo por WhatsApp
 * y mostrar un código QR escaneable por clientes.
 */

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconoComponent } from '../icono/icono.component';

@Component({
  selector: 'app-modal-compartir',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  template: `
    @if (abierto()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        (click)="alHacerClickFondo($event)"
      >
        <div class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 text-center animate-scale-up">
          <!-- Encabezado con Botón Cerrar -->
          <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
              Compartir Catálogo
            </h3>
            <button
              (click)="cerrar.emit()"
              type="button"
              class="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <app-icono nombre="cerrar" clase="w-5 h-5" />
            </button>
          </div>

          <!-- Código QR -->
          <div class="mt-5 flex flex-col items-center">
            <div class="p-3 bg-white rounded-2xl shadow-inner border border-neutral-200">
              <img
                [src]="obtenerUrlQr()"
                alt="Código QR del Catálogo"
                class="w-48 h-48 rounded-xl object-contain"
              />
            </div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Tus clientes pueden escanear este código con su cámara
            </p>
          </div>

          <!-- Botones de Acción Rápida -->
          <div class="mt-6 flex flex-col gap-2.5">
            <!-- Botón WhatsApp -->
            <a
              [href]="obtenerEnlaceWhatsApp()"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <app-icono nombre="whatsapp" clase="w-5 h-5" />
              <span>Enviar por WhatsApp</span>
            </a>

            <!-- Botón Copiar Enlace -->
            <button
              (click)="copiarEnlace()"
              type="button"
              class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium active:scale-95 transition"
            >
              @if (enlaceCopiado()) {
                <app-icono nombre="check" clase="w-5 h-5 text-emerald-500" />
                <span class="text-emerald-600 dark:text-emerald-400">¡Enlace copiado!</span>
              } @else {
                <app-icono nombre="compartir" clase="w-5 h-5" />
                <span>Copiar enlace directo</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalCompartirComponent {
  public readonly abierto = input<boolean>(false);
  public readonly enlace = input<string>('');
  public readonly cerrar = output<void>();

  public readonly enlaceCopiado = signal<boolean>(false);

  public obtenerUrlActual(): string {
    if (this.enlace()) return this.enlace();
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/catalogo`;
    }
    return '';
  }

  public obtenerUrlQr(): string {
    const url = this.obtenerUrlActual();
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  }

  public obtenerEnlaceWhatsApp(): string {
    const mensaje = `¡Hola! Te invito a ver nuestro catálogo actualizado de productos aquí: ${this.obtenerUrlActual()}`;
    return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  }

  public async copiarEnlace(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.obtenerUrlActual());
      this.enlaceCopiado.set(true);
      setTimeout(() => this.enlaceCopiado.set(false), 2500);
    } catch {
      // Fallback
    }
  }

  public alHacerClickFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrar.emit();
    }
  }
}
