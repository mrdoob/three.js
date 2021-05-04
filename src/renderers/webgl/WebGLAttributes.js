function WebGLAttributes( gl, capabilities ) {

	const isWebGL2 = capabilities.isWebGL2;

	const buffers = new WeakMap();

	function getGLType( attribute, array ) {

		if ( array instanceof Float32Array ) {

			return gl.FLOAT;

		} else if ( array instanceof Float64Array ) {

			console.warn( 'THREE.WebGLAttributes: Unsupported data buffer format: Float64Array.' );

		} else if ( array instanceof Uint16Array ) {

			if ( attribute.isFloat16BufferAttribute ) {

				if ( isWebGL2 ) {

					return gl.HALF_FLOAT;

				} else {

					console.warn( 'THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.' );

				}

			} else {

				return gl.UNSIGNED_SHORT;

			}

		} else if ( array instanceof Int16Array ) {

			return gl.SHORT;

		} else if ( array instanceof Uint32Array ) {

			return gl.UNSIGNED_INT;

		} else if ( array instanceof Int32Array ) {

			return gl.INT;

		} else if ( array instanceof Int8Array ) {

			return gl.BYTE;

		} else if ( array instanceof Uint8Array ) {

			return gl.UNSIGNED_BYTE;

		}

		return gl.FLOAT;

	}

	function createBuffer( attribute, bufferType ) {

		const array = attribute.array;
		const usage = attribute.usage;

		const buffer = gl.createBuffer();

		gl.bindBuffer( bufferType, buffer );
		gl.bufferData( bufferType, array, usage );

		attribute.onUploadCallback();

		return {
			buffer: buffer,
			type: getGLType( attribute, array ),
			bytesPerElement: array.BYTES_PER_ELEMENT,
			version: attribute.version
		};

	}

	function updateBuffer( buffer, attribute, bufferType ) {

		const array = attribute.array;
		const updateRange = attribute.updateRange;

		gl.bindBuffer( bufferType, buffer );

		if ( updateRange.count === - 1 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, array );

		} else {

			if ( isWebGL2 ) {

				gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
					array, updateRange.offset, updateRange.count );

			} else {

				gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
					array.subarray( updateRange.offset, updateRange.offset + updateRange.count ) );

			}

			updateRange.count = - 1; // reset range

		}

	}

	//

	function get( attribute ) {

		return buffers.get( attribute );

	}

	function remove( attribute ) {

		if ( ! buffers.has( attribute ) ) return;

		const data = buffers.get( attribute );

		buffers.delete( attribute );

		if ( attribute.isInterleavedBufferAttribute ) {

			data.data.count --;

			if ( data.data.count === 0 ) {

				buffers.delete( attribute.data );

				gl.deleteBuffer( data.buffer );

			}

		} else {

			gl.deleteBuffer( data.buffer );

		}

	}

	function update( attribute, bufferType ) {

		if ( attribute.isGLBufferAttribute ) {

			const cached = buffers.get( attribute );

			if ( ! cached || cached.version < attribute.version ) {

				buffers.set( attribute, {
					buffer: attribute.buffer,
					type: attribute.type,
					bytesPerElement: attribute.elementSize,
					version: attribute.version
				} );

			}

			return;

		}

		const attributeData = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;

		let data = buffers.get( attributeData );

		if ( data === undefined ) {

			data = createBuffer( attributeData, bufferType );

			buffers.set( attributeData, data );

		} else if ( data.version < attributeData.version ) {

			updateBuffer( data.buffer, attributeData, bufferType );

			data.version = attributeData.version;

		}

		// For InterleavedBufferAttribute
		if ( ! buffers.has( attribute ) ) {

			// reference count for shared interleaved buffer
			data.count = ( data.count || 0 ) + 1;

			buffers.set( attribute, {
				buffer: data.buffer,
				data: data,
				type: getGLType( attribute, attribute.array ),
				bytesPerElement: attribute.array.BYTES_PER_ELEMENT,
			} );

		}

	}

	return {

		get: get,
		remove: remove,
		update: update

	};

}


export { WebGLAttributes };
