import { IntType } from '../../../constants.js';

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
		this.baseId = attributeData.id;

	}


	get id() {

		return `${ this.baseId }|${ this.activeBufferIndex }`;

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

		const array = attribute.array;
		const usage = attribute.usage || gl.STATIC_DRAW;

		const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
		const bufferData = backend.get( bufferAttribute );

		let bufferGPU = bufferData.bufferGPU;

		if ( bufferGPU === undefined ) {

			bufferGPU = this._createBuffer( gl, bufferType, array, usage );

			bufferData.bufferGPU = bufferGPU;
			bufferData.bufferType = bufferType;
			bufferData.version = bufferAttribute.version;

		}

		//attribute.onUploadCallback();

		let type;

		if ( array instanceof Float32Array ) {

			type = gl.FLOAT;

		} else if ( typeof Float16Array !== 'undefined' && array instanceof Float16Array ) {

			type = gl.HALF_FLOAT;

		} else if ( array instanceof Uint16Array ) {

			if ( attribute.isFloat16BufferAttribute ) {

				type = gl.HALF_FLOAT;

			} else {

				type = gl.UNSIGNED_SHORT;

			}

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
			version: attribute.version,
			pbo: attribute.pbo,
			isInteger: type === gl.INT || type === gl.UNSIGNED_INT || attribute.gpuType === IntType,
			id: _id ++
		};

		if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) {

			// create buffer for transform feedback use
			const bufferGPUDual = this._createBuffer( gl, bufferType, array, usage );
			attributeData = new DualAttributeData( attributeData, bufferGPUDual );

		}

		backend.set( attribute, attributeData );

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
		const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
		const bufferData = backend.get( bufferAttribute );
		const bufferType = bufferData.bufferType;
		const updateRanges = attribute.isInterleavedBufferAttribute ? attribute.data.updateRanges : attribute.updateRanges;

		gl.bindBuffer( bufferType, bufferData.bufferGPU );

		if ( updateRanges.length === 0 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, array );

		} else {

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];
				gl.bufferSubData( bufferType, range.start * array.BYTES_PER_ELEMENT,
					array, range.start, range.count );

			}

			bufferAttribute.clearUpdateRanges();

		}

		gl.bindBuffer( bufferType, null );

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

		if ( attribute.isInterleavedBufferAttribute ) {

			backend.delete( attribute.data );

		}

		const attributeData = backend.get( attribute );

		gl.deleteBuffer( attributeData.bufferGPU );

		backend.delete( attribute );

	}

	/**
	 * This method performs a readback operation by moving buffer data from
	 * a storage buffer attribute from the GPU to the CPU. ReadbackBuffer can
	 * be used to retain and reuse handles to the intermediate buffers and prevent
	 * new allocation.
	 *
	 * @async
	 * @param {BufferAttribute} attribute - The storage buffer attribute to read frm.
	 * @param {ReadbackBuffer|ArrayBuffer} target - The storage buffer attribute.
	 * @param {number} offset - The storage buffer attribute.
	 * @param {number} count - The offset from which to start reading the
	 * @return {Promise<ArrayBuffer|ReadbackBuffer>} A promise that resolves with the buffer data when the data are ready.
	 */
	async getArrayBufferAsync( attribute, target = null, offset = 0, count = - 1 ) {

		const backend = this.backend;
		const { gl } = backend;

		const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
		const attributeInfo = backend.get( bufferAttribute );
		const { bufferGPU } = attributeInfo;

		const byteLength = count === - 1 ? attributeInfo.byteLength - offset : count;

		// read the data back
		let dstBuffer;
		if ( target === null ) {

			dstBuffer = new Uint8Array( new ArrayBuffer( byteLength ) );

		} else if ( target.isReadbackBuffer ) {

			if ( target._mapped === true ) {

				throw new Error( 'WebGPURenderer: ReadbackBuffer must be released before being used again.' );

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

		gl.bindBuffer( bufferType, bufferGPU );
		gl.bufferData( bufferType, array, usage );
		gl.bindBuffer( bufferType, null );

		return bufferGPU;

	}

}

export default WebGLAttributeUtils;
