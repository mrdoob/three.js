/**
 * @author mrdoob / http://mrdoob.com/
 */

var Cache = {

	enabled: false,

	entries: {},

	add: function ( key, value ) {

		if ( this.enabled === false ) return;

		this.entries[ key ] = { value: value };

	},

	get: function ( key ) {

		if ( this.enabled === false || this.entries[ key ] === undefined ) return;

		return this.entries[ key ].value;

	},

	remove: function ( key ) {

		delete this.entries[ key ];

	},

	clear: function () {

		this.entries = {};

	},

	retrieve: function ( key, resolver, onLoad, onProgress, onError ) {

		if ( this.enabled === false ) {

			resolver( onLoad, onProgress, onError );
			return;

		}

		var entry = this.entries[ key ];

		if ( entry === undefined ) {

			entry = {
				pending: [ { onLoad: onLoad, onProgress: onProgress, onError: onError } ]
			};
			this.entries[ key ] = entry;

			var resolveLoad = function ( value ) {

				entry.value = value;

				for ( var i = 0; i < entry.pending.length; i ++ ) {

					if ( entry.pending[ i ].onLoad !== undefined ) {

						entry.pending[ i ].onLoad( value );

					}

				}

				delete entry.pending;

			};

			var resolveProgress = function ( progress ) {

				for ( var i = 0; i < entry.pending.length; i ++ ) {

					if ( entry.pending[ i ].onProgress !== undefined ) {

						entry.pending[ i ].onProgress( progress );

					}

				}

			};
			var resolveError = function ( error ) {

				entry.error = error;

				for ( var i = 0; i < entry.pending.length; i ++ ) {

					if ( entry.pending[ i ].onError !== undefined ) {

						entry.pending[ i ].onError( error );

					}

				}

				delete entry.pending;

			};
			return resolver( resolveLoad, resolveProgress, resolveError );

		} else if ( entry.pending !== undefined ) {

			entry.pending.push( { onLoad: onLoad, onProgress: onProgress, onError: onError } );

		} else if ( entry.value !== undefined ) {

			onLoad( entry.value );

		} else if ( entry.error !== undefined ) {

			onError( entry.error );

		} else {

			throw new Error( "Invalid state in cache" );

		}

	},

};


export { Cache };
