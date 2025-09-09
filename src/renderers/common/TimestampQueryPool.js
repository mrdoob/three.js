/**
 * Abstract base class of a timestamp query pool.
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
		 * Whether to track timestamps or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.trackTimestamp = true;

		/**
		 * Maximum number of queries this pool can hold.
		 *
		 * @type {number}
		 * @default 256
		 */
		this.maxQueries = maxQueries;

		/**
		 * How many queries allocated so far.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.currentQueryIndex = 0;

		/**
		 * Tracks offsets for different contexts.
		 *
		 * @type {Map<string, number>}
		 */
		this.queryOffsets = new Map();

		/**
		 * Whether the pool has been disposed or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.isDisposed = false;

		/**
		 * TODO
		 *
		 * @type {number}
		 * @default 0
		 */
		this.lastValue = 0;

		/**
		 * TODO
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.pendingResolve = false;

		/**
		 * Stores the latest timestamp for each render context.
		 *
		 * @type {Map<string, number>}
		 */
		this.timestamps = new Map();

	}

	/**
	 * Returns the latest timestamp for a given render context.
	 *
	 * @param {string} uid - A unique identifier for the render context.
	 * @return {?number} The latest timestamp, or undefined if not available.
	 */
	getCurrentTimestamp( uid ) {

		return this.timestamps.get( uid );

	}

	/**
	 * Allocate queries for a specific uid.
	 *
	 * @abstract
	 * @param {string} uid - A unique identifier for the render context.
	 * @returns {?number}
	 */
	allocateQueriesForContext( /* uid */ ) {}

	/**
	 * Resolve all timestamps and return data (or process them).
	 *
	 * @abstract
	 * @async
	 * @returns {Promise<number>|number} The resolved timestamp value.
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
