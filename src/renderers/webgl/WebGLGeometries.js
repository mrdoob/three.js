/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BufferGeometry } from '../../core/BufferGeometry';

function WebGLGeometries( gl, attributes, properties, info ) {

	var geometries = {};

	function onGeometryDispose( event ) {

		var geometry = event.target;
		var buffergeometry = geometries[ geometry.id ];

		if ( buffergeometry.index !== null ) {

			attributes.remove( buffergeometry.index );

		}

		for ( var name in buffergeometry.attributes ) {

			attributes.remove( buffergeometry.attributes[ name ] );

		}

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		// TODO

		var property = properties.get( geometry );

		if ( property.wireframe ) {

			attributes.remove( property.wireframe );

		}

		properties.remove( geometry );

		var bufferproperty = properties.get( buffergeometry );

		if ( bufferproperty.wireframe ) {

			attributes.remove( bufferproperty.wireframe );

		}

		properties.remove( buffergeometry );

		//

		info.memory.geometries --;

	}

	return {

		get: function ( object ) {

			var geometry = object.geometry;

			if ( geometries[ geometry.id ] !== undefined ) {

				return geometries[ geometry.id ];

			}

			geometry.addEventListener( 'dispose', onGeometryDispose );

			var buffergeometry;

			if ( geometry.isBufferGeometry ) {

				buffergeometry = geometry;

			} else if ( geometry.isGeometry ) {

				if ( geometry._bufferGeometry === undefined ) {

					geometry._bufferGeometry = new BufferGeometry().setFromObject( object );

				}

				buffergeometry = geometry._bufferGeometry;

			}

			geometries[ geometry.id ] = buffergeometry;

			info.memory.geometries ++;

			return buffergeometry;

		}

	};

}


export { WebGLGeometries };
