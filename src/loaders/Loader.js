/**
 * @author alteredq / http://alteredqualia.com/
 */

function Loader() {}

Loader.Handlers = {

	handlers: [],

	add: function ( regex, loader ) {

		this.handlers.push( regex, loader );

	},

	get: function ( file ) {

		var handlers = this.handlers;

		for ( var i = 0, l = handlers.length; i < l; i += 2 ) {

			var regex = handlers[ i ];
			var loader = handlers[ i + 1 ];

			if ( regex.test( file ) ) {

				return loader;

			}

		}

		return null;

	}

};

Object.assign( Loader.prototype, {

	crossOrigin: 'anonymous'

} );


export { Loader };
