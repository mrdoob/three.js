import { Vector3 } from './Vector3';

export class Spherical {

	constructor( radius?: number, phi?: number, theta?: number );

	radius: number;
	phi: number;
	theta: number;

	set( radius: number, phi: number, theta: number ): this;
	clone(): this;
	copy( other: Spherical ): this;
	makeSafe(): void;
	setFromVector3( v: Vector3 ): this;
	setFromCartesianCoords( x: number, y: number, z: number ): this;

}
