/**
 * Guardián de Ruta para Administrador
 * ====================================
 * Protege las vistas del panel de control. Si no hay sesión iniciada con PIN,
 * redirige al usuario a la pantalla de acceso (/admin).
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  return router.parseUrl('/admin');
};
