/**
* @author mrdoob / http://mrdoob.com/
*/

function WebGLIndexedBufferRenderer ( _gl, extensions, _infoRender ) {
	this.isWebGLIndexedBufferRenderer = true;

	var mode;

	function setMode( value ) {

		mode = value;

	}

	var type, size;

	function setIndex( index ) {

		if ( index.array instanceof Uint32Array && extensions.get( 'OES_element_index_uint' ) ) {

			type = _gl.UNSIGNED_INT;
			size = 4;

		} else {

			type = _gl.UNSIGNED_SHORT;
			size = 2;

		}

	}

	function render( start, count ) {

		_gl.drawElements( mode, count, type, start * size );

		_infoRender.calls ++;
		_infoRender.vertices += count;
		if ( mode === _gl.TRIANGLES ) _infoRender.faces += count / 3;

	}

	function renderInstances( geometry, start, count ) {

		var extension = extensions.get( 'ANGLE_instanced_arrays' );

		if ( extension === null ) {

			console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
			return;

		}

		extension.drawElementsInstancedANGLE( mode, count, type, start * size, geometry.maxInstancedCount );

		_infoRender.calls ++;
		_infoRender.vertices += count * geometry.maxInstancedCount;
		if ( mode === _gl.TRIANGLES ) _infoRender.faces += geometry.maxInstancedCount * count / 3;
	}

	this.setMode = setMode;
	this.setIndex = setIndex;
	this.render = render;
	this.renderInstances = renderInstances;

};


export { WebGLIndexedBufferRenderer };