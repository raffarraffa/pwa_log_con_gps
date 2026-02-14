const NOMBRE_CACHE = 'aplicacion-v3.1.7';

const ARCHIVOS_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/service-worker.js'
];

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(NOMBRE_CACHE).then((cache) => {
            return cache.addAll(ARCHIVOS_CACHE).catch(() => Promise.resolve());
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((nombresCache) => {
            return Promise.all(
                nombresCache.map((nombre) => {
                    if (nombre !== NOMBRE_CACHE) {
                        return caches.delete(nombre);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
    const solicitud = evento.request;
    const url = new URL(solicitud.url);

    if (solicitud.method !== 'GET') {
        evento.respondWith(fetch(solicitud));
        return;
    }

    if (esRecursoEstatico(url.pathname)) {
        evento.respondWith(
            caches.match(solicitud).then((respuesta) => {
                if (respuesta) {
                    return respuesta;
                }

                return fetch(solicitud)
                    .then((respuestaRed) => {
                        if (respuestaRed.ok && esRecursoEstatico(url.pathname)) {
                            caches.open(NOMBRE_CACHE).then((cache) => {
                                cache.put(solicitud, respuestaRed.clone());
                            });
                        }
                        return respuestaRed;
                    })
                    .catch(() => caches.match('/index.html'));
            })
        );
        return;
    }

    evento.respondWith(
        fetch(solicitud)
            .then((respuestaRed) => {
                if (respuestaRed.ok) {
                    caches.open(NOMBRE_CACHE).then((cache) => {
                        cache.put(solicitud, respuestaRed.clone());
                    });
                }
                return respuestaRed;
            })
            .catch(() => {
                return caches.match(solicitud).then((respuestaCache) => {
                    if (respuestaCache) {
                        return respuestaCache;
                    }
                    return caches.match('/index.html');
                });
            })
    );
});

function esRecursoEstatico(ruta) {
    const extensiones = [
        '.js',
        '.css',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.woff',
        '.woff2',
        '.ttf',
        '.json'
    ];

    return extensiones.some((ext) => ruta.endsWith(ext));
}

self.addEventListener('sync', (evento) => {
    if (evento.tag === 'sincronizacion-datos') {
        evento.waitUntil(sincronizarDatos());
    }
});

async function sincronizarDatos() {
    return Promise.resolve();
}

self.addEventListener('push', (evento) => {
    const datos = evento.data ? evento.data.json() : {};

    const titulo = datos.title || 'Aplicacion';
    const opciones = {
        body: datos.body || 'Nueva notificacion',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231a1a2e" width="192" height="192"/><circle cx="96" cy="96" r="50" fill="%2300d4ff"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="40" fill="%2300d4ff"/></svg>',
        tag: 'notificacion-aplicacion',
        requireInteraction: false
    };

    evento.waitUntil(
        self.registration.showNotification(titulo, opciones)
    );
});

self.addEventListener('notificationclick', (evento) => {
    evento.notification.close();

    evento.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((listaClientes) => {
            for (let cliente of listaClientes) {
                if (cliente.url === '/' && 'focus' in cliente) {
                    return cliente.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

self.addEventListener('periodicsync', (evento) => {
    if (evento.tag === 'sincronizacion-periodica') {
        evento.waitUntil(manejarSincronizacionPeriodica());
    }
});

async function manejarSincronizacionPeriodica() {
    try {
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

self.addEventListener('message', (evento) => {
    if (evento.data.type === 'OMITIR_ESPERA') {
        self.skipWaiting();
    }

    if (evento.data.type === 'OBTENER_ESTADO_CACHE') {
        evento.ports[0].postMessage({
            estado: 'ok',
            versionCache: NOMBRE_CACHE
        });
    }
});
