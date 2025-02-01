/**
 * Abstract base class of a timestamp query pool.
 *
 * @abstract
 */
class TimestampQueryPool {

	/**
	 * Creates a new timestamp query pool.
	 *
	 * @param {Number} [maxQueries=256] - Maximum number of queries this pool can hold.
	 */
	constructor( maxQueries = 256 ) {

		/**
		 * Whether to track timestamps or not.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.trackTimestamp = true;

		/**
		 * Maximum number of queries this pool can hold.
		 *
		 * @type {Number}
		 * @default 256
		 */
		this.maxQueries = maxQueries;

		/**
		 * How many queries allocated so far.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.currentQueryIndex = 0;

		/**
		 * Tracks offsets for different contexts.
		 *
		 * @type {Map}
		 */
		this.queryOffsets = new Map();

		/**
		 * Whether the pool has been disposed or not.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.isDisposed = false;

		/**
		 * TODO
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.lastValue = 0;

		/**
		 * TODO
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.pendingResolve = false;

	}

	/**
	 * Allocate queries for a specific renderContext.
	 *
	 * @abstract
	 * @param {Object} renderContext - The render context to allocate queries for.
	 */
	allocateQueriesForContext( /* renderContext */ ) {}

	/**
	 * Resolve all timestamps and return data (or process them).
	 *
	 * @abstract
	 * @async
	 * @returns {Promise<Number>|Number} The resolved timestamp value.
	 */
	async resolveQueriesAsync() {}

	/**
	 * Dispose of the query pool.
	 *
	 * @abstract
	 */
	dispose() {}

}

export default TimestampQueryPool;
