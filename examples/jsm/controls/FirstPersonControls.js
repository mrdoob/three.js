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
	 * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
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
		 * Whether it's possible to look around or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.activeLook = true;

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

		this._autoSpeedFactor = 0.0;

		this._pointerX = 0;
		this._pointerY = 0;

		this._moveForward = false;
		this._moveBackward = false;
		this._moveLeft = false;
		this._moveRight = false;

		this._viewHalfX = 0;
		this._viewHalfY = 0;

		this._lat = 0;
		this._lon = 0;

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

			this.handleResize();

		}

		this._setOrientation();

	}

	connect( element ) {

		super.connect( element );

		window.addEventListener( 'keydown', this._onKeyDown );
		window.addEventListener( 'keyup', this._onKeyUp );

		this.domElement.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointerup', this._onPointerUp );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );

	}

	disconnect() {

		window.removeEventListener( 'keydown', this._onKeyDown );
		window.removeEventListener( 'keyup', this._onKeyUp );

		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'pointerup', this._onPointerUp );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

	}

	dispose() {

		this.disconnect();

	}

	/**
	 * Must be called if the application window is resized.
	 */
	handleResize() {

		if ( this.domElement === document ) {

			this._viewHalfX = window.innerWidth / 2;
			this._viewHalfY = window.innerHeight / 2;

		} else {

			this._viewHalfX = this.domElement.offsetWidth / 2;
			this._viewHalfY = this.domElement.offsetHeight / 2;

		}

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

		if ( this.heightSpeed ) {

			const y = MathUtils.clamp( this.object.position.y, this.heightMin, this.heightMax );
			const heightDelta = y - this.heightMin;

			this._autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this._autoSpeedFactor = 0.0;

		}

		const actualMoveSpeed = delta * this.movementSpeed;

		if ( this._moveForward || ( this.autoForward && ! this._moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this._autoSpeedFactor ) );
		if ( this._moveBackward ) this.object.translateZ( actualMoveSpeed );

		if ( this._moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this._moveRight ) this.object.translateX( actualMoveSpeed );

		if ( this._moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this._moveDown ) this.object.translateY( - actualMoveSpeed );

		let actualLookSpeed = delta * this.lookSpeed;

		if ( ! this.activeLook ) {

			actualLookSpeed = 0;

		}

		let verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this._lon -= this._pointerX * actualLookSpeed;
		if ( this.lookVertical ) this._lat -= this._pointerY * actualLookSpeed * verticalLookRatio;

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

}

function onPointerDown( event ) {

	if ( this.domElement !== document ) {

		this.domElement.focus();

	}

	if ( this.activeLook ) {

		switch ( event.button ) {

			case 0: this._moveForward = true; break;
			case 2: this._moveBackward = true; break;

		}

	}

	this.mouseDragOn = true;

}

function onPointerUp( event ) {

	if ( this.activeLook ) {

		switch ( event.button ) {

			case 0: this._moveForward = false; break;
			case 2: this._moveBackward = false; break;

		}

	}

	this.mouseDragOn = false;

}

function onPointerMove( event ) {

	if ( this.domElement === document ) {

		this._pointerX = event.pageX - this._viewHalfX;
		this._pointerY = event.pageY - this._viewHalfY;

	} else {

		this._pointerX = event.pageX - this.domElement.offsetLeft - this._viewHalfX;
		this._pointerY = event.pageY - this.domElement.offsetTop - this._viewHalfY;

	}

}

function onKeyDown( event ) {

	switch ( event.code ) {

		case 'ArrowUp':
		case 'KeyW': this._moveForward = true; break;

		case 'ArrowLeft':
		case 'KeyA': this._moveLeft = true; break;

		case 'ArrowDown':
		case 'KeyS': this._moveBackward = true; break;

		case 'ArrowRight':
		case 'KeyD': this._moveRight = true; break;

		case 'KeyR': this._moveUp = true; break;
		case 'KeyF': this._moveDown = true; break;

	}

}

function onKeyUp( event ) {

	switch ( event.code ) {

		case 'ArrowUp':
		case 'KeyW': this._moveForward = false; break;

		case 'ArrowLeft':
		case 'KeyA': this._moveLeft = false; break;

		case 'ArrowDown':
		case 'KeyS': this._moveBackward = false; break;

		case 'ArrowRight':
		case 'KeyD': this._moveRight = false; break;

		case 'KeyR': this._moveUp = false; break;
		case 'KeyF': this._moveDown = false; break;

	}

}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

export { FirstPersonControls };
