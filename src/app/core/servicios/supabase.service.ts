/**
 * Servicio de Conexión a Supabase
 * =================================
 * Proporciona el cliente único de Supabase para consultas a la base de datos
 * y subida de archivos al storage, con manejo seguro de locks y verificación de conexión.
 */

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public readonly cliente: SupabaseClient;

  constructor() {
    this.cliente = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          // Evitar NavigatorLockAcquireTimeoutError en localhost / navegadores
          lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn();
          }
        }
      }
    );
  }

  /**
   * Verifica si las credenciales de Supabase están configuradas con valores reales
   */
  public estaConfigurado(): boolean {
    return (
      !!environment.supabaseUrl &&
      !!environment.supabaseAnonKey &&
      !environment.supabaseUrl.includes('tu-proyecto') &&
      environment.supabaseAnonKey !== 'AQUI_VA_TU_CLAVE_ANONIMA'
    );
  }

  /**
   * Atajo para consultar una tabla
   */
  public desde(tabla: string) {
    return this.cliente.from(tabla);
  }

  /**
   * Atajo para el almacenamiento de archivos
   */
  public get almacenamiento() {
    return this.cliente.storage;
  }
}
