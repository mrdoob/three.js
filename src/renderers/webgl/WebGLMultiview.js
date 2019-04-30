/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Takahiro https://github.com/takahirox
 */

import { WebGLMultiviewRenderTarget } from '../WebGLMultiviewRenderTarget.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';

function WebGLMultiview( renderer, requested, options ) {

	options = Object.assign( {}, { debug: false }, options );

	var DEFAULT_NUMVIEWS = 2;
	var gl = renderer.context;
	var canvas = renderer.domElement;
	var capabilities = renderer.capabilities;
	var properties = renderer.properties;

	var renderTarget, currentRenderTarget;

	this.getMaxViews = function () {

		return capabilities.maxMultiviewViews;

	};

	this.getNumViews = function () {

		return renderTarget ? renderTarget.numViews : 1;

	};

	// Auxiliary matrices to be used when updating arrays of uniforms
	var mat4 = [];
	var mat3 = [];

	for ( var i = 0; i < this.getMaxViews(); i ++ ) {

		mat4[ i ] = new Matrix4();
		mat3[ i ] = new Matrix3();

	}

	//

	this.isAvailable = function () {

		return capabilities.multiview;

	};

	this.isEnabled = function () {

		return requested && this.isAvailable();

	};

	if ( options.debug ) {

		if ( requested && ! this.isAvailable() ) {

			console.warn( 'WebGLRenderer: Multiview requested but not supported by the browser' );

		} else if ( requested !== false && this.isAvailable() ) {

			console.info( 'WebGLRenderer: Multiview enabled' );

		}

	}

	this.updateCameraProjectionMatrices = function ( camera, uniforms ) {

		var numViews = this.getNumViews();

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < numViews; i ++ ) {

				mat4[ i ].copy( camera.cameras[ i ].projectionMatrix );

			}

		} else {

			for ( var i = 0; i < numViews; i ++ ) {

				mat4[ i ].copy( camera.projectionMatrix );

			}

		}

		uniforms.setValue( gl, 'projectionMatrices', mat4 );

	};

	this.updateCameraViewMatrices = function ( camera, uniforms ) {

		var numViews = this.getNumViews();

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < numViews; i ++ ) {

				mat4[ i ].copy( camera.cameras[ i ].matrixWorldInverse );

			}

		} else {

			for ( var i = 0; i < numViews; i ++ ) {

				mat4[ i ].copy( camera.matrixWorldInverse );

			}

		}

		uniforms.setValue( gl, 'viewMatrices', mat4 );

	};

	this.updateObjectMatrices = function ( object, camera, uniforms ) {

		var numViews = this.getNumViews();

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < numViews; i ++ ) {

				mat4[ i ].multiplyMatrices( camera.cameras[ i ].matrixWorldInverse, object.matrixWorld );
				mat3[ i ].getNormalMatrix( mat4[ i ] );

			}

		} else {

			// In this case we still need to provide an array of matrices but just the first one will be used
			mat4[ 0 ].multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
			mat3[ 0 ].getNormalMatrix( mat4[ 0 ] );

			for ( var i = 1; i < numViews; i ++ ) {

				mat4[ i ].copy( mat4[ 0 ] );
				mat3[ i ].copy( mat3[ 0 ] );

			}

		}

		uniforms.setValue( gl, 'modelViewMatrices', mat4 );
		uniforms.setValue( gl, 'normalMatrices', mat3 );

	};

	this.attachRenderTarget = function ( camera ) {

		currentRenderTarget = renderer.getRenderTarget();

		// Resize if needed
		var width = canvas.width;
		var height = canvas.height;

		if ( camera.isArrayCamera ) {

			// Every camera must have the same size, so we just get the size from the first one
			var bounds = camera.cameras[ 0 ].bounds;

			width *= bounds.z;
			height *= bounds.w;

			renderTarget.setNumViews( camera.cameras.length );

		} else {

			renderTarget.setNumViews( DEFAULT_NUMVIEWS );

		}

		renderTarget.setSize( width, height );

		renderer.setRenderTarget( renderTarget );

	};

	this.detachRenderTarget = function ( camera ) {

		var viewFramebuffers = properties.get( renderTarget ).__webglViewFramebuffers;

		// @todo Use actual framebuffer
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < camera.cameras.length; i ++ ) {

				var bounds = camera.cameras[ i ].bounds;

				var x = bounds.x * canvas.width;
				var y = bounds.y * canvas.height;
				var width = bounds.z * canvas.width;
				var height = bounds.w * canvas.height;

				gl.bindFramebuffer( gl.READ_FRAMEBUFFER, viewFramebuffers[ i ] );
				gl.blitFramebuffer( 0, 0, width, height, x, y, x + width, y + height, gl.COLOR_BUFFER_BIT, gl.NEAREST );

			}

		} else {

			// If no array camera, blit just one view
			gl.bindFramebuffer( gl.READ_FRAMEBUFFER, viewFramebuffers[ 0 ] );
			gl.blitFramebuffer( 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height, gl.COLOR_BUFFER_BIT, gl.NEAREST );

		}

		renderer.setRenderTarget( currentRenderTarget );

	};


	if ( this.isEnabled() ) {

		renderTarget = new WebGLMultiviewRenderTarget( canvas.width, canvas.height, this.numViews );

	}

}

export { WebGLMultiview };
