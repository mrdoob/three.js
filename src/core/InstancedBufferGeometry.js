import { BufferGeometry } from './BufferGeometry.js';

/**
 * An instanced version of a geometry.
 */
class InstancedBufferGeometry extends BufferGeometry {

	/**
	 * Constructs a new instanced buffer geometry.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedBufferGeometry = true;

		this.type = 'InstancedBufferGeometry';

		/**
		 * The instance count.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.instanceCount = Infinity;

	}

	copy( source ) {

		super.copy( source );

		this.instanceCount = source.instanceCount;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.instanceCount = this.instanceCount;

		data.isInstancedBufferGeometry = true;

		return data;

	}

}

export { InstancedBufferGeometry };
