/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLGeometries = function ( gl, info ) {

	var geometries = {};

	this.get = function ( object ) {

		var geometry = object.geometry;

		if ( geometries[ geometry.id ] !== undefined ) {

			return geometries[ geometry.id ];

		}

		geometry.addEventListener( 'dispose', onGeometryDispose );

		if ( geometry instanceof THREE.BufferGeometry ) {

			geometries[ geometry.id ] = geometry;

		} else {

			geometries[ geometry.id ] = new THREE.BufferGeometry().setFromObject( object );

		}

		info.memory.geometries ++;

		return geometries[ geometry.id ];

	};

	function onGeometryDispose( event ) {

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		geometry = geometries[ geometry.id ];

		for ( var name in geometry.attributes ) {

			var attribute = geometry.attributes[ name ];

			if ( attribute.buffer !== undefined ) {

				gl.deleteBuffer( attribute.buffer );

				delete attribute.buffer;

			}

		}

		info.memory.geometries --;

	}

};
