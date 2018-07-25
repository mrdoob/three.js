/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLBufferRenderer( gl, extensions, info, utils ) {

	var mode;

	function setMode( value ) {

		mode = value;

	}

	function render( start, count ) {

		gl.drawArrays( mode, start, count );

		info.update( count, mode );

	}

	function renderInstances( geometry, start, count ) {

		var extension;

		if ( utils.isWebGL2( gl ) ) {

			extension = gl;

		} else {

			extension = extensions.get( 'ANGLE_instanced_arrays' );

			if ( extension === null ) {

				console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		extension[ utils.isWebGL2( gl ) ? 'drawArraysInstanced' : 'drawArraysInstancedANGLE' ]( mode, start, count, geometry.maxInstancedCount );

		info.update( count, mode, geometry.maxInstancedCount );

	}

	//

	this.setMode = setMode;
	this.render = render;
	this.renderInstances = renderInstances;

}


export { WebGLBufferRenderer };
