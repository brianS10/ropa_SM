/**
 * Constantes Generales de la Aplicación
 * =====================================
 * Opciones fijas para categorías, métodos de pago, tallas y tipos de producto.
 */

import { MetodoPagoId, TipoProducto, EstadoPedido } from '../modelos/producto.model';

export interface MetodoPagoOpcion {
  id: MetodoPagoId;
  nombre: string;
  icono: string;
  color: string;
  colorClase: string;
}

export const METODOS_PAGO: MetodoPagoOpcion[] = [
  {
    id: 'efectivo',
    nombre: 'Efectivo',
    icono: 'billete',
    color: 'emerald',
    colorClase: 'text-emerald-600 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia',
    icono: 'transferencia',
    color: 'blue',
    colorClase: 'text-blue-600 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
  },
  {
    id: 'tarjeta',
    nombre: 'Tarjeta',
    icono: 'tarjeta',
    color: 'purple',
    colorClase: 'text-purple-600 bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800'
  }
];

export interface TipoProductoOpcion {
  id: TipoProducto;
  nombre: string;
  icono: string;
  descripcion: string;
}

export const TIPOS_PRODUCTO: TipoProductoOpcion[] = [
  { id: 'ropa', nombre: 'Ropa', icono: 'ropa', descripcion: 'Prendas de vestir y calzado' },
  { id: 'perfumes', nombre: 'Perfumes', icono: 'perfume', descripcion: 'Fragancias y lociones' },
  { id: 'juguetes', nombre: 'Juguetes', icono: 'juguete', descripcion: 'Juguetes, juegos y peluches' }
];

export const CATEGORIAS_POR_TIPO: Record<TipoProducto, { id: string; nombre: string }[]> = {
  ropa: [
    { id: 'todas', nombre: 'Todas' },
    { id: 'camisas', nombre: 'Camisas y Playeras' },
    { id: 'pantalones', nombre: 'Pantalones y Jeans' },
    { id: 'vestidos', nombre: 'Vestidos' },
    { id: 'blusas', nombre: 'Blusas' },
    { id: 'faldas', nombre: 'Faldas y Shorts' },
    { id: 'sueteres', nombre: 'Suéteres y Chamarras' },
    { id: 'ropa_interior', nombre: 'Ropa Interior' },
    { id: 'accesorios', nombre: 'Accesorios' },
    { id: 'calzado', nombre: 'Calzado' },
    { id: 'otros', nombre: 'Otros' }
  ],
  perfumes: [
    { id: 'todas', nombre: 'Todas' },
    { id: 'dama', nombre: 'Dama' },
    { id: 'caballero', nombre: 'Caballero' },
    { id: 'unisex', nombre: 'Unisex' },
    { id: 'ninos', nombre: 'Infantil' },
    { id: 'otros', nombre: 'Otros' }
  ],
  juguetes: [
    { id: 'todas', nombre: 'Todas' },
    { id: 'bebes', nombre: 'Bebés y Primera Infancia' },
    { id: 'figuras_accion', nombre: 'Figuras de Acción' },
    { id: 'munecas', nombre: 'Muñecas' },
    { id: 'juegos_mesa', nombre: 'Juegos de Mesa' },
    { id: 'construccion', nombre: 'Construcción / Bloques' },
    { id: 'educativos', nombre: 'Educativos' },
    { id: 'peluches', nombre: 'Peluches' },
    { id: 'vehiculos', nombre: 'Vehículos y Pistas' },
    { id: 'deportivos', nombre: 'Deportivos y Aire Libre' },
    { id: 'otros', nombre: 'Otros' }
  ]
};

export const TALLAS_COMUNES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unitalla'];
export const TALLAS_PANTALON = ['28', '30', '32', '34', '36', '38', '40'];
export const TALLAS_CALZADO = ['22', '23', '24', '25', '26', '27', '28', '29', '30'];
export const TALLAS_INFANTIL = ['2', '4', '6', '8', '10', '12', '14', '16'];

export interface EstadoPedidoOpcion {
  id: EstadoPedido;
  nombre: string;
  badgeClase: string;
}

export const ESTADOS_PEDIDO: EstadoPedidoOpcion[] = [
  { id: 'pendiente', nombre: 'Pendiente', badgeClase: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'confirmado', nombre: 'Confirmado', badgeClase: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'entregado', nombre: 'Entregado', badgeClase: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'cancelado', nombre: 'Cancelado', badgeClase: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' }
];

export const LLAVE_STORAGE_TEMA = 'tema_preferido';
export const LLAVE_STORAGE_CARRITO_CLIENTE = 'carrito_tienda_cliente';
export const LLAVE_STORAGE_PIN_ADMIN = 'admin_autenticado';
