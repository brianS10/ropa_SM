# 👕 Sistema de Ropa - Catálogo y Punto de Venta (POS)

¡Hola! Este es mi sistema para gestión de tienda de ropa. Está diseñado tanto para que los clientes puedan ver el catálogo en línea y hacer pedidos directos por WhatsApp, como para administrar las ventas en el mostrador físico, controlar el stock y registrar los cobros del día.

Toda la aplicación está construida con **Angular**, estilizada con **Tailwind CSS** y conectada a **Supabase** para la base de datos y almacenamiento de fotos.

---

## ✨ ¿Qué incluye el sistema?

### 🛍️ Para los Clientes (Público)
* **Catálogo Digital (`/catalogo`):** Vista de todos los productos disponibles con filtros por categoría (Hombre, Mujer, Niño, etc.), buscador en tiempo real y opción de ocultar productos agotados.
* **Tienda con Carrito (`/tienda`):** Permite elegir tallas, colores, agregar al carrito con animación y enviar el pedido listo por WhatsApp a la tienda.
* **Ficha del Producto:** Galería de fotos a pantalla completa, descripción y selector de variantes disponibles.

### 💼 Para el Administrador (`/admin`)
* **Acceso seguro con PIN:** Teclado numérico rápido (el PIN predeterminado es `1234`).
* **Punto de Venta Rápido (POS) (`/venta-rapida`):**
  * Cobro inmediato en mostrador.
  * Botones rápidos de billetes para calcular el cambio del cliente.
  * Múltiples métodos de pago (Efectivo, Transferencia, Tarjeta, etc.).
  * Generación e impresión de tickets de venta.
* **Control de Inventario (`/inventario`):**
  * Alta y edición de prendas con fotos subidas directamente a Supabase Storage.
  * Manejo de variantes por talla y color con su propio stock.
  * Herramienta de **Reabastecimiento Rápido** para sumar stock sin entrar producto por producto.
  * Alertas automáticas de stock bajo y agotado.
* **Gestión de Pedidos (`/pedidos`):**
  * Listado de pedidos hechos por clientes vía web.
  * Cambio de estados (Pendiente, Confirmado, Entregado, Cancelado).
  * Botón directo para contactar al cliente por WhatsApp con un solo clic.
* **Historial de Ventas y Corte de Caja (`/ventas/historial`):**
  * Registro de todas las ventas realizadas por fecha.
  * Resumen del día con total recaudado y desglose por método de pago.
* **Modo Oscuro / Claro:** Alternador de tema visual accesible desde cualquier pantalla.

---

## 🚀 Cómo ponerlo a funcionar en tu computadora

### 1. Requisitos previos
* Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### 2. Instalar dependencias
Abre la terminal en la carpeta del proyecto y corre:
```bash
npm install
```

### 3. Iniciar el servidor local
Para levantar la aplicación en modo desarrollo:
```bash
npm start
```
Abre tu navegador en: [http://localhost:4200](http://localhost:4200)

> También puedes usar `npm run dev`, ambos comandos funcionan igual.

### 4. Compilar para producción
Si vas a subir la página a un hosting (como Vercel, Netlify, etc.):
```bash
npm run build
```
Los archivos finales quedarán listos dentro de la carpeta `dist/`.

---

## 🔐 Acceso al Administrador

1. Entra a `/admin` o haz clic en el botón de candado / administración en la barra inferior.
2. Ingresa el PIN: **`1234`** (puedes cambiarlo en el archivo `src/app/core/constantes/constantes.ts`).

---

## 🗄️ Base de Datos (Supabase)

La app ya viene configurada con las credenciales en `src/environments/environment.ts`. 

Si necesitas recrear la base de datos o configurar tu propio proyecto en Supabase:
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al editor SQL de Supabase y ejecuta los scripts `.sql` incluidos en la raíz del proyecto (`schema.sql`, `pedidos.sql`, etc.) para crear las tablas de `productos`, `variantes_producto`, `ventas`, `detalles_venta` y `pedidos`.
3. Crea un bucket público en Storage llamado `productos` para poder subir fotos.

---

## 📁 Estructura del Código

Para que el proyecto sea muy fácil de entender y mantener, está organizado así:

```text
src/
├── app/
│   ├── core/                  # El "cerebro" de la app
│   │   ├── constantes/        # Tallas, colores, métodos de pago, etc.
│   │   ├── guards/            # Protección de rutas del administrador
│   │   ├── modelos/           # Tipos de datos (Producto, Venta, Pedido)
│   │   ├── servicios/         # Conexión con Supabase, carrito, ventas, tema
│   │   └── utilidades/        # Funciones de apoyo (formato de dinero, WhatsApp)
│   │
│   ├── compartido/            # Componentes reutilizables
│   │   └── componentes/       # Botones, iconos, modales, tarjeta de producto, barra
│   │
│   └── paginas/               # Cada una de las vistas de la app
│       ├── inicio/            # Página de bienvenida
│       ├── catalogo/          # Catálogo para clientes
│       ├── tienda/            # Tienda y carrito de compras
│       ├── admin-login/       # Teclado de PIN de acceso
│       └── admin/             # Panel, Punto de Venta, Inventario, Pedidos, Historial
│
├── environments/              # Variables y llaves de Supabase
├── assets/                    # Imágenes y recursos locales
└── styles.css                 # Estilos globales y Tailwind CSS
```

---

Listo para usar y seguir mejorando. ¡A vender! 🚀
