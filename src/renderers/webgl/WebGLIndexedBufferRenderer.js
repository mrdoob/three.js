function WebGLIndexedBufferRenderer( gl, extensions, info, capabilities ) {

	const isWebGL2 = capabilities.isWebGL2;

	let mode;

	function setMode( value ) {

		mode = value;

	}

	let type, bytesPerElement;

	function setIndex( value ) {

		type = value.type;
		bytesPerElement = value.bytesPerElement;

	}

	function render( start, count ) {

		gl.drawElements( mode, count, type, start * bytesPerElement );

		info.update( count, mode, 1 );

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

		info.update( count, mode, primcount );

	}

	function renderMultiDraw( starts, counts, drawCount ) {

		if ( drawCount === 0 ) return;

		const extension = extensions.get( 'WEBGL_multi_draw' );
		if ( extension === null ) {

			for ( let i = 0; i < drawCount; i ++ ) {

				this.render( starts[ i ] / bytesPerElement, counts[ i ] );

			}

		} else {

			extension.multiDrawElementsWEBGL( mode, counts, 0, type, starts, 0, drawCount );

			let elementCount = 0;
			for ( let i = 0; i < drawCount; i ++ ) {

				elementCount += counts[ i ];

			}

			info.update( elementCount, mode, 1 );

		}

	}

	//

	this.setMode = setMode;
	this.setIndex = setIndex;
	this.render = render;
	this.renderInstances = renderInstances;
	this.renderMultiDraw = renderMultiDraw;

}


export { WebGLIndexedBufferRenderer };
