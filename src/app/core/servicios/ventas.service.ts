/**
 * Servicio de Ventas y Corte de Caja
 * ===================================
 * Registra cobros en punto de venta, descuenta stock de inventario,
 * consulta historial de tickets y calcula resúmenes financieros.
 *
 * Incluye almacenamiento local de respaldo para operar incluso sin conexión.
 */

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { InventarioService } from './inventario.service';
import { Venta, ItemCarrito, ResumenCorteCaja, MetodoPagoId } from '../modelos/producto.model';
import dayjs from 'dayjs';

const LLAVE_VENTAS_LOCAL = 'sistema_ropa_ventas_local';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly supabase = inject(SupabaseService);
  private readonly inventarioService = inject(InventarioService);

  /**
   * Registra una venta completa, sus detalles y descuenta el stock
   */
  public async registrarVenta(
    datosVenta: {
      total_venta: number;
      metodo_pago: MetodoPagoId;
      notas?: string;
    },
    articulos: ItemCarrito[]
  ): Promise<Venta> {
    if (!articulos || articulos.length === 0) {
      throw new Error('No hay productos en la venta');
    }

    if (this.supabase.estaConfigurado()) {
      try {
        // 1. Insertar el encabezado de la venta
        const { data: ventaCreada, error: errorVenta } = await this.supabase
          .desde('ventas')
          .insert([{
            total_venta: datosVenta.total_venta,
            metodo_pago: datosVenta.metodo_pago,
            notas: datosVenta.notas || null,
            fecha_venta: new Date().toISOString()
          }])
          .select()
          .single();

        if (errorVenta) throw errorVenta;

        // 2. Insertar cada renglón en detalle_venta
        const detalles = articulos.map(item => ({
          venta_id: ventaCreada.id,
          variante_id: item.variante_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: item.precio_venta * item.cantidad
        }));

        const { error: errorDetalles } = await this.supabase
          .desde('detalle_venta')
          .insert(detalles);

        if (errorDetalles) throw errorDetalles;

        // 3. Descontar stock de cada variante vendida
        for (const item of articulos) {
          const { data: variante } = await this.supabase
            .desde('variantes_producto')
            .select('stock_actual')
            .eq('id', item.variante_id)
            .single();

          if (variante) {
            const stockRestante = Math.max(0, (variante.stock_actual || 0) - item.cantidad);
            await this.supabase
              .desde('variantes_producto')
              .update({ stock_actual: stockRestante })
              .eq('id', item.variante_id);
          }
        }

        return ventaCreada as Venta;
      } catch (err) {
        console.warn('Fallo al registrar venta en Supabase, registrando localmente:', err);
      }
    }

    // Registro local de respaldo
    const nuevaVenta: Venta = {
      id: 'vnt-' + Date.now(),
      total_venta: datosVenta.total_venta,
      metodo_pago: datosVenta.metodo_pago,
      notas: datosVenta.notas || '',
      fecha_venta: new Date().toISOString(),
      detalle_venta: articulos.map((art, idx) => ({
        id: `det-${Date.now()}-${idx}`,
        venta_id: 'vnt-' + Date.now(),
        variante_id: art.variante_id,
        cantidad: art.cantidad,
        precio_unitario: art.precio_venta,
        subtotal: art.precio_venta * art.cantidad,
        variantes_producto: {
          talla: art.talla,
          color: art.color,
          productos: {
            nombre: art.nombre_producto
          }
        }
      }))
    };

    // Descontar stock local
    for (const item of articulos) {
      await this.inventarioService.reabastecerVariante(item.variante_id, -item.cantidad);
    }

    const ventas = this.cargarVentasLocales();
    ventas.unshift(nuevaVenta);
    this.guardarVentasLocales(ventas);

    return nuevaVenta;
  }

  /**
   * Obtiene el listado de ventas ordenadas de la más reciente a la más antigua
   */
  public async obtenerVentas(limite: number = 50): Promise<Venta[]> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data, error } = await this.supabase
          .desde('ventas')
          .select(`
            *,
            detalle_venta (
              id,
              venta_id,
              variante_id,
              cantidad,
              precio_unitario,
              subtotal,
              variantes_producto (
                talla,
                color,
                productos (
                  nombre
                )
              )
            )
          `)
          .order('fecha_venta', { ascending: false })
          .limit(limite);

        if (!error && data) {
          return data as unknown as Venta[];
        }
      } catch (err) {
        console.warn('Error al obtener ventas de Supabase, consultando local:', err);
      }
    }

    return this.cargarVentasLocales().slice(0, limite);
  }

  /**
   * Obtiene los detalles de una venta en particular
   */
  public async obtenerVentaPorId(id: string): Promise<Venta | null> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data, error } = await this.supabase
          .desde('ventas')
          .select(`
            *,
            detalle_venta (
              id,
              venta_id,
              variante_id,
              cantidad,
              precio_unitario,
              subtotal,
              variantes_producto (
                talla,
                color,
                productos (
                  nombre
                )
              )
            )
          `)
          .eq('id', id)
          .single();

        if (!error && data) {
          return data as unknown as Venta;
        }
      } catch (err) {
        console.warn('Error al obtener venta de Supabase:', err);
      }
    }

    const ventas = this.cargarVentasLocales();
    return ventas.find(v => v.id === id) || null;
  }

  /**
   * Calcula el corte de caja para una fecha específica (por defecto: hoy)
   */
  public async obtenerCorteCaja(fechaStr?: string): Promise<ResumenCorteCaja> {
    const baseFecha = fechaStr ? dayjs(fechaStr) : dayjs();
    const inicioDia = baseFecha.startOf('day');
    const finDia = baseFecha.endOf('day');

    if (this.supabase.estaConfigurado()) {
      try {
        const { data, error } = await this.supabase
          .desde('ventas')
          .select('total_venta, metodo_pago, fecha_venta')
          .gte('fecha_venta', inicioDia.toISOString())
          .lte('fecha_venta', finDia.toISOString());

        if (!error && data) {
          return this.calcularResumenDesdeLista(data);
        }
      } catch (err) {
        console.warn('Error al obtener corte de Supabase, calculando local:', err);
      }
    }

    const ventasLocales = this.cargarVentasLocales().filter(v => {
      const f = dayjs(v.fecha_venta);
      return f.isAfter(inicioDia) && f.isBefore(finDia);
    });

    return this.calcularResumenDesdeLista(ventasLocales);
  }

  private calcularResumenDesdeLista(ventas: any[]): ResumenCorteCaja {
    let totalGeneral = 0;
    const porMetodo = { efectivo: 0, transferencia: 0, tarjeta: 0 };

    for (const v of ventas) {
      const monto = Number(v.total_venta) || 0;
      totalGeneral += monto;

      const metodo = v.metodo_pago as MetodoPagoId;
      if (metodo && porMetodo[metodo] !== undefined) {
        porMetodo[metodo] += monto;
      }
    }

    return {
      totalGeneral,
      cantidadVentas: ventas.length,
      porMetodo
    };
  }

  private cargarVentasLocales(): Venta[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LLAVE_VENTAS_LOCAL);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private guardarVentasLocales(ventas: Venta[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LLAVE_VENTAS_LOCAL, JSON.stringify(ventas));
  }
}
