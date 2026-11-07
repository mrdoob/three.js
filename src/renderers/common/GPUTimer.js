/**
 * Measures the GPU time from the start of the first render or compute pass issued after
 * {@link GPUTimer#begin} to the end of the last one issued before {@link GPUTimer#end}. Unlike the
 * renderer's `trackTimestamp` option, a timer only times the passes it wraps, keeps its results
 * separate from {@link Renderer#resolveTimestampsAsync} and doesn't require the renderer to be created
 * with `trackTimestamp`.
 *
 * Timers can overlap and end in any order: a pass counts toward every active timer. Passes issued while
 * a timer is active are not recorded by the renderer's `trackTimestamp` pool.
 *
 * Requires the WebGPU backend with the `timestamp-query` feature. Otherwise the results are `null`.
 *
 * ```js
 * const timer = new GPUTimer( renderer );
 *
 * timer.begin();
 * renderer.compute( computeNode );
 * const computeMilliseconds = await timer.getElapsedAsync();
 *
 * renderer.render( scene, camera );
 * const totalMilliseconds = await timer.end();
 * ```
 */
class GPUTimer {

	/**
	 * Constructs a new GPU timer.
	 *
	 * @param {Renderer} renderer - The renderer whose passes are timed. Must be initialized before
	 * {@link GPUTimer#begin} is called.
	 */
	constructor( renderer ) {

		/**
		 * The renderer whose passes are timed.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		this._active = false;
		this._measurement = null;

	}

	/**
	 * Starts timing the passes the renderer issues.
	 */
	begin() {

		if ( this._active ) {

			throw new Error( 'GPUTimer: begin() called while the timer is already active.' );

		}

		this._measurement = this.renderer.backend.beginTimer();
		this._active = true;

	}

	/**
	 * Returns the GPU time so far, from the start of the first pass to the end of the latest one, while
	 * the timer keeps running.
	 *
	 * @async
	 * @return {Promise<?number>} The GPU time in milliseconds, `0` before any pass, or `null` when the
	 * backend doesn't support timing.
	 */
	getElapsedAsync() {

		if ( this._active === false ) {

			throw new Error( 'GPUTimer: getElapsedAsync() called while the timer is not active.' );

		}

		return this.renderer.backend.getTimerElapsed( this._measurement );

	}

	/**
	 * Stops timing and returns the GPU time of the passes issued since {@link GPUTimer#begin}. The timer
	 * can begin a new measurement before the result is read.
	 *
	 * @async
	 * @return {Promise<?number>} The GPU time in milliseconds, `0` without any pass, or `null` when the
	 * backend doesn't support timing.
	 */
	end() {

		if ( this._active === false ) {

			throw new Error( 'GPUTimer: end() called without begin().' );

		}

		const result = this.renderer.backend.endTimer( this._measurement );
		this._active = false;
		this._measurement = null;

		return result;

	}

}

export default GPUTimer;
