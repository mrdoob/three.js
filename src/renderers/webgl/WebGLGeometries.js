/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { arrayMax } from '../../utils.js';

function WebGLGeometries( gl, attributes, info ) {

	var geometries = {};
	var wireframeAttributes = {};

	function onGeometryDispose( event ) {

		var geometry = event.target;
		var geometryData = geometries[ geometry.id ];
		var lastSeenAttributeIds = geometryData.lastSeenAttributeIds;
		var buffergeometry = geometryData.buffergeometry;
		var index = buffergeometry.index;
		var hasSeenThisAttribute;

		if ( index !== null ) {

			hasSeenThisAttribute = index.id === geometryData.lastSeenIndexId;

			if ( hasSeenThisAttribute ) {

				attributes.unref( index );

			}

		}

		for ( var name in buffergeometry.attributes ) {

			var attribute = buffergeometry.attributes[ name ];
			hasSeenThisAttribute = attribute.id === lastSeenAttributeIds[ name ];

			if ( hasSeenThisAttribute ) {

				attributes.unref( buffergeometry.attributes[ name ] );

			}

		}

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		var attribute = wireframeAttributes[ buffergeometry.id ];

		if ( attribute ) {

			attributes.unref( wireframeAttributes[ buffergeometry.id ] );
			delete wireframeAttributes[ buffergeometry.id ];

		}

		//

		info.memory.geometries --;

	}

	function get( object, geometry ) {

		var geometryData = geometries[ geometry.id ];

		if ( geometryData ) return geometryData;

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

		geometryData = {
			buffergeometry: buffergeometry,
			lastSeenAttributeIds: {},
			lastSeenMorphAttributeIds: {},
			lastSeenIndexId: undefined,
		};
		geometries[ geometry.id ] = geometryData;

		info.memory.geometries ++;

		return geometryData;

	}

	function update( geometryData ) {

		var geometry = geometryData.buffergeometry;
		var lastSeenAttributeIds = geometryData.lastSeenAttributeIds;
		var lastSeenMorphAttributeIds = geometryData.lastSeenMorphAttributeIds;
		var index = geometry.index;
		var geometryAttributes = geometry.attributes;
		var hasSeenThisAttribute;

		if ( index !== null ) {

			hasSeenThisAttribute = index.id === geometryData.lastSeenIndexId;
			attributes.update( index, gl.ELEMENT_ARRAY_BUFFER, hasSeenThisAttribute );
			geometryData.lastSeenIndexId = index.id;

		}

		for ( var name in geometryAttributes ) {

			var attribute = geometryAttributes[ name ];
			hasSeenThisAttribute = attribute.id === lastSeenAttributeIds[ name ];
			attributes.update( attribute, gl.ARRAY_BUFFER, hasSeenThisAttribute );
			lastSeenAttributeIds[ name ] = attribute.id;

		}

		// morph targets

		var morphAttributes = geometry.morphAttributes;

		for ( var name in morphAttributes ) {

			var array = morphAttributes[ name ];
			var lastSeen = lastSeenMorphAttributeIds[ name ];
			if ( ! lastSeen ) {

				lastSeen = [];
				lastSeenMorphAttributeIds[ name ] = lastSeen;

			}

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				var attribute = array[ i ];
				hasSeenThisAttribute = attribute.id === lastSeen[ i ];
				attributes.update( attribute, gl.ARRAY_BUFFER, hasSeenThisAttribute );
				lastSeen[ i ] = attribute.id;

			}

		}

	}

	function getWireframeAttribute( geometry ) {

		var attribute = wireframeAttributes[ geometry.id ];

		if ( attribute ) return attribute;

		var indices = [];

		var geometryIndex = geometry.index;
		var geometryAttributes = geometry.attributes;

		// console.time( 'wireframe' );

		if ( geometryIndex !== null ) {

			var array = geometryIndex.array;

			for ( var i = 0, l = array.length; i < l; i += 3 ) {

				var a = array[ i + 0 ];
				var b = array[ i + 1 ];
				var c = array[ i + 2 ];

				indices.push( a, b, b, c, c, a );

			}

		} else {

			var array = geometryAttributes.position.array;

			for ( var i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				var a = i + 0;
				var b = i + 1;
				var c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		// console.timeEnd( 'wireframe' );

		attribute = new ( arrayMax( indices ) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );

		attributes.update( geometry, attribute, gl.ELEMENT_ARRAY_BUFFER, true );

		wireframeAttributes[ geometry.id ] = attribute;

		return attribute;

	}

	return {

		get: get,
		update: update,

		getWireframeAttribute: getWireframeAttribute

	};

}


export { WebGLGeometries };
