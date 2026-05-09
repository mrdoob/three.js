import { BufferAttribute } from './BufferAttribute.js';

/**
 * An instanced version of a buffer attribute.
 *
 * @augments BufferAttribute
 */
class InstancedBufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new instanced buffer attribute.
	 *
	 * @param {TypedArray} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 * @param {number} [meshPerAttribute=1] - How often a value of this buffer attribute should be repeated.
	 */
	constructor( array, itemSize, normalized, meshPerAttribute = 1 ) {

		super( array, itemSize, normalized );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedBufferAttribute = true;

		/**
		 * Defines how often a value of this buffer attribute should be repeated. A
		 * value of one means that each value of the instanced attribute is used for
		 * a single instance. A value of two means that each value is used for two
		 * consecutive instances (and so on).
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

	toJSON() {

		const data = super.toJSON();

		data.meshPerAttribute = this.meshPerAttribute;

		data.isInstancedBufferAttribute = true;

		return data;

	}

}

export { InstancedBufferAttribute };
