/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLGeometries = function ( gl, properties, info ) {

	var geometries = {};

	this.get = function ( object ) {

		var geometry = object.geometry;

		if ( geometries[ geometry.id ] !== undefined ) {

			return geometries[ geometry.id ];

		}

		geometry.addEventListener( 'dispose', onGeometryDispose );

		var buffergeometry;

		if ( geometry instanceof THREE.BufferGeometry ) {

			buffergeometry = geometry;

		} else if ( geometry instanceof THREE.Geometry ) {

			if ( geometry._bufferGeometry === undefined ) {

				geometry._bufferGeometry = new THREE.BufferGeometry().setFromObject( object );

			}

			buffergeometry = geometry._bufferGeometry;

		}

		if ( object instanceof THREE.Mesh ) {

			buffergeometry.addAttribute( 'wireframe', createWireframeIndexBuffer( buffergeometry ) );

		}

		geometries[ geometry.id ] = buffergeometry;

		info.memory.geometries ++;

		return buffergeometry;

	};

	function createWireframeIndexBuffer( geometry ) {

		var attributes = geometry.attributes;

		// create wireframe indices

		var indices = [];

		var index = attributes.index;
		var position = attributes.position;

		if ( index !== undefined ) {

			var array = index.array;

			for ( var i = 0, j = 0, l = array.length; i < l; i += 3 ) {

				var a = array[ i + 0 ];
				var b = array[ i + 1 ];
				var c = array[ i + 2 ];

				// TODO: Check for duplicates

				indices.push( a, b, b, c, c, a );

			}

		} else {

			var array = position.array;

			for ( var i = 0, j = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				var a = i + 0;
				var b = i + 1;
				var c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		var TypeArray = position.array.length > 65535 ? Uint32Array : Uint16Array;

		return new THREE.BufferAttribute( new TypeArray( indices ), 1 );

	}

	function onGeometryDispose( event ) {

		var geometry = event.target;
		var buffergeometry = geometries[ geometry.id ];

		deleteAttributes( buffergeometry.attributes );

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		info.memory.geometries --;

	}

	function getAttributeBuffer( attribute ) {

		if ( attribute instanceof THREE.InterleavedBufferAttribute ) {

			return properties.get( attribute.data ).__webglBuffer;

		}

		return properties.get( attribute ).__webglBuffer;

	}

	function deleteAttributes( attributes ) {

		for ( var name in attributes ) {

			var attribute = attributes[ name ];
			var buffer = getAttributeBuffer( attribute );

			if ( buffer !== undefined ) {

				gl.deleteBuffer( buffer );
				removeAttributeBuffer( attribute );

			}

		}

	}

	function removeAttributeBuffer( attribute ) {

		if ( attribute instanceof THREE.InterleavedBufferAttribute ) {

			properties.delete( attribute.data );

		} else {

			properties.delete( attribute );

		}

	}

};
