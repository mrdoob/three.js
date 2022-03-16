let _context;

import { platform } from '../platform.js';

const AudioContext = {

	getContext: function () {

		if ( _context === undefined ) {

			_context = new platform.AudioContext();

		}

		return _context;

	},

	setContext: function ( value ) {

		_context = value;

	}

};

export { AudioContext };
