/**
 * @author mrdoob / http://mrdoob.com/
 */

import { ArrayCamera } from '../../cameras/ArrayCamera.js';
import { EventDispatcher } from '../../core/EventDispatcher.js';
import { PerspectiveCamera } from '../../cameras/PerspectiveCamera.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';
import { WebGLAnimation } from '../webgl/WebGLAnimation.js';
import { WebXRController } from './WebXRController.js';

function WebXRManager( renderer, gl ) {

	var scope = this;

	var session = null;

	var framebufferScaleFactor = 1.0;

	var referenceSpace = null;
	var referenceSpaceType = 'local-floor';

	var pose = null;

	var controllers = [];
	var inputSourcesMap = new Map();

	//

	var cameraL = new PerspectiveCamera();
	cameraL.layers.enable( 1 );
	cameraL.viewport = new Vector4();

	var cameraR = new PerspectiveCamera();
	cameraR.layers.enable( 2 );
	cameraR.viewport = new Vector4();

	var cameraVR = new ArrayCamera( [ cameraL, cameraR ] );
	cameraVR.layers.enable( 1 );
	cameraVR.layers.enable( 2 );

	var _currentDepthNear = null;
	var _currentDepthFar = null;

	//

	this.enabled = false;

	this.isPresenting = false;

	this.getController = function ( index ) {

		var controller = controllers[ index ];

		if ( controller === undefined ) {

			controller = new WebXRController();
			controllers[ index ] = controller;

		}

		return controller.getTargetRaySpace();

	};

	this.getControllerGrip = function ( index ) {

		var controller = controllers[ index ];

		if ( controller === undefined ) {

			controller = new WebXRController();
			controllers[ index ] = controller;

		}

		return controller.getGripSpace();

	};

	//

	function onSessionEvent( event ) {

		var controller = inputSourcesMap.get( event.inputSource );

		if ( controller ) {

			controller.dispatchEvent( { type: event.type } );

		}

	}

	function onSessionEnd() {

		inputSourcesMap.forEach( function ( controller, inputSource ) {

			controller.disconnect( inputSource );

		} );

		inputSourcesMap.clear();

		//

		renderer.setFramebuffer( null );
		renderer.setRenderTarget( renderer.getRenderTarget() ); // Hack #15830
		animation.stop();

		scope.isPresenting = false;

		scope.dispatchEvent( { type: 'sessionend' } );

	}

	function onRequestReferenceSpace( value ) {

		referenceSpace = value;

		animation.setContext( session );
		animation.start();

		scope.isPresenting = true;

		scope.dispatchEvent( { type: 'sessionstart' } );

	}

	this.setFramebufferScaleFactor = function ( value ) {

		framebufferScaleFactor = value;

		// Warn if function is used while presenting
		if ( scope.isPresenting == true ) {

			console.warn( "WebXRManager: Cannot change framebuffer scale while presenting VR content" );

		}

	};

	this.setReferenceSpaceType = function ( value ) {

		referenceSpaceType = value;

	};

	this.getReferenceSpace = function () {

		return referenceSpace;

	};

	this.getSession = function () {

		return session;

	};

	this.setSession = function ( value ) {

		session = value;

		if ( session !== null ) {

			session.addEventListener( 'select', onSessionEvent );
			session.addEventListener( 'selectstart', onSessionEvent );
			session.addEventListener( 'selectend', onSessionEvent );
			session.addEventListener( 'squeeze', onSessionEvent );
			session.addEventListener( 'squeezestart', onSessionEvent );
			session.addEventListener( 'squeezeend', onSessionEvent );
			session.addEventListener( 'end', onSessionEnd );

			var attributes = gl.getContextAttributes();

			var layerInit = {
				antialias: attributes.antialias,
				alpha: attributes.alpha,
				depth: attributes.depth,
				stencil: attributes.stencil,
				framebufferScaleFactor: framebufferScaleFactor
			};

			// eslint-disable-next-line no-undef
			var baseLayer = new XRWebGLLayer( session, gl, layerInit );

			session.updateRenderState( { baseLayer: baseLayer } );

			session.requestReferenceSpace( referenceSpaceType ).then( onRequestReferenceSpace );

			//

			session.addEventListener( 'inputsourceschange', updateInputSources );

		}

	};

	function updateInputSources( event ) {

		var inputSources = session.inputSources;

		// Assign inputSources to available controllers

		for ( var i = 0; i < controllers.length; i ++ ) {

			inputSourcesMap.set( inputSources[ i ], controllers[ i ] );

		}

		// Notify disconnected

		for ( var i = 0; i < event.removed.length; i ++ ) {

			var inputSource = event.removed[ i ];
			var controller = inputSourcesMap.get( inputSource );

			if ( controller ) {

				controller.dispatchEvent( { type: 'disconnected', data: inputSource } );
				inputSourcesMap.delete( inputSource );

			}

		}

		// Notify connected

		for ( var i = 0; i < event.added.length; i ++ ) {

			var inputSource = event.added[ i ];
			var controller = inputSourcesMap.get( inputSource );

			if ( controller ) {

				controller.dispatchEvent( { type: 'connected', data: inputSource } );

			}

		}

	}

	//

	var cameraLPos = new Vector3();
	var cameraRPos = new Vector3();

	/**
	 * @author jsantell / https://www.jsantell.com/
	 *
	 * Assumes 2 cameras that are parallel and share an X-axis, and that
	 * the cameras' projection and world matrices have already been set.
	 * And that near and far planes are identical for both cameras.
	 * Visualization of this technique: https://computergraphics.stackexchange.com/a/4765
	 */
	function setProjectionFromUnion( camera, cameraL, cameraR ) {

		cameraLPos.setFromMatrixPosition( cameraL.matrixWorld );
		cameraRPos.setFromMatrixPosition( cameraR.matrixWorld );

		var ipd = cameraLPos.distanceTo( cameraRPos );

		var projL = cameraL.projectionMatrix.elements;
		var projR = cameraR.projectionMatrix.elements;

		// VR systems will have identical far and near planes, and
		// most likely identical top and bottom frustum extents.
		// Use the left camera for these values.
		var near = projL[ 14 ] / ( projL[ 10 ] - 1 );
		var far = projL[ 14 ] / ( projL[ 10 ] + 1 );
		var topFov = ( projL[ 9 ] + 1 ) / projL[ 5 ];
		var bottomFov = ( projL[ 9 ] - 1 ) / projL[ 5 ];

		var leftFov = ( projL[ 8 ] - 1 ) / projL[ 0 ];
		var rightFov = ( projR[ 8 ] + 1 ) / projR[ 0 ];
		var left = near * leftFov;
		var right = near * rightFov;

		// Calculate the new camera's position offset from the
		// left camera. xOffset should be roughly half `ipd`.
		var zOffset = ipd / ( - leftFov + rightFov );
		var xOffset = zOffset * - leftFov;

		// TODO: Better way to apply this offset?
		cameraL.matrixWorld.decompose( camera.position, camera.quaternion, camera.scale );
		camera.translateX( xOffset );
		camera.translateZ( zOffset );
		camera.matrixWorld.compose( camera.position, camera.quaternion, camera.scale );
		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		// Find the union of the frustum values of the cameras and scale
		// the values so that the near plane's position does not change in world space,
		// although must now be relative to the new union camera.
		var near2 = near + zOffset;
		var far2 = far + zOffset;
		var left2 = left - xOffset;
		var right2 = right + ( ipd - xOffset );
		var top2 = topFov * far / far2 * near2;
		var bottom2 = bottomFov * far / far2 * near2;

		camera.projectionMatrix.makePerspective( left2, right2, top2, bottom2, near2, far2 );

	}

	function updateCamera( camera, parent ) {

		if ( parent === null ) {

			camera.matrixWorld.copy( camera.matrix );

		} else {

			camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );

		}

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	}

	this.getCamera = function ( camera ) {

		cameraVR.near = cameraR.near = cameraL.near = camera.near;
		cameraVR.far = cameraR.far = cameraL.far = camera.far;

		if ( _currentDepthNear !== cameraVR.near || _currentDepthFar !== cameraVR.far ) {

			// Note that the new renderState won't apply until the next frame. See #18320

			session.updateRenderState( {
				depthNear: cameraVR.near,
				depthFar: cameraVR.far
			} );

			_currentDepthNear = cameraVR.near;
			_currentDepthFar = cameraVR.far;

		}

		var parent = camera.parent;
		var cameras = cameraVR.cameras;

		updateCamera( cameraVR, parent );

		for ( var i = 0; i < cameras.length; i ++ ) {

			updateCamera( cameras[ i ], parent );

		}

		// update camera and its children

		camera.matrixWorld.copy( cameraVR.matrixWorld );

		var children = camera.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true );

		}

		setProjectionFromUnion( cameraVR, cameraL, cameraR );

		return cameraVR;

	};

	// Animation Loop

	var onAnimationFrameCallback = null;

	function onAnimationFrame( time, frame ) {

		pose = frame.getViewerPose( referenceSpace );

		if ( pose !== null ) {

			var views = pose.views;
			var baseLayer = session.renderState.baseLayer;

			renderer.setFramebuffer( baseLayer.framebuffer );

			for ( var i = 0; i < views.length; i ++ ) {

				var view = views[ i ];
				var viewport = baseLayer.getViewport( view );

				var camera = cameraVR.cameras[ i ];
				camera.matrix.fromArray( view.transform.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				camera.viewport.set( viewport.x, viewport.y, viewport.width, viewport.height );

				if ( i === 0 ) {

					cameraVR.matrix.copy( camera.matrix );

				}

			}

		}

		//

		var inputSources = session.inputSources;

		for ( var i = 0; i < controllers.length; i ++ ) {

			var controller = controllers[ i ];
			var inputSource = inputSources[ i ];

			controller.update( inputSource, frame, referenceSpace );

		}

		if ( onAnimationFrameCallback ) onAnimationFrameCallback( time, frame );

	}

	var animation = new WebGLAnimation();
	animation.setAnimationLoop( onAnimationFrame );

	this.setAnimationLoop = function ( callback ) {

		onAnimationFrameCallback = callback;

	};

	this.dispose = function () {};

}

Object.assign( WebXRManager.prototype, EventDispatcher.prototype );

export { WebXRManager };
