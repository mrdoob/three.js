
/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

class InterleavedBuffer {

	constructor( array, stride ) {

		this.array = array;
		this.stride = stride;
		this.count = array !== undefined ? array.length / stride : 0;

		this.dynamic = false;
		this.updateRange = { offset: 0, count: - 1 };

		this.version = 0;

	}

	onUploadCallback() {}

	setArray( array ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError( 'THREE.BufferAttribute: array should be a Typed Array.' );

		}

		this.count = array !== undefined ? array.length / this.stride : 0;
		this.array = array;

		return this;

	}

	setDynamic( value ) {

		this.dynamic = value;

		return this;

	}

	copy( source ) {

		this.array = new source.array.constructor( source.array );
		this.count = source.count;
		this.stride = source.stride;
		this.dynamic = source.dynamic;

		return this;

	}

	copyAt( index1, attribute, index2 ) {

		index1 *= this.stride;
		index2 *= attribute.stride;

		for ( var i = 0, l = this.stride; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	set( value, offset ) {

		if ( offset === undefined ) offset = 0;

		this.array.set( value, offset );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

}

InterleavedBuffer.prototype.isInterleavedBuffer = true;

Object.defineProperty( InterleavedBuffer.prototype, 'needsUpdate', {

	set: function ( value ) {

		if ( value === true ) this.version ++;

	}

} );


export { InterleavedBuffer };
