/**
 * An alternative version of a buffer attribute with more control over the VBO.
 *
 * The renderer does not construct a VBO for this kind of attribute. Instead, it uses
 * whatever VBO is passed in constructor and can later be altered via the `buffer` property.
 *
 * The most common use case for this class is when some kind of GPGPU calculation interferes
 * or even produces the VBOs in question.
 *
 * Notice that this class can only be used with {@link WebGLRenderer}.
 */
class GLBufferAttribute {

	/**
	 * Constructs a new GL buffer attribute.
	 *
	 * @param {WebGLBuffer} buffer - The native WebGL buffer.
	 * @param {number} type - The native data type (e.g. `gl.FLOAT`).
	 * @param {number} itemSize - The item size.
	 * @param {number} elementSize - The corresponding size (in bytes) for the given `type` parameter.
	 * @param {number} count - The expected number of vertices in VBO.
	 */
	constructor( buffer, type, itemSize, elementSize, count ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isGLBufferAttribute = true;

		/**
		 * The name of the buffer attribute.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The native WebGL buffer.
		 *
		 * @type {WebGLBuffer}
		 */
		this.buffer = buffer;

		/**
		 * The native data type.
		 *
		 * @type {number}
		 */
		this.type = type;

		/**
		 * The item size, see {@link BufferAttribute#itemSize}.
		 *
		 * @type {number}
		 */
		this.itemSize = itemSize;

		/**
		 * The corresponding size (in bytes) for the given `type` parameter.
		 *
		 * @type {number}
		 */
		this.elementSize = elementSize;

		/**
		 * The expected number of vertices in VBO.
		 *
		 * @type {number}
		 */
		this.count = count;

		/**
		 * A version number, incremented every time the `needsUpdate` is set to `true`.
		 *
		 * @type {number}
		 */
		this.version = 0;

	}

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
	 * Sets the given native WebGL buffer.
	 *
	 * @param {WebGLBuffer} buffer - The buffer to set.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setBuffer( buffer ) {

		this.buffer = buffer;

		return this;

	}

	/**
	 * Sets the given native data type and element size.
	 *
	 * @param {number} type - The native data type (e.g. `gl.FLOAT`).
	 * @param {number} elementSize - The corresponding size (in bytes) for the given `type` parameter.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setType( type, elementSize ) {

		this.type = type;
		this.elementSize = elementSize;

		return this;

	}

	/**
	 * Sets the item size.
	 *
	 * @param {number} itemSize - The item size.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setItemSize( itemSize ) {

		this.itemSize = itemSize;

		return this;

	}

	/**
	 * Sets the count (the expected number of vertices in VBO).
	 *
	 * @param {number} count - The count.
	 * @return {BufferAttribute} A reference to this instance.
	 */
	setCount( count ) {

		this.count = count;

		return this;

	}

}

export { GLBufferAttribute };
