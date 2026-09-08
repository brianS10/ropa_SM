/**
 * Productos de Demostración Iniciales
 * =====================================
 * Se muestran cuando Supabase aún no tiene credenciales configuradas
 * o cuando la conexión está offline, permitiendo probar toda la app inmediatamente.
 */

import { Producto } from '../modelos/producto.model';

export const PRODUCTOS_DEMO: Producto[] = [
  {
    id: 'demo-1',
    nombre: 'Pantalón Mezclilla Clásico',
    descripcion: 'Pantalón de mezclilla azul corte recto, ideal para uso diario y muy duradero.',
    categoria: 'Pantalones',
    tipo_producto: 'ropa',
    imagen_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80'
    ],
    estado: true,
    destacado: true,
    descuento: 10,
    creado_en: new Date().toISOString(),
    variantes_producto: [
      { id: 'v-1-1', producto_id: 'demo-1', talla: '28', color: 'Azul', precio_venta: 299, precio_costo: 150, stock_actual: 10, stock_minimo: 3 },
      { id: 'v-1-2', producto_id: 'demo-1', talla: '30', color: 'Azul', precio_venta: 299, precio_costo: 150, stock_actual: 15, stock_minimo: 3 },
      { id: 'v-1-3', producto_id: 'demo-1', talla: '32', color: 'Azul', precio_venta: 299, precio_costo: 150, stock_actual: 20, stock_minimo: 3 },
      { id: 'v-1-4', producto_id: 'demo-1', talla: '34', color: 'Azul', precio_venta: 299, precio_costo: 150, stock_actual: 12, stock_minimo: 3 }
    ]
  },
  {
    id: 'demo-2',
    nombre: 'Pantalón Mezclilla Skinny',
    descripcion: 'Pantalón ajustado de mezclilla stretch, flexible y moderno para cualquier ocasión.',
    categoria: 'Jeans',
    tipo_producto: 'ropa',
    imagen_url: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600&auto=format&fit=crop&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600&auto=format&fit=crop&q=80'
    ],
    estado: true,
    destacado: true,
    descuento: 0,
    creado_en: new Date().toISOString(),
    variantes_producto: [
      { id: 'v-2-1', producto_id: 'demo-2', talla: '28', color: 'Negro', precio_venta: 349, precio_costo: 180, stock_actual: 8, stock_minimo: 2 },
      { id: 'v-2-2', producto_id: 'demo-2', talla: '30', color: 'Negro', precio_venta: 349, precio_costo: 180, stock_actual: 12, stock_minimo: 2 },
      { id: 'v-2-3', producto_id: 'demo-2', talla: '32', color: 'Negro', precio_venta: 349, precio_costo: 180, stock_actual: 14, stock_minimo: 2 },
      { id: 'v-2-4', producto_id: 'demo-2', talla: '30', color: 'Azul', precio_venta: 349, precio_costo: 180, stock_actual: 9, stock_minimo: 2 }
    ]
  },
  {
    id: 'demo-3',
    nombre: 'Pantalón Cargo Verde Militar',
    descripcion: 'Cargo con múltiples bolsillos funcionales, resistente y con estilo urbano.',
    categoria: 'Pantalones',
    tipo_producto: 'ropa',
    imagen_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80'
    ],
    estado: true,
    destacado: false,
    descuento: 15,
    creado_en: new Date().toISOString(),
    variantes_producto: [
      { id: 'v-3-1', producto_id: 'demo-3', talla: '30', color: 'Verde', precio_venta: 289, precio_costo: 145, stock_actual: 10, stock_minimo: 2 },
      { id: 'v-3-2', producto_id: 'demo-3', talla: '32', color: 'Verde', precio_venta: 289, precio_costo: 145, stock_actual: 15, stock_minimo: 2 },
      { id: 'v-3-3', producto_id: 'demo-3', talla: '34', color: 'Verde', precio_venta: 289, precio_costo: 145, stock_actual: 7, stock_minimo: 2 }
    ]
  },
  {
    id: 'demo-4',
    nombre: 'Pantalón de Vestir Elegante',
    descripcion: 'Pantalón formal negro con corte ejecutivo, perfecto para oficina o eventos.',
    categoria: 'Pantalones',
    tipo_producto: 'ropa',
    imagen_url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop&q=80'
    ],
    estado: true,
    destacado: true,
    descuento: 0,
    creado_en: new Date().toISOString(),
    variantes_producto: [
      { id: 'v-4-1', producto_id: 'demo-4', talla: '30', color: 'Negro', precio_venta: 399, precio_costo: 200, stock_actual: 8, stock_minimo: 2 },
      { id: 'v-4-2', producto_id: 'demo-4', talla: '32', color: 'Negro', precio_venta: 399, precio_costo: 200, stock_actual: 12, stock_minimo: 2 },
      { id: 'v-4-3', producto_id: 'demo-4', talla: '34', color: 'Negro', precio_venta: 399, precio_costo: 200, stock_actual: 10, stock_minimo: 2 }
    ]
  },
  {
    id: 'demo-5',
    nombre: 'Jogger Deportivo Confort',
    descripcion: 'Jogger suave de algodón afelpado con pretina elástica y cordón ajustable.',
    categoria: 'Pantalones',
    tipo_producto: 'ropa',
    imagen_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80'
    ],
    estado: true,
    destacado: false,
    descuento: 0,
    creado_en: new Date().toISOString(),
    variantes_producto: [
      { id: 'v-5-1', producto_id: 'demo-5', talla: 'S', color: 'Gris', precio_venta: 249, precio_costo: 120, stock_actual: 10, stock_minimo: 3 },
      { id: 'v-5-2', producto_id: 'demo-5', talla: 'M', color: 'Gris', precio_venta: 249, precio_costo: 120, stock_actual: 15, stock_minimo: 3 },
      { id: 'v-5-3', producto_id: 'demo-5', talla: 'L', color: 'Gris', precio_venta: 249, precio_costo: 120, stock_actual: 12, stock_minimo: 3 }
    ]
  },
  {
    id: 'demo-6',
    nombre: 'Bermuda Casual de Mezclilla',
    descripcion: 'Short bermuda fresca y cómoda, con dobladillo y mezclilla prelavada.',
    categoria: 'Shorts',
    tipo_producto: 'ropa',
    imagen_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80'
    ],
    estado: true,
    destacado: false,
    descuento: 20,
    creado_en: new Date().toISOString(),
    variantes_producto: [
      { id: 'v-6-1', producto_id: 'demo-6', talla: '28', color: 'Azul Claro', precio_venta: 229, precio_costo: 110, stock_actual: 6, stock_minimo: 2 },
      { id: 'v-6-2', producto_id: 'demo-6', talla: '30', color: 'Azul Claro', precio_venta: 229, precio_costo: 110, stock_actual: 10, stock_minimo: 2 },
      { id: 'v-6-3', producto_id: 'demo-6', talla: '32', color: 'Azul Claro', precio_venta: 229, precio_costo: 110, stock_actual: 8, stock_minimo: 2 }
    ]
  }
];
