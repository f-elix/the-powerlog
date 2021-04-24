/// <reference lib="WebWorker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'static-cache-v1';

const FILES_TO_CACHE: string[] = ['/offline.html'];

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
	self.skipWaiting();
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key): string | boolean | Promise<boolean> => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
					return key;
				})
			)
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (e) => {
	if (e.request.mode !== 'navigate') {
		return;
	}
	e.respondWith(
		fetch(e.request).catch(() =>
			caches.open(CACHE_NAME).then((cache) => cache.match('offline.html'))
		)
	);
});
