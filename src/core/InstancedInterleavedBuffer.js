import { InterleavedBuffer } from './InterleavedBuffer.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

class InstancedInterleavedBuffer extends InterleavedBuffer {

	constructor( array, stride, meshPerAttribute ) {

		super( array, stride );

		this.meshPerAttribute = meshPerAttribute || 1;

	}

	copy( source ) {

		InterleavedBuffer.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

}

InstancedInterleavedBuffer.prototype.isInstancedInterleavedBuffer = true;

export { InstancedInterleavedBuffer };
