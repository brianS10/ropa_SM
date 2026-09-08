/**
 * Servicio de Autenticación de Administrador
 * ==========================================
 * Maneja el acceso seguro mediante PIN numérico para el panel de administración.
 */

import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LLAVE_STORAGE_PIN_ADMIN } from '../constantes/constantes';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  /**
   * Señal reactiva que indica si el administrador tiene sesión activa
   */
  public readonly estaAutenticado = signal<boolean>(false);

  constructor() {
    this.verificarSesionInicial();
  }

  /**
   * Comprueba si existe una sesión previa guardada en el navegador
   */
  private verificarSesionInicial(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sesion = sessionStorage.getItem(LLAVE_STORAGE_PIN_ADMIN);
      if (sesion === 'true') {
        this.estaAutenticado.set(true);
      }
    }
  }

  /**
   * Valida el PIN ingresado contra el PIN configurado en el sistema
   */
  public iniciarSesionConPin(pinIngresado: string): boolean {
    const pinCorrecto = environment.adminPin || '1234';
    if (pinIngresado.trim() === pinCorrecto.trim()) {
      this.estaAutenticado.set(true);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(LLAVE_STORAGE_PIN_ADMIN, 'true');
      }
      return true;
    }
    return false;
  }

  /**
   * Cierra la sesión activa del administrador
   */
  public cerrarSesion(): void {
    this.estaAutenticado.set(false);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(LLAVE_STORAGE_PIN_ADMIN);
    }
  }
}
