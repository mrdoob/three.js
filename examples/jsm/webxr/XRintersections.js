
import { EventDispatcher } from 'three';

/**
 * This class provides a common XR Intersections for grip, hand, transient-pointer and gaze target ray controllers.
 * The events dispatched are pressed, pressedend and movechanged.
 * Handles selection, selectend, hovered and hoverout events for each controller type.
 * Expects handPointer, gripPointer and gazePointer model setup to update the cursor and lines;
 *
 * @augments EventDispatcher
 * @three_import import { XRIntersections } from 'three/addons/webxr/XRIntersections.js';
 */

class XRIntersections extends EventDispatcher {

	/**
	 * Constructs a new XRGamepad
	 *
	 * @param {Group} controller - The WebXR controller in target ray space.
     * @param {Array} collisions - The intersections collision list.
	 */

	constructor( controller, collisions = [] ) {

		super();

		/**
		 * The WebXR controller.
		 *
         * @private
		 * @type {Group}
		 */
		this._controller = controller;

		/**
         * The collection list
         *
         * @private
         * @type {?Array}
         */
		this._collisions = [];

		/**
         * The default cursor distance
         *
         * @private
         * @type {?Array}
         */
		this._defaultCursorDistance = 3.5;

		/**
         * The controller select callback reference.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onControllerSelectRef = ( event ) => this._onControllerSelect( event );

		/**
         * The controller select end callback reference.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onControllerSelectEndRef = ( event ) => this._onControllerSelectEnd( event );

		/**
         * The controller transient pointer specific select end callback reference.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onTransientPointerSelectEndRef = ( event ) => this._onTransientPointerSelectEnd( event );

		//set the collisions list
		this.collisions = collisions;

		controller.addEventListener( 'connected', () => this.onControllerConnected() );

	}

	/**
     * Set the collisions list.
     *
     * @param {Array} value - The collisions list.
     */
	set collisions( value ) {

		this._collisions = value;

	}

	/**
     * Get intersections on the current pointer model.
     * @returns {Array} - The detected intersections list.
     */
	get intersections() {

		return this.currentPointer.intersectObjects( this._collisions, false );

	}

	/**
     * Get the current pointer model;
     * @returns {Object3D} - The currently set pointer model.
     */
	get currentPointer() {

		return this._controller.userData.currentPointer;

	}

	/**
     * Get the selected object.
     * @param {Object} - The selected intersected object.
     */
	get selectedObject() {

		return this._controller.userData.selected;

	}

	/**
     * Set the selected intersected object.
     * @param {Object} object - The selected intersected object.
     */
	set selectedObject( object ) {

		return this._controller.userData.selected = object;

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
     * add object to intersection collision list.
     * @param {Object3D} object
     */
	add( object ) {

		this._collisions.push( object );

	}

	/**
     * remove object from intersection collision list.
     * @param {Object3D} object
     */
	remove( object ) {

		const index = this._collisions.indexOf( object );

		if ( index > - 1 ) {

			this._collisions.splice( index, 1 );

		}

	}

	/**
     *
     * @param {string} eventName - The event name.
     * @param {*} object - The intersected object.
     * @param {*} point  - The intersected object point.
     */
	emit( eventName, object, point ) {

		this.dispatchEvent( { type: eventName, intersectObject: object, intersectPoint: point } );

	}

	/**
     * Controller connected callback
     * @param {Object} event
     * @returns {void}
     */
	_onControllerConnected( event ) {

		const controller = event.target;

		//transient-pointer controller is reconnecting.
		if ( controller.userData.isTransientPointer ) {

			return;

		}

		//set has hand input.
		this.hasHand = !! event.hand;


		switch ( event.data.targetRayMode ) {

			case 'tracked-pointer':

				//set the grip pointer as the current pointer.
				controller.userData.currentPointer = this._controller.userData.gripPointer;
				controller.addEventListener( 'selectstart', this._onControllerSelectRef );
				controller.addEventListener( 'selectend', this._onControllerSelectEndRef );

				break;
			case 'gaze':

				//set the gaze pointer as the current pointer.
				controller.userData.currentPointer = controller.userData.gazePointer;
				controller.userData.isGaze = true;
				controller.addEventListener( 'move', this._onGazeIntersectionsRef );

				break;
			case 'transient-pointer':
				//build the Apple Vision transient pointer controller
				//the controller is activated and deactivated between pinching and releasing a pinch

				controller.userData.isGaze = false;
				controller.userData.isTransientPointer = true;

				//setup selection on selectend events.
				controller.addEventListener( 'selectend', this.onTransientPointerSelectEndRef );

				break;

		}

		//setup move events for intersection detection.
		controller.removeEventListener( 'move', this._onIntersectionsRef );
		controller.addEventListener( 'move', this._onIntersectionsRef );


		if ( event.hand ) {
			//hand controller
		} else if ( this._controller.hand ) {
			//returning back to grip controller

		}

	}

	intersectObject( object ) {

		return this.currentPointer.intersectObject( object, false );

	}

	/**
     * Controller select event.
     * Get intersections from the current pointer and emit as selected.
     * @param {Object} event
     */
	_onControllerSelect( event ) {

		const controller = event.target,
			intersections = this.intersections;
		this.emitIntersections( controller, intersections );

	}

	/**
     * Controller select end event.
     * Resets the selected object.
     * Resets the active state of the current pointer.
     * @param {Object} event
     */
	_onControllerSelectEnd( ) {

		const object = this.selectedObject;

		if ( object !== undefined ) {

			this.emit( 'selectend', object );
			this.selectedObject = undefined;

			this.currentPointer.active = false;

		}


	}

	/**
     * on Transient pointer select end event.
     * @param {Object} event
     */
	onTransientPointerSelectEnd( event ) {

		//Get and emit intersections
		this._onControllerSelect( event );
		//Reset the selection.
		this._onControllerSelectEnd( event );

	}

	/**
     * Emit a selection intersection.
     * On no intersection or if the object is hidden emit unselected.
     * @param {Group} controller = The WebXRController
     * @param {Array} intersections - The intersections list.
     */
	emitIntersections( controller, intersections ) {

		if ( intersections.length > 0 ) {

			const intersection = intersections[ 0 ],
				object = intersection.object,
				point = object.point || intersection.point;
			// object.material.emissive.b = 1;
			this.selectedObject = object;

			if ( object.visible ) {

				//set the current pointer active.
				//for GripPointer this will highlight the line.
				this.currentPointer.active = true;
				this.emit( 'selected', object, point );

			} else {

				//reset the current pointer as active.
				this.currentPointer.active = false;
				this.dispatchEvent( { type: 'unselected', controller: controller } );

			}

		} else {

			this.dispatchEvent( { type: 'unselected', controller: controller } );

		}

	}

	/**
     * Get intersections on move events.
     * @param {Object} event
     */
	_onIntersections( event ) {

		const controller = event.target,
			//get the current intersections.
			intersections = this.intersections;

		if ( intersections.length > 0 ) {

			if ( controller.userData.selected != intersections[ 0 ].object ) {

				const intersection = intersections[ 0 ],
					object = intersection.object;
				object.point = intersection.point;
				this.selectedObject = object;
				controller.userData.hitTime = performance.now() / 1000;

				this.emit( 'hovered', object );

				//update the pointer cursor to the intersection position.
				this.currentPointer.setCursor( intersection.distance );

			} else {

				//specific for gaze pointers. Emit selection after a delay.
				if ( controller.visible && controller.userData.isGaze ) {

					const elapsed = performance.now() / 1000,
						gazeTime = elapsed - controller.userData.hitTime;

					if ( gazeTime >= 2.5 ) {

						//console.log('selected', this.controller.userData.selected);
						if ( this.selectedObject.mesh.visible ) {

							this.emit( 'selected', this.selectedObject );
							this.resetSelectedObject();

						}

					}

				}

			}

		} else if ( this.selectedObject ) {

			this.currentPointer.setCursor( this._defaultCursorDistance );
			this.resetSelectedObject();

		}

		this.dispatchEvent( { type: 'move', controller: controller } );

	}

	/**
     * Reset the selected object and emit hoverout.
     */
	resetSelectedObject() {

		const controller = this._controller;

		this.emit( 'hoverout', this.selectedObject );
		this.selectedObject = undefined;
		controller.userData.hitTime = 0;
		if ( controller.userData.isGaze ) this.currentPointer.setCursor( - 1 );

	}

}

export { XRIntersections };
