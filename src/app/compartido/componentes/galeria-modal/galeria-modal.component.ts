/**
 * Modal Visor de Imágenes en Pantalla Completa
 * ============================================
 * Permite explorar las fotos de un producto con botones de navegación,
 * miniaturas y cierre táctil.
 */

import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconoComponent } from '../icono/icono.component';

@Component({
  selector: 'app-galeria-modal',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  template: `
    @if (abierto() && imagenes().length > 0) {
      <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
        (click)="alHacerClickFondo($event)"
      >
        <!-- Barra Superior con Botón Cerrar e Indicador -->
        <div class="w-full max-w-4xl flex items-center justify-between text-white pb-3 z-10">
          <span class="text-sm font-medium tracking-wide text-neutral-300">
            {{ indiceActual() + 1 }} de {{ imagenes().length }}
          </span>

          <button
            type="button"
            (click)="cerrarModal()"
            class="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition active:scale-95"
            aria-label="Cerrar visor"
          >
            <app-icono nombre="cerrar" clase="w-6 h-6" />
          </button>
        </div>

        <!-- Área Principal de Imagen -->
        <div class="relative w-full max-w-4xl flex-1 flex items-center justify-center overflow-hidden select-none">
          @if (imagenes().length > 1) {
            <button
              type="button"
              (click)="anterior()"
              class="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all active:scale-95 border border-white/20"
              aria-label="Imagen anterior"
            >
              <app-icono nombre="flecha-izquierda" clase="w-6 h-6" />
            </button>
          }

          <img
            [src]="imagenes()[indiceActual()]"
            alt="Detalle del producto"
            class="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 transform"
          />

          @if (imagenes().length > 1) {
            <button
              type="button"
              (click)="siguiente()"
              class="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all active:scale-95 border border-white/20"
              aria-label="Imagen siguiente"
            >
              <app-icono nombre="flecha-derecha" clase="w-6 h-6" />
            </button>
          }
        </div>

        <!-- Carrusel de Miniaturas Inferior -->
        @if (imagenes().length > 1) {
          <div class="flex gap-2 mt-4 p-2 bg-neutral-900/60 rounded-2xl max-w-full overflow-x-auto z-10 scrollbar-none">
            @for (img of imagenes(); track $index) {
              <button
                type="button"
                (click)="seleccionarIndice($index)"
                [class.ring-2]="indiceActual() === $index"
                class="relative w-14 h-14 rounded-xl overflow-hidden ring-primary-500 transition-all opacity-70 hover:opacity-100 flex-shrink-0"
                [class.opacity-100]="indiceActual() === $index"
              >
                <img [src]="img" alt="Miniatura" class="w-full h-full object-cover" />
              </button>
            }
          </div>
        }
      </div>
    }
  `
})
export class GaleriaModalComponent {
  public readonly imagenes = input<string[]>([]);
  public readonly indiceInicial = input<number>(0);
  public readonly abierto = input<boolean>(false);
  public readonly cerrar = output<void>();

  public readonly indiceActual = signal<number>(0);

  constructor() {
    effect(() => {
      this.indiceActual.set(this.indiceInicial());
    });
  }

  public anterior(): void {
    const total = this.imagenes().length;
    if (total <= 1) return;
    this.indiceActual.update(i => (i === 0 ? total - 1 : i - 1));
  }

  public siguiente(): void {
    const total = this.imagenes().length;
    if (total <= 1) return;
    this.indiceActual.update(i => (i === total - 1 ? 0 : i + 1));
  }

  public seleccionarIndice(index: number): void {
    this.indiceActual.set(index);
  }

  public cerrarModal(): void {
    this.cerrar.emit();
  }

  public alHacerClickFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrarModal();
    }
  }
}
