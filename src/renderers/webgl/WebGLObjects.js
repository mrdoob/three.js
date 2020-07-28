function WebGLObjects( gl, geometries, attributes, info ) {

	let updateMap = new WeakMap();

	function update( object ) {

		const frame = info.render.frame;

		const geometry = object.geometry;
		const buffergeometry = geometries.get( object, geometry );

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
