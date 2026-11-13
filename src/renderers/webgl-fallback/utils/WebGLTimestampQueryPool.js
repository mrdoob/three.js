import TimestampQueryPool from '../../common/TimestampQueryPool.js';

/**
 * Manages the WebGL timer queries of GPU timers. Each render and compute call measures its
 * elapsed time with a `TIME_ELAPSED` query, a timer sums the elapsed time of its calls.
 *
 * Only one query can be active at a time, so a call nested in another one is measured by the outer
 * query and a timer that begins inside a call can't be measured.
 *
 * @augments TimestampQueryPool
 */
class WebGLTimestampQueryPool extends TimestampQueryPool {

	/**
	 * Creates a new WebGL timestamp query pool.
	 *
	 * @param {WebGL2RenderingContext} gl - The WebGL context.
	 * @param {string} type - The type identifier for this query pool.
	 */
	constructor( gl, type ) {

		super();

		this.gl = gl;
		this.type = type;

		/**
		 * A reference to the `EXT_disjoint_timer_query_webgl2` extension.
		 *
		 * @type {EXTDisjointTimerQueryWebGL2}
		 */
		this.ext = gl.getExtension( 'EXT_disjoint_timer_query_webgl2' );

		/**
		 * The active query, `null` if there is none.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.activeQuery = null;

		/**
		 * The ended queries that wait for their result.
		 *
		 * @type {Array<Object>}
		 */
		this.queries = [];

	}

	/**
	 * Starts a GPU timer. A timer that begins inside a measured call can't be measured.
	 *
	 * @returns {Object} The timer.
	 */
	beginTimer() {

		const timer = super.beginTimer();

		if ( this.activeQuery !== null ) timer.lost = true;

		return timer;

	}

	/**
	 * Begins a query for the active timers.
	 *
	 * @returns {?Object} The query, or `null` without active timers or inside another query.
	 */
	beginQuery() {

		if ( this.isDisposed || this.activeQuery !== null ) return null;

		const timers = this._retainTimers();

		if ( timers === null ) return null;

		const query = { query: this.gl.createQuery(), timers };

		this.gl.beginQuery( this.ext.TIME_ELAPSED_EXT, query.query );

		this.activeQuery = query;

		return query;

	}

	/**
	 * Ends the given query.
	 *
	 * @param {?Object} query - The query returned by {@link WebGLTimestampQueryPool#beginQuery}.
	 */
	endQuery( query ) {

		if ( query === null || query !== this.activeQuery ) return;

		this.gl.endQuery( this.ext.TIME_ELAPSED_EXT );

		this.activeQuery = null;
		this.queries.push( query );

	}

	/**
	 * Returns the GPU time of the given timers, the sum of the elapsed time of their calls.
	 *
	 * @param {Array<Object>} timers - The timers, ended and resolved.
	 * @returns {?number} The GPU time in milliseconds, or `null` if queries couldn't be measured.
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
	 * Reads back the ended queries whose results are available. The results of all ended
	 * queries are lost if the GPU timer was disjoint.
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
	 * Releases all resources held by this query pool.
	 */
	dispose() {

		if ( this.isDisposed ) return;

		this.isDisposed = true;

		for ( const { query, timers } of this.queries ) {

			this.gl.deleteQuery( query );
			this._releaseTimers( timers, true );

		}

		this.queries = [];

	}

}

export default WebGLTimestampQueryPool;
