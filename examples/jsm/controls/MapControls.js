import { MOUSE, TOUCH } from 'three';

import { OrbitControls } from './OrbitControls.js';

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

	}

}

export { MapControls };
