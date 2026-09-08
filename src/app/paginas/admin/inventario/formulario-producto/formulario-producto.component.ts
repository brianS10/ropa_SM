/**
 * Formulario de Creación y Edición de Producto
 * ============================================
 * Permite capturar los datos principales, subir la fotografía y configurar
 * las variantes de tallas, colores, precios y stock.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../../core/servicios/inventario.service';
import { Producto, VarianteProducto, TipoProducto } from '../../../../core/modelos/producto.model';
import { TIPOS_PRODUCTO, CATEGORIAS_POR_TIPO, TALLAS_COMUNES, TALLAS_PANTALON } from '../../../../core/constantes/constantes';
import { SubirImagenComponent } from '../../../../compartido/componentes/subir-imagen/subir-imagen.component';
import { IconoComponent } from '../../../../compartido/componentes/icono/icono.component';

interface FilaVariante {
  id?: string;
  talla: string;
  color: string;
  precio_venta: number;
  precio_costo: number;
  stock_actual: number;
  stock_minimo: number;
}

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SubirImagenComponent, IconoComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <!-- Encabezado con Botón Regresar -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/inventario" class="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <app-icono nombre="flecha-izquierda" clase="w-5 h-5" />
          </a>
          <div>
            <h1 class="text-xl font-black text-neutral-900 dark:text-white">
              {{ esEdicion() ? 'Editar Producto' : 'Nuevo Producto' }}
            </h1>
            <p class="text-xs text-neutral-500">
              {{ esEdicion() ? 'Actualiza los datos y existencias del producto' : 'Completa la información para publicarlo en catálogo' }}
            </p>
          </div>
        </div>

        <button
          (click)="guardar()"
          [disabled]="guardando()"
          type="button"
          class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-primary-600/20 active:scale-95 transition"
        >
          @if (guardando()) {
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Guardando...</span>
          } @else {
            <app-icono nombre="check" clase="w-4 h-4" />
            <span>Guardar</span>
          }
        </button>
      </div>

      <!-- Tarjeta 1: Información General y Fotografía -->
      <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <h2 class="font-bold text-sm text-neutral-900 dark:text-white pb-2 border-b border-neutral-100 dark:border-neutral-800">
          Información Básica
        </h2>

        <!-- Fotografía -->
        <div>
          <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Fotografía del Producto
          </label>
          <app-subir-imagen
            [url]="imagenUrl"
            (imagenSubida)="alSubirImagen($event)"
            (imagenEliminada)="imagenUrl = ''"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Nombre -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              [(ngModel)]="nombre"
              placeholder="Ej. Playera Oversize Negra, Perfume Sauvage..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <!-- Tipo de Producto -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Tipo de Artículo
            </label>
            <select
              [(ngModel)]="tipoProducto"
              (ngModelChange)="alCambiarTipo()"
              class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              @for (t of tipos; track t.id) {
                <option [value]="t.id">{{ t.nombre }}</option>
              }
            </select>
          </div>

          <!-- Categoría -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Categoría
            </label>
            <select
              [(ngModel)]="categoria"
              class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              @for (c of categoriasOpciones(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>
          </div>

          <!-- Descuento -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Descuento (% opcional)
            </label>
            <input
              type="number"
              [(ngModel)]="descuento"
              placeholder="Ej. 10 para 10%"
              min="0"
              max="100"
              class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <!-- Descripción -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Descripción o detalles
            </label>
            <textarea
              [(ngModel)]="descripcion"
              rows="2"
              placeholder="Material, notas olfativas, edad recomendada o detalles adicionales..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Tarjeta 2: Tallas, Precios y Stock (Variantes) -->
      <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800 gap-2">
          <div>
            <h2 class="font-bold text-sm text-neutral-900 dark:text-white">
              Tallas y Existencias
            </h2>
            <p class="text-xs text-neutral-400">Define los precios y stock para cada talla o color</p>
          </div>

          <!-- Generadores Rápidos de Tallas -->
          <div class="flex flex-wrap gap-1.5">
            <button
              (click)="generarTallas(['S', 'M', 'L', 'XL'])"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold transition"
            >
              + S-XL
            </button>
            <button
              (click)="generarTallas(['28', '30', '32', '34', '36'])"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold transition"
            >
              + Jeans
            </button>
            <button
              (click)="generarTallas(['Unitalla'])"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold transition"
            >
              + Unitalla
            </button>
          </div>
        </div>

        <!-- Tabla de Variantes -->
        <div class="space-y-3">
          @for (v of variantes; track $index) {
            <div class="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end">
              <div>
                <label class="block text-[10px] font-bold text-neutral-500 mb-1">Talla</label>
                <input
                  type="text"
                  [(ngModel)]="v.talla"
                  placeholder="Ej. M"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-neutral-500 mb-1">Color (opc)</label>
                <input
                  type="text"
                  [(ngModel)]="v.color"
                  placeholder="Ej. Negro"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-neutral-500 mb-1">Precio Venta *</label>
                <input
                  type="number"
                  [(ngModel)]="v.precio_venta"
                  placeholder="250"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold text-primary-600"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-neutral-500 mb-1">Precio Costo</label>
                <input
                  type="number"
                  [(ngModel)]="v.precio_costo"
                  placeholder="150"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-neutral-500 mb-1">Stock Actual *</label>
                <input
                  type="number"
                  [(ngModel)]="v.stock_actual"
                  placeholder="5"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold"
                />
              </div>

              <div class="flex items-center gap-1">
                <button
                  (click)="eliminarVariante($index)"
                  [disabled]="variantes.length === 1"
                  type="button"
                  class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition disabled:opacity-30"
                  title="Quitar variante"
                >
                  <app-icono nombre="eliminar" clase="w-4 h-4" />
                </button>
              </div>
            </div>
          }

          <button
            (click)="agregarVarianteVacia()"
            type="button"
            class="w-full py-2.5 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-xs font-semibold text-neutral-600 dark:text-neutral-400 transition"
          >
            + Añadir otra talla o variante
          </button>
        </div>
      </div>

      @if (mensajeError()) {
        <div class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold text-center">
          {{ mensajeError() }}
        </div>
      }
    </div>
  `
})
export class FormularioProductoComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly tipos = TIPOS_PRODUCTO;

  public idProducto: string | null = null;
  public readonly esEdicion = signal<boolean>(false);
  public readonly guardando = signal<boolean>(false);
  public readonly mensajeError = signal<string | null>(null);

  public nombre = '';
  public descripcion = '';
  public imagenUrl = '';
  public tipoProducto: TipoProducto = 'ropa';
  public categoria = 'camisas';
  public descuento: number | null = null;

  public variantes: FilaVariante[] = [
    { talla: 'M', color: '', precio_venta: 250, precio_costo: 150, stock_actual: 5, stock_minimo: 2 }
  ];

  public readonly categoriasOpciones = computed(() => {
    return (CATEGORIAS_POR_TIPO[this.tipoProducto] || []).filter(c => c.id !== 'todas');
  });

  public async ngOnInit(): Promise<void> {
    this.idProducto = this.route.snapshot.paramMap.get('id');
    if (this.idProducto) {
      this.esEdicion.set(true);
      await this.cargarDatosEdicion(this.idProducto);
    }
  }

  private async cargarDatosEdicion(id: string): Promise<void> {
    try {
      const prod = await this.inventarioService.obtenerProductoPorId(id);
      if (!prod) {
        this.router.navigate(['/inventario']);
        return;
      }

      this.nombre = prod.nombre;
      this.descripcion = prod.descripcion || '';
      this.imagenUrl = prod.imagen_url || '';
      this.tipoProducto = prod.tipo_producto || 'ropa';
      this.categoria = prod.categoria;
      this.descuento = prod.descuento || null;

      if (prod.variantes_producto && prod.variantes_producto.length > 0) {
        this.variantes = prod.variantes_producto.map(v => ({
          id: v.id,
          talla: v.talla,
          color: v.color || '',
          precio_venta: v.precio_venta,
          precio_costo: v.precio_costo || 0,
          stock_actual: v.stock_actual,
          stock_minimo: v.stock_minimo || 2
        }));
      }
    } catch (err) {
      console.error('Error al cargar datos para edición:', err);
    }
  }

  public alCambiarTipo(): void {
    const cats = this.categoriasOpciones();
    if (cats.length > 0) {
      this.categoria = cats[0].id;
    }
  }

  public alSubirImagen(url: string): void {
    this.imagenUrl = url;
  }

  public agregarVarianteVacia(): void {
    const ultimoPrecio = this.variantes.length > 0 ? this.variantes[this.variantes.length - 1].precio_venta : 250;
    const ultimoCosto = this.variantes.length > 0 ? this.variantes[this.variantes.length - 1].precio_costo : 150;

    this.variantes.push({
      talla: 'G',
      color: '',
      precio_venta: ultimoPrecio,
      precio_costo: ultimoCosto,
      stock_actual: 5,
      stock_minimo: 2
    });
  }

  public eliminarVariante(index: number): void {
    if (this.variantes.length > 1) {
      this.variantes.splice(index, 1);
    }
  }

  public generarTallas(tallas: string[]): void {
    const basePrecio = this.variantes.length > 0 ? this.variantes[0].precio_venta : 250;
    const baseCosto = this.variantes.length > 0 ? this.variantes[0].precio_costo : 150;

    this.variantes = tallas.map(t => ({
      talla: t,
      color: '',
      precio_venta: basePrecio,
      precio_costo: baseCosto,
      stock_actual: 5,
      stock_minimo: 2
    }));
  }

  public async guardar(): Promise<void> {
    if (!this.nombre.trim()) {
      this.mensajeError.set('Por favor escribe un nombre para el producto.');
      return;
    }

    if (this.variantes.length === 0) {
      this.mensajeError.set('Debes agregar al menos una variante con su talla y precio.');
      return;
    }

    for (const v of this.variantes) {
      if (!v.talla.trim()) {
        this.mensajeError.set('Todas las variantes deben tener una talla especificada.');
        return;
      }
      if (isNaN(v.precio_venta) || v.precio_venta <= 0) {
        this.mensajeError.set('El precio de venta debe ser mayor a 0.');
        return;
      }
    }

    this.mensajeError.set(null);
    this.guardando.set(true);

    try {
      const datosProducto = {
        nombre: this.nombre.trim(),
        descripcion: this.descripcion.trim() || undefined,
        imagen_url: this.imagenUrl || undefined,
        tipo_producto: this.tipoProducto,
        categoria: this.categoria,
        descuento: this.descuento ? Number(this.descuento) : null,
        estado: true
      };

      if (this.esEdicion() && this.idProducto) {
        await this.inventarioService.actualizarProducto(
          this.idProducto,
          datosProducto,
          this.variantes
        );
      } else {
        await this.inventarioService.crearProducto(
          datosProducto,
          this.variantes
        );
      }

      this.router.navigate(['/inventario']);
    } catch (err: unknown) {
      console.error('Error al guardar producto:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido al guardar';
      this.mensajeError.set(`No se pudo guardar: ${msg}`);
    } finally {
      this.guardando.set(false);
    }
  }
}
