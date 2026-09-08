/**
 * Enrutamiento de la Aplicación
 * ==============================
 * Configuración de rutas públicas (catálogo, tienda, inicio) y
 * rutas privadas protegidas por el guardián de administrador (POS, inventario, pedidos).
 */

import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Rutas Públicas
  {
    path: '',
    loadComponent: () => import('./paginas/inicio/inicio.component').then(m => m.InicioComponent),
    title: 'Sistema de Ropa | Inicio'
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./paginas/catalogo/catalogo.component').then(m => m.CatalogoComponent),
    title: 'Catálogo de Productos'
  },
  {
    path: 'tienda',
    loadComponent: () => import('./paginas/tienda/tienda.component').then(m => m.TiendaComponent),
    title: 'Tienda en Línea'
  },
  {
    path: 'tienda/carrito',
    loadComponent: () => import('./paginas/tienda/tienda-carrito/tienda-carrito.component').then(m => m.TiendaCarritoComponent),
    title: 'Cesta de Compras'
  },
  {
    path: 'admin',
    loadComponent: () => import('./paginas/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Acceso Administrador'
  },

  // Panel Administrativo Protegido con Layout Base
  {
    path: '',
    loadComponent: () => import('./paginas/admin/panel/panel.component').then(m => m.PanelAdminComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: 'tablero',
        loadComponent: () => import('./paginas/admin/tablero/tablero.component').then(m => m.TableroComponent),
        title: 'Panel de Control | Resumen'
      },
      {
        path: 'venta-rapida',
        loadComponent: () => import('./paginas/admin/venta-rapida/venta-rapida.component').then(m => m.VentaRapidaComponent),
        title: 'Punto de Venta | Cobrar'
      },
      {
        path: 'inventario',
        loadComponent: () => import('./paginas/admin/inventario/inventario.component').then(m => m.InventarioComponent),
        title: 'Inventario de Productos'
      },
      {
        path: 'inventario/agregar',
        loadComponent: () => import('./paginas/admin/inventario/formulario-producto/formulario-producto.component').then(m => m.FormularioProductoComponent),
        title: 'Nuevo Producto'
      },
      {
        path: 'inventario/reabastecer',
        loadComponent: () => import('./paginas/admin/inventario/reabastecer/reabastecer.component').then(m => m.ReabastecerComponent),
        title: 'Reabastecer Inventario'
      },
      {
        path: 'inventario/:id',
        loadComponent: () => import('./paginas/admin/inventario/formulario-producto/formulario-producto.component').then(m => m.FormularioProductoComponent),
        title: 'Editar Producto'
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./paginas/admin/pedidos/pedidos.component').then(m => m.PedidosComponent),
        title: 'Gestión de Pedidos'
      },
      {
        path: 'ventas/historial',
        loadComponent: () => import('./paginas/admin/ventas/historial/historial-ventas.component').then(m => m.HistorialVentasComponent),
        title: 'Historial de Ventas'
      },
      {
        path: 'arreglar-datos',
        loadComponent: () => import('./paginas/admin/arreglar-datos/arreglar-datos.component').then(m => m.ArreglarDatosComponent),
        title: 'Diagnóstico de Base de Datos'
      }
    ]
  },

  // Ruta comodín para redirigir cualquier enlace desconocido al inicio
  {
    path: '**',
    redirectTo: ''
  }
];
