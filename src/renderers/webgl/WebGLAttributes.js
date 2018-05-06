/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLAttributes( gl ) {

	var buffers = {};

	function createBuffer( attribute, bufferType ) {

		var array = attribute.array;
		var usage = attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		var buffer = gl.createBuffer();

		gl.bindBuffer( bufferType, buffer );
		gl.bufferData( bufferType, array, usage );

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

	function updateBuffer( buffer, attribute, bufferType ) {

		var array = attribute.array;
		var updateRange = attribute.updateRange;

		gl.bindBuffer( bufferType, buffer );

		if ( attribute.dynamic === false ) {

			gl.bufferData( bufferType, array, gl.STATIC_DRAW );

		} else if ( typeof updateRange.offset == "undefined" &&
																	typeof updateRange.count == "undefined" ){

			// updateRange is an array of {offset: x, count: y}

			for ( var i = 0; i < updateRange.length; i++ ) {

				var curCount = updateRange[ i ].count;
				var curOffset = updateRange[ i ].offset;

				if ( curCount != 0 && curCount != -1 ) {

					if ( curOffset >= array.length || curCount > array.length ) {

						console.error ( 'THREE.WebGLObjects.updateBuffer: Buffer overflow.' );

					} else {

						gl.bufferSubData(
							bufferType, curOffset * array.BYTES_PER_ELEMENT,
							array.subarray( curOffset, curOffset + curCount )
						);

					}

				} else if ( updateRange == 0 ) {

					console.error( 'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0 for index '+ i +', ensure you are using set methods or updating manually.' );

				}

			}

			if ( ! updateRange ) {

				gl.bufferSubData( bufferType, 0, array );

			}

			// Reset update ranges
			attribute.updateRange = [ ];

		} else {

			// updateRange is {offset: x, count: y}

			if ( updateRange.count === -1 )  {

				// Not using update ranges

				gl.bufferSubData( bufferType, 0, array );

			} else if ( updateRange.count === 0 ) {

				console.error( 'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.' );

			} else {

				gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
							array.subarray( updateRange.offset, updateRange.offset + updateRange.count ) );

				updateRange.count = -1; // reset range

			}

		}

	}

	//

	function get( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return buffers[ attribute.uuid ];

	}

	function remove( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = buffers[ attribute.uuid ];

		if ( data ) {

			gl.deleteBuffer( data.buffer );

			delete buffers[ attribute.uuid ];

		}

	}

	function update( attribute, bufferType ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = buffers[ attribute.uuid ];

		if ( data === undefined ) {

			buffers[ attribute.uuid ] = createBuffer( attribute, bufferType );

		} else if ( data.version < attribute.version ) {

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
