/**
 * Reusable descriptor for `GPURenderPassTimestampWrites`, the
 * `timestampWrites` field of `GPURenderPassDescriptor`. The same shape is
 * also accepted as `GPUComputePassTimestampWrites`.
 *
 * @private
 */
class GPURenderPassTimestampWrites {

	constructor() {

		/**
		 * The query set the timestamps are written to.
		 *
		 * @type {?GPUQuerySet}
		 * @default null
		 */
		this.querySet = null;

		/**
		 * The index in the query set the beginning timestamp is written to.
		 *
		 * @type {number|undefined}
		 */
		this.beginningOfPassWriteIndex = undefined;

		/**
		 * The index in the query set the ending timestamp is written to.
		 *
		 * @type {number|undefined}
		 */
		this.endOfPassWriteIndex = undefined;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.querySet = null;
		this.beginningOfPassWriteIndex = undefined;
		this.endOfPassWriteIndex = undefined;

	}

}

export default GPURenderPassTimestampWrites;
