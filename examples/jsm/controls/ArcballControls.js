import {
	Controls,
	GridHelper,
	EllipseCurve,
	BufferGeometry,
	Line,
	LineBasicMaterial,
	Raycaster,
	Group,
	Vector3,
	MathUtils,
	box3Create,
	box3GetBoundingSphere,
	box3SetFromObject,
	mat4Copy,
	mat4Create,
	mat4Decompose,
	mat4ExtractRotation,
	mat4FromArray,
	mat4Identity,
	mat4MakeRotationAxis,
	mat4MakeScale,
	mat4MakeTranslation,
	mat4Multiply,
	mat4SetPosition,
	quatCopy,
	quatCreate,
	quatSetFromRotationMatrix,
	sphereCreate,
	vec2Angle,
	vec2Copy,
	vec2Create,
	vec2SetX,
	vec2SetY,
	vec3Add,
	vec3AngleTo,
	vec3ApplyAxisAngle,
	vec3ApplyMatrix4,
	vec3ApplyQuaternion,
	vec3Copy,
	vec3Create,
	vec3CrossVectors,
	vec3DistanceTo,
	vec3Equals,
	vec3FromArray,
	vec3Length,
	vec3MultiplyScalar,
	vec3Normalize,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3SetY,
	vec3SetZ,
	vec3Sub
} from 'three';

//trackball state
const STATE = {

	IDLE: Symbol(),
	ROTATE: Symbol(),
	PAN: Symbol(),
	SCALE: Symbol(),
	FOV: Symbol(),
	FOCUS: Symbol(),
	ZROTATE: Symbol(),
	TOUCH_MULTI: Symbol(),
	ANIMATION_FOCUS: Symbol(),
	ANIMATION_ROTATE: Symbol()

};

const INPUT = {

	NONE: Symbol(),
	ONE_FINGER: Symbol(),
	ONE_FINGER_SWITCHED: Symbol(),
	TWO_FINGER: Symbol(),
	MULT_FINGER: Symbol(),
	CURSOR: Symbol()

};

//cursor center coordinates
const _center = {

	x: 0,
	y: 0

};

//transformation matrices for gizmos and camera
const _transformation = {

	camera: mat4Create(),
	gizmos: mat4Create()

};

/**
 * Fires when the camera has been transformed by the controls.
 *
 * @event ArcballControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires when an interaction was initiated.
 *
 * @event ArcballControls#start
 * @type {Object}
 */
const _startEvent = { type: 'start' };

/**
 * Fires when an interaction has finished.
 *
 * @event ArcballControls#end
 * @type {Object}
 */
const _endEvent = { type: 'end' };

const _raycaster = new Raycaster();
const _offset = vec3Create();

const _gizmoMatrixStateTemp = mat4Create();
const _cameraMatrixStateTemp = mat4Create();
const _scalePointTemp = vec3Create();

const _EPS = 0.000001;

/**
 * Arcball controls allow the camera to be controlled by a virtual trackball with full touch support and advanced navigation functionality.
 * Cursor/finger positions and movements are mapped over a virtual trackball surface represented by a gizmo and mapped in intuitive and
 * consistent camera movements. Dragging cursor/fingers will cause camera to orbit around the center of the trackball in a conservative
 * way (returning to the starting point will make the camera return to its starting orientation).
 *
 * In addition to supporting pan, zoom and pinch gestures, double clicking/tapping focuses on a point, intuitively moving the object's
 * point of interest to the center of the virtual trackball. Focus allows a much better inspection and navigation in complex environment.
 * Moreover Arcball controls allow FOV manipulation (in a vertigo-style method) and z-rotation. Saving and restoring of Camera State
 * is supported also through clipboard (use ctrl+c and ctrl+v shortcuts for copy and paste the state).
 *
 * Unlike {@link OrbitControls} and {@link TrackballControls}, `ArcballControls` doesn't require `update()` to be called externally in an
 * animation loop when animations are on.
 *
 * @augments Controls
 * @three_import import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
 */
class ArcballControls extends Controls {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Camera} camera - The camera to be controlled. The camera must not be a child of another object, unless that object is the scene itself.
	 * @param {?HTMLElement} [domElement=null] - The HTML element used for event listeners.
	 * @param {?Scene} [scene=null] The scene rendered by the camera. If not given, gizmos cannot be shown.
	 */
	constructor( camera, domElement = null, scene = null ) {

		super( camera, domElement );

		/**
		 * The scene rendered by the camera. If not given, gizmos cannot be shown.
		 *
		 * @type {?Scene}
		 * @default null
		 */
		this.scene = scene;

		/**
		 * The control's focus point.
		 *
		 * @type {Vector3}
		 */
		this.target = new Vector3();
		this._currentTarget = vec3Create();

		/**
		 * The size of the gizmo relative to the screen width and height.
		 *
		 * @type {number}
		 * @default 0.67
		 */
		this.radiusFactor = 0.67;

		/**
		 * Holds the mouse actions of this controls. This property is maintained by the methods
		 * `setMouseAction()` and `unsetMouseAction()`.
		 *
		 * @type {Array<Object>}
		 */
		this.mouseActions = [];
		this._mouseOp = null;


		//global vectors and matrices that are used in some operations to avoid creating new objects every time (e.g. every time cursor moves)
		this._v2_1 = vec2Create();
		this._v3_1 = vec3Create();
		this._v3_2 = vec3Create();

		this._m4_1 = mat4Create();
		this._m4_2 = mat4Create();

		this._quat = quatCreate();

		//transformation matrices
		this._translationMatrix = mat4Create(); //matrix for translation operation
		this._rotationMatrix = mat4Create(); //matrix for rotation operation
		this._scaleMatrix = mat4Create(); //matrix for scaling operation

		this._rotationAxis = vec3Create(); //axis for rotate operation


		//camera state
		this._cameraMatrixState = mat4Create();
		this._cameraProjectionState = mat4Create();

		this._fovState = 1;
		this._upState = vec3Create();
		this._zoomState = 1;
		this._nearPos = 0;
		this._farPos = 0;

		this._gizmoMatrixState = mat4Create();

		//initial values
		this._up0 = vec3Create();
		this._zoom0 = 1;
		this._fov0 = 0;
		this._initialNear = 0;
		this._nearPos0 = 0;
		this._initialFar = 0;
		this._farPos0 = 0;
		this._cameraMatrixState0 = mat4Create();
		this._gizmoMatrixState0 = mat4Create();
		this._target0 = vec3Create();

		//pointers array
		this._button = - 1;
		this._touchStart = [];
		this._touchCurrent = [];
		this._input = INPUT.NONE;

		//two fingers touch interaction
		this._switchSensibility = 32;	//minimum movement to be performed to fire single pan start after the second finger has been released
		this._startFingerDistance = 0; //distance between two fingers
		this._currentFingerDistance = 0;
		this._startFingerRotation = 0; //amount of rotation performed with two fingers
		this._currentFingerRotation = 0;

		//double tap
		this._devPxRatio = 0;
		this._downValid = true;
		this._nclicks = 0;
		this._downEvents = [];
		this._downStart = 0;	//pointerDown time
		this._clickStart = 0;	//first click time
		this._maxDownTime = 250;
		this._maxInterval = 300;
		this._posThreshold = 24;
		this._movementThreshold = 24;

		//cursor positions
		this._currentCursorPosition = vec3Create();
		this._startCursorPosition = vec3Create();

		//grid
		this._grid = null; //grid to be visualized during pan operation
		this._gridPosition = vec3Create();

		//gizmos
		this._gizmos = new Group();
		this._curvePts = 128;


		//animations
		this._timeStart = - 1; //initial time
		this._animationId = - 1;

		/**
		 * Duration of focus animations in ms.
		 *
		 * @type {number}
		 * @default 500
		 */
		this.focusAnimationTime = 500;

		//rotate animation
		this._timePrev = 0; //time at which previous rotate operation has been detected
		this._timeCurrent = 0; //time at which current rotate operation has been detected
		this._anglePrev = 0; //angle of previous rotation
		this._angleCurrent = 0; //angle of current rotation
		this._cursorPosPrev = vec3Create();	//cursor position when previous rotate operation has been detected
		this._cursorPosCurr = vec3Create();//cursor position when current rotate operation has been detected
		this._wPrev = 0; //angular velocity of the previous rotate operation
		this._wCurr = 0; //angular velocity of the current rotate operation

		//parameters

		/**
		 * If set to `true`, the camera's near and far values will be adjusted every time zoom is
		 * performed trying to maintain the same visible portion given by initial near and far
		 * values. Only works with perspective cameras.
		 *
		 * This feature only works as expected if the camera's initial state (position, near and far values)
		 * is correctly configured before creating the controls. Otherwise {@link ArcballControls#setCamera}
		 * must be called by the application.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.adjustNearFar = false;

		/**
		 * The scaling factor used when performing zoom operation.
		 *
		 * @type {number}
		 * @default 1.1
		 */
		this.scaleFactor = 1.1;

		/**
		 * The damping inertia used if 'enableAnimations` is set to `true`.
		 *
		 * @type {number}
		 * @default 25
		 */
		this.dampingFactor = 25;

		/**
		 * Maximum angular velocity allowed on rotation animation start.
		 *
		 * @type {number}
		 * @default 20
		 */
		this.wMax = 20;

		/**
		 * Set to `true` to enable animations for rotation (damping) and focus operation.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableAnimations = true;

		/**
		 * If set to `true`, a grid will appear when panning operation is being performed
		 * (desktop interaction only).
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.enableGrid = false;

		/**
		 * Set to `true` to make zoom become cursor centered.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.cursorZoom = false;

		/**
		 * The minimum FOV in degrees.
		 *
		 * @type {number}
		 * @default 5
		 */
		this.minFov = 5;

		/**
		 * The maximum FOV in degrees.
		 *
		 * @type {number}
		 * @default 90
		 */
		this.maxFov = 90;

		/**
		 * Speed of rotation.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.rotateSpeed = 1;

		/**
		 * Enable or disable camera panning.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enablePan = true;

		/**
		 * Enable or disable camera rotation.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableRotate = true;

		/**
		 * Enable or disable camera zoom.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableZoom = true;

		/**
		 * Enable or disable gizmos.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableGizmos = true;

		/**
		 * Enable or disable camera focusing on double-tap (or click) operations.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableFocus = true;

		/**
		 * How far you can dolly in. For perspective cameras only.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minDistance = 0;

		/**
		 * How far you can dolly out. For perspective cameras only.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxDistance = Infinity;

		/**
		 * How far you can zoom in. For orthographic cameras only.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minZoom = 0;

		/**
		 * How far you can zoom out. For orthographic cameras only.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxZoom = Infinity;

		//trackball parameters
		this._tbRadius = 1;

		//FSA
		this._state = STATE.IDLE;

		this.setCamera( camera );

		if ( this.scene != null ) {

			this.scene.add( this._gizmos );

		}

		this.initializeMouseActions();

		// event listeners

		this._onContextMenu = onContextMenu.bind( this );
		this._onWheel = onWheel.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerCancel = onPointerCancel.bind( this );
		this._onWindowResize = onWindowResize.bind( this );

		if ( domElement !== null ) {

			this.connect( domElement );

		}

	}

	connect( element ) {

		super.connect( element );

		this._devPxRatio = window.devicePixelRatio;

		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );
		this.domElement.addEventListener( 'wheel', this._onWheel, { passive: false } );
		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointercancel', this._onPointerCancel );

		window.addEventListener( 'resize', this._onWindowResize );

		this.domElement.style.touchAction = 'none'; // Disable touch scroll

	}

	disconnect() {

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'pointercancel', this._onPointerCancel );
		this.domElement.removeEventListener( 'wheel', this._onWheel );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		window.removeEventListener( 'pointermove', this._onPointerMove );
		window.removeEventListener( 'pointerup', this._onPointerUp );

		window.removeEventListener( 'resize', this._onWindowResize );

		this.domElement.style.touchAction = ''; // Restore touch scroll

	}

	onSinglePanStart( event, operation ) {

		if ( this.enabled ) {

			this.dispatchEvent( _startEvent );

			this.setCenter( event.clientX, event.clientY );

			switch ( operation ) {

				case 'PAN':

					if ( ! this.enablePan ) {

						return;

					}

					if ( this._animationId != - 1 ) {

						cancelAnimationFrame( this._animationId );
						this._animationId = - 1;
						this._timeStart = - 1;

						this.activateGizmos( false );
						this.dispatchEvent( _changeEvent );

					}

					this.updateTbState( STATE.PAN, true );
					vec3Copy( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement ), this._startCursorPosition );
					if ( this.enableGrid ) {

						this.drawGrid();
						this.dispatchEvent( _changeEvent );

					}

					break;

				case 'ROTATE':

					if ( ! this.enableRotate ) {

						return;

					}

					if ( this._animationId != - 1 ) {

						cancelAnimationFrame( this._animationId );
						this._animationId = - 1;
						this._timeStart = - 1;

					}

					this.updateTbState( STATE.ROTATE, true );
					vec3Copy( this.unprojectOnTbSurface( this.object, _center.x, _center.y, this.domElement, this._tbRadius ), this._startCursorPosition );
					this.activateGizmos( true );
					if ( this.enableAnimations ) {

						this._timePrev = this._timeCurrent = performance.now();
						this._angleCurrent = this._anglePrev = 0;
						vec3Copy( this._startCursorPosition, this._cursorPosPrev );
						vec3Copy( this._cursorPosPrev, this._cursorPosCurr );
						this._wCurr = 0;
						this._wPrev = this._wCurr;

					}

					this.dispatchEvent( _changeEvent );
					break;

				case 'FOV':

					if ( ! this.object.isPerspectiveCamera || ! this.enableZoom ) {

						return;

					}

					if ( this._animationId != - 1 ) {

						cancelAnimationFrame( this._animationId );
						this._animationId = - 1;
						this._timeStart = - 1;

						this.activateGizmos( false );
						this.dispatchEvent( _changeEvent );

					}

					this.updateTbState( STATE.FOV, true );
					vec3SetY( this._startCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );
					vec3Copy( this._startCursorPosition, this._currentCursorPosition );
					break;

				case 'ZOOM':

					if ( ! this.enableZoom ) {

						return;

					}

					if ( this._animationId != - 1 ) {

						cancelAnimationFrame( this._animationId );
						this._animationId = - 1;
						this._timeStart = - 1;

						this.activateGizmos( false );
						this.dispatchEvent( _changeEvent );

					}

					this.updateTbState( STATE.SCALE, true );
					vec3SetY( this._startCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );
					vec3Copy( this._startCursorPosition, this._currentCursorPosition );
					break;

			}

		}

	}

	onSinglePanMove( event, opState ) {

		if ( this.enabled ) {

			const restart = opState != this._state;
			this.setCenter( event.clientX, event.clientY );

			switch ( opState ) {

				case STATE.PAN:

					if ( this.enablePan ) {

						if ( restart ) {

							//switch to pan operation

							this.dispatchEvent( _endEvent );
							this.dispatchEvent( _startEvent );

							this.updateTbState( opState, true );
							vec3Copy( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement ), this._startCursorPosition );
							if ( this.enableGrid ) {

								this.drawGrid();

							}

							this.activateGizmos( false );

						} else {

							//continue with pan operation
							vec3Copy( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement ), this._currentCursorPosition );
							this.applyTransformMatrix( this.pan( this._startCursorPosition, this._currentCursorPosition ) );

						}

					}

					break;

				case STATE.ROTATE:

					if ( this.enableRotate ) {

						if ( restart ) {

							//switch to rotate operation

							this.dispatchEvent( _endEvent );
							this.dispatchEvent( _startEvent );

							this.updateTbState( opState, true );
							vec3Copy( this.unprojectOnTbSurface( this.object, _center.x, _center.y, this.domElement, this._tbRadius ), this._startCursorPosition );

							if ( this.enableGrid ) {

								this.disposeGrid();

							}

							this.activateGizmos( true );

						} else {

							//continue with rotate operation
							vec3Copy( this.unprojectOnTbSurface( this.object, _center.x, _center.y, this.domElement, this._tbRadius ), this._currentCursorPosition );

							const distance = vec3DistanceTo( this._startCursorPosition, this._currentCursorPosition );
							const angle = vec3AngleTo( this._startCursorPosition, this._currentCursorPosition );
							const amount = Math.max( distance / this._tbRadius, angle ) * this.rotateSpeed; //effective rotation angle

							this.applyTransformMatrix( this.rotate( this.calculateRotationAxis( this._startCursorPosition, this._currentCursorPosition ), amount ) );

							if ( this.enableAnimations ) {

								this._timePrev = this._timeCurrent;
								this._timeCurrent = performance.now();
								this._anglePrev = this._angleCurrent;
								this._angleCurrent = amount;
								vec3Copy( this._cursorPosCurr, this._cursorPosPrev );
								vec3Copy( this._currentCursorPosition, this._cursorPosCurr );
								this._wPrev = this._wCurr;
								this._wCurr = this.calculateAngularSpeed( this._anglePrev, this._angleCurrent, this._timePrev, this._timeCurrent );

							}

						}

					}

					break;

				case STATE.SCALE:

					if ( this.enableZoom ) {

						if ( restart ) {

							//switch to zoom operation

							this.dispatchEvent( _endEvent );
							this.dispatchEvent( _startEvent );

							this.updateTbState( opState, true );
							vec3SetY( this._startCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );
							vec3Copy( this._startCursorPosition, this._currentCursorPosition );

							if ( this.enableGrid ) {

								this.disposeGrid();

							}

							this.activateGizmos( false );

						} else {

							//continue with zoom operation
							const screenNotches = 8;	//how many wheel notches corresponds to a full screen pan
							vec3SetY( this._currentCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );

							const movement = this._currentCursorPosition.y - this._startCursorPosition.y;

							let size = 1;

							if ( movement < 0 ) {

								size = 1 / ( Math.pow( this.scaleFactor, - movement * screenNotches ) );

							} else if ( movement > 0 ) {

								size = Math.pow( this.scaleFactor, movement * screenNotches );

							}

							vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_1 );

							this.applyTransformMatrix( this.scale( size, this._v3_1 ) );

						}

					}

					break;

				case STATE.FOV:

					if ( this.enableZoom && this.object.isPerspectiveCamera ) {

						if ( restart ) {

							//switch to fov operation

							this.dispatchEvent( _endEvent );
							this.dispatchEvent( _startEvent );

							this.updateTbState( opState, true );
							vec3SetY( this._startCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );
							vec3Copy( this._startCursorPosition, this._currentCursorPosition );

							if ( this.enableGrid ) {

								this.disposeGrid();

							}

							this.activateGizmos( false );

						} else {

							//continue with fov operation
							const screenNotches = 8;	//how many wheel notches corresponds to a full screen pan
							vec3SetY( this._currentCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );

							const movement = this._currentCursorPosition.y - this._startCursorPosition.y;

							let size = 1;

							if ( movement < 0 ) {

								size = 1 / ( Math.pow( this.scaleFactor, - movement * screenNotches ) );

							} else if ( movement > 0 ) {

								size = Math.pow( this.scaleFactor, movement * screenNotches );

							}

							vec3SetFromMatrixPosition( this._cameraMatrixState, this._v3_1 );
							const x = vec3DistanceTo( this._v3_1, this._gizmos.position );
							let xNew = x / size; //distance between camera and gizmos if scale(size, scalepoint) would be performed

							//check min and max distance
							xNew = MathUtils.clamp( xNew, this.minDistance, this.maxDistance );

							const y = x * Math.tan( MathUtils.DEG2RAD * this._fovState * 0.5 );

							//calculate new fov
							let newFov = MathUtils.RAD2DEG * ( Math.atan( y / xNew ) * 2 );

							//check min and max fov
							newFov = MathUtils.clamp( newFov, this.minFov, this.maxFov );

							const newDistance = y / Math.tan( MathUtils.DEG2RAD * ( newFov / 2 ) );
							size = x / newDistance;
							vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_2 );

							this.setFov( newFov );
							this.applyTransformMatrix( this.scale( size, this._v3_2, false ) );

							//adjusting distance
							vec3MultiplyScalar( vec3Normalize( vec3Sub( this._gizmos.position, this.object.position, _offset ), _offset ), newDistance / x, _offset );
							mat4MakeTranslation( _offset.x, _offset.y, _offset.z, this._m4_1 );

						}

					}

					break;

			}

			this.dispatchEvent( _changeEvent );

		}

	}

	onSinglePanEnd() {

		if ( this._state == STATE.ROTATE ) {


			if ( ! this.enableRotate ) {

				return;

			}

			if ( this.enableAnimations ) {

				//perform rotation animation
				const deltaTime = ( performance.now() - this._timeCurrent );
				if ( deltaTime < 120 ) {

					const w = Math.abs( ( this._wPrev + this._wCurr ) / 2 );

					const self = this;
					this._animationId = window.requestAnimationFrame( function ( t ) {

						self.updateTbState( STATE.ANIMATION_ROTATE, true );
						const rotationAxis = self.calculateRotationAxis( self._cursorPosPrev, self._cursorPosCurr );

						self.onRotationAnim( t, rotationAxis, Math.min( w, self.wMax ) );

					} );

				} else {

					//cursor has been standing still for over 120 ms since last movement
					this.updateTbState( STATE.IDLE, false );
					this.activateGizmos( false );
					this.dispatchEvent( _changeEvent );

				}

			} else {

				this.updateTbState( STATE.IDLE, false );
				this.activateGizmos( false );
				this.dispatchEvent( _changeEvent );

			}

		} else if ( this._state == STATE.PAN || this._state == STATE.IDLE ) {

			this.updateTbState( STATE.IDLE, false );

			if ( this.enableGrid ) {

				this.disposeGrid();

			}

			this.activateGizmos( false );
			this.dispatchEvent( _changeEvent );


		}

		this.dispatchEvent( _endEvent );

	}

	onDoubleTap( event ) {

		if ( this.enabled && this.enablePan && this.enableFocus && this.scene != null ) {

			this.dispatchEvent( _startEvent );

			this.setCenter( event.clientX, event.clientY );
			const hitP = this.unprojectOnObj( this.getCursorNDC( _center.x, _center.y, this.domElement ), this.object );

			if ( hitP != null && this.enableAnimations ) {

				const self = this;
				if ( this._animationId != - 1 ) {

					window.cancelAnimationFrame( this._animationId );

				}

				this._timeStart = - 1;
				this._animationId = window.requestAnimationFrame( function ( t ) {

					self.updateTbState( STATE.ANIMATION_FOCUS, true );
					self.onFocusAnim( t, hitP, self._cameraMatrixState, self._gizmoMatrixState );

				} );

			} else if ( hitP != null && ! this.enableAnimations ) {

				this.updateTbState( STATE.FOCUS, true );
				this.focus( hitP, this.scaleFactor );
				this.updateTbState( STATE.IDLE, false );
				this.dispatchEvent( _changeEvent );

			}

		}

		this.dispatchEvent( _endEvent );

	}

	onDoublePanStart() {

		if ( this.enabled && this.enablePan ) {

			this.dispatchEvent( _startEvent );

			this.updateTbState( STATE.PAN, true );

			this.setCenter( ( this._touchCurrent[ 0 ].clientX + this._touchCurrent[ 1 ].clientX ) / 2, ( this._touchCurrent[ 0 ].clientY + this._touchCurrent[ 1 ].clientY ) / 2 );
			vec3Copy( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement, true ), this._startCursorPosition );
			vec3Copy( this._startCursorPosition, this._currentCursorPosition );

			this.activateGizmos( false );

		}

	}

	onDoublePanMove() {

		if ( this.enabled && this.enablePan ) {

			this.setCenter( ( this._touchCurrent[ 0 ].clientX + this._touchCurrent[ 1 ].clientX ) / 2, ( this._touchCurrent[ 0 ].clientY + this._touchCurrent[ 1 ].clientY ) / 2 );

			if ( this._state != STATE.PAN ) {

				this.updateTbState( STATE.PAN, true );
				vec3Copy( this._currentCursorPosition, this._startCursorPosition );

			}

			vec3Copy( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement, true ), this._currentCursorPosition );
			this.applyTransformMatrix( this.pan( this._startCursorPosition, this._currentCursorPosition, true ) );
			this.dispatchEvent( _changeEvent );

		}

	}

	onDoublePanEnd() {

		this.updateTbState( STATE.IDLE, false );
		this.dispatchEvent( _endEvent );

	}

	onRotateStart() {

		if ( this.enabled && this.enableRotate ) {

			this.dispatchEvent( _startEvent );

			this.updateTbState( STATE.ZROTATE, true );

			//this._startFingerRotation = event.rotation;

			this._startFingerRotation = this.getAngle( this._touchCurrent[ 1 ], this._touchCurrent[ 0 ] ) + this.getAngle( this._touchStart[ 1 ], this._touchStart[ 0 ] );
			this._currentFingerRotation = this._startFingerRotation;

			this.object.getWorldDirection( this._rotationAxis ); //rotation axis

			if ( ! this.enablePan && ! this.enableZoom ) {

				this.activateGizmos( true );

			}

		}

	}

	onRotateMove() {

		if ( this.enabled && this.enableRotate ) {

			this.setCenter( ( this._touchCurrent[ 0 ].clientX + this._touchCurrent[ 1 ].clientX ) / 2, ( this._touchCurrent[ 0 ].clientY + this._touchCurrent[ 1 ].clientY ) / 2 );
			let rotationPoint;

			if ( this._state != STATE.ZROTATE ) {

				this.updateTbState( STATE.ZROTATE, true );
				this._startFingerRotation = this._currentFingerRotation;

			}

			//this._currentFingerRotation = event.rotation;
			this._currentFingerRotation = this.getAngle( this._touchCurrent[ 1 ], this._touchCurrent[ 0 ] ) + this.getAngle( this._touchStart[ 1 ], this._touchStart[ 0 ] );

			if ( ! this.enablePan ) {

				rotationPoint = vec3SetFromMatrixPosition( this._gizmoMatrixState, vec3Create() );

			} else {

				vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_2 );
				rotationPoint = vec3Add( vec3MultiplyScalar( vec3ApplyQuaternion( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement ), this.object.quaternion ), 1 / this.object.zoom ), this._v3_2 );

			}

			const amount = MathUtils.DEG2RAD * ( this._startFingerRotation - this._currentFingerRotation );

			this.applyTransformMatrix( this.zRotate( rotationPoint, amount ) );
			this.dispatchEvent( _changeEvent );

		}

	}

	onRotateEnd() {

		this.updateTbState( STATE.IDLE, false );
		this.activateGizmos( false );
		this.dispatchEvent( _endEvent );

	}

	onPinchStart() {

		if ( this.enabled && this.enableZoom ) {

			this.dispatchEvent( _startEvent );
			this.updateTbState( STATE.SCALE, true );

			this._startFingerDistance = this.calculatePointersDistance( this._touchCurrent[ 0 ], this._touchCurrent[ 1 ] );
			this._currentFingerDistance = this._startFingerDistance;

			this.activateGizmos( false );

		}

	}

	onPinchMove() {

		if ( this.enabled && this.enableZoom ) {

			this.setCenter( ( this._touchCurrent[ 0 ].clientX + this._touchCurrent[ 1 ].clientX ) / 2, ( this._touchCurrent[ 0 ].clientY + this._touchCurrent[ 1 ].clientY ) / 2 );
			const minDistance = 12; //minimum distance between fingers (in css pixels)

			if ( this._state != STATE.SCALE ) {

				this._startFingerDistance = this._currentFingerDistance;
				this.updateTbState( STATE.SCALE, true );

			}

			this._currentFingerDistance = Math.max( this.calculatePointersDistance( this._touchCurrent[ 0 ], this._touchCurrent[ 1 ] ), minDistance * this._devPxRatio );
			const amount = this._currentFingerDistance / this._startFingerDistance;

			let scalePoint;

			if ( ! this.enablePan ) {

				scalePoint = this._gizmos.position;

			} else {

				if ( this.object.isOrthographicCamera ) {

					scalePoint = vec3Add( vec3MultiplyScalar( vec3ApplyQuaternion( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement ), this.object.quaternion ), 1 / this.object.zoom ), this._gizmos.position );

				} else if ( this.object.isPerspectiveCamera ) {

					scalePoint = vec3Add( vec3ApplyQuaternion( this.unprojectOnTbPlane( this.object, _center.x, _center.y, this.domElement ), this.object.quaternion ), this._gizmos.position );

				}

			}

			this.applyTransformMatrix( this.scale( amount, scalePoint ) );
			this.dispatchEvent( _changeEvent );

		}

	}

	onPinchEnd() {

		this.updateTbState( STATE.IDLE, false );
		this.dispatchEvent( _endEvent );

	}

	onTriplePanStart() {

		if ( this.enabled && this.enableZoom ) {

			this.dispatchEvent( _startEvent );

			this.updateTbState( STATE.SCALE, true );

			//const center = event.center;
			let clientX = 0;
			let clientY = 0;
			const nFingers = this._touchCurrent.length;

			for ( let i = 0; i < nFingers; i ++ ) {

				clientX += this._touchCurrent[ i ].clientX;
				clientY += this._touchCurrent[ i ].clientY;

			}

			this.setCenter( clientX / nFingers, clientY / nFingers );

			vec3SetY( this._startCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );
			vec3Copy( this._startCursorPosition, this._currentCursorPosition );

		}

	}

	onTriplePanMove() {

		if ( this.enabled && this.enableZoom ) {

			//	  fov / 2
			//		|\
			//		| \
			//		|  \
			//	x	|	\
			//		| 	 \
			//		| 	  \
			//		| _ _ _\
			//			y

			//const center = event.center;
			let clientX = 0;
			let clientY = 0;
			const nFingers = this._touchCurrent.length;

			for ( let i = 0; i < nFingers; i ++ ) {

				clientX += this._touchCurrent[ i ].clientX;
				clientY += this._touchCurrent[ i ].clientY;

			}

			this.setCenter( clientX / nFingers, clientY / nFingers );

			const screenNotches = 8;	//how many wheel notches corresponds to a full screen pan
			vec3SetY( this._currentCursorPosition, this.getCursorNDC( _center.x, _center.y, this.domElement ).y * 0.5 );

			const movement = this._currentCursorPosition.y - this._startCursorPosition.y;

			let size = 1;

			if ( movement < 0 ) {

				size = 1 / ( Math.pow( this.scaleFactor, - movement * screenNotches ) );

			} else if ( movement > 0 ) {

				size = Math.pow( this.scaleFactor, movement * screenNotches );

			}

			vec3SetFromMatrixPosition( this._cameraMatrixState, this._v3_1 );
			const x = vec3DistanceTo( this._v3_1, this._gizmos.position );
			let xNew = x / size; //distance between camera and gizmos if scale(size, scalepoint) would be performed

			//check min and max distance
			xNew = MathUtils.clamp( xNew, this.minDistance, this.maxDistance );

			const y = x * Math.tan( MathUtils.DEG2RAD * this._fovState * 0.5 );

			//calculate new fov
			let newFov = MathUtils.RAD2DEG * ( Math.atan( y / xNew ) * 2 );

			//check min and max fov
			newFov = MathUtils.clamp( newFov, this.minFov, this.maxFov );

			const newDistance = y / Math.tan( MathUtils.DEG2RAD * ( newFov / 2 ) );
			size = x / newDistance;
			vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_2 );

			this.setFov( newFov );
			this.applyTransformMatrix( this.scale( size, this._v3_2, false ) );

			//adjusting distance
			vec3MultiplyScalar( vec3Normalize( vec3Sub( this._gizmos.position, this.object.position, _offset ), _offset ), newDistance / x, _offset );
			mat4MakeTranslation( _offset.x, _offset.y, _offset.z, this._m4_1 );

			this.dispatchEvent( _changeEvent );

		}

	}

	onTriplePanEnd() {

		this.updateTbState( STATE.IDLE, false );
		this.dispatchEvent( _endEvent );
		//this.dispatchEvent( _changeEvent );

	}

	/**
	 * Set _center's x/y coordinates.
	 *
	 * @private
	 * @param {number} clientX - The x coordinate.
	 * @param {number} clientY - The y coordinate.
	 */
	setCenter( clientX, clientY ) {

		_center.x = clientX;
		_center.y = clientY;

	}

	/**
	 * Set default mouse actions.
	 *
	 * @private
	 */
	initializeMouseActions() {

		this.setMouseAction( 'PAN', 0, 'CTRL' );
		this.setMouseAction( 'PAN', 2 );

		this.setMouseAction( 'ROTATE', 0 );

		this.setMouseAction( 'ZOOM', 'WHEEL' );
		this.setMouseAction( 'ZOOM', 1 );

		this.setMouseAction( 'FOV', 'WHEEL', 'SHIFT' );
		this.setMouseAction( 'FOV', 1, 'SHIFT' );


	}

	/**
	 * Compare two mouse actions.
	 *
	 * @private
	 * @param {Object} action1 - The first mouse action.
	 * @param {Object} action2 - The second mouse action.
	 * @returns {boolean} `true` if action1 and action 2 are the same mouse action, `false` otherwise.
	 */
	compareMouseAction( action1, action2 ) {

		if ( action1.operation == action2.operation ) {

			if ( action1.mouse == action2.mouse && action1.key == action2.key ) {

				return true;

			} else {

				return false;

			}

		} else {

			return false;

		}

	}

	/**
	 * Set a new mouse action by specifying the operation to be performed and a mouse/key combination. In case of conflict, replaces the existing one.
	 *
	 * @param {'PAN'|'ROTATE'|'ZOOM'|'FOV'} operation - The operation to be performed ('PAN', 'ROTATE', 'ZOOM', 'FOV').
	 * @param {0|1|2|'WHEEL'} mouse - A mouse button (0, 1, 2) or 'WHEEL' for wheel notches.
	 * @param {?('CTRL'|'SHIFT')} [key=null] - The keyboard modifier ('CTRL', 'SHIFT') or null if key is not needed.
	 * @returns {boolean} `true` if the mouse action has been successfully added, `false` otherwise.
	 */
	setMouseAction( operation, mouse, key = null ) {

		const operationInput = [ 'PAN', 'ROTATE', 'ZOOM', 'FOV' ];
		const mouseInput = [ 0, 1, 2, 'WHEEL' ];
		const keyInput = [ 'CTRL', 'SHIFT', null ];
		let state;

		if ( ! operationInput.includes( operation ) || ! mouseInput.includes( mouse ) || ! keyInput.includes( key ) ) {

			//invalid parameters
			return false;

		}

		if ( mouse == 'WHEEL' ) {

			if ( operation != 'ZOOM' && operation != 'FOV' ) {

				//cannot associate 2D operation to 1D input
				return false;

			}

		}

		switch ( operation ) {

			case 'PAN':

				state = STATE.PAN;
				break;

			case 'ROTATE':

				state = STATE.ROTATE;
				break;

			case 'ZOOM':

				state = STATE.SCALE;
				break;

			case 'FOV':

				state = STATE.FOV;
				break;

		}

		const action = {

			operation: operation,
			mouse: mouse,
			key: key,
			state: state

		};

		for ( let i = 0; i < this.mouseActions.length; i ++ ) {

			if ( this.mouseActions[ i ].mouse == action.mouse && this.mouseActions[ i ].key == action.key ) {

				this.mouseActions.splice( i, 1, action );
				return true;

			}

		}

		this.mouseActions.push( action );
		return true;

	}

	/**
	 * Remove a mouse action by specifying its mouse/key combination.
	 *
	 * @param {0|1|2|'WHEEL'} mouse - A mouse button (0, 1, 2) or 'WHEEL' for wheel notches.
	 * @param {?('CTRL'|'SHIFT')} key - The keyboard modifier ('CTRL', 'SHIFT') or null if key is not needed.
	 * @returns {boolean} `true` if the operation has been successfully removed, `false` otherwise.
	 */
	unsetMouseAction( mouse, key = null ) {

		for ( let i = 0; i < this.mouseActions.length; i ++ ) {

			if ( this.mouseActions[ i ].mouse == mouse && this.mouseActions[ i ].key == key ) {

				this.mouseActions.splice( i, 1 );
				return true;

			}

		}

		return false;

	}

	/**
	 * Return the operation associated to a mouse/keyboard combination.
	 *
	 * @private
	 * @param {0|1|2|'WHEEL'} mouse - Mouse button index (0, 1, 2) or 'WHEEL' for wheel notches.
	 * @param {?('CTRL'|'SHIFT')} key - Keyboard modifier.
	 * @returns {?('PAN'|'ROTATE'|'ZOOM'|'FOV')} The operation if it has been found, `null` otherwise.
	 */
	getOpFromAction( mouse, key ) {

		let action;

		for ( let i = 0; i < this.mouseActions.length; i ++ ) {

			action = this.mouseActions[ i ];
			if ( action.mouse == mouse && action.key == key ) {

				return action.operation;

			}

		}

		if ( key != null ) {

			for ( let i = 0; i < this.mouseActions.length; i ++ ) {

				action = this.mouseActions[ i ];
				if ( action.mouse == mouse && action.key == null ) {

					return action.operation;

				}

			}

		}

		return null;

	}

	/**
	 * Get the operation associated to mouse and key combination and returns the corresponding FSA state.
	 *
	 * @private
	 * @param {0|1|2} mouse - Mouse button index (0, 1, 2)
	 * @param {?('CTRL'|'SHIFT')} key - Keyboard modifier
	 * @returns {?STATE} The FSA state obtained from the operation associated to mouse/keyboard combination.
	 */
	getOpStateFromAction( mouse, key ) {

		let action;

		for ( let i = 0; i < this.mouseActions.length; i ++ ) {

			action = this.mouseActions[ i ];
			if ( action.mouse == mouse && action.key == key ) {

				return action.state;

			}

		}

		if ( key != null ) {

			for ( let i = 0; i < this.mouseActions.length; i ++ ) {

				action = this.mouseActions[ i ];
				if ( action.mouse == mouse && action.key == null ) {

					return action.state;

				}

			}

		}

		return null;

	}

	/**
	 * Calculate the angle between two pointers.
	 *
	 * @private
	 * @param {PointerEvent} p1 - The first pointer event.
	 * @param {PointerEvent} p2 - The second pointer event.
	 * @returns {number} The angle between two pointers in degrees.
	 */
	getAngle( p1, p2 ) {

		return Math.atan2( p2.clientY - p1.clientY, p2.clientX - p1.clientX ) * 180 / Math.PI;

	}

	/**
	 * Updates a PointerEvent inside current pointerevents array.
	 *
	 * @private
	 * @param {PointerEvent} event - The pointer event.
	 */
	updateTouchEvent( event ) {

		for ( let i = 0; i < this._touchCurrent.length; i ++ ) {

			if ( this._touchCurrent[ i ].pointerId == event.pointerId ) {

				this._touchCurrent.splice( i, 1, event );
				break;

			}

		}

	}

	/**
	 * Applies a transformation matrix, to the camera and gizmos.
	 *
	 * @private
	 * @param {Object} transformation - Object containing matrices to apply to camera and gizmos.
	 */
	applyTransformMatrix( transformation ) {

		if ( transformation.camera != null ) {

			mat4Multiply( transformation.camera, this._cameraMatrixState, this._m4_1 );
			mat4Decompose( this._m4_1, this.object.position, this.object.quaternion, this.object.scale );
			this.object.quaternion._onChangeCallback();
			this.object.updateMatrix();

			//update camera up vector
			if ( this._state == STATE.ROTATE || this._state == STATE.ZROTATE || this._state == STATE.ANIMATION_ROTATE ) {

				vec3ApplyQuaternion( this._upState, this.object.quaternion, this.object.up );

			}

		}

		if ( transformation.gizmos != null ) {

			mat4Multiply( transformation.gizmos, this._gizmoMatrixState, this._m4_1 );
			mat4Decompose( this._m4_1, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
			this._gizmos.quaternion._onChangeCallback();
			this._gizmos.updateMatrix();

		}

		if ( this._state == STATE.SCALE || this._state == STATE.FOCUS || this._state == STATE.ANIMATION_FOCUS ) {

			this._tbRadius = this.calculateTbRadius( this.object );

			if ( this.adjustNearFar ) {

				const cameraDistance = vec3DistanceTo( this.object.position, this._gizmos.position );

				const bb = box3SetFromObject( this._gizmos, false, box3Create() );
				const sphere = box3GetBoundingSphere( bb, sphereCreate() );

				const adjustedNearPosition = Math.max( this._nearPos0, sphere.radius + vec3Length( sphere.center ) );
				const regularNearPosition = cameraDistance - this._initialNear;

				const minNearPos = Math.min( adjustedNearPosition, regularNearPosition );
				this.object.near = cameraDistance - minNearPos;


				const adjustedFarPosition = Math.min( this._farPos0, - sphere.radius + vec3Length( sphere.center ) );
				const regularFarPosition = cameraDistance - this._initialFar;

				const minFarPos = Math.min( adjustedFarPosition, regularFarPosition );
				this.object.far = cameraDistance - minFarPos;

				this.object.updateProjectionMatrix();

			} else {

				let update = false;

				if ( this.object.near != this._initialNear ) {

					this.object.near = this._initialNear;
					update = true;

				}

				if ( this.object.far != this._initialFar ) {

					this.object.far = this._initialFar;
					update = true;

				}

				if ( update ) {

					this.object.updateProjectionMatrix();

				}

			}

		}

	}

	/**
	 * Calculates the angular speed.
	 *
	 * @private
	 * @param {number} p0 - Position at t0.
	 * @param {number} p1 - Position at t1.
	 * @param {number} t0 - Initial time in milliseconds.
	 * @param {number} t1 - Ending time in milliseconds.
	 * @returns {number} The angular speed.
	 */
	calculateAngularSpeed( p0, p1, t0, t1 ) {

		const s = p1 - p0;
		const t = ( t1 - t0 ) / 1000;
		if ( t == 0 ) {

			return 0;

		}

		return s / t;

	}

	/**
	 * Calculates the distance between two pointers.
	 *
	 * @private
	 * @param {PointerEvent} p0 - The first pointer.
	 * @param {PointerEvent} p1 - The second pointer.
	 * @returns {number} The distance between the two pointers.
	 */
	calculatePointersDistance( p0, p1 ) {

		return Math.sqrt( Math.pow( p1.clientX - p0.clientX, 2 ) + Math.pow( p1.clientY - p0.clientY, 2 ) );

	}

	/**
	 * Calculates the rotation axis as the vector perpendicular between two vectors.
	 *
	 * @private
	 * @param {Vector3} vec1 - The first vector.
	 * @param {Vector3} vec2 - The second vector.
	 * @returns {Vector3} The normalized rotation axis.
	 */
	calculateRotationAxis( vec1, vec2 ) {

		mat4ExtractRotation( this._cameraMatrixState, this._rotationMatrix );
		quatSetFromRotationMatrix( this._rotationMatrix, this._quat );

		vec3ApplyQuaternion( vec3CrossVectors( vec1, vec2, this._rotationAxis ), this._quat, this._rotationAxis );
		return vec3Copy( vec3Normalize( this._rotationAxis, this._rotationAxis ), vec3Create() );

	}

	/**
	 * Calculates the trackball radius so that gizmo's diameter will be 2/3 of the minimum side of the camera frustum.
	 *
	 * @private
	 * @param {Camera} camera - The camera.
	 * @returns {number} The trackball radius.
	 */
	calculateTbRadius( camera ) {

		const distance = vec3DistanceTo( camera.position, this._gizmos.position );

		if ( camera.type == 'PerspectiveCamera' ) {

			const halfFovV = MathUtils.DEG2RAD * camera.fov * 0.5; //vertical fov/2 in radians
			const halfFovH = Math.atan( ( camera.aspect ) * Math.tan( halfFovV ) ); //horizontal fov/2 in radians
			return Math.tan( Math.min( halfFovV, halfFovH ) ) * distance * this.radiusFactor;

		} else if ( camera.type == 'OrthographicCamera' ) {

			return Math.min( camera.top, camera.right ) * this.radiusFactor;

		}

	}

	/**
	 * Focus operation consist of positioning the point of interest in front of the camera and a slightly zoom in.
	 *
	 * @private
	 * @param {Vector3} point - The point of interest.
	 * @param {number} size - Scale factor.
	 * @param {number} [amount=1] - Amount of operation to be completed (used for focus animations, default is complete full operation).
	 */
	focus( point, size, amount = 1 ) {

		//move center of camera (along with gizmos) towards point of interest
		vec3MultiplyScalar( vec3Sub( point, this._gizmos.position, _offset ), amount, _offset );
		mat4MakeTranslation( _offset.x, _offset.y, _offset.z, this._translationMatrix );

		mat4Copy( this._gizmoMatrixState, _gizmoMatrixStateTemp );
		mat4Multiply( this._translationMatrix, this._gizmoMatrixState, this._gizmoMatrixState );
		mat4Decompose( this._gizmoMatrixState, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
		this._gizmos.quaternion._onChangeCallback();

		mat4Copy( this._cameraMatrixState, _cameraMatrixStateTemp );
		mat4Multiply( this._translationMatrix, this._cameraMatrixState, this._cameraMatrixState );
		mat4Decompose( this._cameraMatrixState, this.object.position, this.object.quaternion, this.object.scale );
		this.object.quaternion._onChangeCallback();

		//apply zoom
		if ( this.enableZoom ) {

			this.applyTransformMatrix( this.scale( size, this._gizmos.position ) );

		}

		mat4Copy( _gizmoMatrixStateTemp, this._gizmoMatrixState );
		mat4Copy( _cameraMatrixStateTemp, this._cameraMatrixState );

	}

	/**
	 * Creates a grid if necessary and adds it to the scene.
	 *
	 * @private
	 */
	drawGrid() {

		if ( this.scene != null ) {

			const color = 0x888888;
			const multiplier = 3;
			let size, divisions, maxLength, tick;

			if ( this.object.isOrthographicCamera ) {

				const width = this.object.right - this.object.left;
				const height = this.object.bottom - this.object.top;

				maxLength = Math.max( width, height );
				tick = maxLength / 20;

				size = maxLength / this.object.zoom * multiplier;
				divisions = size / tick * this.object.zoom;

			} else if ( this.object.isPerspectiveCamera ) {

				const distance = vec3DistanceTo( this.object.position, this._gizmos.position );
				const halfFovV = MathUtils.DEG2RAD * this.object.fov * 0.5;
				const halfFovH = Math.atan( ( this.object.aspect ) * Math.tan( halfFovV ) );

				maxLength = Math.tan( Math.max( halfFovV, halfFovH ) ) * distance * 2;
				tick = maxLength / 20;

				size = maxLength * multiplier;
				divisions = size / tick;

			}

			if ( this._grid == null ) {

				this._grid = new GridHelper( size, divisions, color, color );
				vec3Copy( this._gizmos.position, this._grid.position );
				vec3Copy( this._grid.position, this._gridPosition );
				quatCopy( this.object.quaternion, this._grid.quaternion );
				this._grid.quaternion._onChangeCallback();
				this._grid.rotateX( Math.PI * 0.5 );

				this.scene.add( this._grid );

			}

		}

	}

	dispose() {

		if ( this._animationId != - 1 ) {

			window.cancelAnimationFrame( this._animationId );

		}

		this.disconnect();

		if ( this.scene !== null ) this.scene.remove( this._gizmos );
		this.disposeGrid();

	}

	/**
	 * Removes the grid from the scene.
	 */
	disposeGrid() {

		if ( this._grid != null && this.scene != null ) {

			this.scene.remove( this._grid );
			this._grid = null;

		}

	}

	/**
	 * Computes the easing out cubic function for ease out effect in animation.
	 *
	 * @private
	 * @param {number} t - The absolute progress of the animation in the bound of `0` (beginning of the) and `1` (ending of animation).
	 * @returns {number} Result of easing out cubic at time `t`.
	 */
	easeOutCubic( t ) {

		return 1 - Math.pow( 1 - t, 3 );

	}

	/**
	 * Makes rotation gizmos more or less visible.
	 *
	 * @param {boolean} isActive - If set to `true`, gizmos are more visible.
	 */
	activateGizmos( isActive ) {

		const gizmoX = this._gizmos.children[ 0 ];
		const gizmoY = this._gizmos.children[ 1 ];
		const gizmoZ = this._gizmos.children[ 2 ];

		if ( isActive ) {

			gizmoX.material.setValues( { opacity: 1 } );
			gizmoY.material.setValues( { opacity: 1 } );
			gizmoZ.material.setValues( { opacity: 1 } );

		} else {

			gizmoX.material.setValues( { opacity: 0.6 } );
			gizmoY.material.setValues( { opacity: 0.6 } );
			gizmoZ.material.setValues( { opacity: 0.6 } );

		}

	}

	/**
	 * Calculates the cursor position in NDC.
	 *
	 * @private
	 * @param {number} cursorX - Cursor horizontal coordinate within the canvas.
	 * @param {number} cursorY - Cursor vertical coordinate within the canvas.
	 * @param {HTMLElement} canvas - The canvas where the renderer draws its output.
	 * @returns {Vector2} Cursor normalized position inside the canvas.
	 */
	getCursorNDC( cursorX, cursorY, canvas ) {

		const canvasRect = canvas.getBoundingClientRect();
		vec2SetX( this._v2_1, ( ( cursorX - canvasRect.left ) / canvasRect.width ) * 2 - 1, this._v2_1 );
		vec2SetY( this._v2_1, ( ( canvasRect.bottom - cursorY ) / canvasRect.height ) * 2 - 1, this._v2_1 );
		return vec2Copy( this._v2_1, vec2Create() );

	}

	/**
	 * Calculates the cursor position inside the canvas x/y coordinates with the origin being in the center of the canvas.
	 *
	 * @private
	 * @param {number} cursorX - Cursor horizontal coordinate within the canvas.
	 * @param {number} cursorY - Cursor vertical coordinate within the canvas.
	 * @param {HTMLElement} canvas - The canvas where the renderer draws its output.
	 * @returns {Vector2} Cursor position inside the canvas.
	 */
	getCursorPosition( cursorX, cursorY, canvas ) {

		vec2Copy( this.getCursorNDC( cursorX, cursorY, canvas ), this._v2_1 );
		this._v2_1.x *= ( this.object.right - this.object.left ) * 0.5;
		this._v2_1.y *= ( this.object.top - this.object.bottom ) * 0.5;
		return vec2Copy( this._v2_1, vec2Create() );

	}

	/**
	 * Sets the camera to be controlled.  Must be called in order to set a new camera to be controlled.
	 *
	 * @param {Camera} camera - The camera to be controlled.
	 */
	setCamera( camera ) {

		camera.lookAt( this.target );
		camera.updateMatrix();

		//setting state
		if ( camera.type == 'PerspectiveCamera' ) {

			this._fov0 = camera.fov;
			this._fovState = camera.fov;

		}

		mat4Copy( camera.matrix, this._cameraMatrixState0 );
		mat4Copy( this._cameraMatrixState0, this._cameraMatrixState );
		mat4Copy( camera.projectionMatrix, this._cameraProjectionState );
		this._zoom0 = camera.zoom;
		this._zoomState = this._zoom0;

		this._initialNear = camera.near;
		this._nearPos0 = vec3DistanceTo( camera.position, this.target ) - camera.near;
		this._nearPos = this._initialNear;

		this._initialFar = camera.far;
		this._farPos0 = vec3DistanceTo( camera.position, this.target ) - camera.far;
		this._farPos = this._initialFar;

		vec3Copy( camera.up, this._up0 );
		vec3Copy( camera.up, this._upState );

		this.object = camera;
		this.object.updateProjectionMatrix();

		//making gizmos
		this._tbRadius = this.calculateTbRadius( camera );
		this.makeGizmos( this.target, this._tbRadius );

	}

	/**
	 * Sets gizmos visibility.
	 *
	 * @param {boolean} value - Value of gizmos visibility.
	 */
	setGizmosVisible( value ) {

		this._gizmos.visible = value;
		this.dispatchEvent( _changeEvent );

	}

	/**
	 * Sets gizmos radius factor and redraws gizmos.
	 *
	 * @param {number} value - Value of radius factor.
	 */
	setTbRadius( value ) {

		this.radiusFactor = value;
		this._tbRadius = this.calculateTbRadius( this.object );

		const curve = new EllipseCurve( 0, 0, this._tbRadius, this._tbRadius );
		const points = curve.getPoints( this._curvePts );
		const curveGeometry = new BufferGeometry().setFromPoints( points );


		for ( const gizmo in this._gizmos.children ) {

			this._gizmos.children[ gizmo ].geometry = curveGeometry;

		}

		this.dispatchEvent( _changeEvent );

	}

	/**
	 * Creates the rotation gizmos matching trackball center and radius.
	 *
	 * @private
	 * @param {Vector3} tbCenter - The trackball center.
	 * @param {number} tbRadius - The trackball radius.
	 */
	makeGizmos( tbCenter, tbRadius ) {

		const curve = new EllipseCurve( 0, 0, tbRadius, tbRadius );
		const points = curve.getPoints( this._curvePts );

		//geometry
		const curveGeometry = new BufferGeometry().setFromPoints( points );

		//material
		const curveMaterialX = new LineBasicMaterial( { color: 0xff8080, fog: false, transparent: true, opacity: 0.6 } );
		const curveMaterialY = new LineBasicMaterial( { color: 0x80ff80, fog: false, transparent: true, opacity: 0.6 } );
		const curveMaterialZ = new LineBasicMaterial( { color: 0x8080ff, fog: false, transparent: true, opacity: 0.6 } );

		//line
		const gizmoX = new Line( curveGeometry, curveMaterialX );
		const gizmoY = new Line( curveGeometry, curveMaterialY );
		const gizmoZ = new Line( curveGeometry, curveMaterialZ );

		const rotation = Math.PI * 0.5;
		gizmoX.rotation.y = rotation;
		gizmoY.rotation.x = rotation;


		//setting state
		mat4SetPosition( mat4Identity( this._gizmoMatrixState0 ), tbCenter.x, tbCenter.y, tbCenter.z, this._gizmoMatrixState0 );
		mat4Copy( this._gizmoMatrixState0, this._gizmoMatrixState );

		if ( this.object.zoom !== 1 ) {

			//adapt gizmos size to camera zoom
			const size = 1 / this.object.zoom;
			mat4MakeScale( size, size, size, this._scaleMatrix );
			mat4MakeTranslation( - tbCenter.x, - tbCenter.y, - tbCenter.z, this._translationMatrix );

			mat4Multiply( this._translationMatrix, this._gizmoMatrixState, this._gizmoMatrixState );
			mat4Multiply( this._scaleMatrix, this._gizmoMatrixState, this._gizmoMatrixState );
			mat4MakeTranslation( tbCenter.x, tbCenter.y, tbCenter.z, this._translationMatrix );
			mat4Multiply( this._translationMatrix, this._gizmoMatrixState, this._gizmoMatrixState );

		}

		mat4Decompose( this._gizmoMatrixState, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
		this._gizmos.quaternion._onChangeCallback();

		//

		this._gizmos.traverse( function ( object ) {

			if ( object.isLine ) {

				object.geometry.dispose();
				object.material.dispose();

			}

		} );

		this._gizmos.clear();

		//

		this._gizmos.add( gizmoX );
		this._gizmos.add( gizmoY );
		this._gizmos.add( gizmoZ );

	}

	/**
	 * Performs animation for focus operation.
	 *
	 * @private
	 * @param {number} time - Instant in which this function is called as performance.now().
	 * @param {Vector3} point - Point of interest for focus operation.
	 * @param {Matrix4} cameraMatrix - Camera matrix.
	 * @param {Matrix4} gizmoMatrix - Gizmos matrix.
	 */
	onFocusAnim( time, point, cameraMatrix, gizmoMatrix ) {

		if ( this._timeStart == - 1 ) {

			//animation start
			this._timeStart = time;

		}

		if ( this._state == STATE.ANIMATION_FOCUS ) {

			const deltaTime = time - this._timeStart;
			const animTime = deltaTime / this.focusAnimationTime;

			mat4Copy( gizmoMatrix, this._gizmoMatrixState );

			if ( animTime >= 1 ) {

				//animation end

				mat4Decompose( this._gizmoMatrixState, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
				this._gizmos.quaternion._onChangeCallback();

				this.focus( point, this.scaleFactor );

				this._timeStart = - 1;
				this.updateTbState( STATE.IDLE, false );
				this.activateGizmos( false );

				this.dispatchEvent( _changeEvent );

			} else {

				const amount = this.easeOutCubic( animTime );
				const size = ( ( 1 - amount ) + ( this.scaleFactor * amount ) );

				mat4Decompose( this._gizmoMatrixState, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
				this._gizmos.quaternion._onChangeCallback();
				this.focus( point, size, amount );

				this.dispatchEvent( _changeEvent );
				const self = this;
				this._animationId = window.requestAnimationFrame( function ( t ) {

					self.onFocusAnim( t, point, cameraMatrix, mat4Copy( gizmoMatrix ) );

				} );

			}

		} else {

			//interrupt animation

			this._animationId = - 1;
			this._timeStart = - 1;

		}

	}

	/**
	 * Performs animation for rotation operation.
	 *
	 * @private
	 * @param {number} time - Instant in which this function is called as performance.now().
	 * @param {Vector3} rotationAxis - Rotation axis.
	 * @param {number} w0 - Initial angular velocity.
	 */
	onRotationAnim( time, rotationAxis, w0 ) {

		if ( this._timeStart == - 1 ) {

			//animation start
			this._anglePrev = 0;
			this._angleCurrent = 0;
			this._timeStart = time;

		}

		if ( this._state == STATE.ANIMATION_ROTATE ) {

			//w = w0 + alpha * t
			const deltaTime = ( time - this._timeStart ) / 1000;
			const w = w0 + ( ( - this.dampingFactor ) * deltaTime );

			if ( w > 0 ) {

				//tetha = 0.5 * alpha * t^2 + w0 * t + tetha0
				this._angleCurrent = 0.5 * ( - this.dampingFactor ) * Math.pow( deltaTime, 2 ) + w0 * deltaTime + 0;
				this.applyTransformMatrix( this.rotate( rotationAxis, this._angleCurrent ) );
				this.dispatchEvent( _changeEvent );
				const self = this;
				this._animationId = window.requestAnimationFrame( function ( t ) {

					self.onRotationAnim( t, rotationAxis, w0 );

				} );

			} else {

				this._animationId = - 1;
				this._timeStart = - 1;

				this.updateTbState( STATE.IDLE, false );
				this.activateGizmos( false );

				this.dispatchEvent( _changeEvent );

			}

		} else {

			//interrupt animation

			this._animationId = - 1;
			this._timeStart = - 1;

			if ( this._state != STATE.ROTATE ) {

				this.activateGizmos( false );
				this.dispatchEvent( _changeEvent );

			}

		}

	}


	/**
	 * Performs pan operation moving camera between two points.
	 *
	 * @private
	 * @param {Vector3} p0 - Initial point.
	 * @param {Vector3} p1 - Ending point.
	 * @param {boolean} [adjust=false] - If movement should be adjusted considering camera distance (Perspective only).
	 * @returns {Object}
	 */
	pan( p0, p1, adjust = false ) {

		const movement = vec3Sub( p0, p1 );

		if ( this.object.isOrthographicCamera ) {

			//adjust movement amount
			vec3MultiplyScalar( movement, 1 / this.object.zoom, movement );

		} else if ( this.object.isPerspectiveCamera && adjust ) {

			//adjust movement amount
			vec3SetFromMatrixPosition( this._cameraMatrixState0, this._v3_1 );	//camera's initial position
			vec3SetFromMatrixPosition( this._gizmoMatrixState0, this._v3_2 );	//gizmo's initial position
			const distanceFactor = vec3DistanceTo( this._v3_1, this._v3_2 ) / vec3DistanceTo( this.object.position, this._gizmos.position );
			vec3MultiplyScalar( movement, 1 / distanceFactor, movement );

		}

		vec3ApplyQuaternion( vec3Set( this._v3_1, movement.x, movement.y, 0 ), this.object.quaternion, this._v3_1 );

		mat4MakeTranslation( this._v3_1.x, this._v3_1.y, this._v3_1.z, this._m4_1 );

		this.setTransformationMatrices( this._m4_1, this._m4_1 );
		return _transformation;

	}

	/**
	 * Resets the controls.
	 */
	reset() {

		vec3Copy( this._target0, this.target );
		this.object.zoom = this._zoom0;

		if ( this.object.isPerspectiveCamera ) {

			this.object.fov = this._fov0;

		}

		this.object.near = this._nearPos;
		this.object.far = this._farPos;
		mat4Copy( this._cameraMatrixState0, this._cameraMatrixState );
		mat4Decompose( this._cameraMatrixState, this.object.position, this.object.quaternion, this.object.scale );
		this.object.quaternion._onChangeCallback();
		vec3Copy( this._up0, this.object.up );

		this.object.updateMatrix();
		this.object.updateProjectionMatrix();

		mat4Copy( this._gizmoMatrixState0, this._gizmoMatrixState );
		mat4Decompose( this._gizmoMatrixState0, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
		this._gizmos.quaternion._onChangeCallback();
		this._gizmos.updateMatrix();

		this._tbRadius = this.calculateTbRadius( this.object );
		this.makeGizmos( this._gizmos.position, this._tbRadius );

		this.object.lookAt( this._gizmos.position );

		this.updateTbState( STATE.IDLE, false );

		this.dispatchEvent( _changeEvent );

	}

	/**
	 * Rotates the camera around an axis passing by trackball's center.
	 *
	 * @private
	 * @param {Vector3} axis - Rotation axis.
	 * @param {number} angle - Angle in radians.
	 * @returns {Object} Object with 'camera' field containing transformation matrix resulting from the operation to be applied to the camera.
	 */
	rotate( axis, angle ) {

		const point = this._gizmos.position; //rotation center
		mat4MakeTranslation( - point.x, - point.y, - point.z, this._translationMatrix );
		mat4MakeRotationAxis( axis, - angle, this._rotationMatrix );

		//rotate camera
		mat4MakeTranslation( point.x, point.y, point.z, this._m4_1 );
		mat4Multiply( this._m4_1, this._rotationMatrix, this._m4_1 );
		mat4Multiply( this._m4_1, this._translationMatrix, this._m4_1 );

		this.setTransformationMatrices( this._m4_1 );

		return _transformation;

	}

	/**
	 * Copy the current state to clipboard (as a readable JSON text).
	 */
	copyState() {

		let state;
		if ( this.object.isOrthographicCamera ) {

			state = JSON.stringify( {
				arcballState: {
					cameraFar: this.object.far,
					cameraMatrix: this.object.matrix,
					cameraNear: this.object.near,
					cameraUp: this.object.up,
					cameraZoom: this.object.zoom,
					gizmoMatrix: this._gizmos.matrix,
					target: this.target

				}
			} );

		} else if ( this.object.isPerspectiveCamera ) {

			state = JSON.stringify( {
				arcballState: {
					cameraFar: this.object.far,
					cameraFov: this.object.fov,
					cameraMatrix: this.object.matrix,
					cameraNear: this.object.near,
					cameraUp: this.object.up,
					cameraZoom: this.object.zoom,
					gizmoMatrix: this._gizmos.matrix,
					target: this.target

				}
			} );

		}

		navigator.clipboard.writeText( state );

	}

	/**
	 * Set the controls state from the clipboard, assumes that the clipboard stores a JSON
	 * text as saved from `copyState()`.
	 */
	pasteState() {

		const self = this;
		navigator.clipboard.readText().then( function resolved( value ) {

			self.setStateFromJSON( value );

		} );

	}

	/**
	 * Saves the current state of the control. This can later be recover with `reset()`.
	 */
	saveState() {

		this.object.updateMatrix();
		this._gizmos.updateMatrix();

		vec3Copy( this.target, this._target0 );
		mat4Copy( this.object.matrix, this._cameraMatrixState0 );
		mat4Copy( this._gizmos.matrix, this._gizmoMatrixState0 );
		this._nearPos = this.object.near;
		this._farPos = this.object.far;
		this._zoom0 = this.object.zoom;
		vec3Copy( this.object.up, this._up0 );

		if ( this.object.isPerspectiveCamera ) {

			this._fov0 = this.object.fov;

		}

	}

	/**
	 * Performs uniform scale operation around a given point.
	 *
	 * @private
	 * @param {number} size - Scale factor.
	 * @param {Vector3} point - Point around which scale.
	 * @param {boolean} scaleGizmos - If gizmos should be scaled (Perspective only).
	 * @returns {Object} Object with 'camera' and 'gizmo' fields containing transformation matrices resulting from the operation to be applied to the camera and gizmos.
	 */
	scale( size, point, scaleGizmos = true ) {

		vec3Copy( point, _scalePointTemp );
		let sizeInverse = 1 / size;

		if ( this.object.isOrthographicCamera ) {

			//camera zoom
			this.object.zoom = this._zoomState;
			this.object.zoom *= size;

			//check min and max zoom
			if ( this.object.zoom > this.maxZoom ) {

				this.object.zoom = this.maxZoom;
				sizeInverse = this._zoomState / this.maxZoom;

			} else if ( this.object.zoom < this.minZoom ) {

				this.object.zoom = this.minZoom;
				sizeInverse = this._zoomState / this.minZoom;

			}

			this.object.updateProjectionMatrix();

			vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_1 );	//gizmos position

			//scale gizmos so they appear in the same spot having the same dimension
			mat4MakeScale( sizeInverse, sizeInverse, sizeInverse, this._scaleMatrix );
			mat4MakeTranslation( - this._v3_1.x, - this._v3_1.y, - this._v3_1.z, this._translationMatrix );

			mat4MakeTranslation( this._v3_1.x, this._v3_1.y, this._v3_1.z, this._m4_2 );
			mat4Multiply( this._m4_2, this._scaleMatrix, this._m4_2 );
			mat4Multiply( this._m4_2, this._translationMatrix, this._m4_2 );


			//move camera and gizmos to obtain pinch effect
			vec3Sub( _scalePointTemp, this._v3_1, _scalePointTemp );

			const amount = vec3MultiplyScalar( _scalePointTemp, sizeInverse );
			vec3Sub( _scalePointTemp, amount, _scalePointTemp );

			mat4MakeTranslation( _scalePointTemp.x, _scalePointTemp.y, _scalePointTemp.z, this._m4_1 );
			mat4Multiply( this._m4_1, this._m4_2, this._m4_2 );

			this.setTransformationMatrices( this._m4_1, this._m4_2 );
			return _transformation;

		} else if ( this.object.isPerspectiveCamera ) {

			vec3SetFromMatrixPosition( this._cameraMatrixState, this._v3_1 );
			vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_2 );

			//move camera
			let distance = vec3DistanceTo( this._v3_1, _scalePointTemp );
			let amount = distance - ( distance * sizeInverse );

			//check min and max distance
			const newDistance = distance - amount;
			if ( newDistance < this.minDistance ) {

				sizeInverse = this.minDistance / distance;
				amount = distance - ( distance * sizeInverse );

			} else if ( newDistance > this.maxDistance ) {

				sizeInverse = this.maxDistance / distance;
				amount = distance - ( distance * sizeInverse );

			}

			vec3MultiplyScalar( vec3Normalize( vec3Sub( _scalePointTemp, this._v3_1, _offset ), _offset ), amount, _offset );

			mat4MakeTranslation( _offset.x, _offset.y, _offset.z, this._m4_1 );


			if ( scaleGizmos ) {

				//scale gizmos so they appear in the same spot having the same dimension
				const pos = this._v3_2;

				distance = vec3DistanceTo( pos, _scalePointTemp );
				amount = distance - ( distance * sizeInverse );
				vec3MultiplyScalar( vec3Normalize( vec3Sub( _scalePointTemp, this._v3_2, _offset ), _offset ), amount, _offset );

				mat4MakeTranslation( pos.x, pos.y, pos.z, this._translationMatrix );
				mat4MakeScale( sizeInverse, sizeInverse, sizeInverse, this._scaleMatrix );

				mat4MakeTranslation( _offset.x, _offset.y, _offset.z, this._m4_2 );
				mat4Multiply( this._m4_2, this._translationMatrix, this._m4_2 );
				mat4Multiply( this._m4_2, this._scaleMatrix, this._m4_2 );

				mat4MakeTranslation( - pos.x, - pos.y, - pos.z, this._translationMatrix );

				mat4Multiply( this._m4_2, this._translationMatrix, this._m4_2 );
				this.setTransformationMatrices( this._m4_1, this._m4_2 );


			} else {

				this.setTransformationMatrices( this._m4_1 );

			}

			return _transformation;

		}

	}

	/**
	 * Sets camera fov.
	 *
	 * @private
	 * @param {number} value - The FOV to be set.
	 */
	setFov( value ) {

		if ( this.object.isPerspectiveCamera ) {

			this.object.fov = MathUtils.clamp( value, this.minFov, this.maxFov );
			this.object.updateProjectionMatrix();

		}

	}

	/**
	 * Sets values in transformation object.
	 *
	 * @private
	 * @param {?Matrix4} [camera=null] - Transformation to be applied to the camera.
	 * @param {?Matrix4} [gizmos=null] - Transformation to be applied to gizmos.
	 */
	setTransformationMatrices( camera = null, gizmos = null ) {

		if ( camera != null ) {

			if ( _transformation.camera != null ) {

				mat4Copy( camera, _transformation.camera );

			} else {

				_transformation.camera = mat4Copy( camera );

			}

		} else {

			_transformation.camera = null;

		}

		if ( gizmos != null ) {

			if ( _transformation.gizmos != null ) {

				mat4Copy( gizmos, _transformation.gizmos );

			} else {

				_transformation.gizmos = mat4Copy( gizmos );

			}

		} else {

			_transformation.gizmos = null;

		}

	}

	/**
	 * Rotates camera around its direction axis passing by a given point by a given angle.
	 *
	 * @private
	 * @param {Vector3} point - The point where the rotation axis is passing trough.
	 * @param {number} angle - Angle in radians.
	 * @returns {Object} The computed transformation matrix.
	 */
	zRotate( point, angle ) {

		mat4MakeRotationAxis( this._rotationAxis, angle, this._rotationMatrix );
		mat4MakeTranslation( - point.x, - point.y, - point.z, this._translationMatrix );

		mat4MakeTranslation( point.x, point.y, point.z, this._m4_1 );
		mat4Multiply( this._m4_1, this._rotationMatrix, this._m4_1 );
		mat4Multiply( this._m4_1, this._translationMatrix, this._m4_1 );

		vec3Sub( vec3SetFromMatrixPosition( this._gizmoMatrixState, this._v3_1 ), point, this._v3_1 );	//vector from rotation center to gizmos position
		vec3ApplyAxisAngle( this._v3_1, this._rotationAxis, angle, this._v3_2 );	//apply rotation
		vec3Sub( this._v3_2, this._v3_1, this._v3_2 );

		mat4MakeTranslation( this._v3_2.x, this._v3_2.y, this._v3_2.z, this._m4_2 );

		this.setTransformationMatrices( this._m4_1, this._m4_2 );
		return _transformation;

	}

	/**
	 * Returns the raycaster that is used for user interaction. This object is shared between all
	 * instances of `ArcballControls`.
	 *
	 * @returns {Raycaster} The internal raycaster.
	 */
	getRaycaster() {

		return _raycaster;

	}


	/**
	 * Unprojects the cursor on the 3D object surface.
	 *
	 * @private
	 * @param {Vector2} cursor - Cursor coordinates in NDC.
	 * @param {Camera} camera - Virtual camera.
	 * @returns {?Vector3} The point of intersection with the model, if exist, null otherwise.
	 */
	unprojectOnObj( cursor, camera ) {

		const raycaster = this.getRaycaster();
		raycaster.near = camera.near;
		raycaster.far = camera.far;
		raycaster.setFromCamera( cursor, camera );

		const intersect = raycaster.intersectObjects( this.scene.children, true );

		for ( let i = 0; i < intersect.length; i ++ ) {

			if ( intersect[ i ].object.uuid != this._gizmos.uuid && intersect[ i ].face != null ) {

				return vec3Copy( intersect[ i ].point );

			}

		}

		return null;

	}

	/**
	 * Unproject the cursor on the trackball surface.
	 *
	 * @private
	 * @param {Camera} camera - The virtual camera.
	 * @param {number} cursorX - Cursor horizontal coordinate on screen.
	 * @param {number} cursorY - Cursor vertical coordinate on screen.
	 * @param {HTMLElement} canvas - The canvas where the renderer draws its output.
	 * @param {number} tbRadius - The trackball radius.
	 * @returns {Vector3} The unprojected point on the trackball surface.
	 */
	unprojectOnTbSurface( camera, cursorX, cursorY, canvas, tbRadius ) {

		if ( camera.type == 'OrthographicCamera' ) {

			vec2Copy( this.getCursorPosition( cursorX, cursorY, canvas ), this._v2_1 );
			vec3Set( this._v3_1, this._v2_1.x, this._v2_1.y, 0 );

			const x2 = Math.pow( this._v2_1.x, 2 );
			const y2 = Math.pow( this._v2_1.y, 2 );
			const r2 = Math.pow( this._tbRadius, 2 );

			if ( x2 + y2 <= r2 * 0.5 ) {

				//intersection with sphere
				vec3SetZ( this._v3_1, Math.sqrt( r2 - ( x2 + y2 ) ) );

			} else {

				//intersection with hyperboloid
				vec3SetZ( this._v3_1, ( r2 * 0.5 ) / ( Math.sqrt( x2 + y2 ) ) );

			}

			return this._v3_1;

		} else if ( camera.type == 'PerspectiveCamera' ) {

			//unproject cursor on the near plane
			vec2Copy( this.getCursorNDC( cursorX, cursorY, canvas ), this._v2_1 );

			vec3Set( this._v3_1, this._v2_1.x, this._v2_1.y, - 1 );
			vec3ApplyMatrix4( this._v3_1, camera.projectionMatrixInverse, this._v3_1 );

			const rayDir = vec3Normalize( this._v3_1 ); //unprojected ray direction
			const cameraGizmoDistance = vec3DistanceTo( camera.position, this._gizmos.position );
			const radius2 = Math.pow( tbRadius, 2 );

			//	  camera
			//		|\
			//		| \
			//		|  \
			//	h	|	\
			//		| 	 \
			//		| 	  \
			//	_ _ | _ _ _\ _ _  near plane
			//			l

			const h = this._v3_1.z;
			const l = Math.sqrt( Math.pow( this._v3_1.x, 2 ) + Math.pow( this._v3_1.y, 2 ) );

			if ( l == 0 ) {

				//ray aligned with camera
				vec3Set( rayDir, this._v3_1.x, this._v3_1.y, tbRadius );
				return rayDir;

			}

			const m = h / l;
			const q = cameraGizmoDistance;

			/*
			 * calculate intersection point between unprojected ray and trackball surface
			 *|y = m * x + q
			 *|x^2 + y^2 = r^2
			 *
			 * (m^2 + 1) * x^2 + (2 * m * q) * x + q^2 - r^2 = 0
			 */
			let a = Math.pow( m, 2 ) + 1;
			let b = 2 * m * q;
			let c = Math.pow( q, 2 ) - radius2;
			let delta = Math.pow( b, 2 ) - ( 4 * a * c );

			if ( delta >= 0 ) {

				//intersection with sphere
				vec2SetX( this._v2_1, ( - b - Math.sqrt( delta ) ) / ( 2 * a ), this._v2_1 );
				vec2SetY( this._v2_1, m * this._v2_1.x + q, this._v2_1 );

				const angle = MathUtils.RAD2DEG * vec2Angle( this._v2_1 );

				if ( angle >= 45 ) {

					//if angle between intersection point and X' axis is >= 45°, return that point
					//otherwise, calculate intersection point with hyperboloid

					const rayLength = Math.sqrt( Math.pow( this._v2_1.x, 2 ) + Math.pow( ( cameraGizmoDistance - this._v2_1.y ), 2 ) );
					vec3MultiplyScalar( rayDir, rayLength, rayDir );
					rayDir.z += cameraGizmoDistance;
					return rayDir;

				}

			}

			//intersection with hyperboloid
			/*
			 *|y = m * x + q
			 *|y = (1 / x) * (r^2 / 2)
			 *
			 * m * x^2 + q * x - r^2 / 2 = 0
			 */

			a = m;
			b = q;
			c = - radius2 * 0.5;
			delta = Math.pow( b, 2 ) - ( 4 * a * c );
			vec2SetX( this._v2_1, ( - b - Math.sqrt( delta ) ) / ( 2 * a ), this._v2_1 );
			vec2SetY( this._v2_1, m * this._v2_1.x + q, this._v2_1 );

			const rayLength = Math.sqrt( Math.pow( this._v2_1.x, 2 ) + Math.pow( ( cameraGizmoDistance - this._v2_1.y ), 2 ) );

			vec3MultiplyScalar( rayDir, rayLength, rayDir );
			rayDir.z += cameraGizmoDistance;
			return rayDir;

		}

	}


	/**
	 * Unprojects the cursor on the plane passing through the center of the trackball orthogonal to the camera.
	 *
	 * @private
	 * @param {Camera} camera - The virtual camera.
	 * @param {number} cursorX - Cursor horizontal coordinate on screen.
	 * @param {number} cursorY - Cursor vertical coordinate on screen.
	 * @param {HTMLElement} canvas - The canvas where the renderer draws its output.
	 * @param {boolean} [initialDistance=false] - If initial distance between camera and gizmos should be used for calculations instead of current (Perspective only).
	 * @returns {Vector3} The unprojected point on the trackball plane.
	 */
	unprojectOnTbPlane( camera, cursorX, cursorY, canvas, initialDistance = false ) {

		if ( camera.type == 'OrthographicCamera' ) {

			vec2Copy( this.getCursorPosition( cursorX, cursorY, canvas ), this._v2_1 );
			vec3Set( this._v3_1, this._v2_1.x, this._v2_1.y, 0 );

			return vec3Copy( this._v3_1 );

		} else if ( camera.type == 'PerspectiveCamera' ) {

			vec2Copy( this.getCursorNDC( cursorX, cursorY, canvas ), this._v2_1 );

			//unproject cursor on the near plane
			vec3Set( this._v3_1, this._v2_1.x, this._v2_1.y, - 1 );
			vec3ApplyMatrix4( this._v3_1, camera.projectionMatrixInverse, this._v3_1 );

			const rayDir = vec3Normalize( this._v3_1 ); //unprojected ray direction

			//	  camera
			//		|\
			//		| \
			//		|  \
			//	h	|	\
			//		| 	 \
			//		| 	  \
			//	_ _ | _ _ _\ _ _  near plane
			//			l

			const h = this._v3_1.z;
			const l = Math.sqrt( Math.pow( this._v3_1.x, 2 ) + Math.pow( this._v3_1.y, 2 ) );
			let cameraGizmoDistance;

			if ( initialDistance ) {

				cameraGizmoDistance = vec3DistanceTo( vec3SetFromMatrixPosition( this._cameraMatrixState0, this._v3_1 ), vec3SetFromMatrixPosition( this._gizmoMatrixState0, this._v3_2 ) );

			} else {

				cameraGizmoDistance = vec3DistanceTo( camera.position, this._gizmos.position );

			}

			/*
			 * calculate intersection point between unprojected ray and the plane
			 *|y = mx + q
			 *|y = 0
			 *
			 * x = -q/m
			*/
			if ( l == 0 ) {

				//ray aligned with camera
				vec3Set( rayDir, 0, 0, 0 );
				return rayDir;

			}

			const m = h / l;
			const q = cameraGizmoDistance;
			const x = - q / m;

			const rayLength = Math.sqrt( Math.pow( q, 2 ) + Math.pow( x, 2 ) );
			vec3MultiplyScalar( rayDir, rayLength, rayDir );
			rayDir.z = 0;
			return rayDir;

		}

	}

	/**
	 * Updates camera and gizmos state.
	 *
	 * @private
	 */
	updateMatrixState() {

		//update camera and gizmos state
		mat4Copy( this.object.matrix, this._cameraMatrixState );
		mat4Copy( this._gizmos.matrix, this._gizmoMatrixState );

		if ( this.object.isOrthographicCamera ) {

			mat4Copy( this.object.projectionMatrix, this._cameraProjectionState );
			this.object.updateProjectionMatrix();
			this._zoomState = this.object.zoom;

		} else if ( this.object.isPerspectiveCamera ) {

			this._fovState = this.object.fov;

		}

	}

	/**
	 * Updates the trackball FSA.
	 *
	 * @private
	 * @param {STATE} newState - New state of the FSA.
	 * @param {boolean} updateMatrices - If matrices state should be updated.
	 */
	updateTbState( newState, updateMatrices ) {

		this._state = newState;
		if ( updateMatrices ) {

			this.updateMatrixState();

		}

	}

	update() {

		if ( vec3Equals( this.target, this._currentTarget ) === false ) {

			vec3Copy( this.target, this._gizmos.position );	//for correct radius calculation
			this._tbRadius = this.calculateTbRadius( this.object );
			this.makeGizmos( this.target, this._tbRadius );
			vec3Copy( this.target, this._currentTarget );

		}

		//check min/max parameters
		if ( this.object.isOrthographicCamera ) {

			//check zoom
			if ( this.object.zoom > this.maxZoom || this.object.zoom < this.minZoom ) {

				const newZoom = MathUtils.clamp( this.object.zoom, this.minZoom, this.maxZoom );
				this.applyTransformMatrix( this.scale( newZoom / this.object.zoom, this._gizmos.position, true ) );

			}

		} else if ( this.object.isPerspectiveCamera ) {

			//check distance
			const distance = vec3DistanceTo( this.object.position, this._gizmos.position );

			if ( distance > this.maxDistance + _EPS || distance < this.minDistance - _EPS ) {

				const newDistance = MathUtils.clamp( distance, this.minDistance, this.maxDistance );
				this.applyTransformMatrix( this.scale( newDistance / distance, this._gizmos.position ) );
				this.updateMatrixState();

			}

			//check fov
			if ( this.object.fov < this.minFov || this.object.fov > this.maxFov ) {

				this.object.fov = MathUtils.clamp( this.object.fov, this.minFov, this.maxFov );
				this.object.updateProjectionMatrix();

			}

			const oldRadius = this._tbRadius;
			this._tbRadius = this.calculateTbRadius( this.object );

			if ( oldRadius < this._tbRadius - _EPS || oldRadius > this._tbRadius + _EPS ) {

				const scale = ( this._gizmos.scale.x + this._gizmos.scale.y + this._gizmos.scale.z ) / 3;
				const newRadius = this._tbRadius / scale;
				const curve = new EllipseCurve( 0, 0, newRadius, newRadius );
				const points = curve.getPoints( this._curvePts );
				const curveGeometry = new BufferGeometry().setFromPoints( points );

				for ( const gizmo in this._gizmos.children ) {

					this._gizmos.children[ gizmo ].geometry = curveGeometry;

				}

			}

		}

		this.object.lookAt( this._gizmos.position );

	}

	setStateFromJSON( json ) {

		const state = JSON.parse( json );

		if ( state.arcballState != undefined ) {

			vec3FromArray( state.arcballState.target, 0, this.target );

			mat4FromArray( state.arcballState.cameraMatrix.elements, 0, this._cameraMatrixState );
			mat4Decompose( this._cameraMatrixState, this.object.position, this.object.quaternion, this.object.scale );
			this.object.quaternion._onChangeCallback();

			vec3Copy( state.arcballState.cameraUp, this.object.up );
			this.object.near = state.arcballState.cameraNear;
			this.object.far = state.arcballState.cameraFar;

			this.object.zoom = state.arcballState.cameraZoom;

			if ( this.object.isPerspectiveCamera ) {

				this.object.fov = state.arcballState.cameraFov;

			}

			mat4FromArray( state.arcballState.gizmoMatrix.elements, 0, this._gizmoMatrixState );
			mat4Decompose( this._gizmoMatrixState, this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale );
			this._gizmos.quaternion._onChangeCallback();

			this.object.updateMatrix();
			this.object.updateProjectionMatrix();

			this._gizmos.updateMatrix();

			this._tbRadius = this.calculateTbRadius( this.object );
			const gizmoTmp = mat4Copy( this._gizmoMatrixState0 );
			this.makeGizmos( this._gizmos.position, this._tbRadius );
			mat4Copy( gizmoTmp, this._gizmoMatrixState0 );

			this.object.lookAt( this._gizmos.position );
			this.updateTbState( STATE.IDLE, false );

			this.dispatchEvent( _changeEvent );

		}

	}

}

//listeners

function onWindowResize() {

	const scale = ( this._gizmos.scale.x + this._gizmos.scale.y + this._gizmos.scale.z ) / 3;
	this._tbRadius = this.calculateTbRadius( this.object );

	const newRadius = this._tbRadius / scale;
	const curve = new EllipseCurve( 0, 0, newRadius, newRadius );
	const points = curve.getPoints( this._curvePts );
	const curveGeometry = new BufferGeometry().setFromPoints( points );


	for ( const gizmo in this._gizmos.children ) {

		this._gizmos.children[ gizmo ].geometry = curveGeometry;

	}

	this.dispatchEvent( _changeEvent );

}

function onContextMenu( event ) {

	if ( ! this.enabled ) {

		return;

	}

	for ( let i = 0; i < this.mouseActions.length; i ++ ) {

		if ( this.mouseActions[ i ].mouse == 2 ) {

			//prevent only if button 2 is actually used
			event.preventDefault();
			break;

		}

	}

}

function onPointerCancel() {

	this._touchStart.splice( 0, this._touchStart.length );
	this._touchCurrent.splice( 0, this._touchCurrent.length );
	this._input = INPUT.NONE;

}

function onPointerDown( event ) {

	if ( event.button == 0 && event.isPrimary ) {

		this._downValid = true;
		this._downEvents.push( event );
		this._downStart = performance.now();

	} else {

		this._downValid = false;

	}

	if ( event.pointerType == 'touch' && this._input != INPUT.CURSOR ) {

		this._touchStart.push( event );
		this._touchCurrent.push( event );

		switch ( this._input ) {

			case INPUT.NONE:

				//singleStart
				this._input = INPUT.ONE_FINGER;
				this.onSinglePanStart( event, 'ROTATE' );

				window.addEventListener( 'pointermove', this._onPointerMove );
				window.addEventListener( 'pointerup', this._onPointerUp );

				break;

			case INPUT.ONE_FINGER:
			case INPUT.ONE_FINGER_SWITCHED:

				//doubleStart
				this._input = INPUT.TWO_FINGER;

				this.onRotateStart();
				this.onPinchStart();
				this.onDoublePanStart();

				break;

			case INPUT.TWO_FINGER:

				//multipleStart
				this._input = INPUT.MULT_FINGER;
				this.onTriplePanStart( event );
				break;

		}

	} else if ( event.pointerType != 'touch' && this._input == INPUT.NONE ) {

		let modifier = null;

		if ( event.ctrlKey || event.metaKey ) {

			modifier = 'CTRL';

		} else if ( event.shiftKey ) {

			modifier = 'SHIFT';

		}

		this._mouseOp = this.getOpFromAction( event.button, modifier );
		if ( this._mouseOp != null ) {

			window.addEventListener( 'pointermove', this._onPointerMove );
			window.addEventListener( 'pointerup', this._onPointerUp );

			//singleStart
			this._input = INPUT.CURSOR;
			this._button = event.button;
			this.onSinglePanStart( event, this._mouseOp );

		}

	}

}

function onPointerMove( event ) {

	if ( event.pointerType == 'touch' && this._input != INPUT.CURSOR ) {

		switch ( this._input ) {

			case INPUT.ONE_FINGER:

				//singleMove
				this.updateTouchEvent( event );

				this.onSinglePanMove( event, STATE.ROTATE );
				break;

			case INPUT.ONE_FINGER_SWITCHED:

				const movement = this.calculatePointersDistance( this._touchCurrent[ 0 ], event ) * this._devPxRatio;

				if ( movement >= this._switchSensibility ) {

					//singleMove
					this._input = INPUT.ONE_FINGER;
					this.updateTouchEvent( event );

					this.onSinglePanStart( event, 'ROTATE' );
					break;

				}

				break;

			case INPUT.TWO_FINGER:

				//rotate/pan/pinchMove
				this.updateTouchEvent( event );

				this.onRotateMove();
				this.onPinchMove();
				this.onDoublePanMove();

				break;

			case INPUT.MULT_FINGER:

				//multMove
				this.updateTouchEvent( event );

				this.onTriplePanMove( event );
				break;

		}

	} else if ( event.pointerType != 'touch' && this._input == INPUT.CURSOR ) {

		let modifier = null;

		if ( event.ctrlKey || event.metaKey ) {

			modifier = 'CTRL';

		} else if ( event.shiftKey ) {

			modifier = 'SHIFT';

		}

		const mouseOpState = this.getOpStateFromAction( this._button, modifier );

		if ( mouseOpState != null ) {

			this.onSinglePanMove( event, mouseOpState );

		}

	}

	//checkDistance
	if ( this._downValid ) {

		const movement = this.calculatePointersDistance( this._downEvents[ this._downEvents.length - 1 ], event ) * this._devPxRatio;
		if ( movement > this._movementThreshold ) {

			this._downValid = false;

		}

	}

}

function onPointerUp( event ) {

	if ( event.pointerType == 'touch' && this._input != INPUT.CURSOR ) {

		const nTouch = this._touchCurrent.length;

		for ( let i = 0; i < nTouch; i ++ ) {

			if ( this._touchCurrent[ i ].pointerId == event.pointerId ) {

				this._touchCurrent.splice( i, 1 );
				this._touchStart.splice( i, 1 );
				break;

			}

		}

		switch ( this._input ) {

			case INPUT.ONE_FINGER:
			case INPUT.ONE_FINGER_SWITCHED:

				//singleEnd
				window.removeEventListener( 'pointermove', this._onPointerMove );
				window.removeEventListener( 'pointerup', this._onPointerUp );

				this._input = INPUT.NONE;
				this.onSinglePanEnd();

				break;

			case INPUT.TWO_FINGER:

				//doubleEnd
				this.onDoublePanEnd( event );
				this.onPinchEnd( event );
				this.onRotateEnd( event );

				//switching to singleStart
				this._input = INPUT.ONE_FINGER_SWITCHED;

				break;

			case INPUT.MULT_FINGER:

				if ( this._touchCurrent.length == 0 ) {

					window.removeEventListener( 'pointermove', this._onPointerMove );
					window.removeEventListener( 'pointerup', this._onPointerUp );

					//multCancel
					this._input = INPUT.NONE;
					this.onTriplePanEnd();

				}

				break;

		}

	} else if ( event.pointerType != 'touch' && this._input == INPUT.CURSOR ) {

		window.removeEventListener( 'pointermove', this._onPointerMove );
		window.removeEventListener( 'pointerup', this._onPointerUp );

		this._input = INPUT.NONE;
		this.onSinglePanEnd();
		this._button = - 1;

	}

	if ( event.isPrimary ) {

		if ( this._downValid ) {

			const downTime = event.timeStamp - this._downEvents[ this._downEvents.length - 1 ].timeStamp;

			if ( downTime <= this._maxDownTime ) {

				if ( this._nclicks == 0 ) {

					//first valid click detected
					this._nclicks = 1;
					this._clickStart = performance.now();

				} else {

					const clickInterval = event.timeStamp - this._clickStart;
					const movement = this.calculatePointersDistance( this._downEvents[ 1 ], this._downEvents[ 0 ] ) * this._devPxRatio;

					if ( clickInterval <= this._maxInterval && movement <= this._posThreshold ) {

						//second valid click detected
						//fire double tap and reset values
						this._nclicks = 0;
						this._downEvents.splice( 0, this._downEvents.length );
						this.onDoubleTap( event );

					} else {

						//new 'first click'
						this._nclicks = 1;
						this._downEvents.shift();
						this._clickStart = performance.now();

					}

				}

			} else {

				this._downValid = false;
				this._nclicks = 0;
				this._downEvents.splice( 0, this._downEvents.length );

			}

		} else {

			this._nclicks = 0;
			this._downEvents.splice( 0, this._downEvents.length );

		}

	}

}

function onWheel( event ) {

	if ( this.enabled && this.enableZoom ) {

		let modifier = null;

		if ( event.ctrlKey || event.metaKey ) {

			modifier = 'CTRL';

		} else if ( event.shiftKey ) {

			modifier = 'SHIFT';

		}

		const mouseOp = this.getOpFromAction( 'WHEEL', modifier );

		if ( mouseOp != null ) {

			event.preventDefault();
			this.dispatchEvent( _startEvent );

			const notchDeltaY = 125; //distance of one notch of mouse wheel
			let sgn = event.deltaY / notchDeltaY;

			let size = 1;

			if ( sgn > 0 ) {

				size = 1 / this.scaleFactor;

			} else if ( sgn < 0 ) {

				size = this.scaleFactor;

			}

			switch ( mouseOp ) {

				case 'ZOOM':

					this.updateTbState( STATE.SCALE, true );

					if ( sgn > 0 ) {

						size = 1 / ( Math.pow( this.scaleFactor, sgn ) );

					} else if ( sgn < 0 ) {

						size = Math.pow( this.scaleFactor, - sgn );

					}

					if ( this.cursorZoom && this.enablePan ) {

						let scalePoint;

						if ( this.object.isOrthographicCamera ) {

							scalePoint = vec3Add( vec3MultiplyScalar( vec3ApplyQuaternion( this.unprojectOnTbPlane( this.object, event.clientX, event.clientY, this.domElement ), this.object.quaternion ), 1 / this.object.zoom ), this._gizmos.position );

						} else if ( this.object.isPerspectiveCamera ) {

							scalePoint = vec3Add( vec3ApplyQuaternion( this.unprojectOnTbPlane( this.object, event.clientX, event.clientY, this.domElement ), this.object.quaternion ), this._gizmos.position );

						}

						this.applyTransformMatrix( this.scale( size, scalePoint ) );

					} else {

						this.applyTransformMatrix( this.scale( size, this._gizmos.position ) );

					}

					if ( this._grid != null ) {

						this.disposeGrid();
						this.drawGrid();

					}

					this.updateTbState( STATE.IDLE, false );

					this.dispatchEvent( _changeEvent );
					this.dispatchEvent( _endEvent );

					break;

				case 'FOV':

					if ( this.object.isPerspectiveCamera ) {

						this.updateTbState( STATE.FOV, true );


						//Vertigo effect

						//	  fov / 2
						//		|\
						//		| \
						//		|  \
						//	x	|	\
						//		| 	 \
						//		| 	  \
						//		| _ _ _\
						//			y

						//check for iOs shift shortcut
						if ( event.deltaX != 0 ) {

							sgn = event.deltaX / notchDeltaY;

							size = 1;

							if ( sgn > 0 ) {

								size = 1 / ( Math.pow( this.scaleFactor, sgn ) );

							} else if ( sgn < 0 ) {

								size = Math.pow( this.scaleFactor, - sgn );

							}

						}

						vec3SetFromMatrixPosition( this._cameraMatrixState, this._v3_1 );
						const x = vec3DistanceTo( this._v3_1, this._gizmos.position );
						let xNew = x / size;	//distance between camera and gizmos if scale(size, scalepoint) would be performed

						//check min and max distance
						xNew = MathUtils.clamp( xNew, this.minDistance, this.maxDistance );

						const y = x * Math.tan( MathUtils.DEG2RAD * this.object.fov * 0.5 );

						//calculate new fov
						let newFov = MathUtils.RAD2DEG * ( Math.atan( y / xNew ) * 2 );

						//check min and max fov
						if ( newFov > this.maxFov ) {

							newFov = this.maxFov;

						} else if ( newFov < this.minFov ) {

							newFov = this.minFov;

						}

						const newDistance = y / Math.tan( MathUtils.DEG2RAD * ( newFov / 2 ) );
						size = x / newDistance;

						this.setFov( newFov );
						this.applyTransformMatrix( this.scale( size, this._gizmos.position, false ) );

					}

					if ( this._grid != null ) {

						this.disposeGrid();
						this.drawGrid();

					}

					this.updateTbState( STATE.IDLE, false );

					this.dispatchEvent( _changeEvent );
					this.dispatchEvent( _endEvent );

					break;

			}

		}

	}

}

export { ArcballControls };
