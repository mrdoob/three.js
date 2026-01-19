import { warn } from '../utils.js';

/**
 * Class for keeping track of time.
 *
 * @deprecated since r183.
 */
class Clock {

	/**
	 * Constructs a new clock.
	 *
	 * @deprecated since 183.
	 * @param {boolean} [autoStart=true] - Whether to automatically start the clock when
	 * `getDelta()` is called for the first time.
	 */
	constructor( autoStart = true ) {

		/**
		 * If set to `true`, the clock starts automatically when `getDelta()` is called
		 * for the first time.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoStart = autoStart;

		/**
		 * Holds the time at which the clock's `start()` method was last called.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.startTime = 0;

		/**
		 * Holds the time at which the clock's `start()`, `getElapsedTime()` or
		 * `getDelta()` methods were last called.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.oldTime = 0;

		/**
		 * Keeps track of the total time that the clock has been running.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.elapsedTime = 0;

		/**
		 * Whether the clock is running or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.running = false;

		warn( 'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.' ); // @deprecated, r183

	}

	/**
	 * Starts the clock. When `autoStart` is set to `true`, the method is automatically
	 * called by the class.
	 */
	start() {

		this.startTime = performance.now();

		this.oldTime = this.startTime;
		this.elapsedTime = 0;
		this.running = true;

	}

	/**
	 * Stops the clock.
	 */
	stop() {

		this.getElapsedTime();
		this.running = false;
		this.autoStart = false;

	}

	/**
	 * Returns the elapsed time in seconds.
	 *
	 * @return {number} The elapsed time.
	 */
	getElapsedTime() {

		this.getDelta();
		return this.elapsedTime;

	}

	/**
	 * Returns the delta time in seconds.
	 *
	 * @return {number} The delta time.
	 */
	getDelta() {

		let diff = 0;

		if ( this.autoStart && ! this.running ) {

			this.start();
			return 0;

		}

		if ( this.running ) {

			const newTime = performance.now();

			diff = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += diff;

		}

		return diff;

	}

}

export { Clock };
