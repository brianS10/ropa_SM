/**
 * Servicio de Gestión de Tema (Oscuro / Claro)
 * ============================================
 * Controla el modo visual de la aplicación y persiste la elección en el navegador.
 */

import { Injectable, signal, effect } from '@angular/core';
import { LLAVE_STORAGE_TEMA } from '../constantes/constantes';

export type ModoTema = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  public readonly temaActual = signal<ModoTema>('light');

  constructor() {
    this.cargarTemaInicial();

    // Reaccionar automáticamente a los cambios de tema
    effect(() => {
      const tema = this.temaActual();
      this.aplicarClaseTema(tema);
    });
  }

  /**
   * Carga el tema guardado o detecta la preferencia del sistema operativo
   */
  private cargarTemaInicial(): void {
    if (typeof window === 'undefined') return;

    const temaGuardado = localStorage.getItem(LLAVE_STORAGE_TEMA) as ModoTema | null;
    if (temaGuardado === 'dark' || temaGuardado === 'light') {
      this.temaActual.set(temaGuardado);
      return;
    }

    // Si el usuario prefiere modo oscuro en su sistema operativo
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.temaActual.set('dark');
    } else {
      this.temaActual.set('light');
    }
  }

  /**
   * Alterna entre modo claro y modo oscuro
   */
  public alternarTema(): void {
    const nuevoTema: ModoTema = this.temaActual() === 'dark' ? 'light' : 'dark';
    this.temaActual.set(nuevoTema);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LLAVE_STORAGE_TEMA, nuevoTema);
    }
  }

  /**
   * Aplica o retira la clase CSS 'dark' en el elemento raíz <html>
   */
  private aplicarClaseTema(tema: ModoTema): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (tema === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
