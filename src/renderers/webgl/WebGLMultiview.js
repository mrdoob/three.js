/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Takahiro https://github.com/takahirox
 */

import { WebGLMultiviewRenderTarget } from '../WebGLMultiviewRenderTarget.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';

function WebGLMultiview( renderer, gl ) {

	var DEFAULT_NUMVIEWS = 2;

	var capabilities = renderer.capabilities;
	var properties = renderer.properties;

	var maxNumViews = capabilities.maxMultiviewViews;

	var renderTarget, currentRenderTarget;
	var mat3, mat4, cameraArray, renderSize;

	function getMaxViews() {

		return capabilities.maxMultiviewViews;

	}

	function getNumViews() {

		if ( renderTarget && renderer.getRenderTarget() === renderTarget ) {

			return renderTarget.numViews;

		}

		return 0;

	}

	function getCameraArray( camera ) {

		if ( camera.isArrayCamera ) return camera.cameras;

		cameraArray[ 0 ] = camera;

		return cameraArray;

	}

	//

	function isAvailable() {

		return capabilities.multiview;

	}

	function updateCameraProjectionMatricesUniform( camera, uniforms ) {

		var cameras = getCameraArray( camera );

		for ( var i = 0; i < cameras.length; i ++ ) {

			mat4[ i ].copy( cameras[ i ].projectionMatrix );

		}

		uniforms.setValue( gl, 'projectionMatrices', mat4 );

	}

	function updateCameraViewMatricesUniform( camera, uniforms ) {

		var cameras = getCameraArray( camera );

		for ( var i = 0; i < cameras.length; i ++ ) {

			mat4[ i ].copy( cameras[ i ].matrixWorldInverse );

		}

		uniforms.setValue( gl, 'viewMatrices', mat4 );

	}

	function updateObjectMatricesUniforms( object, camera, uniforms ) {

		var cameras = getCameraArray( camera );

		for ( var i = 0; i < cameras.length; i ++ ) {

			mat4[ i ].multiplyMatrices( cameras[ i ].matrixWorldInverse, object.matrixWorld );
			mat3[ i ].getNormalMatrix( mat4[ i ] );

		}

		uniforms.setValue( gl, 'modelViewMatrices', mat4 );
		uniforms.setValue( gl, 'normalMatrices', mat3 );

	}

	function isMultiviewCompatible( camera ) {

		if ( ! camera.isArrayCamera ) return true;

		var cameras = camera.cameras;

		if ( cameras.length > maxNumViews ) return false;

		for ( var i = 1, il = cameras.length; i < il; i ++ ) {

			if ( cameras[ 0 ].viewport.z !== cameras[ i ].viewport.z ||
				cameras[ 0 ].viewport.w !== cameras[ i ].viewport.w ) return false;

		}

		return true;

	}

	function resizeRenderTarget( camera ) {

		if ( currentRenderTarget ) {

			renderSize.set( currentRenderTarget.width, currentRenderTarget.height );

		} else {

			renderer.getDrawingBufferSize( renderSize );

		}

		if ( camera.isArrayCamera ) {

			var viewport = camera.cameras[ 0 ].viewport;

			renderTarget.setSize( viewport.z, viewport.w );

			renderTarget.setNumViews( camera.cameras.length );

		} else {

			renderTarget.setSize( renderSize.x, renderSize.y );
			renderTarget.setNumViews( DEFAULT_NUMVIEWS );

		}

	}

	function attachRenderTarget( camera ) {

		if ( ! isMultiviewCompatible( camera ) ) return;

		currentRenderTarget = renderer.getRenderTarget();
		resizeRenderTarget( camera );
		renderer.setRenderTarget( renderTarget );

	}

	function detachRenderTarget( camera ) {

		if ( renderTarget !== renderer.getRenderTarget() ) return;

		renderer.setRenderTarget( currentRenderTarget );
		flush( camera );

	}

	function flush( camera ) {

		var srcRenderTarget = renderTarget;
		var numViews = srcRenderTarget.numViews;

		var srcFramebuffers = properties.get( srcRenderTarget ).__webglViewFramebuffers;

		var viewWidth = srcRenderTarget.width;
		var viewHeight = srcRenderTarget.height;

		if ( camera.isArrayCamera ) {

			for ( var i = 0; i < numViews; i ++ ) {

				var viewport = camera.cameras[ i ].viewport;

				var x1 = viewport.x;
				var y1 = viewport.y;
				var x2 = x1 + viewport.z;
				var y2 = y1 + viewport.w;

				gl.bindFramebuffer( gl.READ_FRAMEBUFFER, srcFramebuffers[ i ] );
				gl.blitFramebuffer( 0, 0, viewWidth, viewHeight, x1, y1, x2, y2, gl.COLOR_BUFFER_BIT, gl.NEAREST );

			}

		} else {

			gl.bindFramebuffer( gl.READ_FRAMEBUFFER, srcFramebuffers[ 0 ] );
			gl.blitFramebuffer( 0, 0, viewWidth, viewHeight, 0, 0, renderSize.x, renderSize.y, gl.COLOR_BUFFER_BIT, gl.NEAREST );

		}

	}


	if ( isAvailable() ) {

		console.log('multiivew enabled!');

		renderTarget = new WebGLMultiviewRenderTarget( 0, 0, DEFAULT_NUMVIEWS );

		renderSize = new Vector2();
		mat4 = [];
		mat3 = [];
		cameraArray = [];

		for ( var i = 0; i < getMaxViews(); i ++ ) {

			mat4[ i ] = new Matrix4();
			mat3[ i ] = new Matrix3();

		}

	}


	this.attachRenderTarget = attachRenderTarget;
	this.detachRenderTarget = detachRenderTarget;
	this.isAvailable = isAvailable;
	this.getNumViews = getNumViews;
	this.updateCameraProjectionMatricesUniform = updateCameraProjectionMatricesUniform;
	this.updateCameraViewMatricesUniform = updateCameraViewMatricesUniform;
	this.updateObjectMatricesUniforms = updateObjectMatricesUniforms;

}

export { WebGLMultiview };
