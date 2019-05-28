import { Vector3 } from './../../math/Vector3';
import { Curve } from './../core/Curve';

export class LineCurve3 extends Curve<Vector3> {

	constructor( v1: Vector3, v2: Vector3 );

  v1: Vector3;
  v2: Vector3;

  getPoint( t: number ): Vector3;

}
