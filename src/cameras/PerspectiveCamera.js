import { Camera } from './Camera.js';
import { RAD2DEG, DEG2RAD } from '../math/MathUtils.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';

const _v3 = /*@__PURE__*/ new Vector3();
const _minTarget = /*@__PURE__*/ new Vector2();
const _maxTarget = /*@__PURE__*/ new Vector2();

/**
 * Camera that uses [perspective projection]{@link https://en.wikipedia.org/wiki/Perspective_(graphical)}.
 *
 * This projection mode is designed to mimic the way the human eye sees. It
 * is the most common projection mode used for rendering a 3D scene.
 *
 * ```js
 * const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
 * scene.add( camera );
 * ```
 *
 * @augments Camera
 */
class PerspectiveCamera extends Camera {

	/**
	 * Constructs a new perspective camera.
	 *
	 * @param {number} [fov=50] - The vertical field of view.
	 * @param {number} [aspect=1] - The aspect ratio.
	 * @param {number} [near=0.1] - The camera's near plane.
	 * @param {number} [far=2000] - The camera's far plane.
	 */
	constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPerspectiveCamera = true;

		this.type = 'PerspectiveCamera';

		/**
		 * The vertical field of view, from bottom to top of view,
		 * in degrees.
		 *
		 * @type {number}
		 * @default 50
		 */
		this.fov = fov;

		/**
		 * The zoom factor of the camera.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.zoom = 1;

		/**
		 * The camera's near plane. The valid range is greater than `0`
		 * and less than the current value of {@link PerspectiveCamera#far}.
		 *
		 * Note that, unlike for the {@link OrthographicCamera}, `0` is <em>not</em> a
		 * valid value for a perspective camera's near plane.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.near = near;

		/**
		 * The camera's far plane. Must be greater than the
		 * current value of {@link PerspectiveCamera#near}.
		 *
		 * @type {number}
		 * @default 2000
		 */
		this.far = far;

		/**
		 * Object distance used for stereoscopy and depth-of-field effects. This
		 * parameter does not influence the projection matrix unless a
		 * {@link StereoCamera} is being used.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.focus = 10;

		/**
		 * The aspect ratio, usually the canvas width / canvas height.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aspect = aspect;

		/**
		 * Represents the frustum window specification. This property should not be edited
		 * directly but via {@link PerspectiveCamera#setViewOffset} and {@link PerspectiveCamera#clearViewOffset}.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.view = null;

		/**
		 * Film size used for the larger axis. Default is `35` (millimeters). This
		 * parameter does not influence the projection matrix unless {@link PerspectiveCamera#filmOffset}
		 * is set to a nonzero value.
		 *
		 * @type {number}
		 * @default 35
		 */
		this.filmGauge = 35;

		/**
		 * Horizontal off-center offset in the same unit as {@link PerspectiveCamera#filmGauge}.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.filmOffset = 0;

		this.updateProjectionMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.fov = source.fov;
		this.zoom = source.zoom;

		this.near = source.near;
		this.far = source.far;
		this.focus = source.focus;

		this.aspect = source.aspect;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		this.filmGauge = source.filmGauge;
		this.filmOffset = source.filmOffset;

		return this;

	}

	/**
	 * Sets the FOV by focal length in respect to the current {@link PerspectiveCamera#filmGauge}.
	 *
	 * The default film gauge is 35, so that the focal length can be specified for
	 * a 35mm (full frame) camera.
	 *
	 * @param {number} focalLength - Values for focal length and film gauge must have the same unit.
	 */
	setFocalLength( focalLength ) {

		/** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
		const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

		this.fov = RAD2DEG * 2 * Math.atan( vExtentSlope );
		this.updateProjectionMatrix();

	}

	/**
	 * Returns the focal length from the current {@link PerspectiveCamera#fov} and
	 * {@link PerspectiveCamera#filmGauge}.
	 *
	 * @return {number} The computed focal length.
	 */
	getFocalLength() {

		const vExtentSlope = Math.tan( DEG2RAD * 0.5 * this.fov );

		return 0.5 * this.getFilmHeight() / vExtentSlope;

	}

	/**
	 * Returns the current vertical field of view angle in degrees considering {@link PerspectiveCamera#zoom}.
	 *
	 * @return {number} The effective FOV.
	 */
	getEffectiveFOV() {

		return RAD2DEG * 2 * Math.atan(
			Math.tan( DEG2RAD * 0.5 * this.fov ) / this.zoom );

	}

	/**
	 * Returns the width of the image on the film. If {@link PerspectiveCamera#aspect} is greater than or
	 * equal to one (landscape format), the result equals {@link PerspectiveCamera#filmGauge}.
	 *
	 * @return {number} The film width.
	 */
	getFilmWidth() {

		// film not completely covered in portrait format (aspect < 1)
		return this.filmGauge * Math.min( this.aspect, 1 );

	}

	/**
	 * Returns the height of the image on the film. If {@link PerspectiveCamera#aspect} is greater than or
	 * equal to one (landscape format), the result equals {@link PerspectiveCamera#filmGauge}.
	 *
	 * @return {number} The film width.
	 */
	getFilmHeight() {

		// film not completely covered in landscape format (aspect > 1)
		return this.filmGauge / Math.max( this.aspect, 1 );

	}

	/**
	 * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
	 * Sets `minTarget` and `maxTarget` to the coordinates of the lower-left and upper-right corners of the view rectangle.
	 *
	 * @param {number} distance - The viewing distance.
	 * @param {Vector2} minTarget - The lower-left corner of the view rectangle is written into this vector.
	 * @param {Vector2} maxTarget - The upper-right corner of the view rectangle is written into this vector.
	 */
	getViewBounds( distance, minTarget, maxTarget ) {

		_v3.set( - 1, - 1, 0.5 ).applyMatrix4( this.projectionMatrixInverse );

		minTarget.set( _v3.x, _v3.y ).multiplyScalar( - distance / _v3.z );

		_v3.set( 1, 1, 0.5 ).applyMatrix4( this.projectionMatrixInverse );

		maxTarget.set( _v3.x, _v3.y ).multiplyScalar( - distance / _v3.z );

	}

	/**
	 * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
	 *
	 * @param {number} distance - The viewing distance.
	 * @param {Vector2} target - The target vector that is used to store result where x is width and y is height.
	 * @returns {Vector2} The view size.
	 */
	getViewSize( distance, target ) {

		this.getViewBounds( distance, _minTarget, _maxTarget );

		return target.subVectors( _maxTarget, _minTarget );

	}

	/**
	 * Sets an offset in a larger frustum. This is useful for multi-window or
	 * multi-monitor/multi-machine setups.
	 *
	 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
	 * the monitors are in grid like this
	 *```
	 *   +---+---+---+
	 *   | A | B | C |
	 *   +---+---+---+
	 *   | D | E | F |
	 *   +---+---+---+
	 *```
	 * then for each monitor you would call it like this:
	 *```js
	 * const w = 1920;
	 * const h = 1080;
	 * const fullWidth = w * 3;
	 * const fullHeight = h * 2;
	 *
	 * // --A--
	 * camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
	 * // --B--
	 * camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
	 * // --C--
	 * camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
	 * // --D--
	 * camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
	 * // --E--
	 * camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
	 * // --F--
	 * camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
	 * ```
	 *
	 * Note there is no reason monitors have to be the same size or in a grid.
	 *
	 * @param {number} fullWidth - The full width of multiview setup.
	 * @param {number} fullHeight - The full height of multiview setup.
	 * @param {number} x - The horizontal offset of the subcamera.
	 * @param {number} y - The vertical offset of the subcamera.
	 * @param {number} width - The width of subcamera.
	 * @param {number} height - The height of subcamera.
	 */
	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		this.aspect = fullWidth / fullHeight;

		if ( this.view === null ) {

			this.view = {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			};

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

		this.updateProjectionMatrix();

	}

	/**
	 * Removes the view offset from the projection matrix.
	 */
	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

		this.updateProjectionMatrix();

	}

	/**
	 * Updates the camera's projection matrix. Must be called after any change of
	 * camera properties.
	 */
	updateProjectionMatrix() {

		const near = this.near;
		let top = near * Math.tan( DEG2RAD * 0.5 * this.fov ) / this.zoom;
		let height = 2 * top;
		let width = this.aspect * height;
		let left = - 0.5 * width;
		const view = this.view;

		if ( this.view !== null && this.view.enabled ) {

			const fullWidth = view.fullWidth,
				fullHeight = view.fullHeight;

			left += view.offsetX * width / fullWidth;
			top -= view.offsetY * height / fullHeight;
			width *= view.width / fullWidth;
			height *= view.height / fullHeight;

		}

		const skew = this.filmOffset;
		if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

		this.projectionMatrix.makePerspective( left, left + width, top, top - height, near, this.far, this.coordinateSystem );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.fov = this.fov;
		data.object.zoom = this.zoom;

		data.object.near = this.near;
		data.object.far = this.far;
		data.object.focus = this.focus;

		data.object.aspect = this.aspect;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		data.object.filmGauge = this.filmGauge;
		data.object.filmOffset = this.filmOffset;

		return data;

	}

}

export { PerspectiveCamera };
