const APP_PREFIX = "shiny-lamp-";
const VERSION = "v01";
const CACHE_NAME = `${APP_PREFIX}${VERSION}`;

//list all files to cache
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./js/idb.js",
  "./js/index.js",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
  "./css/styles.css",
];

// install eventListener
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`${CACHE_NAME} is installing cache`);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// enable eventListener
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      let keep = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      keep.push(CACHE_NAME);
      return Promise.all(
        keyList.map(function (key, index) {
          if (keep.indexOf(key) === -1) {
            console.log(`${keyList[i]} is being removed`);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// fetch eventListener
self.addEventListener("fetch", function (event) {
  console.log(`${event.request.url} is being requested`);
  event.respondWith(
    caches.match(event.request).then(function (request) {
      // if no request fetch else return request
      if (!request) {
        console.log(`${event.request.url} is not being cached, re-fetching...`);
        return fetch(event.request);
      } else {
        console.log(`${event.request.url} is the response cache`);
        return request;
      }
    })
  );
});