import * as THREE from '../../build/three.module.js';

import { HTMLMesh } from '../../examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from '../../examples/jsm/interactive/InteractiveGroup.js';

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

			const sidebar = document.getElementById( 'sidebar' );
			sidebar.style.width = '300px';
			sidebar.style.height = '700px';

			//

			if ( group === null ) {

				group = new InteractiveGroup( renderer );
				editor.sceneHelpers.add( group );

				const mesh = new HTMLMesh( sidebar );
				mesh.position.set( 1, 1.5, - 0.5 );
				mesh.rotation.y = - 0.5;
				mesh.scale.setScalar( 2 );
				group.add( mesh );

				intersectables.push( mesh );

				// controllers

				const geometry = new THREE.BufferGeometry();
				geometry.setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 5 ) ] );

				const controller1 = renderer.xr.getController( 0 );
				controller1.add( new THREE.Line( geometry ) );
				group.add( controller1 );

				const controller2 = renderer.xr.getController( 1 );
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

			camera = editor.camera.clone();

			group.visible = true;

			this.currentSession = session;
			this.currentSession.addEventListener( 'end', onSessionEnded );

			await renderer.xr.setSession( this.currentSession );

		};

		const onSessionEnded = async () => {

			const sidebar = document.getElementById( 'sidebar' );
			sidebar.style.width = '';
			sidebar.style.height = '';

			//

			editor.camera.copy( camera );

			group.visible = false;

			this.currentSession.removeEventListener( 'end', onSessionEnded );
			this.currentSession = null;

			await renderer.xr.setSession( null );

			signals.exitedVR.dispatch();

		};

		// signals

		signals.toggleVR.add( () => {

			if ( this.currentSession === null ) {

				const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
				navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

			} else {

				this.currentSession.end();

			}

		} );

		signals.rendererCreated.add( ( value ) => {

			renderer = value;
			renderer.xr.enabled = true;

		} );

	}

}

export { VR };
