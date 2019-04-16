import { BufferAttribute } from './BufferAttribute.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InstancedBufferAttribute( array, itemSize, normalized, meshPerAttribute ) {

	if ( typeof ( normalized ) === 'number' ) {

		meshPerAttribute = normalized;

		normalized = false;

		console.error( 'THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.' );

	}

	BufferAttribute.call( this, array, itemSize, normalized );

	this._meshPerAttribute = meshPerAttribute || 1;

}

InstancedBufferAttribute.prototype = Object.assign( Object.create( BufferAttribute.prototype ), {

	constructor: InstancedBufferAttribute,

	isInstancedBufferAttribute: true,

	_copy: function ( source ) {

		BufferAttribute.prototype._copy.call( this, source );

		this._meshPerAttribute = source.meshPerAttribute;

		return this;

	}

} );

Object.defineProperties( InstancedBufferAttribute.prototype, {

	meshPerAttribute: {

		get: function () {

			return this._meshPerAttribute;

		},

		set: function ( value ) {

			console.warn( 'THREE.InstancedBufferAttribute: .meshPerAttribute is readonly.' );

		}

	}

} );

export { InstancedBufferAttribute };
