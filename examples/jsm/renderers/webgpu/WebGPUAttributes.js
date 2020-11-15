class WebGPUAttributes {

	constructor( device ) {

		this.buffers = new WeakMap();
		this.device = device;

	}

	get( attribute ) {

		return this.buffers.get( attribute );

	}

	remove( attribute ) {

		const data = this.buffers.get( attribute );

		if ( data ) {

			data.buffer.destroy();

			this.buffers.delete( attribute );

		}

	}

	update( attribute, isIndex = false, usage = null ) {

		let data = this.buffers.get( attribute );

		if ( data === undefined ) {

			if ( usage === null ) {

				usage = ( isIndex === true ) ? GPUBufferUsage.INDEX : GPUBufferUsage.VERTEX;

			}

			data = this._createBuffer( attribute, usage );

			this.buffers.set( attribute, data );

		} else if ( usage && usage !== data.usage ) {

			data.buffer.destroy();

			data = this._createBuffer( attribute, usage );

			this.buffers.set( attribute, data );

		} else if ( data.version < attribute.version ) {

			this._writeBuffer( data.buffer, attribute );

			data.version = attribute.version;

		}

	}

	_createBuffer( attribute, usage ) {

		const array = attribute.array;
		const size = array.byteLength + ( ( 4 - ( array.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

		const buffer = this.device.createBuffer( {
			size: size,
			usage: usage | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		} );

		new array.constructor( buffer.getMappedRange() ).set( array );

		buffer.unmap();

		attribute.onUploadCallback();

		return {
			version: attribute.version,
			buffer: buffer,
			usage: usage
		};

	}

	_writeBuffer( buffer, attribute ) {

		const array = attribute.array;
		const updateRange = attribute.updateRange;

		if ( updateRange.count === - 1 ) {

			// Not using update ranges

			this.device.defaultQueue.writeBuffer(
				buffer,
				0,
				array,
				0
			);

		} else {

			this.device.defaultQueue.writeBuffer(
				buffer,
				0,
				array,
				updateRange.offset * array.BYTES_PER_ELEMENT,
				updateRange.count * array.BYTES_PER_ELEMENT
			);

			updateRange.count = - 1; // reset range

		}

	}

}

export default WebGPUAttributes;
