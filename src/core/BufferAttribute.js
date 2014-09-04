/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferAttribute = function ( array, itemSize ) {

	this.array = array;
	this.itemSize = itemSize;

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

	},

	set: function ( value ) {

		this.array.set( value );

		return this;

	},

	setX: function ( index, x ) {

		this.array[ index * this.itemSize ] = x;

		return this;

	},

	setY: function ( index, y ) {

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	},

	setZ: function ( index, z ) {

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	},

	setXY: function ( index, x, y ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;

		return this;

	},

	setXYZ: function ( index, x, y, z ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	},

	setXYZW: function ( index, x, y, z, w ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	},

	clone: function () {

		var attribute = new THREE.BufferAttribute( null, this.itemSize );

		var types = [ Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array ];

		var sourceArray = this.array;

		for ( var i = 0, il = types.length; i < il; i ++ ) {

			var type = types[ i ];

			if ( sourceArray instanceof type ) {

				attribute.array = new type( sourceArray );
				break;

			}

		}

		return attribute;

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
