/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLBufferRenderer = function ( _gl, extensions, _infoRender ) {

	var mode;

	this.setMode = function ( value ) {

		mode = value;

	};

	this.renderGroups = function ( groups ) {

		for ( var i = 0, il = groups.length; i < il; i ++ ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			_gl.drawArrays( mode, start, count );

			_infoRender.calls ++;
			_infoRender.vertices += count;
			if ( mode === _gl.TRIANGLES ) _infoRender.faces += count / 3;

		}

	};

	this.renderInstances = function ( geometry ) {

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

	};

};
