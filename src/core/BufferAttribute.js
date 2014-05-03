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

	}

};

//

THREE.Int8Attribute = function ( data, itemSize ) {

	this.array = new Int8Array( data );
	this.itemSize = itemSize;

};

THREE.Int8Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint8Attribute = function ( data, itemSize ) {

	this.array = new Uint8Array( data );
	this.itemSize = itemSize;

};

THREE.Uint8Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint8ClampedAttribute = function ( data, itemSize ) {

	this.array = new Uint8ClampedArray( data );
	this.itemSize = itemSize;

};

THREE.Uint8ClampedAttribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Int16Attribute = function ( data, itemSize ) {

	this.array = new Int16Array( data );
	this.itemSize = itemSize;

};

THREE.Int16Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint16Attribute = function ( data, itemSize ) {

	this.array = new Uint16Array( data );
	this.itemSize = itemSize;

};

THREE.Uint16Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Int32Attribute = function ( data, itemSize ) {

	this.array = new Int32Array( data );
	this.itemSize = itemSize;

};

THREE.Int32Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Uint32Attribute = function ( data, itemSize ) {

	this.array = new Uint32Array( data );
	this.itemSize = itemSize;

};

THREE.Uint32Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Float32Attribute = function ( data, itemSize ) {

	this.array = new Float32Array( data );
	this.itemSize = itemSize;

};

THREE.Float32Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );

THREE.Float64Attribute = function ( data, itemSize ) {

	this.array = new Float64Array( data );
	this.itemSize = itemSize;

};

THREE.Float64Attribute.prototype = Object.create( THREE.BufferAttribute.prototype );