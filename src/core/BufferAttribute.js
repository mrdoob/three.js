import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { denormalize, normalize } from '../math/MathUtils.js';
import { StaticDrawUsage, FloatType } from '../constants.js';
import { fromHalfFloat, toHalfFloat } from '../extras/DataUtils.js';

const _vector = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector2();

let _id = 0;

/**
 * This class stores data for an attribute (such as vertex positions, face
 * indices, normals, colors, UVs, and any custom attributes ) associated with
 * a geometry, which allows for more efficient passing of data to the GPU.
 *
 * When working with vector-like data, the `fromBufferAttribute( attribute, index )`
 * helper methods on vector and color class might be helpful. E.g. {@link Vector3#fromBufferAttribute}.
 */
class BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {TypedArray} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized = false ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError( 'THREE.BufferAttribute: array should be a Typed Array.' );

		}

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBufferAttribute = true;

		/**
		 * The ID of the buffer attribute.
		 *
		 * @name BufferAttribute#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _id ++ } );

		/**
		 * The name of the buffer attribute.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The array holding the attribute data. It should have `itemSize * numVertices`
		 * elements, where `numVertices` is the number of vertices in the associated geometry.
		 *
		 * @type {TypedArray}
		 */
		this.array = array;

		/**
		 * The number of values of the array that should be associated with a particular vertex.
		 * For instance, if this attribute is storing a 3-component vector (such as a position,
		 * normal, or color), then the value should be `3`.
		 *
		 * @type {number}
		 */
		this.itemSize = itemSize;

		/**
		 * Represents the number of items this buffer attribute stores. It is internally computed
		 * by dividing the `array` length by the `itemSize`.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.count = array !== undefined ? array.length / itemSize : 0;

		/**
		 * Applies to integer data only. Indicates how the underlying data in the buffer maps to
		 * the values in the GLSL code. For instance, if `array` is an instance of `UInt16Array`,
		 * and `normalized` is `true`, the values `0 -+65535` in the array data will be mapped to
		 * `0.0f - +1.0f` in the GLSL attribute. If `normalized` is `false`, the values will be converted
		 * to floats unmodified, i.e. `65535` becomes `65535.0f`.
		 *
		 * @type {boolean}
		 */
		this.normalized = normalized;

		/**
		 * Defines the intended usage pattern of the data store for optimization purposes.
		 *
		 * Note: After the initial use of a buffer, its usage cannot be changed. Instead,
		 * instantiate a new one and set the desired usage before the next render.
		 *
		 * @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
		 * @default StaticDrawUsage
		 */
		this.usage = StaticDrawUsage;

		/**
		 * This can be used to only update some components of stored vectors (for example, just the
		 * component related to color). Use the `addUpdateRange()` function to add ranges to this array.
		 *
		 * @type {Array<Object>}
		 */
		this.updateRanges = [];

		/**
		 * Configures the bound GPU type for use in shaders.
		 *
		 * Note: this only has an effect for integer arrays and is not configurable for float arrays.
		 * For lower precision float types, use `Float16BufferAttribute`.
		 *
		 * @type {(FloatType|IntType)}
		 * @default FloatType
		 */
		this.gpuType = FloatType;

		/**
		 * A version number, incremented every time the `needsUpdate` is set to `true`.
		 *
		 * @type {number}
		 */
		this.version = 0;

	}

	/**
	 * A callback function that is executed after the renderer has transferred the attribute
	 * array data to the GPU.
	 */
	onUploadCallback() {}

	/**
	 * Flag to indicate that this attribute has changed and should be re-sent to
	 * the GPU. Set this to `true` when you modify the value of the array.
	 *
	 * @type {number}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	/**
	 * Sets the usage of this buffer attribute.
	 *
	 * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	 * @return {BufferAttribute} A reference to this buffer attribute.
	 */
	setUsage( value ) {

		this.usage = value;

		return this;

	}

	/**
	 * Adds a range of data in the data array to be updated on the GPU.
	 *
	 * @param {number} start - Position at which to start update.
	 * @param {number} count - The number of components to update.
	 */
	addUpdateRange( start, count ) {

		this.updateRanges.push( { start, count } );

	}

	/**
	 * Clears the update ranges.
	 */
	clearUpdateRanges() {

		this.updateRanges.length = 0;

	}

	/**
	 * Copies the values of the given buffer attribute to this instance.
	 *
	 * @param {BufferAttribute} source - The buffer attribute to copy.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	copy( source ) {

		this.name = source.name;
		this.array = new source.array.constructor( source.array );
		this.itemSize = source.itemSize;
		this.count = source.count;
		this.normalized = source.normalized;

		this.usage = source.usage;
		this.gpuType = source.gpuType;

		return this;

	}

	/**
	 * Copies a vector from the given buffer attribute to this one. The start
	 * and destination position in the attribute buffers are represented by the
	 * given indices.
	 *
	 * @param {number} index1 - The destination index into this buffer attribute.
	 * @param {BufferAttribute} attribute - The buffer attribute to copy from.
	 * @param {number} index2 - The source index into the given buffer attribute.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	copyAt( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( let i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	/**
	 * Copies the given array data into this buffer attribute.
	 *
	 * @param {(TypedArray|Array)} array - The array to copy.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	copyArray( array ) {

		this.array.set( array );

		return this;

	}

	/**
	 * Applies the given 3x3 matrix to the given attribute. Works with
	 * item size `2` and `3`.
	 *
	 * @param {Matrix3} m - The matrix to apply.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	applyMatrix3( m ) {

		if ( this.itemSize === 2 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector2.fromBufferAttribute( this, i );
				_vector2.applyMatrix3( m );

				this.setXY( i, _vector2.x, _vector2.y );

			}

		} else if ( this.itemSize === 3 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector.fromBufferAttribute( this, i );
				_vector.applyMatrix3( m );

				this.setXYZ( i, _vector.x, _vector.y, _vector.z );

			}

		}

		return this;

	}

	/**
	 * Applies the given 4x4 matrix to the given attribute. Only works with
	 * item size `3`.
	 *
	 * @param {Matrix4} m - The matrix to apply.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	applyMatrix4( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector.fromBufferAttribute( this, i );

			_vector.applyMatrix4( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	}

	/**
	 * Applies the given 3x3 normal matrix to the given attribute. Only works with
	 * item size `3`.
	 *
	 * @param {Matrix3} m - The normal matrix to apply.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	applyNormalMatrix( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector.fromBufferAttribute( this, i );

			_vector.applyNormalMatrix( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	}

	/**
	 * Applies the given 4x4 matrix to the given attribute. Only works with
	 * item size `3` and with direction vectors.
	 *
	 * @param {Matrix4} m - The matrix to apply.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	transformDirection( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector.fromBufferAttribute( this, i );

			_vector.transformDirection( m );

			this.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

		return this;

	}

	/**
	 * Sets the given array data in the buffer attribute.
	 *
	 * @param {(TypedArray|Array)} value - The array data to set.
	 * @param {number} [offset=0] - The offset in this buffer attribute's array.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	set( value, offset = 0 ) {

		// Matching BufferAttribute constructor, do not normalize the array.
		this.array.set( value, offset );

		return this;

	}

	/**
	 * Returns the given component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} component - The component index.
	 * @return {number} The returned value.
	 */
	getComponent( index, component ) {

		let value = this.array[ index * this.itemSize + component ];

		if ( this.normalized ) value = denormalize( value, this.array );

		return value;

	}

	/**
	 * Sets the given value to the given component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} component - The component index.
	 * @param {number} value - The value to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setComponent( index, component, value ) {

		if ( this.normalized ) value = normalize( value, this.array );

		this.array[ index * this.itemSize + component ] = value;

		return this;

	}

	/**
	 * Returns the x component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @return {number} The x component.
	 */
	getX( index ) {

		let x = this.array[ index * this.itemSize ];

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	/**
	 * Sets the x component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} x - The value to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = x;

		return this;

	}

	/**
	 * Returns the y component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @return {number} The y component.
	 */
	getY( index ) {

		let y = this.array[ index * this.itemSize + 1 ];

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	/**
	 * Sets the y component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} y - The value to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	}

	/**
	 * Returns the z component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @return {number} The z component.
	 */
	getZ( index ) {

		let z = this.array[ index * this.itemSize + 2 ];

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	/**
	 * Sets the z component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} z - The value to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	}

	/**
	 * Returns the w component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @return {number} The w component.
	 */
	getW( index ) {

		let w = this.array[ index * this.itemSize + 3 ];

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	/**
	 * Sets the w component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} w - The value to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	}

	/**
	 * Sets the x and y component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	/**
	 * Sets the x, y and z component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @param {number} z - The value for the z component to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	}

	/**
	 * Sets the x, y, z and w component of the vector at the given index.
	 *
	 * @param {number} index - The index into the buffer attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @param {number} z - The value for the z component to set.
	 * @param {number} w - The value for the w component to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	/**
	 * Sets the given callback function that is executed after the Renderer has transferred
	 * the attribute array data to the GPU. Can be used to perform clean-up operations after
	 * the upload when attribute data are not needed anymore on the CPU side.
	 *
	 * @param {Function} callback - The `onUpload()` callback.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	/**
	 * Returns a new buffer attribute with copied values from this instance.
	 *
	 * @return {BufferAttribute} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.array, this.itemSize ).copy( this );

	}

	/**
	 * Serializes the buffer attribute into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized buffer attribute.
	 */
	toJSON() {

		const data = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from( this.array ),
			normalized: this.normalized
		};

		if ( this.name !== '' ) data.name = this.name;
		if ( this.usage !== StaticDrawUsage ) data.usage = this.usage;

		return data;

	}

}

/**
 * Convenient class that can be used when creating a `Int8` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Int8BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Int8Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Int8Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt8` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Uint8BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Uint8Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint8Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt8Clamped` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Uint8ClampedBufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Uint8ClampedArray)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint8ClampedArray( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `Int16` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Int16BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Int16Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Int16Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt16` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Uint16BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `Int32` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Int32BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Int32Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Int32Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt32` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Uint32BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Uint32Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint32Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `Float16` buffer attribute with
 * a plain `Array` instance.
 *
 * This class automatically converts to and from FP16 since `Float16Array` is not
 * natively supported in JavaScript.
 *
 * @augments BufferAttribute
 */
class Float16BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

		this.isFloat16BufferAttribute = true;

	}

	getX( index ) {

		let x = fromHalfFloat( this.array[ index * this.itemSize ] );

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = toHalfFloat( x );

		return this;

	}

	getY( index ) {

		let y = fromHalfFloat( this.array[ index * this.itemSize + 1 ] );

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = toHalfFloat( y );

		return this;

	}

	getZ( index ) {

		let z = fromHalfFloat( this.array[ index * this.itemSize + 2 ] );

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = toHalfFloat( z );

		return this;

	}

	getW( index ) {

		let w = fromHalfFloat( this.array[ index * this.itemSize + 3 ] );

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = toHalfFloat( w );

		return this;

	}

	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );

		return this;

	}

	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );
		this.array[ index + 2 ] = toHalfFloat( z );

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );
		this.array[ index + 2 ] = toHalfFloat( z );
		this.array[ index + 3 ] = toHalfFloat( w );

		return this;

	}

}

/**
 * Convenient class that can be used when creating a `Float32` buffer attribute with
 * a plain `Array` instance.
 *
 * @augments BufferAttribute
 */
class Float32BufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new buffer attribute.
	 *
	 * @param {(Array<number>|Float32Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Float32Array( array ), itemSize, normalized );

	}

}

//

export {
	Float32BufferAttribute,
	Float16BufferAttribute,
	Uint32BufferAttribute,
	Int32BufferAttribute,
	Uint16BufferAttribute,
	Int16BufferAttribute,
	Uint8ClampedBufferAttribute,
	Uint8BufferAttribute,
	Int8BufferAttribute,
	BufferAttribute
};
