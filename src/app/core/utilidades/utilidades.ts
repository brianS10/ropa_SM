/**
 * Funciones de Utilidad
 * =====================
 * Métodos auxiliares para formateo de números, fechas, textos y enlaces de WhatsApp.
 */

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('es');
dayjs.extend(relativeTime);

/**
 * Formatea un número como moneda en pesos mexicanos (MXN)
 * @example formatearMoneda(250) => "$250.00"
 */
export function formatearMoneda(cantidad: number | null | undefined): string {
  if (cantidad === null || cantidad === undefined || isNaN(cantidad)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(cantidad);
}

/**
 * Formatea una fecha en formato legible
 * @example formatearFecha('2026-09-08') => "8 de septiembre de 2026"
 */
export function formatearFecha(fecha: string | Date | undefined): string {
  if (!fecha) return 'Fecha no disponible';
  return dayjs(fecha).format('D [de] MMMM [de] YYYY, h:mm A');
}

/**
 * Formatea una fecha corta
 * @example formatearFechaCorta('2026-09-08') => "08/09/2026"
 */
export function formatearFechaCorta(fecha: string | Date | undefined): string {
  if (!fecha) return '';
  return dayjs(fecha).format('DD/MM/YYYY');
}

/**
 * Obtiene el tiempo transcurrido de forma relativa ("hace 5 minutos")
 */
export function tiempoRelativo(fecha: string | Date | undefined): string {
  if (!fecha) return '';
  return dayjs(fecha).fromNow();
}

/**
 * Determina el estado del stock según la cantidad disponible
 */
export function obtenerEstadoStock(stock: number, minimo: number = 2): {
  etiqueta: string;
  claseBadge: string;
  agotado: boolean;
  esBajo: boolean;
} {
  if (stock <= 0) {
    return {
      etiqueta: 'Agotado',
      claseBadge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
      agotado: true,
      esBajo: false
    };
  }

  if (stock <= minimo) {
    return {
      etiqueta: `Últimas ${stock} pzas`,
      claseBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
      agotado: false,
      esBajo: true
    };
  }

  return {
    etiqueta: `${stock} en stock`,
    claseBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
    agotado: false,
    esBajo: false
  };
}

/**
 * Construye el enlace de WhatsApp para enviar un pedido
 */
export function crearEnlaceWhatsApp(telefono: string, mensaje: string): string {
  const numeroLimpio = telefono.replace(/\D/g, '');
  const textoCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numeroLimpio}?text=${textoCodificado}`;
}
