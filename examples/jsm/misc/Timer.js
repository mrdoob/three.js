class Timer {

	constructor() {

		this._previousTime = 0;
		this._currentTime = 0;
		this._startTime = now();

		this._delta = 0;
		this._elapsed = 0;

		this._timescale = 1;

		this._document = null;
		this._pageVisibilityHandler = null;

	}

	connect( document ) {

		this._document = document;

		// use Page Visibility API to avoid large time delta values

		if ( document.hidden !== undefined ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	disconnect() {

		if ( this._pageVisibilityHandler !== null ) {

			this._document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );
			this._pageVisibilityHandler = null;

		}

		this._document = null;

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

		this.disconnect();

		return this;

	}

	update( timestamp ) {

		if ( this._pageVisibilityHandler !== null && this._document.hidden === true ) {

			this._delta = 0;

		} else {

			this._previousTime = this._currentTime;
			this._currentTime = ( timestamp !== undefined ? timestamp : now() ) - this._startTime;

			this._delta = ( this._currentTime - this._previousTime ) * this._timescale;
			this._elapsed += this._delta; // _elapsed is the accumulation of all previous deltas

		}

		return this;

	}

}

class FixedTimer extends Timer {

	constructor( fps = 60 ) {

		super();
		this._delta = ( 1 / fps ) * 1000;

	}

	update() {

		this._elapsed += ( this._delta * this._timescale ); // _elapsed is the accumulation of all previous deltas

		return this;

	}

}

function now() {

	return performance.now();

}

function handleVisibilityChange() {

	if ( this._document.hidden === false ) this.reset();

}

export { Timer, FixedTimer };
