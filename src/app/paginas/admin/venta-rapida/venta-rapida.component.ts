/**
 * Punto de Venta / Cobro Rápido en Mostrador (POS)
 * ================================================
 * Pantalla de mostrador diseñada para seleccionar prendas ágilmente,
 * aplicar descuentos, seleccionar método de pago, calcular cambio y registrar el ticket.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../core/servicios/inventario.service';
import { VentasService } from '../../../core/servicios/ventas.service';
import { CarritoService } from '../../../core/servicios/carrito.service';
import { Producto, VarianteProducto, TipoProducto, MetodoPagoId, Venta } from '../../../core/modelos/producto.model';
import { TIPOS_PRODUCTO, METODOS_PAGO } from '../../../core/constantes/constantes';
import { formatearMoneda, obtenerEstadoStock } from '../../../core/utilidades/utilidades';
import { IconoComponent } from '../../../compartido/componentes/icono/icono.component';
import { ConfetiComponent } from '../../../compartido/componentes/confeti/confeti.component';

@Component({
  selector: 'app-venta-rapida',
  standalone: true,
  imports: [CommonModule, FormsModule, IconoComponent, ConfetiComponent],
  template: `
    <div class="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      <!-- Confeti al Cobrar Venta -->
      <app-confeti [activo]="mostrarCelebracion()" />

      <!-- Columna Izquierda: Catálogo y Búsqueda de Productos -->
      <div class="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 overflow-hidden shadow-sm">
        <!-- Buscador Rápido -->
        <div class="flex gap-2 mb-3">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <app-icono nombre="buscar" clase="w-4 h-4" />
            </span>
            <input
              type="text"
              [(ngModel)]="busqueda"
              placeholder="Escanear código o teclear nombre..."
              class="w-full pl-10 pr-4 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Filtros de Tipo -->
          <div class="flex gap-1 overflow-x-auto">
            <button
              type="button"
              (click)="tipoFiltro.set('todos')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
              [class.bg-primary-600]="tipoFiltro() === 'todos'"
              [class.text-white]="tipoFiltro() === 'todos'"
              [class.bg-neutral-100]="tipoFiltro() !== 'todos'"
              [class.dark:bg-neutral-800]="tipoFiltro() !== 'todos'"
            >
              Todos
            </button>
            @for (t of tipos; track t.id) {
              <button
                type="button"
                (click)="tipoFiltro.set(t.id)"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
                [class.bg-primary-600]="tipoFiltro() === t.id"
                [class.text-white]="tipoFiltro() === t.id"
                [class.bg-neutral-100]="tipoFiltro() !== t.id"
                [class.dark:bg-neutral-800]="tipoFiltro() !== t.id"
              >
                {{ t.nombre }}
              </button>
            }
          </div>
        </div>

        <!-- Cuadrícula de Productos para Agregar con un Toque -->
        <div class="flex-1 overflow-y-auto pr-1">
          @if (cargando()) {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
                <div class="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              @for (prod of productosFiltrados(); track prod.id) {
                <div
                  (click)="alSeleccionarProducto(prod)"
                  class="group p-2.5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-white dark:hover:bg-neutral-800 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div class="flex items-center gap-2">
                    <img
                      [src]="prod.imagen_url || 'icono-512.svg'"
                      [alt]="prod.nombre"
                      class="w-12 h-12 rounded-xl object-cover bg-white dark:bg-neutral-800 flex-shrink-0"
                      (error)="alFallarLogo($event)"
                    />
                    <div class="min-w-0">
                      <h4 class="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {{ prod.nombre }}
                      </h4>
                      <span class="text-[10px] text-neutral-400 block truncate">
                        {{ prod.categoria }}
                      </span>
                    </div>
                  </div>

                  <div class="mt-2 pt-1.5 border-t border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between">
                    <span class="text-xs font-black text-neutral-900 dark:text-white">
                      {{ formatearMoneda(obtenerPrecioMinimo(prod)) }}
                    </span>
                    <span class="text-[9px] font-semibold text-primary-600 dark:text-primary-400">
                      + Agregar
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Columna Derecha: Ticket de Venta Actual -->
      <div class="w-full lg:w-96 flex flex-col bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-sm">
        <!-- Encabezado del Ticket -->
        <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div class="flex items-center gap-2">
            <app-icono nombre="carrito" clase="w-5 h-5 text-primary-600" />
            <h3 class="font-bold text-sm text-neutral-900 dark:text-white">
              Ticket Actual ({{ carrito.totalArticulos() }})
            </h3>
          </div>

          @if (carrito.items().length > 0) {
            <button
              (click)="carrito.limpiarCarrito()"
              type="button"
              class="text-xs text-rose-500 hover:text-rose-600 transition font-medium"
            >
              Cancelar
            </button>
          }
        </div>

        <!-- Lista de Artículos en el Ticket -->
        <div class="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          @if (carrito.items().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-10">
              <app-icono nombre="carrito" clase="w-10 h-10 mb-2 opacity-40" />
              <p class="text-xs">Toca o busca un producto para agregarlo a la venta</p>
            </div>
          } @else {
            @for (item of carrito.items(); track item.variante_id) {
              <div class="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <h4 class="font-bold text-xs text-neutral-900 dark:text-white truncate">
                    {{ item.nombre_producto }}
                  </h4>
                  <p class="text-[10px] text-neutral-400">
                    {{ item.talla }} {{ item.color ? '• ' + item.color : '' }} ({{ formatearMoneda(item.precio_venta) }} c/u)
                  </p>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    (click)="carrito.actualizarCantidad(item.variante_id, item.cantidad - 1)"
                    type="button"
                    class="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <app-icono nombre="menos" clase="w-3.5 h-3.5" />
                  </button>
                  <span class="text-xs font-bold w-5 text-center">{{ item.cantidad }}</span>
                  <button
                    (click)="carrito.actualizarCantidad(item.variante_id, item.cantidad + 1)"
                    type="button"
                    class="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <app-icono nombre="mas" clase="w-3.5 h-3.5" />
                  </button>

                  <button
                    (click)="carrito.quitarItem(item.variante_id)"
                    type="button"
                    class="p-1 text-rose-500 hover:text-rose-700 ml-1"
                  >
                    <app-icono nombre="eliminar" clase="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            }
          }
        </div>

        <!-- Sección de Pago y Cobro -->
        <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <!-- Métodos de Pago -->
          <div class="grid grid-cols-3 gap-1.5">
            @for (metodo of metodosPago; track metodo.id) {
              <button
                type="button"
                (click)="carrito.metodoPago.set(metodo.id)"
                class="py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all"
                [class]="carrito.metodoPago() === metodo.id ? metodo.colorClase : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
              >
                <app-icono [nombre]="metodo.icono" clase="w-4 h-4" />
                <span class="text-[10px]">{{ metodo.nombre }}</span>
              </button>
            }
          </div>

          <!-- Si es Efectivo: Ingreso de Dinero Recibido y Cambio -->
          @if (carrito.metodoPago() === 'efectivo' && carrito.total() > 0) {
            <div class="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-medium text-neutral-500">Recibido:</span>
                <input
                  type="number"
                  [ngModel]="carrito.montoRecibido()"
                  (ngModelChange)="carrito.montoRecibido.set($event)"
                  placeholder="0.00"
                  class="w-28 text-right font-bold text-sm px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <!-- Botones de Billetes Rápidos -->
              <div class="flex gap-1 text-[10px]">
                <button
                  type="button"
                  (click)="carrito.montoRecibido.set(carrito.total())"
                  class="flex-1 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold"
                >
                  Exacto
                </button>
                @for (monto of [100, 200, 500, 1000]; track monto) {
                  @if (monto >= carrito.total()) {
                    <button
                      type="button"
                      (click)="carrito.montoRecibido.set(monto)"
                      class="flex-1 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold"
                    >
                      \${{ monto }}
                    </button>
                  }
                }
              </div>

              @if (carrito.cambio() > 0) {
                <div class="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-neutral-200/60 dark:border-neutral-700">
                  <span>Cambio a devolver:</span>
                  <span>{{ formatearMoneda(carrito.cambio()) }}</span>
                </div>
              }
            </div>
          }

          <!-- Desglose de Totales -->
          <div class="space-y-1 text-xs">
            <div class="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>{{ formatearMoneda(carrito.subtotal()) }}</span>
            </div>
            <div class="flex justify-between items-center text-lg font-black text-neutral-900 dark:text-white pt-1">
              <span>Total</span>
              <span class="text-primary-600 dark:text-primary-400">{{ formatearMoneda(carrito.total()) }}</span>
            </div>
          </div>

          <!-- Botón Cobrar -->
          <button
            (click)="cobrarVenta()"
            [disabled]="carrito.items().length === 0 || procesandoCobro()"
            type="button"
            class="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 active:scale-98 transition flex items-center justify-center gap-2"
          >
            @if (procesandoCobro()) {
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Registrando cobro...</span>
            } @else {
              <app-icono nombre="billete" clase="w-5 h-5" />
              <span>Cobrar {{ formatearMoneda(carrito.total()) }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Modal de Selección de Variante Rápida si el producto tiene varias -->
      @if (productoModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-neutral-100 dark:border-neutral-800">
            <div class="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 class="font-bold text-sm text-neutral-900 dark:text-white">
                Selecciona Talla / Variante
              </h3>
              <button (click)="productoModal.set(null)" class="p-1 text-neutral-400 hover:text-neutral-600">
                <app-icono nombre="cerrar" clase="w-4 h-4" />
              </button>
            </div>

            <p class="text-xs text-neutral-500 mt-2 font-medium">{{ productoModal()?.nombre }}</p>

            <div class="mt-3 flex flex-col gap-2">
              @for (v of productoModal()?.variantes_producto || []; track v.id) {
                <button
                  type="button"
                  (click)="agregarVarianteDirecta(productoModal()!, v)"
                  [disabled]="v.stock_actual <= 0"
                  class="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 flex items-center justify-between transition disabled:opacity-40"
                >
                  <div class="text-left">
                    <span class="font-bold text-xs text-neutral-900 dark:text-white">{{ v.talla }}</span>
                    @if (v.color) { <span class="text-xs text-neutral-400"> ({{ v.color }})</span> }
                    <span class="block text-[10px] text-neutral-400">{{ v.stock_actual }} disponibles</span>
                  </div>
                  <span class="font-bold text-xs text-primary-600">{{ formatearMoneda(v.precio_venta) }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal de Éxito de Venta Cobrada -->
      @if (ventaExitosa()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 text-center animate-scale-up">
            <div class="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <app-icono nombre="check" clase="w-8 h-8" />
            </div>

            <h3 class="text-xl font-black text-neutral-900 dark:text-white">
              ¡Cobro Registrado!
            </h3>
            <p class="text-sm font-bold text-primary-600 mt-1">
              {{ formatearMoneda(ventaExitosa()?.total_venta || 0) }}
            </p>

            @if (ventaExitosa()?.metodo_pago === 'efectivo' && carrito.cambio() > 0) {
              <div class="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Cambio entregado: {{ formatearMoneda(carrito.cambio()) }}
              </div>
            }

            <button
              (click)="cerrarModalVentaExitosa()"
              type="button"
              class="w-full mt-6 py-3 px-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs active:scale-95 transition"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class VentaRapidaComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly ventasService = inject(VentasService);
  public readonly carrito = inject(CarritoService);

  public readonly tipos = TIPOS_PRODUCTO;
  public readonly metodosPago = METODOS_PAGO;
  public readonly formatearMoneda = formatearMoneda;

  public readonly productos = signal<Producto[]>([]);
  public readonly cargando = signal<boolean>(true);
  public readonly tipoFiltro = signal<TipoProducto | 'todos'>('todos');
  public busqueda = '';

  public readonly productoModal = signal<Producto | null>(null);
  public readonly procesandoCobro = signal<boolean>(false);
  public readonly ventaExitosa = signal<Venta | null>(null);
  public readonly mostrarCelebracion = signal<boolean>(false);

  public readonly productosFiltrados = computed(() => {
    let list = this.productos();

    if (this.tipoFiltro() !== 'todos') {
      list = list.filter(p => p.tipo_producto === this.tipoFiltro());
    }

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase().trim();
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term)
      );
    }

    return list;
  });

  public async ngOnInit(): Promise<void> {
    await this.cargarProductos();
  }

  public async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    try {
      const data = await this.inventarioService.obtenerProductos();
      this.productos.set(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public obtenerPrecioMinimo(prod: Producto): number {
    const vars = prod.variantes_producto || [];
    if (vars.length === 0) return 0;
    return Math.min(...vars.map(v => v.precio_venta));
  }

  public alSeleccionarProducto(prod: Producto): void {
    const vars = prod.variantes_producto || [];
    if (vars.length > 1) {
      this.productoModal.set(prod);
    } else if (vars.length === 1) {
      this.agregarVarianteDirecta(prod, vars[0]);
    }
  }

  public agregarVarianteDirecta(prod: Producto, v: VarianteProducto): void {
    this.carrito.agregarItem({
      variante_id: v.id,
      producto_id: prod.id,
      nombre_producto: prod.nombre,
      talla: v.talla,
      color: v.color,
      precio_venta: v.precio_venta,
      cantidad: 1,
      imagen_url: prod.imagen_url,
      stock_disponible: v.stock_actual
    });
    this.productoModal.set(null);
  }

  public async cobrarVenta(): Promise<void> {
    if (this.carrito.items().length === 0) return;

    this.procesandoCobro.set(true);
    try {
      const ventaRegistrada = await this.ventasService.registrarVenta({
        total_venta: this.carrito.total(),
        metodo_pago: this.carrito.metodoPago()
      }, this.carrito.items());

      this.ventaExitosa.set(ventaRegistrada);
      this.mostrarCelebracion.set(true);
    } catch (err) {
      console.error('Error al cobrar venta:', err);
      alert('Error al registrar la venta. Revisa la conexión.');
    } finally {
      this.procesandoCobro.set(false);
    }
  }

  public cerrarModalVentaExitosa(): void {
    this.ventaExitosa.set(null);
    this.mostrarCelebracion.set(false);
    this.carrito.limpiarCarrito();
    // Recargar inventario para reflejar el stock descontado
    this.cargarProductos();
  }

  public alFallarLogo(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
