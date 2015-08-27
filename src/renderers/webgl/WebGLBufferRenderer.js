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

			extension.drawArraysInstancedANGLE( mode, 0, position.data.count, geometry.maxInstancedCount );

		} else {

			extension.drawArraysInstancedANGLE( mode, 0, position.count, geometry.maxInstancedCount );

		}

	}

	this.setMode = setMode;
	this.render = render;
	this.renderInstances = renderInstances;

};
