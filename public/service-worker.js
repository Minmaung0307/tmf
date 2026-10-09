const CACHE='tmf-free-v5.6.2';
const ASSETS=['./','./index.html','./style.css','./compact-layout.css','./app.js','./search.js','./config.js','./cloud.js','./community-ui.js','./media.js','./submissions.js','./contribution.js','./site-footer.js','./privacy.html','./terms.html','./place-model.js','./cloud-config.js','./favicon.svg','./icons/brand.svg','./art/pagoda.svg','./directory.json','./manifest.webmanifest','./events.json','./images/event-placeholder.jpg','./icons/icon-192.png','./vendor/leaflet/leaflet.js','./vendor/leaflet/leaflet.css'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tmf-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 // External map tiles are never prefetched or cached by this service worker.
 if(event.request.method!=='GET'||url.origin!==self.location.origin||/\/admin(?:-places)?(?:\.html|\.js|\.css)$/.test(url.pathname))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}return response;}).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return(await caches.match(new URL('./index.html',self.registration.scope)))||Response.error();return Response.error();}));
});
