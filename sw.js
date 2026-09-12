// Cambia este número de versión (ej. v3, v4) cada vez que hagas un cambio GIGANTE en tu código HTML.
const CACHE_NAME = 'saas-menu-v3'; 

// INSTALACIÓN: Obliga a la nueva versión a tomar el control inmediatamente
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// ACTIVACIÓN: Borra cualquier caché viejo que haya quedado en el celular del cliente
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando caché antiguo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ESTRATEGIA "NETWORK FIRST" (La clave del éxito)
self.addEventListener('fetch', (event) => {
    // NUNCA cachear las llamadas a la base de datos de Supabase (para que los pedidos y precios sean siempre en vivo)
    if (event.request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Si hay internet y Netlify responde, guardamos una copia fresca y la mostramos
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Si el cliente NO tiene internet o hay mala señal, le mostramos la copia guardada (Caché)
                return caches.match(event.request);
            })
    );
});