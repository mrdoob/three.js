var context;

function AudioContext() {}

Object.assign( AudioContext, {

	getContext: function () {

		if ( context === undefined ) {

			context = new ( window.AudioContext || window.webkitAudioContext )();

		}

		return context;

	},

	setContext: function ( value ) {

		context = value;
		
	}

} );

export { AudioContext };
