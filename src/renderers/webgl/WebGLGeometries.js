/**
* @author mrdoob / http://mrdoob.com/
*/

module.exports = WebGLGeometries;

var BufferGeometry = require( "../../core/BufferGeometry" ),
	Geometry = require( "../../core/Geometry" ),
	InterleavedBufferAttribute = require( "../../core/InterleavedBufferAttribute" );

function WebGLGeometries( gl, properties, info ) {

	var geometries = {};

	function get( object ) {

		var geometry = object.geometry;

		if ( geometries[ geometry.id ] !== undefined ) {

			return geometries[ geometry.id ];

		}

		geometry.addEventListener( "dispose", onGeometryDispose );

		var buffergeometry;

		if ( geometry instanceof BufferGeometry ) {

			buffergeometry = geometry;

		} else if ( geometry instanceof Geometry ) {

			if ( geometry._bufferGeometry === undefined ) {

				geometry._bufferGeometry = new BufferGeometry().setFromObject( object );

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

		geometry.removeEventListener( "dispose", onGeometryDispose );

		delete geometries[ geometry.id ];

		var property = properties.get( geometry );
		if ( property.wireframe ) { deleteAttribute( property.wireframe ); }

		info.memory.geometries --;

	}

	function getAttributeBuffer( attribute ) {

		if ( attribute instanceof InterleavedBufferAttribute ) {

			return properties.get( attribute.data ).__webglBuffer;

		}

		return properties.get( attribute ).__webglBuffer;

	}

	function deleteAttribute( attribute ) {

		var buffer = getAttributeBuffer( attribute );

		if ( buffer !== undefined ) {

			gl.deleteBuffer( buffer );
			removeAttributeBuffer( attribute );

		}

	}

	function deleteAttributes( attributes ) {

		for ( var name in attributes ) {

			deleteAttribute( attributes[ name ] );

		}

	}

	function removeAttributeBuffer( attribute ) {

		if ( attribute instanceof InterleavedBufferAttribute ) {

			properties.delete( attribute.data );

		} else {

			properties.delete( attribute );

		}

	}

	this.get = get;

}
