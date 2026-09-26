# MENUS-DELIVERY-MULTITENANT | Plataforma de Menú Digital

Un sistema SaaS multi-inquilino diseñado para 
digitalizar restaurantes. Permite gestionar menús en tiempo real, 
procesar pedidos y administrar múltiples sucursales desde un único 
panel de control central (Super Admin).

---

## La Evolución del Proyecto

El sistema nació como un Producto Mínimo Viable (MVP) construido con 
un único archivo HTML/CSS estático y datos "hardcodeados".

Hoy, es una Single Page Application (SPA) escalable, reescrita con 
React, Vite y conectada a un backend relacional en Supabase (PostgreSQL), 
soportando múltiples inquilinos con seguridad de nivel fila (RLS).

---

## Características Principales

### Super Admin (Panel Maestro)
- **Gestión Multi-Tenant:** Creación de tiendas con URLs únicas (slugs) y 
  acceso protegido por PIN.
- **Inyector de Menús IA (Bulk Insert):** Inserción masiva de productos y 
  categorías mediante JSON, protegido contra inyecciones SQL.

<<<<<<< HEAD
### Admin por Tienda (Dashboard)
=======
## Admin por Tienda (Dashboard)
>>>>>>> 718c3b5c37685c5c7c2cef91b07385a58f8534ab
- **Gestión de Inventario:** CRUD de categorías, productos y extras.
- **Pedidos en Tiempo Real:** Notificaciones al instante.
- **Auto-Print:** Generación automática de tickets térmicos.
- **Analítica:** Panel de métricas con filtros de fechas.

<<<<<<< HEAD
### Interfaz de Cliente (Storefront)
=======
## Interfaz de Cliente (Storefront)
>>>>>>> 718c3b5c37685c5c7c2cef91b07385a58f8534ab
- **Experiencia App-like:** Navegación rápida y optimizada.
- **Checkout Dual:** Soporte para entregas a domicilio (validación por GPS) 
  y recolección en tienda (Pickup).

---

## Stack Tecnológico

- **Frontend:** React 18, Vite, React Router DOM, TailwindCSS
- **Backend & DB:** Supabase (PostgreSQL, Auth, Storage)
<<<<<<< HEAD
- **Despliegue:** Netlify

---
=======
- **Despliegue:** Netlify : https://menus-delivery.netlify.app/home?tienda=PRUEBAS
>>>>>>> 718c3b5c37685c5c7c2cef91b07385a58f8534ab
