/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLAttributes( gl, properties ) {

	function createBuffer( attributeProperties, data, bufferType ) {

		attributeProperties.__webglBuffer = gl.createBuffer();
		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		var usage = data.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		gl.bufferData( bufferType, data.array, usage );

		var type = gl.FLOAT;
		var array = data.array;

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

		attributeProperties.bytesPerElement = array.BYTES_PER_ELEMENT;
		attributeProperties.type = type;
		attributeProperties.version = data.version;

		data.onUploadCallback();

	}

	function updateBuffer( attributeProperties, data, bufferType ) {

		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		if ( data.dynamic === false ) {

			gl.bufferData( bufferType, data.array, gl.STATIC_DRAW );

		} else if ( data.updateRange.count === - 1 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, data.array );

		} else if ( data.updateRange.count === 0 ) {

			console.error( 'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.' );

		} else {

			gl.bufferSubData( bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
							  data.array.subarray( data.updateRange.offset, data.updateRange.offset + data.updateRange.count ) );

			data.updateRange.count = 0; // reset range

		}

		attributeProperties.version = data.version;

	}

	//

	function get( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) {

			return properties.get( attribute.data );

		}

		return properties.get( attribute );

	}

	function remove( attribute ) {

		var attributeProperties = get( attribute );

		if ( attributeProperties.__webglBuffer !== undefined ) {

			gl.deleteBuffer( attributeProperties.__webglBuffer );
			properties.remove( attributeProperties );

		}

	}

	function update( attribute, bufferType ) {

		var data = ( attribute.isInterleavedBufferAttribute ) ? attribute.data : attribute;

		var attributeProperties = properties.get( data );

		if ( attributeProperties.__webglBuffer === undefined ) {

			createBuffer( attributeProperties, data, bufferType );

		} else if ( attributeProperties.version !== data.version ) {

			updateBuffer( attributeProperties, data, bufferType );

		}

	}

	return {

		get: get,
		remove: remove,
		update: update

	};

}


export { WebGLAttributes };
