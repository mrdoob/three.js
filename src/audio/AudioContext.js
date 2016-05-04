/**
 * @author mrdoob / http://mrdoob.com/
 */

Object.defineProperty( THREE, 'AudioContext', {
	get: (function () {

		var context;

		return function () {

			if ( context === undefined ) {

				var AudioContextImpl = ( window.AudioContext || window.webkitAudioContext );
				context = new AudioContextImpl();

			}

			return context;

		};

	})()
} );
