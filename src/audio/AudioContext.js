/**
 * @author mrdoob / http://mrdoob.com/
 */

Object.defineProperty( THREE, 'AudioContext', {

	get: ( function () {

		var context;

		return function get() {

			if ( context === undefined ) {

				context = new ( window.AudioContext || window.webkitAudioContext )();

			}

			return context;

		};

	} )()

} );
