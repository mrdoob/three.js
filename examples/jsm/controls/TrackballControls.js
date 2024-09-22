import {
	Controls,
	MathUtils,
	MOUSE,
	Quaternion,
	Vector2,
	Vector3
} from 'three';

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

const _EPS = 0.000001;
const _STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

const _v2 = new Vector2();
const _mouseChange = new Vector2();
const _objectUp = new Vector3();
const _pan = new Vector3();
const _axis = new Vector3();
const _quaternion = new Quaternion();
const _eyeDirection = new Vector3();
const _objectUpDirection = new Vector3();
const _objectSidewaysDirection = new Vector3();
const _moveDirection = new Vector3();

class TrackballControls extends Controls {

	constructor( object, domElement = null ) {

		super( object, domElement );

		// API

		this.enabled = true;

		this.screen = { left: 0, top: 0, width: 0, height: 0 };

		this.rotateSpeed = 1.0;
		this.zoomSpeed = 1.2;
		this.panSpeed = 0.3;

		this.noRotate = false;
		this.noZoom = false;
		this.noPan = false;

		this.staticMoving = false;
		this.dynamicDampingFactor = 0.2;

		this.minDistance = 0;
		this.maxDistance = Infinity;

		this.minZoom = 0;
		this.maxZoom = Infinity;

		this.keys = [ 'KeyA' /*A*/, 'KeyS' /*S*/, 'KeyD' /*D*/ ];

		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
		this.state = _STATE.NONE;
		this.keyState = _STATE.NONE;

		this.target = new Vector3();

		// internals

		this._lastPosition = new Vector3();
		this._lastZoom = 1;
		this._touchZoomDistanceStart = 0;
		this._touchZoomDistanceEnd = 0;
		this._lastAngle = 0;

		this._eye = new Vector3();

		this._movePrev = new Vector2();
		this._moveCurr = new Vector2();

		this._lastAxis = new Vector3();

		this._zoomStart = new Vector2();
		this._zoomEnd = new Vector2();

		this._panStart = new Vector2();
		this._panEnd = new Vector2();

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

		this._target0 = this.target.clone();
		this._position0 = this.object.position.clone();
		this._up0 = this.object.up.clone();
		this._zoom0 = this.object.zoom;

		if ( domElement !== null ) {

			this.connect();

			this.handleResize();

		}

		// force an update at start
		this.update();

	}

	connect() {

		window.addEventListener( 'keydown', this._onKeyDown );
		window.addEventListener( 'keyup', this._onKeyUp );

		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointercancel', this._onPointerCancel );
		this.domElement.addEventListener( 'wheel', this._onMouseWheel, { passive: false } );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = 'none'; // disable touch scroll

	}

	disconnect() {

		window.removeEventListener( 'keydown', this._onKeyDown );
		window.removeEventListener( 'keyup', this._onKeyUp );

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.removeEventListener( 'pointerup', this._onPointerUp );
		this.domElement.removeEventListener( 'pointercancel', this._onPointerCancel );
		this.domElement.removeEventListener( 'wheel', this._onMouseWheel );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = 'auto'; // disable touch scroll

	}

	dispose() {

		this.disconnect();

	}

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

		this._eye.subVectors( this.object.position, this.target );

		if ( ! this.noRotate ) {

			this._rotateCamera();

		}

		if ( ! this.noZoom ) {

			this._zoomCamera();

		}

		if ( ! this.noPan ) {

			this._panCamera();

		}

		this.object.position.addVectors( this.target, this._eye );

		if ( this.object.isPerspectiveCamera ) {

			this._checkDistances();

			this.object.lookAt( this.target );

			if ( this._lastPosition.distanceToSquared( this.object.position ) > _EPS ) {

				this.dispatchEvent( _changeEvent );

				this._lastPosition.copy( this.object.position );

			}

		} else if ( this.object.isOrthographicCamera ) {

			this.object.lookAt( this.target );

			if ( this._lastPosition.distanceToSquared( this.object.position ) > _EPS || this._lastZoom !== this.object.zoom ) {

				this.dispatchEvent( _changeEvent );

				this._lastPosition.copy( this.object.position );
				this._lastZoom = this.object.zoom;

			}

		} else {

			console.warn( 'THREE.TrackballControls: Unsupported camera type.' );

		}

	}

	reset() {

		this.state = _STATE.NONE;
		this.keyState = _STATE.NONE;

		this.target.copy( this._target0 );
		this.object.position.copy( this._position0 );
		this.object.up.copy( this._up0 );
		this.object.zoom = this._zoom0;

		this.object.updateProjectionMatrix();

		this._eye.subVectors( this.object.position, this.target );

		this.object.lookAt( this.target );

		this.dispatchEvent( _changeEvent );

		this._lastPosition.copy( this.object.position );
		this._lastZoom = this.object.zoom;

	}

	_panCamera() {

		_mouseChange.copy( this._panEnd ).sub( this._panStart );

		if ( _mouseChange.lengthSq() ) {

			if ( this.object.isOrthographicCamera ) {

				const scale_x = ( this.object.right - this.object.left ) / this.object.zoom / this.domElement.clientWidth;
				const scale_y = ( this.object.top - this.object.bottom ) / this.object.zoom / this.domElement.clientWidth;

				_mouseChange.x *= scale_x;
				_mouseChange.y *= scale_y;

			}

			_mouseChange.multiplyScalar( this._eye.length() * this.panSpeed );

			_pan.copy( this._eye ).cross( this.object.up ).setLength( _mouseChange.x );
			_pan.add( _objectUp.copy( this.object.up ).setLength( _mouseChange.y ) );

			this.object.position.add( _pan );
			this.target.add( _pan );

			if ( this.staticMoving ) {

				this._panStart.copy( this._panEnd );

			} else {

				this._panStart.add( _mouseChange.subVectors( this._panEnd, this._panStart ).multiplyScalar( this.dynamicDampingFactor ) );

			}

		}

	}

	_rotateCamera() {

		_moveDirection.set( this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0 );
		let angle = _moveDirection.length();

		if ( angle ) {

			this._eye.copy( this.object.position ).sub( this.target );

			_eyeDirection.copy( this._eye ).normalize();
			_objectUpDirection.copy( this.object.up ).normalize();
			_objectSidewaysDirection.crossVectors( _objectUpDirection, _eyeDirection ).normalize();

			_objectUpDirection.setLength( this._moveCurr.y - this._movePrev.y );
			_objectSidewaysDirection.setLength( this._moveCurr.x - this._movePrev.x );

			_moveDirection.copy( _objectUpDirection.add( _objectSidewaysDirection ) );

			_axis.crossVectors( _moveDirection, this._eye ).normalize();

			angle *= this.rotateSpeed;
			_quaternion.setFromAxisAngle( _axis, angle );

			this._eye.applyQuaternion( _quaternion );
			this.object.up.applyQuaternion( _quaternion );

			this._lastAxis.copy( _axis );
			this._lastAngle = angle;

		} else if ( ! this.staticMoving && this._lastAngle ) {

			this._lastAngle *= Math.sqrt( 1.0 - this.dynamicDampingFactor );
			this._eye.copy( this.object.position ).sub( this.target );
			_quaternion.setFromAxisAngle( this._lastAxis, this._lastAngle );
			this._eye.applyQuaternion( _quaternion );
			this.object.up.applyQuaternion( _quaternion );

		}

		this._movePrev.copy( this._moveCurr );

	}

	_zoomCamera() {

		let factor;

		if ( this.state === _STATE.TOUCH_ZOOM_PAN ) {

			factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
			this._touchZoomDistanceStart = this._touchZoomDistanceEnd;

			if ( this.object.isPerspectiveCamera ) {

				this._eye.multiplyScalar( factor );

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

					this._eye.multiplyScalar( factor );

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

				this._zoomStart.copy( this._zoomEnd );

			} else {

				this._zoomStart.y += ( this._zoomEnd.y - this._zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	}

	_getMouseOnScreen( pageX, pageY ) {

		_v2.set(
			( pageX - this.screen.left ) / this.screen.width,
			( pageY - this.screen.top ) / this.screen.height
		);

		return _v2;

	}

	_getMouseOnCircle( pageX, pageY ) {

		_v2.set(
			( ( pageX - this.screen.width * 0.5 - this.screen.left ) / ( this.screen.width * 0.5 ) ),
			( ( this.screen.height + 2 * ( this.screen.top - pageY ) ) / this.screen.width ) // screen.width intentional
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

			position = new Vector2();
			this._pointerPositions[ event.pointerId ] = position;

		}

		position.set( event.pageX, event.pageY );

	}

	_getSecondPointerPosition( event ) {

		const pointer = ( event.pointerId === this._pointers[ 0 ].pointerId ) ? this._pointers[ 1 ] : this._pointers[ 0 ];

		return this._pointerPositions[ pointer.pointerId ];

	}

	_checkDistances() {

		if ( ! this.noZoom || ! this.noPan ) {

			if ( this._eye.lengthSq() > this.maxDistance * this.maxDistance ) {

				this.object.position.addVectors( this.target, this._eye.setLength( this.maxDistance ) );
				this._zoomStart.copy( this._zoomEnd );

			}

			if ( this._eye.lengthSq() < this.minDistance * this.minDistance ) {

				this.object.position.addVectors( this.target, this._eye.setLength( this.minDistance ) );
				this._zoomStart.copy( this._zoomEnd );

			}

		}

	}

}

function onPointerDown( event ) {

	if ( this.enabled === false ) return;

	if ( this._pointers.length === 0 ) {

		this.domElement.setPointerCapture( event.pointerId );

		this.domElement.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.addEventListener( 'pointerup', this._onPointerUp );

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

		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.removeEventListener( 'pointerup', this._onPointerUp );

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

		this._moveCurr.copy( this._getMouseOnCircle( event.pageX, event.pageY ) );
		this._movePrev.copy( this._moveCurr );

	} else if ( state === _STATE.ZOOM && ! this.noZoom ) {

		this._zoomStart.copy( this._getMouseOnScreen( event.pageX, event.pageY ) );
		this._zoomEnd.copy( this._zoomStart );

	} else if ( state === _STATE.PAN && ! this.noPan ) {

		this._panStart.copy( this._getMouseOnScreen( event.pageX, event.pageY ) );
		this._panEnd.copy( this._panStart );

	}

	this.dispatchEvent( _startEvent );

}

function onMouseMove( event ) {

	const state = ( this.keyState !== _STATE.NONE ) ? this.keyState : this.state;

	if ( state === _STATE.ROTATE && ! this.noRotate ) {

		this._movePrev.copy( this._moveCurr );
		this._moveCurr.copy( this._getMouseOnCircle( event.pageX, event.pageY ) );

	} else if ( state === _STATE.ZOOM && ! this.noZoom ) {

		this._zoomEnd.copy( this._getMouseOnScreen( event.pageX, event.pageY ) );

	} else if ( state === _STATE.PAN && ! this.noPan ) {

		this._panEnd.copy( this._getMouseOnScreen( event.pageX, event.pageY ) );

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
			this._moveCurr.copy( this._getMouseOnCircle( this._pointers[ 0 ].pageX, this._pointers[ 0 ].pageY ) );
			this._movePrev.copy( this._moveCurr );
			break;

		default: // 2 or more
			this.state = _STATE.TOUCH_ZOOM_PAN;
			const dx = this._pointers[ 0 ].pageX - this._pointers[ 1 ].pageX;
			const dy = this._pointers[ 0 ].pageY - this._pointers[ 1 ].pageY;
			this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

			const x = ( this._pointers[ 0 ].pageX + this._pointers[ 1 ].pageX ) / 2;
			const y = ( this._pointers[ 0 ].pageY + this._pointers[ 1 ].pageY ) / 2;
			this._panStart.copy( this._getMouseOnScreen( x, y ) );
			this._panEnd.copy( this._panStart );
			break;

	}

	this.dispatchEvent( _startEvent );

}

function onTouchMove( event ) {

	this._trackPointer( event );

	switch ( this._pointers.length ) {

		case 1:
			this._movePrev.copy( this._moveCurr );
			this._moveCurr.copy( this._getMouseOnCircle( event.pageX, event.pageY ) );
			break;

		default: // 2 or more

			const position = this._getSecondPointerPosition( event );

			const dx = event.pageX - position.x;
			const dy = event.pageY - position.y;
			this._touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

			const x = ( event.pageX + position.x ) / 2;
			const y = ( event.pageY + position.y ) / 2;
			this._panEnd.copy( this._getMouseOnScreen( x, y ) );
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
			this._moveCurr.copy( this._getMouseOnCircle( event.pageX, event.pageY ) );
			this._movePrev.copy( this._moveCurr );
			break;

		case 2:
			this.state = _STATE.TOUCH_ZOOM_PAN;

			for ( let i = 0; i < this._pointers.length; i ++ ) {

				if ( this._pointers[ i ].pointerId !== event.pointerId ) {

					const position = this._pointerPositions[ this._pointers[ i ].pointerId ];
					this._moveCurr.copy( this._getMouseOnCircle( position.x, position.y ) );
					this._movePrev.copy( this._moveCurr );
					break;

				}

			}

			break;

	}

	this.dispatchEvent( _endEvent );

}

export { TrackballControls };
