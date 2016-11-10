/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLIndexedBufferRenderer( gl, extensions, infoRender ) {

	var mode;

	function setMode( value ) {

		mode = value;

	}

	var type, size;

	function setIndex( index ) {

		if ( index.array instanceof Uint32Array && extensions.get( 'OES_element_index_uint' ) ) {

			type = gl.UNSIGNED_INT;
			size = 4;

		} else if ( index.array instanceof Uint16Array ) {

			type = gl.UNSIGNED_SHORT;
			size = 2;

		} else {

			type = gl.UNSIGNED_BYTE;
			size = 1;

		}

	}

	function render( start, count ) {

		gl.drawElements( mode, count, type, start * size );

		infoRender.calls ++;
		infoRender.vertices += count;

		if ( mode === gl.TRIANGLES ) infoRender.faces += count / 3;

	}

	function renderInstances( geometry, instanceCount, start, vertexCount ) {

		var extension = extensions.get( 'ANGLE_instanced_arrays' );

		if ( extension === null ) {

			console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
			return;

		}

		extension.drawElementsInstancedANGLE( mode, vertexCount, type, start * size, instanceCount );

		infoRender.calls ++;
		infoRender.vertices += vertexCount * instanceCount;

		if ( mode === gl.TRIANGLES ) infoRender.faces += instanceCount * vertexCount / 3;
	}

	return {

		setMode: setMode,
		setIndex: setIndex,
		render: render,
		renderInstances: renderInstances

	};

}


export { WebGLIndexedBufferRenderer };
