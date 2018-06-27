/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Group } from '../../objects/Group.js';
import { Vector4 } from '../../math/Vector4.js';
import { ArrayCamera } from '../../cameras/ArrayCamera.js';
import { PerspectiveCamera } from '../../cameras/PerspectiveCamera.js';
import { WebGLAnimation } from '../webgl/WebGLAnimation.js';

function WebXRManager( renderer ) {

	var gl = renderer.context;

	var device = null;
	var session = null;

	var frameOfRef = null;

	var pose = null;

	var controllers = [];
	var inputSources = [];

	function isPresenting() {

		return session !== null && frameOfRef !== null;


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

	this.getDevice = function () {

		return device;

	};

	this.setDevice = function ( value ) {

		if ( value !== undefined ) device = value;

		gl.setCompatibleXRDevice( value );

	};

	//

	function onSessionEvent( event ) {

		var controller = controllers[ inputSources.indexOf( event.inputSource ) ];
		if ( controller ) controller.dispatchEvent( { type: event.type } );

	}

	function onSessionEnd() {

		renderer.setFramebuffer( null );
		animation.stop();

	}

	this.setSession = function ( value, options ) {

		session = value;

		if ( session !== null ) {

			session.addEventListener( 'select', onSessionEvent );
			session.addEventListener( 'selectstart', onSessionEvent );
			session.addEventListener( 'selectend', onSessionEvent );
			session.addEventListener( 'end', onSessionEnd );

			session.baseLayer = new XRWebGLLayer( session, gl );
			session.requestFrameOfReference( options.frameOfReferenceType ).then( function ( value ) {

				frameOfRef = value;

				renderer.setFramebuffer( session.baseLayer.framebuffer );

				animation.setContext( session );
				animation.start();

			} );

			//

			inputSources = session.getInputSources();

			session.addEventListener( 'inputsourceschange', function () {

				inputSources = session.getInputSources();
				console.log( inputSources );

			} );

		}

	};

	function updateCamera( camera, parent ) {

		if ( parent === null ) {

			camera.matrixWorld.copy( camera.matrix );

		} else {

			camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );

		}

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	}

	this.getCamera = function ( camera ) {

		if ( isPresenting() ) {

			var parent = camera.parent;
			var cameras = cameraVR.cameras;

			// apply camera.parent to cameraVR

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

			return cameraVR;

		}

		return camera;

	};

	this.isPresenting = isPresenting;

	// Animation Loop

	var onAnimationFrameCallback = null;

	function onAnimationFrame( time, frame ) {

		pose = frame.getDevicePose( frameOfRef );

		if ( pose !== null ) {

			var layer = session.baseLayer;
			var views = frame.views;

			for ( var i = 0; i < views.length; i ++ ) {

				var view = views[ i ];
				var viewport = layer.getViewport( view );
				var viewMatrix = pose.getViewMatrix( view );

				var camera = cameraVR.cameras[ i ];
				camera.matrix.fromArray( viewMatrix ).getInverse( camera.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				camera.viewport.set( viewport.x, viewport.y, viewport.width, viewport.height );

				if ( i === 0 ) {

					cameraVR.matrix.copy( camera.matrix );

					// HACK (mrdoob)
					// https://github.com/w3c/webvr/issues/203

					cameraVR.projectionMatrix.copy( camera.projectionMatrix );

				}

			}

		}

		//

		for ( var i = 0; i < controllers.length; i ++ ) {

			var controller = controllers[ i ];

			var inputSource = inputSources[ i ];

			if ( inputSource ) {

				var inputPose = frame.getInputPose( inputSource, frameOfRef );

				if ( inputPose !== null ) {

					controller.matrix.elements = inputPose.pointerMatrix;
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
		return new THREE.Matrix4();

	};

	this.submitFrame = function () {};

}

export { WebXRManager };
