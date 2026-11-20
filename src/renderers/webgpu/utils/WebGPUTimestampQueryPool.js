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
 * Only one readback is in flight. When the query set is full meanwhile, it waits for its own
 * readback and the following passes continue in another query set, so no query is dropped.
 *
 * @augments TimestampQueryPool
 */
class WebGPUTimestampQueryPool extends TimestampQueryPool {

	/**
	 * Creates a new WebGPU timestamp query pool.
	 *
	 * @param {GPUDevice} device - The WebGPU device to create queries on.
	 * @param {number} [maxQueries=4096] - Maximum number of queries of a query set.
	 */
	constructor( device, maxQueries = 4096 ) {

		super( maxQueries );
		this.device = device;

		/**
		 * The query set the passes write to.
		 *
		 * @type {GPUQuerySet}
		 */
		this.querySet = this._createQuerySet();

		/**
		 * How many queries of the current query set are allocated.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.currentQueryIndex = 0;

		/**
		 * The timers of each allocated query pair of the current query set, by the index of its first query.
		 *
		 * @type {Map<number, Array<Object>>}
		 */
		this.queryTimers = new Map();

		/**
		 * The full query sets waiting for their readback.
		 *
		 * @type {Array<{querySet: GPUQuerySet, queryTimers: Map<number, Array<Object>>, queryCount: number}>}
		 */
		this.fullQuerySets = [];

		/**
		 * The query sets that were read back and can be reused.
		 *
		 * @type {Array<GPUQuerySet>}
		 */
		this.freeQuerySets = [];

		/**
		 * The readback in flight, `null` if there is none.
		 *
		 * @type {?Promise}
		 * @default null
		 */
		this.pendingResolve = null;

		const bufferSize = this.maxQueries * 8;

		_bufferDescriptor.label = 'buffer_gpu_timer_resolve';
		_bufferDescriptor.size = bufferSize;
		_bufferDescriptor.usage = GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC;

		this.resolveBuffer = this.device.createBuffer( _bufferDescriptor );

		_bufferDescriptor.reset();

		_bufferDescriptor.label = 'buffer_gpu_timer_result';
		_bufferDescriptor.size = bufferSize;
		_bufferDescriptor.usage = GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ;

		this.resultBuffer = this.device.createBuffer( _bufferDescriptor );

		_bufferDescriptor.reset();

	}

	/**
	 * Allocates a pair of queries for the active timers.
	 *
	 * @returns {?number} The index of the first query in {@link WebGPUTimestampQueryPool#querySet}, or `null` without active timers.
	 */
	allocateQueries() {

		if ( this.isDisposed || this.timers.size === 0 ) return null;

		if ( this.currentQueryIndex + 2 > this.maxQueries ) {

			// the query set is full, it waits for its readback and the passes continue in another one

			this.fullQuerySets.push( this._takeQueries() );

			this.querySet = this.freeQuerySets.length > 0 ? this.freeQuerySets.pop() : this._createQuerySet();

		}

		const baseOffset = this.currentQueryIndex;
		this.currentQueryIndex += 2;

		this.queryTimers.set( baseOffset, this._retainTimers() );

		return baseOffset;

	}

	/**
	 * Returns the GPU time of the given timer, from the earliest begin to the latest end of its passes.
	 *
	 * @param {Object} timer - The timer, ended and resolved.
	 * @returns {?number} The GPU time in milliseconds, or `null` if queries couldn't be read back.
	 */
	getDuration( timer ) {

		if ( timer.lost ) return null;

		return timer.begin === null ? 0 : Number( timer.finish - timer.begin ) / 1e6;

	}

	/**
	 * Reads back the oldest full query set, or the current one. Only one readback is in flight,
	 * queries allocated meanwhile are read back with the next ones.
	 */
	resolveQueries() {

		if ( this.pendingResolve !== null || this.isDisposed ) return;

		let queries = this.fullQuerySets.shift();

		if ( queries === undefined ) {

			if ( this.currentQueryIndex === 0 ) return;

			// the current query set is read in place, the following passes write after the readback is submitted

			queries = this._takeQueries();

		}

		this.pendingResolve = this._resolveQueries( queries ).finally( () => this.pendingResolve = null );

	}

	/**
	 * Reads back the given queries and adds their timestamps to their timers.
	 *
	 * @async
	 * @private
	 * @param {{querySet: GPUQuerySet, queryTimers: Map<number, Array<Object>>, queryCount: number}} queries - The queries to read back.
	 * @returns {Promise} A Promise that resolves when the readback has finished.
	 */
	async _resolveQueries( { querySet, queryTimers, queryCount } ) {

		const bytesUsed = queryCount * 8;

		let lost = true;

		try {

			const commandEncoder = this.device.createCommandEncoder( _commandEncoderDescriptor );
			commandEncoder.resolveQuerySet( querySet, 0, queryCount, this.resolveBuffer, 0 );
			commandEncoder.copyBufferToBuffer( this.resolveBuffer, 0, this.resultBuffer, 0, bytesUsed );

			submit( this.device, commandEncoder.finish() );

			// the queries are copied, so a full query set can be reused

			if ( querySet !== this.querySet ) this.freeQuerySets.push( querySet );

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
	 * Takes the allocated queries of the current query set, its following queries start at the first index.
	 *
	 * @private
	 * @returns {{querySet: GPUQuerySet, queryTimers: Map<number, Array<Object>>, queryCount: number}} The queries.
	 */
	_takeQueries() {

		const queries = { querySet: this.querySet, queryTimers: this.queryTimers, queryCount: this.currentQueryIndex };

		this.queryTimers = new Map();
		this.currentQueryIndex = 0;

		return queries;

	}

	/**
	 * Creates a timestamp query set.
	 *
	 * @private
	 * @returns {GPUQuerySet} The query set.
	 */
	_createQuerySet() {

		_querySetDescriptor.label = 'queryset_gpu_timer';
		_querySetDescriptor.type = 'timestamp';
		_querySetDescriptor.count = this.maxQueries;

		const querySet = this.device.createQuerySet( _querySetDescriptor );

		_querySetDescriptor.reset();

		return querySet;

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

		const querySets = [ this.querySet, ...this.freeQuerySets ];

		for ( const { querySet, queryTimers } of [ ...this.fullQuerySets, this._takeQueries() ] ) {

			for ( const timers of queryTimers.values() ) this._releaseTimers( timers, true );

			if ( querySets.includes( querySet ) === false ) querySets.push( querySet );

		}

		for ( const querySet of querySets ) querySet.destroy();

		if ( this.resultBuffer.mapState === 'mapped' ) this.resultBuffer.unmap();

		this.resolveBuffer.destroy();
		this.resultBuffer.destroy();

		this.querySet = null;
		this.fullQuerySets = [];
		this.freeQuerySets = [];
		this.resolveBuffer = null;
		this.resultBuffer = null;

	}

}

export default WebGPUTimestampQueryPool;
