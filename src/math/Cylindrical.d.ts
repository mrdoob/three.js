import { Vector3 } from './Vector3';

export class Cylindrical {

	constructor( radius?: number, theta?: number, y?: number );

	radius: number;
	theta: number;
	y: number;

	clone(): this;
	copy( other: Cylindrical ): this;
	set( radius: number, theta: number, y: number ): this;
	setFromVector3( vec3: Vector3 ): this;
	setFromCartesianCoords( x: number, y: number, z: number ): this;

}
