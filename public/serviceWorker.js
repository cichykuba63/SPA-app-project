const staticCacheNP = "dev-NP"
const assets = [
  "/",
  "/index.html",
  "/css/.",
  "/sass/.",
  "/js/."
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticCacheNP).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })
