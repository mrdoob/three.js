import {
	Controls,
	Vector3,
	Matrix4
} from 'three';

/**
 * Fires when the camera has been transformed by the controls.
 *
 * @event SplineCameraControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

// Reusable objects to avoid allocations
const _position = new Vector3();
const _tangent = new Vector3();
const _lookAtPosition = new Vector3();
const _normal = new Vector3();
const _binormal = new Vector3();
const _matrix = new Matrix4();

/**
 * SplineCameraControls allows the camera to follow a curved path defined by any Curve object.
 * Supports automated playback, manual positioning, and interactive navigation along splines.
 *
 * ```js
 * const curve = new THREE.CatmullRomCurve3( points, true );
 * const controls = new SplineCameraControls( camera, curve );
 * controls.loopTime = 10.0;  // 10 seconds for full loop
 * controls.autoPlay = true;
 * controls.loop = true;
 *
 * function animate() {
 *     const delta = clock.getDelta();
 *     controls.update( delta );
 *     renderer.render( scene, camera );
 * }
 * ```
 *
 * @augments Controls
 * @three_import import { SplineCameraControls } from 'three/addons/controls/SplineCameraControls.js';
 */
class SplineCameraControls extends Controls {

	/**
	 * Constructs a new spline camera controls instance.
	 *
	 * @param {Object3D} object - The camera that is controlled.
	 * @param {Curve} curve - The curve path to follow.
	 * @param {?HTMLElement} domElement - The HTML element used for event listeners (optional).
	 */
	constructor( object, curve, domElement = null ) {

		super( object, domElement );

		/**
		 * The curve path that the camera follows.
		 *
		 * @type {Curve}
		 */
		this.curve = curve;

		/**
		 * Whether the camera automatically advances along the path.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.autoPlay = false;

		/**
		 * Speed multiplier for playback (1.0 = normal speed).
		 *
		 * @type {number}
		 * @default 1.0
		 */
		this.playbackSpeed = 1.0;

		/**
		 * Current time position in seconds.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.currentTime = 0;

		/**
		 * Duration in seconds to traverse the full path.
		 *
		 * @type {number}
		 * @default 10.0
		 */
		this.loopTime = 10.0;

		/**
		 * Whether to loop back to start when reaching the end.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.loop = false;

		/**
		 * Distance ahead on the path (0-1) to look towards.
		 * 0 means look along tangent, higher values look further ahead.
		 *
		 * @type {number}
		 * @default 0.01
		 */
		this.lookAhead = 0.01;

		/**
		 * The up direction for camera orientation.
		 *
		 * @type {Vector3}
		 * @default Vector3(0, 1, 0)
		 */
		this.upVector = new Vector3( 0, 1, 0 );

		/**
		 * Offset from the curve path in local coordinates.
		 * Applied relative to the path orientation (tangent/normal/binormal).
		 *
		 * @type {Vector3}
		 * @default Vector3(0, 0, 0)
		 */
		this.offset = new Vector3( 0, 0, 0 );

		/**
		 * Keyboard control keys configuration.
		 * Default mappings can be changed to use different keys.
		 *
		 * @type {Object}
		 */
		this.keys = {
			FORWARD: 'ArrowUp',
			BACKWARD: 'ArrowDown',
			INCREASE_SPEED: 'PageUp',
			DECREASE_SPEED: 'PageDown'
		};

		// Internal state
		this._playing = false;
		this._keyboardElement = null;
		this._onKeyDown = this.onKeyDown.bind( this );

	}

	/**
	 * Start automated playback along the path.
	 *
	 * @return {SplineCameraControls}
	 */
	play() {

		this._playing = true;
		this.autoPlay = true;
		return this;

	}

	/**
	 * Pause automated playback.
	 *
	 * @return {SplineCameraControls}
	 */
	pause() {

		this._playing = false;
		this.autoPlay = false;
		return this;

	}

	/**
	 * Reset to the beginning of the path.
	 *
	 * @return {SplineCameraControls}
	 */
	reset() {

		this.currentTime = 0;
		return this;

	}

	/**
	 * Set the current position along the path.
	 *
	 * @param {number} t - Position parameter (0-1, where 0=start, 1=end).
	 * @return {SplineCameraControls}
	 */
	setPosition( t ) {

		this.currentTime = t * this.loopTime;
		return this;

	}

	/**
	 * Get the current position along the path.
	 *
	 * @return {number} Position parameter (0-1).
	 */
	getPosition() {

		return this.currentTime / this.loopTime;

	}

	/**
	 * Enable keyboard controls by adding event listeners.
	 *
	 * @param {HTMLElement} domElement - The element to listen for keyboard events.
	 * @return {SplineCameraControls}
	 */
	listenToKeyEvents( domElement ) {

		domElement.addEventListener( 'keydown', this._onKeyDown );
		this._keyboardElement = domElement;
		return this;

	}

	/**
	 * Disable keyboard controls by removing event listeners.
	 *
	 * @return {SplineCameraControls}
	 */
	stopListenToKeyEvents() {

		if ( this._keyboardElement ) {

			this._keyboardElement.removeEventListener( 'keydown', this._onKeyDown );
			this._keyboardElement = null;

		}

		return this;

	}

	/**
	 * Handle keyboard input for camera control.
	 *
	 * @param {KeyboardEvent} event - The keyboard event.
	 */
	onKeyDown( event ) {

		if ( ! this.enabled ) return;

		const key = event.code;

		switch ( key ) {

			case this.keys.FORWARD:
				// Move forward along path
				this.currentTime += 0.5;
				if ( ! this.loop ) {

					this.currentTime = Math.min( this.currentTime, this.loopTime );

				} else {

					this.currentTime = this.currentTime % this.loopTime;

				}

				this.update( 0 );
				break;

			case this.keys.BACKWARD:
				// Move backward along path
				this.currentTime -= 0.5;
				if ( this.currentTime < 0 ) {

					if ( this.loop ) {

						this.currentTime = this.loopTime + this.currentTime;

					} else {

						this.currentTime = 0;

					}

				}

				this.update( 0 );
				break;

			case this.keys.INCREASE_SPEED:
				// Increase playback speed
				this.playbackSpeed = Math.min( this.playbackSpeed * 1.2, 10.0 );
				break;

			case this.keys.DECREASE_SPEED:
				// Decrease playback speed
				this.playbackSpeed = Math.max( this.playbackSpeed / 1.2, 0.1 );
				break;

		}

	}

	/**
	 * Update the camera position and orientation. Call this in your animation loop.
	 *
	 * @param {number} delta - Time elapsed since last update in seconds.
	 * @return {boolean} True if the camera transform changed.
	 */
	update( delta ) {

		if ( ! this.enabled ) return false;

		const camera = this.object;
		const curve = this.curve;

		// Store previous position for change detection
		_position.copy( camera.position );

		// Update time if auto-playing
		if ( this.autoPlay ) {

			this.currentTime += delta * this.playbackSpeed;

			// Handle looping or clamping
			if ( this.loop ) {

				this.currentTime = this.currentTime % this.loopTime;

			} else {

				this.currentTime = Math.min( this.currentTime, this.loopTime );

			}

		}

		// Calculate position along curve (0-1)
		const t = this.currentTime / this.loopTime;

		// Get position on curve
		curve.getPointAt( t, camera.position );

		// Get tangent (forward direction)
		curve.getTangentAt( t, _tangent );

		// Calculate normal and binormal for local coordinate system
		// Normal is perpendicular to tangent, binormal completes the right-handed system
		if ( Math.abs( _tangent.y ) < 0.999 ) {

			// Use world up if tangent is not vertical
			_binormal.crossVectors( _tangent, this.upVector ).normalize();
			_normal.crossVectors( _binormal, _tangent ).normalize();

		} else {

			// If tangent is nearly vertical, use world forward
			_binormal.set( 1, 0, 0 );
			_normal.crossVectors( _binormal, _tangent ).normalize();
			_binormal.crossVectors( _tangent, _normal ).normalize();

		}

		// Apply offset in curve-local coordinates
		// offset.x = along binormal (left/right relative to path)
		// offset.y = along normal (up/down relative to path)
		// offset.z = along tangent (forward/back relative to path)
		if ( this.offset.lengthSq() > 0 ) {

			camera.position.x += _binormal.x * this.offset.x + _normal.x * this.offset.y + _tangent.x * this.offset.z;
			camera.position.y += _binormal.y * this.offset.x + _normal.y * this.offset.y + _tangent.y * this.offset.z;
			camera.position.z += _binormal.z * this.offset.x + _normal.z * this.offset.y + _tangent.z * this.offset.z;

		}

		// Calculate look-ahead target
		const lookAheadT = this.loop ? ( t + this.lookAhead ) % 1.0 : Math.min( t + this.lookAhead, 1.0 );
		curve.getPointAt( lookAheadT, _lookAtPosition );

		// Orient camera to look at the target point
		camera.lookAt( _lookAtPosition );
		camera.up.copy( this.upVector );

		// Detect change
		const hasChanged = _position.distanceToSquared( camera.position ) > 1e-8;

		if ( hasChanged ) {

			this.dispatchEvent( _changeEvent );

		}

		return hasChanged;

	}

	/**
	 * Clean up resources.
	 */
	dispose() {

		this.stopListenToKeyEvents();

	}

}

export { SplineCameraControls };
