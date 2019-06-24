import { Vector2 } from './Vector2';
import { Vector3 } from './Vector3';
import { Plane } from './Plane';
import { Box3 } from './Box3';

export interface SplineControlPoint {
	x: number;
	y: number;
	z: number;
}

export class Triangle {

	constructor( a?: Vector3, b?: Vector3, c?: Vector3 );

	a: Vector3;
	b: Vector3;
	c: Vector3;

	set( a: Vector3, b: Vector3, c: Vector3 ): Triangle;
	setFromPointsAndIndices(
		points: Vector3[],
		i0: number,
		i1: number,
		i2: number
	): Triangle;
	clone(): this;
	copy( triangle: Triangle ): this;
	getArea(): number;
	getMidpoint( target: Vector3 ): Vector3;
	getNormal( target: Vector3 ): Vector3;
	getPlane( target: Vector3 ): Plane;
	getBarycoord( point: Vector3, target: Vector3 ): Vector3;
	getUV( point: Vector3, uv1: Vector2, uv2: Vector2, uv3: Vector2, target: Vector2 ): Vector2;
	containsPoint( point: Vector3 ): boolean;
	intersectsBox( box: Box3 ): boolean;
	isFrontFacing( direction: Vector3 ): boolean;
	closestPointToPoint( point: Vector3, target: Vector3 ): Vector3;
	equals( triangle: Triangle ): boolean;

	static getNormal(
		a: Vector3,
		b: Vector3,
		c: Vector3,
		target: Vector3
	): Vector3;
	static getBarycoord(
		point: Vector3,
		a: Vector3,
		b: Vector3,
		c: Vector3,
		target: Vector3
	): Vector3;
	static containsPoint(
		point: Vector3,
		a: Vector3,
		b: Vector3,
		c: Vector3
	): boolean;
	static getUV(
		point: Vector3,
		p1: Vector3,
		p2: Vector3,
		p3: Vector3,
		uv1: Vector2,
		uv2: Vector2,
		uv3: Vector2,
		target: Vector2
	): Vector2;
	static isFrontFacing(
		a: Vector3,
		b: Vector3,
		c: Vector3,
		direction: Vector3
	): boolean;

}
