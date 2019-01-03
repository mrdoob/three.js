/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLObjects( geometries, info ) {

	var updateList = {};

	function update( object ) {

		var frame = info.render.frame;

		var geometry = geometries.get( object, object.geometry );

		// Update once per frame

		if ( updateList[ geometry.id ] !== frame ) {

			geometries.update( geometry );

			updateList[ geometry.id ] = frame;

		}

		return geometry;

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
