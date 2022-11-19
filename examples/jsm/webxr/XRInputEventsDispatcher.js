import { Object3D } from 'three';

import {
	Constants as MotionControllerConstants,
	fetchProfile,
	MotionController
} from '../libs/motion-controllers.module.js';

const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

class XRInputEventsDispatcher extends Object3D {

	constructor( xrManager, controllerIndices ) {

		super();

		if ( ! xrManager ) {

			console.warn( 'XRInputEventsDispatcher requires a valid WebXRManager.' );
			return;

		}

		if ( ! controllerIndices || controllerIndices.length === 0 ) {

			console.warn( 'XRInputEventsDispatcher requires valid controller indices.' );
			return;

		}

		this.controllers = {};
		this.motionControllers = {};

		for ( const controllerIdx of controllerIndices ) {

			const controllerGrip = xrManager.getControllerGrip( controllerIdx );
			this.controllers[ controllerIdx ] = controllerGrip;

			controllerGrip.addEventListener( 'connected', ( event ) => {

				const xrInputSource = event.data;

				if ( xrInputSource.targetRayMode !== 'tracked-pointer' || ! xrInputSource.gamepad || xrInputSource.hand ) return;

				fetchProfile( xrInputSource, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {

					this.motionControllers[ controllerIdx ] = new MotionController(
						xrInputSource,
						profile,
						assetPath
					);


					const handedness = xrInputSource.handedness;
					const partialIdsList = ( this._partialIds ) ? this._partialIds[ handedness ] : null;
					if ( partialIdsList ) {

						for ( const partialId of this._partialIds[ handedness ] ) {

							const components = this.motionControllers[ controllerIdx ].components;
							const matchedComponents = Object.values( components ).filter( ( component ) => {

								return component.id.includes( partialId );

							 } );

							if ( matchedComponents.length > 0 ) {

								this._dispatchMatchedComponents( matchedComponents, handedness, partialId, xrInputSource );

							} else {

								console.warn( `Could not find ${ partialId } on the ${ handedness } controller` );

							}


						}

					}

				} ).catch( ( err ) => {

					console.warn( err );

				} );

			} );

			controllerGrip.addEventListener( 'disconnected', () => {

				this.controllers[ controllerIdx ] = null;
				this.motionControllers[ controllerIdx ] = null;

			} );

		}

		return this;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		for ( const motionController of Object.values( this.motionControllers ) ) {

			if ( motionController ) {

				// Cause the MotionController to poll the Gamepad for data
				motionController.updateFromGamepad();

			}

		}

	}

	registerInputForEvents( pairsOrHandedness, partialId ) {

		if ( ! pairsOrHandedness ) {

			console.warn( 'XRInputEvntsDispatcher.registerInputForEvents requires an array of handedness and partial IDs.' );
			return;

		}

		let pairs = pairsOrHandedness;

		// Check if handedness and paritalId passed separately instead of an array of arrays
		if ( arguments.length === 2 ) {

			pairs = [[ pairsOrHandedness, partialId ]];

		}

		for ( const [ handedness, partialId ] of pairs ) {

			if ( ! handedness
				|| ( handedness !== MotionControllerConstants.Handedness.LEFT
					&& handedness !== MotionControllerConstants.Handedness.RIGHT
					&& handedness !== MotionControllerConstants.Handedness.NONE ) ) {

				console.warn( 'XRInputEventsDispatcher.registerInputForEvents requires a valid handedness value.' );
				continue;

			}

			if ( ! partialId ) {

				console.warn( 'XRInputEventsDispatcher.registerInputForEvents requires a valid partialId value.' );
				continue;

			}

			if ( ! this._partialIds ) this._partialIds = {};
			if ( ! this._partialIds[ handedness ] ) this._partialIds[ handedness ] = [];

			this._partialIds[ handedness ].push( partialId );

		}

	}

	// Private method

	_dispatchMatchedComponents( matchedComponents, handedness, partialId, xrInputSource ) {

		const eventTypeString = `${handedness}-${partialId}`;
		this.dispatchEvent( {
			type: eventTypeString,
			target: this,
			partialId: partialId,
			handedness: handedness,
			xrInputSource: xrInputSource,
			// Send references to components instead of copies so that the listener can use it after receiving this event
			components: matchedComponents
		} );

	}

}

export { XRInputEventsDispatcher };
