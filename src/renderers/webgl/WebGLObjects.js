/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute';
import { arrayMax } from '../../utils';
import { WebGLGeometries } from './WebGLGeometries';

function WebGLObjects( gl, attributes, properties, info ) {

	var geometries = new WebGLGeometries( gl, attributes, properties, info );

	//

	function update( object ) {

		// TODO: Avoid updating twice (when using shadowMap). Maybe add frame counter.

		var geometry = geometries.get( object );

		if ( object.geometry.isGeometry ) {

			geometry.updateFromObject( object );

		}

		var index = geometry.index;
		var geometryAttributes = geometry.attributes;

		if ( index !== null ) {

			attributes.update( index, gl.ELEMENT_ARRAY_BUFFER );

		}

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

		return geometry;

	}

	function getWireframeAttribute( geometry ) {

		var property = properties.get( geometry );

		if ( property.wireframe !== undefined ) {

			return property.wireframe;

		}

		var indices = [];

		var index = geometry.index;
		var attributes = geometry.attributes;

		// console.time( 'wireframe' );

		if ( index !== null ) {

			var array = index.array;

			for ( var i = 0, l = array.length; i < l; i += 3 ) {

				var a = array[ i + 0 ];
				var b = array[ i + 1 ];
				var c = array[ i + 2 ];

				indices.push( a, b, b, c, c, a );

			}

		} else {

			var array = attributes.position.array;

			for ( var i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				var a = i + 0;
				var b = i + 1;
				var c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		// console.timeEnd( 'wireframe' );

		var attribute = new ( arrayMax( indices ) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );

		attributes.update( attribute, gl.ELEMENT_ARRAY_BUFFER );

		property.wireframe = attribute;

		return attribute;

	}

	return {

		getWireframeAttribute: getWireframeAttribute,
		update: update

	};

}


export { WebGLObjects };
