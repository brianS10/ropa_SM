/**
 * Tienda en Línea para Clientes
 * =============================
 * Experiencia de compra interactiva donde el usuario puede agregar productos a su cesta,
 * elegir tallas, ver el carrito flotante y proceder al pedido.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../core/servicios/inventario.service';
import { CarritoClienteService } from '../../core/servicios/carrito-cliente.service';
import { Producto, VarianteProducto, TipoProducto, ItemCarrito } from '../../core/modelos/producto.model';
import { TIPOS_PRODUCTO, CATEGORIAS_POR_TIPO } from '../../core/constantes/constantes';
import { formatearMoneda, obtenerEstadoStock } from '../../core/utilidades/utilidades';
import { IconoComponent } from '../../compartido/componentes/icono/icono.component';
import { TarjetaProductoComponent } from '../../compartido/componentes/tarjeta-producto/tarjeta-producto.component';
import { ToggleTemaComponent } from '../../compartido/componentes/toggle-tema/toggle-tema.component';
import { AnimacionCarritoComponent } from '../../compartido/componentes/animacion-carrito/animacion-carrito.component';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IconoComponent,
    TarjetaProductoComponent,
    ToggleTemaComponent,
    AnimacionCarritoComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col pb-28 selection:bg-primary-500 selection:text-white transition-colors">
      <!-- Animación de productos voladores hacia el carrito -->
      <app-animacion-carrito />

      <!-- Barra Superior -->
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3">
        <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <a routerLink="/" class="flex items-center gap-2">
              <img src="logo.png" alt="Logo" class="w-9 h-9 rounded-xl object-cover" (error)="alFallarLogo($event)" />
              <span class="font-bold text-base hidden sm:inline">Tienda</span>
            </a>
          </div>

          <div class="flex items-center gap-2">
            <!-- Botón del Carrito en el Header -->
            <a
              routerLink="/tienda/carrito"
              class="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md shadow-primary-600/20 active:scale-95 transition"
            >
              <app-icono nombre="carrito" clase="w-4 h-4" />
              <span>{{ formatearMoneda(carritoService.totalPagar()) }}</span>

              @if (carritoService.totalPrendas() > 0) {
                <span class="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full shadow animate-bounce">
                  {{ carritoService.totalPrendas() }}
                </span>
              }
            </a>

            <app-toggle-tema />
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="max-w-6xl mx-auto px-4 pt-6 w-full flex-1">
        <!-- Buscador de Artículos -->
        <div class="relative w-full sm:max-w-md mx-auto sm:mx-0">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <app-icono nombre="buscar" clase="w-5 h-5" />
          </span>
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="Buscar ropa, perfumes, juguetes..."
            class="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition shadow-sm"
          />
        </div>

        <!-- Filtros por Tipo de Producto -->
        <div class="flex gap-2 overflow-x-auto py-4 scrollbar-none">
          <button
            type="button"
            (click)="cambiarTipo('todos')"
            class="px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm"
            [class.bg-primary-600]="tipoSeleccionado() === 'todos'"
            [class.text-white]="tipoSeleccionado() === 'todos'"
            [class.bg-white]="tipoSeleccionado() !== 'todos'"
            [class.dark:bg-neutral-900]="tipoSeleccionado() !== 'todos'"
            [class.border]="tipoSeleccionado() !== 'todos'"
            [class.border-neutral-200]="tipoSeleccionado() !== 'todos'"
            [class.dark:border-neutral-800]="tipoSeleccionado() !== 'todos'"
          >
            Todos
          </button>

          @for (tipo of tipos; track tipo.id) {
            <button
              type="button"
              (click)="cambiarTipo(tipo.id)"
              class="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm"
              [class.bg-primary-600]="tipoSeleccionado() === tipo.id"
              [class.text-white]="tipoSeleccionado() === tipo.id"
              [class.bg-white]="tipoSeleccionado() !== tipo.id"
              [class.dark:bg-neutral-900]="tipoSeleccionado() !== tipo.id"
              [class.border]="tipoSeleccionado() !== tipo.id"
              [class.border-neutral-200]="tipoSeleccionado() !== tipo.id"
              [class.dark:border-neutral-800]="tipoSeleccionado() !== tipo.id"
            >
              <app-icono [nombre]="tipo.icono" clase="w-4 h-4" />
              <span>{{ tipo.nombre }}</span>
            </button>
          }
        </div>

        <!-- Subcategorías si aplica -->
        @if (categoriasDisponibles().length > 0) {
          <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
            @for (cat of categoriasDisponibles(); track cat.id) {
              <button
                type="button"
                (click)="categoriaSeleccionada.set(cat.id)"
                class="px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors"
                [class.bg-neutral-900]="categoriaSeleccionada() === cat.id"
                [class.text-white]="categoriaSeleccionada() === cat.id"
                [class.dark:bg-white]="categoriaSeleccionada() === cat.id"
                [class.dark:text-neutral-900]="categoriaSeleccionada() === cat.id"
                [class.bg-neutral-100]="categoriaSeleccionada() !== cat.id"
                [class.dark:bg-neutral-800]="categoriaSeleccionada() !== cat.id"
              >
                {{ cat.nombre }}
              </button>
            }
          </div>
        }

        <!-- Listado de Productos -->
        @if (cargando()) {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
              <div class="rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse aspect-square"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            @for (prod of productosFiltrados(); track prod.id) {
              <app-tarjeta-producto
                [producto]="prod"
                [mostrarBotonAgregar]="true"
                (clickImagen)="abrirModalSeleccion(prod)"
                (agregar)="alClickAgregarRapido($event)"
              />
            }
          </div>
        }
      </main>

      <!-- Barra Flotante Inferior del Carrito de Compras -->
      @if (carritoService.totalPrendas() > 0) {
        <div class="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-slide-up">
          <a
            routerLink="/tienda/carrito"
            class="flex items-center justify-between p-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white shadow-2xl shadow-primary-600/40 active:scale-98 transition"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/20 rounded-xl">
                <app-icono nombre="carrito" clase="w-6 h-6" />
              </div>
              <div>
                <p class="font-bold text-sm leading-tight">
                  {{ carritoService.totalPrendas() }} {{ carritoService.totalPrendas() === 1 ? 'artículo' : 'artículos' }}
                </p>
                <p class="text-xs text-primary-100 font-medium">Ver cesta de compras</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-lg font-black">{{ formatearMoneda(carritoService.totalPagar()) }}</span>
              <app-icono nombre="flecha-derecha" clase="w-5 h-5" />
            </div>
          </a>
        </div>
      }

      <!-- Modal Selector de Talla/Color para Agregar -->
      @if (productoModal()) {
        <div
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          (click)="alClickFondoModal($event)"
        >
          <div class="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 animate-slide-up">
            <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 class="font-bold text-base text-neutral-900 dark:text-white">
                Selecciona tu talla
              </h3>
              <button (click)="productoModal.set(null)" class="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 transition">
                <app-icono nombre="cerrar" clase="w-5 h-5" />
              </button>
            </div>

            <div class="flex gap-4 items-center mt-4">
              <img
                [src]="productoModal()?.imagen_url || 'icono-512.svg'"
                [alt]="productoModal()?.nombre"
                class="w-16 h-16 rounded-xl object-cover"
                (error)="alFallarLogo($event)"
              />
              <div>
                <h4 class="font-bold text-sm text-neutral-900 dark:text-white">{{ productoModal()?.nombre }}</h4>
                <p class="text-xs text-neutral-400">{{ productoModal()?.categoria }}</p>
              </div>
            </div>

            <!-- Variantes -->
            <div class="mt-4 flex flex-wrap gap-2">
              @for (v of productoModal()?.variantes_producto || []; track v.id) {
                <button
                  type="button"
                  (click)="varianteModal.set(v)"
                  class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2"
                  [class.border-primary-600]="varianteModal()?.id === v.id"
                  [class.bg-primary-50]="varianteModal()?.id === v.id"
                  [class.text-primary-700]="varianteModal()?.id === v.id"
                  [class.dark:bg-primary-950/50]="varianteModal()?.id === v.id"
                  [class.dark:text-primary-300]="varianteModal()?.id === v.id"
                  [class.border-neutral-200]="varianteModal()?.id !== v.id"
                  [class.dark:border-neutral-700]="varianteModal()?.id !== v.id"
                  [class.opacity-50]="v.stock_actual <= 0"
                  [disabled]="v.stock_actual <= 0"
                >
                  <span>{{ v.talla }}</span>
                  @if (v.color) { <span>- {{ v.color }}</span> }
                  <span class="text-[10px] text-neutral-400">({{ v.stock_actual }} disp.)</span>
                </button>
              }
            </div>

            <!-- Precio y Botón Confirmar Agregar -->
            <div class="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
              <div>
                <span class="text-xs text-neutral-400 block leading-none">Precio</span>
                <span class="text-xl font-black text-neutral-900 dark:text-white">
                  {{ formatearMoneda(varianteModal()?.precio_venta || 0) }}
                </span>
              </div>

              <button
                (click)="confirmarAgregarAlCarrito($event)"
                [disabled]="!varianteModal() || (varianteModal()?.stock_actual ?? 0) <= 0"
                type="button"
                class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold shadow-lg shadow-primary-600/20 active:scale-95 transition"
              >
                <app-icono nombre="carrito" clase="w-5 h-5" />
                <span>Agregar a la Bolsa</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TiendaComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  public readonly carritoService = inject(CarritoClienteService);

  public readonly tipos = TIPOS_PRODUCTO;
  public readonly formatearMoneda = formatearMoneda;
  public readonly obtenerEstadoStock = obtenerEstadoStock;

  public readonly productos = signal<Producto[]>([]);
  public readonly cargando = signal<boolean>(true);

  public readonly tipoSeleccionado = signal<TipoProducto | 'todos'>('todos');
  public readonly categoriaSeleccionada = signal<string>('todas');
  public busqueda = '';

  public readonly productoModal = signal<Producto | null>(null);
  public readonly varianteModal = signal<VarianteProducto | null>(null);

  public readonly categoriasDisponibles = computed(() => {
    const tipo = this.tipoSeleccionado();
    if (tipo === 'todos') return [];
    return CATEGORIAS_POR_TIPO[tipo] || [];
  });

  public readonly productosFiltrados = computed(() => {
    let lista = this.productos();

    if (this.tipoSeleccionado() !== 'todos') {
      lista = lista.filter(p => p.tipo_producto === this.tipoSeleccionado());
    }

    if (this.categoriaSeleccionada() !== 'todas') {
      lista = lista.filter(p => p.categoria === this.categoriaSeleccionada());
    }

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.categoria.toLowerCase().includes(termino)
      );
    }

    return lista;
  });

  public async ngOnInit(): Promise<void> {
    await this.cargarProductos();
  }

  public async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    try {
      const data = await this.inventarioService.obtenerProductos({ soloConStock: true });
      this.productos.set(data);
    } catch (err) {
      console.error('Error al cargar tienda:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public cambiarTipo(tipo: TipoProducto | 'todos'): void {
    this.tipoSeleccionado.set(tipo);
    this.categoriaSeleccionada.set('todas');
  }

  public abrirModalSeleccion(prod: Producto): void {
    this.productoModal.set(prod);
    const primeraConStock = prod.variantes_producto?.find(v => v.stock_actual > 0) || prod.variantes_producto?.[0];
    this.varianteModal.set(primeraConStock || null);
  }

  public alClickAgregarRapido(datos: { producto: Producto; variante?: VarianteProducto; evento: MouseEvent }): void {
    const vars = datos.producto.variantes_producto || [];
    if (vars.length > 1) {
      // Si tiene más de una variante, abrir selector para que el cliente elija talla
      this.abrirModalSeleccion(datos.producto);
      return;
    }

    const variante = datos.variante || vars[0];
    if (!variante) return;

    const item: ItemCarrito = {
      variante_id: variante.id,
      producto_id: datos.producto.id,
      nombre_producto: datos.producto.nombre,
      talla: variante.talla,
      color: variante.color,
      precio_venta: variante.precio_venta,
      cantidad: 1,
      imagen_url: datos.producto.imagen_url,
      tipo_producto: datos.producto.tipo_producto,
      stock_disponible: variante.stock_actual
    };

    const origen = { x: datos.evento.clientX, y: datos.evento.clientY };
    this.carritoService.agregar(item, origen);
  }

  public confirmarAgregarAlCarrito(evento: MouseEvent): void {
    const prod = this.productoModal();
    const v = this.varianteModal();
    if (!prod || !v) return;

    const item: ItemCarrito = {
      variante_id: v.id,
      producto_id: prod.id,
      nombre_producto: prod.nombre,
      talla: v.talla,
      color: v.color,
      precio_venta: v.precio_venta,
      cantidad: 1,
      imagen_url: prod.imagen_url,
      tipo_producto: prod.tipo_producto,
      stock_disponible: v.stock_actual
    };

    const origen = { x: evento.clientX, y: evento.clientY };
    this.carritoService.agregar(item, origen);
    this.productoModal.set(null);
  }

  public alClickFondoModal(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.productoModal.set(null);
    }
  }

  public alFallarLogo(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
