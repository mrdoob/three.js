import { AudioContext as _AudioContext, webkitAudioContext } from '../dom-globals';

let _context;

const AudioContext = {

	getContext: function () {

		if ( _context === undefined ) {

			_context = new ( _AudioContext || webkitAudioContext )();

		}

		return _context;

	},

	setContext: function ( value ) {

		_context = value;

	}

};

export { AudioContext };
