import { static_files } from './cache-manifest.js';

const STATIC_ASSETS = 'static-__timestamp__';

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(STATIC_ASSETS).then(function (cache) {
			cache.addAll(static_files);
		})
	);
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(async keys => {
			// delete old caches
			for (const key of keys) {
				if (key !== STATIC_ASSETS) await caches.delete(key);
			}
			self.clients.claim();
		})
	);
});

self.addEventListener('fetch', event => {
	const url = new URL(event.request.url);

	// don't try to handle e.g. data: URIs
	if (!url.protocol.startsWith('http')) return;

	// ignore dev server requests
	if (url.hostname === self.location.hostname && url.port !== self.location.port) return;

	// always serve static files and bundler-generated assets from cache
	if (
		url.host === self.location.host ||
		url.origin === 'https://fonts.gstatic.com' ||
		url.origin === 'https://fonts.googleapis.com'
	) {
		event.respondWith(
			caches.match(event.request).then(response => {
				if (response) {
					return response;
				} else {
					return fetch(event.request)
						.then(res => {
							return caches.open(STATIC_ASSETS).then(cache => {
								cache.put(event.request.url, res.clone());
							});
						})
						.catch(err => console.log(err));
				}
			})
		);
	}
});

self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});