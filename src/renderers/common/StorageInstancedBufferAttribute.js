import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';

/**
 * This special type of instanced buffer attribute is intended for compute shaders.
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
 * @augments InstancedBufferAttribute
 */
class StorageInstancedBufferAttribute extends InstancedBufferAttribute {

	/**
	 * Constructs a new storage instanced buffer attribute.
	 *
	 * When created from an item count, the attribute holds no CPU-side data: the WebGPU backend
	 * creates its GPU buffer zero-initialized without an upload, and `array` is only allocated
	 * when it is accessed, e.g. to define initial data. The WebGL 2 backend allocates and
	 * uploads `array` as before.
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
		this.isStorageInstancedBufferAttribute = true;

		/**
		 * The typed array constructor of the attribute data. It is kept when `array`
		 * is set to `null`, so the array can be allocated again with the same type.
		 *
		 * @private
		 * @type {TypedArray.constructor}
		 */
		this._arrayType = isArray ? count.constructor : typeClass;

		if ( isArray === false ) this.count = count;

	}

	/**
	 * The attribute data. If the attribute holds no CPU-side data, a zero-filled array
	 * is allocated when it is accessed, also by methods such as `copy()`, `clone()` or
	 * `toJSON()`. Setting it to `null` releases the CPU-side data; a later access allocates
	 * a new zero-filled array, it does not read back the GPU buffer.
	 *
	 * @type {TypedArray}
	 */
	get array() {

		if ( this._array === null ) this._array = new this._arrayType( this.count * this.itemSize );

		return this._array;

	}

	set array( value ) {

		if ( value !== undefined && value !== null ) this._arrayType = value.constructor;

		this._array = value === undefined ? null : value;

	}

	/**
	 * The typed array constructor of the attribute data.
	 *
	 * @type {TypedArray.constructor}
	 * @readonly
	 */
	get arrayType() {

		return this._arrayType;

	}

	/**
	 * Whether the attribute holds CPU-side data. If `false`, the WebGPU backend creates
	 * its GPU buffer zero-initialized without uploading data.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get hasCPUData() {

		return this._array !== null;

	}

}

export default StorageInstancedBufferAttribute;
