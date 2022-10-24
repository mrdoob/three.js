let _context;

class AudioContext {

	constructor() {

		if ( _context === undefined ) {

			_context = new ( window.AudioContext || window.webkitAudioContext )();

		}

	}

	get context() {

		return _context;

	}

	set context( value ) {

		_context = value;

	}

}

export { AudioContext };
