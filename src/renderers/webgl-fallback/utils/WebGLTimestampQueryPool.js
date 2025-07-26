import { warnOnce } from '../../../utils.js';
import TimestampQueryPool from '../../common/TimestampQueryPool.js';

/**
 * Manages a pool of WebGL timestamp queries for performance measurement.
 * Handles creation, execution, and resolution of timer queries using WebGL extensions.
 *
 * @augments TimestampQueryPool
 */
class WebGLTimestampQueryPool extends TimestampQueryPool {

	/**
	 * Creates a new WebGL timestamp query pool.
	 *
	 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl - The WebGL context.
	 * @param {string} type - The type identifier for this query pool.
	 * @param {number} [maxQueries=2048] - Maximum number of queries this pool can hold.
	 */
	constructor( gl, type, maxQueries = 2048 ) {

		super( maxQueries );

		this.gl = gl;
		this.type = type;

		// Check for timer query extensions
		this.ext = gl.getExtension( 'EXT_disjoint_timer_query_webgl2' ) ||
				  gl.getExtension( 'EXT_disjoint_timer_query' );

		if ( ! this.ext ) {

			console.warn( 'EXT_disjoint_timer_query not supported; timestamps will be disabled.' );
			this.trackTimestamp = false;
			return;

		}

		// Create query objects
		this.queries = [];
		for ( let i = 0; i < this.maxQueries; i ++ ) {

			this.queries.push( gl.createQuery() );

		}

		this.activeQuery = null;
		this.queryStates = new Map(); // Track state of each query: 'inactive', 'started', 'ended'

	}

	/**
	 * Allocates a pair of queries for a given render context.
	 *
	 * @param {Object} renderContext - The render context to allocate queries for.
	 * @returns {?number} The base offset for the allocated queries, or null if allocation failed.
	 */
	allocateQueriesForContext( renderContext ) {

		if ( ! this.trackTimestamp ) return null;

		// Check if we have enough space for a new query pair
		if ( this.currentQueryIndex + 2 > this.maxQueries ) {

			warnOnce( `WebGPUTimestampQueryPool [${ this.type }]: Maximum number of queries exceeded, when using trackTimestamp it is necessary to resolves the queries via renderer.resolveTimestampsAsync( THREE.TimestampQuery.${ this.type.toUpperCase() } ).` );
			return null;

		}

		const baseOffset = this.currentQueryIndex;
		this.currentQueryIndex += 2;

		// Initialize query states
		this.queryStates.set( baseOffset, 'inactive' );
		this.queryOffsets.set( renderContext.id, baseOffset );

		return baseOffset;

	}

	/**
	 * Begins a timestamp query for the specified render context.
	 *
	 * @param {Object} renderContext - The render context to begin timing for.
	 */
	beginQuery( renderContext ) {

		if ( ! this.trackTimestamp || this.isDisposed ) {

			return;

		}

		const baseOffset = this.queryOffsets.get( renderContext.id );
		if ( baseOffset == null ) {

			return;

		}

		// Don't start a new query if there's an active one
		if ( this.activeQuery !== null ) {

			return;

		}

		const query = this.queries[ baseOffset ];
		if ( ! query ) {

			return;

		}

		try {

			// Only begin if query is inactive
			if ( this.queryStates.get( baseOffset ) === 'inactive' ) {

				this.gl.beginQuery( this.ext.TIME_ELAPSED_EXT, query );
				this.activeQuery = baseOffset;
				this.queryStates.set( baseOffset, 'started' );

			}

		} catch ( error ) {

			console.error( 'Error in beginQuery:', error );
			this.activeQuery = null;
			this.queryStates.set( baseOffset, 'inactive' );

		}

	}

	/**
	 * Ends the active timestamp query for the specified render context.
	 *
	 * @param {Object} renderContext - The render context to end timing for.
	 * @param {string} renderContext.id - Unique identifier for the render context.
	 */
	endQuery( renderContext ) {

		if ( ! this.trackTimestamp || this.isDisposed ) {

			return;

		}

		const baseOffset = this.queryOffsets.get( renderContext.id );
		if ( baseOffset == null ) {

			return;

		}

		// Only end if this is the active query
		if ( this.activeQuery !== baseOffset ) {

			return;

		}

		try {

			this.gl.endQuery( this.ext.TIME_ELAPSED_EXT );
			this.queryStates.set( baseOffset, 'ended' );
			this.activeQuery = null;

		} catch ( error ) {

			console.error( 'Error in endQuery:', error );
			// Reset state on error
			this.queryStates.set( baseOffset, 'inactive' );
			this.activeQuery = null;

		}

	}

	/**
	 * Asynchronously resolves all completed queries and returns the total duration.
	 *
	 * @async
	 * @returns {Promise<number>} The total duration in milliseconds, or the last valid value if resolution fails.
	 */
	async resolveQueriesAsync() {

		if ( ! this.trackTimestamp || this.pendingResolve ) {

			return this.lastValue;

		}

		this.pendingResolve = true;

		try {

			// Wait for all ended queries to complete
			const resolvePromises = [];

			for ( const [ baseOffset, state ] of this.queryStates ) {

				if ( state === 'ended' ) {

					const query = this.queries[ baseOffset ];
					resolvePromises.push( this.resolveQuery( query ) );

				}

			}

			if ( resolvePromises.length === 0 ) {

				return this.lastValue;

			}

			const results = await Promise.all( resolvePromises );
			const totalDuration = results.reduce( ( acc, val ) => acc + val, 0 );

			// Store the last valid result
			this.lastValue = totalDuration;

			// Reset states
			this.currentQueryIndex = 0;
			this.queryOffsets.clear();
			this.queryStates.clear();
			this.activeQuery = null;

			return totalDuration;

		} catch ( error ) {

			console.error( 'Error resolving queries:', error );
			return this.lastValue;

		} finally {

			this.pendingResolve = false;

		}

	}

	/**
	 * Resolves a single query, checking for completion and disjoint operation.
	 *
	 * @async
	 * @param {WebGLQuery} query - The query object to resolve.
	 * @returns {Promise<number>} The elapsed time in milliseconds.
	 */
	async resolveQuery( query ) {

		return new Promise( ( resolve ) => {

			if ( this.isDisposed ) {

				resolve( this.lastValue );
				return;

			}

			let timeoutId;
			let isResolved = false;

			const cleanup = () => {

				if ( timeoutId ) {

					clearTimeout( timeoutId );
					timeoutId = null;

				}

			};

			const finalizeResolution = ( value ) => {

				if ( ! isResolved ) {

					isResolved = true;
					cleanup();
					resolve( value );

				}

			};

			const checkQuery = () => {

				if ( this.isDisposed ) {

					finalizeResolution( this.lastValue );
					return;

				}

				try {

					// Check if the GPU timer was disjoint (i.e., timing was unreliable)
					const disjoint = this.gl.getParameter( this.ext.GPU_DISJOINT_EXT );
					if ( disjoint ) {

						finalizeResolution( this.lastValue );
						return;

					}

					const available = this.gl.getQueryParameter( query, this.gl.QUERY_RESULT_AVAILABLE );
					if ( ! available ) {

						timeoutId = setTimeout( checkQuery, 1 );
						return;

					}

					const elapsed = this.gl.getQueryParameter( query, this.gl.QUERY_RESULT );
					resolve( Number( elapsed ) / 1e6 ); // Convert nanoseconds to milliseconds

				} catch ( error ) {

					console.error( 'Error checking query:', error );
					resolve( this.lastValue );

				}

			};

			checkQuery();

		} );

	}

	/**
	 * Releases all resources held by this query pool.
	 * This includes deleting all query objects and clearing internal state.
	 */
	dispose() {

		if ( this.isDisposed ) {

			return;

		}

		this.isDisposed = true;

		if ( ! this.trackTimestamp ) return;

		for ( const query of this.queries ) {

			this.gl.deleteQuery( query );

		}

		this.queries = [];
		this.queryStates.clear();
		this.queryOffsets.clear();
		this.lastValue = 0;
		this.activeQuery = null;

	}

}

export default WebGLTimestampQueryPool;
