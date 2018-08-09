import { BufferAttribute } from './BufferAttribute.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

class InstancedBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, meshPerAttribute ) {

		super( array, itemSize );

		this.meshPerAttribute = meshPerAttribute || 1;

	}

	copy( source ) {

		BufferAttribute.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

}

InstancedBufferAttribute.prototype.isInstancedBufferAttribute = true;



export { InstancedBufferAttribute };
