import { Vector3 } from './Vector3.js';
import {
	triangleClosestPointToPoint,
	triangleContainsPoint,
	triangleCopy,
	triangleEquals,
	triangleGetArea,
	triangleGetBarycoord,
	triangleGetInterpolatedAttribute,
	triangleGetInterpolation,
	triangleGetMidpoint,
	triangleGetNormal,
	triangleGetPlane,
	triangleIntersectsBox,
	triangleIsFrontFacing,
	triangleSet,
	triangleSetFromAttributeAndIndices,
	triangleSetFromPointsAndIndices
} from './TriangleFunctions.js';

/**
 * A geometric triangle as defined by three vectors representing its three corners.
 *
 * `Triangle` is a thin, backwards-compatible wrapper around the standalone,
 * tree-shakeable `triangle*` functions in {@link TriangleFunctions}, which operate
 * on any {@link TriangleLike} object. Prefer importing those functions
 * directly if you only need a handful of operations and want unused ones
 * eliminated from your bundle.
 */
class Triangle {

	/**
	 * Constructs a new triangle.
	 *
	 * @param {Vector3} [a=(0,0,0)] - The first corner of the triangle.
	 * @param {Vector3} [b=(0,0,0)] - The second corner of the triangle.
	 * @param {Vector3} [c=(0,0,0)] - The third corner of the triangle.
	 */
	constructor( a = new Vector3(), b = new Vector3(), c = new Vector3() ) {

		/**
		 * The first corner of the triangle.
		 *
		 * @type {Vector3}
		 */
		this.a = a;

		/**
		 * The second corner of the triangle.
		 *
		 * @type {Vector3}
		 */
		this.b = b;

		/**
		 * The third corner of the triangle.
		 *
		 * @type {Vector3}
		 */
		this.c = c;

	}

	/**
	 * Computes the normal vector of a triangle.
	 *
	 * @param {Vector3} a - The first corner of the triangle.
	 * @param {Vector3} b - The second corner of the triangle.
	 * @param {Vector3} c - The third corner of the triangle.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The triangle's normal.
	 */
	static getNormal( a, b, c, target ) {

		return triangleGetNormal( a, b, c, target );

	}

	/**
	 * Computes a barycentric coordinates from the given vector.
	 * Returns `null` if the triangle is degenerate.
	 *
	 * @param {Vector3} point - A point in 3D space.
	 * @param {Vector3} a - The first corner of the triangle.
	 * @param {Vector3} b - The second corner of the triangle.
	 * @param {Vector3} c - The third corner of the triangle.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The barycentric coordinates for the given point
	 */
	static getBarycoord( point, a, b, c, target ) {

		return triangleGetBarycoord( point, a, b, c, target );

	}

	/**
	 * Returns `true` if the given point, when projected onto the plane of the
	 * triangle, lies within the triangle.
	 *
	 * @param {Vector3} point - The point in 3D space to test.
	 * @param {Vector3} a - The first corner of the triangle.
	 * @param {Vector3} b - The second corner of the triangle.
	 * @param {Vector3} c - The third corner of the triangle.
	 * @return {boolean} Whether the given point, when projected onto the plane of the
	 * triangle, lies within the triangle or not.
	 */
	static containsPoint( point, a, b, c ) {

		return triangleContainsPoint( point, a, b, c );

	}

	/**
	 * Computes the value barycentrically interpolated for the given point on the
	 * triangle. Returns `null` if the triangle is degenerate.
	 *
	 * @param {Vector3} point - Position of interpolated point.
	 * @param {Vector3} p1 - The first corner of the triangle.
	 * @param {Vector3} p2 - The second corner of the triangle.
	 * @param {Vector3} p3 - The third corner of the triangle.
	 * @param {Vector3} v1 - Value to interpolate of first vertex.
	 * @param {Vector3} v2 - Value to interpolate of second vertex.
	 * @param {Vector3} v3 - Value to interpolate of third vertex.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The interpolated value.
	 */
	static getInterpolation( point, p1, p2, p3, v1, v2, v3, target ) {

		return triangleGetInterpolation( point, p1, p2, p3, v1, v2, v3, target );

	}

	/**
	 * Computes the value barycentrically interpolated for the given attribute and indices.
	 *
	 * @param {BufferAttribute} attr - The attribute to interpolate.
	 * @param {number} i1 - Index of first vertex.
	 * @param {number} i2 - Index of second vertex.
	 * @param {number} i3 - Index of third vertex.
	 * @param {Vector3} barycoord - The barycoordinate value to use to interpolate.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The interpolated attribute value.
	 */
	static getInterpolatedAttribute( attr, i1, i2, i3, barycoord, target ) {

		return triangleGetInterpolatedAttribute( attr, i1, i2, i3, barycoord, target );

	}

	/**
	 * Returns `true` if the triangle is oriented towards the given direction.
	 *
	 * @param {Vector3} a - The first corner of the triangle.
	 * @param {Vector3} b - The second corner of the triangle.
	 * @param {Vector3} c - The third corner of the triangle.
	 * @param {Vector3} direction - The (normalized) direction vector.
	 * @return {boolean} Whether the triangle is oriented towards the given direction or not.
	 */
	static isFrontFacing( a, b, c, direction ) {

		return triangleIsFrontFacing( a, b, c, direction );

	}

	/**
	 * Sets the triangle's vertices by copying the given values.
	 *
	 * @param {Vector3} a - The first corner of the triangle.
	 * @param {Vector3} b - The second corner of the triangle.
	 * @param {Vector3} c - The third corner of the triangle.
	 * @return {Triangle} A reference to this triangle.
	 */
	set( a, b, c ) {

		return triangleSet( a, b, c, this );

	}

	/**
	 * Sets the triangle's vertices by copying the given array values.
	 *
	 * @param {Array<Vector3>} points - An array with 3D points.
	 * @param {number} i0 - The array index representing the first corner of the triangle.
	 * @param {number} i1 - The array index representing the second corner of the triangle.
	 * @param {number} i2 - The array index representing the third corner of the triangle.
	 * @return {Triangle} A reference to this triangle.
	 */
	setFromPointsAndIndices( points, i0, i1, i2 ) {

		return triangleSetFromPointsAndIndices( points, i0, i1, i2, this );

	}

	/**
	 * Sets the triangle's vertices by copying the given attribute values.
	 *
	 * @param {BufferAttribute} attribute - A buffer attribute with 3D points data.
	 * @param {number} i0 - The attribute index representing the first corner of the triangle.
	 * @param {number} i1 - The attribute index representing the second corner of the triangle.
	 * @param {number} i2 - The attribute index representing the third corner of the triangle.
	 * @return {Triangle} A reference to this triangle.
	 */
	setFromAttributeAndIndices( attribute, i0, i1, i2 ) {

		return triangleSetFromAttributeAndIndices( attribute, i0, i1, i2, this );

	}

	/**
	 * Returns a new triangle with copied values from this instance.
	 *
	 * @return {Triangle} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given triangle to this instance.
	 *
	 * @param {Triangle} triangle - The triangle to copy.
	 * @return {Triangle} A reference to this triangle.
	 */
	copy( triangle ) {

		return triangleCopy( triangle, this );

	}

	/**
	 * Computes the area of the triangle.
	 *
	 * @return {number} The triangle's area.
	 */
	getArea() {

		return triangleGetArea( this );

	}

	/**
	 * Computes the midpoint of the triangle.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The triangle's midpoint.
	 */
	getMidpoint( target ) {

		return triangleGetMidpoint( this, target );

	}

	/**
	 * Computes the normal of the triangle.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The triangle's normal.
	 */
	getNormal( target ) {

		return triangleGetNormal( this.a, this.b, this.c, target );

	}

	/**
	 * Computes a plane the triangle lies within.
	 *
	 * @param {Plane} target - The target vector that is used to store the method's result.
	 * @return {Plane} The plane the triangle lies within.
	 */
	getPlane( target ) {

		return triangleGetPlane( this, target );

	}

	/**
	 * Computes a barycentric coordinates from the given vector.
	 * Returns `null` if the triangle is degenerate.
	 *
	 * @param {Vector3} point - A point in 3D space.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The barycentric coordinates for the given point
	 */
	getBarycoord( point, target ) {

		return triangleGetBarycoord( point, this.a, this.b, this.c, target );

	}

	/**
	 * Computes the value barycentrically interpolated for the given point on the
	 * triangle. Returns `null` if the triangle is degenerate.
	 *
	 * @param {Vector3} point - Position of interpolated point.
	 * @param {Vector3} v1 - Value to interpolate of first vertex.
	 * @param {Vector3} v2 - Value to interpolate of second vertex.
	 * @param {Vector3} v3 - Value to interpolate of third vertex.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {?Vector3} The interpolated value.
	 */
	getInterpolation( point, v1, v2, v3, target ) {

		return triangleGetInterpolation( point, this.a, this.b, this.c, v1, v2, v3, target );

	}

	/**
	 * Returns `true` if the given point, when projected onto the plane of the
	 * triangle, lies within the triangle.
	 *
	 * @param {Vector3} point - The point in 3D space to test.
	 * @return {boolean} Whether the given point, when projected onto the plane of the
	 * triangle, lies within the triangle or not.
	 */
	containsPoint( point ) {

		return triangleContainsPoint( point, this.a, this.b, this.c );

	}

	/**
	 * Returns `true` if the triangle is oriented towards the given direction.
	 *
	 * @param {Vector3} direction - The (normalized) direction vector.
	 * @return {boolean} Whether the triangle is oriented towards the given direction or not.
	 */
	isFrontFacing( direction ) {

		return triangleIsFrontFacing( this.a, this.b, this.c, direction );

	}

	/**
	 * Returns `true` if this triangle intersects with the given box.
	 *
	 * @param {Box3} box - The box to intersect.
	 * @return {boolean} Whether this triangle intersects with the given box or not.
	 */
	intersectsBox( box ) {

		return triangleIntersectsBox( this, box );

	}

	/**
	 * Returns the closest point on the triangle to the given point.
	 *
	 * @param {Vector3} p - The point to compute the closest point for.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The closest point on the triangle.
	 */
	closestPointToPoint( p, target ) {

		return triangleClosestPointToPoint( this, p, target );

	}

	/**
	 * Returns `true` if this triangle is equal with the given one.
	 *
	 * @param {Triangle} triangle - The triangle to test for equality.
	 * @return {boolean} Whether this triangle is equal with the given one.
	 */
	equals( triangle ) {

		return triangleEquals( this, triangle );

	}

}

export { Triangle };
