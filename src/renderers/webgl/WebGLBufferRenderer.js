class WebGLBufferRenderer {

	constructor( gl, extensions, info, capabilities ) {

		this.gl = gl;
		this.extensions = extensions;
		this.info = info;
		this.capabilities = capabilities;

	}

	setMode( value ) {

		this.mode = value;

	}

	render( start, count ) {

		const { gl, mode, info } = this;

		gl.drawArrays( mode, start, count );

		info.update( count, mode, 1 );

	}

	renderInstances( start, count, primcount ) {

		if ( primcount === 0 ) return;

		const { gl, extensions, info, capabilities, mode } = this;

		const isWebGL2 = capabilities.isWebGL2;

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

}

export { WebGLBufferRenderer };
