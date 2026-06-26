import {
	Controls,
	MathUtils,
	Spherical,
	Vector3
} from 'three';

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();
const _targetPosition = new Vector3();
const _targetVelocity = new Vector3();

/**
 * This class is an alternative implementation of {@link FlyControls}.
 *
 * @augments Controls
 * @three_import import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
 */
class FirstPersonControls extends Controls {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Object3D} object - The object that is managed by the controls.
	 * @param {?HTMLElement} domElement - The HTML element used for event listeners.
	 */
	constructor( object, domElement = null ) {

		super( object, domElement );

		/**
		 * The movement speed.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.movementSpeed = 1.0;

		/**
		 * The look around speed.
		 *
		 * @type {number}
		 * @default 0.005
		 */
		this.lookSpeed = 0.005;

		/**
		 * How quickly the movement and look velocity catches up to the input. Lower
		 * values feel heavier (more inertia), `1` disables damping.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.dampingFactor = 0.1;

		/**
		 * Whether it's possible to vertically look around or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.lookVertical = true;

		/**
		 * Whether the camera is automatically moved forward or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.autoForward = false;

		/**
		 * Whether or not the camera's height influences the forward movement speed.
		 * Use the properties `heightCoef`, `heightMin` and `heightMax` for configuration.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.heightSpeed = false;

		/**
		 * Determines how much faster the camera moves when it's y-component is near `heightMax`.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.heightCoef = 1.0;

		/**
		 * Lower camera height limit used for movement speed adjustment.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.heightMin = 0.0;

		/**
		 * Upper camera height limit used for movement speed adjustment.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.heightMax = 1.0;

		/**
		 * Whether or not looking around is vertically constrained by `verticalMin` and `verticalMax`.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.constrainVertical = false;

		/**
		 * How far you can vertically look around, lower limit. Range is `0` to `Math.PI` in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.verticalMin = 0;

		/**
		 * How far you can vertically look around, upper limit. Range is `0` to `Math.PI` in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.verticalMax = Math.PI;

		/**
		 * Whether the mouse is pressed down or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.mouseDragOn = false;

		// internals

		this._velocity = new Vector3();

		this._pointerX = 0;
		this._pointerY = 0;

		this._pointerDownX = 0;
		this._pointerDownY = 0;

		this._pointerCount = 0;

		// forward / backward come from keys and the pointer, tracked per source so they don't
		// clobber: while a forward / backward key is held, a click only looks
		this._keyForward = false;
		this._keyBackward = false;
		this._pointerForward = false;
		this._pointerBackward = false;
		this._moveLeft = false;
		this._moveRight = false;
		this._moveUp = false;
		this._moveDown = false;

		this._lat = 0;
		this._lon = 0;

		this._lonVelocity = 0;
		this._latVelocity = 0;

		// event listeners

		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
		this._onContextMenu = onContextMenu.bind( this );
		this._onKeyDown = onKeyDown.bind( this );
		this._onKeyUp = onKeyUp.bind( this );

		//

		if ( domElement !== null ) {

			this.connect( domElement );

		}

		this._setOrientation();

	}

	connect( element ) {

		super.connect( element );

		window.addEventListener( 'keydown', this._onKeyDown );
		window.addEventListener( 'keyup', this._onKeyUp );

		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );

		const { ownerDocument } = this.domElement;

		ownerDocument.addEventListener( 'pointermove', this._onPointerMove );
		ownerDocument.addEventListener( 'pointerup', this._onPointerUp );
		ownerDocument.addEventListener( 'pointercancel', this._onPointerUp );

		this.domElement.style.touchAction = 'none'; // Disable touch scroll

	}

	disconnect() {

		window.removeEventListener( 'keydown', this._onKeyDown );
		window.removeEventListener( 'keyup', this._onKeyUp );

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		const { ownerDocument } = this.domElement;

		ownerDocument.removeEventListener( 'pointermove', this._onPointerMove );
		ownerDocument.removeEventListener( 'pointerup', this._onPointerUp );
		ownerDocument.removeEventListener( 'pointercancel', this._onPointerUp );

		this.domElement.style.touchAction = ''; // Restore touch scroll

	}

	dispose() {

		this.disconnect();

	}

	/**
	 * Rotates the camera towards the defined target position.
	 *
	 * @param {number|Vector3} x - The x coordinate of the target position or alternatively a vector representing the target position.
	 * @param {number} y - The y coordinate of the target position.
	 * @param {number} z - The z coordinate of the target position.
	 * @return {FirstPersonControls} A reference to this controls.
	 */
	lookAt( x, y, z ) {

		if ( x.isVector3 ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		this.object.lookAt( _target );

		this._setOrientation();

		return this;

	}

	update( delta ) {

		if ( this.enabled === false ) return;

		const moveForward = this._keyForward || this._pointerForward;
		const moveBackward = this._keyBackward || this._pointerBackward;

		const forward = moveForward || ( this.autoForward && ! moveBackward );

		// target velocity in the object's local space

		_targetVelocity.set(
			( this._moveRight ? 1 : 0 ) - ( this._moveLeft ? 1 : 0 ),
			( this._moveUp ? 1 : 0 ) - ( this._moveDown ? 1 : 0 ),
			( moveBackward ? 1 : 0 ) - ( forward ? 1 : 0 )
		).multiplyScalar( this.movementSpeed );

		// faster forward movement the higher the camera is

		if ( forward && this.heightSpeed ) {

			const y = MathUtils.clamp( this.object.position.y, this.heightMin, this.heightMax );
			_targetVelocity.z -= ( y - this.heightMin ) * this.heightCoef;

		}

		// ease toward the target velocity for smooth acceleration and deceleration

		this._velocity.lerp( _targetVelocity, this.dampingFactor );

		this.object.translateX( this._velocity.x * delta );
		this.object.translateY( this._velocity.y * delta );
		this.object.translateZ( this._velocity.z * delta );

		let verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		// target look velocity, zero when not dragging so the view eases to a stop

		const targetLon = this.mouseDragOn ? - this._pointerX * this.lookSpeed : 0;
		const targetLat = ( this.mouseDragOn && this.lookVertical ) ? - this._pointerY * this.lookSpeed * verticalLookRatio : 0;

		this._lonVelocity = MathUtils.lerp( this._lonVelocity, targetLon, this.dampingFactor );
		this._latVelocity = MathUtils.lerp( this._latVelocity, targetLat, this.dampingFactor );

		this._lon += this._lonVelocity * delta;
		this._lat += this._latVelocity * delta;

		this._lat = Math.max( - 85, Math.min( 85, this._lat ) );

		let phi = MathUtils.degToRad( 90 - this._lat );
		const theta = MathUtils.degToRad( this._lon );

		if ( this.constrainVertical ) {

			phi = MathUtils.mapLinear( phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		const position = this.object.position;

		_targetPosition.setFromSphericalCoords( 1, phi, theta ).add( position );

		this.object.lookAt( _targetPosition );

	}

	_setOrientation() {

		const quaternion = this.object.quaternion;

		_lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
		_spherical.setFromVector3( _lookDirection );

		this._lat = 90 - MathUtils.radToDeg( _spherical.phi );
		this._lon = MathUtils.radToDeg( _spherical.theta );

	}

	/**
	 * @deprecated, r184. This method is no longer needed.
	 */
	handleResize() {

		console.warn( 'THREE.FirstPersonControls: handleResize() has been removed.' );

	}

}

function onPointerDown( event ) {

	if ( this.domElement !== document ) {

		this.domElement.focus();

	}

	this.domElement.setPointerCapture( event.pointerId );

	this._pointerCount ++;

	if ( event.pointerType === 'touch' ) {

		this._pointerForward = this._pointerCount === 1;
		this._pointerBackward = this._pointerCount >= 2;

	} else {

		switch ( event.button ) {

			case 0: if ( ! this._keyForward && ! this._keyBackward ) this._pointerForward = true; break;
			case 2: if ( ! this._keyForward && ! this._keyBackward ) this._pointerBackward = true; break;

		}

	}

	this._pointerDownX = event.pageX;
	this._pointerDownY = event.pageY;

	this._pointerX = 0;
	this._pointerY = 0;

	this.mouseDragOn = true;

}

function onPointerUp( event ) {

	if ( this.mouseDragOn === false ) return;

	this.domElement.releasePointerCapture( event.pointerId );

	this._pointerCount --;

	if ( event.pointerType === 'touch' ) {

		this._pointerForward = this._pointerCount === 1;
		this._pointerBackward = false;

	} else {

		switch ( event.button ) {

			case 0: this._pointerForward = false; break;
			case 2: this._pointerBackward = false; break;

		}

	}

	this._pointerX = 0;
	this._pointerY = 0;

	if ( this._pointerCount === 0 ) this.mouseDragOn = false;

}

function onPointerMove( event ) {

	if ( this.mouseDragOn === false ) return;

	this._pointerX = event.pageX - this._pointerDownX;
	this._pointerY = event.pageY - this._pointerDownY;

}

function onKeyDown( event ) {

	switch ( event.code ) {

		case 'ArrowUp':
		case 'KeyW': this._keyForward = true; break;

		case 'ArrowLeft':
		case 'KeyA': this._moveLeft = true; break;

		case 'ArrowDown':
		case 'KeyS': this._keyBackward = true; break;

		case 'ArrowRight':
		case 'KeyD': this._moveRight = true; break;

		case 'KeyE': this._moveUp = true; break;
		case 'KeyQ': this._moveDown = true; break;

	}

}

function onKeyUp( event ) {

	switch ( event.code ) {

		case 'ArrowUp':
		case 'KeyW': this._keyForward = false; break;

		case 'ArrowLeft':
		case 'KeyA': this._moveLeft = false; break;

		case 'ArrowDown':
		case 'KeyS': this._keyBackward = false; break;

		case 'ArrowRight':
		case 'KeyD': this._moveRight = false; break;

		case 'KeyE': this._moveUp = false; break;
		case 'KeyQ': this._moveDown = false; break;

	}

}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

export { FirstPersonControls };
