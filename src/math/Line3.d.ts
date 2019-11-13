import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';

export class Line3 {

	constructor( start?: Vector3, end?: Vector3 );

	start: Vector3;
	end: Vector3;

	set( start?: Vector3, end?: Vector3 ): Line3;
	clone(): this;
	copy( line: Line3 ): this;
	getCenter( target: Vector3 ): Vector3;
	delta( target: Vector3 ): Vector3;
	distanceSq(): number;
	distance(): number;
	at( t: number, target: Vector3 ): Vector3;
	closestPointToPointParameter( point: Vector3, clampToLine?: boolean ): number;
	closestPointToPoint(
		point: Vector3,
		clampToLine: boolean,
		target: Vector3
	): Vector3;
	applyMatrix4( matrix: Matrix4 ): Line3;
	equals( line: Line3 ): boolean;

}
