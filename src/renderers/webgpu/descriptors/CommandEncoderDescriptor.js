/**
 * Reusable wrapper around `GPUCommandEncoderDescriptor`. Mutated in place to
 * avoid per-frame GC pressure when creating command encoders.
 *
 * @private
 */
class CommandEncoderDescriptor {

	/**
	 * Constructs a new command encoder descriptor.
	 *
	 * @param {string} [label=''] - Optional debug label.
	 */
	constructor( label = '' ) {

		/**
		 * The debug label.
		 *
		 * @type {string}
		 */
		this.label = label;

	}

}

export default CommandEncoderDescriptor;
