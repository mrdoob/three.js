import { Float16BufferAttribute } from 'three';

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

        const bufferAttribute = this.getBufferAttribute( attribute );

        const backend = this.backend;
        const device = backend.device;

		const array = bufferAttribute.array;
		const size = array.byteLength + ( ( 4 - ( array.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

		const buffer = device.createBuffer( {
			label: bufferAttribute.name,
			size : size,
			usage: usage,
			mappedAtCreation: true
		} );

		new array.constructor( buffer.getMappedRange() ).set( array );

		buffer.unmap();

		backend.get( attribute ).buffer = buffer;

	}

    getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

    updateAttribute( attribute ) { 

        const bufferAttribute = this.getBufferAttribute( attribute );

        const backend = this.backend;
        const device = backend.device;

        const buffer = backend.get( bufferAttribute ).buffer;

		const array = bufferAttribute.array;
		const updateRange = bufferAttribute.updateRange;

		if ( updateRange.count === - 1 ) {

			// Not using update ranges

			device.queue.writeBuffer(
				buffer,
				0,
				array,
				0
			);

		} else {

			device.queue.writeBuffer(
				buffer,
				0,
				array,
				updateRange.offset * array.BYTES_PER_ELEMENT,
				updateRange.count * array.BYTES_PER_ELEMENT
			);

			updateRange.count = - 1; // reset range

		}

    }

    createShaderAttributes( renderObject ) {

		const attributes = renderObject.getAttributes();
		const shaderAttributes = [];

		for ( let slot = 0; slot < attributes.length; slot ++ ) {

			const geometryAttribute = attributes[ slot ];
			const bytesPerElement = geometryAttribute.array.BYTES_PER_ELEMENT;

			const format = this.getVertexFormat( geometryAttribute );

			let arrayStride = geometryAttribute.itemSize * bytesPerElement;
			let offset = 0;

			if ( geometryAttribute.isInterleavedBufferAttribute === true ) {

				// @TODO: It can be optimized for "vertexBuffers" on RenderPipeline

				arrayStride = geometryAttribute.data.stride * bytesPerElement;
				offset = geometryAttribute.offset * bytesPerElement;

			}

			shaderAttributes.push( {
				geometryAttribute,
				arrayStride,
				offset,
				format,
				slot
			} );

		}

		return shaderAttributes;

	}

    getVertexFormat( geometryAttribute ) {

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

					throw new Error( 'THREE.WebGPURenderer: Bad vertex format item size.' );

				}

				format = `${prefix}x${paddedItemSize}`;

			}

		}

		if ( ! format ) {

			console.error( 'THREE.WebGPURenderer: Vertex format not supported yet.' );

		}

		return format;

	}

}

export default WebGPUAttributeUtils;
