/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferAttribute = function () {};

THREE.BufferAttribute.prototype = {

	constructor: THREE.BufferAttribute,

	get length () {

		return this.array.length;

	},

	set: function ( value ) {

		this.array.set( value );

	},

	setX: function ( index, x ) {

		this.array[ index * this.itemSize ] = x;

	},

	setY: function ( index, y ) {

		this.array[ index * this.itemSize + 1 ] = y;

	},

	setZ: function ( index, z ) {

		this.array[ index * this.itemSize + 2 ] = z;

	},

	setXY: function ( index, x, y ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;

	},

	setXYZ: function ( index, x, y, z ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

	},

	setXYZW: function ( index, x, y, z, w ) {

		index *= this.itemSize;

		this.array[ index     ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

	}

};

//

THREE.Int8Attribute = function ( size, itemSize ) {

	this.array = new Int8Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Int8Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint8Attribute = function ( size, itemSize ) {

	this.array = new Uint8Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Uint8Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint8ClampedAttribute = function ( size, itemSize ) {

	this.array = new Uint8ClampedArray( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Uint8ClampedAttribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Int16Attribute = function ( size, itemSize ) {

	this.array = new Int16Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Int16Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint16Attribute = function ( size, itemSize ) {

	this.array = new Uint16Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Uint16Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Int32Attribute = function ( size, itemSize ) {

	this.array = new Int32Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Int32Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint32Attribute = function ( size, itemSize ) {

	this.array = new Uint32Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Uint32Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Float32Attribute = function ( size, itemSize ) {

	this.array = new Float32Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Float32Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Float64Attribute = function ( size, itemSize ) {

	this.array = new Float64Array( size * itemSize );
	this.itemSize = itemSize;

};

THREE.Float64Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );