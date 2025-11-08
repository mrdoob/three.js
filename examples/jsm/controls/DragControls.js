import {
	Controls,
	Matrix4,
	Plane,
	Raycaster,
	Vector2,
	Vector3,
	MOUSE,
	TOUCH
} from 'three';

const _plane = new Plane();

const _pointer = new Vector2();
const _offset = new Vector3();
const _diff = new Vector2();
const _previousPointer = new Vector2();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

const _up = new Vector3();
const _right = new Vector3();

let _selected = null, _hovered = null;
const _intersections = [];

const STATE = {
	NONE: - 1,
	PAN: 0,
	ROTATE: 1
};

/**
 * This class can be used to provide a drag'n'drop interaction.
 *
 * ```js
 * const controls = new DragControls( objects, camera, renderer.domElement );
 *
 * // add event listener to highlight dragged objects
 * controls.addEventListener( 'dragstart', function ( event ) {
 *
 * 	event.object.material.emissive.set( 0xaaaaaa );
 *
 * } );
 *
 * controls.addEventListener( 'dragend', function ( event ) {
 *
 * 	event.object.material.emissive.set( 0x000000 );
 *
 * } );
 * ```
 *
 * @augments Controls
 * @three_import import { DragControls } from 'three/addons/controls/DragControls.js';
 */
class DragControls extends Controls {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Array<Object3D>} objects - An array of draggable 3D objects.
	 * @param {Camera} camera - The camera of the rendered scene.
	 * @param {?HTMLElement} [domElement=null] - The HTML DOM element used for event listeners.
	 */
	constructor( objects, camera, domElement = null ) {

		super( camera, domElement );

		/**
		 * An array of draggable 3D objects.
		 *
		 * @type {Array<Object3D>}
		 */
		this.objects = objects;

		/**
		 * Whether children of draggable objects can be dragged independently from their parent.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.recursive = true;

		/**
		 * This option only works if the `objects` array contains a single draggable  group object.
		 * If set to `true`, the controls does not transform individual objects but the entire group.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.transformGroup = false;

		/**
		 * The speed at which the object will rotate when dragged in `rotate` mode.
		 * The higher the number the faster the rotation.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.rotateSpeed = 1;

		/**
		 * The raycaster used for detecting 3D objects.
		 *
		 * @type {Raycaster}
		 */
		this.raycaster = new Raycaster();

		// interaction

		this.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.PAN, RIGHT: MOUSE.ROTATE };
		this.touches = { ONE: TOUCH.PAN };

		// event listeners

		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerCancel = onPointerCancel.bind( this );
		this._onContextMenu = onContextMenu.bind( this );

		//

		if ( domElement !== null ) {

			this.connect( domElement );

		}

	}

	connect( element ) {

		super.connect( element );

		this.domElement.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointerup', this._onPointerCancel );
		this.domElement.addEventListener( 'pointerleave', this._onPointerCancel );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = 'none'; // disable touch scroll

	}

	disconnect() {

		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'pointerup', this._onPointerCancel );
		this.domElement.removeEventListener( 'pointerleave', this._onPointerCancel );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		this.domElement.style.touchAction = 'auto';
		this.domElement.style.cursor = '';

	}

	dispose() {

		this.disconnect();

	}

	_updatePointer( event ) {

		const rect = this.domElement.getBoundingClientRect();

		_pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
		_pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

	}

	_updateState( event ) {

		// determine action

		let action;

		if ( event.pointerType === 'touch' ) {

			action = this.touches.ONE;

		} else {

			switch ( event.button ) {

				case 0:

					action = this.mouseButtons.LEFT;
					break;

				case 1:

					action = this.mouseButtons.MIDDLE;
					break;

				case 2:

					action = this.mouseButtons.RIGHT;
					break;

				default:

					action = null;

			}

		}

		// determine state

		switch ( action ) {

			case MOUSE.PAN:
			case TOUCH.PAN:

				this.state = STATE.PAN;

				break;

			case MOUSE.ROTATE:
			case TOUCH.ROTATE:

				this.state = STATE.ROTATE;

				break;

			default:

				this.state = STATE.NONE;

		}

	}

}

function onPointerMove( event ) {

	const camera = this.object;
	const domElement = this.domElement;
	const raycaster = this.raycaster;

	if ( this.enabled === false ) return;

	this._updatePointer( event );

	raycaster.setFromCamera( _pointer, camera );

	if ( _selected ) {

		if ( this.state === STATE.PAN ) {

			if ( raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );
				this.dispatchEvent( { type: 'drag', object: _selected } );

			}

		} else if ( this.state === STATE.ROTATE ) {

			_diff.subVectors( _pointer, _previousPointer ).multiplyScalar( this.rotateSpeed );
			_selected.rotateOnWorldAxis( _up, _diff.x );
			_selected.rotateOnWorldAxis( _right.normalize(), - _diff.y );
			this.dispatchEvent( { type: 'drag', object: _selected } );

		}

		_previousPointer.copy( _pointer );

	} else {

		// hover support

		if ( event.pointerType === 'mouse' || event.pointerType === 'pen' ) {

			_intersections.length = 0;

			raycaster.setFromCamera( _pointer, camera );
			raycaster.intersectObjects( this.objects, this.recursive, _intersections );

			if ( _intersections.length > 0 ) {

				const object = _intersections[ 0 ].object;

				_plane.setFromNormalAndCoplanarPoint( camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

				if ( _hovered !== object && _hovered !== null ) {

					this.dispatchEvent( { type: 'hoveroff', object: _hovered } );

					domElement.style.cursor = 'auto';
					_hovered = null;

				}

				if ( _hovered !== object ) {

					this.dispatchEvent( { type: 'hoveron', object: object } );

					domElement.style.cursor = 'pointer';
					_hovered = object;

				}

			} else {

				if ( _hovered !== null ) {

					this.dispatchEvent( { type: 'hoveroff', object: _hovered } );

					domElement.style.cursor = 'auto';
					_hovered = null;

				}

			}

		}

	}

	_previousPointer.copy( _pointer );

}

function onPointerDown( event ) {

	const camera = this.object;
	const domElement = this.domElement;
	const raycaster = this.raycaster;

	if ( this.enabled === false ) return;

	this._updatePointer( event );
	this._updateState( event );

	_intersections.length = 0;

	raycaster.setFromCamera( _pointer, camera );
	raycaster.intersectObjects( this.objects, this.recursive, _intersections );

	if ( _intersections.length > 0 ) {

		if ( this.transformGroup === true ) {

			// look for the outermost group in the object's upper hierarchy

			_selected = findGroup( _intersections[ 0 ].object );

		} else {

			_selected = _intersections[ 0 ].object;

		}

		_plane.setFromNormalAndCoplanarPoint( camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

		if ( raycaster.ray.intersectPlane( _plane, _intersection ) ) {

			if ( this.state === STATE.PAN ) {

				_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
				_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
				domElement.style.cursor = 'move';
				this.dispatchEvent( { type: 'dragstart', object: _selected } );

			} else if ( this.state === STATE.ROTATE ) {

				// the controls only support Y+ up
				_up.set( 0, 1, 0 ).applyQuaternion( camera.quaternion ).normalize();
				_right.set( 1, 0, 0 ).applyQuaternion( camera.quaternion ).normalize();
				domElement.style.cursor = 'move';
				this.dispatchEvent( { type: 'dragstart', object: _selected } );

			}

		}

	}

	_previousPointer.copy( _pointer );

}

function onPointerCancel() {

	if ( this.enabled === false ) return;

	if ( _selected ) {

		this.dispatchEvent( { type: 'dragend', object: _selected } );

		_selected = null;

	}

	this.domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	this.state = STATE.NONE;

}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

function findGroup( obj, group = null ) {

	if ( obj.isGroup ) group = obj;

	if ( obj.parent === null ) return group;

	return findGroup( obj.parent, group );

}

/**
 * Fires when the user drags a 3D object.
 *
 * @event DragControls#drag
 * @type {Object}
 */

/**
 * Fires when the user has finished dragging a 3D object.
 *
 * @event DragControls#dragend
 * @type {Object}
 */

/**
 * Fires when the pointer is moved onto a 3D object, or onto one of its children.
 *
 * @event DragControls#hoveron
 * @type {Object}
 */

/**
 * Fires when the pointer is moved out of a 3D object.
 *
 * @event DragControls#hoveroff
 * @type {Object}
 */

export { DragControls };
