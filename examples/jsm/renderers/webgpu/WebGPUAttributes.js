import { DynamicDrawUsage } from "three";

class WebGPUAttributes {

	constructor( device ) {

		this.buffers = new WeakMap();
		this.device = device;

	}

	get( attribute ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		return this.buffers.get( bufferAttribute );

	}

	remove( attribute ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const data = this.buffers.get( bufferAttribute );

		if ( data ) {

			this._destroyBuffers( data );

			this.buffers.delete( bufferAttribute );

		}

	}

	update( attribute, isIndex = false, gpuUsage = null ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		let data = this.buffers.get( bufferAttribute );

		if ( data === undefined ) {

			if ( gpuUsage === null ) {

				gpuUsage = ( isIndex === true ) ? GPUBufferUsage.INDEX : GPUBufferUsage.VERTEX;

			}

			data = this._createBuffer( bufferAttribute, gpuUsage );

			this.buffers.set( bufferAttribute, data );

		} else if ( gpuUsage && gpuUsage !== data.usage ) {

			this._destroyBuffers( data );

			data = this._createBuffer( bufferAttribute, gpuUsage );

			this.buffers.set( bufferAttribute, data );

		} else if ( data.version < bufferAttribute.version || bufferAttribute.usage === DynamicDrawUsage ) {

			this._writeBuffer( data.buffer, bufferAttribute );

			data.version = bufferAttribute.version;

		}

	}

	async getArrayBuffer( attribute ) {

		const data = this.get( attribute );
		const device = this.device;

		const gpuBuffer = data.buffer;
		const size = gpuBuffer.size;

		let gpuReadBuffer = data.readBuffer;
		let needsUnmap = true;

		if ( gpuReadBuffer === null ) {

			gpuReadBuffer = device.createBuffer( {
				label: attribute.name,
				size,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			} );

			needsUnmap = false;

			data.readBuffer = gpuReadBuffer;

		}

		const cmdEncoder = device.createCommandEncoder( {} );

		cmdEncoder.copyBufferToBuffer(
			gpuBuffer,
			0,
			gpuReadBuffer,
			0,
			size
		);

		if ( needsUnmap ) gpuReadBuffer.unmap();

		const gpuCommands = cmdEncoder.finish();
		device.queue.submit( [ gpuCommands ] );

		await gpuReadBuffer.mapAsync( GPUMapMode.READ );

		const arrayBuffer = gpuReadBuffer.getMappedRange();

		return arrayBuffer;

	}

	_getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

	_createBuffer( bufferAttribute, usage ) {

		const array = bufferAttribute.array;
		const size = array.byteLength + ( ( 4 - ( array.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

		const buffer = this.device.createBuffer( {
			label: bufferAttribute.name,
			size,
			usage: usage | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		} );

		new array.constructor( buffer.getMappedRange() ).set( array );

		buffer.unmap();

		bufferAttribute.onUploadCallback();

		return {
			version: bufferAttribute.version,
			buffer,
			readBuffer: null,
			usage
		};

	}

	_writeBuffer( buffer, attribute ) {

		const device = this.device;

		const array = attribute.array;
		const updateRange = attribute.updateRange;

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

	_destroyBuffers( { buffer, readBuffer } ) {

		buffer.destroy();

		if ( readBuffer !== null ) readBuffer.destroy();

	}

}

export default WebGPUAttributes;
