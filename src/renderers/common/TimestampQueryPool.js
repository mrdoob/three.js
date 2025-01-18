class TimestampQueryPool {

	constructor( maxQueries = 256 ) {

		this.trackTimestamp = true;
		this.maxQueries = maxQueries;
		this.currentQueryIndex = 0; // how many queries allocated so far
		this.queryOffsets = new Map(); // track offsets for different contexts

	}

	/**
     * Allocate queries for a specific renderContext.
     * Must be overridden by subclasses.
     */
	allocateQueriesForContext( /* renderContext */ ) {}

	/**
     * Resolve all timestamps and return data (or process them).
     * Must be overridden by subclasses.
     */
	async resolveAllQueriesAsync() {}


	dispose() {}

}

export default TimestampQueryPool;
