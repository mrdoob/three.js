var Config = function () {

	var name = 'threejs-editor';

	var storage = {
		theme: 'css/light.css'
	};

	if ( window.localStorage[ name ] !== undefined ) {

		storage = JSON.parse( window.localStorage[ name ] );

	}

	return {

		getKey: function ( key ) {

			return storage[ key ];

		},

		setKey: function ( key, value ) {

			storage[ key ] = value;

			window.localStorage[ name ] = JSON.stringify( storage );

			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to LocalStorage.' );

		},

		clear: function () {

			delete window.localStorage[ name ];

		}

	}

};