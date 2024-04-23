let _context;

class AudioContext {

	static getContext() {

		if ( _context === undefined ) {

			_context = new ( window.AudioContext || window.webkitAudioContext )();

		}

		return _context;

	}

	static setContext( value ) {

		_context = value;

	}

}

export { AudioContext };
