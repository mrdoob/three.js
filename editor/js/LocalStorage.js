var LocalStorage = function () {

	var name = 'threejs-editor';

	var storage = {
		theme: 'css/light.css'
	};

	if ( localStorage[ name ] !== undefined ) {

		storage = JSON.parse( localStorage[ name ] );

	}

	return {
		getKey: function ( key ) {

			return storage[ key ];

		},

		setKey: function ( key, value ) {

			storage[ key ] = value;

			localStorage[ name ] = JSON.stringify( storage );

			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to LocalStorage.' );

		}

	}

};