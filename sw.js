// VALDHEIM - service worker de la vitrina (instalabilidad PWA).
// Solo atiende GET del mismo origen: navegacion red-primero,
// estaticos cache-primero con refresco; todo lo demas pasa directo.
var CACHE = "valdheim-vitrina-v1";
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function(r){
      var copia = r.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copia); });
      return r;
    }).catch(function(){ return caches.match(req); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(enCache){
    var red = fetch(req).then(function(r){
      if (r && r.ok) { var copia = r.clone(); caches.open(CACHE).then(function(c){ c.put(req, copia); }); }
      return r;
    }).catch(function(){ return enCache; });
    return enCache || red;
  }));
});
