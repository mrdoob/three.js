import { Camera } from './Camera';

/**
 * Camera with orthographic projection
 *
 * @example
 * var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
 * scene.add( camera );
 *
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/cameras/OrthographicCamera.js">src/cameras/OrthographicCamera.js</a>
 */
export class OrthographicCamera extends Camera {

	/**
   * @param left Camera frustum left plane.
   * @param right Camera frustum right plane.
   * @param top Camera frustum top plane.
   * @param bottom Camera frustum bottom plane.
   * @param near Camera frustum near plane.
   * @param far Camera frustum far plane.
   */
	constructor(
		left: number,
		right: number,
		top: number,
		bottom: number,
		near?: number,
		far?: number
	);

	type: 'OrthographicCamera';

	isOrthographicCamera: true;

	zoom: number;
	view: null | {
		enabled: boolean;
		fullWidth: number;
		fullHeight: number;
		offsetX: number;
		offsetY: number;
		width: number;
		height: number;
	};

	/**
   * Camera frustum left plane.
   */
	left: number;

	/**
   * Camera frustum right plane.
   */
	right: number;

	/**
   * Camera frustum top plane.
   */
	top: number;

	/**
   * Camera frustum bottom plane.
   */
	bottom: number;

	/**
   * Camera frustum near plane.
   */
	near: number;

	/**
   * Camera frustum far plane.
   */
	far: number;

	/**
   * Updates the camera projection matrix. Must be called after change of parameters.
   */
	updateProjectionMatrix(): void;
	setViewOffset(
		fullWidth: number,
		fullHeight: number,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number
	): void;
	clearViewOffset(): void;
	toJSON( meta?: any ): any;

}
