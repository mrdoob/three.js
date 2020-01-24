export class SimplexNoise {

	constructor( r?: object );
	dot( g: number[], x: number, y: number ): number;
	dot3( g: number[], x: number, y: number, z: number ): number;
	dot4( g: number[], x: number, y: number, z: number, w: number ): number;
	noise( xin: number, yin: number ): number;
	noise3d( xin: number, yin: number, zin: number ): number;
	noise4d( x: number, y: number, z: number, w: number ): number;

}
