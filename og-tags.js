export default async (request, context) => {
    const url = new URL(request.url);
    
    // 1. Solo interceptar si están pidiendo una vista HTML o la raíz '/'
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
        return context.next();
    }

    // 2. Dejamos que Netlify cargue tu HTML normal
    const response = await context.next();
    
    // Verificamos que sea un documento HTML válido
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
        return response;
    }

    let html = await response.text();
    
    const hostname = url.hostname.replace('www.', '');
    // PON AQUÍ TU DOMINIO GENÉRICO SI ES DISTINTO
    const saasDomains = ['menus-delivery.netlify.app', 'localhost', '127.0.0.1'];
    let tiendaId = url.searchParams.get('tienda');

    const SUPABASE_URL = 'https://srhdgocsmswxidrwguhc.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_pWKDoEBfP3l2ggqYh_l7IA_SNq1Esfz';

    try {
        // 3. ¿Están usando un dominio privado (midominio.online)?
        if (!saasDomains.includes(hostname)) {
            // Vamos a Supabase a preguntar de quién es este dominio
            const domRes = await fetch(`${SUPABASE_URL}/rest/v1/tiendas?dominio_personal=ilike.*${hostname}*&select=id`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const domData = await domRes.json();
            if (domData && domData.length > 0) {
                tiendaId = domData[0].id; // ¡Descubierto!
            }
        }

        // Si no detectamos ID por dominio ni por URL, asumimos la tienda 1
        tiendaId = tiendaId || 1;

        // 4. Traemos la info visual de la tienda
        const tiendaRes = await fetch(`${SUPABASE_URL}/rest/v1/tiendas?id=eq.${tiendaId}&select=nombre,logo_url,mensaje_bienvenida`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const tiendaData = await tiendaRes.json();

        // 5. INYECCIÓN DE METADATOS PARA WHATSAPP
        if (tiendaData && tiendaData.length > 0) {
            const tienda = tiendaData[0];
            
            const ogTags = `
                <meta property="og:title" content="Menú Digital | ${tienda.nombre}" />
                <meta property="og:description" content="${tienda.mensaje_bienvenida || 'Pide rápido, fácil y seguro hasta tu casa.'}" />
                <meta property="og:image" content="${tienda.logo_url}" />
                <meta property="og:url" content="${url.href}" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="${tienda.logo_url}" />
            `;
            
            // Metemos todo este código justo antes de que termine el <head> de tu HTML original
            html = html.replace('</head>', `${ogTags}\n</head>`);
        }
    } catch (error) {
        console.error("Error en Edge Function OG Tags:", error);
    }

    // 6. Entregamos el HTML ya disfrazado con el logo de la tienda
    return new Response(html, {
        status: response.status,
        headers: response.headers
    });
};