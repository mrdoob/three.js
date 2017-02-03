/**
 * @author Lewy Blue / https://github.com/looeee
 */

function Time() {

	//Keep track of time when pause() was called
	var _pauseTime;

	//Keep track of time when delta was last checked
	var _lastDelta = 0;

	//Hold the time when start() was called
	//There is no point in exposing this as it's essentially a random number
	//and will be different depending on whether performance.now or Date.now is used
	var _startTime = 0;

	this.running = false;
	this.paused = false;

	//The scale at which the time is passing. This can be used for slow motion effects.
	this.timeScale = 1.0;

	Object.defineProperties( this, {

		"now": {

			get: function () {

				return ( performance || Date ).now();

			}

		},

		"unscaledTotalTime": {

			get: function () {

				return ( this.running ) ? this.now - _startTime : 0;

			}

		},

		"totalTime": {

			get: function () {

				return this.unscaledTotalTime * this.timeScale;

			}

		},

		//Unscaled time since delta was last checked
		"unscaledDelta": {

			get: function () {

				var diff = this.now - _lastDelta;
				_lastDelta = this.now;

				return diff;

			}

		},

		//Scaled time since delta was last checked
		"delta": {

			get: function () {

				return this.unscaledDelta * this.timeScale;

			}

		}

	} );

	this.start = function () {

		if ( this.paused ) _startTime = _startTime - ( ( this.now - _pauseTime ) * this.timeScale );

		else if ( ! this.running ) _startTime = _lastDelta = this.now;

		this.running = true;
		this.paused = false;

	};

	//Reset and stop clock
	this.stop = function () {

		_startTime = 0;

		this.running = false;

	};

	this.pause = function () {

		_pauseTime = this.totalTime;

		this.paused = true;

	};

}

export { Time };
