# Plataforma SaaS Multi-Tenant para Restaurantes

> Un sistema de punto de venta POS y gestión operativa basado en la nube, diseñado para resolver la fricción logística en negocios de comida a través de una arquitectura Multi-Inquilino o Multi-Tenant.

Este proyecto documenta la evolución de un menú digital estático hacia un SaaS completo. **Su desarrollo se impulsó mediante el uso de IA para escribir código de manera más rápida, potenciando la productividad y optimizando los tiempos de entrega y despliegue del proyecto, lo que permitió realizar cambios y mejoras constantes de forma ágil.**

Nació para resolver el estrés operativo de un negocio de comida real (Huaraches 'La 18'): la saturación de mensajes, la pérdida de comandas y las fugas de capital por cálculos manuales incorrectos de envío.

A partir del 10/09/2026, el sistema se encuentra desplegado en producción a través de Netlify, operando exitosamente con múltiples sucursales reales bajo un único código base.

## Arquitectura y Stack Tecnológico

El sistema opera sin servidores tradicionales de renderizado, ejecutándose directamente en el navegador del cliente para lograr latencia cero.

* **Frontend:** React (vía Babel) y Tailwind CSS para interfaces responsivas bajo principios de Glassmorphism.
* **Backend y Base de Datos:** PostgreSQL en Supabase, optimizando costos operativos.
* **Sincronización:** WebSockets nativos para actualizaciones en tiempo real en cocina, eliminando recargas de página.

## Módulos Principales

### 1. Aplicación de Clientes (menus.html)
Punto de venta orientado al consumidor final. Permite navegación, personalización de modificadores y cálculo de tarifas dinámicas de envío vía API de Geolocalización usando la **fórmula de Haversine**. Bloquea pedidos fuera de rango, resuelve codificación UTF-8 para emojis y empaqueta la transacción directo a la API de WhatsApp del local.

### 2. Panel Operativo y Administrativo (administrador.html)
El cerebro en la cocina, protegido por PIN cifrado y conexión persistente.
* **Alertas:** Notificaciones sonoras y visuales full-screen obligatorias para confirmar recepción de comandas.
* **Motor de Impresión:** Formateo de datos en un portal oculto del DOM, inyectado vía CSS estricto para miniprinters Bluetooth (58mm).
* **Gestión:** Control de inventario en tiempo real, personalización de branding y visualización de KPIs (ventas, cancelaciones, productos estrella).

### 3. Visor de Menú Gráfico
Solución alternativa con un motor de inyección de imágenes responsivo. Escucha eventos táctiles para maximizar el viewport dinámicamente al hacer scroll.

## Estructura de Datos y Seguridad con RLS

El modelo relacional (`schema.sql`) delega la seguridad directamente al motor de la base de datos mediante Row Level Security (RLS) en tres capas:
* **Capa Pública (MENU DIGITAL):** Permisos de lectura de inventario e inserción estricta de pedidos. Sin permisos de alteración.
* **Capa de Sucursal (ADMIN):** Privilegios de modificación encapsulados matemáticamente al `tienda_id` correspondiente.
* **Capa Superior (OLMAIRY):** Acceso global para registrar tenants y administrar la infraestructura.

## Historial de Versiones: Migración ETL y Estabilización SaaS

Migración exitosa de 1,147 pedidos históricos desde la base de datos original (legacy) hacia la nueva arquitectura multi-tenant, garantizando la preservación de métricas y la integridad referencial.
* **Data Pruning:** Limpieza de columnas, eliminando pedidos de prueba que se hicieron a lo largo del tiempo con nombre "prueba" o teléfono ficticio "5555555555", se hizo la adaptación a campos dinámicos (`JSONB`) y reglas `NOT NULL`.
* **Sincronización de IDs:** Truncado con `RESTART IDENTITY` y ajuste del secuenciador `setval` para evitar colisiones.
* **Estandarización:** Transición masiva de estados (`entregado` → `despachado`) para compatibilidad del dashboard y correcto funcinamiento de las metricas.
* **Purga de Pruebas:** Eliminación de registros de desarrollo para asegurar analíticas 100% precisas.
