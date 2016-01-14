/**
 * @author elephantatWork, Samuel Vonäsch
 */

var EditorShortCutsList = function () {

	var name = 'threejs-editor-shortcuts';

	var storage = {

		'file/exportscene':"ctrl+e",

		'history/undo':"ctrl+z",
		'history/redo':"ctrl+y",

		'transform/move':'g',
		'transform/rotate':'r',
		'transform/scale':'s',

		'edit/clone':'shift+D',
		'edit/duplicate':'',
		'edit/delete':'x',

		'view/hide':'h',
		'view/unhideAll':'alt+h',
		'view/isolate':'i',
		'view/focus':'f',
		'view/showgrid':'space',

		'camera/front':'1',
		'camera/left':'3',
		'camera/top':'7',
	};

	if ( window.localStorage[ name ] === undefined ) {

		window.localStorage[ name ] = JSON.stringify( storage );

	} else {

		var data = JSON.parse( window.localStorage[ name ] );

		for ( var key in data ) {

			storage[ key ] = data[ key ];

		}

	}

	return {

		getKey: function ( key ) {

			return storage[ key ];

		},

		setKey: function () { // key, value, key, value ...

			for ( var i = 0, l = arguments.length; i < l; i += 2 ) {

				storage[ arguments[ i ] ] = arguments[ i + 1 ];

			}

			window.localStorage[ name ] = JSON.stringify( storage );
 
			console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved config to shortcuts.' );

		},

		clear: function () {

			delete window.localStorage[ name ];

		}

	}

};
