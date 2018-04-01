self.addEventListener('install', function (event) {
	console.log("Service worker installed")
  let cacheName = 'cache-v-0';
  let filesToCache = [
  	'/',
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'js/main.js',
    'js/restaurant_info.js',
    'js/dbhelper.js',
    'data/restaurants.json',
    'img/resp/1-original.jpg', 'img/resp/1-small.jpg', 'img/resp/1-medium.jpg', 'img/resp/1-large.jpg', 
    'img/resp/2-original.jpg', 'img/resp/2-small.jpg', 'img/resp/2-medium.jpg', 'img/resp/2-large.jpg', 
    'img/resp/3-original.jpg', 'img/resp/3-small.jpg', 'img/resp/3-medium.jpg', 'img/resp/3-large.jpg', 
    'img/resp/4-original.jpg', 'img/resp/4-small.jpg', 'img/resp/4-medium.jpg', 'img/resp/4-large.jpg', 
    'img/resp/5-original.jpg', 'img/resp/5-small.jpg', 'img/resp/5-medium.jpg', 'img/resp/5-large.jpg', 
    'img/resp/6-original.jpg', 'img/resp/6-small.jpg', 'img/resp/6-medium.jpg', 'img/resp/6-large.jpg', 
    'img/resp/7-original.jpg', 'img/resp/7-small.jpg', 'img/resp/7-medium.jpg', 'img/resp/7-large.jpg', 
    'img/resp/8-original.jpg', 'img/resp/8-small.jpg', 'img/resp/8-medium.jpg', 'img/resp/8-large.jpg', 
    'img/resp/9-original.jpg', 'img/resp/9-small.jpg', 'img/resp/9-medium.jpg', 'img/resp/9-large.jpg', 
    'img/resp/10-original.jpg', 'img/resp/10-small.jpg', 'img/resp/10-medium.jpg', 'img/resp/10-large.jpg'
  ]

  event.waitUntil(
  	caches.open(cacheName)
  	.then(cache => {
  		return cache.addAll(filesToCache);
  	})
    .catch(err => console.log("error", err))
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