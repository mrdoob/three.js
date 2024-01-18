class Timer {

	constructor() {

		this._previousTime = 0;
		this._currentTime = 0;
		this._startTime = now();

		this._delta = 0;
		this._elapsed = 0; // _elapsed is the accumulation of all previous deltas

		this._timescale = 1;

		// use Page Visibility API to avoid large time delta values

		if ( typeof document !== 'undefined' && document.hidden !== undefined ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	getDelta() {

		return this._delta / 1000;

	}

	getElapsed() {

		return this._elapsed / 1000;

	}

	getTimescale() {

		return this._timescale;

	}

	setTimescale( timescale ) {

		this._timescale = timescale;

		return this;

	}

	reset() {

		this._currentTime = now() - this._startTime;

		return this;

	}

	dispose() {

		if ( this._pageVisibilityHandler !== undefined ) {

			document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );

			this._pageVisibilityHandler = undefined;

		}

		return this;

	}

	update( timestamp = now() ) {

		this._previousTime = this._currentTime;
		this._currentTime = timestamp - this._startTime;

		this._delta = ( this._currentTime - this._previousTime ) * this._timescale;
		this._elapsed += this._delta;

		return this;

	}

}

class FixedTimer extends Timer {

	constructor( fps = 60 ) {

		super();
		this._delta = 1000 / fps;

	}

	update() {

		this._elapsed += this._delta * this._timescale;

		return this;

	}

}

function now() {

	return ( typeof performance === 'undefined' ? Date : performance ).now();

}

function handleVisibilityChange() {

	if ( document.hidden === false ) this.reset();

}

export { Timer, FixedTimer };
