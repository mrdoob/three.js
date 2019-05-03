/**
 * @author akoww
 */

function IndexedCache( name ) {

	this.enabled = false;
	this.storeName = ( name === undefined ) ? "ThreeJsCache" : name;
	this.dbVersion = 4.0;
	this.db = null;

	if ( typeof WorkerGlobalScope !== undefined ) {

		this.indexedDB = indexedDB || webkitIndexedDB || mozIndexedDB || OIndexedDB || msIndexedDB;
		this.IDBTransaction = IDBTransaction || webkitIDBTransaction || OIDBTransaction || msIDBTransaction;

	} else {

		this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
		this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;

	}

}

Object.assign( IndexedCache.prototype, {

	add: function ( key, file ) {

		if ( this.enabled === false || this.indexedDB === undefined ) return;

		// check if key length is a valid url
		if ( key.length > 2000 ) {

			console.warning( "THREE.IndexedCache Won't insert file for a key longer then 2000 characters." );
			return;

		}

		var callbacks = {
			onsuccess: function () {},
			onerror: function ( event ) {}
		};

		var afterOpen = function () {

			// Open a transaction to the database
			var transactionWrite = this.db.transaction( [ this.storeName ], "readwrite" );

			// Insert the file into the store
			var store = transactionWrite.objectStore( this.storeName );
			var tryPut = store.put( file, key );

			tryPut.onsuccess = function () {

				console.info( "THREE.IndexedCache Added data into store under key: " + key );
				callbacks.onsuccess();

			};

			tryPut.onerror = function ( event ) {

				console.error( "THREE.IndexedCache Can't add data to store under key: " + key );
				callbacks.onerror( event );

			};

		}.bind( this );

		if ( this.db === null ) {

			var request = this.indexedDB.open( this.storeName, this.dbVersion );

			request.onsuccess = function ( event ) {

				this.db = request.result;
				afterOpen();

			}.bind( this );

			request.onupgradeneeded = function ( event ) {

				// Create a new store if none exists
				event.target.result.createObjectStore( this.storeName );

			}.bind( this );

		} else {

			afterOpen();

		}

		return callbacks;

	},

	get: function ( key ) {

		if ( this.enabled === false || this.indexedDB === undefined ) return;

		// check if key length is a valid url
		if ( key.length > 2000 ) {

			console.warning( "THREE.IndexedCache Won't insert file for a key longer then 2000 characters." );
			return;

		}

		var callbacks = {
			onsuccess: function () {},
			onerror: function ( event ) {}
		};

		var afterOpen = function () {

			var transactionRead = this.db.transaction( [ this.storeName ], "readonly" );

			// Retrieve the file that was stored
			var store = transactionRead.objectStore( this.storeName );
			var tryGet = store.get( key );

			tryGet.onsuccess = function ( event ) {

				var data = event.target.result;

				// Data might be undefined
				if ( data === undefined ) {

					callbacks.onerror( event );
					return;

				}

				// Empty data is also wrong
				if ( data.size === 0 ) {

					callbacks.onerror( event );
					return;

				}

				callbacks.onsuccess( data );

			};

			tryGet.onerror = function ( event ) {

				console.error( "THREE.IndexedCache Can't retrieve data from store under key: " + key );
				callbacks.onerror( event );

			};

		}.bind( this );

		if ( this.db === null ) {

			var request = this.indexedDB.open( this.storeName, this.dbVersion );

			request.onsuccess = function ( event ) {

				this.db = request.result;
				afterOpen();

			}.bind( this );

			request.onupgradeneeded = function ( event ) {

				// Create a new store if none exists
				event.target.result.createObjectStore( this.storeName );

			}.bind( this );

		} else {

			afterOpen();

		}

		return callbacks;

	},

	remove: function ( key ) {

		if ( this.enabled === false || this.indexedDB === undefined ) return;

		// check if key length is a valid url
		if ( key.length > 2000 ) {

			console.warning( "THREE.IndexedCache Won't insert file for a key longer then 2000 characters." );
			return;

		}

		var callbacks = {
			onsuccess: function () {},
			onerror: function ( event ) {}
		};

		var afterOpen = function () {

			var transactionWrite = this.db.transaction( [ this.storeName ], "readwrite" );

			// Insert the file into the store
			var store = transactionWrite.objectStore( this.storeName );
			var tryDelete = store.delete( key );

			tryDelete.onsuccess = function () {

				console.info( "THREE.IndexedCache Removed data with key: " + key + " from store." );
				callbacks.onsuccess();

			};

			tryDelete.onerror = function ( event ) {

				console.error( "THREE.IndexedCache Can't remove data with key: " + key + " from store." );
				callbacks.onerror( event );

			};

		}.bind( this );

		if ( this.db === null ) {

			var request = this.indexedDB.open( this.storeName, this.dbVersion );

			request.onsuccess = function ( event ) {

				this.db = request.result;
				afterOpen();

			}.bind( this );

			request.onupgradeneeded = function ( event ) {

				// Create a new store if none exists
				event.target.result.createObjectStore( this.storeName );

			}.bind( this );

		} else {

			afterOpen();

		}

		return callbacks;

	},

	clear: function () {

		if ( this.enabled === false || this.indexedDB === undefined ) return;

		var request = this.indexedDB.deleteDatabase( this.storeName );

		request.onerror = function ( event ) {

			console.error( "THREE.IndexedCache Error deleting " + this.storeName + " database." );

		};

		request.onsuccess = function ( event ) {

			console.log( "THREE.IndexedCache Database " + this.storeName + " deleted successfully" );

		};

	}

} );

export {
	IndexedCache
};
