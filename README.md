# Huaraches La 18 | Plataforma SaaS Multi-Tenant

Este proyecto documenta la evolución de un menú digital estático hacia un 
Software as a Service completo. Nació para resolver el estrés operativo de 
un negocio de comida real: la saturación de mensajes, la pérdida de comandas 
en WhatsApp y las fugas de dinero por calcular de forma incorrecta las 
distancias de envío.

La arquitectura actual está diseñada bajo un modelo multi-inquilino. Esto 
significa que un solo código base es capaz de alojar y operar el menú, los 
inventarios y las ventas de múltiples sucursales o restaurantes de forma 
independiente, aislando la información a través de identificadores únicos 
en la base de datos.

---

## Arquitectura y Stack Tecnológico

El sistema opera sin servidores tradicionales de renderizado, ejecutándose 
directamente en el navegador del cliente para lograr la máxima velocidad y 
menor latencia posible.

* Frontend: Construido con React (procesado en vivo vía Babel) y Tailwind CSS 
  para lograr una interfaz responsiva, ligera y con principios Glassmorphism.
* Backend y Base de Datos: PostgreSQL alojado en Supabase.
* Sincronización: WebSockets nativos para eliminar las recargas de página y 
  mantener la cocina actualizada al segundo.

---

## Módulos Principales

### 1. Aplicación de Clientes (menus.html)
Es el punto de venta de cara al usuario. El cliente navega por el menú, 
personaliza sus modificadores (por ejemplo, sin cebolla, con quesillo extra) 
y arma su orden. 

El sistema intercepta el cierre de la venta para calcular la distancia en 
línea recta usando la API de Geolocalización del navegador. Si el cliente 
está dentro del radio de cobertura, tarifa el costo de envío de manera 
automática; si está fuera, bloquea la venta. Finalmente, empaqueta la 
transacción, resuelve la codificación UTF-8 para que se generen los emojis sin problema alguno y la envía directamente a la 
API de WhatsApp del restaurante.

### 2. Panel Operativo y Administrativo (administrador.html)
El cerebro del negocio en la cocina. Protegido por un PIN de acceso cifrado, 
este panel mantiene una conexión persistente con la base de datos.

* Recepción de Comandas: Cuando un cliente finaliza un pedido, el panel 
  lanza una alerta sonora y visual de pantalla completa que obliga al 
  operador a confirmar de enterado.
* Motor de Impresión Térmica: Formatea los datos del pedido en un portal 
  oculto del DOM y los inyecta en el sistema operativo mediante reglas CSS 
  estrictas, optimizadas para miniprinters de 58mm.
* Gestión del Local: Permite al dueño modificar su inventario, apagar 
  productos agotados, cambiar sus colores de marca, subir su logotipo a 
  un servidor de almacenamiento y abrir/cerrar tienda y unas métricas sencillas que son: producto + y - vendido por semana/mes,
  pedidos cancelados, ingresos generados con los pedidos completados.

### 3. Visor de Menú Gráfico (menu-imagenes.html)
Una solución alterna para sucursales que requieren mostrar su carta 
escaneada o en fotografías. Implementa un motor de inyección de imágenes 
responsivo y un botón fijo en la interfaz, el cual escucha el comportamiento 
táctil del usuario para maximizar el espacio visual al hacer scroll.

---

## Estructura de Datos y Seguridad

El archivo schema.sql contiene el diseño relacional del proyecto. La 
seguridad está delegada al motor de la base de datos mediante políticas de 
seguridad a nivel de fila RLS, divididas en tres niveles 
operativos:

1. Capa Pública: El consumidor final solo tiene permisos de lectura sobre 
   el inventario abierto y permiso de inserción estricta en la tabla de 
   pedidos. No puede alterar ni borrar información.

2. Capa de Sucursal (Tenant): El dueño del restaurante tiene privilegios 
   de modificación pero están encapsulados matemáticamente a los registros 
   que coinciden con el identificador de su tienda.

3. Capa Superior (OLMAIRY): Privilegios absolutos sobre la infraestructura 
   para registrar nuevos restaurantes, modificar parámetros globales o 
   suspender cuentas.
