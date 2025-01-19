import TimestampQueryPool from '../../common/TimestampQueryPool.js';

class WebGLTimestampQueryPool extends TimestampQueryPool {

	constructor( gl, type, maxQueries = 2048 ) {

		super( maxQueries );

		this.gl = gl;
		this.type = type;
		this.pendingResolve = false;
		this.lastValue = 0; // Add lastValue tracking

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

		this.queryOffsets = new Map();
		this.activeQuery = null;
		this.queryStates = new Map(); // Track state of each query: 'inactive', 'started', 'ended'

	}

	allocateQueriesForContext( renderContext ) {

		if ( ! this.trackTimestamp ) return null;

		// Check if we have enough space for a new query pair
		if ( this.currentQueryIndex + 2 > this.maxQueries ) {

			return null;

		}

		const baseOffset = this.currentQueryIndex;
		this.currentQueryIndex += 2;

		// Initialize query states
		this.queryStates.set( baseOffset, 'inactive' );
		this.queryOffsets.set( renderContext.id, baseOffset );

		return baseOffset;

	}

	beginQuery( renderContext ) {

		if ( ! this.trackTimestamp ) return;

		const baseOffset = this.queryOffsets.get( renderContext.id );
		if ( baseOffset == null ) return;

		// Don't start a new query if there's an active one
		if ( this.activeQuery !== null ) {

			return;

		}

		const query = this.queries[ baseOffset ];
		if ( ! query ) return;

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

	endQuery( renderContext ) {

		if ( ! this.trackTimestamp ) return;

		const baseOffset = this.queryOffsets.get( renderContext.id );
		if ( baseOffset == null ) return;

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

	async resolveAllQueriesAsync() {

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

	async resolveQuery( query ) {

		return new Promise( ( resolve ) => {

			const checkQuery = () => {

				try {

					const disjoint = this.gl.getParameter( this.ext.GPU_DISJOINT_EXT );
					if ( disjoint ) {

						resolve( this.lastValue );
						return;

					}

					const available = this.gl.getQueryParameter( query, this.gl.QUERY_RESULT_AVAILABLE );
					if ( ! available ) {

						setTimeout( checkQuery, 1 );
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

	dispose() {

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
