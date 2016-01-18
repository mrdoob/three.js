/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLBufferRenderer = function ( _gl, extensions, _infoRender ) {

	var mode;

	function setMode( value ) {

		mode = value;

	}

	function render( start, count ) {

		_gl.drawArrays( mode, start, count );

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

		var position = geometry.attributes.position;

		if ( position instanceof THREE.InterleavedBufferAttribute ) {

			var count = position.data.count;

			extension.drawArraysInstancedANGLE( mode, 0, count, geometry.maxInstancedCount );

			_infoRender.calls ++;
			_infoRender.vertices += count * geometry.maxInstancedCount;
			if ( mode === _gl.TRIANGLES ) _infoRender.faces += geometry.maxInstancedCount * count / 3;

		} else {

			var count = position.count;

			extension.drawArraysInstancedANGLE( mode, 0, count, geometry.maxInstancedCount );

			_infoRender.calls ++;
			_infoRender.vertices += count * geometry.maxInstancedCount;
			if ( mode === _gl.TRIANGLES ) _infoRender.faces += geometry.maxInstancedCount * count / 3;

		}

	}

	this.setMode = setMode;
	this.render = render;
	this.renderInstances = renderInstances;

};
