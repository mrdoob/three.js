import * as THREE from 'three';

import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { SetRotationCommand } from './commands/SetRotationCommand.js';

import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

class XR {

	constructor( editor ) {

		const signals = editor.signals;

		let group = null;
		let renderer = null;

		const camera = new THREE.PerspectiveCamera();

		const onSessionStarted = async ( session ) => {

			camera.copy( editor.camera );

			const sidebar = document.getElementById( 'sidebar' );
			sidebar.style.width = '350px';
			sidebar.style.height = '700px';

			//

			if ( group === null ) {

				group = new InteractiveGroup();
				group.listenToXRControllerEvents( renderer );

				const mesh = new HTMLMesh( sidebar );
				mesh.position.set( 1, 1.5, - 0.5 );
				mesh.rotation.y = - 0.5;
				mesh.scale.setScalar( 2 );
				group.add( mesh );

				// controllers

				const raycaster = new THREE.Raycaster();
				const tempMatrix = new THREE.Matrix4();

				function getIntersections( controller ) {

					tempMatrix.identity().extractRotation( controller.matrixWorld );

					raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
					raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

					return raycaster.intersectObjects( editor.scene.children, false );

				}

				function onSelectStart( event ) {

					const controller = event.target;
					const intersections = getIntersections( controller );

					if ( intersections.length > 0 ) {

						const intersection = intersections[ 0 ];
						const object = intersection.object;

						signals.objectSelected.dispatch( object );

						controller.userData.selected = object;
						controller.userData.position = object.position.clone();
						controller.userData.rotation = object.rotation.clone();

						controller.attach( object );

					}

				}

				function onSelectEnd( event ) {

					const controller = event.target;

					if ( controller.userData.selected !== undefined ) {

						const object = controller.userData.selected;
						editor.scene.attach( object );

						controller.userData.selected = undefined;

						editor.execute( new SetPositionCommand( editor, object, object.position, controller.userData.position ) );
						editor.execute( new SetRotationCommand( editor, object, object.rotation, controller.userData.rotation ) );

						signals.objectChanged.dispatch( object );

					} else {

						signals.objectSelected.dispatch( null );

					}

				}

				const geometry = new THREE.BufferGeometry();
				geometry.setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 5 ) ] );

				const controller1 = renderer.xr.getController( 0 );
				controller1.addEventListener( 'selectstart', onSelectStart );
				controller1.addEventListener( 'selectend', onSelectEnd );
				controller1.add( new THREE.Line( geometry ) );
				group.add( controller1 );

				const controller2 = renderer.xr.getController( 1 );
				controller2.addEventListener( 'selectstart', onSelectStart );
				controller2.addEventListener( 'selectend', onSelectEnd );
				controller2.add( new THREE.Line( geometry ) );
				group.add( controller2 );

				//

				const controllerModelFactory = new XRControllerModelFactory();

				const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				group.add( controllerGrip1 );

				const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				group.add( controllerGrip2 );

			}

			editor.sceneHelpers.add( group );

			renderer.xr.enabled = true;
			renderer.xr.addEventListener( 'sessionend', onSessionEnded );

			await renderer.xr.setSession( session );

		};

		const onSessionEnded = async () => {

			editor.sceneHelpers.remove( group );

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

			navigator.xr.requestSession( mode, sessionInit ).then( onSessionStarted );

		} );

		signals.offerXR.add( function ( mode ) {

			navigator.xr.offerSession( mode, sessionInit )
				.then( onSessionStarted );

			signals.leaveXR.add( function () {

				navigator.xr.offerSession( mode, sessionInit )
					.then( onSessionStarted );
	
			} );

		} );

		signals.rendererCreated.add( ( value ) => {

			renderer = value;

		} );

	}

}

export { XR };
