class WebGLBufferRenderer {

	constructor( backend ) {

		this.gl = backend.gl;
		this.extensions = backend.extensions;
		this.info = backend.renderer.info;
		this.mode = null;
		this.index = 0;
		this.type = null;
		this.object = null;

	}

	render( start, count ) {

		const { gl, mode, object, type, info, index } = this;

		if ( index !== 0 ) {

			gl.drawElements( mode, count, type, start );

		} else {

			gl.drawArrays( mode, start, count );

		}

		info.update( object, count, mode, 1 );

	}

	renderInstances( start, count, primcount ) {

		const { gl, mode, type, index, object, info } = this;

		if ( primcount === 0 ) return;

		if ( index !== 0 ) {

			gl.drawElementsInstanced( mode, count, type, start, primcount );

		} else {

			gl.drawArraysInstanced( mode, start, count, primcount );

		}

		info.update( object, count, mode, primcount );

	}

	renderMultiDraw( starts, counts, drawCount ) {

		const { extensions, mode, object, info } = this;

		if ( drawCount === 0 ) return;

		const extension = extensions.get( 'WEBGL_multi_draw' );

		if ( extension === null ) {

			for ( let i = 0; i < drawCount; i ++ ) {

				this.render( starts[ i ], counts[ i ] );

			}

		} else {

			if ( this.index !== 0 ) {

				extension.multiDrawElementsWEBGL( mode, counts, 0, this.type, starts, 0, drawCount );

			} else {

				extension.multiDrawArraysWEBGL( mode, starts, 0, counts, 0, drawCount );

			}

			let elementCount = 0;
			for ( let i = 0; i < drawCount; i ++ ) {

				elementCount += counts[ i ];

			}

			info.update( object, elementCount, mode, 1 );

		}

	}

	renderMultiDrawInstances( starts, counts, drawCount, primcount ) {

		const { extensions, mode, object, info } = this;

		if ( drawCount === 0 ) return;

		const extension = extensions.get( 'WEBGL_multi_draw' );

		if ( extension === null ) {

			for ( let i = 0; i < drawCount; i ++ ) {

				this.renderInstances( starts[ i ], counts[ i ], primcount[ i ] );

			}

		} else {

			if ( this.index !== 0 ) {

				extension.multiDrawElementsInstancedWEBGL( mode, counts, 0, this.type, starts, 0, primcount, 0, drawCount );

			} else {

				extension.multiDrawArraysInstancedWEBGL( mode, starts, 0, counts, 0, primcount, 0, drawCount );

			}

			let elementCount = 0;
			for ( let i = 0; i < drawCount; i ++ ) {

				elementCount += counts[ i ] * primcount[ i ];

			}

			info.update( object, elementCount, mode, 1 );

		}

	}

	//

}


export { WebGLBufferRenderer };
