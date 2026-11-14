import TimestampQueryPool from '../../common/TimestampQueryPool.js';

/**
 * Manages the WebGL timer queries of GPU timers. While timers are active, a `TIME_ELAPSED` query
 * measures the render and compute calls. The query restarts when a timer begins or ends, so each
 * query adds its elapsed time to the timers that were active during it.
 *
 * @augments TimestampQueryPool
 */
class WebGLTimestampQueryPool extends TimestampQueryPool {

	/**
	 * Creates a new WebGL timestamp query pool.
	 *
	 * @param {WebGL2RenderingContext} gl - The WebGL context.
	 * @param {EXTDisjointTimerQueryWebGL2} ext - The `EXT_disjoint_timer_query_webgl2` extension.
	 */
	constructor( gl, ext ) {

		super();

		this.gl = gl;
		this.ext = ext;

		/**
		 * The active query, `null` if there is none.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.activeQuery = null;

		/**
		 * The ended queries waiting for their results.
		 *
		 * @type {Array<Object>}
		 */
		this.queries = [];

	}

	/**
	 * Starts a GPU timer.
	 *
	 * @returns {Object} The timer.
	 */
	beginTimer() {

		this._endQuery();

		const timer = super.beginTimer();

		this._beginQuery();

		return timer;

	}

	/**
	 * Ends the given GPU timer.
	 *
	 * @param {Object} timer - The timer returned by {@link WebGLTimestampQueryPool#beginTimer}.
	 * @returns {Promise<Object>} A Promise that resolves with the timer once all its queries are read back.
	 */
	endTimer( timer ) {

		this._endQuery();

		const promise = super.endTimer( timer );

		this._beginQuery();

		return promise;

	}

	/**
	 * Returns the GPU time of the given timers, the sum of their elapsed times.
	 *
	 * @param {Array<Object>} timers - The timers, ended and resolved.
	 * @returns {?number} The GPU time in milliseconds, or `null` if a query was disjoint.
	 */
	getDuration( timers ) {

		let elapsed = 0;

		for ( const timer of timers ) {

			if ( timer.lost ) return null;

			elapsed += timer.elapsed;

		}

		return elapsed;

	}

	/**
	 * Reads back the ended queries whose results are available.
	 */
	resolveQueries() {

		if ( this.queries.length === 0 || this.isDisposed ) return;

		const gl = this.gl;
		const disjoint = gl.getParameter( this.ext.GPU_DISJOINT_EXT );

		this.queries = this.queries.filter( ( { query, timers } ) => {

			if ( disjoint === false && gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE ) === false ) return true;

			if ( disjoint === false ) {

				const elapsed = gl.getQueryParameter( query, gl.QUERY_RESULT ) / 1e6;

				for ( const timer of timers ) timer.elapsed += elapsed;

			}

			this._releaseTimers( timers, disjoint );

			gl.deleteQuery( query );

			return false;

		} );

	}

	/**
	 * Starts a query for the active timers.
	 *
	 * @private
	 */
	_beginQuery() {

		if ( this.isDisposed ) return;

		const timers = this._retainTimers();

		if ( timers === null ) return;

		const query = this.gl.createQuery();

		this.gl.beginQuery( this.ext.TIME_ELAPSED_EXT, query );

		this.activeQuery = { query, timers };

	}

	/**
	 * Ends the active query.
	 *
	 * @private
	 */
	_endQuery() {

		if ( this.activeQuery === null ) return;

		this.gl.endQuery( this.ext.TIME_ELAPSED_EXT );

		this.queries.push( this.activeQuery );
		this.activeQuery = null;

	}

	/**
	 * Dispose of the query pool.
	 */
	dispose() {

		if ( this.isDisposed ) return;

		this._endQuery();

		this.isDisposed = true;

		for ( const { query, timers } of this.queries ) {

			this.gl.deleteQuery( query );
			this._releaseTimers( timers, true );

		}

		this.queries = [];

	}

}

export default WebGLTimestampQueryPool;
