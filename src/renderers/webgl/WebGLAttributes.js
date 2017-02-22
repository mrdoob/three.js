/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLAttributes( gl ) {

	var buffers = {};

	function createBuffer( attribute, bufferType ) {

		var buffer = gl.createBuffer();

		gl.bindBuffer( bufferType, buffer );

		var array = attribute.array;
		var usage = attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		gl.bufferData( bufferType, array, usage );

		attribute.onUploadCallback();

		var type = gl.FLOAT;

		if ( array instanceof Float32Array ) {

			type = gl.FLOAT;

		} else if ( array instanceof Float64Array ) {

			console.warn( "Unsupported data buffer format: Float64Array" );

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

	function updateBuffer( buffer, attribute, bufferType ) {

		gl.bindBuffer( bufferType, buffer );

		if ( attribute.dynamic === false ) {

			gl.bufferData( bufferType, attribute.array, gl.STATIC_DRAW );

		} else if ( attribute.updateRange.count === - 1 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, attribute.array );

		} else if ( attribute.updateRange.count === 0 ) {

			console.error( 'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.' );

		} else {

			gl.bufferSubData( bufferType, attribute.updateRange.offset * attribute.array.BYTES_PER_ELEMENT,
							  attribute.array.subarray( attribute.updateRange.offset, attribute.updateRange.offset + attribute.updateRange.count ) );

			attribute.updateRange.count = 0; // reset range

		}



	}

	//

	function get( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return buffers[ attribute.id ];

	}

	function remove( attribute ) {

		var data = buffers[ attribute.id ];

		if ( data ) {

			gl.deleteBuffer( data.buffer );

			delete buffers[ attribute.id ];

		}

	}

	function update( attribute, bufferType ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = buffers[ attribute.id ];

		if ( data === undefined ) {

			buffers[ attribute.id ] = createBuffer( attribute, bufferType );

		} else if ( data.version !== attribute.version ) {

			updateBuffer( data.buffer, attribute, bufferType );
			data.version = attribute.version;

		}

	}

	return {

		get: get,
		remove: remove,
		update: update

	};

}


export { WebGLAttributes };
