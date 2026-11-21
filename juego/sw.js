// Service worker de VALDHEIM: habilita "Instalar app" en el movil y
// sirve los activos del juego desde la cache verificada por huella
// que llena la precarga de la entrada (visor_comun.ts).
//
// A PRUEBA DE VERSIONES VIEJAS: esta cache SOLO contiene archivos
// cuya huella SHA-256 coincidio con la lista vigente del servidor al
// descargarlos; lo que no esta en la cache va a la red, como siempre.
// El HTML jamas se intercepta: las paginas se sirven frescas.
const CACHE_ACTIVOS = "valdheim-activos-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (evento) => {
  evento.waitUntil((async () => {
    // Formatos de cache anteriores: fuera. Ninguna version vieja
    // puede quedar sirviendo archivos tras una actualizacion.
    for (const nombre of await caches.keys()) {
      if (nombre.startsWith("valdheim-") && nombre !== CACHE_ACTIVOS) {
        await caches.delete(nombre);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET") return;
  if (peticion.mode === "navigate") return;
  if (peticion.headers.has("range")) return;
  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) return;
  if (!/\/(arte|audio|assets|heroes|iconos|interfaz)\//.test(url.pathname)) return;
  evento.respondWith((async () => {
    try {
      const cache = await caches.open(CACHE_ACTIVOS);
      const guardada = await cache.match(peticion, { ignoreSearch: true });
      if (guardada) return guardada;
    } catch {
      // Sin cache disponible: a la red, como siempre.
    }
    return fetch(peticion);
  })());
});
