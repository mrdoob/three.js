/**
 * @author mrdoob / http://mrdoob.com/
 */

class WebGLAttributes {

	constructor( gl, capabilities ) {

		this.isWebGL2 = capabilities.isWebGL2;

		this.gl = gl;

		this.buffers = new WeakMap();

	}

	createBuffer( attribute, bufferType ) {

		var array = attribute.array;
		var usage = attribute.usage;

		var buffer = this.gl.createBuffer();

		this.gl.bindBuffer( bufferType, buffer );
		this.gl.bufferData( bufferType, array, usage );

		attribute.onUploadCallback();

		var type = gl.FLOAT;

		if ( array instanceof Float32Array ) {

			type = gl.FLOAT;

		} else if ( array instanceof Float64Array ) {

			console.warn( 'THREE.WebGLAttributes: Unsupported data buffer format: Float64Array.' );

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

		}

		return {
			buffer: buffer,
			type: type,
			bytesPerElement: array.BYTES_PER_ELEMENT,
			version: attribute.version
		};

	}

	updateBuffer( buffer, attribute, bufferType ) {

		var array = attribute.array;
		var updateRange = attribute.updateRange;

		this.gl.bindBuffer( bufferType, buffer );

		if ( updateRange.count === - 1 ) {

			// Not using update ranges

			this.gl.bufferSubData( bufferType, 0, array );

		} else {

			if ( this.isWebGL2 ) {

				this.gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
					array, updateRange.offset, updateRange.count );

			} else {

				this.gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
					array.subarray( updateRange.offset, updateRange.offset + updateRange.count ) );

			}

			updateRange.count = - 1; // reset range

		}

	}

	get( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return this.buffers.get( attribute );

	}

	remove( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = this.buffers.get( attribute );

		if ( data ) {

			this.gl.deleteBuffer( data.buffer );

			this.buffers.delete( attribute );

		}

	}

	update( attribute, bufferType ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = this.buffers.get( attribute );

		if ( data === undefined ) {

			this.buffers.set( attribute, this.createBuffer( attribute, bufferType ) );

		} else if ( data.version < attribute.version ) {

			this.updateBuffer( data.buffer, attribute, bufferType );

			data.version = attribute.version;

		}

	}

}


export { WebGLAttributes };
