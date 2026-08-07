/**
 * A structural type describing any object with numeric `x`, `y`, and `z`
 * components, exactly like {@link Vector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * A structural type describing any object that stores a ray as an origin
 * and a (normalized) direction, exactly like {@link Ray}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Ray} instance. Since {@link Ray} exposes
 * compatible `origin` and `direction` properties, instances of that class
 * satisfy this type without any special handling.
 *
 * @typedef {Object} RayLike
 * @property {Vector3Like} origin - The origin of the ray.
 * @property {Vector3Like} direction - The (normalized) direction of the ray.
 */

/**
 * A structural type describing a sphere with a center and radius.
 *
 * @typedef {Object} SphereLike
 * @property {Vector3Like} center
 * @property {number} radius
 */

/**
 * A structural type describing a plane with a normal and a constant.
 *
 * @typedef {Object} PlaneLike
 * @property {Vector3Like} normal
 * @property {number} constant
 */

/**
 * A structural type describing an axis-aligned bounding box.
 *
 * @typedef {Object} Box3Like
 * @property {Vector3Like} min
 * @property {Vector3Like} max
 */

/**
 * Creates a new, plain {@link RayLike} object with origin at `(0,0,0)` and
 * direction `(0,0,-1)`.
 *
 * Unlike `new Ray()`, the returned object is not a class instance — it only
 * satisfies the {@link RayLike} shape. This keeps functional-only call sites
 * free of any dependency on the {@link Ray} class so that unused ray
 * operations can be tree-shaken.
 *
 * @return {RayLike} A new ray-like object in the default state.
 */
export function rayCreate() {

	return {

		origin: { x: 0, y: 0, z: 0 },
		direction: { x: 0, y: 0, z: - 1 }

	};

}

/**
 * Sets the ray's components by copying the given origin and direction into
 * the target.
 *
 * @param {Vector3Like} origin - The origin.
 * @param {Vector3Like} direction - The direction.
 * @param {RayLike} [target] - The target the result is stored to.
 * @return {RayLike} The target, for chaining.
 */
export function raySet( origin, direction, target = rayCreate() ) {

	target.origin.x = origin.x;
	target.origin.y = origin.y;
	target.origin.z = origin.z;

	target.direction.x = direction.x;
	target.direction.y = direction.y;
	target.direction.z = direction.z;

	return target;

}

/**
 * Copies the values of the given ray into the target.
 *
 * @param {RayLike} ray - The ray to copy.
 * @param {RayLike} [target] - The target the result is stored to.
 * @return {RayLike} A copy of `ray`.
 */
export function rayCopy( ray, target = rayCreate() ) {

	target.origin.x = ray.origin.x;
	target.origin.y = ray.origin.y;
	target.origin.z = ray.origin.z;

	target.direction.x = ray.direction.x;
	target.direction.y = ray.direction.y;
	target.direction.z = ray.direction.z;

	return target;

}

/**
 * Returns a vector that is located at a given distance along the ray.
 *
 * @param {RayLike} ray - The ray.
 * @param {number} t - The distance along the ray to retrieve a position for.
 * @param {Vector3Like} [target] - The target vector the result is stored to.
 * @return {Vector3Like} A position on the ray.
 */
export function rayAt( ray, t, target = { x: 0, y: 0, z: 0 } ) {

	target.x = ray.origin.x + ray.direction.x * t;
	target.y = ray.origin.y + ray.direction.y * t;
	target.z = ray.origin.z + ray.direction.z * t;

	return target;

}

/**
 * Adjusts the direction of the target ray to point at the given vector in
 * world space, copying the origin from `ray`.
 *
 * @param {RayLike} ray - The source ray (provides the origin).
 * @param {Vector3Like} v - The target position.
 * @param {RayLike} [target] - The target the result is stored to.
 * @return {RayLike} The target, for chaining.
 */
export function rayLookAt( ray, v, target = rayCreate() ) {

	let x = v.x - ray.origin.x;
	let y = v.y - ray.origin.y;
	let z = v.z - ray.origin.z;

	const lengthInv = 1 / ( Math.sqrt( x * x + y * y + z * z ) || 1 );
	x *= lengthInv;
	y *= lengthInv;
	z *= lengthInv;

	target.origin.x = ray.origin.x;
	target.origin.y = ray.origin.y;
	target.origin.z = ray.origin.z;

	target.direction.x = x;
	target.direction.y = y;
	target.direction.z = z;

	return target;

}

/**
 * Shift the origin of the ray along its direction by the given distance.
 *
 * @param {RayLike} ray - The ray to recast.
 * @param {number} t - The distance along the ray to interpolate.
 * @param {RayLike} [target] - The target the result is stored to.
 * @return {RayLike} The target, for chaining.
 */
export function rayRecast( ray, t, target = rayCreate() ) {

	const ox = ray.origin.x + ray.direction.x * t;
	const oy = ray.origin.y + ray.direction.y * t;
	const oz = ray.origin.z + ray.direction.z * t;

	target.origin.x = ox;
	target.origin.y = oy;
	target.origin.z = oz;

	target.direction.x = ray.direction.x;
	target.direction.y = ray.direction.y;
	target.direction.z = ray.direction.z;

	return target;

}

/**
 * Returns the point along the ray that is closest to the given point.
 *
 * @param {RayLike} ray - The ray.
 * @param {Vector3Like} point - A point in 3D space to get the closest location on the ray for.
 * @param {Vector3Like} [target] - The target vector the result is stored to.
 * @return {Vector3Like} The closest point on the ray.
 */
export function rayClosestPointToPoint( ray, point, target = { x: 0, y: 0, z: 0 } ) {

	const dx = point.x - ray.origin.x;
	const dy = point.y - ray.origin.y;
	const dz = point.z - ray.origin.z;

	const directionDistance = dx * ray.direction.x + dy * ray.direction.y + dz * ray.direction.z;

	if ( directionDistance < 0 ) {

		target.x = ray.origin.x;
		target.y = ray.origin.y;
		target.z = ray.origin.z;

		return target;

	}

	target.x = ray.origin.x + ray.direction.x * directionDistance;
	target.y = ray.origin.y + ray.direction.y * directionDistance;
	target.z = ray.origin.z + ray.direction.z * directionDistance;

	return target;

}

/**
 * Returns the distance of the closest approach between the ray and the given point.
 *
 * @param {RayLike} ray - The ray.
 * @param {Vector3Like} point - A point in 3D space to compute the distance to.
 * @return {number} The distance.
 */
export function rayDistanceToPoint( ray, point ) {

	return Math.sqrt( rayDistanceSqToPoint( ray, point ) );

}

/**
 * Returns the squared distance of the closest approach between the ray and the given point.
 *
 * @param {RayLike} ray - The ray.
 * @param {Vector3Like} point - A point in 3D space to compute the distance to.
 * @return {number} The squared distance.
 */
export function rayDistanceSqToPoint( ray, point ) {

	const dx = point.x - ray.origin.x;
	const dy = point.y - ray.origin.y;
	const dz = point.z - ray.origin.z;

	const directionDistance = dx * ray.direction.x + dy * ray.direction.y + dz * ray.direction.z;

	// point behind the ray

	if ( directionDistance < 0 ) {

		return dx * dx + dy * dy + dz * dz;

	}

	const cx = ray.origin.x + ray.direction.x * directionDistance - point.x;
	const cy = ray.origin.y + ray.direction.y * directionDistance - point.y;
	const cz = ray.origin.z + ray.direction.z * directionDistance - point.z;

	return cx * cx + cy * cy + cz * cz;

}

/**
 * Returns the squared distance between the ray and the given line segment.
 *
 * @param {RayLike} ray - The ray.
 * @param {Vector3Like} v0 - The start point of the line segment.
 * @param {Vector3Like} v1 - The end point of the line segment.
 * @param {Vector3Like} [optionalPointOnRay] - When provided, it receives the point on the ray that is closest to the segment.
 * @param {Vector3Like} [optionalPointOnSegment] - When provided, it receives the point on the line segment that is closest to the ray.
 * @return {number} The squared distance.
 */
export function rayDistanceSqToSegment( ray, v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

	// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
	// It returns the min distance between the ray and the segment
	// defined by v0 and v1
	// It can also set two optional targets :
	// - The closest point on the ray
	// - The closest point on the segment

	_segCenter.x = ( v0.x + v1.x ) * 0.5;
	_segCenter.y = ( v0.y + v1.y ) * 0.5;
	_segCenter.z = ( v0.z + v1.z ) * 0.5;

	let sdx = v1.x - v0.x;
	let sdy = v1.y - v0.y;
	let sdz = v1.z - v0.z;
	const segLength = Math.sqrt( sdx * sdx + sdy * sdy + sdz * sdz );
	const invSegLength = 1 / ( segLength || 1 );

	sdx *= invSegLength;
	sdy *= invSegLength;
	sdz *= invSegLength;

	_segDir.x = sdx;
	_segDir.y = sdy;
	_segDir.z = sdz;

	_diff.x = ray.origin.x - _segCenter.x;
	_diff.y = ray.origin.y - _segCenter.y;
	_diff.z = ray.origin.z - _segCenter.z;

	const segExtent = segLength * 0.5;
	const a01 = - ( ray.direction.x * _segDir.x + ray.direction.y * _segDir.y + ray.direction.z * _segDir.z );
	const b0 = _diff.x * ray.direction.x + _diff.y * ray.direction.y + _diff.z * ray.direction.z;
	const b1 = - ( _diff.x * _segDir.x + _diff.y * _segDir.y + _diff.z * _segDir.z );
	const c = _diff.x * _diff.x + _diff.y * _diff.y + _diff.z * _diff.z;
	const det = Math.abs( 1 - a01 * a01 );
	let s0, s1, sqrDist, extDet;

	if ( det > 0 ) {

		// The ray and segment are not parallel.

		s0 = a01 * b1 - b0;
		s1 = a01 * b0 - b1;
		extDet = segExtent * det;

		if ( s0 >= 0 ) {

			if ( s1 >= - extDet ) {

				if ( s1 <= extDet ) {

					// region 0
					// Minimum at interior points of ray and segment.

					const invDet = 1 / det;
					s0 *= invDet;
					s1 *= invDet;
					sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

				} else {

					// region 1

					s1 = segExtent;
					s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			} else {

				// region 5

				s1 = - segExtent;
				s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
				sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

			}

		} else {

			if ( s1 <= - extDet ) {

				// region 4

				s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
				s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
				sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

			} else if ( s1 <= extDet ) {

				// region 3

				s0 = 0;
				s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
				sqrDist = s1 * ( s1 + 2 * b1 ) + c;

			} else {

				// region 2

				s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
				s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
				sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

			}

		}

	} else {

		// Ray and segment are parallel.

		s1 = ( a01 > 0 ) ? - segExtent : segExtent;
		s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
		sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

	}

	if ( optionalPointOnRay ) {

		optionalPointOnRay.x = ray.origin.x + ray.direction.x * s0;
		optionalPointOnRay.y = ray.origin.y + ray.direction.y * s0;
		optionalPointOnRay.z = ray.origin.z + ray.direction.z * s0;

	}

	if ( optionalPointOnSegment ) {

		optionalPointOnSegment.x = _segCenter.x + _segDir.x * s1;
		optionalPointOnSegment.y = _segCenter.y + _segDir.y * s1;
		optionalPointOnSegment.z = _segCenter.z + _segDir.z * s1;

	}

	return sqrDist;

}

/**
 * Intersects the ray with the given sphere, returning the intersection
 * point or `null` if there is no intersection.
 *
 * @param {RayLike} ray - The ray.
 * @param {SphereLike} sphere - The sphere to intersect.
 * @param {Vector3Like} [target] - The target vector the result is stored to.
 * @return {?Vector3Like} The intersection point.
 */
export function rayIntersectSphere( ray, sphere, target = { x: 0, y: 0, z: 0 } ) {

	if ( sphere.radius < 0 ) return null; // handle empty spheres, see #31187

	_vector.x = sphere.center.x - ray.origin.x;
	_vector.y = sphere.center.y - ray.origin.y;
	_vector.z = sphere.center.z - ray.origin.z;

	const tca = _vector.x * ray.direction.x + _vector.y * ray.direction.y + _vector.z * ray.direction.z;
	const d2 = _vector.x * _vector.x + _vector.y * _vector.y + _vector.z * _vector.z - tca * tca;
	const radius2 = sphere.radius * sphere.radius;

	if ( d2 > radius2 ) return null;

	const thc = Math.sqrt( radius2 - d2 );

	// t0 = first intersect point - entrance on front of sphere
	const t0 = tca - thc;

	// t1 = second intersect point - exit point on back of sphere
	const t1 = tca + thc;

	// test to see if t1 is behind the ray - if so, return null
	if ( t1 < 0 ) return null;

	// test to see if t0 is behind the ray:
	// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
	// in order to always return an intersect point that is in front of the ray.
	if ( t0 < 0 ) return rayAt( ray, t1, target );

	// else t0 is in front of the ray, so return the first collision point scaled by t0
	return rayAt( ray, t0, target );

}

/**
 * Returns `true` if the ray intersects with the given sphere.
 *
 * @param {RayLike} ray - The ray.
 * @param {SphereLike} sphere - The sphere to intersect.
 * @return {boolean} Whether the ray intersects with the given sphere or not.
 */
export function rayIntersectsSphere( ray, sphere ) {

	if ( sphere.radius < 0 ) return false; // handle empty spheres, see #31187

	return rayDistanceSqToPoint( ray, sphere.center ) <= ( sphere.radius * sphere.radius );

}

/**
 * Computes the distance from the ray's origin to the given plane. Returns `null` if the ray
 * does not intersect with the plane.
 *
 * @param {RayLike} ray - The ray.
 * @param {PlaneLike} plane - The plane to compute the distance to.
 * @return {?number} The distance, or `null` if there is no intersection.
 */
export function rayDistanceToPlane( ray, plane ) {

	const denominator = plane.normal.x * ray.direction.x + plane.normal.y * ray.direction.y + plane.normal.z * ray.direction.z;

	if ( denominator === 0 ) {

		// line is coplanar, return origin
		if ( plane.normal.x * ray.origin.x + plane.normal.y * ray.origin.y + plane.normal.z * ray.origin.z + plane.constant === 0 ) {

			return 0;

		}

		// Null is preferable to undefined since undefined means.... it is undefined

		return null;

	}

	const t = - ( ray.origin.x * plane.normal.x + ray.origin.y * plane.normal.y + ray.origin.z * plane.normal.z + plane.constant ) / denominator;

	// Return if the ray never intersects the plane

	return t >= 0 ? t : null;

}

/**
 * Intersects the ray with the given plane, returning the intersection
 * point or `null` if there is no intersection.
 *
 * @param {RayLike} ray - The ray.
 * @param {PlaneLike} plane - The plane to intersect.
 * @param {Vector3Like} [target] - The target vector the result is stored to.
 * @return {?Vector3Like} The intersection point.
 */
export function rayIntersectPlane( ray, plane, target = { x: 0, y: 0, z: 0 } ) {

	const t = rayDistanceToPlane( ray, plane );

	if ( t === null ) {

		return null;

	}

	return rayAt( ray, t, target );

}

/**
 * Returns `true` if the ray intersects with the given plane.
 *
 * @param {RayLike} ray - The ray.
 * @param {PlaneLike} plane - The plane to intersect.
 * @return {boolean} Whether the ray intersects with the given plane or not.
 */
export function rayIntersectsPlane( ray, plane ) {

	// check if the ray lies on the plane first

	const distToPoint = plane.normal.x * ray.origin.x + plane.normal.y * ray.origin.y + plane.normal.z * ray.origin.z + plane.constant;

	if ( distToPoint === 0 ) {

		return true;

	}

	const denominator = plane.normal.x * ray.direction.x + plane.normal.y * ray.direction.y + plane.normal.z * ray.direction.z;

	if ( denominator * distToPoint < 0 ) {

		return true;

	}

	// ray origin is behind the plane (and is pointing behind it)

	return false;

}

/**
 * Intersects the ray with the given bounding box, returning the intersection
 * point or `null` if there is no intersection.
 *
 * @param {RayLike} ray - The ray.
 * @param {Box3Like} box - The box to intersect.
 * @param {Vector3Like} [target] - The target vector the result is stored to.
 * @return {?Vector3Like} The intersection point.
 */
export function rayIntersectBox( ray, box, target = { x: 0, y: 0, z: 0 } ) {

	let tmin, tmax, tymin, tymax, tzmin, tzmax;

	const invdirx = 1 / ray.direction.x,
		invdiry = 1 / ray.direction.y,
		invdirz = 1 / ray.direction.z;

	const origin = ray.origin;

	if ( invdirx >= 0 ) {

		tmin = ( box.min.x - origin.x ) * invdirx;
		tmax = ( box.max.x - origin.x ) * invdirx;

	} else {

		tmin = ( box.max.x - origin.x ) * invdirx;
		tmax = ( box.min.x - origin.x ) * invdirx;

	}

	if ( invdiry >= 0 ) {

		tymin = ( box.min.y - origin.y ) * invdiry;
		tymax = ( box.max.y - origin.y ) * invdiry;

	} else {

		tymin = ( box.max.y - origin.y ) * invdiry;
		tymax = ( box.min.y - origin.y ) * invdiry;

	}

	if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

	if ( tymin > tmin || isNaN( tmin ) ) tmin = tymin;

	if ( tymax < tmax || isNaN( tmax ) ) tmax = tymax;

	if ( invdirz >= 0 ) {

		tzmin = ( box.min.z - origin.z ) * invdirz;
		tzmax = ( box.max.z - origin.z ) * invdirz;

	} else {

		tzmin = ( box.max.z - origin.z ) * invdirz;
		tzmax = ( box.min.z - origin.z ) * invdirz;

	}

	if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

	if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

	if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

	//return point closest to the ray (positive side)

	if ( tmax < 0 ) return null;

	return rayAt( ray, tmin >= 0 ? tmin : tmax, target );

}

/**
 * Returns `true` if the ray intersects with the given box.
 *
 * @param {RayLike} ray - The ray.
 * @param {Box3Like} box - The box to intersect.
 * @return {boolean} Whether the ray intersects with the given box or not.
 */
export function rayIntersectsBox( ray, box ) {

	return rayIntersectBox( ray, box, _vector ) !== null;

}

/**
 * Intersects the ray with the given triangle, returning the intersection
 * point or `null` if there is no intersection.
 *
 * @param {RayLike} ray - The ray.
 * @param {Vector3Like} a - The first vertex of the triangle.
 * @param {Vector3Like} b - The second vertex of the triangle.
 * @param {Vector3Like} c - The third vertex of the triangle.
 * @param {boolean} backfaceCulling - Whether to use backface culling or not.
 * @param {Vector3Like} [target] - The target vector the result is stored to.
 * @return {?Vector3Like} The intersection point.
 */
export function rayIntersectTriangle( ray, a, b, c, backfaceCulling, target = { x: 0, y: 0, z: 0 } ) {

	// Watertight ray/triangle intersection. Reference: Woop, Benthin, Wald,
	// "Watertight Ray/Triangle Intersection", JCGT vol. 2 no. 1 (2013), Appendix A.
	// https://jcgt.org/published/0002/01/05/

	const origin = ray.origin;
	const direction = ray.direction;

	const dx = direction.x;
	const dy = direction.y;
	const dz = direction.z;

	// triangle vertices relative to the ray origin

	const aox = a.x - origin.x, aoy = a.y - origin.y, aoz = a.z - origin.z;
	const box = b.x - origin.x, boy = b.y - origin.y, boz = b.z - origin.z;
	const cox = c.x - origin.x, coy = c.y - origin.y, coz = c.z - origin.z;

	// Use the dimension where the ray direction is maximal as the projection
	// axis (kz) and read every component already permuted into (kx, ky, kz).
	// kx and ky are swapped when the direction's kz component is negative, to
	// preserve the winding order of triangles.

	const adx = Math.abs( dx ), ady = Math.abs( dy ), adz = Math.abs( dz );

	let dkx, dky, dkz;
	let akx, aky, akz, bkx, bky, bkz, ckx, cky, ckz;

	if ( adx >= ady && adx >= adz ) {

		dkz = dx; akz = aox; bkz = box; ckz = cox;

		if ( dx >= 0 ) {

			dkx = dy; dky = dz;
			akx = aoy; aky = aoz; bkx = boy; bky = boz; ckx = coy; cky = coz;

		} else {

			dkx = dz; dky = dy;
			akx = aoz; aky = aoy; bkx = boz; bky = boy; ckx = coz; cky = coy;

		}

	} else if ( ady >= adz ) {

		dkz = dy; akz = aoy; bkz = boy; ckz = coy;

		if ( dy >= 0 ) {

			dkx = dz; dky = dx;
			akx = aoz; aky = aox; bkx = boz; bky = box; ckx = coz; cky = cox;

		} else {

			dkx = dx; dky = dz;
			akx = aox; aky = aoz; bkx = box; bky = boz; ckx = cox; cky = coz;

		}

	} else {

		dkz = dz; akz = aoz; bkz = boz; ckz = coz;

		if ( dz >= 0 ) {

			dkx = dx; dky = dy;
			akx = aox; aky = aoy; bkx = box; bky = boy; ckx = cox; cky = coy;

		} else {

			dkx = dy; dky = dx;
			akx = aoy; aky = aox; bkx = boy; bky = box; ckx = coy; cky = cox;

		}

	}

	// a zero direction has no maximal axis and cannot intersect

	if ( dkz === 0 ) return null;

	// shear constants that align the ray with the +kz axis

	const sx = dkx / dkz, sy = dky / dkz, sz = 1 / dkz;

	// sheared and scaled vertices

	const ax = akx - sx * akz, ay = aky - sy * akz;
	const bx = bkx - sx * bkz, by = bky - sy * bkz;
	const cx = ckx - sx * ckz, cy = cky - sy * ckz;

	// scaled barycentric coordinates (signed edge functions); the shear makes a
	// shared edge evaluate identically for both adjacent triangles, so the ray
	// can never fall between them

	const u = cx * by - cy * bx;
	const v = ax * cy - ay * cx;
	const w = bx * ay - by * ax;

	if ( backfaceCulling ) {

		if ( u < 0 || v < 0 || w < 0 ) return null;

	} else {

		if ( ( u < 0 || v < 0 || w < 0 ) && ( u > 0 || v > 0 || w > 0 ) ) return null;

	}

	const det = u + v + w;

	// ray is co-planar with the triangle

	if ( det === 0 ) return null;

	// scaled hit distance; t = tScaled / det must lie in front of the origin

	const tScaled = sz * ( u * akz + v * bkz + w * ckz );

	if ( det > 0 ? tScaled < 0 : tScaled > 0 ) return null;

	return rayAt( ray, tScaled / det, target );

}

/**
 * Transforms the ray with the given 4x4 transformation matrix.
 *
 * @param {RayLike} ray - The ray to transform.
 * @param {Matrix4Like} matrix4 - The transformation matrix.
 * @param {RayLike} [target] - The target the result is stored to.
 * @return {RayLike} The target, for chaining.
 */
export function rayApplyMatrix4( ray, matrix4, target = rayCreate() ) {

	const e = matrix4.elements;

	const ox = ray.origin.x, oy = ray.origin.y, oz = ray.origin.z;
	const ow = 1 / ( e[ 3 ] * ox + e[ 7 ] * oy + e[ 11 ] * oz + e[ 15 ] );

	target.origin.x = ( e[ 0 ] * ox + e[ 4 ] * oy + e[ 8 ] * oz + e[ 12 ] ) * ow;
	target.origin.y = ( e[ 1 ] * ox + e[ 5 ] * oy + e[ 9 ] * oz + e[ 13 ] ) * ow;
	target.origin.z = ( e[ 2 ] * ox + e[ 6 ] * oy + e[ 10 ] * oz + e[ 14 ] ) * ow;

	const dx = ray.direction.x, dy = ray.direction.y, dz = ray.direction.z;

	let x = e[ 0 ] * dx + e[ 4 ] * dy + e[ 8 ] * dz;
	let y = e[ 1 ] * dx + e[ 5 ] * dy + e[ 9 ] * dz;
	let z = e[ 2 ] * dx + e[ 6 ] * dy + e[ 10 ] * dz;

	const lengthInv = 1 / ( Math.sqrt( x * x + y * y + z * z ) || 1 );
	x *= lengthInv;
	y *= lengthInv;
	z *= lengthInv;

	target.direction.x = x;
	target.direction.y = y;
	target.direction.z = z;

	return target;

}

/**
 * Returns `true` if the two rays are equal.
 *
 * @param {RayLike} a - The first ray.
 * @param {RayLike} b - The second ray.
 * @return {boolean} Whether the rays are equal.
 */
export function rayEquals( a, b ) {

	return ( a.origin.x === b.origin.x && a.origin.y === b.origin.y && a.origin.z === b.origin.z ) &&
		( a.direction.x === b.direction.x && a.direction.y === b.direction.y && a.direction.z === b.direction.z );

}

const _vector = { x: 0, y: 0, z: 0 };
const _segCenter = { x: 0, y: 0, z: 0 };
const _segDir = { x: 0, y: 0, z: 0 };
const _diff = { x: 0, y: 0, z: 0 };
