/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

import { BufferAttribute } from './BufferAttribute.js';


class InstancedBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized, meshPerAttribute ) {

		if ( typeof ( normalized ) === 'number' ) {

			meshPerAttribute = normalized;

			normalized = false;

			console.error( 'THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.' );

		}

		super( array, itemSize, normalized );

		Object.defineProperty( this, 'isInstancedBufferAttribute', {
			value: true
		} );

		this.meshPerAttribute = meshPerAttribute || 1;

	}

	copy( source ) {

		super.copy( source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	toJSON()	{

		var data = super.toJSON();

		data.meshPerAttribute = this.meshPerAttribute;

		data.isInstancedBufferAttribute = true;

		return data;

	}

}


export { InstancedBufferAttribute };
