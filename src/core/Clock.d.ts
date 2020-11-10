/**
 * Object for keeping track of time.
 *
 * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js|src/core/Clock.js}
 */
export class Clock {

	/**
	 * @param [autoStart=true] Automatically start the clock.
	 */
	constructor( autoStart?: boolean );

	/**
	 * If set, starts the clock automatically when the first update is called.
	 * @default true
	 */
	autoStart: boolean;

	/**
	 * When the clock is running, It holds the starttime of the clock.
	 * This counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
	 * @default 0
	 */
	startTime: number;

	/**
	 * When the clock is running, It holds the previous time from a update.
	 * This counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
	 * @default 0
	 */
	oldTime: number;

	/**
	 * When the clock is running, It holds the time elapsed between the start of the clock to the previous update.
	 * This parameter is in seconds of three decimal places.
	 * @default 0
	 */
	elapsedTime: number;

	/**
	 * This property keeps track whether the clock is running or not.
	 * @default false
	 */
	running: boolean;

	/**
	 * Starts clock.
	 */
	start(): void;

	/**
	 * Stops clock.
	 */
	stop(): void;

	/**
	 * Get the seconds passed since the clock started.
	 */
	getElapsedTime(): number;

	/**
	 * Get the seconds passed since the last call to this method.
	 */
	getDelta(): number;

}
