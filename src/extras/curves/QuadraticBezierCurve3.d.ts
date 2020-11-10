import { Vector3 } from './../../math/Vector3';
import { Curve } from './../core/Curve';

export class QuadraticBezierCurve3 extends Curve<Vector3> {

	constructor( v0: Vector3, v1: Vector3, v2: Vector3 );

	/**
	 * @default 'QuadraticBezierCurve3'
	 */
	type: string;

	/**
	 * @default new THREE.Vector3()
	 */
	v0: Vector3;

	/**
	 * @default new THREE.Vector3()
	 */
	v1: Vector3;

	/**
	 * @default new THREE.Vector3()
	 */
	v2: Vector3;

}
