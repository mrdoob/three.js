import { Vector3 } from './Vector3';
import { Sphere } from './Sphere';
import { Plane } from './Plane';
import { Box3 } from './Box3';
import { Matrix4 } from './Matrix4';

export class Ray {

	constructor( origin?: Vector3, direction?: Vector3 );

	origin: Vector3;
	direction: Vector3;

	set( origin: Vector3, direction: Vector3 ): Ray;
	clone(): this;
	copy( ray: Ray ): this;
	at( t: number, target: Vector3 ): Vector3;
	lookAt( v: Vector3 ): Vector3;
	recast( t: number ): Ray;
	closestPointToPoint( point: Vector3, target: Vector3 ): Vector3;
	distanceToPoint( point: Vector3 ): number;
	distanceSqToPoint( point: Vector3 ): number;
	distanceSqToSegment(
		v0: Vector3,
		v1: Vector3,
		optionalPointOnRay?: Vector3,
		optionalPointOnSegment?: Vector3
	): number;
	intersectSphere( sphere: Sphere, target: Vector3 ): Vector3;
	intersectsSphere( sphere: Sphere ): boolean;
	distanceToPlane( plane: Plane ): number;
	intersectPlane( plane: Plane, target: Vector3 ): Vector3;
	intersectsPlane( plane: Plane ): boolean;
	intersectBox( box: Box3, target: Vector3 ): Vector3;
	intersectsBox( box: Box3 ): boolean;
	intersectTriangle(
		a: Vector3,
		b: Vector3,
		c: Vector3,
		backfaceCulling: boolean,
		target: Vector3
	): Vector3;
	applyMatrix4( matrix4: Matrix4 ): Ray;
	equals( ray: Ray ): boolean;

	/**
	 * @deprecated Use {@link Ray#intersectsBox .intersectsBox()} instead.
	 */
	isIntersectionBox( b: any ): any;

	/**
	 * @deprecated Use {@link Ray#intersectsPlane .intersectsPlane()} instead.
	 */
	isIntersectionPlane( p: any ): any;

	/**
	 * @deprecated Use {@link Ray#intersectsSphere .intersectsSphere()} instead.
	 */
	isIntersectionSphere( s: any ): any;

}
