import { ByteType, ShortType, RGBAIntegerFormat, RGBIntegerFormat, RedIntegerFormat, RGIntegerFormat, UnsignedByteType, UnsignedIntType, UnsignedShortType, RedFormat, RGFormat, IntType, RGBFormat, RGBAFormat, FloatType } from '../../../constants.js';
import { DataTexture } from '../../../textures/DataTexture.js';

let _id = 0;

/**
 * This module is internally used in context of compute shaders.
 * This type of shader is not natively supported in WebGL 2 and
 * thus implemented via Transform Feedback. `DualAttributeData`
 * manages the related data.
 *
 * @private
 */
class DualAttributeData {

	constructor( attributeData, dualBuffer ) {

		this.buffers = [ attributeData.bufferGPU, dualBuffer ];
		this.type = attributeData.type;
		this.bufferType = attributeData.bufferType;
		this.pbo = attributeData.pbo;
		this.byteLength = attributeData.byteLength;
		this.bytesPerElement = attributeData.BYTES_PER_ELEMENT;
		this.version = attributeData.version;
		this.isInteger = attributeData.isInteger;
		this.activeBufferIndex = 0;
		this.id = attributeData.id;

	}

	get bufferGPU() {

		return this.buffers[ this.activeBufferIndex ];

	}

	get transformBuffer() {

		return this.buffers[ this.activeBufferIndex ^ 1 ];

	}

	switchBuffers() {

		this.activeBufferIndex ^= 1;

	}

}

/**
 * A WebGL 2 backend utility module for managing shader attributes.
 *
 * @private
 */
class WebGLAttributeUtils {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGLBackend} backend - The WebGL 2 backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGL 2 backend.
		 *
		 * @type {WebGLBackend}
		 */
		this.backend = backend;

		/**
		 * Maps buffer attributes to their Pixel Buffer Object (PBO) textures,
		 * the attribute version last uploaded to them and their `dispose` listeners.
		 *
		 * @type {WeakMap<BufferAttribute, {texture: DataTexture, version: number, onDispose: Function}>}
		 */
		this.pbos = new WeakMap();

		/**
		 * Stores weak references to the buffer attributes with attached
		 * `dispose` event listeners.
		 *
		 * @private
		 * @type {Set<WeakRef<BufferAttribute>>}
		 */
		this._tracked = new Set();

		/**
		 * Removes weak references from `_tracked` when their attribute
		 * has been garbage collected without an explicit `dispose()`.
		 *
		 * @private
		 * @type {FinalizationRegistry}
		 */
		this._registry = new FinalizationRegistry( ( ref ) => this._tracked.delete( ref ) );

	}

	/**
	 * Returns the Pixel Buffer Object (PBO) texture for the given attribute.
	 * The attribute's array is padded to fit the dimensions of the texture,
	 * which is uploaded again whenever the attribute is updated on the CPU.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 * @return {DataTexture} The PBO texture.
	 */
	getPBO( attribute ) {

		let pbo = this.pbos.get( attribute );

		if ( pbo === undefined ) {

			const originalArray = attribute.array;
			const numElements = attribute.count * attribute.itemSize;
			const { itemSize } = attribute;
			const isInteger = originalArray.constructor.name.toLowerCase().includes( 'int' );

			let format = isInteger ? RedIntegerFormat : RedFormat;

			if ( itemSize === 2 ) {

				format = isInteger ? RGIntegerFormat : RGFormat;

			} else if ( itemSize === 3 ) {

				format = isInteger ? RGBIntegerFormat : RGBFormat;

			} else if ( itemSize === 4 ) {

				format = isInteger ? RGBAIntegerFormat : RGBAFormat;

			}

			const typeMap = {
				Float32Array: FloatType,
				Uint8Array: UnsignedByteType,
				Uint16Array: UnsignedShortType,
				Uint32Array: UnsignedIntType,
				Int8Array: ByteType,
				Int16Array: ShortType,
				Int32Array: IntType,
				Uint8ClampedArray: UnsignedByteType,
			};

			const width = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( numElements / itemSize ) ) ) );
			let height = Math.ceil( ( numElements / itemSize ) / width );
			if ( width * height * itemSize < numElements ) height ++; // Ensure enough space

			const newArray = new originalArray.constructor( width * height * itemSize );
			newArray.set( originalArray, 0 );
			attribute.array = newArray;

			const texture = new DataTexture( newArray, width, height, format, typeMap[ newArray.constructor.name ] || FloatType );
			texture.needsUpdate = true;
			texture.isPBOTexture = true;

			// the texture remains usable after disposal, it's recreated on next use
			const onDispose = () => texture.dispose();

			attribute.addEventListener( 'dispose', onDispose );

			const ref = new WeakRef( attribute );

			this._tracked.add( ref );
			this._registry.register( attribute, ref );

			pbo = { texture, version: attribute.version, onDispose };

			this.pbos.set( attribute, pbo );

		} else if ( pbo.version !== attribute.version ) {

			pbo.version = attribute.version;
			pbo.texture.needsUpdate = true;

		}

		return pbo.texture;

	}

	/**
	 * Creates the GPU buffer for the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 * @param {GLenum } bufferType - A flag that indicates the buffer type and thus binding point target.
	 */
	createAttribute( attribute, bufferType ) {

		const backend = this.backend;
		const { gl } = backend;

		const bufferAttribute = backend.getBufferAttribute( attribute );

		if ( backend.get( bufferAttribute ).bufferGPU !== undefined ) return;

		const array = attribute.array;
		const usage = attribute.usage || gl.STATIC_DRAW;

		const bufferGPU = this._createBuffer( gl, bufferType, array, usage );

		//attribute.onUploadCallback();

		let type;

		if ( array instanceof Float32Array ) {

			type = gl.FLOAT;

		} else if ( typeof Float16Array !== 'undefined' && array instanceof Float16Array ) {

			type = gl.HALF_FLOAT;

		} else if ( array instanceof Uint16Array ) {

			type = gl.UNSIGNED_SHORT;

		} else if ( array instanceof Int16Array ) {

			type = gl.SHORT;

		} else if ( array instanceof Uint32Array ) {

			type = gl.UNSIGNED_INT;

		} else if ( array instanceof Int32Array ) {

			type = gl.INT;

		} else if ( array instanceof Int8Array ) {

			type = gl.BYTE;

		} else if ( array instanceof Uint8Array ) {

			type = gl.UNSIGNED_BYTE;

		} else if ( array instanceof Uint8ClampedArray ) {

			type = gl.UNSIGNED_BYTE;

		} else {

			throw new Error( 'THREE.WebGLBackend: Unsupported buffer data format: ' + array );

		}

		let attributeData = {
			bufferGPU,
			bufferType,
			type,
			byteLength: array.byteLength,
			bytesPerElement: array.BYTES_PER_ELEMENT,
			version: bufferAttribute.version,
			isInteger: type === gl.INT || type === gl.UNSIGNED_INT || attribute.gpuType === IntType,
			id: _id ++
		};

		if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) {

			// create buffer for transform feedback use
			const bufferGPUDual = this._createBuffer( gl, bufferType, array, usage );
			attributeData = new DualAttributeData( attributeData, bufferGPUDual );

		}

		backend.set( bufferAttribute, attributeData );

	}

	/**
	 * Updates the GPU buffer of the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	updateAttribute( attribute ) {

		const backend = this.backend;
		const { gl } = backend;

		const array = attribute.array;
		const bufferAttribute = backend.getBufferAttribute( attribute );
		const bufferData = backend.get( bufferAttribute );
		const updateRanges = bufferAttribute.updateRanges;

		// the element buffer binding is part of the VAO state, so index buffers are updated
		// via the copy target to keep the bound VAO intact

		const target = bufferData.bufferType === gl.ELEMENT_ARRAY_BUFFER ? gl.COPY_WRITE_BUFFER : bufferData.bufferType;

		gl.bindBuffer( target, bufferData.bufferGPU );

		if ( updateRanges.length === 0 ) {

			// Not using update ranges

			gl.bufferSubData( target, 0, array );

		} else {

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];
				gl.bufferSubData( target, range.start * array.BYTES_PER_ELEMENT,
					array, range.start, range.count );

			}

			bufferAttribute.clearUpdateRanges();

		}

		gl.bindBuffer( target, null );

		bufferData.version = bufferAttribute.version;

	}

	/**
	 * Destroys the GPU buffer of the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	destroyAttribute( attribute ) {

		const backend = this.backend;
		const { gl } = backend;

		const bufferAttribute = backend.getBufferAttribute( attribute );
		const attributeData = backend.get( bufferAttribute );

		if ( attributeData.buffers !== undefined ) {

			// storage attributes hold a second buffer for transform feedback
			for ( const buffer of attributeData.buffers ) {

				gl.deleteBuffer( buffer );

			}

		} else {

			gl.deleteBuffer( attributeData.bufferGPU );

		}

		backend.delete( bufferAttribute );

	}

	/**
	 * Removes the `dispose` listeners of the PBO attributes. The PBO textures
	 * themselves are released with the renderer's textures.
	 */
	dispose() {

		for ( const ref of this._tracked ) {

			const attribute = ref.deref();

			if ( attribute !== undefined ) attribute.removeEventListener( 'dispose', this.pbos.get( attribute ).onDispose );

		}

		this._tracked.clear();

	}

	/**
	 * This method performs a readback operation by moving buffer data from
	 * a storage buffer attribute from the GPU to the CPU. ReadbackBuffer can
	 * be used to retain and reuse handles to the intermediate buffers and prevent
	 * new allocation.
	 *
	 * @async
	 * @param {BufferAttribute} attribute - The storage buffer attribute to read from.
	 * @param {?(ReadbackBuffer|ArrayBuffer)} [target=null] - The readback buffer or array buffer that receives the data. If `null`, a new array buffer is returned.
	 * @param {number} [offset=0] - The byte offset to start reading from. Must be a multiple of 4.
	 * @param {number} [count=-1] - The number of bytes to read. Must be a multiple of 4, or `-1` to read to the end of the buffer.
	 * @return {Promise<ArrayBuffer|ReadbackBuffer>} A promise that resolves with the buffer data when the data are ready.
	 */
	async getArrayBufferAsync( attribute, target = null, offset = 0, count = - 1 ) {

		const backend = this.backend;
		const { gl } = backend;

		const bufferAttribute = backend.getBufferAttribute( attribute );
		const attributeInfo = backend.get( bufferAttribute );
		const { bufferGPU } = attributeInfo;

		const byteLength = count === - 1 ? attributeInfo.byteLength - offset : count;

		// read the data back
		let dstBuffer;
		if ( target === null ) {

			dstBuffer = new Uint8Array( new ArrayBuffer( byteLength ) );

		} else if ( target.isReadbackBuffer ) {

			if ( target._mapped === true ) {

				throw new Error( 'THREE.WebGPURenderer: ReadbackBuffer must be released before being used again.' );

			}

			const releaseCallback = () => {

				target.buffer = null;
				target._mapped = false;
				target.removeEventListener( 'release', releaseCallback );
				target.removeEventListener( 'dispose', releaseCallback );

			};

			target.addEventListener( 'release', releaseCallback );
			target.addEventListener( 'dispose', releaseCallback );

			// WebGL has no concept of a "mapped" data buffer so we create a new buffer, instead.
			dstBuffer = new Uint8Array( new ArrayBuffer( byteLength ) );
			target.buffer = dstBuffer.buffer;

		} else {

			dstBuffer = new Uint8Array( target );

		}

		// Ensure the buffer is bound before reading
		gl.bindBuffer( gl.COPY_READ_BUFFER, bufferGPU );
		gl.getBufferSubData( gl.COPY_READ_BUFFER, offset, dstBuffer );

		gl.bindBuffer( gl.COPY_READ_BUFFER, null );
		gl.bindBuffer( gl.COPY_WRITE_BUFFER, null );

		// return the appropriate type
		if ( target && target.isReadbackBuffer ) {

			return target;

		} else {

			return dstBuffer.buffer;

		}

	}

	/**
	 * Creates a WebGL buffer with the given data.
	 *
	 * @private
	 * @param {WebGL2RenderingContext} gl - The rendering context.
	 * @param {GLenum } bufferType - A flag that indicates the buffer type and thus binding point target.
	 * @param {TypedArray} array - The array of the buffer attribute.
	 * @param {GLenum} usage - The usage.
	 * @return {WebGLBuffer} The WebGL buffer.
	 */
	_createBuffer( gl, bufferType, array, usage ) {

		const bufferGPU = gl.createBuffer();

		// the element buffer binding is part of the VAO state, so the bound VAO must not be affected.
		// the first binding defines the buffer type so the copy target can not be used here

		const state = this.backend.state;

		if ( bufferType === gl.ELEMENT_ARRAY_BUFFER && state.currentVAO !== null ) state.resetVertexState();

		gl.bindBuffer( bufferType, bufferGPU );
		gl.bufferData( bufferType, array, usage );
		gl.bindBuffer( bufferType, null );

		return bufferGPU;

	}

}

export default WebGLAttributeUtils;
