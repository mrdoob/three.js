/**
 * @author fernandojsg / http://fernandojsg.com
 */

import { WebGLRenderTarget } from '../WebGLRenderTarget.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';

function WebGLMultiview( requested, gl, canvas, extensions, capabilities, properties ) {

	this.isAvailable = function () {

		return capabilities.multiview;

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

	var numViews = 2; // @todo Based on arrayCamera
	var framebuffer; // multiview framebuffer.
	var viewFramebuffer; // single views inside the multiview framebuffer.
	var framebufferWidth = 0;
	var framebufferHeight = 0;

	var texture = {
		color: null,
		depthStencil: null
	};

	this.computeCameraMatrices = function ( camera ) {

		if ( ! camera.projectionMatrices ) {

			camera.projectionMatrices = new Array( numViews );
			camera.viewMatrices = new Array( numViews );

			for ( var i = 0; i < numViews; i ++ ) {

				camera.projectionMatrices[ i ] = new Matrix4();
				camera.viewMatrices[ i ] = new Matrix4();

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

	// @todo Get ArrayCamera
	this.createMultiviewRenderTargetTexture = function () {

		var halfWidth = Math.floor( canvas.width * 0.5 );

		framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

		var ext = extensions.get( 'OVR_multiview2' );

		texture.color = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.color );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texImage3D( gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, halfWidth, canvas.height, numViews, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
		ext.framebufferTextureMultiviewOVR( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture.color, 0, 0, numViews );

		texture.depthStencil = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.depthStencil );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texImage3D( gl.TEXTURE_2D_ARRAY, 0, gl.DEPTH24_STENCIL8, halfWidth, canvas.height, numViews, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null );
		ext.framebufferTextureMultiviewOVR( gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, texture.depthStencil, 0, 0, numViews );

		viewFramebuffer = new Array( numViews );
		for ( var viewIndex = 0; viewIndex < numViews; ++ viewIndex ) {

			viewFramebuffer[ viewIndex ] = gl.createFramebuffer();
			gl.bindFramebuffer( gl.FRAMEBUFFER, viewFramebuffer[ viewIndex ] );
			gl.framebufferTextureLayer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture.color, 0, viewIndex );

		}

		framebufferWidth = halfWidth;
		framebufferHeight = canvas.height;

		this.renderTarget = new WebGLRenderTarget( framebufferWidth, framebufferHeight );

		// @hack This should be done in WebGLTextures?
		properties.get( this.renderTarget ).__webglFramebuffer = framebuffer;

	};

	this.bindFramebuffer = function ( camera ) {

		var width = canvas.width;
		var height = canvas.height;

		if ( camera.isArrayCamera ) {

			// Every camera must have the same size, so we just get the size from the first one
			var bounds = camera.cameras[ 0 ].bounds;

			width *= bounds.z;
			height *= bounds.w;

		}

		if ( framebufferWidth < width || framebufferHeight < height ) {

			console.log( 'WebGLMultiview: Updating multiview FBO with dimensions: ', width, height );
			gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.color );
			gl.texImage3D( gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, width, height, numViews, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
			gl.bindTexture( gl.TEXTURE_2D_ARRAY, texture.depthStencil );
			gl.texImage3D( gl.TEXTURE_2D_ARRAY, 0, gl.DEPTH24_STENCIL8, width, height, numViews, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null );
			framebufferWidth = width;
			framebufferHeight = height;

			this.renderTarget.setSize( width, height );

		}

		gl.bindFramebuffer( gl.DRAW_FRAMEBUFFER, framebuffer );

	};

	this.unbindFramebuffer = function ( camera ) {

		gl.bindFramebuffer( gl.DRAW_FRAMEBUFFER, null );

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < camera.cameras.length; i ++ ) {

				var bounds = camera.cameras[ i ].bounds;

				var x = bounds.x * canvas.width;
				var y = bounds.y * canvas.height;
				var width = bounds.z * canvas.width;
				var height = bounds.w * canvas.height;

				gl.bindFramebuffer( gl.READ_FRAMEBUFFER, viewFramebuffer[ i ] );
				gl.blitFramebuffer( 0, 0, width, height, x, y, x + width, y + height, gl.COLOR_BUFFER_BIT, gl.NEAREST );

			}

		} else {

			gl.bindFramebuffer( gl.READ_FRAMEBUFFER, viewFramebuffer[ 0 ] );
			gl.blitFramebuffer( 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height, gl.COLOR_BUFFER_BIT, gl.NEAREST );

		}

	};


	if ( this.isEnabled() ) {

		this.createMultiviewRenderTargetTexture();

	}

}

export { WebGLMultiview };
