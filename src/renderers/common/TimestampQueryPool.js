/**
 * Abstract base class of a timestamp query pool. While GPU timers are active, the backend
 * allocates queries for its render and compute calls. Each query keeps the timers that were
 * active when it was allocated and adds its timestamps to them once it is read back.
 *
 * @abstract
 */
class TimestampQueryPool {

	/**
	 * Creates a new timestamp query pool.
	 *
	 * @param {number} [maxQueries=256] - Maximum number of queries this pool can hold.
	 */
	constructor( maxQueries = 256 ) {

		/**
		 * Maximum number of queries this pool can hold.
		 *
		 * @type {number}
		 * @default 256
		 */
		this.maxQueries = maxQueries;

		/**
		 * Whether the pool has been disposed or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.isDisposed = false;

		/**
		 * The active GPU timers.
		 *
		 * @type {Set<Object>}
		 */
		this.timers = new Set();

	}

	/**
	 * Starts a GPU timer. It measures the queries allocated until {@link TimestampQueryPool#endTimer}.
	 *
	 * @returns {Object} The timer.
	 */
	beginTimer() {

		const timer = { pending: 0, ended: false, lost: false, begin: null, finish: null, elapsed: 0, resolve: null, promise: null };
		timer.promise = new Promise( ( resolve ) => timer.resolve = resolve );

		this.timers.add( timer );

		return timer;

	}

	/**
	 * Ends the given GPU timer.
	 *
	 * @param {Object} timer - The timer returned by {@link TimestampQueryPool#beginTimer}.
	 * @returns {Promise<Object>} A Promise that resolves with the timer once all its queries are read back.
	 */
	endTimer( timer ) {

		timer.ended = true;

		this.timers.delete( timer );

		if ( timer.pending === 0 ) timer.resolve( timer );

		return timer.promise;

	}

	/**
	 * Returns the GPU time of the given timer in milliseconds.
	 *
	 * @abstract
	 * @param {Object} timer - The timer, ended and resolved.
	 * @returns {?number} The GPU time, or `null` if queries couldn't be read back.
	 */
	getDuration( /* timer */ ) {}

	/**
	 * Returns the active timers for a new query, `null` without active timers.
	 *
	 * @protected
	 * @returns {?Array<Object>} The timers.
	 */
	_retainTimers() {

		if ( this.timers.size === 0 ) return null;

		const timers = [ ...this.timers ];

		for ( const timer of timers ) timer.pending ++;

		return timers;

	}

	/**
	 * Releases the timers of a query once it is read back, and resolves the ended timers
	 * without pending queries.
	 *
	 * @protected
	 * @param {Array<Object>} timers - The timers returned by {@link TimestampQueryPool#_retainTimers}.
	 * @param {boolean} lost - Whether the query couldn't be read back.
	 */
	_releaseTimers( timers, lost ) {

		for ( const timer of timers ) {

			if ( lost ) timer.lost = true;

			timer.pending --;

			if ( timer.ended && timer.pending === 0 ) timer.resolve( timer );

		}

	}

	/**
	 * Reads back the queries that are ready.
	 *
	 * @abstract
	 */
	resolveQueries() {}

	/**
	 * Dispose of the query pool.
	 *
	 * @abstract
	 */
	dispose() {}

}

export default TimestampQueryPool;
