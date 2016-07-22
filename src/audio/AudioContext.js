var context;

export function getAudioContext () {
	if ( context === undefined ) {
		context = new ( window.AudioContext || window.webkitAudioContext )();
	}

	return context;
}