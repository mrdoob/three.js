import { GPUInputStepMode } from './WebGPUConstants.js';
import { submit } from './WebGPUUtils.js';
import GPUBufferDescriptor from '../descriptors/GPUBufferDescriptor.js';
import GPUCommandEncoderDescriptor from '../descriptors/GPUCommandEncoderDescriptor.js';

import { Float16BufferAttribute } from '../../../core/BufferAttribute.js';
import { isTypedArray, error } from '../../../utils.js';

const _bufferDescriptor = new GPUBufferDescriptor();
const _commandEncoderDescriptor = new GPUCommandEncoderDescriptor();

const typedArraysToVertexFormatPrefix = new Map( [
	[ Int8Array, [ 'sint8', 'snorm8' ]],
	[ Uint8Array, [ 'uint8', 'unorm8' ]],
	[ Int16Array, [ 'sint16', 'snorm16' ]],
	[ Uint16Array, [ 'uint16', 'unorm16' ]],
	[ Int32Array, [ 'sint32', 'snorm32' ]],
	[ Uint32Array, [ 'uint32', 'unorm32' ]],
	[ Float32Array, [ 'float32', ]],
] );

if ( typeof Float16Array !== 'undefined' ) {

	typedArraysToVertexFormatPrefix.set( Float16Array, [ 'float16' ] );

}

const typedAttributeToVertexFormatPrefix = new Map( [
	[ Float16BufferAttribute, [ 'float16', ]],
] );

const typeArraysToVertexFormatPrefixForItemSize1 = new Map( [
	[ Int32Array, 'sint32' ],
	[ Int16Array, 'sint32' ], // patch for INT16
	[ Uint32Array, 'uint32' ],
	[ Uint16Array, 'uint32' ], // patch for UINT16
	[ Float32Array, 'float32' ]
] );

/**
 * A WebGPU backend utility module for managing shader attributes.
 *
 * @private
 */
class WebGPUAttributeUtils {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGPUBackend} backend - The WebGPU backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGPU backend.
		 *
		 * @type {WebGPUBackend}
		 */
		this.backend = backend;

	}

	/**
	 * Creates the GPU buffer for the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 * @param {GPUBufferUsage} usage - A flag that indicates how the buffer may be used after its creation.
	 */
	createAttribute( attribute, usage ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const backend = this.backend;
		const bufferData = backend.get( bufferAttribute );

		let buffer = bufferData.buffer;

		if ( buffer === undefined ) {

			const device = backend.device;

			let array = bufferAttribute.array;

			// patch for INT16 and UINT16
			if ( attribute.normalized === false ) {

				if ( array.constructor === Int16Array || array.constructor === Int8Array ) {

					array = new Int32Array( array );

				} else if ( array.constructor === Uint16Array || array.constructor === Uint8Array ) {

					array = new Uint32Array( array );

					if ( usage & GPUBufferUsage.INDEX ) {

						for ( let i = 0; i < array.length; i ++ ) {

							if ( array[ i ] === 0xffff ) array[ i ] = 0xffffffff; // use correct primitive restart index

						}

					}

				}

			}

			bufferAttribute.array = array;

			let paddedItemSize;

			if ( ( bufferAttribute.isStorageBufferAttribute || bufferAttribute.isStorageInstancedBufferAttribute ) && bufferAttribute.itemSize === 3 ) {

				// WGSL does not support packed vec3 data in storage buffers, pad to vec4

				paddedItemSize = 4;

			} else if ( bufferAttribute.itemSize > 1 && ( bufferAttribute.itemSize * array.BYTES_PER_ELEMENT ) % 4 !== 0 ) {

				// arrayStride must be a multiple of 4

				const byteStride = bufferAttribute.itemSize * array.BYTES_PER_ELEMENT;

				paddedItemSize = ( Math.floor( ( byteStride + 3 ) / 4 ) * 4 ) / array.BYTES_PER_ELEMENT;

			}

			if ( paddedItemSize !== undefined ) {

				const itemSize = bufferAttribute.itemSize;

				const paddedArray = new array.constructor( bufferAttribute.count * paddedItemSize );

				for ( let i = 0; i < bufferAttribute.count; i ++ ) {

					paddedArray.set( array.subarray( i * itemSize, i * itemSize + itemSize ), i * paddedItemSize );

				}

				if ( bufferAttribute.isStorageBufferAttribute || bufferAttribute.isStorageInstancedBufferAttribute ) {

					// update the storage attribute so storage bindings access the padded layout

					bufferAttribute.itemSize = paddedItemSize;
					bufferAttribute.array = paddedArray;

				}

				array = paddedArray;

				// save the original and padded item size so buffer updates can apply the same padding

				bufferData._itemSize = itemSize;
				bufferData._paddedItemSize = paddedItemSize;

			}

			// total buffer size must be a multiple of 4
			const byteLength = array.byteLength;
			const size = byteLength + ( ( 4 - ( byteLength % 4 ) ) % 4 );

			_bufferDescriptor.label = bufferAttribute.name;
			_bufferDescriptor.size = size;
			_bufferDescriptor.usage = usage;
			_bufferDescriptor.mappedAtCreation = true;

			buffer = device.createBuffer( _bufferDescriptor );

			_bufferDescriptor.reset();

			new array.constructor( buffer.getMappedRange() ).set( array );

			buffer.unmap();

			bufferData.buffer = buffer;

		}

	}

	/**
	 * Updates the GPU buffer of the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	updateAttribute( attribute ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const backend = this.backend;
		const device = backend.device;

		const bufferData = backend.get( bufferAttribute );
		const buffer = backend.get( bufferAttribute ).buffer;

		let array = bufferAttribute.array;

		const itemSize = bufferData._itemSize;
		const paddedItemSize = bufferData._paddedItemSize;

		if ( paddedItemSize !== undefined ) {

			// if the attribute data were padded on upload, apply the same padding on updates.

			array = new array.constructor( bufferAttribute.count * paddedItemSize );

			for ( let i = 0; i < bufferAttribute.count; i ++ ) {

				array.set( bufferAttribute.array.subarray( i * itemSize, i * itemSize + itemSize ), i * paddedItemSize );

			}

			if ( bufferAttribute.isStorageBufferAttribute || bufferAttribute.isStorageInstancedBufferAttribute ) {

				// keep the storage attribute in sync with the padded layout

				bufferAttribute.array = array;

			}

		}


		const updateRanges = bufferAttribute.updateRanges;

		if ( updateRanges.length === 0 ) {

			// Not using update ranges

			device.queue.writeBuffer(
				buffer,
				0,
				array,
				0
			);

		} else {

			const isTyped = isTypedArray( array );
			const byteOffsetFactor = isTyped ? 1 : array.BYTES_PER_ELEMENT;

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];
				let dataOffset, size;

				if ( paddedItemSize !== undefined ) {

					const vertexStart = Math.floor( range.start / itemSize );
					const vertexCount = Math.ceil( ( range.start + range.count ) / itemSize ) - vertexStart;
					dataOffset = vertexStart * paddedItemSize * byteOffsetFactor;
					size = vertexCount * paddedItemSize * byteOffsetFactor;

				} else {

					dataOffset = range.start * byteOffsetFactor;
					size = range.count * byteOffsetFactor;

				}

				const bufferOffset = dataOffset * ( isTyped ? array.BYTES_PER_ELEMENT : 1 ); // bufferOffset is always in bytes

				device.queue.writeBuffer(
					buffer,
					bufferOffset,
					array,
					dataOffset,
					size
				);

			}

			bufferAttribute.clearUpdateRanges();

		}

	}

	/**
	 * This method creates the vertex buffer layout data which are
	 * require when creating a render pipeline for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Array<Object>} An array holding objects which describe the vertex buffer layout.
	 */
	createShaderVertexBuffers( renderObject ) {

		const attributes = renderObject.getAttributes();
		const vertexBuffers = new Map();

		for ( let slot = 0; slot < attributes.length; slot ++ ) {

			const geometryAttribute = attributes[ slot ];
			const bytesPerElement = geometryAttribute.array.BYTES_PER_ELEMENT;
			const bufferAttribute = this._getBufferAttribute( geometryAttribute );

			let vertexBufferLayout = vertexBuffers.get( bufferAttribute );

			if ( vertexBufferLayout === undefined ) {

				let arrayStride, stepMode;

				if ( geometryAttribute.isInterleavedBufferAttribute === true ) {

					arrayStride = geometryAttribute.data.stride * bytesPerElement;
					stepMode = geometryAttribute.data.isInstancedInterleavedBuffer ? GPUInputStepMode.Instance : GPUInputStepMode.Vertex;

				} else {

					arrayStride = geometryAttribute.itemSize * bytesPerElement;
					stepMode = geometryAttribute.isInstancedBufferAttribute ? GPUInputStepMode.Instance : GPUInputStepMode.Vertex;

					if ( geometryAttribute.itemSize > 1 && arrayStride % 4 !== 0 ) {

						// packed attribute data are padded per vertex on upload

						arrayStride = Math.floor( ( arrayStride + 3 ) / 4 ) * 4;

					}

				}

				// patch for INT16 and UINT16
				if ( geometryAttribute.normalized === false && ( geometryAttribute.array.constructor === Int16Array || geometryAttribute.array.constructor === Uint16Array ) ) {

					arrayStride = 4;

				}

				vertexBufferLayout = {
					arrayStride,
					attributes: [],
					stepMode
				};

				vertexBuffers.set( bufferAttribute, vertexBufferLayout );

			}

			const format = this._getVertexFormat( geometryAttribute );
			const offset = ( geometryAttribute.isInterleavedBufferAttribute === true ) ? geometryAttribute.offset * bytesPerElement : 0;

			vertexBufferLayout.attributes.push( {
				shaderLocation: slot,
				offset,
				format
			} );

		}

		return Array.from( vertexBuffers.values() );

	}

	/**
	 * Destroys the GPU buffer of the given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	destroyAttribute( attribute ) {

		const backend = this.backend;
		const data = backend.get( this._getBufferAttribute( attribute ) );

		data.buffer.destroy();

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
	 * @param {number} count - The offset from which to start reading the
	 * @param {number} offset - The storage buffer attribute.
	 * @param {ReadbackBuffer|ArrayBuffer} target - The storage buffer attribute.
	 * @return {Promise<ArrayBuffer|ReadbackBuffer>} A promise that resolves with the buffer data when the data are ready.
	 */
	async getArrayBufferAsync( attribute, target = null, offset = 0, count = - 1 ) {

		const backend = this.backend;
		const device = backend.device;

		const data = backend.get( this._getBufferAttribute( attribute ) );
		const bufferGPU = data.buffer;
		const byteLength = count === - 1 ? bufferGPU.size - offset : count;

		let readBufferGPU;
		if ( target !== null && target.isReadbackBuffer ) {

			const readbackInfo = backend.get( target );

			if ( target._mapped === true ) {

				throw new Error( 'THREE.WebGPUAttributeUtils: ReadbackBuffer must be released before being used again.' );

			}

			target._mapped = true;

			// initialize the GPU-side read copy buffer if it is not present
			if ( readbackInfo.readBufferGPU === undefined ) {

				_bufferDescriptor.label = `${ target.name }_readback`;
				_bufferDescriptor.size = target.maxByteLength;
				_bufferDescriptor.usage = GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ;

				readBufferGPU = device.createBuffer( _bufferDescriptor );

				_bufferDescriptor.reset();

				// release / dispose
				const releaseCallback = () => {

					target.buffer = null;
					target._mapped = false;

					readBufferGPU.unmap();

				};

				const disposeCallback = () => {

					target.buffer = null;
					target._mapped = false;

					readBufferGPU.destroy();

					backend.delete( target );

					target.removeEventListener( 'release', releaseCallback );
					target.removeEventListener( 'dispose', disposeCallback );

				};

				target.addEventListener( 'release', releaseCallback );
				target.addEventListener( 'dispose', disposeCallback );

				// register
				readbackInfo.readBufferGPU = readBufferGPU;

			} else {

				readBufferGPU = readbackInfo.readBufferGPU;

			}

		} else {

			// create a new temp buffer for array buffers otherwise
			_bufferDescriptor.label = `${ attribute.name }_readback`;
			_bufferDescriptor.size = byteLength;
			_bufferDescriptor.usage = GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ;

			readBufferGPU = device.createBuffer( _bufferDescriptor );

			_bufferDescriptor.reset();

		}

		// copy the data
		_commandEncoderDescriptor.label = `readback_encoder_${ attribute.name }`;
		const cmdEncoder = device.createCommandEncoder( _commandEncoderDescriptor );
		_commandEncoderDescriptor.reset();

		cmdEncoder.copyBufferToBuffer(
			bufferGPU,
			offset,
			readBufferGPU,
			0,
			byteLength,
		);

		const gpuCommands = cmdEncoder.finish();
		submit( device, gpuCommands );

		// map the data to the CPU
		await readBufferGPU.mapAsync( GPUMapMode.READ, 0, byteLength );

		if ( target === null ) {

			// return a new array buffer and clean up the gpu handles
			const arrayBuffer = readBufferGPU.getMappedRange( 0, byteLength );
			const result = arrayBuffer.slice();
			readBufferGPU.destroy();
			return result;

		} else if ( target.isReadbackBuffer ) {

			// assign the data to the read back handle
			target.buffer = readBufferGPU.getMappedRange( 0, byteLength );
			return target;

		} else {

			// copy the data into the target array buffer
			const arrayBuffer = readBufferGPU.getMappedRange( 0, byteLength );
			new Uint8Array( target ).set( new Uint8Array( arrayBuffer ) );
			readBufferGPU.destroy();
			return target;

		}

	}

	/**
	 * Returns the vertex format of the given buffer attribute.
	 *
	 * @private
	 * @param {BufferAttribute} geometryAttribute - The buffer attribute.
	 * @return {string|undefined} The vertex format (e.g. 'float32x3').
	 */
	_getVertexFormat( geometryAttribute ) {

		const { itemSize, normalized } = geometryAttribute;
		const ArrayType = geometryAttribute.array.constructor;
		const AttributeType = geometryAttribute.constructor;

		let format;

		if ( itemSize === 1 ) {

			format = typeArraysToVertexFormatPrefixForItemSize1.get( ArrayType );

		} else {

			const prefixOptions = typedAttributeToVertexFormatPrefix.get( AttributeType ) || typedArraysToVertexFormatPrefix.get( ArrayType );
			const prefix = prefixOptions[ normalized ? 1 : 0 ];

			if ( prefix ) {

				const bytesPerUnit = ArrayType.BYTES_PER_ELEMENT * itemSize;
				const paddedBytesPerUnit = Math.floor( ( bytesPerUnit + 3 ) / 4 ) * 4;
				const paddedItemSize = paddedBytesPerUnit / ArrayType.BYTES_PER_ELEMENT;

				if ( paddedItemSize % 1 ) {

					throw new Error( 'THREE.WebGPUAttributeUtils: Bad vertex format item size.' );

				}

				format = `${prefix}x${paddedItemSize}`;

			}

		}

		if ( ! format ) {

			error( 'WebGPUAttributeUtils: Vertex format not supported yet.' );

		}

		return format;

	}

	/**
	 * Utility method for handling interleaved buffer attributes correctly.
	 * To process them, their `InterleavedBuffer` is returned.
	 *
	 * @private
	 * @param {BufferAttribute} attribute - The attribute.
	 * @return {BufferAttribute|InterleavedBuffer}
	 */
	_getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

}

export default WebGPUAttributeUtils;
