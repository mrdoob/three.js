/**
 * @author sunag / http://www.sunag.com.br/
 */

import { NodeLib } from './NodeLib.js';

function applyShortcut( proxy, property, subProperty, resolve ) {

	if ( subProperty ) {

		return {

			get: function () {

				return this[ proxy ][ property ][ subProperty ];

			},

			set: function ( val ) {

				if ( resolve ) val = NodeLib.resolve( val );

				this[ proxy ][ property ][ subProperty ] = val;

			}

		}

	} else {

		return {

			get: function () {

				return this[ proxy ][ property ];

			},

			set: function ( val ) {

				if ( resolve ) val = NodeLib.resolve( val );

				this[ proxy ][ property ] = val;

			}

		}

	}

}

export const NodeUtils = {

	createProxyClass: ( baseClass, property ) => {

		return class ProxyClass extends baseClass {

			constructor() {

				super( property, ...arguments );

			}

		};

	}, 

	addShortcuts: ( proto, proxy, list, resolve ) => {

		var shortcuts = {};

		for ( var i = 0; i < list.length; ++ i ) {

			var data = list[ i ].split( "." ),
				property = data[ 0 ],
				subProperty = data[ 1 ];

			shortcuts[ property ] = applyShortcut( proxy, property, subProperty, resolve );

		}

		Object.defineProperties( proto, shortcuts );

	}

};
