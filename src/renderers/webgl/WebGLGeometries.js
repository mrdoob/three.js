/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { arrayMax } from '../../utils.js';

function WebGLGeometries( gl, attributes, info, bindingStates ) {

	var geometries = new WeakMap();
	var wireframeAttributes = new WeakMap();

	function onGeometryDispose( event ) {

		var geometry = event.target;
		var buffergeometry = geometries.get( geometry );

		if ( buffergeometry.index !== null ) {

			attributes.remove( buffergeometry.index );

		}

		for ( var name in buffergeometry.attributes ) {

			attributes.remove( buffergeometry.attributes[ name ] );

		}

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		geometries.delete( geometry );

		var attribute = wireframeAttributes.get( buffergeometry );

		if ( attribute ) {

			attributes.remove( attribute );
			wireframeAttributes.delete( buffergeometry );

		}

		bindingStates.releaseStatesOfGeometry( geometry );

		//

		info.memory.geometries --;

	}

	function get( object, geometry ) {

		var buffergeometry = geometries.get( geometry );

		if ( buffergeometry ) return buffergeometry;

		geometry.addEventListener( 'dispose', onGeometryDispose );

		if ( geometry.isBufferGeometry ) {

			buffergeometry = geometry;

		} else if ( geometry.isGeometry ) {

			if ( geometry._bufferGeometry === undefined ) {

				geometry._bufferGeometry = new BufferGeometry().setFromObject( object );

			}

			buffergeometry = geometry._bufferGeometry;

		}

		geometries.set( geometry, buffergeometry );

		info.memory.geometries ++;

		return buffergeometry;

	}

	function update( geometry ) {

		var geometryAttributes = geometry.attributes;

		// Updating index buffer in VAO now. See WebGLBindingStates.

		for ( var name in geometryAttributes ) {

			attributes.update( geometryAttributes[ name ], gl.ARRAY_BUFFER );

		}

		// morph targets

		var morphAttributes = geometry.morphAttributes;

		for ( var name in morphAttributes ) {

			var array = morphAttributes[ name ];

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				attributes.update( array[ i ], gl.ARRAY_BUFFER );

			}

		}

	}

	function updateWireframeAttribute( geometry ) {

		var indices = [];

		var geometryIndex = geometry.index;
		var geometryPosition = geometry.attributes.position;
		var version = 0;

		if ( geometryIndex !== null ) {

			var array = geometryIndex.array;
			version = geometryIndex.version;

			for ( var i = 0, l = array.length; i < l; i += 3 ) {

				var a = array[ i + 0 ];
				var b = array[ i + 1 ];
				var c = array[ i + 2 ];

				indices.push( a, b, b, c, c, a );

			}

		} else {

			var array = geometryPosition.array;
			version = geometryPosition.version;

			for ( var i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				var a = i + 0;
				var b = i + 1;
				var c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		var attribute = new ( arrayMax( indices ) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );
		attribute.version = version;

		// Updating index buffer in VAO now. See WebGLBindingStates

		//

		var previousAttribute = wireframeAttributes.get( geometry );

		if ( previousAttribute ) attributes.remove( previousAttribute );

		//

		wireframeAttributes.set( geometry, attribute );

	}

	function getWireframeAttribute( geometry ) {

		var currentAttribute = wireframeAttributes.get( geometry );

		if ( currentAttribute ) {

			var geometryIndex = geometry.index;

			if ( geometryIndex !== null ) {

				// if the attribute is obsolete, create a new one

				if ( currentAttribute.version < geometryIndex.version ) {

					updateWireframeAttribute( geometry );

				}

			}

		} else {

			updateWireframeAttribute( geometry );

		}

		return wireframeAttributes.get( geometry );

	}

	return {

		get: get,
		update: update,

		getWireframeAttribute: getWireframeAttribute

	};

}


export { WebGLGeometries };
