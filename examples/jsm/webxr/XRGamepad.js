/**
 * This class provides gamepad input events from grip controller updates.
 * The events dispatched are pressed, pressedend and movechanged.
 * Button press and press end states are detected by the active state so they are only called once.
 * Move changes of the joystick are detected by a threshold.
 * The update callback can be enabled / disabled with a setter.
 *
 * @augments EventDispatcher
 * @three_import import { XRGamepad } from 'three/addons/webxr/XRGamepad.js';
 */

import { EventDispatcher } from 'three';

class XRGamepad extends EventDispatcher {

	/**
     * Constructs a new XRGamepad
     *
     * @param {Group} controllerGrip - The controller grip space.
     */
	constructor( controllerGrip ) {

		super();

		/**
         * The current button state to prevent muitiple events called.
         *
         * @private
         * @type {Array}
         */
		this.previousButtonState = [];

		/**
         * Store the current axis data to detect movement changes.
         *
         * @private
         * @type {Array}
         */
		this.previousAxes = null;

		/**
         * The threshold to detect joystick movement changes.
         *
         * @private
         * @type {Number}
         */
		this._moveThreshold = 0.08;

		/**
         * The grip controller to get update events from.
         *
         * @private
         * @type {?Group}
         */
		this._controllerGrip = controllerGrip;

		/**
         * The grip update callback reference
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._updateRef = ( event ) => this._update( event.data );

		//initially set enabled
		this.enable = true;

	}

	/**
     * Enable / disable the grip controller updates.
     * @param {boolean} value
     */
	set enable( value ) {

		const controllerGrip = this._controllerGrip;

		controllerGrip.enableUpdate = value;
		if ( value ) {

			controllerGrip.addEventListener( 'update', this._updateRef );

		} else {

			controllerGrip.removeEventListener( 'update', this._updateRef );

		}

	}

	/**
     * Update the move change detection threshold.
     * @param {boolean} threshold
     */
	set moveThreshold( threshold ) {

		this._moveThreshold = threshold;

	}

	/**
     * Gamepad XR controller update method on connection
     * @param {XRInputSource} inputSource
     */
	_update( inputSource ) {

		const gamepad = inputSource.gamepad,
			buttons = gamepad.buttons,
			//is a button pressed with a value of 1
			activeButton = buttons.filter( button => button.pressed && button.value == 1 )[ 0 ],
			activeIndex = buttons.indexOf( activeButton );

		//check once if a button has been pressed and not set as its active for many frames
		if ( activeButton && ! this.previousButtonState[ activeIndex ] ) {

			//console.log("active ", activeButton, activeIndex);

			this.previousButtonState[ activeIndex ] = true;

			this.dispatchEvent( { type: 'pressed', button: activeButton, index: activeIndex } );

			//clear the pressed stated after 300ms when the gamepad button pressed stage changes
			setTimeout( () => {

				this.previousButtonState[ activeIndex ] = false;
				this.dispatchEvent( { type: 'pressedend', button: activeButton, index: activeIndex } );

			}, 300 );

		}

		const currentAxes = gamepad.axes;

		//check for joystick axes changes
		if ( this.previousAxes ) {

			//only update a move changed event if values of the axes changes within a threashold

			const hasChanged = currentAxes.some( ( value, index ) => Math.abs( value - this.previousAxes[ index ] ) > this._moveThreshold );

			if ( hasChanged ) {

				this.dispatchEvent( { type: 'movechanged', axes: currentAxes } );

			}

		}

		this.previousAxes = currentAxes.slice();

	}

}

export { XRGamepad };
