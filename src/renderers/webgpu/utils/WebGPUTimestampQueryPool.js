import { error } from '../../../utils.js';
import TimestampQueryPool from '../../common/TimestampQueryPool.js';
import { submit } from './WebGPUUtils.js';
import GPUBufferDescriptor from '../descriptors/GPUBufferDescriptor.js';
import GPUCommandEncoderDescriptor from '../descriptors/GPUCommandEncoderDescriptor.js';
import GPUQuerySetDescriptor from '../descriptors/GPUQuerySetDescriptor.js';

const _bufferDescriptor = new GPUBufferDescriptor();
const _commandEncoderDescriptor = new GPUCommandEncoderDescriptor();
const _querySetDescriptor = new GPUQuerySetDescriptor();

/**
 * Manages a pool of WebGPU timestamp queries for GPU timers. Each pass writes a begin and an
 * end timestamp, a timer measures from the earliest begin to the latest end of its passes.
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

		/**
		 * How many queries allocated so far.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.currentQueryIndex = 0;

		/**
		 * The timers of each allocated query pair, by the index of its first query.
		 *
		 * @type {Map<number, Array<Object>>}
		 */
		this.queryTimers = new Map();

		/**
		 * The readback in flight, `null` if there is none.
		 *
		 * @type {?Promise}
		 * @default null
		 */
		this.pendingResolve = null;

		_querySetDescriptor.label = `queryset_global_timestamp_${type}`;
		_querySetDescriptor.type = 'timestamp';
		_querySetDescriptor.count = this.maxQueries;

		this.querySet = this.device.createQuerySet( _querySetDescriptor );

		_querySetDescriptor.reset();

		const bufferSize = this.maxQueries * 8;

		_bufferDescriptor.label = `buffer_timestamp_resolve_${type}`;
		_bufferDescriptor.size = bufferSize;
		_bufferDescriptor.usage = GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC;

		this.resolveBuffer = this.device.createBuffer( _bufferDescriptor );

		_bufferDescriptor.reset();

		_bufferDescriptor.label = `buffer_timestamp_result_${type}`;
		_bufferDescriptor.size = bufferSize;
		_bufferDescriptor.usage = GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ;

		this.resultBuffer = this.device.createBuffer( _bufferDescriptor );

		_bufferDescriptor.reset();

	}

	/**
	 * Allocates a pair of queries for the active timers.
	 *
	 * @returns {?number} The index of the first query, or `null` without active timers.
	 */
	allocateQueries() {

		if ( this.isDisposed || this.timers.size === 0 ) return null;

		if ( this.currentQueryIndex + 2 > this.maxQueries ) {

			this.resolveQueries();

			if ( this.currentQueryIndex > 0 ) {

				// a readback is in flight, so the queries are dropped

				for ( const timers of this.queryTimers.values() ) this._releaseTimers( timers, true );

				this.currentQueryIndex = 0;
				this.queryTimers.clear();

			}

		}

		const baseOffset = this.currentQueryIndex;
		this.currentQueryIndex += 2;

		this.queryTimers.set( baseOffset, this._retainTimers() );

		return baseOffset;

	}

	/**
	 * Returns the GPU time of the given timers, from the earliest begin to the latest end of their passes.
	 *
	 * @param {Array<Object>} timers - The timers, ended and resolved.
	 * @returns {?number} The GPU time in milliseconds, or `null` if queries couldn't be read back.
	 */
	getDuration( timers ) {

		let begin = null;
		let finish = null;

		for ( const timer of timers ) {

			if ( timer.lost ) return null;

			if ( timer.begin === null ) continue;

			if ( begin === null || timer.begin < begin ) begin = timer.begin;
			if ( finish === null || timer.finish > finish ) finish = timer.finish;

		}

		return begin === null ? 0 : Number( finish - begin ) / 1e6;

	}

	/**
	 * Reads back the allocated queries. Only one readback is in flight, queries allocated meanwhile
	 * are read back with the next one.
	 */
	resolveQueries() {

		if ( this.pendingResolve !== null || this.currentQueryIndex === 0 || this.isDisposed ) return;

		this.pendingResolve = this._resolveQueries().finally( () => this.pendingResolve = null );

	}

	/**
	 * Reads back the allocated queries and adds their timestamps to their timers.
	 *
	 * @async
	 * @private
	 * @returns {Promise} A Promise that resolves when the readback has finished.
	 */
	async _resolveQueries() {

		const queryTimers = this.queryTimers;
		const queryCount = this.currentQueryIndex;
		const bytesUsed = queryCount * 8;

		this.queryTimers = new Map();
		this.currentQueryIndex = 0;

		let lost = true;

		try {

			const commandEncoder = this.device.createCommandEncoder( _commandEncoderDescriptor );
			commandEncoder.resolveQuerySet( this.querySet, 0, queryCount, this.resolveBuffer, 0 );
			commandEncoder.copyBufferToBuffer( this.resolveBuffer, 0, this.resultBuffer, 0, bytesUsed );

			submit( this.device, commandEncoder.finish() );

			await this.resultBuffer.mapAsync( GPUMapMode.READ, 0, bytesUsed );

			if ( this.isDisposed ) return;

			const times = new BigUint64Array( this.resultBuffer.getMappedRange( 0, bytesUsed ) );

			// passes don't run in the order they allocated queries, a nested pass (a shadow map) runs before its parent

			for ( const [ baseOffset, timers ] of queryTimers ) {

				const begin = times[ baseOffset ];
				const finish = times[ baseOffset + 1 ];

				for ( const timer of timers ) {

					if ( timer.begin === null || begin < timer.begin ) timer.begin = begin;
					if ( timer.finish === null || finish > timer.finish ) timer.finish = finish;

				}

			}

			this.resultBuffer.unmap();

			lost = false;

		} catch ( e ) {

			error( 'WebGPUTimestampQueryPool: Error resolving queries:', e );

			if ( this.resultBuffer !== null && this.resultBuffer.mapState === 'mapped' ) this.resultBuffer.unmap();

		} finally {

			for ( const timers of queryTimers.values() ) this._releaseTimers( timers, lost );

		}

	}

	/**
	 * Dispose of the query pool.
	 *
	 * @async
	 * @returns {Promise} A Promise that resolves when the dispose has been executed.
	 */
	async dispose() {

		if ( this.isDisposed ) return;

		this.isDisposed = true;

		if ( this.pendingResolve !== null ) await this.pendingResolve;

		for ( const timers of this.queryTimers.values() ) this._releaseTimers( timers, true );

		this.queryTimers.clear();

		if ( this.resultBuffer.mapState === 'mapped' ) this.resultBuffer.unmap();

		this.querySet.destroy();
		this.resolveBuffer.destroy();
		this.resultBuffer.destroy();

		this.querySet = null;
		this.resolveBuffer = null;
		this.resultBuffer = null;

	}

}

export default WebGPUTimestampQueryPool;
