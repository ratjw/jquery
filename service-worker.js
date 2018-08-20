// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var dataCacheName = 'book';
var staticCacheName = 'static';
var dynamicCacheName = 'dynamic';
var staticFilesToCache = [
  './js/jquery.mousewheel.min.js',
  './js/jquery-1.12.4.min.js',
  './js/jquery-ui.min.js',
  './css/jquery-ui.min.css',
  './css/images/ui-icons_555555_256x240.png',
  './css/pic/equip/CUSA.jpg',
  './css/pic/equip/Endoscope.jpg',
  './css/pic/equip/Fluoroscope.jpg',
  './css/pic/equip/Microscope.jpg',
  './css/pic/equip/Monitor.jpg',
  './css/pic/equip/Navigator.jpg',
  './css/pic/equip/Oarm.jpg',
  './css/pic/equip/Robotics.jpg',
  './css/pic/equip/Ultrasound.jpg',
  './css/pic/general/camera.png',
  './css/pic/general/Camera2.png',
  './css/pic/general/find.png',
  './css/pic/general/logoRama.png',
  './css/pic/general/menu.png',
  './css/pic/general/nurse.png',
  './css/pic/general/pacs.png',
  './css/pic/general/pacs2.png',
  './css/pic/holiday/Asalha.png',
  './css/pic/holiday/Asalhasub.png',
  './css/pic/holiday/Chakri.png',
  './css/pic/holiday/Chakrisub.png',
  './css/pic/holiday/Constitution.png',
  './css/pic/holiday/Constitutionsub.png',
  './css/pic/holiday/King09.png',
  './css/pic/holiday/King09sub.png',
  './css/pic/holiday/King9.png',
  './css/pic/holiday/King9sub.png',
  './css/pic/holiday/King10.png',
  './css/pic/holiday/King10sub.png',
  './css/pic/holiday/Magha.png',
  './css/pic/holiday/Maghasub.png',
  './css/pic/holiday/Newyear.png',
  './css/pic/holiday/Newyearsub.png',
  './css/pic/holiday/Piya.png',
  './css/pic/holiday/Piyasub.png',
  './css/pic/holiday/Ploughing.png',
  './css/pic/holiday/Ploughingsub.png',
  './css/pic/holiday/Queen.png',
  './css/pic/holiday/Queensub.png',
  './css/pic/holiday/Songkran.png',
  './css/pic/holiday/Songkransub.png',
  './css/pic/holiday/special.png',
  './css/pic/holiday/Vassa.png',
  './css/pic/holiday/Vassasub.png',
  './css/pic/holiday/Vesak.png',
  './css/pic/holiday/Vesaksub.png',
  './css/pic/holiday/Yearend.png',
  './css/pic/holiday/Yearendsub.png',
  './css/pic/service/Admission.png',
  './css/pic/service/Admission2.png',
  './css/pic/service/Endovascular.png',
  './css/pic/service/Operation.png',
  './css/pic/service/Operation2.png',
  './css/pic/service/Radiosurgery.png',
  './css/pic/service/readmission.png',
  './css/pic/service/readmission2.png',
  './css/pic/service/record.png',
  './css/pic/service/record2.png',
  './css/pic/service/reoperation.png',
  './css/pic/service/reoperation2.png'
];
var dynamicFilesToCache = [
  './index.php',
  './nurse.html',
  './readme.pdf',
  './staff.html',
  './css/css.css',
  './css/print.css',
  './css/xcss.css',
  './js/click.js',
  './js/constant.js',
  './js/equip.js',
  './js/fill.js',
  './js/function.js',
  './js/history.js',
  './js/menu.js',
  './js/service.js',
  './js/sortable.js',
  './js/start.js',
  './js/xconstant.js',
  './js/xequip.js',
  './js/xfill.js',
  './js/xfunction.js',
  './js/xstart.js'
];
var cacheName = "neurosurgery"
var filesToCache = staticFilesToCache.concat(dynamicFilesToCache)

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
//    caches.open(staticCacheName).then(function(cache) {
//      console.log('[ServiceWorker] Caching app static');
//      cache.addAll(staticFilesToCache);
//    })
//    caches.open(dynamicCacheName).then(function(cache) {
//      console.log('[ServiceWorker] Caching app dynamic');
//      cache.addAll(dynamicFilesToCache);
//    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://surgery.rama.mahidol.ac.th';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
