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
		var buffergeometry = geometries[ geometry.id ];

		for ( var name in buffergeometry.attributes ) {

			var attribute = buffergeometry.attributes[ name ];

			if ( attribute.buffer !== undefined ) {

				gl.deleteBuffer( attribute.buffer );

				delete attribute.buffer;

			}

		}

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		info.memory.geometries --;

	}

};
