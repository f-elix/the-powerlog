/// <reference lib="WebWorker" />

import type { IDBPDatabase } from 'idb';

export type {};
declare const self: ServiceWorkerGlobalScope;
declare const idb: any;

type SerializedRequest = {
	headers: Record<string, string>;
	url: string;
	method: string;
	mode: RequestMode;
	credentials: RequestCredentials;
	cache: RequestCache;
	redirect: RequestRedirect;
	referrer: string;
	body?: string;
};

type Queue = {
	enqueue: (value: any) => number;
	dequeue: () => any;
	isEmpty: () => boolean;
	toArray: () => any[];
};

self.importScripts('/idb.js');

const createQueue = (initialItems?: any[]): Queue => {
	const items = initialItems || [];

	const enqueue = (value: any) => items.unshift(value);

	const dequeue = () => items.pop();

	const isEmpty = () => items.length === 0;

	const toArray = (): any[] => items.slice();

	return {
		enqueue,
		dequeue,
		isEmpty,
		toArray
	};
};

const serialize = async (request: Request): Promise<SerializedRequest> => {
	const headers = Array.from(request.headers.entries()).reduce(
		(obj: Record<string, string>, [key, val]) => {
			const result = obj;
			result[key] = val;
			return result;
		},
		{}
	);
	const serialized: SerializedRequest = {
		headers,
		url: request.url,
		method: request.method,
		mode: request.mode,
		credentials: request.credentials,
		cache: request.cache,
		redirect: request.redirect,
		referrer: request.referrer,
		body: undefined
	};
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		const body = await request.text();
		serialized.body = body;
	}
	return serialized;
};

const deserialize = (data: SerializedRequest): Request => new Request(data.url, data);

const processQueue = async (queue: Queue) => {
	if (queue.isEmpty()) {
		return;
	}
	const serializedReq = queue.dequeue() as SerializedRequest;
	const req = deserialize(serializedReq);
	try {
		await fetch(req);
	} catch (error) {
		// Ignore errors
	}
	await processQueue(queue);
};

const STATIC_CACHE = 'static-cache-v1';
const FILES_TO_CACHE: string[] = ['/offline.html'];
const DB_NAME = 'powerlog-db';
const POST_STORE = 'post-requests';

const getDb = async () =>
	idb.openDB(DB_NAME, 1, {
		upgrade: (db: IDBPDatabase) => {
			db.createObjectStore(POST_STORE);
		}
	});

const syncPostRequests = async () => {
	const dbPromise: IDBPDatabase = await getDb();
	const queue = createQueue((await dbPromise.get(POST_STORE, 'queue')) || []);
	await processQueue(queue);
	dbPromise.delete(POST_STORE, 'queue');
};

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE)));
	self.skipWaiting();
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key): string | boolean | Promise<boolean> => {
					if (key !== STATIC_CACHE) {
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
	e.respondWith(
		(async function () {
			const { request } = e;
			const reqClone = request.clone();
			const cache = await caches.open(STATIC_CACHE);
			return fetch(request)
				.then((res) => {
					cache.put(request.url, res.clone());
					return res;
				})
				.catch(async (err) => {
					if (request.method === 'POST') {
						const dbPromise: IDBPDatabase = await getDb();
						const queue = createQueue((await dbPromise.get(POST_STORE, 'queue')) || []);
						const serializedReq = await serialize(reqClone);
						queue.enqueue(serializedReq);
						await dbPromise.put(POST_STORE, queue.toArray(), 'queue');
					}
					const response = ((await cache.match(request.url)) as unknown) as Response;
					if (response) {
						return response;
					}
					throw err;
				});
		})()
	);
});

self.addEventListener('sync', async (e) => {
	if (e.tag !== 'bg-sync') {
		return;
	}
	await syncPostRequests();
});

self.addEventListener('message', async (e) => {
	if (e.data !== 'bg-sync') {
		return;
	}
	await syncPostRequests();
});
