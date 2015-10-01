/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLIndexedBufferRenderer = function ( _gl, extensions, _infoRender ) {

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

	function renderInstances( geometry ) {

		var extension = extensions.get( 'ANGLE_instanced_arrays' );

		if ( extension === null ) {

			console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
			return;

		}

		var index = geometry.index;

		extension.drawElementsInstancedANGLE( mode, index.array.length, type, 0, geometry.maxInstancedCount );

	}

	this.setMode = setMode;
	this.setIndex = setIndex;
	this.render = render;
	this.renderInstances = renderInstances;

};
