const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v1";
const INMUTABLE_CACHE = "inmutable-v1";

const APP_SHELL = [
    // "/",
    "index.html",
    "css/style.css",
    "js/app.js",
    "img/favicon.ico",
    "img/avatars/hulk.jpg",
    "img/avatars/ironman.jpg",
    "img/avatars/spiderman.jpg",
    "img/avatars/thor.jpg",
    "img/avatars/wolverine.jpg",
    "js/sw-utils.js"
];

const APP_SHELL_INMUTABLE = [
    "https://fonts.googleapis.com/css?family=Quicksand:300,400",
    "https://fonts.googleapis.com/css?family=Lato:400,300",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "/css/animate.css",
    "/js/libs/jquery.js"
];

self.addEventListener("install", e => {

    const addStatic = caches.open(STATIC_CACHE)
        .then(cache =>
            cache.addAll(APP_SHELL)
        );
    const addInmutable = caches.open(INMUTABLE_CACHE)
        .then(cache =>
            cache.addAll(APP_SHELL_INMUTABLE)
        );

    e.waitUntil(Promise.all([addStatic,addInmutable]));
});

self.addEventListener("activate",e => {

    const response = caches.keys()
        .then(keys => {
            keys.forEach(key =>{
                if(key !== STATIC_CACHE && !key.includes("inmutable")){
                    return caches.delete(key);
                }
            })
        })

    e.waitUntil(response);
});

self.addEventListener('fetch',e=>{
    // 2- Cache with Network Fallback
    const respuesta = caches.match(e.request)
        .then(res => {

            if (res) return res;
            // No existe el archivo
            console.log('No existe', e.request.url);
            return fetch(e.request).then(newResp => {

                caches.open(DYNAMIC_CACHE)
                    .then(cache => {
                        cache.put(e.request, newResp);
                        limpiarCache(CACHE_DYNAMIC_NAME, 50);
                    });

                return newResp.clone();
               // return guardarCacheDinamico(DYNAMIC_CACHE,e.request,newResp);
            })


        });


    e.respondWith(respuesta);
})