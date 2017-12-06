import { BufferAttribute } from './BufferAttribute.js';
import { _Math } from '../math/Math.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, normalized ) {

	this.uuid = _Math.generateUUID();

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

		var count = this.count;
		var itemSize = this.itemSize;
		var array = this.data.array.slice( 0, count * itemSize );

		for ( var i = 0; i < count; ++ i ) {

			array[ i ] = this.getX( i );
			if ( itemSize >= 2 ) array[ i + 1 ] = this.getY( i );
			if ( itemSize >= 3 ) array[ i + 2 ] = this.getZ( i );
			if ( itemSize >= 4 ) array[ i + 3 ] = this.getW( i );

		}

		return new BufferAttribute( array, itemSize, this.normalized );

	}

} );


export { InterleavedBufferAttribute };
