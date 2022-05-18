import { Vector3 } from '../math/Vector3.js';
import { BufferAttribute } from './BufferAttribute.js';
import { createNormalizeTransform, createDenormalizeTransform } from '../math/MathUtils.js';

const _vector = /*@__PURE__*/ new Vector3();

class InterleavedBufferAttribute {

	constructor( interleavedBuffer, itemSize, offset, normalized = false ) {

		this.name = '';

		this.data = interleavedBuffer;
		this.itemSize = itemSize;
		this.offset = offset;

		const array = this.data.array;

		this._normalized = normalized === true;
		this._normalize = normalized ? createNormalizeTransform( array ) : ( value ) => value;
		this._denormalize = normalized ? createDenormalizeTransform( array ) : ( value ) => value;

	}

	get normalized() {

		return this._normalized;

	}

	set normalized( normalized ) {

		const array = this.data.array;

		this._normalized = normalized;
		this._normalize = normalized ? createNormalizeTransform( array ) : ( value ) => value;
		this._denormalize = normalized ? createDenormalizeTransform( array ) : ( value ) => value;

	}

	get count() {

		return this.data.count;

	}

	get array() {

		return this.data.array;

	}

	set needsUpdate( value ) {

		this.data.needsUpdate = value;

	}

	applyMatrix4( m ) {

		for ( let i = 0, l = this.data.count; i < l; i ++ ) {

			_vector.x = this.getX( i );
			_vector.y = this.getY( i );
			_vector.z = this.getZ( i );

			_vector.applyMatrix4( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	}

	applyNormalMatrix( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector.x = this.getX( i );
			_vector.y = this.getY( i );
			_vector.z = this.getZ( i );

			_vector.applyNormalMatrix( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	}

	transformDirection( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector.x = this.getX( i );
			_vector.y = this.getY( i );
			_vector.z = this.getZ( i );

			_vector.transformDirection( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	}

	setX( index, x ) {

		this.data.array[ index * this.data.stride + this.offset ] = this._normalize( x );

		return this;

	}

	setY( index, y ) {

		this.data.array[ index * this.data.stride + this.offset + 1 ] = this._normalize( y );

		return this;

	}

	setZ( index, z ) {

		this.data.array[ index * this.data.stride + this.offset + 2 ] = this._normalize( z );

		return this;

	}

	setW( index, w ) {

		this.data.array[ index * this.data.stride + this.offset + 3 ] = this._normalize( w );

		return this;

	}

	getX( index ) {

		return this._denormalize( this.data.array[ index * this.data.stride + this.offset ] );

	}

	getY( index ) {

		return this._denormalize( this.data.array[ index * this.data.stride + this.offset + 1 ] );

	}

	getZ( index ) {

		return this._denormalize( this.data.array[ index * this.data.stride + this.offset + 2 ] );

	}

	getW( index ) {

		return this._denormalize( this.data.array[ index * this.data.stride + this.offset + 3 ] );

	}

	setXY( index, x, y ) {

		index = index * this.data.stride + this.offset;

		this.data.array[ index + 0 ] = this._normalize( x );
		this.data.array[ index + 1 ] = this._normalize( y );

		return this;

	}

	setXYZ( index, x, y, z ) {

		index = index * this.data.stride + this.offset;

		this.data.array[ index + 0 ] = this._normalize( x );
		this.data.array[ index + 1 ] = this._normalize( y );
		this.data.array[ index + 2 ] = this._normalize( z );

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index = index * this.data.stride + this.offset;

		this.data.array[ index + 0 ] = this._normalize( x );
		this.data.array[ index + 1 ] = this._normalize( y );
		this.data.array[ index + 2 ] = this._normalize( z );
		this.data.array[ index + 3 ] = this._normalize( w );

		return this;

	}

	clone( data ) {

		if ( data === undefined ) {

			console.log( 'THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.data.stride + this.offset;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.data.array[ index + j ] );

				}

			}

			return new BufferAttribute( new this.array.constructor( array ), this.itemSize, this.normalized );

		} else {

			if ( data.interleavedBuffers === undefined ) {

				data.interleavedBuffers = {};

			}

			if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {

				data.interleavedBuffers[ this.data.uuid ] = this.data.clone( data );

			}

			return new InterleavedBufferAttribute( data.interleavedBuffers[ this.data.uuid ], this.itemSize, this.offset, this.normalized );

		}

	}

	toJSON( data ) {

		if ( data === undefined ) {

			console.log( 'THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.data.stride + this.offset;

				for ( let j = 0; j < this.itemSize; j ++ ) {

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

		} else {

			// save as true interlaved attribtue

			if ( data.interleavedBuffers === undefined ) {

				data.interleavedBuffers = {};

			}

			if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {

				data.interleavedBuffers[ this.data.uuid ] = this.data.toJSON( data );

			}

			return {
				isInterleavedBufferAttribute: true,
				itemSize: this.itemSize,
				data: this.data.uuid,
				offset: this.offset,
				normalized: this.normalized
			};

		}

	}

}

InterleavedBufferAttribute.prototype.isInterleavedBufferAttribute = true;


export { InterleavedBufferAttribute };
