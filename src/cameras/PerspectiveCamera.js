import { Camera } from './Camera.js';
import * as MathUtils from '../math/MathUtils.js';

class PerspectiveCamera extends Camera {

	constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 ) {

		super();

		this.type = 'PerspectiveCamera';

		this.fov = fov;
		this.zoom = 1;

		this.near = near;
		this.far = far;
		this.focus = 10;

		this.aspect = aspect;

		this.filmGauge = 35;	// width of the film (default in millimeters)
		this.filmOffset = 0;	// horizontal film offset (same unit as gauge)

		this.view = null;

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
	 * Sets the FOV by focal length in respect to the current .filmGauge.
	 *
	 * The default film gauge is 35, so that the focal length can be specified for
	 * a 35mm (full frame) camera.
	 *
	 * Values for focal length and film gauge must have the same unit.
	 */
	setFocalLength( focalLength ) {

		/** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
		const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

		this.fov = MathUtils.RAD2DEG * 2 * Math.atan( vExtentSlope );
		this.updateProjectionMatrix();

	}

	/**
	 * Calculates the focal length from the current .fov and .filmGauge.
	 */
	getFocalLength() {

		const vExtentSlope = Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov );

		return 0.5 * this.getFilmHeight() / vExtentSlope;

	}

	getEffectiveFOV() {

		return MathUtils.RAD2DEG * 2 * Math.atan(
			Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom );

	}

	getFilmWidth() {

		// film not completely covered in portrait format (aspect < 1)
		return this.filmGauge * Math.min( this.aspect, 1 );

	}

	getFilmHeight() {

		// film not completely covered in landscape format (aspect > 1)
		return this.filmGauge / Math.max( this.aspect, 1 );

	}

	/**
	 * Sets an offset in a larger frustum. This is useful for multi-window or
	 * multi-monitor/multi-machine setups.
	 *
	 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
	 * the monitors are in grid like this
	 *
	 *   +---+---+---+
	 *   | A | B | C |
	 *   +---+---+---+
	 *   | D | E | F |
	 *   +---+---+---+
	 *
	 * then for each monitor you would call it like this
	 *
	 *   const w = 1920;
	 *   const h = 1080;
	 *   const fullWidth = w * 3;
	 *   const fullHeight = h * 2;
	 *
	 *   --A--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
	 *   --B--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
	 *   --C--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
	 *   --D--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
	 *   --E--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
	 *   --F--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
	 *
	 *   Note there is no reason monitors have to be the same size or in a grid.
	 */
	 setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		this.aspect = fullWidth / fullHeight;

		if ( this.view === null ) {

			const scope = this;

			const viewHandler = {
				set: function ( target, property, value ) {

					scope.clearProjectionOffset();

					target[ property ] = value;

					if ( target.enabled ) {

						// calculate projection offset
						const { fullWidth, fullHeight, offsetX, offsetY, width, height } = target;
						const { right, left, top, bottom } = scope.projectionParams;
						const projectionHeight = top - bottom;
						const projectionwidth = right - left;

						const leftOffset = offsetX * projectionwidth / fullWidth;
						const rightOffset = left + leftOffset + projectionwidth * width / fullWidth - right;
						const topOffset = - offsetY * projectionHeight / fullHeight;
						const bottomOffset = top + topOffset - projectionHeight * height / fullHeight - bottom;

						scope.setProjectionOffset( rightOffset, leftOffset, topOffset, bottomOffset );

					}

					return true;

				},
			};

			this.view = new Proxy( {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			}, viewHandler );

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

	}

	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

	}

	setProjectionOffset( right, left, top, bottom ) {

		this.projectionOffset = {
			right,
			left,
			top,
			bottom,
		};

		this.updateProjectionMatrix();

	}

	clearProjectionOffset() {

		this.projectionOffset = {
			right: 0,
			left: 0,
			top: 0,
			bottom: 0,
		};

		this.updateProjectionMatrix();

	}

	updateProjectionMatrix() {

		const near = this.near;
		let top = near * Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom;
		const height = 2 * top;
		const width = this.aspect * height;
		let left = - 0.5 * width;

		left += near * this.filmOffset / this.getFilmWidth();

		let right = left + width;
		let bottom = top - height;

		const projectionOffset = this.projectionOffset;
		top += projectionOffset.top;
		bottom += projectionOffset.bottom;
		left += projectionOffset.left;
		right += projectionOffset.right;

		this.projectionMatrix.makePerspective( left, right, top, bottom, near, this.far );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

		this.projectionParams.right = right;
		this.projectionParams.left = left;
		this.projectionParams.top = top;
		this.projectionParams.bottom = bottom;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.fov = this.fov;
		data.object.zoom = this.zoom;

		data.object.near = this.near;
		data.object.far = this.far;
		data.object.focus = this.focus;

		data.object.aspect = this.aspect;

		if ( this.view !== null ) data.object.view = { ...this.view };
		data.object.projectionOffset = { ...this.projectionOffset };

		data.object.filmGauge = this.filmGauge;
		data.object.filmOffset = this.filmOffset;

		return data;

	}

}

PerspectiveCamera.prototype.isPerspectiveCamera = true;

export { PerspectiveCamera };
