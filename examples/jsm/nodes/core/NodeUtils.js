const NodeUtils = {

	elements: [ 'x', 'y', 'z', 'w' ],

	addShortcuts: function () {

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

		return function addShortcuts( proto, proxy, list ) {

			const shortcuts = {};

			for ( let i = 0; i < list.length; ++ i ) {

				const data = list[ i ].split( '.' ),
					property = data[ 0 ],
					subProperty = data[ 1 ];

				shortcuts[ property ] = applyShortcut( proxy, property, subProperty );

			}

			Object.defineProperties( proto, shortcuts );

		};

	}()

};

export { NodeUtils };
