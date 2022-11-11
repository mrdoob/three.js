import { Object3D } from 'three';

import {
	fetchProfile,
	MotionController
} from '../libs/motion-controllers.module.js';

const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

class XRInputEventsDispatcher extends Object3D {

	constructor( controller ) {

		super();

		this.previousStates = [];
		this.componentIdList = [];

		controller.addEventListener( 'connected', ( event ) => {

			const xrInputSource = event.data;

			if ( xrInputSource.targetRayMode !== 'tracked-pointer' || ! xrInputSource.gamepad ) return;

			fetchProfile( xrInputSource, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {

				this.motionController = new MotionController(
					xrInputSource,
					profile,
					assetPath
				);

				this.componentIdList = Object.keys( this.motionController.components );

			} ).catch( ( err ) => {

				console.warn( err );

			} );

		} );

		controller.addEventListener( 'disconnected', () => {

			this.motionController = null;

		} );

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( ! this.motionController ) return;

		// Cause the MotionController to poll the Gamepad for data
		this.motionController.updateFromGamepad();

		// Send out events for each component
		this.dispatchStateChangeEvents();

	}

	dispatchStateChangeEvents() {

		const motionController = this.motionController;

		Object.values( motionController.components ).forEach( ( component ) => {

			const { id, values } = component;

			// Compare current states against previous ones
			if ( this.previousStates[ id ] !== values.state ) {

				this.dispatchEvent( {
					type: 'xrInputStateChanged',
					target: this,
					id: id,
					valuesType: component.type,
					// Send reference instead of copy so that the listener can use it after the initial state change event
					values: component.values
				} );

			}

			// Cache current states to compare against in the next frame
			this.previousStates[ id ] = values.state;

		} );

	}

}

export { XRInputEventsDispatcher };
