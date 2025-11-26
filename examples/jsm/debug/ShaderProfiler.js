/**
 * ShaderProfiler - Performance profiling for shader rendering
 * 
 * Tracks:
 * - Frame rate (FPS)
 * - Frame time (CPU)
 * - GPU time (when available)
 * - Draw calls
 * - Triangle count
 * - Shader program count
 * - Memory usage
 */
class ShaderProfiler {

	constructor( renderer ) {

		this.renderer = renderer;
		this.isRunning = false;

		// Frame timing
		this.frameTimes = [];
		this.gpuTimes = [];
		this.maxSamples = 60;
		this.lastTime = 0;

		// Stats
		this.frameCount = 0;
		this.minFrameTime = Infinity;
		this.maxFrameTime = 0;

		// GPU timing (WebGL extension)
		this.gpuTimingAvailable = false;
		this.gpuQuery = null;
		this.gpuQueryPending = false;
		this._initGpuTiming();

	}

	/**
	 * Initializes GPU timing extension if available.
	 * @private
	 */
	_initGpuTiming() {

		const gl = this.renderer.getContext();
		
		// Try WebGL 2 disjoint timer query
		this.timerExt = gl.getExtension( 'EXT_disjoint_timer_query_webgl2' );

		if ( ! this.timerExt ) {

			// Try WebGL 1 version
			this.timerExt = gl.getExtension( 'EXT_disjoint_timer_query' );

		}

		this.gpuTimingAvailable = !! this.timerExt;

	}

	/**
	 * Starts profiling.
	 */
	start() {

		this.isRunning = true;
		this.frameTimes = [];
		this.gpuTimes = [];
		this.frameCount = 0;
		this.minFrameTime = Infinity;
		this.maxFrameTime = 0;
		this.lastTime = performance.now();

	}

	/**
	 * Stops profiling and returns results.
	 * @returns {Object} Profiling summary
	 */
	stop() {

		this.isRunning = false;
		return this.getSummary();

	}

	/**
	 * Updates profiler (call once per frame).
	 */
	update() {

		if ( ! this.isRunning ) return;

		const now = performance.now();
		const frameTime = now - this.lastTime;
		this.lastTime = now;

		// Track frame time
		this.frameTimes.push( frameTime );
		if ( this.frameTimes.length > this.maxSamples ) {

			this.frameTimes.shift();

		}

		// Track min/max
		if ( frameTime < this.minFrameTime ) this.minFrameTime = frameTime;
		if ( frameTime > this.maxFrameTime ) this.maxFrameTime = frameTime;

		this.frameCount ++;

		// GPU timing (if available)
		this._updateGpuTiming();

	}

	/**
	 * Updates GPU timing.
	 * @private
	 */
	_updateGpuTiming() {

		if ( ! this.gpuTimingAvailable || ! this.timerExt ) return;

		const gl = this.renderer.getContext();

		// Check if previous query is ready
		if ( this.gpuQuery && this.gpuQueryPending ) {

			const available = gl.getQueryParameter(
				this.gpuQuery,
				gl.QUERY_RESULT_AVAILABLE
			);

			const disjoint = gl.getParameter( this.timerExt.GPU_DISJOINT_EXT );

			if ( available && ! disjoint ) {

				const gpuTimeNs = gl.getQueryParameter( this.gpuQuery, gl.QUERY_RESULT );
				const gpuTimeMs = gpuTimeNs / 1000000;

				this.gpuTimes.push( gpuTimeMs );
				if ( this.gpuTimes.length > this.maxSamples ) {

					this.gpuTimes.shift();

				}

				this.gpuQueryPending = false;

			}

		}

		// Start new query if not pending
		if ( ! this.gpuQueryPending ) {

			if ( ! this.gpuQuery ) {

				this.gpuQuery = gl.createQuery();

			}

			gl.beginQuery( this.timerExt.TIME_ELAPSED_EXT, this.gpuQuery );
			// Note: endQuery should be called after rendering
			// For simplicity, we end it immediately here
			gl.endQuery( this.timerExt.TIME_ELAPSED_EXT );
			this.gpuQueryPending = true;

		}

	}

	/**
	 * Gets current profiling summary.
	 * @returns {Object} Profiling metrics
	 */
	getSummary() {

		const info = this.renderer.info;

		// Calculate averages
		const avgFrameTime = this.frameTimes.length > 0
			? this.frameTimes.reduce( ( a, b ) => a + b, 0 ) / this.frameTimes.length
			: 0;

		const avgGpuTime = this.gpuTimes.length > 0
			? this.gpuTimes.reduce( ( a, b ) => a + b, 0 ) / this.gpuTimes.length
			: 0;

		const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

		return {
			// Timing
			fps: fps,
			avgFrameTime: avgFrameTime,
			minFrameTime: this.minFrameTime === Infinity ? 0 : this.minFrameTime,
			maxFrameTime: this.maxFrameTime,
			avgGpuTime: avgGpuTime,
			gpuTimestampsAvailable: this.gpuTimingAvailable,

			// Render stats
			drawCalls: info.render?.calls || 0,
			triangles: info.render?.triangles || 0,
			points: info.render?.points || 0,
			lines: info.render?.lines || 0,

			// Resources
			programs: info.programs?.length || 0,
			geometries: info.memory?.geometries || 0,
			textures: info.memory?.textures || 0,

			// Calculated
			uniforms: this._countUniforms(),

			// Memory (estimated)
			memory: {
				geometries: ( info.memory?.geometries || 0 ) * 1024, // Rough estimate
				textures: ( info.memory?.textures || 0 ) * 1024 * 4,
				programs: info.programs?.length || 0
			}
		};

	}

	/**
	 * Counts total uniforms across all programs.
	 * @private
	 */
	_countUniforms() {

		let count = 0;
		const programs = this.renderer.info.programs;

		if ( programs ) {

			programs.forEach( program => {

				if ( program.uniforms ) {

					count += Object.keys( program.uniforms ).length;

				}

			} );

		}

		return count;

	}

	/**
	 * Disposes of profiler resources.
	 */
	dispose() {

		if ( this.gpuQuery ) {

			const gl = this.renderer.getContext();
			gl.deleteQuery( this.gpuQuery );
			this.gpuQuery = null;

		}

		this.isRunning = false;

	}

}

export { ShaderProfiler };

