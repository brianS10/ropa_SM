/**
 * Catálogo Público de Productos
 * =============================
 * Vista principal para que los clientes exploren las prendas, perfumes y juguetes,
 * consulten disponibilidad de tallas y colores, y realicen pedidos directos por WhatsApp.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../core/servicios/inventario.service';
import { Producto, VarianteProducto, TipoProducto } from '../../core/modelos/producto.model';
import { TIPOS_PRODUCTO, CATEGORIAS_POR_TIPO } from '../../core/constantes/constantes';
import { formatearMoneda, crearEnlaceWhatsApp, obtenerEstadoStock } from '../../core/utilidades/utilidades';
import { environment } from '../../../environments/environment';
import { IconoComponent } from '../../compartido/componentes/icono/icono.component';
import { TarjetaProductoComponent } from '../../compartido/componentes/tarjeta-producto/tarjeta-producto.component';
import { ToggleTemaComponent } from '../../compartido/componentes/toggle-tema/toggle-tema.component';
import { ModalCompartirComponent } from '../../compartido/componentes/modal-compartir/modal-compartir.component';
import { GaleriaModalComponent } from '../../compartido/componentes/galeria-modal/galeria-modal.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IconoComponent,
    TarjetaProductoComponent,
    ToggleTemaComponent,
    ModalCompartirComponent,
    GaleriaModalComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col pb-20 selection:bg-primary-500 selection:text-white transition-colors">
      <!-- Barra Superior -->
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3">
        <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-2">
              <img src="logo.png" alt="Logo" class="w-9 h-9 rounded-xl object-cover" (error)="alFallarLogo($event)" />
              <span class="font-bold text-base hidden sm:inline">Catálogo</span>
            </a>
          </div>

          <!-- Acciones Superiores -->
          <div class="flex items-center gap-2">
            <button
              (click)="mostrarModalCompartir.set(true)"
              type="button"
              class="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Compartir o Código QR"
            >
              <app-icono nombre="compartir" clase="w-5 h-5" />
            </button>

            <a
              routerLink="/tienda"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold text-xs border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition"
            >
              <app-icono nombre="carrito" clase="w-4 h-4" />
              <span class="hidden sm:inline">Ir a la Tienda</span>
            </a>

            <app-toggle-tema />
          </div>
        </div>
      </header>

      <!-- Contenedor Principal de Filtros y Productos -->
      <main class="max-w-6xl mx-auto px-4 pt-6 w-full flex-1">
        <!-- Buscador y Filtro Rápido -->
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div class="relative w-full sm:max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <app-icono nombre="buscar" clase="w-5 h-5" />
            </span>
            <input
              type="text"
              [(ngModel)]="busqueda"
              (ngModelChange)="aplicarFiltros()"
              placeholder="Buscar por nombre, categoría..."
              class="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition shadow-sm"
            />
          </div>

          <!-- Switch Solo con existencias -->
          <label class="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 cursor-pointer select-none self-end sm:self-center">
            <input
              type="checkbox"
              [(ngModel)]="soloConStock"
              (ngModelChange)="aplicarFiltros()"
              class="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
            />
            <span>Solo productos disponibles</span>
          </label>
        </div>

        <!-- Pestañas de Tipo de Producto -->
        <div class="flex gap-2 overflow-x-auto py-4 scrollbar-none">
          <button
            type="button"
            (click)="cambiarTipo('todos')"
            class="px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm"
            [class.bg-primary-600]="tipoSeleccionado() === 'todos'"
            [class.text-white]="tipoSeleccionado() === 'todos'"
            [class.bg-white]="tipoSeleccionado() !== 'todos'"
            [class.dark:bg-neutral-900]="tipoSeleccionado() !== 'todos'"
            [class.text-neutral-600]="tipoSeleccionado() !== 'todos'"
            [class.dark:text-neutral-300]="tipoSeleccionado() !== 'todos'"
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
              [class.text-neutral-600]="tipoSeleccionado() !== tipo.id"
              [class.dark:text-neutral-300]="tipoSeleccionado() !== tipo.id"
              [class.border]="tipoSeleccionado() !== tipo.id"
              [class.border-neutral-200]="tipoSeleccionado() !== tipo.id"
              [class.dark:border-neutral-800]="tipoSeleccionado() !== tipo.id"
            >
              <app-icono [nombre]="tipo.icono" clase="w-4 h-4" />
              <span>{{ tipo.nombre }}</span>
            </button>
          }
        </div>

        <!-- Categorías Pills (si hay un tipo seleccionado) -->
        @if (categoriasDisponibles().length > 0) {
          <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
            @for (cat of categoriasDisponibles(); track cat.id) {
              <button
                type="button"
                (click)="cambiarCategoria(cat.id)"
                class="px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors"
                [class.bg-neutral-900]="categoriaSeleccionada() === cat.id"
                [class.text-white]="categoriaSeleccionada() === cat.id"
                [class.dark:bg-white]="categoriaSeleccionada() === cat.id"
                [class.dark:text-neutral-900]="categoriaSeleccionada() === cat.id"
                [class.bg-neutral-100]="categoriaSeleccionada() !== cat.id"
                [class.dark:bg-neutral-800]="categoriaSeleccionada() !== cat.id"
                [class.text-neutral-600]="categoriaSeleccionada() !== cat.id"
                [class.dark:text-neutral-300]="categoriaSeleccionada() !== cat.id"
              >
                {{ cat.nombre }}
              </button>
            }
          </div>
        }

        <!-- Estado de Carga -->
        @if (cargando()) {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
              <div class="rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse aspect-square"></div>
            }
          </div>
        } @else if (productosFiltrados().length === 0) {
          <!-- Mensaje sin resultados -->
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="p-4 rounded-3xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-3">
              <app-icono nombre="ropa" clase="w-10 h-10" />
            </div>
            <h3 class="text-base font-bold text-neutral-800 dark:text-neutral-200">
              No se encontraron productos
            </h3>
            <p class="text-xs text-neutral-400 mt-1">
              Prueba cambiando los filtros o el término de búsqueda
            </p>
          </div>
        } @else {
          <!-- Cuadrícula de Productos -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            @for (prod of productosFiltrados(); track prod.id) {
              <app-tarjeta-producto
                [producto]="prod"
                [mostrarBotonAgregar]="false"
                (clickImagen)="abrirDetalle(prod)"
              />
            }
          </div>
        }
      </main>

      <!-- Modal de Detalle de Producto -->
      @if (productoSeleccionado()) {
        <div
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          (click)="alClickFondoModal($event)"
        >
          <div class="w-full sm:max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 max-h-[90vh] overflow-y-auto animate-slide-up">
            <!-- Botón Cerrar y Título -->
            <div class="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span class="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {{ productoSeleccionado()?.categoria }}
              </span>
              <button
                (click)="cerrarDetalle()"
                type="button"
                class="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition"
              >
                <app-icono nombre="cerrar" clase="w-5 h-5" />
              </button>
            </div>

            <!-- Imagen Principal -->
            <div
              class="relative aspect-square w-full rounded-2xl overflow-hidden mt-4 bg-neutral-100 dark:bg-neutral-800 cursor-pointer group"
              (click)="abrirGaleria()"
            >
              <img
                [src]="productoSeleccionado()?.imagen_url || 'icono-512.svg'"
                [alt]="productoSeleccionado()?.nombre"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                (error)="alFallarLogo($event)"
              />
              <div class="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5">
                <app-icono nombre="buscar" clase="w-3.5 h-3.5" />
                <span>Ver foto completa</span>
              </div>
            </div>

            <!-- Datos del Producto -->
            <div class="mt-4">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
                {{ productoSeleccionado()?.nombre }}
              </h2>
              @if (productoSeleccionado()?.descripcion) {
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {{ productoSeleccionado()?.descripcion }}
                </p>
              }
            </div>

            <!-- Selección de Variantes (Tallas y Colores) -->
            <div class="mt-5">
              <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
                Tallas / Variantes disponibles:
              </span>
              <div class="flex flex-wrap gap-2">
                @for (v of productoSeleccionado()?.variantes_producto || []; track v.id) {
                  <button
                    type="button"
                    (click)="seleccionarVariante(v)"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2"
                    [class.border-primary-600]="varianteSeleccionada()?.id === v.id"
                    [class.bg-primary-50]="varianteSeleccionada()?.id === v.id"
                    [class.text-primary-700]="varianteSeleccionada()?.id === v.id"
                    [class.dark:bg-primary-950/40]="varianteSeleccionada()?.id === v.id"
                    [class.dark:text-primary-300]="varianteSeleccionada()?.id === v.id"
                    [class.border-neutral-200]="varianteSeleccionada()?.id !== v.id"
                    [class.dark:border-neutral-700]="varianteSeleccionada()?.id !== v.id"
                    [class.opacity-50]="v.stock_actual <= 0"
                  >
                    <span>{{ v.talla }}</span>
                    @if (v.color) {
                      <span class="text-neutral-400">({{ v.color }})</span>
                    }
                    <span [class]="obtenerEstadoStock(v.stock_actual).claseBadge" class="text-[9px] px-1.5 py-0.5 rounded-md">
                      {{ v.stock_actual > 0 ? v.stock_actual + ' pz' : 'Agotado' }}
                    </span>
                  </button>
                }
              </div>
            </div>

            <!-- Precio y Botón de WhatsApp -->
            <div class="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
              <div>
                <span class="text-xs text-neutral-400 block leading-none">Precio</span>
                <span class="text-2xl font-black text-neutral-900 dark:text-white">
                  {{ formatearMoneda(varianteSeleccionada()?.precio_venta || 0) }}
                </span>
              </div>

              <a
                [href]="obtenerEnlacePedidoWhatsApp()"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 active:scale-95 transition"
              >
                <app-icono nombre="whatsapp" clase="w-5 h-5" />
                <span>Pedir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      }

      <!-- Visor de Galería en Pantalla Completa -->
      <app-galeria-modal
        [abierto]="mostrarGaleria()"
        [imagenes]="imagenesGaleria()"
        (cerrar)="mostrarGaleria.set(false)"
      />

      <!-- Modal para Compartir Catálogo -->
      <app-modal-compartir
        [abierto]="mostrarModalCompartir()"
        (cerrar)="mostrarModalCompartir.set(false)"
      />

      <!-- Botón Flotante de WhatsApp para dudas -->
      <a
        [href]="enlaceWhatsAppGeneral"
        target="_blank"
        rel="noopener noreferrer"
        class="fixed bottom-6 right-6 z-30 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 font-medium active:scale-95 transition"
        title="WhatsApp de atención"
      >
        <app-icono nombre="whatsapp" clase="w-6 h-6" />
      </a>
    </div>
  `
})
export class CatalogoComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);

  public readonly tipos = TIPOS_PRODUCTO;
  public readonly formatearMoneda = formatearMoneda;
  public readonly obtenerEstadoStock = obtenerEstadoStock;

  public readonly productos = signal<Producto[]>([]);
  public readonly cargando = signal<boolean>(true);

  public readonly tipoSeleccionado = signal<TipoProducto | 'todos'>('todos');
  public readonly categoriaSeleccionada = signal<string>('todas');
  public busqueda = '';
  public soloConStock = false;

  public readonly productoSeleccionado = signal<Producto | null>(null);
  public readonly varianteSeleccionada = signal<VarianteProducto | null>(null);

  public readonly mostrarModalCompartir = signal<boolean>(false);
  public readonly mostrarGaleria = signal<boolean>(false);
  public readonly imagenesGaleria = signal<string[]>([]);

  public readonly enlaceWhatsAppGeneral = `https://wa.me/${environment.whatsappVendedor.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola! Me comunico desde su catálogo digital.')}`;

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

    if (this.soloConStock) {
      lista = lista.filter(p =>
        p.variantes_producto && p.variantes_producto.some(v => v.stock_actual > 0)
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
      const data = await this.inventarioService.obtenerProductos();
      this.productos.set(data);
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  public cambiarTipo(tipo: TipoProducto | 'todos'): void {
    this.tipoSeleccionado.set(tipo);
    this.categoriaSeleccionada.set('todas');
  }

  public cambiarCategoria(catId: string): void {
    this.categoriaSeleccionada.set(catId);
  }

  public aplicarFiltros(): void {
    // La señal computada reacciona automáticamente
  }

  public abrirDetalle(prod: Producto): void {
    this.productoSeleccionado.set(prod);
    const primeraConStock = prod.variantes_producto?.find(v => v.stock_actual > 0) || prod.variantes_producto?.[0];
    this.varianteSeleccionada.set(primeraConStock || null);
  }

  public cerrarDetalle(): void {
    this.productoSeleccionado.set(null);
    this.varianteSeleccionada.set(null);
  }

  public seleccionarVariante(v: VarianteProducto): void {
    this.varianteSeleccionada.set(v);
  }

  public abrirGaleria(): void {
    const prod = this.productoSeleccionado();
    if (!prod) return;
    const fotos = prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes : [prod.imagen_url || 'icono-512.svg'];
    this.imagenesGaleria.set(fotos);
    this.mostrarGaleria.set(true);
  }

  public obtenerEnlacePedidoWhatsApp(): string {
    const prod = this.productoSeleccionado();
    const v = this.varianteSeleccionada();
    if (!prod || !v) return '';

    const mensaje = `¡Hola! Me interesa comprar este artículo del catálogo:\n\n` +
      `📌 *${prod.nombre}*\n` +
      `📏 Talla: ${v.talla}${v.color ? ' - Color: ' + v.color : ''}\n` +
      `💰 Precio: ${formatearMoneda(v.precio_venta)}\n\n` +
      `¿Sigue disponible para entrega?`;

    return crearEnlaceWhatsApp(environment.whatsappVendedor, mensaje);
  }

  public alClickFondoModal(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.cerrarDetalle();
    }
  }

  public alFallarLogo(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = 'icono-512.svg';
  }
}
