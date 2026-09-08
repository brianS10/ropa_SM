/**
 * Servicio de Inventario y Productos
 * ==================================
 * Administra el catálogo de productos, variantes de tallas/colores,
 * stock y carga de imágenes a Supabase Storage.
 *
 * Incluye respaldo local con datos de prueba si Supabase aún no está
 * configurado o si la conexión no está disponible.
 */

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Producto, VarianteProducto, TipoProducto } from '../modelos/producto.model';
import { PRODUCTOS_DEMO } from '../constantes/productos-demo';

export interface FiltrosCatalogo {
  busqueda?: string;
  categoria?: string;
  tipo?: TipoProducto | 'todos';
  soloConStock?: boolean;
}

const LLAVE_PRODUCTOS_LOCAL = 'sistema_ropa_productos_demo';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private readonly supabase = inject(SupabaseService);

  /**
   * Obtiene la lista completa de productos con sus variantes
   */
  public async obtenerProductos(filtros?: FiltrosCatalogo): Promise<Producto[]> {
    if (this.supabase.estaConfigurado()) {
      try {
        let consulta = this.supabase.desde('productos').select(`
          *,
          variantes_producto (
            id,
            producto_id,
            talla,
            color,
            precio_venta,
            precio_costo,
            stock_actual,
            stock_minimo,
            codigo_barras,
            creado_en
          )
        `).order('creado_en', { ascending: false });

        if (filtros?.tipo && filtros.tipo !== 'todos') {
          consulta = consulta.eq('tipo_producto', filtros.tipo);
        }

        if (filtros?.categoria && filtros.categoria !== 'todas') {
          consulta = consulta.eq('categoria', filtros.categoria);
        }

        if (filtros?.busqueda && filtros.busqueda.trim() !== '') {
          consulta = consulta.ilike('nombre', `%${filtros.busqueda.trim()}%`);
        }

        const { data, error } = await consulta;
        if (!error && data) {
          let productos = data as unknown as Producto[];
          if (filtros?.soloConStock) {
            productos = productos.filter(p =>
              p.variantes_producto && p.variantes_producto.some(v => v.stock_actual > 0)
            );
          }
          return productos;
        }
        console.warn('Supabase no devolvió datos, usando catálogo de demostración:', error?.message);
      } catch (err) {
        console.warn('Error de conexión con Supabase. Usando catálogo de demostración:', err);
      }
    }

    // Respaldo local con productos de demostración
    return this.filtrarProductosLocales(filtros);
  }

  /**
   * Obtiene un producto individual por su ID
   */
  public async obtenerProductoPorId(id: string): Promise<Producto | null> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data, error } = await this.supabase
          .desde('productos')
          .select(`
            *,
            variantes_producto (
              id,
              producto_id,
              talla,
              color,
              precio_venta,
              precio_costo,
              stock_actual,
              stock_minimo,
              codigo_barras
            )
          `)
          .eq('id', id)
          .single();

        if (!error && data) {
          return data as unknown as Producto;
        }
      } catch (err) {
        console.warn('Error al consultar producto en Supabase, buscando en local:', err);
      }
    }

    const productos = this.cargarProductosLocales();
    return productos.find(p => p.id === id) || null;
  }

  /**
   * Registra un nuevo producto junto con sus variantes
   */
  public async crearProducto(
    datosProducto: Omit<Producto, 'id' | 'variantes_producto'>,
    variantes: Omit<VarianteProducto, 'id' | 'producto_id'>[]
  ): Promise<Producto> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data: productoGuardado, error: errorProducto } = await this.supabase
          .desde('productos')
          .insert([datosProducto])
          .select()
          .single();

        if (errorProducto) throw errorProducto;

        if (variantes.length > 0) {
          const variantesConId = variantes.map(v => ({
            ...v,
            producto_id: productoGuardado.id
          }));

          const { error: errorVariantes } = await this.supabase
            .desde('variantes_producto')
            .insert(variantesConId);

          if (errorVariantes) throw errorVariantes;
        }

        return productoGuardado as Producto;
      } catch (err) {
        console.warn('Fallo al guardar en Supabase, guardando localmente:', err);
      }
    }

    // Guardado local de respaldo
    const nuevoId = 'local-' + Date.now();
    const variantesConId: VarianteProducto[] = variantes.map((v, i) => ({
      ...v,
      id: `${nuevoId}-v${i}`,
      producto_id: nuevoId
    }));

    const nuevoProducto: Producto = {
      ...datosProducto,
      id: nuevoId,
      creado_en: new Date().toISOString(),
      variantes_producto: variantesConId
    };

    const lista = this.cargarProductosLocales();
    lista.unshift(nuevoProducto);
    this.guardarProductosLocales(lista);
    return nuevoProducto;
  }

  /**
   * Actualiza los datos de un producto y sus variantes
   */
  public async actualizarProducto(
    id: string,
    datosProducto: Partial<Producto>,
    variantes?: Partial<VarianteProducto>[]
  ): Promise<void> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { error: errorProd } = await this.supabase
          .desde('productos')
          .update(datosProducto)
          .eq('id', id);

        if (errorProd) throw errorProd;

        if (variantes && variantes.length > 0) {
          for (const variante of variantes) {
            if (variante.id) {
              await this.supabase
                .desde('variantes_producto')
                .update(variante)
                .eq('id', variante.id);
            } else {
              await this.supabase
                .desde('variantes_producto')
                .insert([{ ...variante, producto_id: id }]);
            }
          }
        }
        return;
      } catch (err) {
        console.warn('Fallo al actualizar en Supabase, actualizando localmente:', err);
      }
    }

    // Actualización local
    const lista = this.cargarProductosLocales();
    const index = lista.findIndex(p => p.id === id);
    if (index !== -1) {
      lista[index] = { ...lista[index], ...datosProducto };
      if (variantes) {
        lista[index].variantes_producto = variantes as VarianteProducto[];
      }
      this.guardarProductosLocales(lista);
    }
  }

  /**
   * Reabastece el stock de una variante específica
   */
  public async reabastecerVariante(varianteId: string, cantidadAgregar: number): Promise<void> {
    if (this.supabase.estaConfigurado()) {
      try {
        const { data: variante, error: errConsulta } = await this.supabase
          .desde('variantes_producto')
          .select('stock_actual')
          .eq('id', varianteId)
          .single();

        if (!errConsulta && variante) {
          const nuevoStock = (variante.stock_actual || 0) + cantidadAgregar;
          await this.supabase
            .desde('variantes_producto')
            .update({ stock_actual: nuevoStock })
            .eq('id', varianteId);
          return;
        }
      } catch (err) {
        console.warn('Error al reabastecer en Supabase, reabasteciendo localmente:', err);
      }
    }

    // Reabastecimiento local
    const lista = this.cargarProductosLocales();
    for (const prod of lista) {
      const v = prod.variantes_producto?.find(item => item.id === varianteId);
      if (v) {
        v.stock_actual = (v.stock_actual || 0) + cantidadAgregar;
        break;
      }
    }
    this.guardarProductosLocales(lista);
  }

  /**
   * Elimina un producto y sus variantes
   */
  public async eliminarProducto(id: string): Promise<void> {
    if (this.supabase.estaConfigurado()) {
      try {
        await this.supabase.desde('variantes_producto').delete().eq('producto_id', id);
        await this.supabase.desde('productos').delete().eq('id', id);
        return;
      } catch (err) {
        console.warn('Error al eliminar en Supabase, eliminando localmente:', err);
      }
    }

    // Eliminación local
    let lista = this.cargarProductosLocales();
    lista = lista.filter(p => p.id !== id);
    this.guardarProductosLocales(lista);
  }

  /**
   * Sube una imagen al bucket de Supabase Storage y retorna la URL pública
   */
  public async subirImagen(archivo: File): Promise<string> {
    if (!this.supabase.estaConfigurado()) {
      // Si no hay Supabase configurado, creamos una URL temporal local para pruebas
      return URL.createObjectURL(archivo);
    }

    const extension = archivo.name.split('.').pop();
    const nombreUnico = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const ruta = `productos/${nombreUnico}`;

    const { error } = await this.supabase.almacenamiento
      .from('imagenes')
      .upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error al subir imagen:', error.message);
      throw error;
    }

    const { data: urlData } = this.supabase.almacenamiento
      .from('imagenes')
      .getPublicUrl(ruta);

    return urlData.publicUrl;
  }

  // ==========================================
  // Métodos auxiliares para almacenamiento local
  // ==========================================

  private cargarProductosLocales(): Producto[] {
    if (typeof window === 'undefined') return [...PRODUCTOS_DEMO];
    const guardados = localStorage.getItem(LLAVE_PRODUCTOS_LOCAL);
    if (guardados) {
      try {
        return JSON.parse(guardados);
      } catch {
        // Formato inválido, restaurar demo
      }
    }
    localStorage.setItem(LLAVE_PRODUCTOS_LOCAL, JSON.stringify(PRODUCTOS_DEMO));
    return [...PRODUCTOS_DEMO];
  }

  private guardarProductosLocales(productos: Producto[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LLAVE_PRODUCTOS_LOCAL, JSON.stringify(productos));
  }

  private filtrarProductosLocales(filtros?: FiltrosCatalogo): Producto[] {
    let prods = this.cargarProductosLocales();

    if (filtros?.tipo && filtros.tipo !== 'todos') {
      prods = prods.filter(p => p.tipo_producto === filtros.tipo);
    }

    if (filtros?.categoria && filtros.categoria !== 'todas') {
      prods = prods.filter(p => p.categoria?.toLowerCase() === filtros.categoria?.toLowerCase());
    }

    if (filtros?.busqueda && filtros.busqueda.trim() !== '') {
      const q = filtros.busqueda.toLowerCase().trim();
      prods = prods.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    }

    if (filtros?.soloConStock) {
      prods = prods.filter(p =>
        p.variantes_producto && p.variantes_producto.some(v => v.stock_actual > 0)
      );
    }

    return prods;
  }
}
