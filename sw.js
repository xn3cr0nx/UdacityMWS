self.addEventListener("install", function(event) {
  console.log("Service worker installed");
  let cacheName = "cache-v-0";
  let filesToCache = [
    "/",
    "index.html",
    "restaurant.html",
    "css/styles.css",
    "css/styles600.css",
    "css/styles800.css",
    "css/styles1000.css",
    "js/main.js",
    "js/restaurant_info.js",
    "js/dbhelper.js",
    "js/idb.js",
    "js/swRegister.js",
    "img/placeholder.webp",
    "img/1.webp",
    "img/2.webp",
    "img/3.webp",
    "img/4.webp",
    "img/5.webp",
    "img/6.webp",
    "img/7.webp",
    "img/8.webp",
    "img/9.webp",
    "img/10.webp"
  ];

  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
      .catch(err => console.log("error", err))
  );
});

self.addEventListener("fetch", function(event) {
  url = new URL(event.request.url);
  event.respondWith(
    caches
      .match(url.pathname)
      .then(function(response) {
        return response || fetch(event.request);
      })
      .catch(err => console.log("Fetch error", err))
  );
});
