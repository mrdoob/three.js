import { Vector3 } from '../math/Vector3.js';
import { BufferAttribute } from './BufferAttribute.js';

const _vector = new /*@__PURE__*/ Vector3();

class InterleavedBufferAttribute {

	constructor( buffer, itemSize, type, normalized, stride, offset, count ) {

		this.name = '';

		this.data = buffer;
		this.array = new type( buffer.array.buffer, offset );
		this.itemSize = itemSize;
		this.type = type;
		this.normalized = normalized === true;
		this.stride = stride;
		this.offset = offset;
		this.count = count;

	}

	set needsUpdate( value ) {

		this.data.needsUpdate = value;

	}

	applyMatrix4( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

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

		// Note: Assuming stride is multiple of type.BYTES_PER_ELEMENT

		this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT ] = x;

		return this;

	}

	setY( index, y ) {

		this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT + 1 ] = y;

		return this;

	}

	setZ( index, z ) {

		this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT + 2 ] = z;

		return this;

	}

	setW( index, w ) {

		this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT + 3 ] = w;

		return this;

	}

	getX( index ) {

		return this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT ];

	}

	getY( index ) {

		return this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT + 1 ];

	}

	getZ( index ) {

		return this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT + 2 ];

	}

	getW( index ) {

		return this.array[ index * this.stride / this.type.BYTES_PER_ELEMENT + 3 ];

	}

	setXY( index, x, y ) {

		index = index * this.stride / this.type.BYTES_PER_ELEMENT;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	setXYZ( index, x, y, z ) {

		index = index * this.stride / this.type.BYTES_PER_ELEMENT;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index = index * this.stride / this.type.BYTES_PER_ELEMENT;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	copy( source ) {

		this.name = source.name;
		this.data = source.data;
		this.array = new source.type( source.data.array.buffer );
		this.itemSize = source.itemSize;
		this.type = source.type;
		this.normalized = source.normalized;
		this.stride = source.stride;
		this.offset = source.offset;
		this.count = source.count;

		return this;

	}

	clone( data ) {

		if ( data === undefined ) {

			console.log( 'THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.stride / this.type.BYTES_PER_ELEMENT;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.array[ index + j ] );

				}

			}

			return new BufferAttribute( new this.type( array ), this.itemSize, this.normalized );

		} else {

			if ( data.buffers === undefined ) {

				data.buffers = {};

			}

			if ( data.buffers[ this.data.uuid ] === undefined ) {

				data.buffers[ this.data.uuid ] = this.data.clone( data );

			}

			return new InterleavedBufferAttribute(
				data.buffers[ this.data.uuid ],
				this.itemSize,
				this.type,
				this.normalized,
				this.stride,
				this.offset,
				this.count
			);

		}

	}

	toJSON( data ) {

		if ( data === undefined ) {

			console.log( 'THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.stride / this.type.BYTES_PER_ELEMENT;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.array[ index + j ] );

				}

			}

			// deinterleave data and save it as an ordinary buffer attribute for now

			return {
				itemSize: this.itemSize,
				type: this.type.name,
				array: array,
				normalized: this.normalized
			};

		} else {

			// save as true interlaved attribtue

			if ( data.buffers === undefined ) {

				data.buffers = {};

			}

			if ( data.buffers[ this.data.uuid ] === undefined ) {

				data.buffers[ this.data.uuid ] = this.data.toJSON( data );

			}

			return {
				isInterleavedBufferAttribute: true,
				itemSize: this.itemSize,
				data: this.data.uuid,
				offset: this.offset,
				normalized: this.normalized,
				type: this.type.name,
				stride: this.stride,
				count: this.count
			};

		}

	}

}

InterleavedBufferAttribute.prototype.isInterleavedBufferAttribute = true;

export { InterleavedBufferAttribute };
