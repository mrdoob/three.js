import { Float16BufferAttribute } from 'three';
import { GPUInputStepMode } from './WebGPUConstants.js';

const typedArraysToVertexFormatPrefix = new Map( [
	[ Int8Array, [ 'sint8', 'snorm8' ]],
	[ Uint8Array, [ 'uint8', 'unorm8' ]],
	[ Int16Array, [ 'sint16', 'snorm16' ]],
	[ Uint16Array, [ 'uint16', 'unorm16' ]],
	[ Int32Array, [ 'sint32', 'snorm32' ]],
	[ Uint32Array, [ 'uint32', 'unorm32' ]],
	[ Float32Array, [ 'float32', ]],
] );

const typedAttributeToVertexFormatPrefix = new Map( [
	[ Float16BufferAttribute, [ 'float16', ]],
] );

const typeArraysToVertexFormatPrefixForItemSize1 = new Map( [
	[ Int32Array, 'sint32' ],
	[ Uint32Array, 'uint32' ],
	[ Float32Array, 'float32' ]
] );

class WebGPUAttributeUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createAttribute( attribute, usage ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const backend = this.backend;
		const bufferData = backend.get( bufferAttribute );

		let buffer = bufferData.buffer;

		if ( buffer === undefined ) {

			const device = backend.device;

			let array = bufferAttribute.array;

			if ( ( bufferAttribute.isStorageBufferAttribute || bufferAttribute.isStorageInstancedBufferAttribute ) && bufferAttribute.itemSize === 3 ) {

				bufferAttribute.itemSize = 4;
				array = new array.constructor( bufferAttribute.count * 4 );

				for ( let i = 0; i < bufferAttribute.count; i ++ ) {

					array.set( bufferAttribute.array.subarray( i * 3, i * 3 + 3 ), i * 4 );

				}

			}

			const size = array.byteLength + ( ( 4 - ( array.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

			buffer = device.createBuffer( {
				label: bufferAttribute.name,
				size: size,
				usage: usage,
				mappedAtCreation: true
			} );

			new array.constructor( buffer.getMappedRange() ).set( array );

			buffer.unmap();

			bufferData.buffer = buffer;

		}

	}

	updateAttribute( attribute ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const backend = this.backend;
		const device = backend.device;

		const buffer = backend.get( bufferAttribute ).buffer;

		const array = bufferAttribute.array;
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

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];
				device.queue.writeBuffer(
					buffer,
					0,
					array,
					range.start * array.BYTES_PER_ELEMENT,
					range.count * array.BYTES_PER_ELEMENT
				);

			}

			bufferAttribute.clearUpdateRanges();

		}

	}

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

	destroyAttribute( attribute ) {

		const backend = this.backend;
		const data = backend.get( this._getBufferAttribute( attribute ) );

		data.buffer.destroy();

		backend.delete( attribute );

	}

	async getArrayBufferAsync( attribute ) {

		const backend = this.backend;
		const device = backend.device;

		const data = backend.get( this._getBufferAttribute( attribute ) );

		const bufferGPU = data.buffer;
		const size = bufferGPU.size;

		let readBufferGPU = data.readBuffer;
		let needsUnmap = true;

		if ( readBufferGPU === undefined ) {

			readBufferGPU = device.createBuffer( {
				label: attribute.name,
				size,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			} );

			needsUnmap = false;

			data.readBuffer = readBufferGPU;

		}

		const cmdEncoder = device.createCommandEncoder( {} );

		cmdEncoder.copyBufferToBuffer(
			bufferGPU,
			0,
			readBufferGPU,
			0,
			size
		);

		if ( needsUnmap ) readBufferGPU.unmap();

		const gpuCommands = cmdEncoder.finish();
		device.queue.submit( [ gpuCommands ] );

		await readBufferGPU.mapAsync( GPUMapMode.READ );

		const arrayBuffer = readBufferGPU.getMappedRange();

		return arrayBuffer;

	}

	_getVertexFormat( geometryAttribute ) {

		const { itemSize, normalized } = geometryAttribute;
		const ArrayType = geometryAttribute.array.constructor;
		const AttributeType = geometryAttribute.constructor;

		let format;

		if ( itemSize == 1 ) {

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

			console.error( 'THREE.WebGPUAttributeUtils: Vertex format not supported yet.' );

		}

		return format;

	}

	_getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

}

export default WebGPUAttributeUtils;
