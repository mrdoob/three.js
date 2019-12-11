/**
 * @author mrdoob / http://mrdoob.com/
 */

var Cache = {

	enabled: false,

	files: {},

	add: function ( key, file ) {

		if ( this.enabled === false ) return;

		// console.log( 'THREE.Cache', 'Adding key:', key );

		this.files[ key ] = file;

	},

	get: function ( key ) {

		if ( this.enabled === false ) return;

		if ( this.files[ key ] !== undefined && this.files[ key ] instanceof ArrayBuffer && this.files[ key ].byteLength === 0 ) {

			// This ArrayBuffer may be in a detached state, so it's unusable.
			// A buffer can enter detached state when it is transferred to a worker for example.
			this.remove( key );

		}

		// console.log( 'THREE.Cache', 'Checking key:', key );

		return this.files[ key ];

	},

	remove: function ( key ) {

		delete this.files[ key ];

	},

	clear: function () {

		this.files = {};

	}

};


export { Cache };
