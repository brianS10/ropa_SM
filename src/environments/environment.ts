/**
 * Configuración de Entorno (Producción)
 * ====================================
 * Credenciales de Supabase, WhatsApp de atención y PIN de acceso.
 */

export const environment = {
  production: true,
  // URL de tu proyecto de Supabase (ejemplo: https://xyzcompany.supabase.co)
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  // Llave anónima pública de Supabase
  supabaseAnonKey: 'AQUI_VA_TU_CLAVE_ANONIMA',
  // PIN de 4 dígitos para acceder al panel de administración
  adminPin: '1234',
  // Número de WhatsApp para recibir pedidos (con clave de país, ej. México 5215582258230)
  whatsappVendedor: '5215582258230'
};
