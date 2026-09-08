/**
 * Modelos e Interfaces del Sistema
 * ================================
 * Define los tipos de datos principales de la base de datos y la aplicación.
 */

export type TipoProducto = 'ropa' | 'perfumes' | 'juguetes';

export type MetodoPagoId = 'efectivo' | 'transferencia' | 'tarjeta';

export type EstadoPedido = 'pendiente' | 'confirmado' | 'entregado' | 'cancelado';

export interface VarianteProducto {
  id: string;
  producto_id: string;
  talla: string;
  color?: string;
  precio_venta: number;
  precio_costo?: number;
  stock_actual: number;
  stock_minimo?: number;
  codigo_barras?: string;
  creado_en?: string;
  productos?: {
    nombre: string;
  };
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  imagenes?: string[];
  categoria: string;
  tipo_producto?: TipoProducto;
  descuento?: number | null;
  destacado?: boolean;
  estado: boolean;
  creado_en?: string;
  variantes_producto?: VarianteProducto[];
}

export interface ItemCarrito {
  variante_id: string;
  producto_id: string;
  nombre_producto: string;
  talla: string;
  color?: string;
  precio_venta: number;
  cantidad: number;
  imagen_url?: string;
  tipo_producto?: TipoProducto;
  stock_disponible?: number;
}

export interface Venta {
  id: string;
  fecha_venta: string;
  total_venta: number;
  metodo_pago: MetodoPagoId;
  usuario_id?: string;
  notas?: string;
  creado_en?: string;
  detalle_venta?: DetalleVenta[];
}

export interface DetalleVenta {
  id?: string;
  venta_id?: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  variantes_producto?: {
    talla: string;
    color?: string;
    productos?: {
      nombre: string;
    };
  };
}

export interface Pedido {
  id: string;
  nombre_cliente: string;
  telefono: string;
  notas?: string;
  estado: EstadoPedido;
  total: number;
  fecha_pedido?: string;
  fecha_entrega?: string;
  creado_en?: string;
  detalle_pedido?: DetallePedido[];
}

export interface DetallePedido {
  id?: string;
  pedido_id?: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  variantes?: {
    talla: string;
    color?: string;
    productos?: {
      nombre: string;
    };
  };
}

export interface ResumenCorteCaja {
  totalGeneral: number;
  cantidadVentas: number;
  porMetodo: {
    efectivo: number;
    transferencia: number;
    tarjeta: number;
  };
}
