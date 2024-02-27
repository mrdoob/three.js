function WebGLBufferRenderer( gl, extensions, info, capabilities ) {

	const isWebGL2 = capabilities.isWebGL2;

	let mode;

	function setMode( value ) {

		mode = value;

	}

	function render( start, count ) {

		gl.drawArrays( mode, start, count );

		info.update( count, mode, 1 );

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

		info.update( count, mode, primcount );

	}

	function renderMultiDraw( starts, counts, drawCount ) {

		if ( drawCount === 0 ) return;

		const extension = extensions.get( 'WEBGL_multi_draw' );
		if ( extension === null ) {

			for ( let i = 0; i < drawCount; i ++ ) {

				this.render( starts[ i ], counts[ i ] );

			}

		} else {

			extension.multiDrawArraysWEBGL( mode, starts, 0, counts, 0, drawCount );

			let elementCount = 0;
			for ( let i = 0; i < drawCount; i ++ ) {

				elementCount += counts[ i ];

			}

			info.update( elementCount, mode, 1 );

		}

	}

	//

	this.setMode = setMode;
	this.render = render;
	this.renderInstances = renderInstances;
	this.renderMultiDraw = renderMultiDraw;

}


export { WebGLBufferRenderer };
