import { PerspectiveCamera } from './PerspectiveCamera.js';

/**
 * This type of camera can be used in order to efficiently render a scene with a
 * predefined set of cameras. This is an important performance aspect for
 * rendering VR scenes.
 *
 * An instance of `ArrayCamera` always has an array of sub cameras. It's mandatory
 * to define for each sub camera the `viewport` property which determines the
 * part of the viewport that is rendered with this camera.
 *
 * @augments PerspectiveCamera
 */
class ArrayCamera extends PerspectiveCamera {

	/**
	 * Constructs a new array camera.
	 *
	 * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
	 */
	constructor( array = [] ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayCamera = true;

		/**
		 * Whether this camera is used with multiview rendering or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isMultiViewCamera = false;

		/**
		 * An array of perspective sub cameras.
		 *
		 * @type {Array<PerspectiveCamera>}
		 */
		this.cameras = array;

	}

}

export { ArrayCamera };
