const C = "hisab-v5";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "index.html", "manifest.json"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || u.hostname === "www.gstatic.com";
  if (!ok) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(hit => {
      const net = fetch(r).then(res => {
        if (res && res.ok) {
          const cp = res.clone();
          caches.open(C).then(c => c.put(r, cp));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
