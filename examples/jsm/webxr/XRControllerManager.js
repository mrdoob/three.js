import { EventDispatcher } from 'three';
import { XRControllerModelFactory } from './XRControllerModelFactory';
import { OculusHandModel } from './OculusHandModel';
import { OculusHandPointerModel } from './OculusHandPointerModel';
import { GripPointerModel } from './GripPointerModel';
import { GazePointerModel } from './GazePointerModel';
import { XRGamepad } from './XRGamepad';
import { XRIntersections } from './XRintersections';

/**
 * This class provides a common XR controller manager for grip, hand, transient-pointer and gaze target ray controllers.
 * The events dispatched are selected, unselected, hovered, hoverout, pressed, pressedend and movechanged.
 * Sets up the grip, gaze and hand pointer models.
 *
 * @augments EventDispatcher
 * @three_import import { XRControllerManager } from 'three/addons/webxr/XRControllerManager.js';
 */

class XRControllerManager extends EventDispatcher {

	/**
	 * Constructs a new XRGamepad
	 *
     * @param {number} controllerIndex = The controller index.
     * @param {Scene} scene - The scene object.
     * @param {XRManager|WebXRManager} xrManager - The webxr manager object.
     * @param {Array} collisions - The intersections collision list.
     * @param {boolean} useXRButtons - Enable gamepad controls update events.
	 */
	constructor( controllerIndex, scene, xrManager, collisions = [], useXRButtons = false ) {

		super();

		/**
         * The controller index.
         *
         * @private
         */
		this._controllerIndex = controllerIndex;


		/**
         * The WebXR controller in target ray space.
         *
		 * @private
		 * @type {Group}
         */
		this._controller = xrManager.getController( controllerIndex );

		/**
         * The scene object.
         *
		 * @private
		 * @type {Scene}
         */
		this._scene = scene;

		/**
         * The XR manager object.
		 *
         * @private
		 * @type {XRManager|WebXRManager}
         */
		this._xrManager = xrManager;

		/**
         * Enable gamepad button update events.
         *
         * @private
         * @type {Boolean}
         */
		this._useXRButtons = useXRButtons;

		//setup controller connext events.
		this._controller.addEventListener( 'connected', () => this._onControllerConnected() );
		this._controller.addEventListener( 'disconnected', () => this._onControllerDisconnected() );

		/**
         * The event emitter callback reference.
         *
         * @param {Object} event
         * @returns {void}
         */
		this._eventCallbackRef = ( event ) => this.emit( event );

		/**
         * Create an XR intersections for this controller.
         * Provides a collision list.
         */
		this._xrIntersections = new XRIntersections( this._controller, collisions );

		this._xrIntersections.addEventListener( 'selected', this._eventCallbackRef );

		this._xrIntersections.addEventListener( 'unselected', this._eventCallbackRef );

		this._xrIntersections.addEventListener( 'selectend', this._eventCallbackRef );

		this._xrIntersections.addEventListener( 'hovered', this._eventCallbackRef );

		this._xrIntersections.addEventListener( 'hoverout', this._eventCallbackRef );

		this._xrIntersections.addEventListener( 'move', this._eventCallbackRef );

		scene.add( this._controller );


	}

	/**
    * The WebXR controller in target ray space.
    *
	* @returns {Group}
    */
	get controller() {

		return this._controller;

	}

	/**
	 * Is the intersection in a selecting state with a selected object.
	 *
	 * @returns {boolean}
	 */
	get isSelecting() {

		return !! this._xrIntersections.selectedObject;

	}

	/**
	 * The selected object.
	 *
	 * @returns {Object3D}
	 */
	get selectedObject() {

		return this._xrIntersections.selectedObject;

	}

	/**
     * If the currently connected controller has hand input.
     * @return {boolean}
     */
	get hasHand() {

		return this._controller.userData.hasHand;

	}

	/**
     * Set the controller has hand input.
     * @param {boolean} hand - Has hand input or not.
     */
	set hasHand( hand ) {

		this._controller.userData.hasHand = hand;

	}

	/**
     * Get the grip pointer model;
     * @returns {Object3D} - The grip pointer model.
     */
	get gripPointer() {

		return this._controller.userData.gripPointer;

	}

	/**
     * Get the gaze pointer model;
     * @returns {Object3D} - The gaze pointer model.
     */
	get gazePointer() {

		return this._controller.userData.gazePointer;

	}

	/**
	 * Get the hand controller.
	 *
	 * @returns {Object3D}
	 */
	get hand() {

		return this._controller.userData.hand;

	}

	/**
     * Get the hand pointer model;
     * @returns {Object3D} - The hand pointer model.
     */
	get handPointer() {

		return this._controller.userData.handPointer;

	}

	/**
     * @returns {Object3D} - The hand controller model.
     */
	get handModel() {

		return this._controller.userData.hand.children[ 0 ];

	}

	/**
     * @returns {Object3D} - The controller grip model.
     */
	get controllerGrip() {

		return this._controller.userData.controllerGrip;

	}

	/**
     * @returns {Object3D} - The grip controller model.
     */
	get gripModel() {

		return this.controllerGrip && this.controllerGrip.children[ 0 ];

	}

	/**
	 * If the controller is visible
	 *
	 * @returns {boolean}
	 */
	get visible() {

		return this._controller.visible;

	}

	/**
	 * Set this controller and it's models as visible.
	 *
	 * @param {boolean} value - Set visible / hidden.
	 */
	set visible( value ) {

		this._controller.visible = value;

		if ( this.controllerGrip ) this.gripModel.visible = value;
		if ( this.hand ) this.handModel.visible = value;
		if ( this._xrIntersections.currentPointer ) this._xrIntersections.currentPointer.visible = value;

	}

	/**
	 * Get the controller position
	 *
	 * @return {Vector3}
	 */
	get controllerPosition() {

		return this._controller.position;

	}

	/**
	 * Get the controller quartonion.
	 *
	 * @return {Vector3}
	 */
	get controllerQuaternion() {

		return this._controller.quaternion;

	}

	/**
     * Set the collisions list.
     *
     * @param {Array} value - The collisions list.
     */
	set collisions( value ) {

		this._xrIntersections.collisions = value;

	}

	/**
	 * Add object to intersection collisdion list.
	 *
	 * @param {Object3D} object
	 */
	addIntersect( object ) {

		this._xrIntersections.add( object );

	}

	/**
	 * Add object to intersection collisdion list.
	 *
	 * @param {Object3D} object
	 */
	removeIntersect( object ) {

		this._xrIntersections.remove( object );

	}

	/**
	 * Update the cursor positipn for the active pointer model.
	 * @param {number} position - The cursor position value.
	 */
	setCursor( position ) {

		this.currentPointer.setCursor( position );

	}

	/**
	 * If has hand pointer and is pinching.
	 * @returns {boolean}
	 */
	isPinched() {

		return this.handPointer && this.handPointer.isPinched();

	}

	/**
     *
     * @param {Object} event - The event object.
     */
	emit( event ) {

		this.dispatchEvent( event );

	}


	/**
     * The controller connected event.
     * @param {Object} event
     * @returns {void}
     */
	_onControllerConnected( event ) {

		const controller = event.target;

		//transient pointer is reconnecting.
		if ( controller.userData.isTransientPointer ) {

			//console.log('Transient Pointer Setup');
			this.dispatchEvent( { type: 'reconnected', controller: this._controller } );
			return;

		}

		//only emit connected once
		if ( ! controller.userData.controllerConnected ) this.dispatchEvent( { type: 'connected', controller: controller } );

		//has hand input
		this.hasHand = !! event.hand;

		switch ( event.data.targetRayMode ) {

			case 'tracked-pointer':
				const controllerModelFactory = new XRControllerModelFactory(),
					controllerGrip = controller.userData.controllerGrip = this._xrManager.getControllerGrip( this._controllerIndex );

				controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
				this._scene.add( controllerGrip );

				const gripPointer = controller.userData.gripPointer = new GripPointerModel( controller );

				controllerGrip.add( gripPointer );

				this.dispatchEvent( { type: 'controllerGrip', controllerGrip: controllerGrip } );

				//setup the gamepad controls events.
				if ( this._useXRButtons ) {

					const xrGamepad = this._xrGamepad = controller.userData.xrGamePad = new XRGamepad( controllerGrip );

					xrGamepad.addEventListener( 'pressed', this._eventCallbackRef );
					xrGamepad.addEventListener( 'pressedend', this._eventCallbackRef );
					xrGamepad.addEventListener( 'movechanged', this._eventCallbackRef );

				}

				break;
			case 'gaze':

				const gazePointer = controller.userData.gazePointer = new GazePointerModel( controller );
				controller.add( gazePointer );

				break;
			case 'transient-pointer':
				//build the Apple Vision transient pointer controller
				//the controller is activated and deactivated between pinching and releasing a pinch
				controller.userData.isGaze = false;
				controller.userData.isTransientPointer = true;

				break;

		}

		//setup the hand model
		if ( this.hasHand ) {

			if ( ! controller.userData.hand ) {

				const hand = controller.userData.hand = this._xrManager.getHand( this._controllerIndex );
				hand.add( new OculusHandModel( hand ) );
				const handPointer = controller.userData.handPointer = new OculusHandPointerModel( hand, controller );
				hand.add( handPointer );

				hand.addEventListener( 'connected', ( event ) => {

					event.type = 'hand-connected';
					this._eventCallbackRef( event );

				} );

				hand.addEventListener( 'pinchstart', this._eventCallbackRef );

				hand.addEventListener( 'pinchend', this._eventCallbackRef );

				this._scene.add( hand );

				this.dispatchEvent( { type: 'hand', hand: hand } );

			}

		} else if ( controller.hand ) {

			//set back up grip controller
			this.dispatchEvent( { type: 'grip-reconnected' } );

		}

	}

	_onControllerDisconnected( event ) {

		const controller = event.target;

		if ( ! event.userData.isTransientPointer ) controller.remove( controller.children[ 0 ] );

	}

}

export { XRControllerManager };
