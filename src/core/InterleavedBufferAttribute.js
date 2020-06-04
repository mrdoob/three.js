import { Vector3 } from '../math/Vector3.js';
import { BufferAttribute } from './BufferAttribute.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

var _vector = new Vector3();

function InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, normalized ) {

	this.name = '';

	this.data = interleavedBuffer;
	this.itemSize = itemSize;
	this.offset = offset;

	this.normalized = normalized === true;

}

Object.defineProperties( InterleavedBufferAttribute.prototype, {

	count: {

		get: function () {

			return this.data.count;

		}

	},

	array: {

		get: function () {

			return this.data.array;

		}

	}

} );

Object.assign( InterleavedBufferAttribute.prototype, {

	isInterleavedBufferAttribute: true,

	applyMatrix4: function ( m ) {

		for ( var i = 0, l = this.data.count; i < l; i ++ ) {

			_vector.x = this.getX( i );
			_vector.y = this.getY( i );
			_vector.z = this.getZ( i );

			_vector.applyMatrix4( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	},

	setX: function ( index, x ) {

		this.data.array[ index * this.data.stride + this.offset ] = x;

		return this;

	},

	setY: function ( index, y ) {

		this.data.array[ index * this.data.stride + this.offset + 1 ] = y;

		return this;

	},

	setZ: function ( index, z ) {

		this.data.array[ index * this.data.stride + this.offset + 2 ] = z;

		return this;

	},

	setW: function ( index, w ) {

		this.data.array[ index * this.data.stride + this.offset + 3 ] = w;

		return this;

	},

	getX: function ( index ) {

		return this.data.array[ index * this.data.stride + this.offset ];

	},

	getY: function ( index ) {

		return this.data.array[ index * this.data.stride + this.offset + 1 ];

	},

	getZ: function ( index ) {

		return this.data.array[ index * this.data.stride + this.offset + 2 ];

	},

	getW: function ( index ) {

		return this.data.array[ index * this.data.stride + this.offset + 3 ];

	},

	setXY: function ( index, x, y ) {

		index = index * this.data.stride + this.offset;

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;

		return this;

	},

	setXYZ: function ( index, x, y, z ) {

		index = index * this.data.stride + this.offset;

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;
		this.data.array[ index + 2 ] = z;

		return this;

	},

	setXYZW: function ( index, x, y, z, w ) {

		index = index * this.data.stride + this.offset;

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;
		this.data.array[ index + 2 ] = z;
		this.data.array[ index + 3 ] = w;

		return this;

	},

	clone: function () {

		console.log( 'THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.' );

		var array = [];

		for ( var i = 0; i < this.count; i ++ ) {

			var index = i * this.data.stride + this.offset;

			for ( var j = 0; j < this.itemSize; j ++ ) {

				array.push( this.data.array[ index + j ] );

			}

		}

		return new BufferAttribute( new this.array.constructor( array ), this.itemSize, this.normalized );

	},

	toJSON: function () {

		console.log( 'THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data.' );

		var array = [];

		for ( var i = 0; i < this.count; i ++ ) {

			var index = i * this.data.stride + this.offset;

			for ( var j = 0; j < this.itemSize; j ++ ) {

				array.push( this.data.array[ index + j ] );

			}

		}

		// deinterleave data and save it as an ordinary buffer attribute for now

		return {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: array,
			normalized: this.normalized
		};

	}

} );


export { InterleavedBufferAttribute };
