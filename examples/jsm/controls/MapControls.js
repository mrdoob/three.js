import {
	MOUSE,
	TOUCH,
	planeCreate,
	planeSetFromNormalAndCoplanarPoint,
	Raycaster,
	rayIntersectPlane,
	vec2Create,
	vec3Copy,
	vec3Create,
	vec3Negate,
	vec3Set,
	vec3Sub
} from 'three';

import { OrbitControls } from './OrbitControls.js';

const _plane = /*@__PURE__*/ planeCreate();
const _raycaster = new Raycaster();
const _mouse = /*@__PURE__*/ vec2Create();
const _panCurrent = /*@__PURE__*/ vec3Create();

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

		this._panWorldStart = /*@__PURE__*/ vec3Create();

	}

	_handleMouseDownPan( event ) {

		super._handleMouseDownPan( event );

		vec3Set( this._panOffset, 0, 0, 0 );

		if ( this.screenSpacePanning === true ) return;

		planeSetFromNormalAndCoplanarPoint( this.object.up, this.target, _plane );

		const element = this.domElement;
		const rect = element.getBoundingClientRect();
		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, this.object );
		rayIntersectPlane( _raycaster.ray, _plane, this._panWorldStart );

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

		if ( rayIntersectPlane( _raycaster.ray, _plane, _panCurrent ) ) {

			vec3Sub( _panCurrent, this._panWorldStart, _panCurrent );
			vec3Copy( _panCurrent, this._panOffset );
			vec3Negate( this._panOffset, this._panOffset );

			this.update();

		}

	}

}

export { MapControls };
