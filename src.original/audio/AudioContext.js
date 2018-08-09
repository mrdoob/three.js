/**
 * @author mrdoob / http://mrdoob.com/
 */

var context;

var AudioContext = {

	getContext: function () {

		if ( context === undefined ) {

			context = new ( window.AudioContext || window.webkitAudioContext )();

		}

		return context;

	},

	setContext: function ( value ) {

		context = value;

	}

};

export { AudioContext };
