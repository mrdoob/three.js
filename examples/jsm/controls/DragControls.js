import {
	EventDispatcher,
	Matrix4,
	MOUSE,
	Plane,
	Raycaster,
	Vector2,
	Vector3
} from 'three';

const _plane = new Plane();
const _raycaster = new Raycaster();

const _pointer = new Vector2();
const _offset = new Vector3();
const _diff = new Vector2();
const _previousPointer = new Vector2();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

const _up = new Vector3();
const _right = new Vector3();

class DragControls extends EventDispatcher {

	constructor( _objects, _camera, _domElement ) {

		super();

		_domElement.style.touchAction = 'none'; // disable touch scroll

		let _selected = null, _hovered = null;

		const _intersections = [];

		this.mode = 'translate';

		this.rotateSpeed = 1;

		this.mouseButtons = { LEFT: MOUSE.DRAG, MIDDLE: null, RIGHT: MOUSE.ROTATE };

		const STATE = {
			NONE: null,
			DRAG: MOUSE.DRAG,
			ROTATE: MOUSE.ROTATE,
		};

		let state = STATE.NONE;

		const scope = this;

		function activate() {

			_domElement.addEventListener( 'pointermove', onPointerMove );
			_domElement.addEventListener( 'pointerdown', onPointerDown );
			_domElement.addEventListener( 'pointerup', onPointerCancel );
			_domElement.addEventListener( 'pointerleave', onPointerCancel );

		}

		function deactivate() {

			_domElement.removeEventListener( 'pointermove', onPointerMove );
			_domElement.removeEventListener( 'pointerdown', onPointerDown );
			_domElement.removeEventListener( 'pointerup', onPointerCancel );
			_domElement.removeEventListener( 'pointerleave', onPointerCancel );

			_domElement.style.cursor = '';

		}

		function dispose() {

			deactivate();

		}

		function getObjects() {

			return _objects;

		}

		function setObjects( objects ) {

			_objects = objects;

		}

		function getRaycaster() {

			return _raycaster;

		}

		function isStateInvalid() {

			return ( state === STATE.DRAG || state === STATE.ROTATE ) === false;

		}

		function onPointerMove( event ) {

			if ( scope.enabled === false ) return;

			updatePointer( event );

			_raycaster.setFromCamera( _pointer, _camera );

			if ( _selected ) {

				if ( state === STATE.DRAG ) {

					if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

						_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

					}

				} else if ( state === STATE.ROTATE ) {

					_diff.subVectors( _pointer, _previousPointer ).multiplyScalar( scope.rotateSpeed );
					_selected.rotateOnWorldAxis( _up, _diff.x );
					_selected.rotateOnWorldAxis( _right.normalize(), - _diff.y );

				}

				scope.dispatchEvent( { type: 'drag', object: _selected } );

				_previousPointer.copy( _pointer );

			} else {

				// hover support

				if ( event.pointerType === 'mouse' || event.pointerType === 'pen' ) {

					_intersections.length = 0;

					_raycaster.setFromCamera( _pointer, _camera );
					_raycaster.intersectObjects( _objects, scope.recursive, _intersections );

					if ( _intersections.length > 0 ) {

						const object = _intersections[ 0 ].object;

						_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

						if ( _hovered !== object && _hovered !== null ) {

							scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

							_domElement.style.cursor = 'auto';
							_hovered = null;

						}

						if ( _hovered !== object ) {

							scope.dispatchEvent( { type: 'hoveron', object: object } );

							_domElement.style.cursor = 'pointer';
							_hovered = object;

						}

					} else {

						if ( _hovered !== null ) {

							scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

							_domElement.style.cursor = 'auto';
							_hovered = null;

						}

					}

				}

			}

			_previousPointer.copy( _pointer );

		}

		function onPointerDown( event ) {

			if ( scope.enabled === false ) return;

			if ( event.pointerType === 'mouse' ) {

				switch ( event.button ) {

					case 0:

						state = scope.mouseButtons.LEFT;
						break;

					case 1:

						state = scope.mouseButtons.MIDDLE;
						break;

					case 2:

						state = scope.mouseButtons.RIGHT;
						break;

					default:

						state = STATE.NONE;

				}

			} else {

				switch ( scope.mode ) {

					case 'translate':

						state = STATE.DRAG;
						break;

					case 'rotate':

						state = STATE.ROTATE;
						break;

					default:

						state = STATE.NONE;

				}

			}

			if ( isStateInvalid() ) return;

			updatePointer( event );

			_intersections.length = 0;

			_raycaster.setFromCamera( _pointer, _camera );
			_raycaster.intersectObjects( _objects, scope.recursive, _intersections );

			if ( _intersections.length > 0 ) {

				if ( scope.transformGroup === true ) {

					// look for the outermost group in the object's upper hierarchy

					_selected = findGroup( _intersections[ 0 ].object );

				} else {

					_selected = _intersections[ 0 ].object;

				}

				_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

					if ( state === STATE.DRAG ) {

						_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
						_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

					} else if ( state === STATE.ROTATE ) {

						// the controls only support Y+ up
						_up.set( 0, 1, 0 ).applyQuaternion( _camera.quaternion ).normalize();
						_right.set( 1, 0, 0 ).applyQuaternion( _camera.quaternion ).normalize();

					}

				}

				_domElement.style.cursor = 'move';

				scope.dispatchEvent( { type: 'dragstart', object: _selected } );

			}

			_previousPointer.copy( _pointer );

		}

		function onPointerCancel() {

			if ( scope.enabled === false ) return;
			
			state = STATE.NONE;

			if ( _selected ) {

				scope.dispatchEvent( { type: 'dragend', object: _selected } );

				_selected = null;

			}

			_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

		}

		function updatePointer( event ) {

			const rect = _domElement.getBoundingClientRect();

			_pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
			_pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

		}

		function findGroup( obj, group = null ) {

			if ( obj.isGroup ) group = obj;

			if ( obj.parent === null ) return group;

			return findGroup( obj.parent, group );

		}

		activate();

		// API

		this.enabled = true;
		this.recursive = true;
		this.transformGroup = false;

		this.activate = activate;
		this.deactivate = deactivate;
		this.dispose = dispose;
		this.getObjects = getObjects;
		this.getRaycaster = getRaycaster;
		this.setObjects = setObjects;

	}

}

export { DragControls };
