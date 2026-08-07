import { DEG2RAD } from '../math/MathUtils.js';
import { mat4Copy, mat4Create, mat4Multiply } from '../math/Matrix4Functions.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';

const _eyeRight = /*@__PURE__*/ mat4Create();
const _eyeLeft = /*@__PURE__*/ mat4Create();
const _projectionMatrix = /*@__PURE__*/ mat4Create();

/**
 * A special type of camera that uses two perspective cameras with
 * stereoscopic projection. Can be used for rendering stereo effects
 * like [3D Anaglyph](https://en.wikipedia.org/wiki/Anaglyph_3D) or
 * [Parallax Barrier](https://en.wikipedia.org/wiki/parallax_barrier).
 */
class StereoCamera {

	/**
	 * Constructs a new stereo camera.
	 */
	constructor() {

		/**
		 * The type property is used for detecting the object type
		 * in context of serialization/deserialization.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.type = 'StereoCamera';

		/**
		 * The aspect.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aspect = 1;

		/**
		 * The eye separation which represents the distance
		 * between the left and right camera.
		 *
		 * @type {number}
		 * @default 0.064
		 */
		this.eyeSep = 0.064;

		/**
		 * The camera representing the left eye. This is added to layer `1` so objects to be
		 * rendered by the left camera must also be added to this layer.
		 *
		 * @type {PerspectiveCamera}
		 */
		this.cameraL = new PerspectiveCamera();
		this.cameraL.layers.enable( 1 );
		this.cameraL.matrixAutoUpdate = false;

		/**
		 * The camera representing the right eye. This is added to layer `2` so objects to be
		 * rendered by the right camera must also be added to this layer.
		 *
		 * @type {PerspectiveCamera}
		 */
		this.cameraR = new PerspectiveCamera();
		this.cameraR.layers.enable( 2 );
		this.cameraR.matrixAutoUpdate = false;

		this._cache = {
			focus: null,
			fov: null,
			aspect: null,
			near: null,
			far: null,
			zoom: null,
			eyeSep: null
		};

	}

	/**
	 * Updates the stereo camera based on the given perspective camera.
	 *
	 * @param {PerspectiveCamera} camera - The perspective camera.
	 */
	update( camera ) {

		const cache = this._cache;

		const needsUpdate = cache.focus !== camera.focus || cache.fov !== camera.fov ||
			cache.aspect !== camera.aspect * this.aspect || cache.near !== camera.near ||
			cache.far !== camera.far || cache.zoom !== camera.zoom || cache.eyeSep !== this.eyeSep;

		if ( needsUpdate ) {

			cache.focus = camera.focus;
			cache.fov = camera.fov;
			cache.aspect = camera.aspect * this.aspect;
			cache.near = camera.near;
			cache.far = camera.far;
			cache.zoom = camera.zoom;
			cache.eyeSep = this.eyeSep;

			// Off-axis stereoscopic effect based on
			// http://paulbourke.net/stereographics/stereorender/

			mat4Copy( camera.projectionMatrix, _projectionMatrix );
			const eyeSepHalf = cache.eyeSep / 2;
			const eyeSepOnProjection = eyeSepHalf * cache.near / cache.focus;
			const ymax = ( cache.near * Math.tan( DEG2RAD * cache.fov * 0.5 ) ) / cache.zoom;
			let xmin, xmax;

			// translate xOffset

			_eyeLeft.elements[ 12 ] = - eyeSepHalf;
			_eyeRight.elements[ 12 ] = eyeSepHalf;

			// for left eye

			xmin = - ymax * cache.aspect + eyeSepOnProjection;
			xmax = ymax * cache.aspect + eyeSepOnProjection;

			_projectionMatrix.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			mat4Copy( _projectionMatrix, this.cameraL.projectionMatrix );

			// for right eye

			xmin = - ymax * cache.aspect - eyeSepOnProjection;
			xmax = ymax * cache.aspect - eyeSepOnProjection;

			_projectionMatrix.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			mat4Copy( _projectionMatrix, this.cameraR.projectionMatrix );

		}

		mat4Multiply( camera.matrixWorld, _eyeLeft, this.cameraL.matrix );
		this.cameraL.matrixWorldNeedsUpdate = true;

		mat4Multiply( camera.matrixWorld, _eyeRight, this.cameraR.matrix );
		this.cameraR.matrixWorldNeedsUpdate = true;

	}

}

export { StereoCamera };
