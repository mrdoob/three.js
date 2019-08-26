/**
 * @author sunag / http://www.sunag.com.br/
 */

function applyShortcut( proxy, property, subProperty ) {

	if ( subProperty ) {

		return {

			get: function () {

				return this[ proxy ][ property ][ subProperty ];

			},

			set: function ( val ) {

				this[ proxy ][ property ][ subProperty ] = val;

			}

		};

	} else {

		return {

			get: function () {

				return this[ proxy ][ property ];

			},

			set: function ( val ) {

				this[ proxy ][ property ] = val;

			}

		};

	}

}

var NodeUtils = {

	elements: [ 'x', 'y', 'z', 'w' ],

	createProxyClass: function ( baseClass, property ) {

		return class ProxyClass extends baseClass {

			constructor() {

				super( ...arguments, property );

			}

		};

	}, 

	addShortcuts: function ( proto, proxy, list ) {

		var shortcuts = {};

		for ( var i = 0; i < list.length; ++ i ) {

			var data = list[ i ].split( "." ),
				property = data[ 0 ],
				subProperty = data[ 1 ];

			shortcuts[ property ] = applyShortcut( proxy, property, subProperty );

		}

		Object.defineProperties( proto, shortcuts );

	}

};

export { NodeUtils };
