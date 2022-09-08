import { BufferGeometry } from './BufferGeometry.js';

class InstancedBufferGeometry extends BufferGeometry {

	constructor() {

		super();

		this.isInstancedBufferGeometry = true;

		this.type = 'InstancedBufferGeometry';
		this.instanceCount = Infinity;

	}

	copy( source ) {

		super.copy( source );

		this.instanceCount = source.instanceCount;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	toJSON() {

		const data = super.toJSON( this );

		data.instanceCount = this.instanceCount;

		data.isInstancedBufferGeometry = true;

		return data;

	}

}

export { InstancedBufferGeometry };
