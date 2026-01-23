import { MOUSE, TOUCH, Plane, Raycaster, Vector2, Vector3 } from 'three';

import { OrbitControls } from './OrbitControls.js';

const _plane = new Plane();
const _raycaster = new Raycaster();
const _mouse = new Vector2();
const _panCurrent = new Vector3();

/**
 * This class is intended for transforming a camera over a map from bird's eye perspective.
 * The class shares its implementation with {@link OrbitControls} but uses a specific preset
 * for mouse/touch interaction and disables screen space panning by default.
 *
 * - Orbit: Right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate.
 * - Zoom: Middle mouse, or mousewheel / touch: two-finger spread or squish.
 * - Pan: Left mouse, or arrow keys / touch: one-finger move.
 *
 * @augments OrbitControls
 * @three_import import { MapControls } from 'three/addons/controls/MapControls.js';
 */
class MapControls extends OrbitControls {

	constructor( object, domElement ) {

		super( object, domElement );

		/**
		 * Overwritten and set to `false` to pan orthogonal to world-space direction `camera.up`.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.screenSpacePanning = false;

		/**
		 * This object contains references to the mouse actions used by the controls.
		 *
		 * ```js
		 * controls.mouseButtons = {
		 * 	LEFT: THREE.MOUSE.PAN,
		 * 	MIDDLE: THREE.MOUSE.DOLLY,
		 * 	RIGHT: THREE.MOUSE.ROTATE
		 * }
		 * ```
		 * @type {Object}
		 */
		this.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE };

		/**
		 * This object contains references to the touch actions used by the controls.
		 *
		 * ```js
		 * controls.mouseButtons = {
		 * 	ONE: THREE.TOUCH.PAN,
		 * 	TWO: THREE.TOUCH.DOLLY_ROTATE
		 * }
		 * ```
		 * @type {Object}
		 */
		this.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };

		this._panWorldStart = new Vector3();

	}

	_handleMouseDownPan( event ) {

		super._handleMouseDownPan( event );

		this._panOffset.set( 0, 0, 0 );

		if ( this.screenSpacePanning === true ) return;

		_plane.setFromNormalAndCoplanarPoint( this.object.up, this.target );

		const element = this.domElement;
		const rect = element.getBoundingClientRect();
		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, this.object );
		_raycaster.ray.intersectPlane( _plane, this._panWorldStart );

	}

	_handleMouseMovePan( event ) {

		if ( this.screenSpacePanning === true ) {

			super._handleMouseMovePan( event );
			return;

		}

		const element = this.domElement;
		const rect = element.getBoundingClientRect();
		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, this.object );

		if ( _raycaster.ray.intersectPlane( _plane, _panCurrent ) ) {

			_panCurrent.sub( this._panWorldStart );
			this._panOffset.copy( _panCurrent ).negate();

			this.update();

		}

	}

}

export { MapControls };
