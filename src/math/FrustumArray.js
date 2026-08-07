import { WebGLCoordinateSystem } from '../constants.js';
import {
	frustumContainsPoint,
	frustumCopy,
	frustumCreate,
	frustumIntersectsBox,
	frustumIntersectsObject,
	frustumIntersectsSphere,
	frustumIntersectsSprite,
	frustumSetFromProjectionMatrix
} from './FrustumFunctions.js';
import { mat4Create, mat4MultiplyMatrices } from './Matrix4Functions.js';

const _projScreenMatrix = /*@__PURE__*/ mat4Create();

/**
 * FrustumArray is used to determine if an object is visible in at least one camera
 * from an array of cameras. This is particularly useful for multi-view renderers.
*/
class FrustumArray {

	/**
	 * Constructs a new frustum array.
	 *
	 */
	constructor() {

		/**
		 * The coordinate system to use.
		 *
		 * @type {WebGLCoordinateSystem|WebGPUCoordinateSystem}
		 * @default WebGLCoordinateSystem
		 */
		this.coordinateSystem = WebGLCoordinateSystem;

		/**
		 * A pool of frustum instances. It may hold more entries than are
		 * currently in use; surplus instances are kept for reuse to avoid
		 * reallocating when array cameras of different lengths are rendered.
		 *
		 * @private
		 * @type {Array<Frustum>}
		 */
		this._frustums = [];

		/**
		 * The number of frustums in {@link FrustumArray#_frustums} that are currently
		 * in use.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._count = 0;

	}

	/**
	 * Computes and caches a frustum for each camera of the given array camera.
	 *
	 * @param {ArrayCamera} cameraArray - The array camera whose sub-cameras define the frustums.
	 * @return {FrustumArray} A reference to this frustum array.
	 */
	setFromArrayCamera( cameraArray ) {

		const cameras = cameraArray.cameras;
		const frustums = this._frustums;

		for ( let i = 0; i < cameras.length; i ++ ) {

			const camera = cameras[ i ];

			mat4MultiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse, _projScreenMatrix );

			if ( frustums[ i ] === undefined ) frustums[ i ] = frustumCreate();

			frustumSetFromProjectionMatrix( _projScreenMatrix, camera.coordinateSystem, camera.reversedDepth, frustums[ i ] );

		}

		this._count = cameras.length;

		return this;

	}

	/**
	 * Returns `true` if the 3D object's bounding sphere is intersecting any cached frustum.
	 *
	 * {@link FrustumArray#setFromArrayCamera} must be called once per render before this method.
	 *
	 * @param {Object3D} object - The 3D object to test.
	 * @return {boolean} Whether the 3D object is visible in any camera.
	 */
	intersectsObject( object ) {

		const frustums = this._frustums;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( frustumIntersectsObject( frustums[ i ], object ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given sprite is intersecting any cached frustum.
	 *
	 * {@link FrustumArray#setFromArrayCamera} must be called once per render before this method.
	 *
	 * @param {Sprite} sprite - The sprite to test.
	 * @return {boolean} Whether the sprite is visible in any camera.
	 */
	intersectsSprite( sprite ) {

		const frustums = this._frustums;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( frustumIntersectsSprite( frustums[ i ], sprite ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given bounding sphere is intersecting any cached frustum.
	 *
	 * {@link FrustumArray#setFromArrayCamera} must be called once per render before this method.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @return {boolean} Whether the sphere is visible in any camera.
	 */
	intersectsSphere( sphere ) {

		const frustums = this._frustums;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( frustumIntersectsSphere( frustums[ i ], sphere ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given bounding box is intersecting any cached frustum.
	 *
	 * {@link FrustumArray#setFromArrayCamera} must be called once per render before this method.
	 *
	 * @param {Box3} box - The bounding box to test.
	 * @return {boolean} Whether the box is visible in any camera.
	 */
	intersectsBox( box ) {

		const frustums = this._frustums;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( frustumIntersectsBox( frustums[ i ], box ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given point lies within any cached frustum.
	 *
	 * {@link FrustumArray#setFromArrayCamera} must be called once per render before this method.
	 *
	 * @param {Vector3} point - The point to test.
	 * @return {boolean} Whether the point is visible in any camera.
	 */
	containsPoint( point ) {

		const frustums = this._frustums;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( frustumContainsPoint( frustums[ i ], point ) ) return true;

		}

		return false;

	}

	/**
	 * Copies the values of the given frustum array to this instance.
	 *
	 * @param {FrustumArray} frustumArray - The frustum array to copy.
	 * @return {FrustumArray} A reference to this frustum array.
	 */
	copy( source ) {

		this.coordinateSystem = source.coordinateSystem;

		const frustums = this._frustums;
		const sourceFrustums = source._frustums;

		for ( let i = 0; i < source._count; i ++ ) {

			if ( frustums[ i ] === undefined ) frustums[ i ] = frustumCreate();

			frustumCopy( sourceFrustums[ i ], frustums[ i ] );

		}

		this._count = source._count;

		return this;

	}

	/**
	 * Returns a new frustum array with copied values from this instance.
	 *
	 * @return {FrustumArray} A clone of this instance.
	 */
	clone() {

		return new FrustumArray().copy( this );

	}

}

export { FrustumArray };
