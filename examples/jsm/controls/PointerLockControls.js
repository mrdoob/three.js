import {
	Controls,
	Euler,
	Vector3
} from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

/**
 * Fires when the user moves the mouse.
 *
 * @event PointerLockControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires when the pointer lock status is "locked" (in other words: the mouse is captured).
 *
 * @event PointerLockControls#lock
 * @type {Object}
 */
const _lockEvent = { type: 'lock' };

/**
 * Fires when the pointer lock status is "unlocked" (in other words: the mouse is not captured anymore).
 *
 * @event PointerLockControls#unlock
 * @type {Object}
 */
const _unlockEvent = { type: 'unlock' };

const _MOUSE_SENSITIVITY = 0.002;
const _PI_2 = Math.PI / 2;

/**
 * The implementation of this class is based on the [Pointer Lock API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API}.
 * `PointerLockControls` is a perfect choice for first person 3D games.
 *
 * ```js
 * const controls = new PointerLockControls( camera, document.body );
 *
 * // add event listener to show/hide a UI (e.g. the game's menu)
 * controls.addEventListener( 'lock', function () {
 *
 * 	menu.style.display = 'none';
 *
 * } );
 *
 * controls.addEventListener( 'unlock', function () {
 *
 * 	menu.style.display = 'block';
 *
 * } );
 * ```
 *
 * @augments Controls
 * @three_import import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
 */
class PointerLockControls extends Controls {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Camera} camera - The camera that is managed by the controls.
	 * @param {?HTMLElement} domElement - The HTML element used for event listeners.
	 */
	constructor( camera, domElement = null ) {

		super( camera, domElement );

		/**
		 * Whether the controls are locked or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isLocked = false;

		/**
		 * Camera pitch, lower limit. Range is '[0, Math.PI]' in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minPolarAngle = 0;

		/**
		 * Camera pitch, upper limit. Range is '[0, Math.PI]' in radians.
		 *
		 * @type {number}
		 * @default Math.PI
		 */
		this.maxPolarAngle = Math.PI;

		/**
		 * Multiplier for how much the pointer movement influences the camera rotation.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.pointerSpeed = 1.0;

		// event listeners

		this._onMouseMove = onMouseMove.bind( this );
		this._onPointerlockChange = onPointerlockChange.bind( this );
		this._onPointerlockError = onPointerlockError.bind( this );

		if ( this.domElement !== null ) {

			this.connect( this.domElement );

		}

	}

	connect( element ) {

		super.connect( element );

		this.domElement.ownerDocument.addEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.addEventListener( 'pointerlockerror', this._onPointerlockError );

	}

	disconnect() {

		this.domElement.ownerDocument.removeEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', this._onPointerlockError );

	}

	dispose() {

		this.disconnect();

	}

	/**
	 * Returns the look direction of the camera.
	 *
	 * @param {Vector3} v - The target vector that is used to store the method's result.
	 * @return {Vector3} The normalized direction vector.
	 */
	getDirection( v ) {

		return v.set( 0, 0, - 1 ).applyQuaternion( this.object.quaternion );

	}

	/**
	 * Moves the camera forward parallel to the xz-plane. Assumes camera.up is y-up.
	 *
	 * @param {number} distance - The signed distance.
	 */
	moveForward( distance ) {

		if ( this.enabled === false ) return;

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		const camera = this.object;

		_vector.setFromMatrixColumn( camera.matrix, 0 );

		_vector.crossVectors( camera.up, _vector );

		camera.position.addScaledVector( _vector, distance );

	}

	/**
	 * Moves the camera sidewards parallel to the xz-plane.
	 *
	 * @param {number} distance - The signed distance.
	 */
	moveRight( distance ) {

		if ( this.enabled === false ) return;

		const camera = this.object;

		_vector.setFromMatrixColumn( camera.matrix, 0 );

		camera.position.addScaledVector( _vector, distance );

	}

	/**
	 * Activates the pointer lock.
	 *
	 * @param {boolean} [unadjustedMovement=false] - Disables OS-level adjustment for mouse acceleration, and accesses raw mouse input instead.
	 * Setting it to true will disable mouse acceleration.
	 */
	lock( unadjustedMovement = false ) {

		this.domElement.requestPointerLock( {
			unadjustedMovement
		} );

	}

	/**
	 * Exits the pointer lock.
	 */
	unlock() {

		this.domElement.ownerDocument.exitPointerLock();

	}

}

// event listeners

function onMouseMove( event ) {

	if ( this.enabled === false || this.isLocked === false ) return;

	const camera = this.object;
	_euler.setFromQuaternion( camera.quaternion );

	_euler.y -= event.movementX * _MOUSE_SENSITIVITY * this.pointerSpeed;
	_euler.x -= event.movementY * _MOUSE_SENSITIVITY * this.pointerSpeed;

	_euler.x = Math.max( _PI_2 - this.maxPolarAngle, Math.min( _PI_2 - this.minPolarAngle, _euler.x ) );

	camera.quaternion.setFromEuler( _euler );

	this.dispatchEvent( _changeEvent );

}

function onPointerlockChange() {

	if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) {

		this.dispatchEvent( _lockEvent );

		this.isLocked = true;

	} else {

		this.dispatchEvent( _unlockEvent );

		this.isLocked = false;

	}

}

function onPointerlockError() {

	console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

}

export { PointerLockControls };
