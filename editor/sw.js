self.addEventListener( 'install', function () {

	self.skipWaiting();

} );

self.addEventListener( 'activate', function () {

	self.registration.unregister();

	caches.keys().then( function ( names ) {

		for ( const name of names ) caches.delete( name );

	} );

} );
