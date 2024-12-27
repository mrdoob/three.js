import Buffer from './Buffer.js';

/**
 * Represents a uniform buffer binding type.
 *
 * @private
 * @augments Buffer
 */
class UniformBuffer extends Buffer {

	/**
	 * Constructs a new uniform buffer.
	 *
	 * @param {String} name - The buffer's name.
	 * @param {TypedArray} [buffer=null] - The buffer.
	 */
	constructor( name, buffer = null ) {

		super( name, buffer );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isUniformBuffer = true;

	}

}

export default UniformBuffer;
