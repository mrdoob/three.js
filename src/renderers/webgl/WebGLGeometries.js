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

		} else if ( geometry instanceof THREE.Geometry ) {

			if ( object._bufferGeometry === undefined ) {

				object._bufferGeometry = new THREE.BufferGeometry().setFromObject( object );

			}

			geometries[ geometry.id ] = object._bufferGeometry;

		}

		info.memory.geometries ++;

		return geometries[ geometry.id ];

	};

	function onGeometryDispose( event ) {

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		delete geometries[ geometry.id ];

		info.memory.geometries --;

	}

};
