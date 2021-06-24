function WebGLBufferRenderer( gl, extensions, info, capabilities ) {

	const isWebGL2 = capabilities.isWebGL2;

	let mode;
	let isFrameBuffer;

	function setMode( value ) {

		mode = value;

	}

	function setIsFrameBuffer( value ) {

		isFrameBuffer = value;

	}

	function render( start, count ) {

		gl.drawArrays( mode, start, count );

		info.update( count, mode, 1, isFrameBuffer );

	}

	function renderInstances( start, count, primcount ) {

		if ( primcount === 0 ) return;

		let extension, methodName;

		if ( isWebGL2 ) {

			extension = gl;
			methodName = 'drawArraysInstanced';

		} else {

			extension = extensions.get( 'ANGLE_instanced_arrays' );
			methodName = 'drawArraysInstancedANGLE';

			if ( extension === null ) {

				console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		extension[ methodName ]( mode, start, count, primcount );

		info.update( count, mode, primcount, isFrameBuffer );

	}

	//

	this.setMode = setMode;
	this.setIsFrameBuffer = setIsFrameBuffer;
	this.render = render;
	this.renderInstances = renderInstances;

}


export { WebGLBufferRenderer };
