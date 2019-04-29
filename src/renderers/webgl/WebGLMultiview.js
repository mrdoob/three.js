/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Takahiro https://github.com/takahirox
 */

import { WebGLMultiviewRenderTarget } from '../WebGLMultiviewRenderTarget.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';

function WebGLMultiview( renderer, requested ) {

	var gl = renderer.context;
	var canvas = renderer.domElement;
	var capabilities = renderer.capabilities;
	var properties = renderer.properties;

	this.isAvailable = function () {

		return capabilities.multiview;

	};

	this.getNumViews = function () {

		return numViews;

	};

	this.getMaxViews = function () {

		return capabilities.maxMultiviewViews;

	};

	this.isEnabled = function () {

		return requested && this.isAvailable();

	};

	if ( requested && ! this.isAvailable() ) {

		console.warn( 'WebGLRenderer: Multiview requested but not supported by the browser' );

	} else if ( requested !== false && this.isAvailable() ) {

		console.info( 'WebGLRenderer: Multiview enabled' );

	}

	var numViews = 2;
	var renderTarget, currentRenderTarget;

	this.computeCameraMatrices = function ( camera ) {

		if ( ! camera.projectionMatrices ) {

			camera.projectionMatrices = new Array( numViews );
			camera.viewMatrices = new Array( numViews );

			for ( var i = 0; i < numViews; i ++ ) {

				camera.projectionMatrices[ i ] = new Matrix4();
				camera.viewMatrices[ i ] = new Matrix4();

			}

		}

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < numViews; i ++ ) {

				camera.projectionMatrices[ i ].copy( camera.cameras[ i ].projectionMatrix );
				camera.viewMatrices[ i ].copy( camera.cameras[ i ].matrixWorldInverse );

			}

		} else {

			for ( var i = 0; i < numViews; i ++ ) {

				camera.projectionMatrices[ i ].copy( camera.projectionMatrix );
				camera.viewMatrices[ i ].copy( camera.matrixWorldInverse );

			}

		}

	};

	this.computeObjectMatrices = function ( object, camera ) {

		if ( ! object.modelViewMatrices ) {

			object.modelViewMatrices = new Array( numViews );
			object.normalMatrices = new Array( numViews );

			for ( var i = 0; i < numViews; i ++ ) {

				object.modelViewMatrices[ i ] = new Matrix4();
				object.normalMatrices[ i ] = new Matrix3();

			}

		}

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < numViews; i ++ ) {

				object.modelViewMatrices[ i ].multiplyMatrices( camera.cameras[ i ].matrixWorldInverse, object.matrixWorld );
				object.normalMatrices[ i ].getNormalMatrix( object.modelViewMatrices[ i ] );

			}

		} else {

			// In this case we still need to provide an array of matrices but just the first one will be used
			object.modelViewMatrices[ 0 ].multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
			object.normalMatrices[ 0 ].getNormalMatrix( object.modelViewMatrices[ 0 ] );

			for ( var i = 1; i < numViews; i ++ ) {

				object.modelViewMatrices[ i ].copy( object.modelViewMatrices[ 0 ] );
				object.normalMatrices[ i ].copy( object.normalMatrices[ 0 ] );

			}

		}

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

		renderTarget = new WebGLMultiviewRenderTarget( canvas.width, canvas.height, numViews );

	}

}

export { WebGLMultiview };
