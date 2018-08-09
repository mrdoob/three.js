import { BufferGeometry } from './BufferGeometry.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

class InstancedBufferGeometry extends BufferGeometry {

	constructor() {

		super();

		this.type = 'InstancedBufferGeometry';
		this.maxInstancedCount = undefined;

	}

	copy( source ) {

		BufferGeometry.prototype.copy.call( this, source );

		this.maxInstancedCount = source.maxInstancedCount;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

InstancedBufferGeometry.prototype.isInstancedBufferGeometry = true;

export { InstancedBufferGeometry };
