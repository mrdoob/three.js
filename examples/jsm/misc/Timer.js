/**
 * @author Mugen87 / https://github.com/Mugen87
 */



var Timer = ( function () {

	function Timer() {

		this._previousTime = 0;
		this._currentTime = 0;

		this._deltaTime = 0;
		this._elapsedTime = 0;

		this._timeScale = 1;

		this._useFixedDeltaTime = false;
		this._fixedDeltaTime = 16.67; // ms, corresponds to approx. 60 FPS

		// use Page Visibility API to avoid large time delta values

		this._usePageVisibilityAPI = ( typeof document !== 'undefined' && document.hidden !== undefined );

		if ( this._usePageVisibilityAPI === true ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

 	}

	Object.assign( Timer.prototype, {

		disableFixedDeltaTime: function () {

			this._useFixedDeltaTime = false;

			return this;

		},

		dispose: function () {

			if ( this._usePageVisibilityAPI === true ) {

				document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );

			}

			return this;

		},

		enableFixedDeltaTime: function () {

			this._useFixedDeltaTime = true;

			return this;

		},

		getDeltaTime: function () {

			return this._deltaTime / 1000;

		},

		getElapsedTime: function () {

			return this._elapsedTime / 1000;

		},

		getFixedDeltaTime: function () {

			return this._fixedDeltaTime / 1000;

		},

		getTimeScale: function () {

			return this._timeScale;

		},

		reset: function () {

			this._currentTime = this._now();

			return this;

		},

		setFixedDeltaTime: function ( fixedDeltaTime ) {

			this._fixedDeltaTime = fixedDeltaTime * 1000;

			return this;

		},

		setTimeScale: function ( timeScale ) {

			this._timeScale = timeScale;

			return this;

		},

		update: function () {

			if ( this._useFixedDeltaTime === true ) {

				this._deltaTime = this._fixedDeltaTime;

			} else {

				this._previousTime = this._currentTime;
				this._currentTime = this._now();

				this._deltaTime = this._currentTime - this._previousTime;

			}

			this._deltaTime *= this._timeScale;

			this._elapsedTime += this._deltaTime; // _elapsedTime is the accumulation of all previous deltas

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
