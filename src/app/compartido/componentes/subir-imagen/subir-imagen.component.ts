/**
 * Componente Subidor de Imágenes
 * ==============================
 * Permite seleccionar o arrastrar una fotografía, la sube al bucket de Supabase
 * y muestra la vista previa con opción de eliminar.
 */

import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../../core/servicios/inventario.service';
import { IconoComponent } from '../icono/icono.component';

@Component({
  selector: 'app-subir-imagen',
  standalone: true,
  imports: [CommonModule, IconoComponent],
  template: `
    <div class="w-full">
      @if (url()) {
        <!-- Vista previa de la imagen cargada -->
        <div class="relative w-full h-56 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 group">
          <img
            [src]="url()"
            alt="Vista previa del producto"
            class="w-full h-full object-contain"
          />

          <!-- Botón para quitar la foto -->
          <button
            (click)="eliminarImagen()"
            type="button"
            class="absolute top-3 right-3 p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition active:scale-95"
            title="Quitar imagen"
          >
            <app-icono nombre="eliminar" clase="w-5 h-5" />
          </button>
        </div>
      } @else {
        <!-- Zona de carga de archivo -->
        <label
          class="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors p-6 text-center"
        >
          <div class="flex flex-col items-center justify-center">
            @if (subiendo()) {
              <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-3 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                Subiendo fotografía a la nube...
              </p>
            } @else {
              <div class="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 mb-2">
                <app-icono nombre="camara" clase="w-8 h-8" />
              </div>
              <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Toca aquí para seleccionar una foto
              </p>
              <p class="text-xs text-neutral-400 mt-1">
                PNG, JPG o WEBP (máx. 5MB)
              </p>
            }
          </div>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            [disabled]="subiendo()"
            (change)="alSeleccionarArchivo($event)"
          />
        </label>
      }

      @if (mensajeError()) {
        <p class="mt-2 text-xs text-rose-500 font-medium">
          {{ mensajeError() }}
        </p>
      }
    </div>
  `
})
export class SubirImagenComponent {
  private readonly inventarioService = inject(InventarioService);

  public readonly url = input<string | undefined>();
  public readonly imagenSubida = output<string>();
  public readonly imagenEliminada = output<void>();

  public readonly subiendo = signal<boolean>(false);
  public readonly mensajeError = signal<string | null>(null);

  public async alSeleccionarArchivo(evento: Event): Promise<void> {
    const inputEl = evento.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const archivo = inputEl.files[0];

    // Validación básica
    if (!archivo.type.startsWith('image/')) {
      this.mensajeError.set('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.mensajeError.set('La imagen es demasiado pesada. El límite es de 5MB.');
      return;
    }

    this.mensajeError.set(null);
    this.subiendo.set(true);

    try {
      const urlPublica = await this.inventarioService.subirImagen(archivo);
      this.imagenSubida.emit(urlPublica);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      this.mensajeError.set(`No se pudo subir la imagen: ${errorMsg}`);
    } finally {
      this.subiendo.set(false);
      inputEl.value = '';
    }
  }

  public eliminarImagen(): void {
    this.imagenEliminada.emit();
  }
}
