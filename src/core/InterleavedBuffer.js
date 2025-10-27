import { generateUUID } from '../math/MathUtils.js';
import { StaticDrawUsage } from '../constants.js';

/**
 * "Interleaved" means that multiple attributes, possibly of different types,
 * (e.g., position, normal, uv, color) are packed into a single array buffer.
 *
 * An introduction into interleaved arrays can be found here: [Interleaved array basics](https://blog.tojicode.com/2011/05/interleaved-array-basics.html)
 */
class InterleavedBuffer {

	/**
	 * Constructs a new interleaved buffer.
	 *
	 * @param {TypedArray} array - A typed array with a shared buffer storing attribute data.
	 * @param {number} stride - The number of typed-array elements per vertex.
	 */
	constructor( array, stride ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInterleavedBuffer = true;

		/**
		 * A typed array with a shared buffer storing attribute data.
		 *
		 * @type {TypedArray}
		 */
		this.array = array;

		/**
		 * The number of typed-array elements per vertex.
		 *
		 * @type {number}
		 */
		this.stride = stride;

		/**
		 * The total number of elements in the array
		 *
		 * @type {number}
		 * @readonly
		 */
		this.count = array !== undefined ? array.length / stride : 0;

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
		 * A version number, incremented every time the `needsUpdate` is set to `true`.
		 *
		 * @type {number}
		 */
		this.version = 0;

		/**
		 * The UUID of the interleaved buffer.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

	}

	/**
	 * A callback function that is executed after the renderer has transferred the attribute array
	 * data to the GPU.
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
	 * Sets the usage of this interleaved buffer.
	 *
	 * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	 * @return {InterleavedBuffer} A reference to this interleaved buffer.
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
	 * Copies the values of the given interleaved buffer to this instance.
	 *
	 * @param {InterleavedBuffer} source - The interleaved buffer to copy.
	 * @return {InterleavedBuffer} A reference to this instance.
	 */
	copy( source ) {

		this.array = new source.array.constructor( source.array );
		this.count = source.count;
		this.stride = source.stride;
		this.usage = source.usage;

		return this;

	}

	/**
	 * Copies a vector from the given interleaved buffer to this one. The start
	 * and destination position in the attribute buffers are represented by the
	 * given indices.
	 *
	 * @param {number} index1 - The destination index into this interleaved buffer.
	 * @param {InterleavedBuffer} interleavedBuffer - The interleaved buffer to copy from.
	 * @param {number} index2 - The source index into the given interleaved buffer.
	 * @return {InterleavedBuffer} A reference to this instance.
	 */
	copyAt( index1, interleavedBuffer, index2 ) {

		index1 *= this.stride;
		index2 *= interleavedBuffer.stride;

		for ( let i = 0, l = this.stride; i < l; i ++ ) {

			this.array[ index1 + i ] = interleavedBuffer.array[ index2 + i ];

		}

		return this;

	}

	/**
	 * Sets the given array data in the interleaved buffer.
	 *
	 * @param {(TypedArray|Array)} value - The array data to set.
	 * @param {number} [offset=0] - The offset in this interleaved buffer's array.
	 * @return {InterleavedBuffer} A reference to this instance.
	 */
	set( value, offset = 0 ) {

		this.array.set( value, offset );

		return this;

	}

	/**
	 * Returns a new interleaved buffer with copied values from this instance.
	 *
	 * @param {Object} [data] - An object with shared array buffers that allows to retain shared structures.
	 * @return {InterleavedBuffer} A clone of this instance.
	 */
	clone( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = this.array.slice( 0 ).buffer;

		}

		const array = new this.array.constructor( data.arrayBuffers[ this.array.buffer._uuid ] );

		const ib = new this.constructor( array, this.stride );
		ib.setUsage( this.usage );

		return ib;

	}

	/**
	 * Sets the given callback function that is executed after the Renderer has transferred
	 * the array data to the GPU. Can be used to perform clean-up operations after
	 * the upload when data are not needed anymore on the CPU side.
	 *
	 * @param {Function} callback - The `onUpload()` callback.
	 * @return {InterleavedBuffer} A reference to this instance.
	 */
	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	/**
	 * Serializes the interleaved buffer into JSON.
	 *
	 * @param {Object} [data] - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized interleaved buffer.
	 */
	toJSON( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		// generate UUID for array buffer if necessary

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = Array.from( new Uint32Array( this.array.buffer ) );

		}

		//

		return {
			uuid: this.uuid,
			buffer: this.array.buffer._uuid,
			type: this.array.constructor.name,
			stride: this.stride
		};

	}

}

export { InterleavedBuffer };
