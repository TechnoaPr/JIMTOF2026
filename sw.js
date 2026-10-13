// オフライン対策：アプリ本体を端末に保存し、電波が弱くても開けるようにします。
// index.html などを更新したら、下の版数（v1）を v2, v3… と上げてください。
const CACHE = "jimtof2026x-v1";
const SHELL = ["./", "./index.html", "./data.csv", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 同じサイト内のファイルは「まずネット、だめなら保存分」。スプレッドシートの読み込みには関与しません。
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
