import { Vector3 } from './Vector3.js';
import {
	planeApplyMatrix4,
	planeCoplanarPoint,
	planeCopy,
	planeDistanceToPoint,
	planeDistanceToSphere,
	planeEquals,
	planeFromJSON,
	planeIntersectLine,
	planeIntersectsBox,
	planeIntersectsLine,
	planeIntersectsSphere,
	planeNegate,
	planeNormalize,
	planeProjectPoint,
	planeSet,
	planeSetComponents,
	planeSetFromCoplanarPoints,
	planeSetFromNormalAndCoplanarPoint,
	planeToJSON,
	planeTranslate
} from './PlaneFunctions.js';

/**
 * A two dimensional surface that extends infinitely in 3D space, represented
 * in [Hessian normal form](http://mathworld.wolfram.com/HessianNormalForm.html)
 * by a unit length normal vector and a constant.
 *
 * `Plane` is a thin, backwards-compatible wrapper around the standalone,
 * tree-shakeable `plane*` functions in {@link PlaneFunctions}, which operate
 * on any {@link PlaneLike} object. Prefer importing those functions
 * directly if you only need a handful of operations and want unused ones
 * eliminated from your bundle.
 */
class Plane {

	/**
	 * This flag can be used for type testing.
	 *
	 * @type {boolean}
	 * @readonly
	 * @default true
	 */
	get isPlane() {

		return true;

	}

	/**
	 * Constructs a new plane.
	 *
	 * @param {Vector3} [normal=(1,0,0)] - A unit length vector defining the normal of the plane.
	 * @param {number} [constant=0] - The signed distance from the origin to the plane.
	 */
	constructor( normal = new Vector3( 1, 0, 0 ), constant = 0 ) {

		/**
		 * A unit length vector defining the normal of the plane.
		 *
		 * @type {Vector3}
		 */
		this.normal = normal;

		/**
		 * The signed distance from the origin to the plane.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.constant = constant;

	}

	/**
	 * Sets the plane components by copying the given values.
	 *
	 * @param {Vector3} normal - The normal.
	 * @param {number} constant - The constant.
	 * @return {Plane} A reference to this plane.
	 */
	set( normal, constant ) {

		return planeSet( normal, constant, this );

	}

	/**
	 * Sets the plane components by defining `x`, `y`, `z` as the
	 * plane normal and `w` as the constant.
	 *
	 * @param {number} x - The value for the normal's x component.
	 * @param {number} y - The value for the normal's y component.
	 * @param {number} z - The value for the normal's z component.
	 * @param {number} w - The constant value.
	 * @return {Plane} A reference to this plane.
	 */
	setComponents( x, y, z, w ) {

		return planeSetComponents( x, y, z, w, this );

	}

	/**
	 * Sets the plane from the given normal and coplanar point (that is a point
	 * that lies onto the plane).
	 *
	 * @param {Vector3} normal - The normal.
	 * @param {Vector3} point - A coplanar point.
	 * @return {Plane} A reference to this plane.
	 */
	setFromNormalAndCoplanarPoint( normal, point ) {

		return planeSetFromNormalAndCoplanarPoint( normal, point, this );

	}

	/**
	 * Sets the plane from three coplanar points. The winding order is
	 * assumed to be counter-clockwise, and determines the direction of
	 * the plane normal.
	 *
	 * @param {Vector3} a - The first coplanar point.
	 * @param {Vector3} b - The second coplanar point.
	 * @param {Vector3} c - The third coplanar point.
	 * @return {Plane} A reference to this plane.
	 */
	setFromCoplanarPoints( a, b, c ) {

		return planeSetFromCoplanarPoints( a, b, c, this );

	}

	/**
	 * Copies the values of the given plane to this instance.
	 *
	 * @param {Plane} plane - The plane to copy.
	 * @return {Plane} A reference to this plane.
	 */
	copy( plane ) {

		return planeCopy( plane, this );

	}

	/**
	 * Normalizes the plane normal and adjusts the constant accordingly.
	 *
	 * @return {Plane} A reference to this plane.
	 */
	normalize() {

		return planeNormalize( this, this );

	}

	/**
	 * Negates both the plane normal and the constant.
	 *
	 * @return {Plane} A reference to this plane.
	 */
	negate() {

		return planeNegate( this, this );

	}

	/**
	 * Returns the signed distance from the given point to this plane.
	 *
	 * @param {Vector3} point - The point to compute the distance for.
	 * @return {number} The signed distance.
	 */
	distanceToPoint( point ) {

		return planeDistanceToPoint( this, point );

	}

	/**
	 * Returns the signed distance from the given sphere to this plane.
	 *
	 * @param {Sphere} sphere - The sphere to compute the distance for.
	 * @return {number} The signed distance.
	 */
	distanceToSphere( sphere ) {

		return planeDistanceToSphere( this, sphere );

	}

	/**
	 * Projects a the given point onto the plane.
	 *
	 * @param {Vector3} point - The point to project.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The projected point on the plane.
	 */
	projectPoint( point, target ) {

		return planeProjectPoint( this, point, target );

	}

	/**
	 * Returns the intersection point of the passed line and the plane. Returns
	 * `null` if the line does not intersect. Returns the line's starting point if
	 * the line is coplanar with the plane.
	 *
	 * @param {Line3} line - The line to compute the intersection for.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @param {boolean} [clampToLine=true] - Whether to clamp the intersection to the line segment.
	 * @return {?Vector3} The intersection point. Returns `null` if no intersection is detected.
	 */
	intersectLine( line, target, clampToLine = true ) {

		return planeIntersectLine( this, line, target, clampToLine );

	}

	/**
	 * Returns `true` if the given line segment intersects with (passes through) the plane.
	 *
	 * @param {Line3} line - The line to test.
	 * @return {boolean} Whether the given line segment intersects with the plane or not.
	 */
	intersectsLine( line ) {

		return planeIntersectsLine( this, line );

	}

	/**
	 * Returns `true` if the given bounding box intersects with the plane.
	 *
	 * @param {Box3} box - The bounding box to test.
	 * @return {boolean} Whether the given bounding box intersects with the plane or not.
	 */
	intersectsBox( box ) {

		return planeIntersectsBox( this, box );

	}

	/**
	 * Returns `true` if the given bounding sphere intersects with the plane.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @return {boolean} Whether the given bounding sphere intersects with the plane or not.
	 */
	intersectsSphere( sphere ) {

		return planeIntersectsSphere( this, sphere );

	}

	/**
	 * Returns a coplanar vector to the plane, by calculating the
	 * projection of the normal at the origin onto the plane.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The coplanar point.
	 */
	coplanarPoint( target ) {

		return planeCoplanarPoint( this, target );

	}

	/**
	 * Apply a 4x4 matrix to the plane. The matrix must be an affine, homogeneous transform.
	 *
	 * The optional normal matrix can be pre-computed like so:
	 * ```js
	 * const optionalNormalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );
	 * ```
	 *
	 * @param {Matrix4} matrix - The transformation matrix.
	 * @param {Matrix4} [optionalNormalMatrix] - A pre-computed normal matrix.
	 * @return {Plane} A reference to this plane.
	 */
	applyMatrix4( matrix, optionalNormalMatrix ) {

		return planeApplyMatrix4( this, matrix, optionalNormalMatrix, this );

	}

	/**
	 * Translates the plane by the distance defined by the given offset vector.
	 * Note that this only affects the plane constant and will not affect the normal vector.
	 *
	 * @param {Vector3} offset - The offset vector.
	 * @return {Plane} A reference to this plane.
	 */
	translate( offset ) {

		return planeTranslate( this, offset, this );

	}

	/**
	 * Returns `true` if this plane is equal with the given one.
	 *
	 * @param {Plane} plane - The plane to test for equality.
	 * @return {boolean} Whether this plane is equal with the given one.
	 */
	equals( plane ) {

		return planeEquals( this, plane );

	}

	/**
	 * Returns a new plane with copied values from this instance.
	 *
	 * @return {Plane} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Returns a serialized structure of the plane.
	 *
	 * @return {Object} Serialized structure with fields representing the object state.
	 */
	toJSON() {

		return planeToJSON( this );

	}

	/**
	 * Sets the plane properties from the given JSON.
	 *
	 * @param {Object} json - The serialized json to set the plane from.
	 * @return {Plane} A reference to this plane.
	 */
	fromJSON( json ) {

		return planeFromJSON( json, this );

	}

}

export { Plane };
