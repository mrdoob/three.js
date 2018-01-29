/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLObjects( geometries, infoRender ) {

	var updateList = {};

	function update( object ) {

		var frame = infoRender.frame;

		var geometry = object.geometry;
		var buffergeometry = geometries.get( object, geometry );

		// Update once per frame

		if ( updateList[ buffergeometry.id ] !== frame ) {

			if ( geometry.isGeometry ) {

				buffergeometry.updateFromObject( object );

			}

			geometries.update( buffergeometry );

			updateList[ buffergeometry.id ] = frame;

		}

		return buffergeometry;

	}

	function dispose() {

		updateList = {};

	}

	return {

		update: update,
		dispose: dispose

	};

}


export { WebGLObjects };
