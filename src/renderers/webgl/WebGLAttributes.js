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

		} else {

			var subTypedArrays = [];
			var totalLength = 0;

			for (var i = 0; i<updateRange.length; i++){

				var curUpdateRange = updateRange[i];
				var curOffset = curUpdateRange.offset;
				var curCount = curUpdateRange.count;

				if (curCount != -1 && curCount != 0){

					// Store each subarray in subTypedArrays, we'll concat these arrays later
					subTypedArrays.push(
						array.subarray(curOffset, curOffset + curCount)
					);
					totalLength += curCount;

					if (totalLength > array.length){

						console.error( 'THREE.WebGLObjects.updateBuffer: Tried to update more indices than the size of the buffer.' );
						subTypedArrays = null;
						return;

					}

				} else if (curCount == 0){

					console.error( 'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0 for index '+i+', ensure you are using set methods or updating manually.' );

				}

			}

			if (subTypedArrays.length == 0){

				gl.bufferSubData(bufferType, 0, array);

			}else{

				// This typed array will contain the sub typed arrays
				// After we put this to the WebGL buffer, we'll set this to null to prevent possible memory issues
				var abstractTypedArray = new array.constructor(totalLength);

				// Merge
				var indexOffset = 0;
				for (var x = 0; x<subTypedArrays.length; x++){

						abstractTypedArray.set(subTypedArrays[x], indexOffset);

						indexOffset += subTypedArrays[x].length;

				}

				// Call WebGL
				gl.bufferSubData(bufferType, 0, abstractTypedArray);

				// Reset the updateRange property
				attribute.updateRange = [];

				// Set the references to null so that the GC collects them
				subTypedArrays = null;
				abstractTypedArray = null;

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
