/**
 * Componente Animación de Confeti de Celebración
 * ===============================================
 * Muestra confeti animado sobre la pantalla tras una venta o pedido exitoso.
 */

import { Component, input, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particula {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}

@Component({
  selector: 'app-confeti',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (activo()) {
      <canvas #lienzo class="fixed inset-0 pointer-events-none z-50 w-full h-full"></canvas>
    }
  `
})
export class ConfetiComponent {
  public readonly activo = input<boolean>(false);
  private readonly lienzoRef = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');

  private animacionId: number | null = null;
  private particulas: Particula[] = [];
  private colores = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  constructor() {
    effect(() => {
      if (this.activo()) {
        setTimeout(() => this.iniciar(), 50);
      } else {
        this.detener();
      }
    });
  }

  private iniciar(): void {
    const canvas = this.lienzoRef()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.particulas = [];
    for (let i = 0; i < 90; i++) {
      this.particulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 50 + 10,
        color: this.colores[Math.floor(Math.random() * this.colores.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
      });
    }

    let fotogramas = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < this.particulas.length; i++) {
        const p = this.particulas[i];
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      }

      fotogramas++;
      if (fotogramas < 200) {
        this.animacionId = requestAnimationFrame(render);
      } else {
        this.detener();
      }
    };

    this.animacionId = requestAnimationFrame(render);
  }

  private detener(): void {
    if (this.animacionId) {
      cancelAnimationFrame(this.animacionId);
      this.animacionId = null;
    }
  }
}
