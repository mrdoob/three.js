class WebGPUAttributes {

	constructor( device ) {

		this.buffers = new WeakMap();
		this.device = device;

	}

	get( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return this.buffers.get( attribute );

	}

	remove( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		const data = this.buffers.get( attribute );

		if ( data ) {

			this._destroyBuffers( data );

			this.buffers.delete( attribute );

		}

	}

	update( attribute, isIndex = false, usage = null ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		let data = this.buffers.get( attribute );

		if ( data === undefined ) {

			if ( usage === null ) {

				usage = ( isIndex === true ) ? GPUBufferUsage.INDEX : GPUBufferUsage.VERTEX;

			}

			data = this._createBuffer( attribute, usage );

			this.buffers.set( attribute, data );

		} else if ( usage && usage !== data.usage ) {

			this._destroyBuffers( data );

			data = this._createBuffer( attribute, usage );

			this.buffers.set( attribute, data );

		} else if ( data.version < attribute.version ) {

			this._writeBuffer( data.buffer, attribute );

			data.version = attribute.version;

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

	_createBuffer( attribute, usage ) {

		const array = attribute.array;
		const size = array.byteLength + ( ( 4 - ( array.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

		const buffer = this.device.createBuffer( {
			size,
			usage: usage | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		} );

		new array.constructor( buffer.getMappedRange() ).set( array );

		buffer.unmap();

		attribute.onUploadCallback();

		return {
			version: attribute.version,
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
