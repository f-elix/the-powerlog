var CACHE_STATIC_NAME = 'static-v1';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME).then(function (cache) {
			cache.addAll(['/', '/index.html']);
		})
	);
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(
				keyList.map(function (key) {
					if (key !== CACHE_STATIC_NAME) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});

self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
