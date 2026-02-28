import {
	Controls,
	MOUSE,
	Raycaster,
	Spherical,
	TOUCH,
	Vector2,
	Vector3,
	MathUtils
} from 'three';

/**
 * Fires when the camera has been transformed by the controls.
 *
 * @event ThirdPersonControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires when an interaction was initiated.
 *
 * @event ThirdPersonControls#start
 * @type {Object}
 */
const _startEvent = { type: 'start' };

/**
 * Fires when an interaction has finished.
 *
 * @event ThirdPersonControls#end
 * @type {Object}
 */
const _endEvent = { type: 'end' };

/**
 * Fires when the target has been switched.
 *
 * @event ThirdPersonControls#targetchange
 * @type {Object}
 */
const _targetChangeEvent = { type: 'targetchange' };

const _v = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _spherical = new Spherical();
const _raycaster = new Raycaster();
const _twoPI = 2 * Math.PI;
const _halfPI = Math.PI / 2;
const _EPS = 0.000001;

const _STATE = {
	NONE: - 1,
	ROTATE: 0,
	DOLLY: 1,
	TOUCH_ROTATE: 2,
	TOUCH_DOLLY: 3
};

/**
 * Third-person camera controls for following and orbiting around a target object.
 *
 * ThirdPersonControls provides smooth camera following behavior with configurable damping,
 * pivot-based rotation, adjustable camera offset, and optional collision detection using raycasting.
 * Supports smooth target switching with interpolated camera transitions.
 *
 * - Orbit: Left mouse / touch: one-finger move.
 * - Zoom: Middle mouse, or mousewheel / touch: two-finger pinch.
 *
 * ```js
 * const controls = new ThirdPersonControls( camera, target, renderer.domElement );
 *
 * // Configure the controls
 * controls.distance = 5;
 * controls.height = 2;
 * controls.enableCollision = true;
 *
 * // Switch targets smoothly
 * controls.setTarget( newTarget, true );
 *
 * function animate() {
 *
 *     const delta = clock.getDelta();
 *     controls.update( delta );
 *
 *     renderer.render( scene, camera );
 *
 * }
 * ```
 *
 * @augments Controls
 * @three_import import { ThirdPersonControls } from 'three/addons/controls/ThirdPersonControls.js';
 */
class ThirdPersonControls extends Controls {

	/**
	 * Constructs a new third-person controls instance.
	 *
	 * @param {Camera} object - The camera to be controlled (PerspectiveCamera or OrthographicCamera).
	 * @param {Object3D} target - The target object to follow.
	 * @param {?HTMLElement} domElement - The HTML element used for event listeners.
	 */
	constructor( object, target, domElement = null ) {

		super( object, domElement );

		/**
		 * The target object to follow.
		 *
		 * @type {Object3D}
		 */
		this.target = target;

		/**
		 * The desired distance from the camera to the target pivot.
		 *
		 * @type {number}
		 * @default 5
		 */
		this.distance = 5;

		/**
		 * The height offset of the camera pivot point relative to the target.
		 *
		 * @type {number}
		 * @default 1.6
		 */
		this.height = 1.6;

		/**
		 * The minimum allowed distance from camera to target.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.minDistance = 1;

		/**
		 * The maximum allowed distance from camera to target.
		 *
		 * @type {number}
		 * @default 20
		 */
		this.maxDistance = 20;

		/**
		 * The pivot offset from the target position in local space.
		 * This allows adjusting where the camera focuses on the target.
		 *
		 * @type {Vector3}
		 */
		this.pivotOffset = new Vector3( 0, 0, 0 );

		/**
		 * Whether collision detection is enabled.
		 * When enabled, raycasting is used to prevent the camera from clipping through geometry.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.enableCollision = false;

		/**
		 * The radius used for collision detection.
		 * A larger value keeps the camera further from obstacles.
		 *
		 * @type {number}
		 * @default 0.3
		 */
		this.collisionRadius = 0.3;

		/**
		 * Array of objects to test for collision.
		 * If empty, no collision detection is performed even if enableCollision is true.
		 *
		 * @type {Object3D[]}
		 */
		this.collisionObjects = [];

		/**
		 * The smoothing factor for camera movement (0 = no smoothing, 1 = instant).
		 * Lower values create smoother but slower camera movement.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.smoothingFactor = 0.1;

		/**
		 * The rotation speed for mouse/touch input.
		 *
		 * @type {number}
		 * @default 0.005
		 */
		this.rotationSpeed = 0.005;

		/**
		 * The zoom speed for scroll/pinch input.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.zoomSpeed = 1;

		/**
		 * The minimum polar angle (vertical rotation) in radians.
		 * 0 is looking straight down, Math.PI is looking straight up.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.minPolarAngle = 0.1;

		/**
		 * The maximum polar angle (vertical rotation) in radians.
		 *
		 * @type {number}
		 * @default Math.PI - 0.1
		 */
		this.maxPolarAngle = Math.PI - 0.1;

		/**
		 * Whether zooming (distance adjustment) is enabled.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableZoom = true;

		/**
		 * Whether rotation is enabled.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableRotate = true;

		/**
		 * Whether the camera should automatically align behind the target
		 * when the target moves.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.autoAlign = false;

		/**
		 * Speed of auto-alignment when enabled.
		 *
		 * @type {number}
		 * @default 0.05
		 */
		this.autoAlignSpeed = 0.05;

		/**
		 * Duration of target transition in seconds.
		 * Used when switching targets with smooth transition enabled.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.targetTransitionDuration = 0.5;

		/**
		 * This object contains references to the mouse actions used by the controls.
		 *
		 * @type {Object}
		 */
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: null };

		/**
		 * This object contains references to the touch actions used by the controls.
		 *
		 * @type {Object}
		 */
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE };

		// Internal state

		this._state = _STATE.NONE;

		this._spherical = new Spherical();
		this._sphericalDelta = new Spherical();

		this._targetPosition = new Vector3();
		this._pivotPosition = new Vector3();
		this._idealPosition = new Vector3();
		this._currentPosition = new Vector3();
		this._lookAtPosition = new Vector3();

		this._lastTargetPosition = new Vector3();
		this._targetVelocity = new Vector3();

		// Target transition state
		this._isTransitioning = false;
		this._transitionProgress = 0;
		this._transitionStartPosition = new Vector3();
		this._transitionStartLookAt = new Vector3();
		this._previousTarget = null;

		this._scale = 1;

		this._rotateStart = new Vector2();
		this._rotateEnd = new Vector2();
		this._rotateDelta = new Vector2();

		this._dollyStart = new Vector2();
		this._dollyEnd = new Vector2();
		this._dollyDelta = new Vector2();

		this._pointers = [];
		this._pointerPositions = {};

		// Initialize spherical coordinates
		this._spherical.radius = this.distance;
		this._spherical.phi = _halfPI; // Start at horizon level
		this._spherical.theta = 0;

		// Event listeners
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
		this._onContextMenu = onContextMenu.bind( this );
		this._onMouseWheel = onMouseWheel.bind( this );

		this._onTouchStart = onTouchStart.bind( this );
		this._onTouchMove = onTouchMove.bind( this );

		this._onMouseDown = onMouseDown.bind( this );
		this._onMouseMove = onMouseMove.bind( this );

		if ( this.domElement !== null ) {

			this.connect( this.domElement );

		}

		// Initial update
		if ( this.target ) {

			this._lastTargetPosition.copy( this.target.position );
			this._currentPosition.copy( this.object.position );

		}

	}

	connect( element ) {

		super.connect( element );

		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointercancel', this._onPointerUp );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );
		this.domElement.addEventListener( 'wheel', this._onMouseWheel, { passive: false } );

		this.domElement.style.touchAction = 'none';

	}

	disconnect() {

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.ownerDocument.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerup', this._onPointerUp );
		this.domElement.removeEventListener( 'pointercancel', this._onPointerUp );
		this.domElement.removeEventListener( 'wheel', this._onMouseWheel );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = 'auto';

	}

	dispose() {

		this.disconnect();

	}

	/**
	 * Set a new target object to follow with optional smooth transition.
	 *
	 * @param {Object3D} target - The new target object.
	 * @param {boolean} [smooth=false] - Whether to smoothly transition to the new target.
	 */
	setTarget( target, smooth = false ) {

		if ( this.target === target ) return;

		this._previousTarget = this.target;

		if ( smooth && this.target !== null && target !== null ) {

			// Start smooth transition
			this._isTransitioning = true;
			this._transitionProgress = 0;
			this._transitionStartPosition.copy( this.object.position );
			this._transitionStartLookAt.copy( this._lookAtPosition );

		}

		this.target = target;

		if ( target ) {

			this._lastTargetPosition.copy( target.position );

		}

		this.dispatchEvent( _targetChangeEvent );

	}

	/**
	 * Get the current target object.
	 *
	 * @return {Object3D} The current target object.
	 */
	getTarget() {

		return this.target;

	}

	/**
	 * Check if the camera is currently transitioning between targets.
	 *
	 * @return {boolean} True if transitioning.
	 */
	isTransitioning() {

		return this._isTransitioning;

	}

	/**
	 * Set the camera distance from target.
	 *
	 * @param {number} value - The new distance value.
	 */
	setDistance( value ) {

		this.distance = MathUtils.clamp( value, this.minDistance, this.maxDistance );
		this._spherical.radius = this.distance;

	}

	/**
	 * Get the current distance from camera to target pivot.
	 *
	 * @return {number} The current distance.
	 */
	getDistance() {

		return this._spherical.radius;

	}

	/**
	 * Get the current azimuthal (horizontal) angle in radians.
	 *
	 * @return {number} The current azimuthal angle.
	 */
	getAzimuthalAngle() {

		return this._spherical.theta;

	}

	/**
	 * Get the current polar (vertical) angle in radians.
	 *
	 * @return {number} The current polar angle.
	 */
	getPolarAngle() {

		return this._spherical.phi;

	}

	/**
	 * Updates the controls. Should be called in the animation loop.
	 *
	 * @param {number} [delta] - The time delta in seconds. Used for frame-rate independent smoothing.
	 * @return {boolean} Returns true if the camera was updated.
	 */
	update( delta = null ) {

		if ( this.enabled === false || this.target === null ) return false;

		// Handle target transition
		if ( this._isTransitioning && delta !== null ) {

			this._transitionProgress += delta / this.targetTransitionDuration;

			if ( this._transitionProgress >= 1 ) {

				this._transitionProgress = 1;
				this._isTransitioning = false;

			}

			// Use smooth easing for transition
			const t = this._easeInOutCubic( this._transitionProgress );

			// Calculate new target pivot
			const newPivot = this._calculatePivotPosition( this.target );

			// Calculate where we want the camera to end up
			_v.setFromSpherical( this._spherical );
			const endPosition = _v2.copy( newPivot ).add( _v );

			// Interpolate position
			this._currentPosition.lerpVectors( this._transitionStartPosition, endPosition, t );

			// Interpolate look-at position
			this._lookAtPosition.lerpVectors( this._transitionStartLookAt, newPivot, t );

			// Update camera
			this.object.position.copy( this._currentPosition );
			this.object.lookAt( this._lookAtPosition );

			if ( ! this._isTransitioning ) {

				// Transition complete, sync internal state
				this._lastTargetPosition.copy( this.target.position );

			}

			this.dispatchEvent( _changeEvent );
			return true;

		}

		// Apply rotation delta
		this._spherical.theta += this._sphericalDelta.theta;
		this._spherical.phi += this._sphericalDelta.phi;

		// Clamp polar angle
		this._spherical.phi = MathUtils.clamp(
			this._spherical.phi,
			this.minPolarAngle,
			this.maxPolarAngle
		);

		this._spherical.makeSafe();

		// Apply zoom
		this._spherical.radius = MathUtils.clamp(
			this._spherical.radius * this._scale,
			this.minDistance,
			this.maxDistance
		);

		// Get target position
		this._targetPosition.copy( this.target.position );

		// Calculate target velocity for auto-align
		if ( delta !== null && delta > 0 ) {

			this._targetVelocity.subVectors( this._targetPosition, this._lastTargetPosition );
			this._targetVelocity.divideScalar( delta );

		}

		this._lastTargetPosition.copy( this._targetPosition );

		// Calculate pivot position
		this._pivotPosition.copy( this._calculatePivotPosition( this.target ) );

		// Auto-align behind target when moving
		if ( this.autoAlign && this._targetVelocity.lengthSq() > 0.01 ) {

			const targetAngle = Math.atan2( this._targetVelocity.x, this._targetVelocity.z );
			let angleDiff = targetAngle - this._spherical.theta;

			// Normalize angle difference
			while ( angleDiff > Math.PI ) angleDiff -= _twoPI;
			while ( angleDiff < - Math.PI ) angleDiff += _twoPI;

			this._spherical.theta += angleDiff * this.autoAlignSpeed;

		}

		// Calculate ideal camera position from spherical coordinates
		_v.setFromSpherical( this._spherical );
		this._idealPosition.copy( this._pivotPosition ).add( _v );

		// Collision detection
		if ( this.enableCollision && this.collisionObjects.length > 0 ) {

			// Cast ray from pivot to ideal position
			const direction = _v2.subVectors( this._idealPosition, this._pivotPosition ).normalize();
			const rayDistance = this._spherical.radius;

			_raycaster.set( this._pivotPosition, direction );
			_raycaster.far = rayDistance;

			const intersects = _raycaster.intersectObjects( this.collisionObjects, true );

			if ( intersects.length > 0 ) {

				const hit = intersects[ 0 ];
				const adjustedDistance = Math.max(
					hit.distance - this.collisionRadius,
					this.minDistance
				);

				_v.setFromSpherical(
					new Spherical( adjustedDistance, this._spherical.phi, this._spherical.theta )
				);
				this._idealPosition.copy( this._pivotPosition ).add( _v );

			}

		}

		// Smooth camera position movement
		const smoothFactor = delta !== null
			? 1 - Math.pow( 1 - this.smoothingFactor, delta * 60 )
			: this.smoothingFactor;

		this._currentPosition.lerp( this._idealPosition, smoothFactor );

		// Update camera position
		this.object.position.copy( this._currentPosition );

		// Smooth look-at position (slight smoothing to avoid jitter)
		this._lookAtPosition.lerp( this._pivotPosition, smoothFactor );

		// Direct lookAt - clean and responsive
		this.object.lookAt( this._lookAtPosition );

		// Handle orthographic camera zoom
		if ( this.object.isOrthographicCamera ) {

			// Adjust orthographic zoom based on distance
			const baseSize = 10;
			const zoomFactor = this._spherical.radius / this.distance;
			this.object.zoom = baseSize / ( zoomFactor * this.distance );
			this.object.updateProjectionMatrix();

		}

		// Decay deltas
		this._sphericalDelta.theta *= ( 1 - this.smoothingFactor );
		this._sphericalDelta.phi *= ( 1 - this.smoothingFactor );
		this._scale = 1;

		// Check if changed
		const positionChanged = this.object.position.distanceToSquared( this._currentPosition ) > _EPS;

		if ( positionChanged ) {

			this.dispatchEvent( _changeEvent );
			return true;

		}

		return false;

	}

	//
	// Internals
	//

	/**
	 * Calculate pivot position for a given target.
	 * @private
	 */
	_calculatePivotPosition( targetObj ) {

		const pivot = _v3.copy( this.pivotOffset );

		// Transform pivot offset to world space based on target orientation
		if ( targetObj.quaternion ) {

			pivot.applyQuaternion( targetObj.quaternion );

		}

		pivot.add( targetObj.position );
		pivot.y += this.height;

		return pivot.clone();

	}

	/**
	 * Ease in-out cubic function for smooth transitions.
	 * @private
	 */
	_easeInOutCubic( t ) {

		return t < 0.5
			? 4 * t * t * t
			: 1 - Math.pow( - 2 * t + 2, 3 ) / 2;

	}

	_getZoomScale( delta ) {

		const normalizedDelta = Math.abs( delta * 0.01 );
		return Math.pow( 0.95, this.zoomSpeed * normalizedDelta );

	}

	_handleMouseDownRotate( event ) {

		this._rotateStart.set( event.clientX, event.clientY );

	}

	_handleMouseDownDolly( event ) {

		this._dollyStart.set( event.clientX, event.clientY );

	}

	_handleMouseMoveRotate( event ) {

		this._rotateEnd.set( event.clientX, event.clientY );
		this._rotateDelta.subVectors( this._rotateEnd, this._rotateStart );

		// Rotating horizontally (theta)
		this._sphericalDelta.theta -= this._rotateDelta.x * this.rotationSpeed;

		// Rotating vertically (phi)
		this._sphericalDelta.phi -= this._rotateDelta.y * this.rotationSpeed;

		this._rotateStart.copy( this._rotateEnd );

	}

	_handleMouseMoveDolly( event ) {

		this._dollyEnd.set( event.clientX, event.clientY );
		this._dollyDelta.subVectors( this._dollyEnd, this._dollyStart );

		if ( this._dollyDelta.y > 0 ) {

			this._scale /= this._getZoomScale( this._dollyDelta.y );

		} else if ( this._dollyDelta.y < 0 ) {

			this._scale *= this._getZoomScale( this._dollyDelta.y );

		}

		this._dollyStart.copy( this._dollyEnd );

	}

	_handleMouseWheel( event ) {

		if ( event.deltaY < 0 ) {

			this._scale *= this._getZoomScale( event.deltaY );

		} else if ( event.deltaY > 0 ) {

			this._scale /= this._getZoomScale( event.deltaY );

		}

	}

	_handleTouchStartRotate( event ) {

		if ( this._pointers.length === 1 ) {

			this._rotateStart.set( event.pageX, event.pageY );

		} else {

			const position = this._getSecondPointerPosition( event );
			const x = 0.5 * ( event.pageX + position.x );
			const y = 0.5 * ( event.pageY + position.y );
			this._rotateStart.set( x, y );

		}

	}

	_handleTouchStartDolly( event ) {

		const position = this._getSecondPointerPosition( event );
		const dx = event.pageX - position.x;
		const dy = event.pageY - position.y;
		const distance = Math.sqrt( dx * dx + dy * dy );

		this._dollyStart.set( 0, distance );

	}

	_handleTouchMoveRotate( event ) {

		if ( this._pointers.length === 1 ) {

			this._rotateEnd.set( event.pageX, event.pageY );

		} else {

			const position = this._getSecondPointerPosition( event );
			const x = 0.5 * ( event.pageX + position.x );
			const y = 0.5 * ( event.pageY + position.y );
			this._rotateEnd.set( x, y );

		}

		this._rotateDelta.subVectors( this._rotateEnd, this._rotateStart );

		this._sphericalDelta.theta -= this._rotateDelta.x * this.rotationSpeed;
		this._sphericalDelta.phi -= this._rotateDelta.y * this.rotationSpeed;

		this._rotateStart.copy( this._rotateEnd );

	}

	_handleTouchMoveDolly( event ) {

		const position = this._getSecondPointerPosition( event );
		const dx = event.pageX - position.x;
		const dy = event.pageY - position.y;
		const distance = Math.sqrt( dx * dx + dy * dy );

		this._dollyEnd.set( 0, distance );
		this._dollyDelta.set( 0, Math.pow( this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed ) );

		this._scale /= this._dollyDelta.y;
		this._dollyStart.copy( this._dollyEnd );

	}

	_handleTouchMoveDollyRotate( event ) {

		if ( this.enableZoom ) this._handleTouchMoveDolly( event );
		if ( this.enableRotate ) this._handleTouchMoveRotate( event );

	}

	// Pointer handling

	_addPointer( event ) {

		this._pointers.push( event.pointerId );

	}

	_removePointer( event ) {

		delete this._pointerPositions[ event.pointerId ];

		for ( let i = 0; i < this._pointers.length; i ++ ) {

			if ( this._pointers[ i ] === event.pointerId ) {

				this._pointers.splice( i, 1 );
				return;

			}

		}

	}

	_isTrackingPointer( event ) {

		for ( let i = 0; i < this._pointers.length; i ++ ) {

			if ( this._pointers[ i ] === event.pointerId ) return true;

		}

		return false;

	}

	_trackPointer( event ) {

		let position = this._pointerPositions[ event.pointerId ];

		if ( position === undefined ) {

			position = new Vector2();
			this._pointerPositions[ event.pointerId ] = position;

		}

		position.set( event.pageX, event.pageY );

	}

	_getSecondPointerPosition( event ) {

		const pointerId = ( event.pointerId === this._pointers[ 0 ] )
			? this._pointers[ 1 ]
			: this._pointers[ 0 ];

		return this._pointerPositions[ pointerId ];

	}

}

// Event handlers

function onPointerDown( event ) {

	if ( this.enabled === false ) return;

	if ( this._pointers.length === 0 ) {

		this.domElement.setPointerCapture( event.pointerId );
		this.domElement.ownerDocument.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.ownerDocument.addEventListener( 'pointerup', this._onPointerUp );

	}

	if ( this._isTrackingPointer( event ) ) return;

	this._addPointer( event );

	if ( event.pointerType === 'touch' ) {

		this._onTouchStart( event );

	} else {

		this._onMouseDown( event );

	}

}

function onPointerMove( event ) {

	if ( this.enabled === false ) return;

	if ( event.pointerType === 'touch' ) {

		this._onTouchMove( event );

	} else {

		this._onMouseMove( event );

	}

}

function onPointerUp( event ) {

	this._removePointer( event );

	switch ( this._pointers.length ) {

		case 0:

			this.domElement.releasePointerCapture( event.pointerId );
			this.domElement.ownerDocument.removeEventListener( 'pointermove', this._onPointerMove );
			this.domElement.ownerDocument.removeEventListener( 'pointerup', this._onPointerUp );

			this.dispatchEvent( _endEvent );
			this._state = _STATE.NONE;

			break;

		case 1:

			const pointerId = this._pointers[ 0 ];
			const position = this._pointerPositions[ pointerId ];

			this._onTouchStart( { pointerId: pointerId, pageX: position.x, pageY: position.y } );

			break;

	}

}

function onMouseDown( event ) {

	let mouseAction;

	switch ( event.button ) {

		case 0:
			mouseAction = this.mouseButtons.LEFT;
			break;

		case 1:
			mouseAction = this.mouseButtons.MIDDLE;
			break;

		case 2:
			mouseAction = this.mouseButtons.RIGHT;
			break;

		default:
			mouseAction = - 1;

	}

	switch ( mouseAction ) {

		case MOUSE.DOLLY:

			if ( this.enableZoom === false ) return;

			this._handleMouseDownDolly( event );
			this._state = _STATE.DOLLY;

			break;

		case MOUSE.ROTATE:

			if ( this.enableRotate === false ) return;

			this._handleMouseDownRotate( event );
			this._state = _STATE.ROTATE;

			break;

		default:

			this._state = _STATE.NONE;

	}

	if ( this._state !== _STATE.NONE ) {

		this.dispatchEvent( _startEvent );

	}

}

function onMouseMove( event ) {

	switch ( this._state ) {

		case _STATE.ROTATE:

			if ( this.enableRotate === false ) return;

			this._handleMouseMoveRotate( event );

			break;

		case _STATE.DOLLY:

			if ( this.enableZoom === false ) return;

			this._handleMouseMoveDolly( event );

			break;

	}

}

function onMouseWheel( event ) {

	if ( this.enabled === false || this.enableZoom === false || this._state !== _STATE.NONE ) return;

	event.preventDefault();

	this.dispatchEvent( _startEvent );

	this._handleMouseWheel( event );

	this.dispatchEvent( _endEvent );

}

function onTouchStart( event ) {

	this._trackPointer( event );

	switch ( this._pointers.length ) {

		case 1:

			switch ( this.touches.ONE ) {

				case TOUCH.ROTATE:

					if ( this.enableRotate === false ) return;

					this._handleTouchStartRotate( event );
					this._state = _STATE.TOUCH_ROTATE;

					break;

				default:

					this._state = _STATE.NONE;

			}

			break;

		case 2:

			switch ( this.touches.TWO ) {

				case TOUCH.DOLLY_ROTATE:

					if ( this.enableZoom === false && this.enableRotate === false ) return;

					this._handleTouchStartDolly( event );
					this._handleTouchStartRotate( event );
					this._state = _STATE.TOUCH_DOLLY;

					break;

				default:

					this._state = _STATE.NONE;

			}

			break;

		default:

			this._state = _STATE.NONE;

	}

	if ( this._state !== _STATE.NONE ) {

		this.dispatchEvent( _startEvent );

	}

}

function onTouchMove( event ) {

	this._trackPointer( event );

	switch ( this._state ) {

		case _STATE.TOUCH_ROTATE:

			if ( this.enableRotate === false ) return;

			this._handleTouchMoveRotate( event );

			break;

		case _STATE.TOUCH_DOLLY:

			if ( this.enableZoom === false && this.enableRotate === false ) return;

			this._handleTouchMoveDollyRotate( event );

			break;

		default:

			this._state = _STATE.NONE;

	}

}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

export { ThirdPersonControls };
