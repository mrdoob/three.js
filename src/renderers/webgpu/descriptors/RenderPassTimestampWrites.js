/**
 * Reusable wrapper around `GPURenderPassTimestampWrites`. Mutated in place to
 * avoid per-frame GC pressure when attaching timestamp queries to a render pass.
 *
 * @private
 */
class RenderPassTimestampWrites {

	/**
	 * Constructs a new timestamp-writes descriptor.
	 */
	constructor() {

		/**
		 * The query set to write timestamps into.
		 *
		 * @type {?GPUQuerySet}
		 * @default null
		 */
		this.querySet = null;

		/**
		 * The query index for the beginning-of-pass timestamp.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.beginningOfPassWriteIndex = 0;

		/**
		 * The query index for the end-of-pass timestamp.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.endOfPassWriteIndex = 0;

	}

}

export default RenderPassTimestampWrites;
