/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLObjects( gl, geometries ) {

	function update( object ) {

		// TODO: Avoid updating twice (when using shadowMap). Maybe add frame counter.

		var geometry = geometries.get( object );

		if ( object.geometry.isGeometry ) {

			geometry.updateFromObject( object );

		}

		geometries.update( geometry );

		return geometry;

	}

	return {

		update: update

	};

}


export { WebGLObjects };
