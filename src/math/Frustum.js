import { WebGLCoordinateSystem } from '../constants.js';
import { Plane } from './Plane.js';
import {
	frustumContainsPoint,
	frustumCopy,
	frustumIntersectsBox,
	frustumIntersectsObject,
	frustumIntersectsSphere,
	frustumIntersectsSprite,
	frustumSet,
	frustumSetFromProjectionMatrix
} from './FrustumFunctions.js';

/**
 * Frustums are used to determine what is inside the camera's field of view.
 * They help speed up the rendering process - objects which lie outside a camera's
 * frustum can safely be excluded from rendering.
 *
 * This class is mainly intended for use internally by a renderer.
 *
 * `Frustum` is a thin, backwards-compatible wrapper around the standalone,
 * tree-shakeable `frustum*` functions in {@link FrustumFunctions}, which operate
 * on any {@link FrustumLike} object. Prefer importing those functions
 * directly if you only need a handful of operations and want unused ones
 * eliminated from your bundle.
 */
class Frustum {

	/**
	 * Constructs a new frustum.
	 *
	 * @param {Plane} [p0] - The first plane that encloses the frustum.
	 * @param {Plane} [p1] - The second plane that encloses the frustum.
	 * @param {Plane} [p2] - The third plane that encloses the frustum.
	 * @param {Plane} [p3] - The fourth plane that encloses the frustum.
	 * @param {Plane} [p4] - The fifth plane that encloses the frustum.
	 * @param {Plane} [p5] - The sixth plane that encloses the frustum.
	 */
	constructor( p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane() ) {

		/**
		 * This array holds the planes that enclose the frustum.
		 *
		 * @type {Array<Plane>}
		 */
		this.planes = [ p0, p1, p2, p3, p4, p5 ];

	}

	/**
	 * Sets the frustum planes by copying the given planes.
	 *
	 * @param {Plane} [p0] - The first plane that encloses the frustum.
	 * @param {Plane} [p1] - The second plane that encloses the frustum.
	 * @param {Plane} [p2] - The third plane that encloses the frustum.
	 * @param {Plane} [p3] - The fourth plane that encloses the frustum.
	 * @param {Plane} [p4] - The fifth plane that encloses the frustum.
	 * @param {Plane} [p5] - The sixth plane that encloses the frustum.
	 * @return {Frustum} A reference to this frustum.
	 */
	set( p0, p1, p2, p3, p4, p5 ) {

		return frustumSet( p0, p1, p2, p3, p4, p5, this );

	}

	/**
	 * Copies the values of the given frustum to this instance.
	 *
	 * @param {Frustum} frustum - The frustum to copy.
	 * @return {Frustum} A reference to this frustum.
	 */
	copy( frustum ) {

		return frustumCopy( frustum, this );

	}

	/**
	 * Sets the frustum planes from the given projection matrix.
	 *
	 * @param {Matrix4} m - The projection matrix.
	 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} coordinateSystem - The coordinate system.
	 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
	 * @return {Frustum} A reference to this frustum.
	 */
	setFromProjectionMatrix( m, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false ) {

		return frustumSetFromProjectionMatrix( m, coordinateSystem, reversedDepth, this );

	}

	/**
	 * Returns `true` if the 3D object's bounding sphere is intersecting this frustum.
	 *
	 * Note that the 3D object must have a geometry so that the bounding sphere can be calculated.
	 *
	 * @param {Object3D} object - The 3D object to test.
	 * @return {boolean} Whether the 3D object's bounding sphere is intersecting this frustum or not.
	 */
	intersectsObject( object ) {

		return frustumIntersectsObject( this, object );

	}

	/**
	 * Returns `true` if the given sprite is intersecting this frustum.
	 *
	 * @param {Sprite} sprite - The sprite to test.
	 * @return {boolean} Whether the sprite is intersecting this frustum or not.
	 */
	intersectsSprite( sprite ) {

		return frustumIntersectsSprite( this, sprite );

	}

	/**
	 * Returns `true` if the given bounding sphere is intersecting this frustum.
	 *
	 * This is a fast, conservative test that favors performance over precision. It can
	 * report false positives for spheres that lie outside the frustum but are not separated
	 * by a single frustum plane. It never reports false negatives, so it is safe for culling.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @return {boolean} Whether the bounding sphere is intersecting this frustum or not.
	 */
	intersectsSphere( sphere ) {

		return frustumIntersectsSphere( this, sphere );

	}

	/**
	 * Returns `true` if the given bounding box is intersecting this frustum.
	 *
	 * This is a fast, conservative test that favors performance over precision. It can
	 * report false positives for large boxes that lie outside the frustum but are not
	 * separated by a single frustum plane. It never reports false negatives, so it is
	 * safe for culling.
	 *
	 * @param {Box3} box - The bounding box to test.
	 * @return {boolean} Whether the bounding box is intersecting this frustum or not.
	 */
	intersectsBox( box ) {

		return frustumIntersectsBox( this, box );

	}

	/**
	 * Returns `true` if the given point lies within the frustum.
	 *
	 * @param {Vector3} point - The point to test.
	 * @return {boolean} Whether the point lies within this frustum or not.
	 */
	containsPoint( point ) {

		return frustumContainsPoint( this, point );

	}

	/**
	 * Returns a new frustum with copied values from this instance.
	 *
	 * @return {Frustum} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}


export { Frustum };
