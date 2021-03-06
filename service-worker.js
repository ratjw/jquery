var appCaches = [{
    name: 'static-neuro1',
    urls: [
	  'js/jquery.mousewheel.min.js',
	  'js/jquery-1.12.4.min.js',
	  'js/jquery-ui.min.js',
	  'css/jquery-ui.min.css',
	  'css/images/ui-icons_555555_256x240.png',
	  'css/pic/equip/CUSA.jpg',
	  'css/pic/equip/Endoscope.jpg',
	  'css/pic/equip/Fluoroscope.jpg',
	  'css/pic/equip/Microscope.jpg',
	  'css/pic/equip/Monitor.jpg',
	  'css/pic/equip/Navigator.jpg',
	  'css/pic/equip/Oarm.jpg',
	  'css/pic/equip/Robotics.jpg',
	  'css/pic/equip/Ultrasound.jpg',
	  'css/pic/general/camera.png',
	  'css/pic/general/Camera2.png',
	  'css/pic/general/find.png',
	  'css/pic/general/logoRama.png',
	  'css/pic/general/menu.png',
	  'css/pic/general/nurse.png',
	  'css/pic/general/pacs.png',
	  'css/pic/general/pacs2.png',
	  'css/pic/holiday/Asalha.png',
	  'css/pic/holiday/Asalhasub.png',
	  'css/pic/holiday/Chakri.png',
	  'css/pic/holiday/Chakrisub.png',
	  'css/pic/holiday/Constitution.png',
	  'css/pic/holiday/Constitutionsub.png',
	  'css/pic/holiday/King09.png',
	  'css/pic/holiday/King09sub.png',
	  'css/pic/holiday/King9.png',
	  'css/pic/holiday/King9sub.png',
	  'css/pic/holiday/King10.png',
	  'css/pic/holiday/King10sub.png',
	  'css/pic/holiday/Magha.png',
	  'css/pic/holiday/Maghasub.png',
	  'css/pic/holiday/Newyear.png',
	  'css/pic/holiday/Newyearsub.png',
	  'css/pic/holiday/Piya.png',
	  'css/pic/holiday/Piyasub.png',
	  'css/pic/holiday/Ploughing.png',
	  'css/pic/holiday/Ploughingsub.png',
	  'css/pic/holiday/Queen.png',
	  'css/pic/holiday/Queensub.png',
	  'css/pic/holiday/Songkran.png',
	  'css/pic/holiday/Songkransub.png',
	  'css/pic/holiday/special.png',
	  'css/pic/holiday/Vassa.png',
	  'css/pic/holiday/Vassasub.png',
	  'css/pic/holiday/Vesak.png',
	  'css/pic/holiday/Vesaksub.png',
	  'css/pic/holiday/Yearend.png',
	  'css/pic/holiday/Yearendsub.png',
	  'css/pic/service/Admission.png',
	  'css/pic/service/Admission2.png',
	  'css/pic/service/Endovascular.png',
	  'css/pic/service/Operation.png',
	  'css/pic/service/Operation2.png',
	  'css/pic/service/Radiosurgery.png',
	  'css/pic/service/readmission.png',
	  'css/pic/service/readmission2.png',
	  'css/pic/service/record.png',
	  'css/pic/service/record2.png',
	  'css/pic/service/reoperation.png',
	  'css/pic/service/reoperation2.png',
	  'index.php',
	  'nurse.html',
	  'readme.pdf',
	  'staff.html',
	  'css/css.css',
	  'css/print.css',
	  'css/xcss.css',
	  'js/click.js',
	  'js/constant.js',
	  'js/equip.js',
	  'js/fill.js',
	  'js/function.js',
	  'js/history.js',
	  'js/menu.js',
	  'js/service.js',
	  'js/sortable.js',
//	  'js/start.js',
	  'js/xconstant.js',
	  'js/xequip.js',
	  'js/xfill.js',
	  'js/xfunction.js'//,
//	  'js/xstart.js'
    ]
  },
  {
    name: 'dynamic-neuro1',
    urls: [
//	  'index.php',
//	  'nurse.html',
//	  'readme.pdf',
//	  'staff.html',
//	  'css/css.css',
//	  'css/print.css',
//	  'css/xcss.css',
//	  'js/click.js',
//	  'js/constant.js',
//	  'js/equip.js',
//	  'js/fill.js',
//	  'js/function.js',
//	  'js/history.js',
//	  'js/menu.js',
//	  'js/service.js',
//	  'js/sortable.js',
	  'js/start.js',
//	  'js/xconstant.js',
//	  'js/xequip.js',
//	  'js/xfill.js',
//	  'js/xfunction.js',
	  'js/xstart.js'
    ]
  }
];

var dataCacheName = 'book-neuro1',
    cacheNames = appCaches.map((cache) => cache.name).concat(dataCacheName)

self.addEventListener('install', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(appCaches.map(function (appCache) {
      if (keys.indexOf(appCache.name) === -1) {
        caches.open(appCache.name).then(function (cache) {
          console.log(`caching ${appCache.name}`);
          return cache.addAll(appCache.urls);
        })
      } else {
        console.log(`found ${appCache.name}`);
        return Promise.resolve(true);
      }
    }))
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (cacheNames.indexOf(key) === -1) {
          console.log(`deleting ${key}`);
          return caches.delete(key);
        }
      }));
    })
  );
  caches.open(dataCacheName).then(function(cache) {
	var url = location.origin + location.pathname
    fetch(url).then(function(response) {
      cache.put(url, response);
	})
  })

  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'php';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response) {
		  var responseClone1 = response.clone()
		  var responseClone2 = response.clone()
		  responseClone1.json().then( (json) => json ).then(function(json) {
			  if (json.hasOwnProperty("BOOK")) {
				cache.put(e.request.url, responseClone2);
			  }
		  })
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
