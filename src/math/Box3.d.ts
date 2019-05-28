import { Vector3 } from './Vector3';
import { Object3D } from './../core/Object3D';
import { Sphere } from './Sphere';
import { Plane } from './Plane';
import { Matrix4 } from './Matrix4';

export class Box3 {

	constructor( min?: Vector3, max?: Vector3 );

  max: Vector3;
  min: Vector3;

  set( min: Vector3, max: Vector3 ): this;
  setFromArray( array: ArrayLike<number> ): this;
  setFromPoints( points: Vector3[] ): this;
  setFromCenterAndSize( center: Vector3, size: Vector3 ): this;
  setFromObject( object: Object3D ): this;
  clone(): this;
  copy( box: Box3 ): this;
  makeEmpty(): this;
  isEmpty(): boolean;
  getCenter( target: Vector3 ): Vector3;
  getSize( target: Vector3 ): Vector3;
  expandByPoint( point: Vector3 ): this;
  expandByVector( vector: Vector3 ): this;
  expandByScalar( scalar: number ): this;
  expandByObject( object: Object3D ): this;
  containsPoint( point: Vector3 ): boolean;
  containsBox( box: Box3 ): boolean;
  getParameter( point: Vector3 ): Vector3;
  intersectsBox( box: Box3 ): boolean;
  intersectsSphere( sphere: Sphere ): boolean;
  intersectsPlane( plane: Plane ): boolean;
  clampPoint( point: Vector3, target: Vector3 ): Vector3;
  distanceToPoint( point: Vector3 ): number;
  getBoundingSphere( target: Sphere ): Sphere;
  intersect( box: Box3 ): this;
  union( box: Box3 ): this;
  applyMatrix4( matrix: Matrix4 ): this;
  translate( offset: Vector3 ): this;
  equals( box: Box3 ): boolean;
  /**
   * @deprecated Use {@link Box3#isEmpty .isEmpty()} instead.
   */
  empty(): any;
  /**
   * @deprecated Use {@link Box3#intersectsBox .intersectsBox()} instead.
   */
  isIntersectionBox( b: any ): any;
  /**
   * @deprecated Use {@link Box3#intersectsSphere .intersectsSphere()} instead.
   */
  isIntersectionSphere( s: any ): any;

}
