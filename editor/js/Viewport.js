import * as THREE from '../../build/three.module.js';

import { TransformControls } from '../../examples/jsm/controls/TransformControls.js';

import { UIPanel } from './libs/ui.js';

import { EditorControls } from './EditorControls.js';

import { ViewportCamera } from './Viewport.Camera.js';
import { ViewportInfo } from './Viewport.Info.js';
import { ViewHelper } from './Viewport.ViewHelper.js';

import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { SetRotationCommand } from './commands/SetRotationCommand.js';
import { SetScaleCommand } from './commands/SetScaleCommand.js';

function Viewport( editor ) {

	var signals = editor.signals;

	var container = new UIPanel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new ViewportCamera( editor ) );
	container.add( new ViewportInfo( editor ) );

	//

	var renderer = null;
	var pmremGenerator = null;
	var pmremTexture = null;

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;
	var showSceneHelpers = true;

	var objects = [];

	// helpers

	var grid = new THREE.GridHelper( 30, 30, 0x444444, 0x888888 );
	var viewHelper = new ViewHelper( camera, container );

	//

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var objectPositionOnDown = null;
	var objectRotationOnDown = null;
	var objectScaleOnDown = null;

	var transformControls = new TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );

			var helper = editor.helpers[ object.id ];

			if ( helper !== undefined && helper.isSkeletonHelper !== true ) {

				helper.update();

			}

			signals.refreshSidebarObject3D.dispatch( object );

		}

		render();

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		var object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			switch ( transformControls.getMode() ) {

				case 'translate':

					if ( ! objectPositionOnDown.equals( object.position ) ) {

						editor.execute( new SetPositionCommand( editor, object, object.position, objectPositionOnDown ) );

					}

					break;

				case 'rotate':

					if ( ! objectRotationOnDown.equals( object.rotation ) ) {

						editor.execute( new SetRotationCommand( editor, object, object.rotation, objectRotationOnDown ) );

					}

					break;

				case 'scale':

					if ( ! objectScaleOnDown.equals( object.scale ) ) {

						editor.execute( new SetScaleCommand( editor, object, object.scale, objectScaleOnDown ) );

					}

					break;

			}

		}

		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	// events

	function updateAspectRatio() {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

	}

	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return raycaster.intersectObjects( objects );

	}

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					editor.select( object.userData.object );

				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );

			}

			render();

		}

	}

	function onMouseDown( event ) {

		// event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseUp( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	}

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	}

	function onDoubleClick( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		signals.cameraChanged.dispatch( camera );
		signals.refreshSidebarObject3D.dispatch( camera );

	} );
	viewHelper.controls = controls;

	// signals

	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		render();

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.rendererUpdated.add( function () {

		scene.traverse( function ( child ) {

			if ( child.material !== undefined ) {

				child.material.needsUpdate = true;

			}

		} );

		render();

	} );

	signals.rendererChanged.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			renderer.dispose();
			pmremGenerator.dispose();
			pmremTexture = null;

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;

		renderer.setClearColor( 0xaaaaaa );

		if ( window.matchMedia ) {

			var mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
			mediaQuery.addListener( function ( event ) {

				renderer.setClearColor( event.matches ? 0x333333 : 0xaaaaaa );
				updateGridColors( grid, event.matches ? [ 0x888888, 0x222222 ] : [ 0x282828, 0x888888 ] );

				render();

			} );

			renderer.setClearColor( mediaQuery.matches ? 0x333333 : 0xaaaaaa );
			updateGridColors( grid, mediaQuery.matches ? [ 0x888888, 0x222222 ] : [ 0x282828, 0x888888 ] );

		}

		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		pmremGenerator = new THREE.PMREMGenerator( renderer );
		pmremGenerator.compileEquirectangularShader();

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	signals.cameraChanged.add( function () {

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null && object !== scene && object !== camera ) {

			box.setFromObject( object );

			if ( box.isEmpty() === false ) {

				selectionBox.setFromObject( object );
				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( object ) {

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );

		}

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.push( child );

		} );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			selectionBox.setFromObject( object );

		}

		if ( object.isPerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		if ( editor.helpers[ object.id ] !== undefined ) {

			editor.helpers[ object.id ].update();

		}

		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		controls.enabled = true; // see #14180
		if ( object === transformControls.object ) {

			transformControls.detach();

		}

		object.traverse( function ( child ) {

			objects.splice( objects.indexOf( child ), 1 );

		} );

	} );

	signals.helperAdded.add( function ( object ) {

		var picker = object.getObjectByName( 'picker' );

		if ( picker !== undefined ) {

			objects.push( picker );

		}

	} );

	signals.helperRemoved.add( function ( object ) {

		var picker = object.getObjectByName( 'picker' );

		if ( picker !== undefined ) {

			objects.splice( objects.indexOf( picker ), 1 );

		}

	} );

	signals.materialChanged.add( function () {

		render();

	} );

	// background

	signals.sceneBackgroundChanged.add( function ( backgroundType, backgroundColor, backgroundTexture, backgroundEquirectangularTexture, environmentType ) {

		pmremTexture = null;

		switch ( backgroundType ) {

			case 'None':

				scene.background = null;

				break;

			case 'Color':

				scene.background = new THREE.Color( backgroundColor );

				break;

			case 'Texture':

				if ( backgroundTexture ) {

					scene.background = backgroundTexture;

				}

				break;

			case 'Equirectangular':

				if ( backgroundEquirectangularTexture ) {

					pmremTexture = pmremGenerator.fromEquirectangular( backgroundEquirectangularTexture ).texture;

					var renderTarget = new THREE.WebGLCubeRenderTarget( 512 );
					renderTarget.fromEquirectangularTexture( renderer, backgroundEquirectangularTexture );
					renderTarget.toJSON = function () { return null }; // TODO Remove hack

					scene.background = renderTarget;

				}

				break;

		}

		if ( environmentType === 'Background' ) {

			scene.environment = pmremTexture;

		}

		render();

	} );

	// environment

	signals.sceneEnvironmentChanged.add( function ( environmentType ) {

		switch ( environmentType ) {

			case 'None':
				scene.environment = null;
				break;
			case 'Background':
				scene.environment = pmremTexture;
				break;

		}

		render();

	} );

	// fog

	signals.sceneFogChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		switch ( fogType ) {

			case 'None':
				scene.fog = null;
				break;
			case 'Fog':
				scene.fog = new THREE.Fog( fogColor, fogNear, fogFar );
				break;
			case 'FogExp2':
				scene.fog = new THREE.FogExp2( fogColor, fogDensity );
				break;

		}

		render();

	} );

	signals.sceneFogSettingsChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		switch ( fogType ) {

			case 'Fog':
				scene.fog.color.setHex( fogColor );
				scene.fog.near = fogNear;
				scene.fog.far = fogFar;
				break;
			case 'FogExp2':
				scene.fog.color.setHex( fogColor );
				scene.fog.density = fogDensity;
				break;

		}

		render();

	} );

	signals.viewportCameraChanged.add( function () {

		var viewportCamera = editor.viewportCamera;

		if ( viewportCamera.isPerspectiveCamera ) {

			viewportCamera.aspect = editor.camera.aspect;
			viewportCamera.projectionMatrix.copy( editor.camera.projectionMatrix );

		} else if ( viewportCamera.isOrthographicCamera ) {

			// TODO

		}

		// disable EditorControls when setting a user camera

		controls.enabled = ( viewportCamera === editor.camera );

		render();

	} );

	//

	signals.windowResize.add( function () {

		updateAspectRatio();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

	signals.showHelpersChanged.add( function ( showHelpers ) {

		showSceneHelpers = showHelpers;
		transformControls.enabled = showHelpers;

		render();

	} );

	signals.cameraResetted.add( updateAspectRatio );

	// animations

	var clock = new THREE.Clock(); // only used for animations

	function animate() {

		requestAnimationFrame( animate );

		var mixer = editor.mixer;
		var delta = clock.getDelta();

		var needsUpdate = false;

		if ( mixer.stats.actions.inUse > 0 ) {

			mixer.update( delta );
			needsUpdate = true;

		}

		if ( viewHelper.animating === true ) {

			viewHelper.update( delta );
			needsUpdate = true;

		}

		if ( needsUpdate === true ) render();

	}

	requestAnimationFrame( animate );

	//

	var startTime = 0;
	var endTime = 0;

	function render() {

		startTime = performance.now();

		// Adding/removing grid to scene so materials with depthWrite false
		// don't render under the grid.

		scene.add( grid );
		renderer.setViewport( 0, 0, container.dom.offsetWidth, container.dom.offsetHeight );
		renderer.render( scene, editor.viewportCamera );
		scene.remove( grid );

		if ( camera === editor.viewportCamera ) {

			renderer.autoClear = false;
			if ( showSceneHelpers === true ) renderer.render( sceneHelpers, camera );
			viewHelper.render( renderer );
			renderer.autoClear = true;

		}

		endTime = performance.now();
		editor.signals.sceneRendered.dispatch( endTime - startTime );

	}

	return container;

}

function updateGridColors( grid, colors ) {

	const color1 = new THREE.Color( colors[ 0 ] );
	const color2 = new THREE.Color( colors[ 1 ] );

	const attribute = grid.geometry.attributes.color;
	const array = attribute.array;

	for ( var i = 0; i < array.length; i += 12 ) {

		const color = ( i % ( 12 * 5 ) === 0 ) ? color1 : color2;

		for ( var j = 0; j < 12; j += 3 ) {

			color.toArray( array, i + j );

		}

	}

	attribute.needsUpdate = true;

}

export { Viewport };
