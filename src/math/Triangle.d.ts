import { Vector3 } from './Vector3';
import { Plane } from './Plane';

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
  containsPoint( point: Vector3 ): boolean;
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

}
