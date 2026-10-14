import { BufferAttribute } from '../../core/BufferAttribute.js';

/**
 * This special type of buffer attribute is intended for compute shaders.
 * In earlier three.js versions it was only possible to update attribute data
 * on the CPU via JavaScript and then upload the data to the GPU. With the
 * new material system and renderer it is now possible to use compute shaders
 * to compute the data for an attribute more efficiently on the GPU.
 *
 * The idea is to create an instance of this class and provide it as an input
 * to {@link StorageBufferNode}.
 *
 * Note: This type of buffer attribute can only be used with `WebGPURenderer`.
 *
 * @augments BufferAttribute
 */
class StorageBufferAttribute extends BufferAttribute {

	/**
	 * Constructs a new storage buffer attribute.
	 *
	 * When created from an item count, the attribute holds no CPU-side data: its GPU buffer
	 * is zero-initialized without an upload and `array` is only allocated when it is accessed,
	 * e.g. to define initial data.
	 *
	 * @param {number|TypedArray} count - The item count. It is also valid to pass a typed array as an argument.
	 * The subsequent parameters are then obsolete.
	 * @param {number} itemSize - The item size.
	 * @param {TypedArray.constructor} [typeClass=Float32Array] - A typed array constructor.
	 */
	constructor( count, itemSize, typeClass = Float32Array ) {

		const isArray = ArrayBuffer.isView( count );

		super( isArray ? count : undefined, itemSize );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageBufferAttribute = true;

		/**
		 * The typed array constructor used to allocate `array` on first access.
		 *
		 * @private
		 * @type {TypedArray.constructor}
		 */
		this._arrayType = isArray ? count.constructor : typeClass;

		if ( isArray === false ) this.count = count;

	}

	/**
	 * The attribute data. If the attribute was created from an item count,
	 * a zero-filled array is allocated on first access.
	 *
	 * @type {TypedArray}
	 */
	get array() {

		if ( this._array === null ) this._array = new this._arrayType( this.count * this.itemSize );

		return this._array;

	}

	set array( value ) {

		this._array = value === undefined ? null : value;

	}

	/**
	 * The typed array constructor of the attribute data.
	 *
	 * @type {TypedArray.constructor}
	 * @readonly
	 */
	get arrayType() {

		return this._array !== null ? this._array.constructor : this._arrayType;

	}

	/**
	 * Whether the attribute holds CPU-side data. If `false`, its GPU buffer is
	 * created zero-initialized without uploading data.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get hasCPUData() {

		return this._array !== null;

	}

}

export default StorageBufferAttribute;
