import * as THREE from '../../build/three.module.js';

import { HTMLMesh } from './libs/three.html.js';

import { XRControllerModelFactory } from '../../examples/jsm/webxr/XRControllerModelFactory.js';

class VR {

	constructor( editor ) {

		const signals = editor.signals;

		let group = null;

		let camera = null;
		let renderer = null;

		this.currentSession = null;

		const onSessionStarted = async ( session ) => {

			if ( group === null ) {

				group = new THREE.Group();
				editor.sceneHelpers.add( group );

				const mesh = new HTMLMesh( document.getElementById( 'sidebar' ) );
				mesh.position.set( 1, 1.5, 0 );
				mesh.rotation.y = - 0.5;
				group.add( mesh );

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
