/**
 * This class is a new alternative to THREE.Clock with a different API design and behavior.
 * The goal is to avoid the conceptual flaws that became apparent in THREE.Clock over time.
 *
 * - THREE.Timer has an update() method that updates its internal state. That makes it possible to call .getDeltaTime() and
 *    .getElapsedTime() multiple times per simulation step without getting different values.
 * - The class uses the Page Visibility API to avoid large time delta values when the app is inactive (e.g. tab switched or browser hidden).
 * - It's possible to configure a fixed time delta and a time scale value (similar to Unity's Time interface).
 */
class Timer {

	constructor() {

		this._previousTime = 0;
		this._currentTime = 0;
		this._startTime = now();

		this._delta = 0;
		this._elapsed = 0;

		this._timescale = 1;

		this._useFixedDelta = false;
		this._fixedDelta = 16.67; // ms, corresponds to approx. 60 FPS

		// use Page Visibility API to avoid large time delta values

		this._usePageVisibilityAPI = ( typeof document !== 'undefined' && document.hidden !== undefined );

		if ( this._usePageVisibilityAPI === true ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	disableFixedDelta() {

		this._useFixedDelta = false;

		return this;

	}

	dispose() {

		if ( this._usePageVisibilityAPI === true ) {

			document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );

		}

		return this;

	}

	enableFixedDelta() {

		this._useFixedDelta = true;

		return this;

	}

	getDelta() {

		return this._delta / 1000;

	}

	getElapsed() {

		return this._elapsed / 1000;

	}

	getFixedDelta() {

		return this._fixedDelta / 1000;

	}

	getTimescale() {

		return this._timescale;

	}

	reset() {

		this._currentTime = now() - this._startTime;

		return this;

	}

	setFixedDelta( fixedDelta ) {

		this._fixedDelta = fixedDelta * 1000;

		return this;

	}

	setTimescale( timescale ) {

		this._timescale = timescale;

		return this;

	}

	update() {

		if ( this._useFixedDelta === true ) {

			this._delta = this._fixedDelta;

		} else {

			this._previousTime = this._currentTime;
			this._currentTime = now() - this._startTime;

			this._delta = this._currentTime - this._previousTime;

		}

		this._delta *= this._timescale;

		this._elapsed += this._delta; // _elapsed is the accumulation of all previous deltas

		return this;

	}

}

function now() {

	return ( typeof performance === 'undefined' ? Date : performance ).now();

}

function handleVisibilityChange() {

	if ( document.hidden === false ) this.reset();

}

export { Timer };
