const CACHE='tm-material-v127-login-test-logo-fix';
const ASSETS=['./','./index.html','./thaden-logo-v87.png','./thaden-logo-pdf.png','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return r}).catch(()=>caches.match('./index.html'))); return;} e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy));} return r}).catch(()=>caches.match(e.request))); });
