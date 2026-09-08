/**
 * Animación Voladora al Carrito
 * ==============================
 * Crea una miniatura o esfera que vuela desde el botón "Agregar" hacia
 * el icono del carrito en la barra de navegación.
 */

import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoClienteService } from '../../../core/servicios/carrito-cliente.service';

interface ParticulaVoladora {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  urlImagen?: string;
}

@Component({
  selector: 'app-animacion-carrito',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (p of particulas(); track p.id) {
      <div
        class="fixed z-50 pointer-events-none w-10 h-10 rounded-full overflow-hidden shadow-xl border-2 border-primary-500 bg-white animate-fly-to-cart"
        [style.left.px]="p.startX"
        [style.top.px]="p.startY"
        [style.--target-x]="p.targetX + 'px'"
        [style.--target-y]="p.targetY + 'px'"
      >
        @if (p.urlImagen) {
          <img [src]="p.urlImagen" alt="Producto" class="w-full h-full object-cover" />
        } @else {
          <div class="w-full h-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
            +1
          </div>
        }
      </div>
    }
  `,
  styles: [`
    @keyframes flyToCart {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      80% {
        transform: translate(calc(var(--target-x) - 100%), calc(var(--target-y) - 100%)) scale(0.6);
        opacity: 0.9;
      }
      100% {
        transform: translate(calc(var(--target-x) - 100%), calc(var(--target-y) - 100%)) scale(0.2);
        opacity: 0;
      }
    }

    .animate-fly-to-cart {
      animation: flyToCart 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
  `]
})
export class AnimacionCarritoComponent {
  private readonly carritoService = inject(CarritoClienteService);
  public readonly particulas = signal<ParticulaVoladora[]>([]);

  constructor() {
    effect(() => {
      const evento = this.carritoService.ultimoElementoAnimado();
      if (evento) {
        this.dispararVuelo(evento.x, evento.y, evento.urlImagen);
      }
    });
  }

  private dispararVuelo(x: number, y: number, url?: string): void {
    const nuevoId = Date.now();
    // Destino aproximado: esquina inferior derecha o centro de la barra inferior
    const targetX = window.innerWidth > 768 ? window.innerWidth - 80 : window.innerWidth / 2;
    const targetY = window.innerHeight - 30;

    const nuevaParticula: ParticulaVoladora = {
      id: nuevoId,
      startX: x - 20,
      startY: y - 20,
      targetX,
      targetY,
      urlImagen: url
    };

    this.particulas.update(p => [...p, nuevaParticula]);

    setTimeout(() => {
      this.particulas.update(p => p.filter(item => item.id !== nuevoId));
    }, 750);
  }
}
