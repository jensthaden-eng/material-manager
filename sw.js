const CACHE='tm-material-v127-pin-push-test-v2';
const ASSETS=['./','./index.html','./thaden-logo-v87.png','./thaden-logo-pdf.png','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return r}).catch(()=>caches.match('./index.html'))); return;} e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy));} return r}).catch(()=>caches.match(e.request))); });

self.addEventListener('push',event=>{let data={title:'THADEN MATERIAL',body:'Neue Meldung in der Materialverwaltung.'};try{if(event.data)data=event.data.json()}catch(e){}event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icon-192.png',badge:'./icon-192.png'}));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus()}return clients.openWindow('./')}));});
