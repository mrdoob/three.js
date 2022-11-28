class WebGLIndexedBufferRenderer {

	constructor( gl, extensions, info, capabilities ) {

		this.gl = gl;
		this.extensions = extensions;
		this.info = info;
		this.capabilities = capabilities;

	}

	setMode( value ) {

		this.mode = value;

	}

	setIndex( value ) {

		this.type = value.type;
		this.bytesPerElement = value.bytesPerElement;

	}

	render( start, count ) {

		const { gl, info, mode, type, bytesPerElement } = this;

		gl.drawElements( mode, count, type, start * bytesPerElement );

		info.update( count, mode, 1 );

	}

	renderInstances( start, count, primcount ) {

		if ( primcount === 0 ) return;

		const { gl, extensions, info, capabilities, type, bytesPerElement, mode } = this;

		const isWebGL2 = capabilities.isWebGL2;

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

}

export { WebGLIndexedBufferRenderer };
