function WebGLIndexedBufferRenderer( gl, extensions, info, capabilities ) {

	const isWebGL2 = capabilities.isWebGL2;

	let mode;
	let isFrameBuffer;

	function setMode( value ) {

		mode = value;

	}

	function setIsFrameBuffer( value ) {

		isFrameBuffer = value;

	}

	let type, bytesPerElement;

	function setIndex( value ) {

		type = value.type;
		bytesPerElement = value.bytesPerElement;

	}

	function render( start, count ) {

		gl.drawElements( mode, count, type, start * bytesPerElement );

		info.update( count, mode, 1, isFrameBuffer );

	}

	function renderInstances( start, count, primcount ) {

		if ( primcount === 0 ) return;

		let extension, methodName;

		if ( isWebGL2 ) {

			extension = gl;
			methodName = 'drawElementsInstanced';

		} else {

			extension = extensions.get( 'ANGLE_instanced_arrays' );
			methodName = 'drawElementsInstancedANGLE';

			if ( extension === null ) {

				console.error( 'THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		extension[ methodName ]( mode, count, type, start * bytesPerElement, primcount );
		console.log( 'renderinstance', start, count );

		info.update( count, mode, primcount, isFrameBuffer );

	}

	//

	this.setMode = setMode;
	this.setIsFrameBuffer = setIsFrameBuffer;
	this.setIndex = setIndex;
	this.render = render;
	this.renderInstances = renderInstances;

}


export { WebGLIndexedBufferRenderer };
