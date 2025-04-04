/**
 * This class is an alternative to {@link Clock} with a different API design and behavior.
 * The goal is to avoid the conceptual flaws that became apparent in `Clock` over time.
 *
 * - `Timer` has an `update()` method that updates its internal state. That makes it possible to
 * call `getDelta()` and `getElapsed()` multiple times per simulation step without getting different values.
 * - The class can make use of the Page Visibility API to avoid large time delta values when the app
 * is inactive (e.g. tab switched or browser hidden).
 *
 * ```js
 * const timer = new Timer();
 * timer.connect( document ); // use Page Visibility API
 * ```
 *
 * @three_import import { Timer } from 'three/addons/misc/Timer.js';
 */
class Timer {

	/**
	 * Constructs a new timer.
	 */
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

	/**
	 * Connect the timer to the given document.Calling this method is not mandatory to
	 * use the timer but enables the usage of the Page Visibility API to avoid large time
	 * delta values.
	 *
	 * @param {Document} document - The document.
	 */
	connect( document ) {

		this._document = document;

		// use Page Visibility API to avoid large time delta values

		if ( document.hidden !== undefined ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	/**
	 * Disconnects the timer from the DOM and also disables the usage of the Page Visibility API.
	 */
	disconnect() {

		if ( this._pageVisibilityHandler !== null ) {

			this._document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );
			this._pageVisibilityHandler = null;

		}

		this._document = null;

	}

	/**
	 * Returns the time delta in seconds.
	 *
	 * @return {number} The time delta in second.
	 */
	getDelta() {

		return this._delta / 1000;

	}

	/**
	 * Returns the elapsed time in seconds.
	 *
	 * @return {number} The elapsed time in second.
	 */
	getElapsed() {

		return this._elapsed / 1000;

	}

	/**
	 * Returns the timescale.
	 *
	 * @return {number} The timescale.
	 */
	getTimescale() {

		return this._timescale;

	}

	/**
	 * Sets the given timescale which scale the time delta computation
	 * in `update()`.
	 *
	 * @param {number} timescale - The timescale to set.
	 * @return {Timer} A reference to this timer.
	 */
	setTimescale( timescale ) {

		this._timescale = timescale;

		return this;

	}

	/**
	 * Resets the time computation for the current simulation step.
	 *
	 * @return {Timer} A reference to this timer.
	 */
	reset() {

		this._currentTime = now() - this._startTime;

		return this;

	}

	/**
	 * Can be used to free all internal resources. Usually called when
	 * the timer instance isn't required anymore.
	 */
	dispose() {

		this.disconnect();

	}

	/**
	 * Updates the internal state of the timer. This method should be called
	 * once per simulation step and before you perform queries against the timer
	 * (e.g. via `getDelta()`).
	 *
	 * @param {number} timestamp - The current time in milliseconds. Can be obtained
	 * from the `requestAnimationFrame` callback argument. If not provided, the current
	 * time will be determined with `performance.now`.
	 * @return {Timer} A reference to this timer.
	 */
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

/**
 * A special version of a timer with a fixed time delta value.
 * Can be useful for testing and debugging purposes.
 *
 * @augments Timer
 */
class FixedTimer extends Timer {

	/**
	 * Constructs a new timer.
	 *
	 * @param {number} [fps=60] - The fixed FPS of this timer.
	 */
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
