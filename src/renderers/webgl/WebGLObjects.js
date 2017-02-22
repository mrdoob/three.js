/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLObjects( gl, geometries, infoRender ) {

	function update( object ) {

		var frame = infoRender.frame;

		var geometry = object.geometry;
		var buffergeometry = geometries.get( object, geometry );

		// Update once per frame

		if ( buffergeometry.__frame !== frame ) {

			if ( geometry.isGeometry ) {

				buffergeometry.updateFromObject( object );

			}

			geometries.update( buffergeometry );

			buffergeometry.__frame = frame;

		}

		return buffergeometry;

	}

	return {

		update: update

	};

}


export { WebGLObjects };
