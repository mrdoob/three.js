import { Camera } from './Camera.js';

/**
 * Camera that uses [orthographic projection]{@link https://en.wikipedia.org/wiki/Orthographic_projection}.
 *
 * In this projection mode, an object's size in the rendered image stays
 * constant regardless of its distance from the camera. This can be useful
 * for rendering 2D scenes and UI elements, amongst other things.
 *
 * ```js
 * const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
 * scene.add( camera );
 * ```
 *
 * @augments Camera
 */
class OrthographicCamera extends Camera {

	/**
	 * Constructs a new orthographic camera.
	 *
	 * @param {number} [left=-1] - The left plane of the camera's frustum.
	 * @param {number} [right=1] - The right plane of the camera's frustum.
	 * @param {number} [top=1] - The top plane of the camera's frustum.
	 * @param {number} [bottom=-1] - The bottom plane of the camera's frustum.
	 * @param {number} [near=0.1] - The camera's near plane.
	 * @param {number} [far=2000] - The camera's far plane.
	 */
	constructor( left = - 1, right = 1, top = 1, bottom = - 1, near = 0.1, far = 2000 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOrthographicCamera = true;

		this.type = 'OrthographicCamera';

		/**
		 * The zoom factor of the camera.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.zoom = 1;

		/**
		 * Represents the frustum window specification. This property should not be edited
		 * directly but via {@link PerspectiveCamera#setViewOffset} and {@link PerspectiveCamera#clearViewOffset}.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.view = null;

		/**
		 * The left plane of the camera's frustum.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.left = left;

		/**
		 * The right plane of the camera's frustum.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.right = right;

		/**
		 * The top plane of the camera's frustum.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.top = top;

		/**
		 * The bottom plane of the camera's frustum.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.bottom = bottom;

		/**
		 * The camera's near plane. The valid range is greater than `0`
		 * and less than the current value of {@link OrthographicCamera#far}.
		 *
		 * Note that, unlike for the {@link PerspectiveCamera}, `0` is a
		 * valid value for an orthographic camera's near plane.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.near = near;

		/**
		 * The camera's far plane. Must be greater than the
		 * current value of {@link OrthographicCamera#near}.
		 *
		 * @type {number}
		 * @default 2000
		 */
		this.far = far;

		this.updateProjectionMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		return this;

	}

	/**
	 * Sets an offset in a larger frustum. This is useful for multi-window or
	 * multi-monitor/multi-machine setups.
	 *
	 * @param {number} fullWidth - The full width of multiview setup.
	 * @param {number} fullHeight - The full height of multiview setup.
	 * @param {number} x - The horizontal offset of the subcamera.
	 * @param {number} y - The vertical offset of the subcamera.
	 * @param {number} width - The width of subcamera.
	 * @param {number} height - The height of subcamera.
	 * @see {@link PerspectiveCamera#setViewOffset}
	 */
	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

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

		const dx = ( this.right - this.left ) / ( 2 * this.zoom );
		const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		const cx = ( this.right + this.left ) / 2;
		const cy = ( this.top + this.bottom ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		if ( this.view !== null && this.view.enabled ) {

			const scaleW = ( this.right - this.left ) / this.view.fullWidth / this.zoom;
			const scaleH = ( this.top - this.bottom ) / this.view.fullHeight / this.zoom;

			left += scaleW * this.view.offsetX;
			right = left + scaleW * this.view.width;
			top -= scaleH * this.view.offsetY;
			bottom = top - scaleH * this.view.height;

		}

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far, this.coordinateSystem, this.reversedDepth );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		return data;

	}

}

export { OrthographicCamera };
