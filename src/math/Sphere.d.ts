import { Vector3 } from './Vector3';
import { Box3 } from './Box3';
import { Plane } from './Plane';
import { Matrix4 } from './Matrix4';

export class Sphere {

	constructor( center?: Vector3, radius?: number );

	/**
	 * @default new Vector3()
	 */
	center: Vector3;

	/**
	 * @default 1
	 */
	radius: number;

	set( center: Vector3, radius: number ): Sphere;
	setFromPoints( points: Vector3[], optionalCenter?: Vector3 ): Sphere;
	clone(): this;
	copy( sphere: Sphere ): this;
	isEmpty(): boolean;
	makeEmpty(): this;
	containsPoint( point: Vector3 ): boolean;
	distanceToPoint( point: Vector3 ): number;
	intersectsSphere( sphere: Sphere ): boolean;
	intersectsBox( box: Box3 ): boolean;
	intersectsPlane( plane: Plane ): boolean;
	clampPoint( point: Vector3, target: Vector3 ): Vector3;
	getBoundingBox( target: Box3 ): Box3;
	applyMatrix4( matrix: Matrix4 ): Sphere;
	translate( offset: Vector3 ): Sphere;
	equals( sphere: Sphere ): boolean;

	/**
	 * @deprecated Use {@link Sphere#isEmpty .isEmpty()} instead.
	 */
	empty(): any;

}
