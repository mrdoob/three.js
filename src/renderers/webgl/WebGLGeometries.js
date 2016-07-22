import { BufferGeometry } from '../../core/BufferGeometry';

/**
* @author mrdoob / http://mrdoob.com/
*/

function WebGLGeometries ( gl, properties, info ) {
	this.isWebGLGeometries = true;

	var geometries = {};

	function get( object ) {

		var geometry = object.geometry;

		if ( geometries[ geometry.id ] !== undefined ) {

			return geometries[ geometry.id ];

		}

		geometry.addEventListener( 'dispose', onGeometryDispose );

		var buffergeometry;

		if ( (geometry && geometry.isBufferGeometry) ) {

			buffergeometry = geometry;

		} else if ( (geometry && geometry.isGeometry) ) {

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

		if ( buffergeometry.index !== null ) {

			deleteAttribute( buffergeometry.index );

		}

		deleteAttributes( buffergeometry.attributes );

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		// TODO

		var property = properties.get( geometry );

		if ( property.wireframe ) {

			deleteAttribute( property.wireframe );

		}

		properties.delete( geometry );

		var bufferproperty = properties.get( buffergeometry );

		if ( bufferproperty.wireframe ) {

			deleteAttribute( bufferproperty.wireframe );

		}

		properties.delete( buffergeometry );

		//

		info.memory.geometries --;

	}

	function getAttributeBuffer( attribute ) {

		if ( (attribute && attribute.isInterleavedBufferAttribute) ) {

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

		if ( (attribute && attribute.isInterleavedBufferAttribute) ) {

			properties.delete( attribute.data );

		} else {

			properties.delete( attribute );

		}

	}

	this.get = get;

};


export { WebGLGeometries };