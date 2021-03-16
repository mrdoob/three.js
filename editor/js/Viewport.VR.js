import * as THREE from '../../build/three.module.js';

import { HTMLMesh } from './libs/three.html.js';

import { XRControllerModelFactory } from '../../examples/jsm/webxr/XRControllerModelFactory.js';

class VR {

	constructor( editor ) {

		const signals = editor.signals;

		let group = null;

		let camera = null;
		let renderer = null;

		const intersectables = [];

		this.currentSession = null;

		const onSessionStarted = async ( session ) => {

			if ( group === null ) {

				group = new THREE.Group();
				editor.sceneHelpers.add( group );

				const mesh = new HTMLMesh( document.getElementById( 'sidebar' ), 300, 700 );
				mesh.position.set( 1, 1.5, - 0.5 );
				mesh.rotation.y = - 0.5;
				group.add( mesh );

				intersectables.push( mesh );

				// controllers

				const controller1 = renderer.xr.getController( 0 );
				controller1.addEventListener( 'select', onSelect );
				group.add( controller1 );

				const controller2 = renderer.xr.getController( 1 );
				controller2.addEventListener( 'selectstart', onSelect );
				group.add( controller2 );

				const geometry = new THREE.BufferGeometry();
				geometry.setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 5 ) ] );

				controller1.add( new THREE.Line( geometry ) );
				controller2.add( new THREE.Line( geometry ) );

				//

				const controllerModelFactory = new XRControllerModelFactory();

				const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				group.add( controllerGrip1 );

				const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				group.add( controllerGrip2 );

			}

			camera = editor.camera.clone();

			group.visible = true;

			this.currentSession = session;
			this.currentSession.addEventListener( 'end', onSessionEnded );

			await renderer.xr.setSession( this.currentSession );

		};

		const onSessionEnded = async () => {

			editor.camera.copy( camera );

			group.visible = false;

			this.currentSession.removeEventListener( 'end', onSessionEnded );
			this.currentSession = null;

			await renderer.xr.setSession( null );

			signals.exitedVR.dispatch();

		};

		//

		function onSelect( event ) {

			const controller = event.target;

			const intersections = getIntersections( controller );

			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;

				object.material.map.click( uv.x, 1 - uv.y );

			}

		}

		const raycaster = new THREE.Raycaster();
		const tempMatrix = new THREE.Matrix4();

		function getIntersections( controller ) {

			tempMatrix.identity().extractRotation( controller.matrixWorld );

			raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
			raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

			return raycaster.intersectObjects( intersectables );

		}

		// signals

		signals.toggleVR.add( () => {

			if ( this.currentSession === null ) {

				const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
				navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

			} else {

				this.currentSession.end();

			}

		} );

		signals.rendererChanged.add( ( value ) => {

			renderer = value;
			renderer.xr.enabled = true;

		} );

	}

}

export { VR };
