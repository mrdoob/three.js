/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = BufferAttribute;

var Color = require( "../math/Color" ),
	_Math = require( "../math/Math" ),
	Vector2 = require( "../math/Vector2" ),
	Vector3 = require( "../math/Vector3" ),
	Vector4 = require( "../math/Vector4" );

function BufferAttribute( array, itemSize ) {

	this.uuid = _Math.generateUUID();

	this.array = array;
	this.itemSize = itemSize;

	this.dynamic = false;
	this.updateRange = { offset: 0, count: - 1 };

	this.version = 0;

}

BufferAttribute.prototype = {

	constructor: BufferAttribute,

	get length() {

		console.warn( "BufferAttribute: .length has been deprecated. Please use .count." );
		return this.array.length;

	},

	get count() {

		return this.array.length / this.itemSize;

	},

	get needsUpdate() {

		return undefined;

	},

	set needsUpdate( value ) {

		if ( value === true ) { this.version ++; }

	},

	setDynamic: function ( value ) {

		this.dynamic = value;

		return this;

	},

	copy: function ( source ) {

		this.array = new source.array.constructor( source.array );
		this.itemSize = source.itemSize;

		this.dynamic = source.dynamic;

		return this;

	},

	copyAt: function ( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( var i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	},

	copyArray: function ( array ) {

		this.array.set( array );

		return this;

	},

	copyColorsArray: function ( colors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = colors.length; i < l; i ++ ) {

			var color = colors[ i ];

			if ( color === undefined ) {

				console.warn( "BufferAttribute.copyColorsArray(): color is undefined", i );
				color = new Color();

			}

			array[ offset ++ ] = color.r;
			array[ offset ++ ] = color.g;
			array[ offset ++ ] = color.b;

		}

		return this;

	},

	copyIndicesArray: function ( indices ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = indices.length; i < l; i ++ ) {

			var index = indices[ i ];

			array[ offset ++ ] = index.a;
			array[ offset ++ ] = index.b;
			array[ offset ++ ] = index.c;

		}

		return this;

	},

	copyVector2sArray: function ( vectors ) {

		var array = this.array, offset = 0, vector;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( "BufferAttribute.copyVector2sArray(): vector is undefined", i );
				vector = new Vector2();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;

		}

		return this;

	},

	copyVector3sArray: function ( vectors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( "BufferAttribute.copyVector3sArray(): vector is undefined", i );
				vector = new Vector3();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;

		}

		return this;

	},

	copyVector4sArray: function ( vectors ) {

		var array = this.array, offset = 0, vector;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( "BufferAttribute.copyVector4sArray(): vector is undefined", i );
				vector = new Vector4();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;
			array[ offset ++ ] = vector.w;

		}

		return this;

	},

	set: function ( value, offset ) {

		if ( offset === undefined ) { offset = 0; }

		this.array.set( value, offset );

		return this;

	},

	getX: function ( index ) {

		return this.array[ index * this.itemSize ];

	},

	setX: function ( index, x ) {

		this.array[ index * this.itemSize ] = x;

		return this;

	},

	getY: function ( index ) {

		return this.array[ index * this.itemSize + 1 ];

	},

	setY: function ( index, y ) {

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	},

	getZ: function ( index ) {

		return this.array[ index * this.itemSize + 2 ];

	},

	setZ: function ( index, z ) {

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	},

	getW: function ( index ) {

		return this.array[ index * this.itemSize + 3 ];

	},

	setW: function ( index, w ) {

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	},

	setXY: function ( index, x, y ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	},

	setXYZ: function ( index, x, y, z ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	},

	setXYZW: function ( index, x, y, z, w ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

};

//

BufferAttribute.Int8Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Int8Array( array ), itemSize );

};

BufferAttribute.Uint8Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Uint8Array( array ), itemSize );

};

BufferAttribute.Uint8ClampedAttribute = function ( array, itemSize ) {

	return new BufferAttribute( new Uint8ClampedArray( array ), itemSize );

};

BufferAttribute.Int16Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Int16Array( array ), itemSize );

};

BufferAttribute.Uint16Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Uint16Array( array ), itemSize );

};

BufferAttribute.Int32Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Int32Array( array ), itemSize );

};

BufferAttribute.Uint32Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Uint32Array( array ), itemSize );

};

BufferAttribute.Float32Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Float32Array( array ), itemSize );

};

BufferAttribute.Float64Attribute = function ( array, itemSize ) {

	return new BufferAttribute( new Float64Array( array ), itemSize );

};


// Deprecated

THREE.DynamicBufferAttribute = function ( array, itemSize ) {

	console.warn( 'THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead.' );
	return new THREE.BufferAttribute( array, itemSize ).setDynamic( true );

};
