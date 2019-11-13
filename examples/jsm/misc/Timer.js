/**
 * @author Mugen87 / https://github.com/Mugen87
 */



var Timer = ( function () {

	function Timer() {

		this._previousTime = 0;
		this._currentTime = 0;

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

	Object.assign( Timer.prototype, {

		disableFixedDelta: function () {

			this._useFixedDelta = false;

			return this;

		},

		dispose: function () {

			if ( this._usePageVisibilityAPI === true ) {

				document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );

			}

			return this;

		},

		enableFixedDelta: function () {

			this._useFixedDelta = true;

			return this;

		},

		getDelta: function () {

			return this._delta / 1000;

		},

		getElapsed: function () {

			return this._elapsed / 1000;

		},

		getFixedDelta: function () {

			return this._fixedDelta / 1000;

		},

		getTimescale: function () {

			return this._timescale;

		},

		reset: function () {

			this._currentTime = this._now();

			return this;

		},

		setFixedDelta: function ( fixedDelta ) {

			this._fixedDelta = fixedDelta * 1000;

			return this;

		},

		setTimescale: function ( timescale ) {

			this._timescale = timescale;

			return this;

		},

		update: function () {

			if ( this._useFixedDelta === true ) {

				this._delta = this._fixedDelta;

			} else {

				this._previousTime = this._currentTime;
				this._currentTime = this._now();

				this._delta = this._currentTime - this._previousTime;

			}

			this._delta *= this._timescale;

			this._elapsed += this._delta; // _elapsed is the accumulation of all previous deltas

			return this;

		},

		// private

		_now: function () {

			return ( typeof performance === 'undefined' ? Date : performance ).now();

		},

	} );

	function handleVisibilityChange() {

		if ( document.hidden === false ) this.reset();

	}

	return Timer;

} )();

export { Timer };
