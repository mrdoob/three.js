import { BufferGeometry } from './BufferGeometry.js';

class InstancedBufferGeometry extends BufferGeometry {

	constructor() {

		super();
		this.isInstancedBufferGeometry = true,

		this.type = 'InstancedBufferGeometry';
		this.instanceCount = Infinity;

	}

	copy( source ) {

		BufferGeometry.prototype.copy.call( this, source );

		this.instanceCount = source.instanceCount;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	toJSON() {

		const data = BufferGeometry.prototype.toJSON.call( this );

		data.instanceCount = this.instanceCount;

		data.isInstancedBufferGeometry = true;

		return data;

	}

}

export { InstancedBufferGeometry };
