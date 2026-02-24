import { error, warnOnce } from '../../../utils.js';
import TimestampQueryPool from '../../common/TimestampQueryPool.js';

/**
 * Manages a pool of WebGPU timestamp queries for performance measurement.
 * Extends the base TimestampQueryPool to provide WebGPU-specific implementation.
 *
 * @augments TimestampQueryPool
 */
class WebGPUTimestampQueryPool extends TimestampQueryPool {

	/**
	 * Creates a new WebGPU timestamp query pool.
	 *
	 * @param {GPUDevice} device - The WebGPU device to create queries on.
	 * @param {string} type - The type identifier for this query pool.
	 * @param {number} [maxQueries=2048] - Maximum number of queries this pool can hold.
	 */
	constructor( device, type, maxQueries = 2048 ) {

		super( maxQueries );
		this.device = device;
		this.type = type;

		this.querySet = this.device.createQuerySet( {
			type: 'timestamp',
			count: this.maxQueries,
			label: `queryset_global_timestamp_${type}`
		} );

		const bufferSize = this.maxQueries * 8;
		this.resolveBuffer = this.device.createBuffer( {
			label: `buffer_timestamp_resolve_${type}`,
			size: bufferSize,
			usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
		} );

		this.resultBuffer = this.device.createBuffer( {
			label: `buffer_timestamp_result_${type}`,
			size: bufferSize,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
		} );

	}

	/**
	 * Allocates a pair of queries for a given render context.
	 *
	 * @param {string} uid - A unique identifier for the render context.
	 * @returns {?number} The base offset for the allocated queries, or null if allocation failed.
	 */
	allocateQueriesForContext( uid ) {

		if ( ! this.trackTimestamp || this.isDisposed ) return null;

		if ( this.currentQueryIndex + 2 > this.maxQueries ) {

			warnOnce( `WebGPUTimestampQueryPool [${ this.type }]: Maximum number of queries exceeded, when using trackTimestamp it is necessary to resolves the queries via renderer.resolveTimestampsAsync( THREE.TimestampQuery.${ this.type.toUpperCase() } ).` );
			return null;

		}

		const baseOffset = this.currentQueryIndex;
		this.currentQueryIndex += 2;

		this.queryOffsets.set( uid, baseOffset );

		return baseOffset;

	}

	/**
	 * Asynchronously resolves all pending queries and returns the total duration.
	 * If there's already a pending resolve operation, returns that promise instead.
	 *
	 * @async
	 * @returns {Promise<number>} The total duration in milliseconds, or the last valid value if resolution fails.
	 */
	async resolveQueriesAsync() {

		if ( ! this.trackTimestamp || this.currentQueryIndex === 0 || this.isDisposed ) {

			return this.lastValue;

		}

		if ( this.pendingResolve ) {

			return this.pendingResolve;

		}

		this.pendingResolve = this._resolveQueries();

		try {

			const result = await this.pendingResolve;
			return result;

		} finally {

			this.pendingResolve = null;

		}

	}

	/**
	 * Internal method to resolve queries and calculate total duration.
	 *
	 * @async
	 * @private
	 * @returns {Promise<number>} The total duration in milliseconds.
	 */
	async _resolveQueries() {

		if ( this.isDisposed ) {

			return this.lastValue;

		}

		try {

			if ( this.resultBuffer.mapState !== 'unmapped' ) {

				return this.lastValue;

			}

			const currentOffsets = new Map( this.queryOffsets );
			const queryCount = this.currentQueryIndex;
			const bytesUsed = queryCount * 8;

			// Reset state before GPU work
			this.currentQueryIndex = 0;
			this.queryOffsets.clear();

			const commandEncoder = this.device.createCommandEncoder();

			commandEncoder.resolveQuerySet(
				this.querySet,
				0,
				queryCount,
				this.resolveBuffer,
				0
			);

			commandEncoder.copyBufferToBuffer(
				this.resolveBuffer,
				0,
				this.resultBuffer,
				0,
				bytesUsed
			);

			const commandBuffer = commandEncoder.finish();
			this.device.queue.submit( [ commandBuffer ] );

			if ( this.resultBuffer.mapState !== 'unmapped' ) {

				return this.lastValue;

			}

			// Create and track the mapping operation
			await this.resultBuffer.mapAsync( GPUMapMode.READ, 0, bytesUsed );

			if ( this.isDisposed ) {

				if ( this.resultBuffer.mapState === 'mapped' ) {

					this.resultBuffer.unmap();

				}

				return this.lastValue;

			}

			//

			const times = new BigUint64Array( this.resultBuffer.getMappedRange( 0, bytesUsed ) );
			const framesDuration = {};

			const frames = [];

			for ( const [ uid, baseOffset ] of currentOffsets ) {

				const match = uid.match( /^(.*):f(\d+)$/ );
				const frame = parseInt( match[ 2 ] );

				if ( frames.includes( frame ) === false ) {

					frames.push( frame );

				}

				if ( framesDuration[ frame ] === undefined ) framesDuration[ frame ] = 0;

				const startTime = times[ baseOffset ];
				const endTime = times[ baseOffset + 1 ];
				const duration = Number( endTime - startTime ) / 1e6;

				this.timestamps.set( uid, duration );

				framesDuration[ frame ] += duration;

			}

			// Return the total duration of the last frame
			const totalDuration = framesDuration[ frames[ frames.length - 1 ] ];

			this.resultBuffer.unmap();
			this.lastValue = totalDuration;
			this.frames = frames;

			return totalDuration;

		} catch ( e ) {

			error( 'Error resolving queries:', e );
			if ( this.resultBuffer.mapState === 'mapped' ) {

				this.resultBuffer.unmap();

			}

			return this.lastValue;

		}

	}

	/**
	 * Dispose of the query pool.
	 *
	 * @async
	 * @returns {Promise} A Promise that resolves when the dispose has been executed.
	 */
	async dispose() {

		if ( this.isDisposed ) {

			return;

		}

		this.isDisposed = true;

		// Wait for pending resolve operation
		if ( this.pendingResolve ) {

			try {

				await this.pendingResolve;

			} catch ( e ) {

				error( 'Error waiting for pending resolve:', e );

			}

		}

		// Ensure buffer is unmapped before destroying
		if ( this.resultBuffer && this.resultBuffer.mapState === 'mapped' ) {

			try {

				this.resultBuffer.unmap();

			} catch ( e ) {

				error( 'Error unmapping buffer:', e );

			}

		}

		// Destroy resources
		if ( this.querySet ) {

			this.querySet.destroy();
			this.querySet = null;

		}

		if ( this.resolveBuffer ) {

			this.resolveBuffer.destroy();
			this.resolveBuffer = null;

		}

		if ( this.resultBuffer ) {

			this.resultBuffer.destroy();
			this.resultBuffer = null;

		}

		this.queryOffsets.clear();
		this.pendingResolve = null;

	}

}

export default WebGPUTimestampQueryPool;
