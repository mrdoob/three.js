/**
 * @author mrdoob / http://mrdoob.com/
 */


class WebGLIndexedBufferRenderer {

	constructor( gl, extensions, info, capabilities ) {

		this.gl = gl;
		this.extensions = extensions;
		this.info = info;

		this.isWebGL2 = capabilities.isWebGL2;
		this.mode;
		this.type;
		this.bytesPerElement;

	}

	setMode( value ) {

		this.mode = value;

	}

	setIndex( value ) {

		this.type = value.type;
		this.bytesPerElement = value.bytesPerElement;

	}
	render( start, count ) {

		this.gl.drawElements( this.mode, count, this.type, start * this.bytesPerElement );
		this.info.update( count, this.mode );

	}
	renderInstances( geometry, start, count, primcount ) {

		if ( primcount === 0 )
			return;
		var extension, methodName;
		if ( this.isWebGL2 ) {

			extension = gl;
			methodName = 'drawElementsInstanced';

		} else {

			extension = this.extensions.get( 'ANGLE_instanced_arrays' );
			methodName = 'drawElementsInstancedANGLE';
			if ( extension === null ) {

				console.error( 'THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}
		extension[ methodName ]( this.mode, count, this.type, start * this.bytesPerElement, primcount );
		this.info.update( count, this.mode, primcount );

	}

}


export { WebGLIndexedBufferRenderer };
