/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.BufferAttribute = function ( array, itemSize, dynamic ) {

	this.array = array;
	this.itemSize = itemSize;

	this.dynamic = dynamic || false;
	this.updateRange = { offset: 0, count: -1 };

	this.needsUpdate = false;

};

THREE.BufferAttribute.prototype = {

	constructor: THREE.BufferAttribute,

	get length () {

		return this.array.length;

	},

	copyAt: function ( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( var i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		this.markForUpdate( index1, this.itemSize );

	},

	set: function ( value ) {

		this.array.set( value );

		this.markForUpdate( 0, value.length );

		return this;

	},

	setX: function ( index, x ) {

		index *= this.itemSize;

		this.array[ index ] = x;

		this.markForUpdate( index, 1 );

		return this;

	},

	setY: function ( index, y ) {

		index = index * this.itemSize + 1;

		this.array[ index * this.itemSize + 1 ] = y;

		this.markForUpdate( index, 1 );

		return this;

	},

	setZ: function ( index, z ) {

		index = index * this.itemSize + 2;

		this.array[ index * this.itemSize + 2 ] = z;

		this.markForUpdate( index, 1 );

		return this;

	},

	setXY: function ( index, x, y ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;

		this.markForUpdate( index, 2 );

		return this;

	},

	setXYZ: function ( index, x, y, z ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		this.markForUpdate( index, 3 );

		return this;

	},

	setXYZW: function ( index, x, y, z, w ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		this.markForUpdate( index, 4 );

		return this;

	},

	setRange: function ( index, array ) {

		index *= this.itemSize;

		this.array.set( array, index );

		this.markForUpdate( index, array.length );

		return this;

	},

	markForUpdate: function ( offset, count ) {

		if ( this.updateRange.count <= 0 ) {

			this.updateRange.offset = offset;
			this.updateRange.count = count;

		} else {

			var end0 = offset + count;
			var end1 = this.updateRange.offset + this.updateRange.count;

			this.updateRange.offset = ( offset <= this.updateRange.offset ) ? offset : this.updateRange.offset;
			this.updateRange.count = ( ( end0 >= end1 ) ? end0 : end1 ) - this.updateRange.offset;
		}

		return this;
	},

	clone: function () {

		return new THREE.BufferAttribute( new this.array.constructor( this.array ), this.itemSize );

	}

};

//

THREE.Int8Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Int8Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Uint8Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Uint8Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Uint8ClampedAttribute = function ( data, itemSize ) {

	console.warn( 'THREE.Uint8ClampedAttribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );


};

THREE.Int16Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Int16Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Uint16Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Uint16Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Int32Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Int32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Uint32Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Uint32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Float32Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Float32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};

THREE.Float64Attribute = function ( data, itemSize ) {

	console.warn( 'THREE.Float64Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead.' );
	return new THREE.BufferAttribute( data, itemSize );

};
