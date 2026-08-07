import {
	Controls,
	MathUtils,
	MOUSE,
	Vector3,
	quatCreate,
	quatSetFromAxisAngle,
	vec2Add,
	vec2Copy,
	vec2Create,
	vec2LengthSq,
	vec2MultiplyScalar,
	vec2Set,
	vec2SubVectors,
	vec3Add,
	vec3AddVectors,
	vec3ApplyQuaternion,
	vec3Copy,
	vec3Cross,
	vec3CrossVectors,
	vec3Create,
	vec3DistanceToSquared,
	vec3Length,
	vec3LengthSq,
	vec3MultiplyScalar,
	vec3Normalize,
	vec3Set,
	vec3SetLength,
	vec3SubVectors
} from 'three';

/**
 * Fires when the camera has been transformed by the controls.
 *
 * @event TrackballControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires when an interaction was initiated.
 *
 * @event TrackballControls#start
 * @type {Object}
 */
const _startEvent = { type: 'start' };

/**
 * Fires when an interaction has finished.
 *
 * @event TrackballControls#end
 * @type {Object}
 */
const _endEvent = { type: 'end' };

const _EPS = 0.000001;
const _STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

const _v2 = /*@__PURE__*/ vec2Create();
const _mouseChange = /*@__PURE__*/ vec2Create();
const _objectUp = /*@__PURE__*/ vec3Create();
const _pan = /*@__PURE__*/ vec3Create();
const _axis = /*@__PURE__*/ vec3Create();
const _quaternion = /*@__PURE__*/ quatCreate();
const _eyeDirection = /*@__PURE__*/ vec3Create();
const _objectUpDirection = /*@__PURE__*/ vec3Create();
const _objectSidewaysDirection = /*@__PURE__*/ vec3Create();
const _moveDirection = /*@__PURE__*/ vec3Create();

/**
 * This class is similar to {@link OrbitControls}. However, it does not maintain a constant camera
 * `up` vector. That means if the camera orbits over the “north” and “south” poles, it does not flip
 * to stay "right side up".
 *
 * @augments Controls
 * @three_import import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
 */
class TrackballControls extends Controls {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Object3D} object - The object that is managed by the controls.
	 * @param {?HTMLElement} domElement - The HTML element used for event listeners.
	 */
	constructor( object, domElement = null ) {

		super( object, domElement );

		/**
		 * Represents the properties of the screen. Automatically set when `handleResize()` is called.
		 *
		 * @type {Object}
		 * @readonly
		 */
		this.screen = { left: 0, top: 0, width: 0, height: 0 };

		/**
		 * The rotation speed.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.rotateSpeed = 1.0;

		/**
		 * The zoom speed.
		 *
		 * @type {number}
		 * @default 1.2
		 */
		this.zoomSpeed = 1.2;

		/**
		 * The pan speed.
		 *
		 * @type {number}
		 * @default 0.3
		 */
		this.panSpeed = 0.3;

		/**
		 * Whether rotation is disabled or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.noRotate = false;

		/**
		 * Whether zooming is disabled or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.noZoom = false;

		/**
		 * Whether panning is disabled or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.noPan = false;

		/**
		 * Whether damping is disabled or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.staticMoving = false;

		/**
		 * Defines the intensity of damping. Only considered if `staticMoving` is set to `false`.
		 *
		 * @type {number}
		 * @default 0.2
		 */
		this.dynamicDampingFactor = 0.2;

		/**
		 * How far you can dolly in (perspective camera only).
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minDistance = 0;

		/**
		 * How far you can dolly out (perspective camera only).
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxDistance = Infinity;

		/**
		 * How far you can zoom in (orthographic camera only).
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minZoom = 0;

		/**
		 * How far you can zoom out (orthographic camera only).
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxZoom = Infinity;

		/**
		 * This array holds keycodes for controlling interactions.
		 *
		 * - When the first defined key is pressed, all mouse interactions (left, middle, right) performs orbiting.
		 * - When the second defined key is pressed, all mouse interactions (left, middle, right) performs zooming.
		 * - When the third defined key is pressed, all mouse interactions (left, middle, right) performs panning.
		 *
		 * Default is *KeyA, KeyS, KeyD* which represents A, S, D.
		 *
		 * @type {Array<string>}
		 */
		this.keys = [ 'KeyA' /*A*/, 'KeyS' /*S*/, 'KeyD' /*D*/ ];

		/**
		 * This object contains references to the mouse actions used by the controls.
		 *
		 * ```js
		 * controls.mouseButtons = {
		 * 	LEFT: THREE.MOUSE.ROTATE,
		 * 	MIDDLE: THREE.MOUSE.DOLLY,
		 * 	RIGHT: THREE.MOUSE.PAN
		 * }
		 * ```
		 * @type {Object}
		 */
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		/**
		 * The focus point of the controls.
		 *
		 * @type {Vector3}
		 */
		this.target = new Vector3();

		// internals

		this.state = _STATE.NONE;
		this.keyState = _STATE.NONE;

		this._lastPosition = vec3Create();
		this._lastZoom = 1;
		this._touchZoomDistanceStart = 0;
		this._touchZoomDistanceEnd = 0;
		this._lastAngle = 0;

		this._eye = vec3Create();

		this._movePrev = vec2Create();
		this._moveCurr = vec2Create();

		this._lastAxis = vec3Create();

		this._zoomStart = vec2Create();
		this._zoomEnd = vec2Create();

		this._panStart = vec2Create();
		this._panEnd = vec2Create();

		this._pointers = [];
		this._pointerPositions = {};

		// event listeners

		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
		this._onPointerCancel = onPointerCancel.bind( this );
		this._onContextMenu = onContextMenu.bind( this );
		this._onMouseWheel = onMouseWheel.bind( this );
		this._onKeyDown = onKeyDown.bind( this );
		this._onKeyUp = onKeyUp.bind( this );

		this._onTouchStart = onTouchStart.bind( this );
		this._onTouchMove = onTouchMove.bind( this );
		this._onTouchEnd = onTouchEnd.bind( this );

		this._onMouseDown = onMouseDown.bind( this );
		this._onMouseMove = onMouseMove.bind( this );
		this._onMouseUp = onMouseUp.bind( this );

		// for reset

		this._target0 = vec3Copy( this.target );
		this._position0 = vec3Copy( this.object.position );
		this._up0 = vec3Copy( this.object.up );
		this._zoom0 = this.object.zoom;

		if ( domElement !== null ) {

			this.connect( domElement );

			this.handleResize();

		}

		// force an update at start
		this.update();

	}

	connect( element ) {

		super.connect( element );

		window.addEventListener( 'keydown', this._onKeyDown );
		window.addEventListener( 'keyup', this._onKeyUp );

		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointercancel', this._onPointerCancel );
		this.domElement.addEventListener( 'wheel', this._onMouseWheel, { passive: false } );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = 'none'; // Disable touch scroll

	}

	disconnect() {

		window.removeEventListener( 'keydown', this._onKeyDown );
		window.removeEventListener( 'keyup', this._onKeyUp );

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.ownerDocument.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerup', this._onPointerUp );
		this.domElement.removeEventListener( 'pointercancel', this._onPointerCancel );
		this.domElement.removeEventListener( 'wheel', this._onMouseWheel );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = ''; // Restore touch scroll

	}

	dispose() {

		this.disconnect();

	}

	/**
	 * Must be called if the application window is resized.
	 */
	handleResize() {

		const box = this.domElement.getBoundingClientRect();
		// adjustments come from similar code in the jquery offset() function
		const d = this.domElement.ownerDocument.documentElement;

		this.screen.left = box.left + window.pageXOffset - d.clientLeft;
		this.screen.top = box.top + window.pageYOffset - d.clientTop;
		this.screen.width = box.width;
		this.screen.height = box.height;

	}

	update() {

		vec3SubVectors( this.object.position, this.target, this._eye );

		if ( ! this.noRotate ) {

			this._rotateCamera();

		}

		if ( ! this.noZoom ) {

			this._zoomCamera();

		}

		if ( ! this.noPan ) {

			this._panCamera();

		}

		vec3AddVectors( this.target, this._eye, this.object.position );

		if ( this.object.isPerspectiveCamera ) {

			this._checkDistances();

			this.object.lookAt( this.target );

			if ( vec3DistanceToSquared( this._lastPosition, this.object.position ) > _EPS ) {

				this.dispatchEvent( _changeEvent );

				vec3Copy( this.object.position, this._lastPosition );

			}

		} else if ( this.object.isOrthographicCamera ) {

			this.object.lookAt( this.target );

			if ( vec3DistanceToSquared( this._lastPosition, this.object.position ) > _EPS || this._lastZoom !== this.object.zoom ) {

				this.dispatchEvent( _changeEvent );

				vec3Copy( this.object.position, this._lastPosition );
				this._lastZoom = this.object.zoom;

			}

		} else {

			console.warn( 'THREE.TrackballControls: Unsupported camera type.' );

		}

	}

	/**
	 * Resets the controls to its initial state.
	 */
	reset() {

		this.state = _STATE.NONE;
		this.keyState = _STATE.NONE;

		vec3Copy( this._target0, this.target );
		vec3Copy( this._position0, this.object.position );
		vec3Copy( this._up0, this.object.up );
		this.object.zoom = this._zoom0;

		this.object.updateProjectionMatrix();

		vec3SubVectors( this.object.position, this.target, this._eye );

		this.object.lookAt( this.target );

		this.dispatchEvent( _changeEvent );

		vec3Copy( this.object.position, this._lastPosition );
		this._lastZoom = this.object.zoom;

	}

	_panCamera() {

		vec2SubVectors( this._panEnd, this._panStart, _mouseChange );

		if ( vec2LengthSq( _mouseChange ) ) {

			if ( this.object.isOrthographicCamera ) {

				const scale_x = ( this.object.right - this.object.left ) / this.object.zoom / this.domElement.clientWidth;
				const scale_y = ( this.object.top - this.object.bottom ) / this.object.zoom / this.domElement.clientWidth;

				_mouseChange.x *= scale_x;
				_mouseChange.y *= scale_y;

			}

			vec2MultiplyScalar( _mouseChange, vec3Length( this._eye ) * this.panSpeed, _mouseChange );

			vec3Cross( this._eye, this.object.up, _pan );
			vec3SetLength( _pan, _mouseChange.x, _pan );
			vec3Copy( this.object.up, _objectUp );
			vec3SetLength( _objectUp, _mouseChange.y, _objectUp );
			vec3Add( _pan, _objectUp, _pan );

			vec3Add( this.object.position, _pan, this.object.position );
			vec3Add( this.target, _pan, this.target );

			if ( this.staticMoving ) {

				vec2Copy( this._panEnd, this._panStart );

			} else {

				vec2SubVectors( this._panEnd, this._panStart, _mouseChange );
				vec2MultiplyScalar( _mouseChange, this.dynamicDampingFactor, _mouseChange );
				vec2Add( this._panStart, _mouseChange, this._panStart );

			}

		}

	}

	_rotateCamera() {

		vec3Set( _moveDirection, this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0 );
		let angle = vec3Length( _moveDirection );

		if ( angle ) {

			vec3SubVectors( this.object.position, this.target, this._eye );

			vec3Normalize( this._eye, _eyeDirection );
			vec3Normalize( this.object.up, _objectUpDirection );
			vec3CrossVectors( _objectUpDirection, _eyeDirection, _objectSidewaysDirection );
			vec3Normalize( _objectSidewaysDirection, _objectSidewaysDirection );

			vec3SetLength( _objectUpDirection, this._moveCurr.y - this._movePrev.y, _objectUpDirection );
			vec3SetLength( _objectSidewaysDirection, this._moveCurr.x - this._movePrev.x, _objectSidewaysDirection );

			vec3Add( _objectUpDirection, _objectSidewaysDirection, _moveDirection );

			vec3CrossVectors( _moveDirection, this._eye, _axis );
			vec3Normalize( _axis, _axis );

			angle *= this.rotateSpeed;
			quatSetFromAxisAngle( _axis, angle, _quaternion );

			vec3ApplyQuaternion( this._eye, _quaternion, this._eye );
			vec3ApplyQuaternion( this.object.up, _quaternion, this.object.up );

			vec3Copy( _axis, this._lastAxis );
			this._lastAngle = angle;

		} else if ( ! this.staticMoving && this._lastAngle ) {

			this._lastAngle *= Math.sqrt( 1.0 - this.dynamicDampingFactor );
			vec3SubVectors( this.object.position, this.target, this._eye );
			quatSetFromAxisAngle( this._lastAxis, this._lastAngle, _quaternion );
			vec3ApplyQuaternion( this._eye, _quaternion, this._eye );
			vec3ApplyQuaternion( this.object.up, _quaternion, this.object.up );

		}

		vec2Copy( this._moveCurr, this._movePrev );

	}

	_zoomCamera() {

		let factor;

		if ( this.state === _STATE.TOUCH_ZOOM_PAN ) {

			factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
			this._touchZoomDistanceStart = this._touchZoomDistanceEnd;

			if ( this.object.isPerspectiveCamera ) {

				vec3MultiplyScalar( this._eye, factor, this._eye );

			} else if ( this.object.isOrthographicCamera ) {

				this.object.zoom = MathUtils.clamp( this.object.zoom / factor, this.minZoom, this.maxZoom );

				if ( this._lastZoom !== this.object.zoom ) {

					this.object.updateProjectionMatrix();

				}

			} else {

				console.warn( 'THREE.TrackballControls: Unsupported camera type' );

			}

		} else {

			factor = 1.0 + ( this._zoomEnd.y - this._zoomStart.y ) * this.zoomSpeed;

			if ( factor !== 1.0 && factor > 0.0 ) {

				if ( this.object.isPerspectiveCamera ) {

					vec3MultiplyScalar( this._eye, factor, this._eye );

				} else if ( this.object.isOrthographicCamera ) {

					this.object.zoom = MathUtils.clamp( this.object.zoom / factor, this.minZoom, this.maxZoom );

					if ( this._lastZoom !== this.object.zoom ) {

						this.object.updateProjectionMatrix();

					}

				} else {

					console.warn( 'THREE.TrackballControls: Unsupported camera type' );

				}

			}

			if ( this.staticMoving ) {

				vec2Copy( this._zoomEnd, this._zoomStart );

			} else {

				this._zoomStart.y += ( this._zoomEnd.y - this._zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	}

	_getMouseOnScreen( pageX, pageY ) {

		vec2Set(
			( pageX - this.screen.left ) / this.screen.width,
			( pageY - this.screen.top ) / this.screen.height,
			_v2
		);

		return _v2;

	}

	_getMouseOnCircle( pageX, pageY ) {

		vec2Set(
			( ( pageX - this.screen.width * 0.5 - this.screen.left ) / ( this.screen.width * 0.5 ) ),
			( ( this.screen.height + 2 * ( this.screen.top - pageY ) ) / this.screen.width ), // screen.width intentional
			_v2
		);

		return _v2;

	}

	_addPointer( event ) {

		this._pointers.push( event );

	}

	_removePointer( event ) {

		delete this._pointerPositions[ event.pointerId ];

		for ( let i = 0; i < this._pointers.length; i ++ ) {

			if ( this._pointers[ i ].pointerId == event.pointerId ) {

				this._pointers.splice( i, 1 );
				return;

			}

		}

	}

	_trackPointer( event ) {

		let position = this._pointerPositions[ event.pointerId ];

		if ( position === undefined ) {

			position = vec2Create();
			this._pointerPositions[ event.pointerId ] = position;

		}

		vec2Set( event.pageX, event.pageY, position );

	}

	_getSecondPointerPosition( event ) {

		const pointer = ( event.pointerId === this._pointers[ 0 ].pointerId ) ? this._pointers[ 1 ] : this._pointers[ 0 ];

		return this._pointerPositions[ pointer.pointerId ];

	}

	_checkDistances() {

		if ( ! this.noZoom || ! this.noPan ) {

			if ( vec3LengthSq( this._eye ) > this.maxDistance * this.maxDistance ) {

				vec3SetLength( this._eye, this.maxDistance, this._eye );
				vec3AddVectors( this.target, this._eye, this.object.position );
				vec2Copy( this._zoomEnd, this._zoomStart );

			}

			if ( vec3LengthSq( this._eye ) < this.minDistance * this.minDistance ) {

				vec3SetLength( this._eye, this.minDistance, this._eye );
				vec3AddVectors( this.target, this._eye, this.object.position );
				vec2Copy( this._zoomEnd, this._zoomStart );

			}

		}

	}

}

function onPointerDown( event ) {

	if ( this.enabled === false ) return;

	if ( this._pointers.length === 0 ) {

		this.domElement.setPointerCapture( event.pointerId );

		this.domElement.ownerDocument.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.ownerDocument.addEventListener( 'pointerup', this._onPointerUp );

	}

	//

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

	if ( this.enabled === false ) return;

	if ( event.pointerType === 'touch' ) {

		this._onTouchEnd( event );

	} else {

		this._onMouseUp();

	}

	//

	this._removePointer( event );

	if ( this._pointers.length === 0 ) {

		this.domElement.releasePointerCapture( event.pointerId );

		this.domElement.ownerDocument.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerup', this._onPointerUp );

	}

}

function onPointerCancel( event ) {

	this._removePointer( event );

}

function onKeyUp() {

	if ( this.enabled === false ) return;

	this.keyState = _STATE.NONE;

	window.addEventListener( 'keydown', this._onKeyDown );

}

function onKeyDown( event ) {

	if ( this.enabled === false ) return;

	window.removeEventListener( 'keydown', this._onKeyDown );

	if ( this.keyState !== _STATE.NONE ) {

		return;

	} else if ( event.code === this.keys[ _STATE.ROTATE ] && ! this.noRotate ) {

		this.keyState = _STATE.ROTATE;

	} else if ( event.code === this.keys[ _STATE.ZOOM ] && ! this.noZoom ) {

		this.keyState = _STATE.ZOOM;

	} else if ( event.code === this.keys[ _STATE.PAN ] && ! this.noPan ) {

		this.keyState = _STATE.PAN;

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
			this.state = _STATE.ZOOM;
			break;

		case MOUSE.ROTATE:
			this.state = _STATE.ROTATE;
			break;

		case MOUSE.PAN:
			this.state = _STATE.PAN;
			break;

		default:
			this.state = _STATE.NONE;

	}

	const state = ( this.keyState !== _STATE.NONE ) ? this.keyState : this.state;

	if ( state === _STATE.ROTATE && ! this.noRotate ) {

		vec2Copy( this._getMouseOnCircle( event.pageX, event.pageY ), this._moveCurr );
		vec2Copy( this._moveCurr, this._movePrev );

	} else if ( state === _STATE.ZOOM && ! this.noZoom ) {

		vec2Copy( this._getMouseOnScreen( event.pageX, event.pageY ), this._zoomStart );
		vec2Copy( this._zoomStart, this._zoomEnd );

	} else if ( state === _STATE.PAN && ! this.noPan ) {

		vec2Copy( this._getMouseOnScreen( event.pageX, event.pageY ), this._panStart );
		vec2Copy( this._panStart, this._panEnd );

	}

	this.dispatchEvent( _startEvent );

}

function onMouseMove( event ) {

	const state = ( this.keyState !== _STATE.NONE ) ? this.keyState : this.state;

	if ( state === _STATE.ROTATE && ! this.noRotate ) {

		vec2Copy( this._moveCurr, this._movePrev );
		vec2Copy( this._getMouseOnCircle( event.pageX, event.pageY ), this._moveCurr );

	} else if ( state === _STATE.ZOOM && ! this.noZoom ) {

		vec2Copy( this._getMouseOnScreen( event.pageX, event.pageY ), this._zoomEnd );

	} else if ( state === _STATE.PAN && ! this.noPan ) {

		vec2Copy( this._getMouseOnScreen( event.pageX, event.pageY ), this._panEnd );

	}

}

function onMouseUp() {

	this.state = _STATE.NONE;

	this.dispatchEvent( _endEvent );

}

function onMouseWheel( event ) {

	if ( this.enabled === false ) return;

	if ( this.noZoom === true ) return;

	event.preventDefault();

	switch ( event.deltaMode ) {

		case 2:
			// Zoom in pages
			this._zoomStart.y -= event.deltaY * 0.025;
			break;

		case 1:
			// Zoom in lines
			this._zoomStart.y -= event.deltaY * 0.01;
			break;

		default:
			// undefined, 0, assume pixels
			this._zoomStart.y -= event.deltaY * 0.00025;
			break;

	}

	this.dispatchEvent( _startEvent );
	this.dispatchEvent( _endEvent );

}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

function onTouchStart( event ) {

	this._trackPointer( event );

	switch ( this._pointers.length ) {

		case 1:
			this.state = _STATE.TOUCH_ROTATE;
			vec2Copy( this._getMouseOnCircle( this._pointers[ 0 ].pageX, this._pointers[ 0 ].pageY ), this._moveCurr );
			vec2Copy( this._moveCurr, this._movePrev );
			break;

		default: // 2 or more
			this.state = _STATE.TOUCH_ZOOM_PAN;
			const dx = this._pointers[ 0 ].pageX - this._pointers[ 1 ].pageX;
			const dy = this._pointers[ 0 ].pageY - this._pointers[ 1 ].pageY;
			this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

			const x = ( this._pointers[ 0 ].pageX + this._pointers[ 1 ].pageX ) / 2;
			const y = ( this._pointers[ 0 ].pageY + this._pointers[ 1 ].pageY ) / 2;
			vec2Copy( this._getMouseOnScreen( x, y ), this._panStart );
			vec2Copy( this._panStart, this._panEnd );
			break;

	}

	this.dispatchEvent( _startEvent );

}

function onTouchMove( event ) {

	this._trackPointer( event );

	switch ( this._pointers.length ) {

		case 1:
			vec2Copy( this._moveCurr, this._movePrev );
			vec2Copy( this._getMouseOnCircle( event.pageX, event.pageY ), this._moveCurr );
			break;

		default: // 2 or more

			const position = this._getSecondPointerPosition( event );

			const dx = event.pageX - position.x;
			const dy = event.pageY - position.y;
			this._touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

			const x = ( event.pageX + position.x ) / 2;
			const y = ( event.pageY + position.y ) / 2;
			vec2Copy( this._getMouseOnScreen( x, y ), this._panEnd );
			break;

	}

}

function onTouchEnd( event ) {

	switch ( this._pointers.length ) {

		case 0:
			this.state = _STATE.NONE;
			break;

		case 1:
			this.state = _STATE.TOUCH_ROTATE;
			vec2Copy( this._getMouseOnCircle( event.pageX, event.pageY ), this._moveCurr );
			vec2Copy( this._moveCurr, this._movePrev );
			break;

		case 2:
			this.state = _STATE.TOUCH_ZOOM_PAN;

			for ( let i = 0; i < this._pointers.length; i ++ ) {

				if ( this._pointers[ i ].pointerId !== event.pointerId ) {

					const position = this._pointerPositions[ this._pointers[ i ].pointerId ];
					vec2Copy( this._getMouseOnCircle( position.x, position.y ), this._moveCurr );
					vec2Copy( this._moveCurr, this._movePrev );
					break;

				}

			}

			break;

	}

	this.dispatchEvent( _endEvent );

}

export { TrackballControls };
