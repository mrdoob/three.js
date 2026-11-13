/**
 * Measures the GPU time of the render and compute passes issued between {@link GPUTimer#begin} and
 * {@link GPUTimer#end}, from the start of the first pass to the end of the last one.
 *
 * Timers can overlap and end in any order: a pass counts toward every active timer. In WebGL only one
 * timer can run at a time and an overlapping one returns `null`.
 *
 * Requires the `timestamp-query` feature in WebGPU or the `EXT_disjoint_timer_query_webgl2` extension
 * in WebGL. Otherwise the results are `null`.
 *
 * ```js
 * const timer = new GPUTimer( renderer );
 *
 * timer.begin();
 * renderer.render( scene, camera );
 * const { delta } = await timer.end();
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

		if ( this.renderer._initialized === false ) {

			throw new Error( 'THREE.GPUTimer: .begin() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

		}

		if ( this._active ) {

			throw new Error( 'THREE.GPUTimer: .begin() called while the timer is already active.' );

		}

		this._measurement = this.renderer.backend.beginTimer();
		this._active = true;

	}

	/**
	 * Stops timing and returns the GPU timing of the passes issued since {@link GPUTimer#begin}: the
	 * start of the first pass, the end of the last one and the time between them, in milliseconds. The
	 * timer can begin a new measurement before the result is read.
	 *
	 * `start` and `end` are GPU timestamps, only comparable with each other, and are `null` in WebGL or
	 * without any pass. `delta` is `0` without any pass. The result is `null` when the backend doesn't
	 * support timing.
	 *
	 * @async
	 * @return {Promise<?{start: ?number, end: ?number, delta: number}>} The GPU timing in milliseconds.
	 */
	end() {

		if ( this._active === false ) {

			throw new Error( 'THREE.GPUTimer: .end() called without .begin().' );

		}

		const result = this.renderer.backend.endTimer( this._measurement );
		this._active = false;
		this._measurement = null;

		return result;

	}

}

export default GPUTimer;
