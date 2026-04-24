import { InterleavedBuffer } from './InterleavedBuffer.js';

/**
 * An instanced version of an interleaved buffer.
 *
 * @augments InterleavedBuffer
 */
class InstancedInterleavedBuffer extends InterleavedBuffer {

	/**
	 * Constructs a new instanced interleaved buffer.
	 *
	 * @param {TypedArray} array - A typed array with a shared buffer storing attribute data.
	 * @param {number} stride - The number of typed-array elements per vertex.
	 * @param {number} [meshPerAttribute=1] - Defines how often a value of this interleaved buffer should be repeated.
	 */
	constructor( array, stride, meshPerAttribute = 1 ) {

		super( array, stride );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedInterleavedBuffer = true;

		/**
		 * Defines how often a value of this buffer attribute should be repeated,
		 * see {@link InstancedBufferAttribute#meshPerAttribute}.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.meshPerAttribute = meshPerAttribute;

	}

	copy( source ) {

		super.copy( source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	clone( data ) {

		const ib = super.clone( data );

		ib.meshPerAttribute = this.meshPerAttribute;

		return ib;

	}

	toJSON( data ) {

		const json = super.toJSON( data );

		json.isInstancedInterleavedBuffer = true;
		json.meshPerAttribute = this.meshPerAttribute;

		return json;

	}

}

export { InstancedInterleavedBuffer };
