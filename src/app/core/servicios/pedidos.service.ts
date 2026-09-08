/**
 * Servicio de Gestión de Pedidos de Clientes
 * ==========================================
 * Permite recibir pedidos generados desde el catálogo público o tienda,
 * actualizar sus estados (Pendiente, Confirmado, Entregado, Cancelado)
 * y notificar badges de pendientes.
 *
 * Incluye respaldo local para funcionar sin conexión o en modo demo.
 */

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Pedido, ItemCarrito, EstadoPedido } from '../modelos/producto.model';

const LLAVE_PEDIDOS_LOCAL = 'sistema_ropa_pedidos_local';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private readonly supabase = inject(SupabaseService);

  /**
   * Conteo reactivo de pedidos pendientes para mostrar en el badge de la barra
   */
  public readonly pedidosPendientesCount = signal<number>(0);

  constructor() {
    this.actualizarConteoPendientes();
  }

  /**
   * Consulta el número actual de pedidos con estado 'pendiente'
   */
  public async actualizarConteoPendientes(): Promise<number> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { count, error } = await this.supabase
          .desde('pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'pendiente');

        if (!error && typeof count === 'number') {
          this.pedidosPendientesCount.set(count);
          return count;
        }
      } catch {
        // Ignorar error si la tabla aún no existe o hay problemas de red
      }
    }

    const locales = this.cargarPedidosLocales();
    const pendientes = locales.filter(p => p.estado === 'pendiente').length;
    this.pedidosPendientesCount.set(pendientes);
    return pendientes;
  }

  /**
   * Registra un nuevo pedido recibido desde la tienda web
   */
  public async crearPedido(
    datosCliente: {
      nombre_cliente: string;
      telefono: string;
      notas?: string;
      total: number;
    },
    articulos: ItemCarrito[]
  ): Promise<Pedido> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data: pedidoCreado, error: errorPedido } = await this.supabase
          .desde('pedidos')
          .insert([{
            nombre_cliente: datosCliente.nombre_cliente,
            telefono: datosCliente.telefono,
            notas: datosCliente.notas || null,
            total: datosCliente.total,
            estado: 'pendiente',
            fecha_pedido: new Date().toISOString()
          }])
          .select()
          .single();

        if (!errorPedido && pedidoCreado) {
          if (articulos && articulos.length > 0) {
            const detalles = articulos.map(item => ({
              pedido_id: pedidoCreado.id,
              variante_id: item.variante_id,
              cantidad: item.cantidad,
              precio_unitario: item.precio_venta,
              subtotal: item.precio_venta * item.cantidad
            }));

            await this.supabase.desde('detalle_pedido').insert(detalles);
          }
          this.pedidosPendientesCount.update(c => c + 1);
          return pedidoCreado as Pedido;
        }
      } catch (err) {
        console.warn('Fallo al guardar pedido en Supabase, registrando localmente:', err);
      }
    }

    // Registro local de respaldo
    const nuevoPedido: Pedido = {
      id: 'ped-' + Date.now(),
      nombre_cliente: datosCliente.nombre_cliente,
      telefono: datosCliente.telefono,
      notas: datosCliente.notas || '',
      total: datosCliente.total,
      estado: 'pendiente',
      fecha_pedido: new Date().toISOString(),
      creado_en: new Date().toISOString(),
      detalle_pedido: articulos.map((art, idx) => ({
        id: `det-ped-${Date.now()}-${idx}`,
        pedido_id: 'ped-' + Date.now(),
        variante_id: art.variante_id,
        cantidad: art.cantidad,
        precio_unitario: art.precio_venta,
        subtotal: art.precio_venta * art.cantidad,
        variantes_producto: {
          talla: art.talla,
          color: art.color,
          productos: {
            nombre: art.nombre_producto,
            imagen_url: art.imagen_url
          }
        }
      }))
    };

    const lista = this.cargarPedidosLocales();
    lista.unshift(nuevoPedido);
    this.guardarPedidosLocales(lista);
    this.pedidosPendientesCount.update(c => c + 1);

    return nuevoPedido;
  }

  /**
   * Obtiene todos los pedidos registrados
   */
  public async obtenerPedidos(): Promise<Pedido[]> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data, error } = await this.supabase
          .desde('pedidos')
          .select(`
            *,
            detalle_pedido (
              id,
              pedido_id,
              variante_id,
              cantidad,
              precio_unitario,
              subtotal,
              variantes_producto (
                talla,
                color,
                productos (
                  nombre,
                  imagen_url
                )
              )
            )
          `)
          .order('creado_en', { ascending: false });

        if (!error && data) {
          return data as unknown as Pedido[];
        }
      } catch (err) {
        console.warn('Error al obtener pedidos de Supabase, consultando localmente:', err);
      }
    }

    return this.cargarPedidosLocales();
  }

  /**
   * Actualiza el estado de un pedido (pendiente, confirmado, entregado, cancelado)
   */
  public async actualizarEstado(id: string, nuevoEstado: EstadoPedido): Promise<void> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { error } = await this.supabase
          .desde('pedidos')
          .update({ estado: nuevoEstado })
          .eq('id', id);

        if (!error) {
          await this.actualizarConteoPendientes();
          return;
        }
      } catch (err) {
        console.warn('Error al actualizar estado en Supabase, actualizando localmente:', err);
      }
    }

    const lista = this.cargarPedidosLocales();
    const pedido = lista.find(p => p.id === id);
    if (pedido) {
      pedido.estado = nuevoEstado;
      this.guardarPedidosLocales(lista);
    }
    await this.actualizarConteoPendientes();
  }

  private cargarPedidosLocales(): Pedido[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LLAVE_PEDIDOS_LOCAL);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private guardarPedidosLocales(pedidos: Pedido[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LLAVE_PEDIDOS_LOCAL, JSON.stringify(pedidos));
  }
}
