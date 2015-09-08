/**
* @author mrdoob / http://mrdoob.com/
*/

module.exports = WebGLObjects;

var WebGLGeometries = require( "./WebGLGeometries" ),
	BufferAttribute = require( "../../core/BufferAttribute" ),
	BufferGeometry = require( "../../core/BufferGeometry" ),
	Geometry = require( "../../core/Geometry" ),
	InterleavedBufferAttribute = require( "../../core/InterleavedBufferAttribute" );

function WebGLObjects( gl, properties, info ) {

	var geometries = new WebGLGeometries( gl, properties, info );

	//

	function update( object ) {

		// TODO: Avoid updating twice (when using shadowMap). Maybe add frame counter.

		var geometry = geometries.get( object );

		if ( object.geometry instanceof Geometry ) {

			geometry.updateFromObject( object );

		}

		var index = geometry.index;
		var attributes = geometry.attributes;

		if ( index !== null ) {

			updateAttribute( index, gl.ELEMENT_ARRAY_BUFFER );

		}

		var name;

		for ( name in attributes ) {

			updateAttribute( attributes[ name ], gl.ARRAY_BUFFER );

		}

		// morph targets

		var morphAttributes = geometry.morphAttributes;

		var array, i, l;

		for ( name in morphAttributes ) {

			array = morphAttributes[ name ];

			for ( i = 0, l = array.length; i < l; i ++ ) {

				updateAttribute( array[ i ], gl.ARRAY_BUFFER );

			}

		}

		return geometry;

	}

	function updateAttribute( attribute, bufferType ) {

		var data = ( attribute instanceof InterleavedBufferAttribute ) ? attribute.data : attribute;

		var attributeProperties = properties.get( data );

		if ( attributeProperties.__webglBuffer === undefined ) {

			createBuffer( attributeProperties, data, bufferType );

		} else if ( attributeProperties.version !== data.version ) {

			updateBuffer( attributeProperties, data, bufferType );

		}

	}

	function createBuffer( attributeProperties, data, bufferType ) {

		attributeProperties.__webglBuffer = gl.createBuffer();
		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		var usage = data.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		gl.bufferData( bufferType, data.array, usage );

		attributeProperties.version = data.version;

	}

	function updateBuffer( attributeProperties, data, bufferType ) {

		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		if ( data.dynamic === false || data.updateRange.count === - 1 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, data.array );

		} else if ( data.updateRange.count === 0 ) {

			console.error( "WebGLObjects.updateBuffer: dynamic BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually." );

		} else {

			gl.bufferSubData( bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
				data.array.subarray( data.updateRange.offset, data.updateRange.offset + data.updateRange.count ) );

			data.updateRange.count = 0; // reset range

		}

		attributeProperties.version = data.version;

	}

	function getAttributeBuffer( attribute ) {

		if ( attribute instanceof InterleavedBufferAttribute ) {

			return properties.get( attribute.data ).__webglBuffer;

		}

		return properties.get( attribute ).__webglBuffer;

	}

	function getWireframeAttribute( geometry ) {

		var property = properties.get( geometry );

		if ( property.wireframe !== undefined ) {

			return property.wireframe;

		}

		var indices = [];

		var index = geometry.index;
		var attributes = geometry.attributes;
		var position = attributes.position;

		// console.time( "wireframe" );

		var edges, array, a, b, c, i, l;

		if ( index !== null ) {

			edges = {};
			array = index.array;

			for ( i = 0, l = array.length; i < l; i += 3 ) {

				a = array[ i + 0 ];
				b = array[ i + 1 ];
				c = array[ i + 2 ];

				if ( checkEdge( edges, a, b ) ) { indices.push( a, b ); }
				if ( checkEdge( edges, b, c ) ) { indices.push( b, c ); }
				if ( checkEdge( edges, c, a ) ) { indices.push( c, a ); }

			}

		} else {

			array = attributes.position.array;

			for ( i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				a = i + 0;
				b = i + 1;
				c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		// console.timeEnd( "wireframe" );

		var TypeArray = position.count > BufferGeometry.MaxIndex ? Uint32Array : Uint16Array;
		var attribute = new BufferAttribute( new TypeArray( indices ), 1 );

		updateAttribute( attribute, gl.ELEMENT_ARRAY_BUFFER );

		property.wireframe = attribute;

		return attribute;

	}

	function checkEdge( edges, a, b ) {

		var tmp;

		if ( a > b ) {

			tmp = a;
			a = b;
			b = tmp;

		}

		var list = edges[ a ];

		if ( list === undefined ) {

			edges[ a ] = [ b ];
			return true;

		} else if ( list.indexOf( b ) === -1 ) {

			list.push( b );
			return true;

		}

		return false;

	}

	this.getAttributeBuffer = getAttributeBuffer;
	this.getWireframeAttribute = getWireframeAttribute;

	this.update = update;

}
