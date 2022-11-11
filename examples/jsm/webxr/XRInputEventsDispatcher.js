import { Object3D } from 'three';

import {
	fetchProfile,
	MotionController
} from '../libs/motion-controllers.module.js';

const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

class XRInputEventsDispatcher extends Object3D {

	constructor( xrManager, controllerIndices ) {

		super();

		this.xrManager = xrManager;

		this.controllers = {};
		this.motionControllers = {};
		this.previousStates = {};
		// this.componentIdList = [];

		controllerIndices.forEach( controllerIdx => {

			const controllerGrip = xrManager.getControllerGrip( controllerIdx );
			this.controllers[ controllerIdx ] = controllerGrip;
			this.previousStates[ controllerIdx ] = {};

			controllerGrip.addEventListener( 'connected', ( event ) => {

				const xrInputSource = event.data;

				if ( xrInputSource.targetRayMode !== 'tracked-pointer' || ! xrInputSource.gamepad ) return;

				fetchProfile( xrInputSource, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {

					this.motionControllers[ controllerIdx ] = new MotionController(
						xrInputSource,
						profile,
						assetPath
					);

					// this.componentIdList = Object.keys( this.motionController.components );

				} ).catch( ( err ) => {

					console.warn( err );

				} );

			} );

			controllerGrip.addEventListener( 'disconnected', () => {

				this.controllers[ controllerIdx ] = null;
				this.motionControllers[ controllerIdx ] = null;

			} );

		} );

		return this;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		for ( const [ controllerIdx, motionController ] of Object.entries( this.motionControllers ) ) {

			if ( motionController ) {

				// Cause the MotionController to poll the Gamepad for data
				motionController.updateFromGamepad();

				// Send out events for each component
				this.dispatchStateChangeEvents( controllerIdx );

			}

		}

	}

	dispatchStateChangeEvents( controllerIdx ) {

		const motionController = this.motionControllers[ controllerIdx ];

		Object.values( motionController.components ).forEach( ( component ) => {

			const { id, values } = component;

			// Compare current states against previous ones
			if ( this.previousStates[ controllerIdx ][ id ] !== values.state ) {

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
			this.previousStates[ controllerIdx ][ id ] = values.state;

		} );

	}

}

export { XRInputEventsDispatcher };
