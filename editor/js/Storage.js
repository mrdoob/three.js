function Storage() {

	const indexedDB = window.indexedDB;

	if ( indexedDB === undefined ) {

		console.warn( 'Storage: IndexedDB not available.' );
		return { init: function () {}, get: function () {}, set: function () {}, clear: function () {} };

	}

	const name = 'threejs-editor';
	const version = 1;

	let database;

	return {

		init: function ( callback ) {

			const request = indexedDB.open( name, version );
			request.onupgradeneeded = function ( event ) {

				const db = event.target.result;

				if ( db.objectStoreNames.contains( 'states' ) === false ) {

					db.createObjectStore( 'states' );

				}

			};

			request.onsuccess = function ( event ) {

				database = event.target.result;

				callback();

			};

			request.onerror = function ( event ) {

				console.error( 'IndexedDB', event );

			};


		},

		get: function ( callback ) {

			const start = performance.now();

			const transaction = database.transaction( [ 'states' ], 'readonly' );
			const objectStore = transaction.objectStore( 'states' );

			transaction.onerror = function ( event ) {

				console.error( 'IndexedDB get failed:', event.target.error );

    		};

			const request = objectStore.get( 0 );
			request.onsuccess = function ( event ) {

				console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Retrieved state from IndexedDB. ' + ( performance.now() - start ).toFixed( 2 ) + 'ms' );

				callback( event.target.result );

			};

		},

		set: function ( data ) {

			const start = performance.now();

			const transaction = database.transaction( [ 'states' ], 'readwrite' );
			const objectStore = transaction.objectStore( 'states' );

			transaction.oncomplete = function () {

				console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to IndexedDB. ' + ( performance.now() - start ).toFixed( 2 ) + 'ms' );

			};

			transaction.onerror = function ( event ) {

				console.error( 'IndexedDB put failed:', event.target.error );

			};

			objectStore.put( data, 0 );

		},

		clear: function () {

			if ( database === undefined ) return;

			const transaction = database.transaction( [ 'states' ], 'readwrite' );
			const objectStore = transaction.objectStore( 'states' );

			transaction.oncomplete = function () {

				console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Cleared IndexedDB.' );

			};

			transaction.onerror = function ( event ) {

				console.error( 'IndexedDB clear failed:', event.target.error );

			};

			objectStore.clear();

		}

	};

}

export { Storage };
