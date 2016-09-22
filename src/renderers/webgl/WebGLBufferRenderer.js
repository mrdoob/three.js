/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLBufferRenderer( gl, extensions, infoRender ) {

	var mode;

	function setMode( value ) {

		mode = value;

	}

	function render( start, count ) {

		gl.drawArrays( mode, start, count );

		infoRender.calls ++;
		infoRender.vertices += count;

		if ( mode === gl.TRIANGLES ) infoRender.faces += count / 3;

	}

	function renderInstances( geometry ) {

		var extension = extensions.get( 'ANGLE_instanced_arrays' );

		if ( extension === null ) {

			console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
			return;

		}

		var position = geometry.attributes.position;

		var count = 0;

		if ( (position && position.isInterleavedBufferAttribute) ) {

			count = position.data.count;

			extension.drawArraysInstancedANGLE( mode, 0, count, geometry.maxInstancedCount );

		} else {

			count = position.count;

			extension.drawArraysInstancedANGLE( mode, 0, count, geometry.maxInstancedCount );

		}

		infoRender.calls ++;
		infoRender.vertices += count * geometry.maxInstancedCount;

		if ( mode === gl.TRIANGLES ) infoRender.faces += geometry.maxInstancedCount * count / 3;

	}

	return {
		setMode: setMode,
		render: render,
		renderInstances: renderInstances
	};

}


export { WebGLBufferRenderer };
