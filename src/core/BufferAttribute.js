import { Vector4 } from '../math/Vector4';
import { Vector3 } from '../math/Vector3';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';
import { _Math } from '../math/Math';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function BufferAttribute ( array, itemSize, normalized ) {
	this.isBufferAttribute = true;

	this.uuid = _Math.generateUUID();

	this.array = array;
	this.itemSize = itemSize;

	this.dynamic = false;
	this.updateRange = { offset: 0, count: - 1 };

	this.version = 0;
	this.normalized = normalized === true;

};

BufferAttribute.prototype = {

	constructor: BufferAttribute,

	get count() {

		return this.array.length / this.itemSize;

	},

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

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

				console.warn( 'THREE.BufferAttribute.copyColorsArray(): color is undefined', i );
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

		var array = this.array, offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( 'THREE.BufferAttribute.copyVector2sArray(): vector is undefined', i );
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

				console.warn( 'THREE.BufferAttribute.copyVector3sArray(): vector is undefined', i );
				vector = new Vector3();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;

		}

		return this;

	},

	copyVector4sArray: function ( vectors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( 'THREE.BufferAttribute.copyVector4sArray(): vector is undefined', i );
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

		if ( offset === undefined ) offset = 0;

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

function Int8Attribute ( array, itemSize ) {
	this.isInt8Attribute = true;

	return new BufferAttribute( new Int8Array( array ), itemSize );

};

function Uint8Attribute ( array, itemSize ) {
	this.isUint8Attribute = true;

	return new BufferAttribute( new Uint8Array( array ), itemSize );

};

function Uint8ClampedAttribute ( array, itemSize ) {
	this.isUint8ClampedAttribute = true;

	return new BufferAttribute( new Uint8ClampedArray( array ), itemSize );

};

function Int16Attribute ( array, itemSize ) {
	this.isInt16Attribute = true;

	return new BufferAttribute( new Int16Array( array ), itemSize );

};

function Uint16Attribute ( array, itemSize ) {
	this.isUint16Attribute = true;

	return new BufferAttribute( new Uint16Array( array ), itemSize );

};

function Int32Attribute ( array, itemSize ) {
	this.isInt32Attribute = true;

	return new BufferAttribute( new Int32Array( array ), itemSize );

};

function Uint32Attribute ( array, itemSize ) {
	this.isUint32Attribute = true;

	return new BufferAttribute( new Uint32Array( array ), itemSize );

};

function Float32Attribute ( array, itemSize ) {
	this.isFloat32Attribute = true;

	return new BufferAttribute( new Float32Array( array ), itemSize );

};

function Float64Attribute ( array, itemSize ) {
	this.isFloat64Attribute = true;

	return new BufferAttribute( new Float64Array( array ), itemSize );

};


// Deprecated

function DynamicBufferAttribute ( array, itemSize ) {
	this.isDynamicBufferAttribute = true;

	console.warn( 'THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead.' );
	return new BufferAttribute( array, itemSize ).setDynamic( true );

};


export {
  DynamicBufferAttribute,
  Float64Attribute,
  Float32Attribute,
  Uint32Attribute,
  Int32Attribute,
  Uint16Attribute,
  Int16Attribute,
  Uint8ClampedAttribute,
  Uint8Attribute,
  Int8Attribute,
  BufferAttribute
};