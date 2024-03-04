import * as THREE from 'three';

import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

class XR {

	constructor( editor, controls ) {

		const selector = editor.selector;
		const signals = editor.signals;

		let controllers = null;
		let group = null;
		let renderer = null;

		const camera = new THREE.PerspectiveCamera();

		const onSessionStarted = async ( session ) => {

			camera.copy( editor.camera );

			const sidebar = document.getElementById( 'sidebar' );
			sidebar.style.width = '350px';
			sidebar.style.height = '700px';

			//

			if ( controllers === null ) {

				const geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 5 ], 3 ) );

				const line = new THREE.Line( geometry );

				const raycaster = new THREE.Raycaster();

				function onSelect( event ) {

					const controller = event.target;

					controller1.userData.active = false;
					controller2.userData.active = false;

					if ( controller === controller1 ) {

						controller1.userData.active = true;
						controller1.add( line );

					}

					if ( controller === controller2 ) {

						controller2.userData.active = true;
						controller2.add( line );

					}

					raycaster.setFromXRController( controller );

					const intersects = selector.getIntersects( raycaster );

					if ( intersects.length > 0 ) {

						// Ignore menu clicks

						const intersect = intersects[ 0 ];
						if ( intersect.object === group.children[ 0 ] ) return;

					}

					signals.intersectionsDetected.dispatch( intersects );

				}

				function onControllerEvent( event ) {

					const controller = event.target;

					if ( controller.userData.active === false ) return;

					controls.getRaycaster().setFromXRController( controller );

					switch ( event.type ) {

						case 'selectstart':
							controls.pointerDown( null );
							break;

						case 'selectend':
							controls.pointerUp( null );
							break;

						case 'move':
							controls.pointerHover( null );
							controls.pointerMove( null );
							break;

					}

				}

				controllers = new THREE.Group();

				const controller1 = renderer.xr.getController( 0 );
				controller1.addEventListener( 'select', onSelect );
				controller1.addEventListener( 'selectstart', onControllerEvent );
				controller1.addEventListener( 'selectend', onControllerEvent );
				controller1.addEventListener( 'move', onControllerEvent );
				controller1.userData.active = false;
				controllers.add( controller1 );

				const controller2 = renderer.xr.getController( 1 );
				controller2.addEventListener( 'select', onSelect );
				controller2.addEventListener( 'selectstart', onControllerEvent );
				controller2.addEventListener( 'selectend', onControllerEvent );
				controller2.addEventListener( 'move', onControllerEvent );
				controller2.userData.active = true;
				controllers.add( controller2 );

				//

				const controllerModelFactory = new XRControllerModelFactory();

				const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				controllers.add( controllerGrip1 );

				const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				controllers.add( controllerGrip2 );

				// menu

				group = new InteractiveGroup();

				const mesh = new HTMLMesh( sidebar );
				mesh.name = 'picker'; // Make Selector be aware of the menu
				mesh.position.set( 0.5, 1.0, - 0.5 );
				mesh.rotation.y = - 0.5;
				group.add( mesh );

				group.listenToXRControllerEvents( controller1 );
				group.listenToXRControllerEvents( controller2 );

			}

			editor.sceneHelpers.add( group );
			editor.sceneHelpers.add( controllers );

			renderer.xr.enabled = true;
			renderer.xr.addEventListener( 'sessionend', onSessionEnded );

			await renderer.xr.setSession( session );

		};

		const onSessionEnded = async () => {

			editor.sceneHelpers.remove( group );
			editor.sceneHelpers.remove( controllers );

			const sidebar = document.getElementById( 'sidebar' );
			sidebar.style.width = '';
			sidebar.style.height = '';

			renderer.xr.removeEventListener( 'sessionend', onSessionEnded );
			renderer.xr.enabled = false;

			editor.camera.copy( camera );

			signals.windowResize.dispatch();
			signals.leaveXR.dispatch();

		};

		// signals

		const sessionInit = { optionalFeatures: [ 'local-floor' ] };

		signals.enterXR.add( ( mode ) => {

			if ( 'xr' in navigator ) {

				navigator.xr.requestSession( mode, sessionInit )
					.then( onSessionStarted );

			}

		} );

		signals.offerXR.add( function ( mode ) {

			if ( 'xr' in navigator ) {

				navigator.xr.offerSession( mode, sessionInit )
					.then( onSessionStarted );

				signals.leaveXR.add( function () {

					navigator.xr.offerSession( mode, sessionInit )
						.then( onSessionStarted );

				} );

			}

		} );

		signals.rendererCreated.add( ( value ) => {

			renderer = value;

		} );

	}

}

export { XR };
