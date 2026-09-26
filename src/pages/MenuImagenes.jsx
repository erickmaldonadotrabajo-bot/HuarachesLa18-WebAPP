import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';

const getCleanDomain = () => {
    let hostname = window.location.hostname;
    hostname = hostname.replace(/^www\./, '');
    hostname = hostname.split(':')[0];
    return hostname.trim().toLowerCase();
};

const isPremiumDomain = () => {
    const cleanHostname = getCleanDomain();
    return (
        cleanHostname !== 'localhost' &&
        cleanHostname !== '127.0.0.1' &&
        !cleanHostname.endsWith('netlify.app') &&
        !cleanHostname.endsWith('netlify.com') &&
        !cleanHostname.endsWith('vercel.app')
    );
};

export default function MenuImagenes() {
    const [searchParams] = useSearchParams();
    const parametroTienda = searchParams.get('tienda');

    const [tienda, setTienda] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // ESTILOS INYECTADOS
    const InjectedStyles = () => (
        <style>{`
            :root {
                --color-primary: ${tienda?.color_primario || '#f97316'};
                --color-secondary: ${tienda?.color_secundario || '#ef4444'};
                --color-bg: ${tienda?.color_fondo || '#111827'};
            }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
            @keyframes slide-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            .loader { 
                border: 4px solid rgba(255,255,255,0.1); 
                border-top: 4px solid var(--color-primary); 
                border-radius: 50%; 
                width: 50px; 
                height: 50px; 
                animation: spin 1s linear infinite; 
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
    );

    useEffect(() => {
        const fetchTienda = async () => {
            try {
                let data = null;
                const cleanHostname = getCleanDomain();
                const premium = isPremiumDomain();

                if (premium) {
                    const { data: resData, error } = await supabase
                        .from('tiendas')
                        .select('*')
                        .ilike('dominio_personal', cleanHostname)
                        .maybeSingle();

                    if (error) throw new Error(`Error BD: ${error.message}`);
                    if (!resData) throw new Error(`El dominio [${cleanHostname}] no está asignado.`);
                    data = resData;
                } else {
                    if (!parametroTienda || parametroTienda.trim() === '') {
                        throw new Error("ERROR.");
                    }

                    let query = supabase.from('tiendas').select('*');
                    if (/^\d+$/.test(parametroTienda)) {
                        query = query.eq('id', parseInt(parametroTienda));
                    } else {
                        query = query.eq('slug', parametroTienda);
                    }

                    const { data: resData, error } = await query.single();
                    if (error || !resData) throw new Error("La tienda solicitada no existe.");
                    data = resData;
                }

                setTienda(data);
                document.title = `Menú | ${data.nombre}`;

                // Parsear las imágenes del menú
                if (data.menu_imagenes_url) {
                    const urlsArray = data.menu_imagenes_url
                        .split(',')
                        .map(url => url.trim())
                        .filter(url => url.length > 0);
                    setImagenes(urlsArray);
                }

            } catch (err) {
                console.error("Error cargando el menú de imágenes:", err);
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTienda();
    }, [parametroTienda]);

    // PANTALLAS DE ESTADO
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <InjectedStyles />
                <div className="loader"></div>
            </div>
        );
    }

    if (errorMsg || !tienda) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center bg-gray-900">
                <InjectedStyles />
                <div className="bg-red-900/40 border border-red-500 p-6 rounded-2xl max-w-sm animate-fade-in-down">
                    <h2 className="text-xl font-bold mb-2 text-white">Tienda no encontrada</h2>
                    <p className="text-red-300 text-sm mb-4">{errorMsg}</p>
                    <Link to="/" className="text-gray-300 text-sm underline hover:text-white transition-colors">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    const premium = isPremiumDomain();
    const identificador = tienda.slug || tienda.id;
    
    // ENLACES INTELIGENTES
    const linkInicio = premium ? '/home' : `/home?tienda=${identificador}`;
    const linkMenus = premium ? '/menu' : `/menu?tienda=${identificador}`;

    // RENDER PRINCIPAL
    return (
        <div className="min-h-screen pb-10 text-white bg-[var(--color-bg)] font-sans">
            <InjectedStyles />
            <div className="animate-fade-in-down">
                {/* Elemento bloque cabecera con fijacion magnetica (sticky) */}
                <div className="sticky top-0 backdrop-blur-xl p-4 text-center z-50 border-b border-gray-800 shadow-lg" style={{ backgroundColor: 'var(--color-bg)CC' }}>
                    <h1 className="font-black text-2xl tracking-widest uppercase drop-shadow-md" style={{ color: tienda.color_primario || '#f97316' }}>
                        NUESTRO MENÚ
                    </h1>
                    <Link to={linkInicio} className="text-gray-400 text-sm font-bold mt-1 inline-block hover:text-white transition-colors">
                        ⬅ Volver al inicio
                    </Link>
                </div>

                <div className="max-w-md mx-auto flex flex-col items-center gap-8 mt-6 px-4">
                    {imagenes.length > 0 ? (
                        imagenes.map((url, index) => (
                            <div key={index} className="w-full flex flex-col gap-3 animate-slide-up">
                                <img 
                                    src={url} 
                                    alt={`Menú ${tienda.nombre} página ${index + 1}`} 
                                    className="w-full rounded-2xl shadow-2xl border border-gray-700 bg-gray-800 object-cover" 
                                    loading={index === 0 ? "eager" : "lazy"} 
                                />

                                <Link 
                                    to={linkMenus} 
                                    className="block w-full text-white text-center font-black text-xl py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
                                    style={{ 
                                        background: `linear-gradient(to right, ${tienda.color_primario || '#f97316'}, ${tienda.color_secundario || '#ef4444'})`,
                                        border: `1px solid ${tienda.color_primario || '#f97316'}`
                                    }}
                                >
                                    🛵 ¡QUIERO PEDIR AHORA!
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-900/50 w-full rounded-2xl border border-gray-800">
                            <p className="text-gray-400 font-medium">Esta tienda aún no ha subido imágenes de su menú.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}