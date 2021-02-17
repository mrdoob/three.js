import { BufferAttribute } from './BufferAttribute.js';

class InstancedBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized, meshPerAttribute = 1 ) {

		super( array, itemSize, normalized );

		Object.defineProperty( this, 'isInstancedBufferAttribute', { value: true } );

		if ( typeof ( normalized ) === 'number' ) {

			meshPerAttribute = normalized;

			normalized = false;

			console.error( 'THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.' );

		}

		this.meshPerAttribute = meshPerAttribute;

	}

	copy( source ) {

		BufferAttribute.prototype.copy.call( this, source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	toJSON()	{

		const data = BufferAttribute.prototype.toJSON.call( this );

		data.meshPerAttribute = this.meshPerAttribute;

		data.isInstancedBufferAttribute = true;

		return data;

	}

}

export { InstancedBufferAttribute };
