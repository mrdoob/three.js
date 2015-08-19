/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLGeometries = function ( gl, properties, info ) {

	var geometries = {};

	function get( object ) {

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

		geometries[ geometry.id ] = buffergeometry;

		info.memory.geometries ++;

		return buffergeometry;

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

	this.get = get;

};
