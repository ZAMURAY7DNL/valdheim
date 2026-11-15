// Service worker minimo de VALDHEIM: habilita "Instalar app" en el movil.
// No guarda NADA en cache: el juego siempre se sirve fresco de la red.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (evento) => evento.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
