/**
 * @author mrdoob / http://mrdoob.com/
 */

import { ArrayCamera } from '../../cameras/ArrayCamera.js';
import { EventDispatcher } from '../../core/EventDispatcher.js';
import { Group } from '../../objects/Group.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { PerspectiveCamera } from '../../cameras/PerspectiveCamera.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';
import { WebGLAnimation } from '../webgl/WebGLAnimation.js';

function WebXRManager( renderer, gl ) {

	var scope = this;

	var session = null;

	// var framebufferScaleFactor = 1.0;

	var referenceSpace = null;
	var referenceSpaceType = 'local-floor';

	var pose = null;

	var controllers = [];
	var sortedInputSources = [];

	function isPresenting() {

		return session !== null && referenceSpace !== null;

	}

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

	//

	this.enabled = false;

	this.getController = function ( id ) {

		var controller = controllers[ id ];

		if ( controller === undefined ) {

			controller = new Group();
			controller.matrixAutoUpdate = false;
			controller.visible = false;

			controllers[ id ] = controller;

		}

		return controller;

	};

	//

	function onSessionEvent( event ) {

		for ( var i = 0; i < controllers.length; i ++ ) {

			if ( sortedInputSources[ i ] === event.inputSource ) {

				controllers[ i ].dispatchEvent( { type: event.type } );

			}

		}

	}

	function onSessionEnd() {

		renderer.setFramebuffer( null );
		renderer.setRenderTarget( renderer.getRenderTarget() ); // Hack #15830
		animation.stop();

		scope.dispatchEvent( { type: 'sessionend' } );

	}

	function onRequestReferenceSpace( value ) {

		referenceSpace = value;

		animation.setContext( session );
		animation.start();

		scope.dispatchEvent( { type: 'sessionstart' } );

	}

	this.setFramebufferScaleFactor = function ( /* value */ ) {

		// framebufferScaleFactor = value;

	};

	this.setReferenceSpaceType = function ( value ) {

		referenceSpaceType = value;

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

			// eslint-disable-next-line no-undef
			session.updateRenderState( { baseLayer: new XRWebGLLayer( session, gl ) } );

			session.requestReferenceSpace( referenceSpaceType ).then( onRequestReferenceSpace );

			//

			session.addEventListener( 'inputsourceschange', updateInputSources );

			updateInputSources();

		}

	};

	function updateInputSources() {

		for ( var i = 0; i < controllers.length; i ++ ) {

			sortedInputSources[ i ] = findInputSource( i );

		}

	}

	function findInputSource( id ) {

		var inputSources = session.inputSources;

		for ( var i = 0; i < inputSources.length; i ++ ) {

			var inputSource = inputSources[ i ];
			var handedness = inputSource.handedness;

			if ( id === 0 && ( handedness === 'none' || handedness === 'right' ) ) return inputSource;
			if ( id === 1 && ( handedness === 'left' ) ) return inputSource;

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

	this.isPresenting = isPresenting;

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
				var viewMatrix = view.transform.inverse.matrix;

				var camera = cameraVR.cameras[ i ];
				camera.matrix.fromArray( viewMatrix ).getInverse( camera.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				camera.viewport.set( viewport.x, viewport.y, viewport.width, viewport.height );

				if ( i === 0 ) {

					cameraVR.matrix.copy( camera.matrix );

				}

			}

		}

		//

		for ( var i = 0; i < controllers.length; i ++ ) {

			var controller = controllers[ i ];

			var inputSource = sortedInputSources[ i ];

			if ( inputSource ) {

				var inputPose = frame.getPose( inputSource.targetRaySpace, referenceSpace );

				if ( inputPose !== null ) {

					controller.matrix.fromArray( inputPose.transform.matrix );
					controller.matrix.decompose( controller.position, controller.rotation, controller.scale );
					controller.visible = true;

					continue;

				}

			}

			controller.visible = false;

		}

		if ( onAnimationFrameCallback ) onAnimationFrameCallback( time );

	}

	var animation = new WebGLAnimation();
	animation.setAnimationLoop( onAnimationFrame );

	this.setAnimationLoop = function ( callback ) {

		onAnimationFrameCallback = callback;

	};

	this.dispose = function () {};

	// DEPRECATED

	this.getStandingMatrix = function () {

		console.warn( 'THREE.WebXRManager: getStandingMatrix() is no longer needed.' );
		return new Matrix4();

	};

	this.getDevice = function () {

		console.warn( 'THREE.WebXRManager: getDevice() has been deprecated.' );

	};

	this.setDevice = function () {

		console.warn( 'THREE.WebXRManager: setDevice() has been deprecated.' );

	};

	this.setFrameOfReferenceType = function () {

		console.warn( 'THREE.WebXRManager: setFrameOfReferenceType() has been deprecated.' );

	};

	this.submitFrame = function () {};

}

Object.assign( WebXRManager.prototype, EventDispatcher.prototype );

export { WebXRManager };
