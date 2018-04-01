self.addEventListener('install', function (event) {
	console.log("Service worker installed")
  let cacheName = 'cache-v-0';
  let filesToCache = [
  	'/',
  	'index.html',
  	'restaurant.html',
  	'css/style.css',
  	'js/main.js',
  	'js/restaurant_info.js',
  	'img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg', 'img/5.jpg', 'img/6.jpg',
  ]

  event.waitUntil(
  	caches.open(cacheName)
  	.then(cache => {
  		console.log("cache", cache.addAll);
  		return cache.addAll(filesToCache);
  	})
  )
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
    .then(function (response) {
      return response || fetch(event.request);
    })
    .catch(err => console.log("Fetch error", err))
  );
});