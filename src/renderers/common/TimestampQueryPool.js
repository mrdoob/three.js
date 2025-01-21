class TimestampQueryPool {

	constructor( maxQueries = 256 ) {

		this.trackTimestamp = true;
		this.maxQueries = maxQueries;
		this.currentQueryIndex = 0; // how many queries allocated so far
		this.queryOffsets = new Map(); // track offsets for different contexts
		this.isDisposed = false;
		this.lastValue = 0;
		this.pendingResolve = false;

	}

	/**
     * Allocate queries for a specific renderContext.
	 *
	 * @abstract
     */
	allocateQueriesForContext( /* renderContext */ ) {}

	/**
     * Resolve all timestamps and return data (or process them).
	 *
	 * @abstract
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
