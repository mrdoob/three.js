import {
	MOUSE,
	Vector2,
	Vector3,
	Quaternion,
} from "../../../build/three.module.js";

import { Controls } from './Controls.js';

const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };

const _eye = new Vector3();

const _rotationMagnitude = new Vector2();
const _zoomMagnitude = new Vector2();
const _panMagnitude = new Vector3();

// events
// TODO: make sure events are always fired in right order (start > change > end)

const changeEvent = { type: 'change' };
const startEvent = { type: 'start' };
const endEvent = { type: 'end' };

// Temp variables

const _axis = new Vector3();
const _quaternion = new Quaternion();
const _eyeDirection = new Vector3();
const _cameraUpDirection = new Vector3();
const _cameraSidewaysDirection = new Vector3();
const _moveDirection = new Vector3();

class TrackballControls extends Controls {

	constructor( camera, domElement ) {

		super( camera, domElement );

		// API

		this.rotateSpeed = 1.0;
		this.zoomSpeed = 1.2;
		this.panSpeed = 1.0;

		this.noRotate = false;
		this.noZoom = false;
		this.noPan = false;

		this.minDistance = 0;
		this.maxDistance = Infinity;

		this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		// internals

		this._keyState = STATE.NONE;

		//
		// event handlers
		//

		const _onContextMenu = ( event ) => {

			event.preventDefault();

		};

		const _onWheel = ( event ) => {

			if ( this.noZoom === true ) return;

			event.preventDefault();
			event.stopPropagation();

			switch ( event.deltaMode ) {

				case 2:
					// Zoom in pages
					_zoomMagnitude.y -= event.deltaY * 0.025 * this.zoomSpeed;
					break;

				case 1:
					// Zoom in lines
					_zoomMagnitude.y -= event.deltaY * 0.01 * this.zoomSpeed;
					break;

				default:
					// undefined, 0, assume pixels
					_zoomMagnitude.y -= event.deltaY * 0.00025 * this.zoomSpeed;
					break;

			}

		};

		this.addEventListener( 'contextmenu', _onContextMenu );
		this.addEventListener( 'wheel', _onWheel );

		this.dispatchEvent( changeEvent );

		//
		// Deprecation warnings
		//

		Object.defineProperty(this, 'staticMoving', {

			set: ( value ) => {

				console.warn( `THREE.TrackballControls: "staticMoving" has been renamed to "enableDamping".` );
				this.enableDamping = ! value;

			}

		});

		Object.defineProperty( this, 'dynamicDampingFactor', {

			set: ( value ) => {

				console.warn( 'THREE.TrackballControls: "dynamicDampingFactor" is now "dampingFactor"!' );

				this.dampingFactor = value;

			}

		});

		this.update = () => {

			console.warn( 'THREE.TrackballControls: update() has been deprecated.' );

		}

		this.handleResize = () => {

			console.warn( 'THREE.TrackballControls: handleResize() has been deprecated.' );

		}

	}

	onTrackedPointerDown( pointer, pointers ) {

		if ( pointers.length === 1 ) {

			this.dispatchEvent( startEvent );

		}

	}

	onTrackedPointerMove( pointer, pointers ) {

		_rotationMagnitude.set( 0, 0, 0 );
		_zoomMagnitude.set( 0, 0, 0 );
		_panMagnitude.set( 0, 0, 0 );

		switch ( pointers.length ) {

			case 1: // 1 pointer

				const button = pointers[ 0 ].button;

				if ( ( button === this.mouseButtons.LEFT || this._keyState === STATE.ROTATE ) && ! this.noRotate ) {

					_rotationMagnitude.copy( pointers[ 0 ].view.movement ).multiplyScalar( this.rotateSpeed );

				} else if ( ( button === this.mouseButtons.MIDDLE || this._keyState === STATE.ZOOM ) && ! this.noZoom ) {

					_zoomMagnitude.y = pointers[ 0 ].view.movement.y * this.zoomSpeed;

				} else if ( ( button === this.mouseButtons.RIGHT || this._keyState === STATE.PAN ) && ! this.noPan ) {

					_panMagnitude.copy( pointers[ 0 ].world.movement ).multiplyScalar( this.panSpeed );

				}

				break;

			default: // 2 or more pointers

				const distance = pointers[ 0 ].view.current.clone().sub(pointers[ 1 ].view.current).length();
				const distancePrev = pointers[ 0 ].view.previous.clone().sub(pointers[ 1 ].view.previous).length();
				_zoomMagnitude.y = ( distance - distancePrev ) * this.zoomSpeed;

				_panMagnitude.copy( pointers[ 0 ].world.movement );
				_panMagnitude.add( pointers[ 1 ].world.movement );
				_panMagnitude.multiplyScalar( this.panSpeed * 0.5 );

				break;

		}

		_eye.subVectors( this.camera.position, this.target );

		if ( ! this.noRotate ) this._rotateCamera();

		if ( ! this.noZoom ) this._zoomCamera();

		if ( ! this.noPan ) this._panCamera();

		this.camera.position.addVectors( this.target, _eye );

		this.camera.lookAt( this.target );

		this.dispatchEvent( changeEvent );

	}

	onTrackedPointerUp( pointer, pointers ) {

		if ( pointers.length === 0 ) {

			this.dispatchEvent( endEvent );

		}

	}

	onTrackedKeyChange( keyCode, keyCodes ) {

		if ( keyCodes.length > 0 ) {

			if ( keyCodes[ 0 ].keyCode === this.keys[ STATE.ROTATE ] && ! this.noRotate ) {

				this._keyState = STATE.ROTATE;

			} else if ( keyCodes[ 0 ].keyCode === this.keys[ STATE.ZOOM ] && ! this.noZoom ) {

				this._keyState = STATE.ZOOM;

			} else if ( keyCodes[ 0 ].keyCode === this.keys[ STATE.PAN ] && ! this.noPan ) {

				this._keyState = STATE.PAN;

			}

		} else {

			this._keyState = STATE.NONE;

		}

	}

	_rotateCamera() {

		const angle = _rotationMagnitude.length();

		if ( angle ) {

			_eye.copy( this.camera.position ).sub( this.target );

			_eyeDirection.copy( _eye ).normalize();
			_cameraUpDirection.copy( this.camera.up ).normalize();
			_cameraSidewaysDirection.crossVectors( _cameraUpDirection, _eyeDirection ).normalize();

			_cameraUpDirection.setLength( _rotationMagnitude.y );
			_cameraSidewaysDirection.setLength( _rotationMagnitude.x );

			_moveDirection.copy( _cameraUpDirection.add( _cameraSidewaysDirection ) );

			_axis.crossVectors( _moveDirection, _eye ).normalize();

			_quaternion.setFromAxisAngle( _axis, angle );

			_eye.applyQuaternion( _quaternion );

			this.camera.up.applyQuaternion( _quaternion );

		}

	};

	_zoomCamera() {

		var factor = 1.0 - _zoomMagnitude.y;

		if ( factor !== 1.0 && factor > 0.0 ) {

			if ( this.camera.isPerspectiveCamera ) {

				_eye.multiplyScalar( factor );

				// Clamp min/max

				if ( _eye.lengthSq() < this.minDistance * this.minDistance ) {
	
					this.camera.position.addVectors( this.target, _eye.setLength( this.minDistance ) );
					_zoomMagnitude.y = 0;
	
				} else if ( _eye.lengthSq() > this.maxDistance * this.maxDistance ) {

					this.camera.position.addVectors( this.target, _eye.setLength( this.maxDistance ) );
					_zoomMagnitude.y = 0;
	
				}

			} else if ( this.camera.isOrthographicCamera ) {

				this.camera.zoom /= factor;
				this.camera.updateProjectionMatrix();

			} else {

				console.warn( 'THREE.TrackballControls: Unsupported camera type' );

			}

		}

	}

	_panCamera() {

		this.camera.position.sub( _panMagnitude );
		this.target.sub( _panMagnitude );

	}

};

export { TrackballControls };
