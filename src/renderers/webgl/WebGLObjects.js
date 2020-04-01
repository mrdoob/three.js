/**
 * @author mrdoob / http://mrdoob.com/
 */

class WebGLObjects {

	constructor( gl, geometries, attributes, info ) {

		this.gl = gl;
		this.geometries = geometries;
		this.attributes = attributes;
		this.info = info;

		this.updateMap = new WeakMap();

	}

	update( object ) {

		var frame = this.info.render.frame;

		var geometry = object.geometry;
		var buffergeometry = this.geometries.get( object, geometry );

		// Update once per frame

		if ( this.updateMap.get( buffergeometry ) !== frame ) {

			if ( geometry.isGeometry ) {

				buffergeometry.updateFromObject( object );

			}

			this.geometries.update( buffergeometry );

			this.updateMap.set( buffergeometry, frame );

		}

		if ( object.isInstancedMesh ) {

			this.attributes.update( object.instanceMatrix, gl.ARRAY_BUFFER );

		}

		return buffergeometry;

	}

	dispose() {

		this.updateMap = new WeakMap();

	}

}


export { WebGLObjects };
