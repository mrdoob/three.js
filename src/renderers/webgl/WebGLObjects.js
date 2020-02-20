/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLObjects( gl, geometries, attributes, info ) {

	var updateMap = new WeakMap();

	function update( object ) {

		var frame = info.render.frame;

		var geometry = object.geometry;
		var buffergeometry = geometries.get( object, geometry );

		// Update once per frame

		if ( updateMap.get( buffergeometry ) !== frame ) {

			if ( geometry.isGeometry ) {

				buffergeometry.updateFromObject( object );

			}

			geometries.update( buffergeometry );

			updateMap.set( buffergeometry, frame );

		}

		if ( object.isInstancedMesh ) {

			attributes.update( object.instanceMatrix, gl.ARRAY_BUFFER );

		}

		return buffergeometry;

	}

	function dispose() {

		updateMap = new WeakMap();

	}

	return {

		update: update,
		dispose: dispose

	};

}


export { WebGLObjects };
